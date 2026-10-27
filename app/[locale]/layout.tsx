import type { Metadata } from 'next'
import { EB_Garamond } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, rtlLocales, type Locale } from '@/i18n'
import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ScrollHint } from '@/components/ScrollHint'
import { ScrollToTop } from '@/components/ScrollToTop'
import { BRAND_FULL } from '@/lib/brand'

const ChatWidget = dynamic(
  () => import('@/components/ChatWidget').then(mod => ({ default: mod.ChatWidget })),
  { ssr: false },
)

const BookingAgent = dynamic(
  () => import('@/components/BookingAgent').then(mod => ({ default: mod.BookingAgent })),
  { ssr: false },
)
import '../globals.css'

const garamond = EB_Garamond({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-garamond',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${BRAND_FULL} – Wirtschaft, die trägt.`,
    template: `%s | ${BRAND_FULL}`,
  },
  description:
    'Back to Meaning Maximization verbindet wirtschaftliche Stärke mit menschlicher Würde. Somatische Körperarbeit, Gemeinschaft und ein alternatives Wirtschaftsmodell in Freiburg.',
  metadataBase: new URL('https://b-t-m-m.com'),
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://b-t-m-m.com',
    siteName: BRAND_FULL,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale as Locale)) notFound()

  // Enable static rendering for all locales
  setRequestLocale(locale)

  const messages = await getMessages()
  const isRtl = rtlLocales.includes(locale as Locale)

  return (
    <html
      lang={locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={garamond.variable}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale as Locale} />
          <ScrollToTop />
          <main>{children}</main>
          <ScrollHint />
          <Footer />
          <ChatWidget />
          <BookingAgent />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
