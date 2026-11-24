import type { MetadataRoute } from 'next'
import { locales } from '@/i18n'
import { SITE_URL } from '@/lib/seiten'
import { VERTIEFUNGEN } from '@/lib/inhalte/vertiefungen'

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

export default function sitemap(): MetadataRoute.Sitemap {
  return PFADE.map((pfad) => ({
    url: `${SITE_URL}/de${pfad}`,
    changeFrequency: 'weekly',
    priority: pfad === '' ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${pfad}`])),
    },
  }))
}
