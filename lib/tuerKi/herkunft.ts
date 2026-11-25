/**
 * Herkunftsprüfung der Tür-KI: gleiche Origin (Webseite) oder ausdrücklich freigegebene
 * App-Origins (TUER_KI_APP_ORIGINS, kommagetrennt). CORS-Header nur für App-Origins, nie "*".
 */
export function appOrigins(raw: string | undefined): string[] {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter((s) => s && s !== '*' && /^[a-z][a-z0-9+.-]*:\/\/[^\s/]+$/i.test(s))
}

export type HerkunftErgebnis = { erlaubt: boolean; cors: Record<string, string> }

export function pruefeHerkunft(origin: string | null, host: string | null, apps: string[]): HerkunftErgebnis {
  if (!origin) return { erlaubt: true, cors: {} } // gleiche Seite ohne Origin-Header (z. B. alter Browser, curl)
  const o = origin.replace(/\/$/, '')
  if (apps.includes(o)) {
    return {
      erlaubt: true,
      cors: {
        'Access-Control-Allow-Origin': o,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600',
        Vary: 'Origin',
      },
    }
  }
  try {
    const u = new URL(o)
    if (host && u.host.toLowerCase() === host.toLowerCase()) return { erlaubt: true, cors: {} }
  } catch {
    /* ungültige Origin */
  }
  return { erlaubt: false, cors: {} }
}
