/**
 * In-Memory-Zähler für den Mitmacher-Wissens-Assistenten.
 * Speichert ausschließlich User-ID und Zeitstempel, nie die Frage.
 * Zeitstempel älter als eine Stunde fliegen beim nächsten Zugriff raus;
 * restliche Einträge werden spätestens nach 24 h entfernt.
 *
 * Serverless-Grenze: der Speicher gilt nur innerhalb einer Laufzeit-Instanz.
 * Ein Cold-Start oder eine andere Instanz setzt den Zähler zurück.
 */

export const FRAGEN_PRO_STUNDE = 20
export const FENSTER_MS = 60 * 60 * 1000
export const MAX_HALTEZEIT_MS = 24 * 60 * 60 * 1000

export const LIMIT_TEXT =
  'Du hast das Limit von 20 Fragen pro Stunde erreicht. Bitte versuch es später wieder.'

export type RateSpeicher = Map<string, number[]>

const g = globalThis as typeof globalThis & { __wissenKiRate?: RateSpeicher }

export function rateSpeicher(): RateSpeicher {
  if (!g.__wissenKiRate) g.__wissenKiRate = new Map()
  return g.__wissenKiRate
}

export function raeumeRateSpeicher(now = Date.now(), speicher: RateSpeicher = rateSpeicher()) {
  const haltAb = now - MAX_HALTEZEIT_MS
  for (const [id, zeiten] of speicher) {
    const behalten = zeiten.filter((t) => t > haltAb)
    if (behalten.length === 0) speicher.delete(id)
    else speicher.set(id, behalten)
  }
}

export type RateErgebnis =
  | { erlaubt: true; verbraucht: number }
  | { erlaubt: false; status: 429; retryAfterSec: number }

/**
 * Zählt eine Frage der User-ID. Gibt 429, wenn 20 Fragen im Stundenfenster
 * schon verbraucht sind. Schreibt nur userId + Zeitstempel.
 */
export function pruefeUndZaehle(
  userId: string,
  now = Date.now(),
  speicher: RateSpeicher = rateSpeicher()
): RateErgebnis {
  const id = String(userId || '').trim()
  if (!id) {
    return { erlaubt: false, status: 429, retryAfterSec: 3600 }
  }
  raeumeRateSpeicher(now, speicher)
  const fensterAb = now - FENSTER_MS
  const bisher = (speicher.get(id) || []).filter((t) => t > fensterAb)
  if (bisher.length >= FRAGEN_PRO_STUNDE) {
    const aelteste = Math.min(...bisher)
    const retryAfterSec = Math.max(1, Math.ceil((aelteste + FENSTER_MS - now) / 1000))
    speicher.set(id, bisher)
    return { erlaubt: false, status: 429, retryAfterSec }
  }
  bisher.push(now)
  speicher.set(id, bisher)
  return { erlaubt: true, verbraucht: bisher.length }
}
