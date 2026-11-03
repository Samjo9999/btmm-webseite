// Dokumenten-Pipeline: reine Logik (ohne Netzwerk), damit sie testbar ist.
//
// REGELN
// 1. Dateiname: <Projekt>_<slug>_v<Version>_<JJJJ-MM-TT>.md, z. B. BtMM_satzung_v7.27_2026-11-02.md
//    - Version: 2 oder 3 Zahlen (7.27 / 7.27.0), jede Zahl beliebig viele Stellen.
//    - Das Projekt-Präfix (Standard "BtMM", Env DOCS_PROJECT_PREFIX) wird abgeschnitten.
//    - Dateien, die nicht passen, werden ignoriert (mit Warnung).
// 2. Pro Slug gilt nur die höchste Version (numerischer Vergleich, 7.10 > 7.9).
//    Bei gleicher Version gewinnt das spätere Datum.
// 3. Titel = erste "# "-Überschrift, sonst der Slug.
// 4. Freigabe über Frontmatter "oeffentlich":
//    - Standard (DOCS_REQUIRE_PUBLIC_FLAG nicht gesetzt oder "true"): NUR Dateien mit
//      "oeffentlich: true" (SPANNUNGEN 89).
//    - DOCS_REQUIRE_PUBLIC_FLAG=false: alles wird veröffentlicht, AUSSER "oeffentlich: false".
//    Die Freigabe wird an der jeweils höchsten Version geprüft; ist die gesperrt,
//    erscheint das Dokument gar nicht (keine Rückfall-Version).
// 5. Frontmatter "aenderung" wird als Änderungsvermerk angezeigt.
// 6. Aufräumen: Alles im Zielordner, was nicht zum aktuellen Satz gehört, wird gelöscht.
// 7. Ordner werden rekursiv gelesen. Der nächstliegende Themen-Unterordner ist die Kategorie:
//    "01-aussenkontakt" -> { ordnung: 1, label: "Aussenkontakt", schluessel: "01-aussenkontakt" }.
//    Strukturordner ("MDs", "pdf") zählen nicht als Kategorie.
// 8. Gleicher Slug in verschiedenen Kategorien = verschiedene Dokumente; der Slug wird dann
//    zu "<kategorie>--<slug>" (mit Warnung). Innerhalb einer Kategorie gilt Regel 2.
// 9. PDFs liegen unter einem Ordner "pdf" (rekursiv), Schema wie oben mit .pdf. Pro Dokument
//    gilt die neueste PDF (Regel 2). Zuordnung: gleicher Slug + gleiche Kategorie, sonst
//    gleicher Slug, wenn eindeutig. Gesperrtes MD (oeffentlich: false) => PDF auch gesperrt.
//    PDF ohne MD: nur wenn DOCS_REQUIRE_PUBLIC_FLAG=false, sonst übersprungen.
import matter from 'gray-matter'

export const DEFAULT_PREFIX = 'BtMM'

export function parseFilename(name, prefix = DEFAULT_PREFIX, ext = 'md') {
  const esc = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`^${esc}_(.+)_v(\\d+\\.\\d+(?:\\.\\d+)?)_(\\d{4}-\\d{2}-\\d{2})\\.${ext}$`, 'i')
  const m = name.match(re)
  if (!m) return null
  const slug = m[1].toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
  if (!slug) return null
  return { slug, version: m[2], datum: m[3], name }
}

export function compareVersions(a, b) {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (d) return d
  }
  return 0
}

export const STRUKTUR_ORDNER = new Set(['mds', 'md', 'pdf', 'pdfs'])

export function slugify(x) {
  return String(x).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
}

// Kategorie aus dem Ordnerpfad (Array von Ordnernamen relativ zum Wurzelordner).
export function categoryFromPath(path = []) {
  const name = [...path].reverse().find((n) => !STRUKTUR_ORDNER.has(n.toLowerCase()))
  if (!name) return null
  const m = name.match(/^(\d+)[\s._-]*(.*)$/)
  const rest = (m ? m[2] : name).replace(/[-_]+/g, ' ').trim() || name
  return {
    schluessel: slugify(name),
    ordnung: m ? Number(m[1]) : null,
    label: rest.charAt(0).toUpperCase() + rest.slice(1),
  }
}

export function isPdfPath(path = []) {
  return path.some((n) => n.toLowerCase() === 'pdf' || n.toLowerCase() === 'pdfs')
}

const newer = (p, cur) => !cur || compareVersions(p.version, cur.version) > 0 ||
  (compareVersions(p.version, cur.version) === 0 && p.datum > cur.datum)

// Neueste Version je (Kategorie, Slug). Ergebnis-Slugs sind eindeutig (Regel 8).
export function pickLatest(files, prefix = DEFAULT_PREFIX, ext = 'md', log = () => {}) {
  const best = new Map(), ignored = []
  for (const f of files) {
    const p = parseFilename(f.name, prefix, ext)
    if (!p) { ignored.push(f.name); continue }
    const kategorie = categoryFromPath(f.path)
    const key = `${kategorie?.schluessel ?? ''}/${p.slug}`
    const cand = { ...p, basisSlug: p.slug, id: f.id, size: f.size != null ? Number(f.size) : null, kategorie, pfad: [...(f.path ?? []), f.name].join('/') }
    if (newer(p, best.get(key))) best.set(key, cand)
  }
  const list = [...best.values()]
  const count = new Map()
  for (const l of list) count.set(l.basisSlug, (count.get(l.basisSlug) ?? 0) + 1)
  for (const l of list) {
    if (count.get(l.basisSlug) > 1 && l.kategorie) {
      l.slug = `${l.kategorie.schluessel}--${l.basisSlug}`
      log(`Doppelter Slug "${l.basisSlug}" in mehreren Kategorien: ${l.pfad} -> ${l.slug}`)
    }
  }
  return { latest: sortDocs(list), ignored }
}

export function sortDocs(list) {
  const o = (d) => d.kategorie?.ordnung ?? (d.kategorie ? 9998 : 9999)
  return list.sort((a, b) => o(a) - o(b) ||
    (a.kategorie?.schluessel ?? '').localeCompare(b.kategorie?.schluessel ?? '') || a.slug.localeCompare(b.slug))
}

// PDF zu einem MD finden (Regel 9). pdfs = Ergebnis von pickLatest(..., 'pdf').
export function matchPdf(doc, pdfs) {
  const k = doc.kategorie?.schluessel ?? ''
  const exact = pdfs.find((p) => p.basisSlug === doc.basisSlug && (p.kategorie?.schluessel ?? '') === k)
  if (exact) return exact
  const same = pdfs.filter((p) => p.basisSlug === doc.basisSlug)
  return same.length === 1 ? same[0] : null
}

export function parseDoc(raw, slug) {
  const { data, content } = matter(raw)
  const h = content.match(/^#\s+(.+?)\s*#*\s*$/m)
  return {
    titel: h ? h[1].trim() : slug,
    oeffentlich: data.oeffentlich,
    aenderung: data.aenderung != null ? String(data.aenderung) : null,
    body: content.replace(/^%%.*(?:\r?\n|$)/gm, '').replace(/^\s+/, ''),
  }
}

export function isPublic(oeffentlich, requireFlag) {
  const v = oeffentlich === true || oeffentlich === 'true' ? true
    : oeffentlich === false || oeffentlich === 'false' ? false : undefined
  return requireFlag ? v === true : v !== false
}
