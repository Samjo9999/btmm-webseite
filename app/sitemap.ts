import type { MetadataRoute } from 'next'
import { locales } from '@/i18n'
import { SITE_URL } from '@/lib/seiten'
import { VERTIEFUNGEN } from '@/lib/inhalte/vertiefungen'
import { interessenlisteAktiv } from '@/lib/interessenliste.mjs'

// Öffentliche Seiten (ohne Körperarbeit-Unterseiten, /app und /vorschau).
const PFADE = [
  '',
  '/so-funktionierts',
  '/was-du-sparst',
  '/kosten',
  '/offene-fragen',
  '/geldfluss',
  '/konzept',
  '/konzept/wirtschaft',
  '/konzept/gemeinschaft',
  '/konzept/international',
  '/nachhaltigkeit',
  '/angebote',
  '/angebote/back-to-balance',
  '/mitmachen',
  '/gruendung',
  '/zellen',
  '/erfahrungen',
  '/dokumente',
  '/wissen',
  '/wissen/glossar',
  ...VERTIEFUNGEN.map((v) => `/wissen/${v.slug}`),
  '/faq',
  '/presse',
  '/impressum',
]

// Schalter wird zur Laufzeit gelesen (Interessenliste nur bei INTERESSENLISTE_AKTIV=true).
export const dynamic = 'force-dynamic'

export default function sitemap(): MetadataRoute.Sitemap {
  const pfade = interessenlisteAktiv() ? [...PFADE, '/gruendung/interesse'] : PFADE
  return pfade.map((pfad) => ({
    url: `${SITE_URL}/de${pfad}`,
    changeFrequency: 'weekly',
    priority: pfad === '' ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${pfad}`])),
    },
  }))
}
