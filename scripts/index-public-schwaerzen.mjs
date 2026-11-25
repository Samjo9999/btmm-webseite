/**
 * Schwaerz-Regeln fuer den oeffentlichen Wissens-Index (index-public.json), gebaut aus
 * content/dokumente-web. Die Quelldokumente bleiben unveraendert; ausgelassen wird nur im Index.
 *
 * Regeln (Sicherheitsnetz, Reihenfolge egal, alle gelten):
 *  - tabu:        Tabuwoerter der Nutzerliste (case-insensitive, Umlaute gefaltet, auch als Teilwort)
 *  - altwortlaut: v7.x, Anwaerter, Vollmitglied, fuenf Jahre, BWGV, i.Gr.
 *  - email, phone, iban, street: personenbezogene Kontaktdaten
 *  - impressum:   Impressum-Inhalte (Angaben nach DDG/TMG, USt-IdNr., Verantwortlicher)
 *  - intern:      interne Pfad-Marker (INTERN_, _intern, ROTH-, BUSINESSPLAN)
 *  - grundsicherung-kombi: ganzer Chunk, wenn „Grundsicherung“ zusammen mit
 *    „fünf Menschen“, „alle mit“ oder einem Euro-Betrag vorkommt (AUSSCHLUSSLISTE.md).
 *  Jobcenter und Grundsicherung allein bleiben im Index.
 *
 * Verfahren: Treffer in Titel oder Abschnittsueberschrift -> ganzer Chunk faellt.
 * Treffer im Text -> Tabellenzeile faellt, sonst nur der Satz (bei Listen/Absaetzen).
 * Bleibt weniger als 20 Zeichen uebrig, faellt der Chunk.
 */
import {
  TABOO_STEMS,
  INDEX_TABU_STEMS,
  FORBIDDEN_PATH_RE,
  foldDe,
  findEmailMatches,
  findPhoneMatches,
  findIbanMatches,
  findStreetMatches,
  istGrundsicherungKombi,
} from './index-public-guard.mjs'

/**
 * Index-Tabu (public-Index). Unabhängig vom Tür-KI-Eingabefilter in
 * lib/tuerKi/sensibel-liste.ts — nicht importieren, nicht zusammenführen.
 * Ohne Jobcenter (bleibt im Index). Grundsicherung allein bleibt;
 * die Kombi-Regel läuft über istGrundsicherungKombi / chunkArten.
 */
export const TABU_LISTE = INDEX_TABU_STEMS

const ALTWORTLAUT = [
  ['v7.', /\bv\s?7\.\d/],
  ['anwaerter', /anwaerter/],
  ['vollmitglied', /vollmitglied/],
  ['fuenf jahre', /fuenf\s+jahr/],
  ['bwgv', /bwgv/],
  ['i.gr.', /\bi\.\s?gr\b/],
]

const IMPRESSUM = [
  /angaben\s+(gem(ä|ae)ß|nach)\s+(§\s?5|ddg|tmg)/i,
  /§\s?5\s?(ddg|tmg)\b/i,
  /umsatzsteuer-?\s?(identifikations)?nummer/i,
  /verantwortlich\w*\s+(f(ü|ue)r\s+den\s+inhalt|nach\s+§)/i,
]

/** Alle Treffer eines Textes als Liste von Arten (ohne den Treffer selbst zu zitieren). */
export function trefferArten(text) {
  const raw = String(text || '')
  if (!raw) return []
  const folded = foldDe(raw)
  const arten = new Set()
  for (const w of TABU_LISTE) {
    if (folded.includes(foldDe(w))) arten.add('tabu')
  }
  for (const [name, rx] of ALTWORTLAUT) if (rx.test(folded)) arten.add(`altwortlaut:${name}`)
  if (findEmailMatches(raw).length) arten.add('email')
  if (findPhoneMatches(raw).length) arten.add('phone')
  if (findIbanMatches(raw).length) arten.add('iban')
  if (findStreetMatches(raw).length) arten.add('street')
  if (IMPRESSUM.some((rx) => rx.test(raw))) arten.add('impressum')
  if (FORBIDDEN_PATH_RE.test(raw)) arten.add('intern')
  return [...arten]
}

const KURZFORMEN = 'z|B|d|h|ca|Nr|Abs|vgl|bzw|u|a|etc|Mio|Mrd|ggf|inkl|S|Art|Kap|Dr|v|i|Gr|e|V|ff|f|bspw|usw|evtl|max|min'
const SATZENDE = new RegExp(`(?<!\\b(?:${KURZFORMEN})\\.)(?<=[.!?])\\s+(?=[A-ZÄÖÜ„"(\\[*])`)

function schwaerzeZeile(zeile, bericht) {
  if (!trefferArten(zeile).length) return zeile
  const arten = trefferArten(zeile)
  if (zeile.trim().startsWith('|')) {
    bericht.push({ aktion: 'zeile', arten })
    return null
  }
  const m = /^(\s*(?:[-*]\s+|\d+\.\s+|>\s*)?)(.*)$/s.exec(zeile)
  const praefix = m[1]
  const saetze = m[2].split(SATZENDE)
  const behalten = []
  for (const s of saetze) {
    const a = trefferArten(s)
    if (a.length) bericht.push({ aktion: 'satz', arten: a })
    else behalten.push(s)
  }
  if (!behalten.length) return null
  return praefix + behalten.join(' ')
}

/**
 * @param {string} text
 * @returns {{ text: string, bericht: {aktion: string, arten: string[]}[] }}
 */
export function schwaerzeText(text) {
  const bericht = []
  const zeilen = String(text || '').split('\n')
  const aus = []
  for (const z of zeilen) {
    const r = schwaerzeZeile(z, bericht)
    if (r !== null) aus.push(r)
  }
  return { text: aus.join('\n').replace(/\n{3,}/g, '\n\n').trim(), bericht }
}

/** Letzter Blick auf den fertigen Chunk (Titel, Abschnitt, Text, Pfad zusammen wie im Guard). */
export function chunkArten(c) {
  const blob = [c.title, c.abschnitt, c.text, c.rel].filter(Boolean).join('\n')
  const arten = trefferArten(blob)
  if (istGrundsicherungKombi(blob)) arten.push('grundsicherung-kombi')
  return arten
}
