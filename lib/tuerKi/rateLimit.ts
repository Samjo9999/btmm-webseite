/**
 * Rate-Limit der Tür-KI ohne Login (DS-Leitplanken Tür-KI 25.11.2026, DS-Bot 25.11.).
 * IP nur als HMAC-SHA256 mit gemeinsamem, täglich wechselndem Salz:
 * HMAC aus Server-Env-Secret (TUER_KI_RATE_SALT) plus Datum; fehlt die Env,
 * bleibt ein Prozess-Secret nur im Server-Speicher. Das Salz liegt nie in der DB.
 * Gespeichert werden nur Hash und Zeitstempel, höchstens 24 h; beim Tageswechsel
 * werden Salz und alle Einträge verworfen. Nichts davon wird geloggt.
 *
 * Serverless-Grenze ohne gemeinsames Env-Secret: gilt je Laufzeit-Instanz.
 * Ein persistenter Zähler (gleiche Felder, EU Frankfurt, Löschung <= 24 h)
 * liegt nur als SQL-Entwurf in docs/tuer-ki/ (nicht angewendet).
 * Reihenfolge: erst verdrahten (Env-Secret, Region, pg_cron), dann migrieren.
 */
import { createHmac, randomBytes } from 'node:crypto'

export const NACHRICHTEN_PRO_STUNDE = 30
export const NACHRICHTEN_PRO_TAG = 100
export const FENSTER_MS = 60 * 60 * 1000
export const MAX_HALTEZEIT_MS = 24 * 60 * 60 * 1000
export const RATE_SALT_ENV = 'TUER_KI_RATE_SALT'

export type TuerRateZustand = { tag: string; salz: Buffer; zaehler: Map<string, number[]> }

/** Prozess-Secret nur im Speicher, falls die Env fehlt. Nie in der DB. */
let prozessSecret: Buffer | undefined

function geheimesSalzmaterial(): Buffer | string {
  const env = process.env[RATE_SALT_ENV]
  if (env && env.trim()) return env.trim()
  if (!prozessSecret) prozessSecret = randomBytes(32)
  return prozessSecret
}

export function tagVon(now: number): string {
  return new Date(now).toISOString().slice(0, 10)
}

/** Tagessalz: HMAC(Secret, Datum). Secret nur aus Env oder Prozess-Speicher. */
export function tagesSalz(tag: string, secret?: Buffer | string): Buffer {
  return createHmac('sha256', secret ?? geheimesSalzmaterial()).update(String(tag)).digest()
}

export function neuerRateZustand(now = Date.now()): TuerRateZustand {
  const tag = tagVon(now)
  return { tag, salz: tagesSalz(tag), zaehler: new Map() }
}

function rotiere(z: TuerRateZustand, now: number) {
  const t = tagVon(now)
  if (t !== z.tag) {
    z.tag = t
    z.salz = tagesSalz(t)
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
