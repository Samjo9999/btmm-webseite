/**
 * Eingabe- und Ausgabefilter der Tür-KI.
 * Eingabe: sensible Angaben in IRGENDEINER Verlaufsnachricht (user und assistant) -> kein Modellaufruf.
 * Ausgabe: Emojis, fremde Links, Tabu-Wörter, Benennungsfehler, Direktkredit-Konditionen, Prompt-Echo.
 * Interne Pfade aus TUER_KI_SEITEN bleiben stehen.
 */
import { entferneEmojis } from '../../packages/wissen-mcp/src/emoji-filter.mjs'
import { SENSIBEL_MUSTER, SENSIBEL_STAEMME, SENSIBEL_WOERTER, TABU_AUSGABE } from './sensibel-liste.ts'
import { SCHRITTE_KEYS, TUER_KI, TUER_KI_SEITEN, TUER_SPRACHEN } from './konfig.ts'

export function normalisiere(text: string): string {
  return String(text || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function enthaeltSensibles(text: string): boolean {
  const roh = String(text || '')
  if (SENSIBEL_MUSTER.some((m) => m.test(roh))) return true
  const n = normalisiere(roh)
  if (SENSIBEL_STAEMME.some((s) => n.includes(s))) return true
  return SENSIBEL_WOERTER.some((w) => w.test(n))
}

/** Indizes aller Verlaufsnachrichten mit sensiblen Angaben (user und assistant, ganzer Verlauf). */
export function sensibleNutzerNachrichten(verlauf: { rolle: string; text: string }[]): number[] {
  const treffer: number[] = []
  verlauf.forEach((n, i) => {
    if (enthaeltSensibles(n.text)) treffer.push(i)
  })
  return treffer
}

/** Nie-Liste (Recht-Bot): Rechtsform-Kürzel, Registerstatus, staatliche Anerkennung. */
const NIE_BENENNUNG: readonly RegExp[] = [
  /\beG\b/,
  /\be\.\s?G\./,
  /eingetragen/i,
  /staatlich anerkannt/i,
  /Genossenschaft Freiburg/i,
]

/** Direktkredit / Nachrangdarlehen zusammen mit Konditionen = Werbung (VermAnlG) -> feste Antwort. */
const DIREKTKREDIT = /direktkredit|nachrang|darlehen|direct loan|subordinated loan/i
const KONDITION = /zins|prozent|%|laufzeit|rendite|betrag|\d+\s?(€|euro|eur\b)|€\s?\d|interest|per cent|percent|term of|maturity/i

export function istDirektkreditWerbung(text: string): boolean {
  return DIREKTKREDIT.test(text) && KONDITION.test(text)
}

export type AusgabeErgebnis =
  | { art: 'ok'; text: string; schritte: string[]; weiterleitung?: string }
  | { art: 'ersetzt'; grund: 'tabu' | 'benennung' | 'direktkredit' | 'echo' | 'leer' }

const LINK = /\[([^\]]*)\]\((?:[^)]*)\)|\bhttps?:\/\/\S+|\bwww\.\S+/gi
const SCHRITT_ALT = [...SCHRITTE_KEYS].sort((a, b) => b.length - a.length).join('|')
/** „SCHRITTE:“ (auch mitten in der Zeile) plus direkt folgende bekannte Schlüssel; der restliche Satz bleibt stehen. */
const SCHRITTE_MARK = new RegExp(`\\bSCHRITTE\\s*:[ \\t]*((?:(?:${SCHRITT_ALT})(?![A-Za-z_])[ \\t]*[,;]?[ \\t]*)*)`, 'gi')
const SEITEN_SET = new Set<string>(TUER_KI_SEITEN)
const LOCALE_PFAD = new RegExp(`^/(${TUER_SPRACHEN.join('|')})(?=/|$)`)

