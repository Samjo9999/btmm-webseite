/**
 * Rate-Limit der Tür-KI ohne Login (DS-Leitplanken Tür-KI 25.11.2026).
 * IP nur als HMAC-SHA256 mit täglich wechselndem Salz, das nur im Server-Speicher liegt.
 * Gespeichert werden nur Hash und Zeitstempel, höchstens 24 h; beim Tageswechsel
 * werden Salz und alle Einträge verworfen. Nichts davon wird geloggt.
 *
 * Serverless-Grenze: gilt je Laufzeit-Instanz. Ein persistenter Zähler (gleiche Felder,
 * EU, Löschung <= 24 h) liegt nur als SQL-Entwurf in docs/tuer-ki/ (nicht angewendet).
 */
import { createHmac, randomBytes } from 'node:crypto'

export const NACHRICHTEN_PRO_STUNDE = 30
export const NACHRICHTEN_PRO_TAG = 100
export const FENSTER_MS = 60 * 60 * 1000
export const MAX_HALTEZEIT_MS = 24 * 60 * 60 * 1000

export type TuerRateZustand = { tag: string; salz: Buffer; zaehler: Map<string, number[]> }

export function neuerRateZustand(now = Date.now()): TuerRateZustand {
  return { tag: tagVon(now), salz: randomBytes(32), zaehler: new Map() }
}

function tagVon(now: number): string {
  return new Date(now).toISOString().slice(0, 10)
}

function rotiere(z: TuerRateZustand, now: number) {
  const t = tagVon(now)
  if (t !== z.tag) {
    z.tag = t
    z.salz = randomBytes(32)
    z.zaehler.clear()
  }
  const haltAb = now - MAX_HALTEZEIT_MS
  for (const [h, zeiten] of z.zaehler) {
    const behalten = zeiten.filter((x) => x > haltAb)
    if (behalten.length) z.zaehler.set(h, behalten)
    else z.zaehler.delete(h)
  }
}

export function ipHash(ip: string, z: TuerRateZustand, now = Date.now()): string {
  rotiere(z, now)
  return createHmac('sha256', z.salz).update(String(ip || 'ohne-ip')).digest('hex')
}

export type TuerRateErgebnis = { erlaubt: true } | { erlaubt: false; retryAfterSec: number }

export function pruefeTuerRate(ip: string, z: TuerRateZustand, now = Date.now()): TuerRateErgebnis {
  const h = ipHash(ip, z, now)
  const zeiten = z.zaehler.get(h) || []
  const stunde = zeiten.filter((x) => x > now - FENSTER_MS)
  if (zeiten.length >= NACHRICHTEN_PRO_TAG) {
    const naechsterTag = Date.parse(z.tag + 'T00:00:00Z') + MAX_HALTEZEIT_MS
    return { erlaubt: false, retryAfterSec: Math.max(1, Math.ceil((naechsterTag - now) / 1000)) }
  }
  if (stunde.length >= NACHRICHTEN_PRO_STUNDE) {
    const aelteste = Math.min(...stunde)
    return { erlaubt: false, retryAfterSec: Math.max(1, Math.ceil((aelteste + FENSTER_MS - now) / 1000)) }
  }
  zeiten.push(now)
  z.zaehler.set(h, zeiten)
  return { erlaubt: true }
}
