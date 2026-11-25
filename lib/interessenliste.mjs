// Interessenliste BtMM (unverbindlich, ohne Zahlung). Reine Hilfsfunktionen ohne Seiteneffekte.
// Alle personenbezogenen Daten gehen direkt vom Browser an die Supabase-Edge-Function.
// Es gibt bewusst KEINE Vercel-API-Route fuer diese Daten (Datenschutz-Auflage).

export const CONSENT_TEXT_VERSION = '2026-11-25-v1'

export const INTERESSEN = ['beitritt', 'dankeschoen', 'mitarbeiten', 'informiert', 'gruendung']

export const EDGE_URL_STANDARD = 'https://xcngmshjuqoucdlgikao.supabase.co/functions/v1/interessenliste'
export const EDGE_REGION = 'eu-central-1'

// Kleine Zahlen nicht anzeigen (Datensparsamkeit, kein Rueckschluss auf Einzelne).
export const ZAEHLER_MINDESTWERT = 10

/** Schalter. Ohne INTERESSENLISTE_AKTIV=true bleibt die Seite wie bisher. */
export function interessenlisteAktiv(env = process.env) {
  return env.INTERESSENLISTE_AKTIV === 'true'
}

export function edgeUrl(env = process.env) {
  const u = (env.INTERESSENLISTE_EDGE_URL || '').trim()
  return u.startsWith('https://') ? u : EDGE_URL_STANDARD
}

/** Payload an die Edge Function. Nur die hier festgelegten Felder, keine weiteren Eingaben. */
export function baueNutzlast({ name, email, interessen, consentInfo, sprache, website, startedAt }) {
  return {
    action: 'anmelden',
    name: (name || '').trim() || null,
    email: (email || '').trim(),
    interessen: INTERESSEN.filter((i) => interessen.includes(i)),
    consentInfo: consentInfo === true,
    consentTextVersion: CONSENT_TEXT_VERSION,
    sprache,
    website: website || '',
    startedAt,
  }
}

/** Token steht im URL-Fragment (#t=...), damit er nie an einen Server (Vercel-Logs) geht. */
export function tokenAusHash(hash) {
  const m = /^#?t=([A-Za-z0-9_-]{20,200})$/.exec(hash || '')
  return m ? m[1] : null
}

export function fehlerSchluessel(status, fehler) {
  if (status === 429) return 'fehler_limit'
  if (status === 503) return 'fehler_aus'
  if (status === 502) return 'fehler_mail'
  if (status === 409 || fehler === 'seite_neu_laden') return 'fehler_neu_laden'
  if (fehler === 'email') return 'fehler_email'
  if (fehler === 'interessen') return 'fehler_interessen'
  if (fehler === 'consent_info') return 'fehler_consent'
  return 'fehler_allgemein'
}

export function zaehlerAnzeigen(n) {
  return Number.isFinite(n) && n >= ZAEHLER_MINDESTWERT
}
