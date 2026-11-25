/**
 * Eingabe- und Ausgabefilter der Tür-KI.
 * Eingabe: sensible Angaben in IRGENDEINER Nutzernachricht des Verlaufs -> kein Modellaufruf.
 * Ausgabe: Emojis, Links, Tabu-Wörter, Benennungsfehler, Direktkredit-Konditionen, Prompt-Echo.
 */
import { entferneEmojis } from '../../packages/wissen-mcp/src/emoji-filter.mjs'
import { SENSIBEL_MUSTER, SENSIBEL_STAEMME, SENSIBEL_WOERTER, TABU_AUSGABE } from './sensibel-liste.ts'
import { SCHRITTE_KEYS, TUER_KI } from './konfig.ts'

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

/** Indizes aller Nutzernachrichten mit sensiblen Angaben (ganzer Verlauf, nicht nur die letzte). */
export function sensibleNutzerNachrichten(verlauf: { rolle: string; text: string }[]): number[] {
  const treffer: number[] = []
  verlauf.forEach((n, i) => {
    if (n.rolle === 'user' && enthaeltSensibles(n.text)) treffer.push(i)
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
  | { art: 'ok'; text: string; schritte: string[] }
  | { art: 'ersetzt'; grund: 'tabu' | 'benennung' | 'direktkredit' | 'echo' | 'leer' }

const LINK = /\[([^\]]*)\]\((?:[^)]*)\)|\bhttps?:\/\/\S+|\bwww\.\S+/gi
const SCHRITTE_ZEILE = /^\s*SCHRITTE\s*:\s*(.*)$/gim

export function leseSchritte(text: string): { text: string; schritte: string[] } {
  const gefunden: string[] = []
  const ohne = text.replace(SCHRITTE_ZEILE, (_z, liste: string) => {
    for (const k of String(liste).split(/[\s,;]+/)) {
      const key = k.trim().toLowerCase()
      if ((SCHRITTE_KEYS as readonly string[]).includes(key) && !gefunden.includes(key)) gefunden.push(key)
    }
    return ''
  })
  return { text: ohne.trim(), schritte: gefunden.slice(0, 6) }
}

/**
 * Bereinigt eine Modellantwort. `echoSaetze` sind markante Sätze des Systemprompts;
 * taucht einer in der Antwort auf, wird sie ersetzt (kein Offenlegen des Prompts).
 */
export function bereinigeAntwort(roh: string, echoSaetze: readonly string[] = []): AusgabeErgebnis {
  const { text: ohneSchritte, schritte } = leseSchritte(String(roh || ''))
  let t = entferneEmojis(ohneSchritte)
    .replace(LINK, (_m, label) => (typeof label === 'string' ? label : ''))
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
  return { art: 'ok', text: t, schritte }
}
