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
//    - Standard (DOCS_REQUIRE_PUBLIC_FLAG nicht "true"): alles wird veröffentlicht,
//      AUSSER Dateien mit "oeffentlich: false".
//    - DOCS_REQUIRE_PUBLIC_FLAG=true: NUR Dateien mit "oeffentlich: true".
//    Die Freigabe wird an der jeweils höchsten Version geprüft; ist die gesperrt,
//    erscheint das Dokument gar nicht (keine Rückfall-Version).
// 5. Frontmatter "aenderung" wird als Änderungsvermerk angezeigt.
// 6. Aufräumen: Alles im Zielordner, was nicht zum aktuellen Satz gehört, wird gelöscht.
import matter from 'gray-matter'

export const DEFAULT_PREFIX = 'BtMM'

export function parseFilename(name, prefix = DEFAULT_PREFIX) {
  const esc = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`^${esc}_(.+)_v(\\d+\\.\\d+(?:\\.\\d+)?)_(\\d{4}-\\d{2}-\\d{2})\\.md$`)
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

export function pickLatest(files, prefix = DEFAULT_PREFIX) {
  const best = new Map(), ignored = []
  for (const f of files) {
    const p = parseFilename(f.name, prefix)
    if (!p) { ignored.push(f.name); continue }
    const cur = best.get(p.slug)
    if (!cur || compareVersions(p.version, cur.version) > 0 ||
        (compareVersions(p.version, cur.version) === 0 && p.datum > cur.datum)) {
      best.set(p.slug, { ...p, id: f.id })
    }
  }
  return { latest: [...best.values()].sort((a, b) => a.slug.localeCompare(b.slug)), ignored }
}

export function parseDoc(raw, slug) {
  const { data, content } = matter(raw)
  const h = content.match(/^#\s+(.+?)\s*#*\s*$/m)
  return {
    titel: h ? h[1].trim() : slug,
    oeffentlich: data.oeffentlich,
    aenderung: data.aenderung != null ? String(data.aenderung) : null,
    body: content.replace(/^\s+/, ''),
  }
}

export function isPublic(oeffentlich, requireFlag) {
  const v = oeffentlich === true || oeffentlich === 'true' ? true
    : oeffentlich === false || oeffentlich === 'false' ? false : undefined
  return requireFlag ? v === true : v !== false
}
