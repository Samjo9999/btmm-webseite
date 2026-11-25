/**
 * Herkunftsprüfung der Tür-KI: gleiche Origin (Webseite) oder ausdrücklich
 * freigegebene App-Origins über Env TUER_KI_APP_ORIGINS (kommagetrennt).
 * Die Default-Liste ist leer: ohne Env kein CORS, fremde Origins werden
 * abgewiesen (403). Nie "*". Env erst setzen, wenn echte App-Domains
 * feststehen (DS-Bot). Die App nutzt /api/tuer-ki derzeit nicht.
 *
 * Vorlage für eine spätere Freigabe (BtMM-App #68, DS-geprüft), nicht als Default:
 * https://app.b-t-m-m.com, https://btmm-app.vercel.app,
 * capacitor://localhost, ionic://localhost, https://localhost, http://localhost,
 * https://127.0.0.1, http://127.0.0.1
 * sowie Team-Preview-Muster
 * ^https:\/\/btmm-[a-z0-9-]+-backtobalancegartzke-2433s-projects\.vercel\.app$
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
