import createNextIntlPlugin from 'next-intl/plugin'
import { ALT_NACH_NEU } from './lib/dokumente-web.mjs'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

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
