import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false,
})

export const config = {
  matcher: [
    // vorschau/* = static HTML clickdummy (Sp. 134 u. a.), kein Locale-Prefix
    '/((?!api|_next|_vercel|vorschau|admin|.*\\..*).*)',
  ],
}
