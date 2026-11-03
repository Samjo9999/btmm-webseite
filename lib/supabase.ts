import { createClient } from '@supabase/supabase-js'

import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Public read-only client using anon key only – no service key on the website.
// Without env (e.g. CI build) the client is null and callers must render empty data.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export type FundraisingData = {
  aktuell_eur: number
  ziel_eur: number
  letzte_aktualisierung: string
  sync_status: 'ok' | 'error' | 'pending'
}

export type UniverseCell = {
  name: string
  city: string
  country: string
  lat: number
  lng: number
  status: string
}
