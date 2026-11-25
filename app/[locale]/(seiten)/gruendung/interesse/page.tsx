import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SeitenRahmen, SeitenKopf, Abschnitt } from '@/components/btmm/Bausteine'
import { InteresseForm } from '@/components/Interesse'
import { edgeUrl, interessenlisteAktiv } from '@/lib/interessenliste.mjs'

// Schalter aus (Standard): die Seite existiert nicht, alles bleibt wie bisher.
export const dynamic = 'force-dynamic'

type P = { params: { locale: string } }

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'interesse' })
  return { title: t('meta_titel'), description: t('meta_beschreibung'), robots: { index: true, follow: true } }
}

export default async function InteressePage({ params: { locale } }: P) {
  if (!interessenlisteAktiv()) notFound()
  setRequestLocale(locale)
  const t = await getTranslations('interesse')
  return (
    <SeitenRahmen>
      <SeitenKopf titel={t('meta_titel')} unterzeile={t('kopf_unter')} />
      <div className="btmm-inhalt">
        <Abschnitt>
          <p>{t('lead')}</p>
          <h2>{t('passiert_titel')}</h2>
          <p>{t('passiert')}</p>
          <h2>{t('nicht_titel')}</h2>
          <p>{t('nicht')}</p>
        </Abschnitt>
        <Abschnitt>
          <InteresseForm edgeUrl={edgeUrl()} />
        </Abschnitt>
      </div>
    </SeitenRahmen>
  )
}
