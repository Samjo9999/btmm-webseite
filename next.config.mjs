import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tür ist statisch unter /tuer/index.html; /tuer und /tuer/ landeten sonst über die Locale-Weiche auf 404
  async redirects() {
    return [{ source: '/tuer', destination: '/tuer/index.html', permanent: false }]
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
