import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'
import { istProdHost } from './lib/host'

const intl = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false,
})

export default function middleware(req: NextRequest) {
  const res = intl(req)
  // Vorschau-/Preview-Hosts (z. B. vorschau.b-t-m-m.com) nicht indexieren.
  if (!istProdHost(req.headers.get('x-forwarded-host') ?? req.headers.get('host'))) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return res
}

export const config = {
  matcher: [
    // vorschau/* = static HTML clickdummy (Sp. 134 u. a.), kein Locale-Prefix
    '/((?!api|_next|_vercel|vorschau|.*\\..*).*)',
  ],
}
