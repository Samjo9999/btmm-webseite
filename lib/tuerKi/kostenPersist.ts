/**
 * Persistenter Kostendeckel der Tür-KI über Supabase-RPC (service_role).
 * SQL in docs/tuer-ki/tuer_ki_kosten.sql (noch nicht anwenden).
 * Speichert nur Perioden und Summen, nie Inhalt, IP oder Hash.
 */
import { createClient } from '@supabase/supabase-js'

export const KOSTEN_RESERVE_RPC = 'tuer_ki_kosten_reserviere'
export const KOSTEN_KORREKTUR_RPC = 'tuer_ki_kosten_korrigiere'

export type TuerKostenReserveErg =
  | { erlaubt: true; tagEur: number; monatEur: number }
  | { erlaubt: false; grund: 'tag' | 'monat' }

export type TuerKostenReserviere = (
  tag: string,
  monat: string,
  schaetzungEur: number,
  tagLimit: number,
  monatLimit: number,
) => Promise<TuerKostenReserveErg>

export type TuerKostenKorrigiere = (
  tag: string,
  monat: string,
  reserviertEur: number,
  echtEur: number,
  ein: number,
  aus: number,
) => Promise<void>

function serviceClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!url || !key) throw new Error('kosten-rpc-env')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function zahl(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) throw new Error('kosten-rpc')
  return n
}

/** Server-RPC: Worst-Case reservieren. Wirft bei fehlender Env oder DB-Fehler (fail-closed im Handler). */
export async function reserviereTuerKostenRpc(
  tag: string,
  monat: string,
  schaetzungEur: number,
  tagLimit: number,
  monatLimit: number,
): Promise<TuerKostenReserveErg> {
  const sb = serviceClient()
  const { data, error } = await sb.rpc(KOSTEN_RESERVE_RPC, {
    p_tag: tag,
    p_monat: monat,
    p_schaetzung_eur: schaetzungEur,
    p_tag_limit: tagLimit,
    p_monat_limit: monatLimit,
  })
  if (error) throw new Error('kosten-rpc')
  const row = (Array.isArray(data) ? data[0] : data) as
    | { erlaubt?: unknown; grund?: unknown; tag_eur?: unknown; monat_eur?: unknown }
    | null
  if (!row || typeof row.erlaubt !== 'boolean') throw new Error('kosten-rpc')
  if (!row.erlaubt) {
    return { erlaubt: false, grund: row.grund === 'monat' ? 'monat' : 'tag' }
  }
  return { erlaubt: true, tagEur: zahl(row.tag_eur), monatEur: zahl(row.monat_eur) }
}

/** Server-RPC: Reservierung auf echten Verbrauch korrigieren. Wirft bei Fehler. */
export async function korrigiereTuerKostenRpc(
  tag: string,
  monat: string,
  reserviertEur: number,
  echtEur: number,
  ein: number,
  aus: number,
): Promise<void> {
  const sb = serviceClient()
  const { error } = await sb.rpc(KOSTEN_KORREKTUR_RPC, {
    p_tag: tag,
    p_monat: monat,
    p_reserviert_eur: reserviertEur,
    p_echt_eur: echtEur,
    p_ein: ein,
    p_aus: aus,
  })
  if (error) throw new Error('kosten-rpc')
}
