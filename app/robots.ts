import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { SITE_URL } from '@/lib/seiten'
import { istProdHost } from '@/lib/host'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  const host = headers().get('x-forwarded-host') ?? headers().get('host')
  // Vorschau- und Preview-Hosts: gar nicht crawlen.
  if (!istProdHost(host)) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/vorschau/', '/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
