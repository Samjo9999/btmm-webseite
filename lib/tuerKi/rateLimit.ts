/**
 * Rate-Limit der Tür-KI ohne Login (DS-Leitplanken Tür-KI 25.11.2026, DS-Bot 25.11.).
 * IP nur als HMAC-SHA256 mit gemeinsamem, täglich wechselndem Salz:
 * HMAC aus Server-Env-Secret (TUER_KI_RATE_SALT) plus Datum. Das Salz liegt nie in der DB.
 * Gespeichert werden nur Hash, Zeitfenster und Zähler, höchstens 24 h.
 * Nichts davon wird geloggt. Klartext-IP nie in die DB.
 *
 * Verbindlich vor dem Einschalten: persistenter Zähler über Supabase-RPC
 * tuer_ki_rate_zaehle (service_role aus der Server-Env). Fehlt das Salz
 * oder schlägt die DB fehl: fail-closed, kein LLM-Aufruf.
 * Der In-Memory-Zähler bleibt nur als zusätzliche Bremse.
 * SQL in docs/tuer-ki/ (noch nicht anwenden). Schalter bleibt aus.
 */
import { createHmac, randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

export const NACHRICHTEN_PRO_STUNDE = 30
export const NACHRICHTEN_PRO_TAG = 100
export const FENSTER_MS = 60 * 60 * 1000
export const MAX_HALTEZEIT_MS = 24 * 60 * 60 * 1000
export const RATE_SALT_ENV = 'TUER_KI_RATE_SALT'
export const RATE_RPC_NAME = 'tuer_ki_rate_zaehle'

export type TuerRateZustand = { tag: string; salz: Buffer; zaehler: Map<string, number[]>; secret?: string }

/** Prozess-Secret nur für die lokale In-Memory-Bremse, falls die Env fehlt. Nie in der DB. */
let prozessSecret: Buffer | undefined

function geheimesSalzmaterial(secret?: string): Buffer | string {
  if (secret && secret.trim()) return secret.trim()
  const env = process.env[RATE_SALT_ENV]
  if (env && env.trim()) return env.trim()
  if (!prozessSecret) prozessSecret = randomBytes(32)
  return prozessSecret
}

export function rateSalt(env?: { TUER_KI_RATE_SALT?: string }): string | null {
  const s = (env?.TUER_KI_RATE_SALT ?? '').trim()
  return s || null
}

export function tagVon(now: number): string {
  return new Date(now).toISOString().slice(0, 10)
}

/** Tagessalz: HMAC(Secret, Datum). Secret nur aus Env oder Prozess-Speicher. */
export function tagesSalz(tag: string, secret?: Buffer | string): Buffer {
  return createHmac('sha256', secret ?? geheimesSalzmaterial()).update(String(tag)).digest()
}

export function neuerRateZustand(now = Date.now(), secret?: string): TuerRateZustand {
  const tag = tagVon(now)
  const material = geheimesSalzmaterial(secret)
  return {
    tag,
    salz: tagesSalz(tag, material),
    zaehler: new Map(),
    secret: typeof material === 'string' ? material : undefined,
  }
}

function rotiere(z: TuerRateZustand, now: number) {
  const t = tagVon(now)
  if (t !== z.tag) {
    z.tag = t
    z.salz = tagesSalz(t, z.secret ?? geheimesSalzmaterial())
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

/** Hash für die DB: HMAC mit Tagessalz aus dem Env-Secret. Klartext-IP geht nicht in die DB. */
export function ipHashMitSalt(ip: string, salt: string, now = Date.now()): string {
  const tages = tagesSalz(tagVon(now), salt)
  return createHmac('sha256', tages).update(String(ip || 'ohne-ip')).digest('hex')
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

export type TuerRateRpc = (hash: string) => Promise<{ stunde: number; tag: number }>

export type TuerRateDbErgebnis =
  | { erlaubt: true }
  | { erlaubt: false; art: 'limit'; retryAfterSec: number }
  | { erlaubt: false; art: 'fail_closed' }

function endeStundenfensterUtc(now: number): number {
  const d = new Date(now)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours() + 1, 0, 0, 0)
}

function endeTagUtc(now: number): number {
  return Date.parse(tagVon(now) + 'T00:00:00Z') + MAX_HALTEZEIT_MS
}

/**
 * Persistentes Rate-Limit über tuer_ki_rate_zaehle.
 * Ohne Salz oder bei DB-/RPC-Fehler: fail-closed.
 * In-Memory nur als zusätzliche Bremse nach erfolgreicher RPC.
 */
export async function pruefePersistenteRate(opts: {
  ip: string
  salt: string | null
  now: number
  rpc: TuerRateRpc
  memory?: TuerRateZustand
}): Promise<TuerRateDbErgebnis> {
  if (!opts.salt) return { erlaubt: false, art: 'fail_closed' }
  const hash = ipHashMitSalt(opts.ip, opts.salt, opts.now)
  let zaehlung: { stunde: number; tag: number }
  try {
    zaehlung = await opts.rpc(hash)
    if (
      !zaehlung ||
      !Number.isFinite(zaehlung.stunde) ||
      !Number.isFinite(zaehlung.tag) ||
      zaehlung.stunde < 0 ||
      zaehlung.tag < 0
    ) {
      return { erlaubt: false, art: 'fail_closed' }
    }
  } catch {
    return { erlaubt: false, art: 'fail_closed' }
  }
  if (zaehlung.tag >= NACHRICHTEN_PRO_TAG) {
    return { erlaubt: false, art: 'limit', retryAfterSec: Math.max(1, Math.ceil((endeTagUtc(opts.now) - opts.now) / 1000)) }
  }
  if (zaehlung.stunde >= NACHRICHTEN_PRO_STUNDE) {
    return { erlaubt: false, art: 'limit', retryAfterSec: Math.max(1, Math.ceil((endeStundenfensterUtc(opts.now) - opts.now) / 1000)) }
  }
  if (opts.memory) {
    const mem = pruefeTuerRate(opts.ip, opts.memory, opts.now)
    if (!mem.erlaubt) return { erlaubt: false, art: 'limit', retryAfterSec: mem.retryAfterSec }
  }
  return { erlaubt: true }
}

/** Server-RPC mit Service-Role. Wirft bei fehlender Env oder DB-Fehler (fail-closed im Handler). */
export async function zaehleTuerRateRpc(hash: string): Promise<{ stunde: number; tag: number }> {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!url || !key) throw new Error('rate-rpc-env')
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await sb.rpc(RATE_RPC_NAME, { p_hash: hash })
  if (error) throw new Error('rate-rpc')
  const row = (Array.isArray(data) ? data[0] : data) as { stunde?: unknown; tag?: unknown } | null
  if (!row || typeof row.stunde !== 'number' || typeof row.tag !== 'number') throw new Error('rate-rpc')
  return { stunde: row.stunde, tag: row.tag }
}
