// BtMM-Dokumente auf der Webseite (/dokumente, /dokumente/[slug]).
// Quelle: content/dokumente-web/*.md, Text 1:1 aus der Webfassung.
// Neue Fassung eines Dokuments: nur die MD-Datei ersetzen (Dateiname behalten), kein Code nötig.
// Titel, Version und Stand kommen aus der Datei selbst (H1 + Zeile "**Dokument NN · Version X · Stand D**").
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { entferneEmojis } from '../packages/wissen-mcp/src/emoji-filter.mjs'

export const DOKUMENTE_DIR = join(process.cwd(), 'content', 'dokumente-web')
export const SITE = 'https://b-t-m-m.com'

// Interne Dateien (Änderungsprotokoll, Arbeitsordner) gehören nie ins Repo und nie online.
const INTERN = /^(aenderungen|änderungen|intern|work|readme)/i

// Gruppen der Übersicht, nach Dokumentnummer. Unbekannte Nummern landen in "weitere".
export const GRUPPEN = [
  { id: 'einstieg', titel: 'Einstieg', text: 'Wer BtMM ist und wie du reinkommst.', ids: ['00', '01', '02', '06', '28', '29'] },
  { id: 'konzept', titel: 'Konzept und Gründung', text: 'Das Gesamtkonzept, der Weg zur Gründung, das Geschäftsmodell.', ids: ['07', '03', '17', '15', '25'] },
  { id: 'satzung', titel: 'Satzung und Ordnungen', text: 'Entwürfe, noch nicht beschlossen.', ids: ['08', '08a', '31'] },
  { id: 'wirtschaft', titel: 'Wirtschaft und Finanzen', text: 'Wie in BtMM gewirtschaftet wird.', ids: ['04', '16', '19', '21', '26', '27'] },
  { id: 'gemeinschaft', titel: 'Gemeinschaft und Vorsorge', text: 'Zusammenleben, Mitbestimmung, Absicherung.', ids: ['05', '18', '22', '23', '24'] },
  { id: 'handwerk', titel: 'Handwerk und Berufe', text: 'Handwerk, Zulassungen, Berufe und Gewerbe.', ids: ['11', '12', '20', '30'] },
  { id: 'ausblick', titel: 'Ideen und Ausblick', text: 'Was noch kommen kann.', ids: ['13'] },
]
const WEITERE = { id: 'weitere', titel: 'Weitere Dokumente', text: '', ids: [] }

/** Dokumentnummer aus dem Dateinamen, z. B. "08a-ordnungen" -> "08a". */
export function idAusSlug(slug) {
  const m = /^(\d{2}[a-z]?)-/.exec(slug)
  return m ? m[1] : null
}

/** Kopf einer Datei: Titel, Version, Stand. Gibt null-Felder zurück, wenn etwas fehlt (Test schlägt dann an). */
export function parseKopf(md) {
  const titel = /^#\s+(.+)$/m.exec(md)?.[1]?.trim() ?? null
  const k = /\*\*Dokument\s+(\S+)\s+·\s+Version\s+(\S+)\s+·\s+Stand\s+([^*]+?)\*\*/.exec(md)
  return { titel, nummer: k?.[1] ?? null, version: k?.[2] ?? null, stand: k?.[3]?.trim() ?? null }
}

export function slugs() {
  return readdirSync(DOKUMENTE_DIR)
    .filter((f) => f.endsWith('.md') && !INTERN.test(f))
    .map((f) => f.slice(0, -3))
    .sort()
}

export function lesen(slug) {
  if (!slugs().includes(slug)) return null
  // Nutzerregel 25.11.: keine Emojis auf der Webseite. Die Datei bleibt 1:1, ersetzt wird erst bei der Ausgabe
  // (gleicher Filter wie im Wissens-Index). Ohne Emojis in der Datei ändert sich nichts.
  const md = entferneEmojis(readFileSync(join(DOKUMENTE_DIR, `${slug}.md`), 'utf8'))
  return { slug, md, ...parseKopf(md) }
}

export function alle() {
  return slugs().map((s) => lesen(s))
}

export function gruppiert(docs = alle()) {
  const out = []
  for (const g of [...GRUPPEN, WEITERE]) {
    const liste = g.ids
      .map((id) => docs.find((d) => idAusSlug(d.slug) === id))
      .filter(Boolean)
    if (g === WEITERE) liste.push(...docs.filter((d) => !GRUPPEN.some((x) => x.ids.includes(idAusSlug(d.slug)))))
    if (liste.length) out.push({ ...g, docs: liste })
  }
  return out
}

export function beschreibung(d) {
  return `${d.titel}: Dokument ${d.nummer}, Version ${d.version}, Stand ${d.stand}. Entwurf von Back to Meaning Maximization, BtMM ist noch nicht gegründet.`
}

export function pfad(slug, locale = 'de') {
  return `/${locale}/dokumente/${slug}`
}

export function downloadName(d) {
  return `${d.slug}_v${d.version}.md`
}

// Alte Dokumentseiten und PDFs (Stand vor 25.11.2026) -> neue Seite.
export const ALT_NACH_NEU = {
  einfuehrung: '01-einfuehrung',
  wirtschaften: '04-wirtschaften-anleitung',
  'ideen-horizont': '13-ideen-horizonte',
  gemeinschaftskultur: '05-gemeinschaftskultur',
  handwerk: '11-handwerk-ergaenzung',
}
