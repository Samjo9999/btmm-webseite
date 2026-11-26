/**
 * Tür-KI: feste Grenzen (Plan Tür-KI 25.11.2026 §3.3 und §5).
 * Eigener Kostendeckel getrennt von S50 der Wissens-KI. Schalter bleiben aus.
 * Einschalten frühestens 01.12.2026.
 */
export const TUER_KI = {
  temperature: 0.5,
  maxTokens: 400,
  /** Ab Warnstufe (80 % des Tagesdeckels) kürzere Antworten. */
  maxTokensSpar: 200,
  timeoutMs: 8000,
  maxZeichenNutzer: 600,
  maxZeichenAssistent: 1200,
  /** Verlauf, der ans Modell geht (Nutzer + Assistent), serverseitig gekürzt. */
  maxNachrichtenVerlauf: 12,
  /** Nutzer-Nachrichten je Gespräch; danach Weg-Ansicht. */
  maxNutzerRunden: 10,
  kontextTreffer: 5,
  kontextZeichen: 1200,
  maxAntwortZeichen: 1500,
} as const

/** Sprachen der Tür (wie public/tuer/tuer.js). */
export const TUER_SPRACHEN = ['de', 'en', 'zh', 'es', 'hi', 'ar', 'bn', 'pt', 'ru', 'ja', 'fr'] as const
export type TuerSprache = (typeof TUER_SPRACHEN)[number]

export function spracheOder(raw: unknown): TuerSprache {
  const s = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  return (TUER_SPRACHEN as readonly string[]).includes(s) ? (s as TuerSprache) : 'de'
}

/** Schlüssel der Weg-Schritte, identisch mit SCHRITTE in public/tuer/pfad.js (Test prüft Gleichheit). */
export const SCHRITTE_KEYS = [
  'grundlagen', 'sparen', 'arbeiten', 'wohnen', 'skeptisch', 'dokumente', 'sinn', 'gruenden', 'freiburg',
  'vorbei', 'anpacken', 'folgen', 'kunde', 'einstieg', 'lebensphase', 'ruhestand', 'unterstuetzen',
] as const

/** Öffentliche Seiten, auf die die Tür-KI weiterleiten darf (Pfad ohne Locale). */
export const TUER_KI_SEITEN = [
  '/faq',
  '/dokumente',
  '/mitmachen',
  '/wissen',
  '/so-funktionierts',
  '/was-du-sparst',
  '/konzept',
  '/konzept/wirtschaft',
  '/gruendung',
  '/chronik',
  '/offene-fragen',
  '/fuer-dich',
  '/fuer-dich/kunden',
  '/fuer-dich/berufseinstieg',
  '/fuer-dich/lebensphasen',
  '/fuer-dich/ruhestand',
  '/fuer-dich/unterstuetzen',
] as const