/** Liefert den erlaubten internen Pfad (ohne Locale) oder null. */
export function erlaubterPfad(raw: string): string | null {
  let s = String(raw || '').trim().replace(/[),.;!?]+$/g, '')
  s = s.replace(/^https?:\/\/(www\.)?b-t-m-m\.com/i, '')
  if (!s.startsWith('/')) return null
  s = s.split(/[?#]/)[0]
  const loc = s.match(LOCALE_PFAD)
  if (loc) s = s.slice(loc[0].length) || '/'
  if (SEITEN_SET.has(s)) return s
  return null
}

function ersetzeLinks(text: string): string {
  const LUECKE = '\u0000'
  let t = text.replace(LINK, (m, label) => {
    const url = m.startsWith('[') ? (m.match(/\]\(([^)]*)\)/) || [])[1] || '' : m
    const pfad = erlaubterPfad(url)
    if (pfad) return pfad
    if (typeof label === 'string' && label.trim()) return label
    return LUECKE
  })
  t = t.replace(/[ \t]*\u0000[ \t]*/g, ' ')
  // Satzlücke nach entfernter URL: „auf … vorbei“ ohne Ziel wird zu „vorbei“.
  t = t.replace(/\b(auf|unter|ueber|über|zu|bei|in|an)\s+vorbei\b/gi, 'vorbei')
  return t
}

export function leseSchritte(text: string): { text: string; schritte: string[] } {
  const gefunden: string[] = []
  const ohne = text.replace(SCHRITTE_MARK, (_z, liste: string) => {
    for (const k of String(liste).split(/[\s,;]+/)) {
      const key = k.trim().toLowerCase()
      if ((SCHRITTE_KEYS as readonly string[]).includes(key) && !gefunden.includes(key)) gefunden.push(key)
    }
    return ' '
  })
  return { text: ohne.replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+\n/g, '\n').trim(), schritte: gefunden.slice(0, 6) }
}

const PFAD_IM_TEXT = new RegExp(
  '(' + [...TUER_KI_SEITEN].sort((a, b) => b.length - a.length).map((s) => s.replace(/\//g, '\\/')).join('|') + ')(?![A-Za-z0-9/_-])',
  'g',
)

export function findePfade(text: string): string[] {
  const gefunden: string[] = []
  const re = new RegExp(PFAD_IM_TEXT.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(String(text || '')))) {
    if (!gefunden.includes(m[1])) gefunden.push(m[1])
  }
  return gefunden
}

export function hatRueckfrage(text: string): boolean {
  return /[?？؟]/.test(String(text || ''))
}

/**
 * Genau ein Ende: Der Text bleibt unverändert (Rückfrage oder Hinweis auf die Seite, wie das Modell ihn schrieb).
 * Ein erlaubter Pfad im Text wird zusätzlich als `weiterleitung` gemeldet; der Client zeigt dafür einen Link-Knopf.
 * Es wird nichts aus dem Satz entfernt, damit keine Satzlücken entstehen.
 */
export function legeEndeFest(text: string): { text: string; weiterleitung?: string } {
  const weiterleitung = findePfade(text)[0]
  return weiterleitung ? { text, weiterleitung } : { text }
}

/**
 * Bereinigt eine Modellantwort. `echoSaetze` sind markante Sätze des Systemprompts;
 * taucht einer in der Antwort auf, wird sie ersetzt (kein Offenlegen des Prompts).
 */
export function bereinigeAntwort(roh: string, echoSaetze: readonly string[] = []): AusgabeErgebnis {
  const { text: ohneSchritte, schritte } = leseSchritte(String(roh || ''))
  let t = ersetzeLinks(entferneEmojis(ohneSchritte))
    .replace(/[*_#`>]+/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  if (!t) return { art: 'ersetzt', grund: 'leer' }
  if (TABU_AUSGABE.some((r) => r.test(t))) return { art: 'ersetzt', grund: 'tabu' }
  if (NIE_BENENNUNG.some((r) => r.test(t))) return { art: 'ersetzt', grund: 'benennung' }
  if (istDirektkreditWerbung(t)) return { art: 'ersetzt', grund: 'direktkredit' }
  const tn = normalisiere(t)
  if (echoSaetze.some((s) => s.length > 30 && tn.includes(normalisiere(s)))) return { art: 'ersetzt', grund: 'echo' }
  if (t.length > TUER_KI.maxAntwortZeichen) t = t.slice(0, TUER_KI.maxAntwortZeichen).replace(/\s+\S*$/, '') + ' …'
  const ende = legeEndeFest(t)
  return { art: 'ok', text: ende.text, schritte, weiterleitung: ende.weiterleitung }
}
