import createNextIntlPlugin from 'next-intl/plugin'
import { ALT_NACH_NEU } from './lib/dokumente-web.mjs'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

// Tür-KI: Oberfläche nur, wenn TUER_KI_ENABLED und WISSEN_LLM_ENABLED beim Build an sind (Default aus).
// Die Route /api/tuer-ki prüft beide Schalter zusätzlich zur Laufzeit (sofortige Notbremse).
const an = (v) => ['1', 'true', 'on', 'yes'].includes(String(v || '').trim().toLowerCase())
const TUER_KI_UI = an(process.env.TUER_KI_ENABLED) && an(process.env.WISSEN_LLM_ENABLED)

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Alte Dokumentseiten und PDFs (vor 25.11.2026) -> neue Dokumentseiten, damit nur eine Fassung gilt.
    return Object.entries(ALT_NACH_NEU).flatMap(([alt, neu]) => [
      { source: `/:locale/dokumente/${alt}`, destination: `/:locale/dokumente/${neu}`, permanent: true },
      { source: `/dokumente/${alt}.pdf`, destination: `/de/dokumente/${neu}`, permanent: true },
    ])
  },
  async rewrites() {
    return [
      { source: '/dokumente/:slug.md', destination: '/api/dokumente-md/:slug' },
      {
        source: '/tuer/ki-schalter.js',
        destination: TUER_KI_UI ? '/tuer/ki-schalter-an.js' : '/tuer/ki-schalter-aus.js',
      },
      {
        source: '/vorschau/wissen-chat/index-public.json',
        destination: '/wissen/index-public.json',
      },
      {
        source: '/vorschau/bewertung-chat-feedback/index-public.json',
        destination: '/wissen/index-public.json',
      },
      {
        source: '/tuer',
        destination: '/tuer/index.html',
      },
      {
        source: '/tuer/',
        destination: '/tuer/index.html',
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xcngmshjuqoucdlgikao.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

export default withNextIntl(nextConfig)
