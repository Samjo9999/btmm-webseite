/**
 * Eingabe- und Ausgabefilter der Tür-KI.
 * Eingabe: sensible Angaben in IRGENDEINER Verlaufsnachricht (user und assistant) -> kein Modellaufruf.
 * Ausgabe: Emojis, fremde Links, Tabu-Wörter, Benennungsfehler, Direktkredit-Konditionen, Prompt-Echo.
 * Interne Pfade bleiben als Markdown-Links [Titel](/pfad) stehen.
 */
import { entferneEmojis } from '../../packages/wissen-mcp/src/emoji-filter.mjs'
import { SENSIBEL_MUSTER, SENSIBEL_STAEMME, SENSIBEL_WOERTER, TABU_AUSGABE } from './sensibel-liste.ts'
import { SCHRITTE_KEYS, TUER_KI } from './konfig.ts'
import { erlaubterPfad, ersteWeiterleitung, normalisiereAntwortLinks, parseAntwortMitLinks } from './links.ts'

export { erlaubterPfad }

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

const SCHRITT_ALT = [...SCHRITTE_KEYS].sort((a, b) => b.length - a.length).join('|')
/** „SCHRITTE:“ (auch mitten in der Zeile) plus direkt folgende bekannte Schlüssel; der restliche Satz bleibt stehen. */
const SCHRITTE_MARK = new RegExp(`\\bSCHRITTE\\s*:[ \\t]*((?:(?:${SCHRITT_ALT})(?![A-Za-z_])[ \\t]*[,;]?[ \\t]*)*)`, 'gi')

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

export function findePfade(text: string): string[] {
  const gefunden: string[] = []
  for (const t of parseAntwortMitLinks(text)) {
    if (t.typ === 'link' && !gefunden.includes(t.pfad)) gefunden.push(t.pfad)
  }
  return gefunden
}

export function hatRueckfrage(text: string): boolean {
  return /[?？؟]/.test(String(text || ''))
}

/**
 * Ein erlaubter Pfad im Text wird zusätzlich als `weiterleitung` gemeldet; der Client zeigt dafür einen Link-Knopf.
 * Der Satz bleibt stehen (Links fest als Markdown [Titel](/pfad)).
 */
export function legeEndeFest(text: string): { text: string; weiterleitung?: string } {
  const weiterleitung = ersteWeiterleitung(text)
  return weiterleitung ? { text, weiterleitung } : { text }
}

/**
 * Bereinigt eine Modellantwort. `echoSaetze` sind markante Sätze des Systemprompts;
 * taucht einer in der Antwort auf, wird sie ersetzt (kein Offenlegen des Prompts).
 */
export function bereinigeAntwort(roh: string, echoSaetze: readonly string[] = []): AusgabeErgebnis {
  const { text: ohneSchritte, schritte } = leseSchritte(String(roh || ''))
  let t = normalisiereAntwortLinks(entferneEmojis(ohneSchritte))
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
