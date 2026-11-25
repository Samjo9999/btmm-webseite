import type { MetadataRoute } from 'next'
import { locales } from '@/i18n'
import { SITE_URL } from '@/lib/seiten'
import { VERTIEFUNGEN } from '@/lib/inhalte/vertiefungen'
import { slugs as dokumentSlugs } from '@/lib/dokumente-web.mjs'
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

// Dokumente gibt es nur auf Deutsch: eigene Einträge ohne Sprachvarianten.
const DOKUMENT_PFADE = dokumentSlugs().map((s: string) => `/dokumente/${s}`)

export default function sitemap(): MetadataRoute.Sitemap {
  const pfade = interessenlisteAktiv() ? [...PFADE, '/gruendung/interesse'] : PFADE
  const dokumente: MetadataRoute.Sitemap = DOKUMENT_PFADE.map((pfad: string) => ({
    url: `${SITE_URL}/de${pfad}`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))
  const seiten: MetadataRoute.Sitemap = pfade.map((pfad) => ({
    url: `${SITE_URL}/de${pfad}`,
    changeFrequency: 'weekly' as const,
    priority: pfad === '' ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${pfad}`])),
    },
  }))
  return [...seiten, ...dokumente]
}
