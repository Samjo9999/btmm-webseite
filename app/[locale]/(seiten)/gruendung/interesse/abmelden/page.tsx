import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SeitenRahmen, SeitenKopf, Abschnitt } from '@/components/btmm/Bausteine'
import { InteresseToken } from '@/components/Interesse'
import { edgeUrl, interessenlisteAktiv } from '@/lib/interessenliste.mjs'

// Schalter aus (Standard): die Seite existiert nicht. Nie indexieren (Token im Link).
export const dynamic = 'force-dynamic'

type P = { params: { locale: string } }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'interesse' })
  return { title: t('abmelden_titel'), robots: { index: false, follow: false } }
}

export default async function Seite({ params: { locale } }: P) {
  if (!interessenlisteAktiv()) notFound()
  setRequestLocale(locale)
  const t = await getTranslations('interesse')
  return (
    <SeitenRahmen>
      <SeitenKopf titel={t('abmelden_titel')} />
      <div className="btmm-inhalt">
        <Abschnitt>
          <InteresseToken aktion="abmelden" edgeUrl={edgeUrl()} />
        </Abschnitt>
      </div>
    </SeitenRahmen>
  )
}
