/**
 * Zielseiten der Überzeugungstür für Gruppen, die bisher keinen eigenen Inhalt hatten (PR #38):
 * Berufseinstieg, Kundinnen und Kunden, Lebensphasen (Solidarfonds). Texte: lib/inhalte/tuer-luecken.ts.
 * Eigene Route, damit sie sich nicht mit dem Außensicht-Branch überschneidet.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SeitenKopf, Abschnitt, SeitenRahmen } from '@/components/btmm/Bausteine'
import { FaqLohn } from '@/components/btmm/FaqLohn'
import { lueckenTexte } from '@/lib/inhalte/tuer-luecken'
import { SITE_URL } from '@/lib/seiten'
import { BRAND_FULL } from '@/lib/brand'
import Link from 'next/link'

const THEMEN = ['berufseinstieg', 'kunden', 'lebensphasen'] as const
type Thema = (typeof THEMEN)[number]
type P = { params: { locale: string; thema: string } }

export function generateStaticParams() {
  return THEMEN.map((thema) => ({ thema }))
}

function kopf(t: ReturnType<typeof lueckenTexte>, thema: Thema) {
  if (thema === 'berufseinstieg') return { titel: t.einstieg.titel, kurz: t.einstieg.kurz }
  if (thema === 'kunden') return { titel: t.kunden.titel, kurz: t.kunden.kurz }
  return { titel: t.lebensphasen.titel, kurz: t.lebensphasen.kurz }
}

export function generateMetadata({ params }: P): Metadata {
  if (!THEMEN.includes(params.thema as Thema)) return {}
  const k = kopf(lueckenTexte(params.locale), params.thema as Thema)
  const url = `${SITE_URL}/${params.locale}/fuer-dich/${params.thema}`
  return { title: { absolute: `${k.titel} | ${BRAND_FULL}` }, description: k.kurz, alternates: { canonical: url }, openGraph: { title: k.titel, description: k.kurz, url } }
}

export default async function Seite({ params: { locale, thema } }: P) {
  if (!THEMEN.includes(thema as Thema)) notFound()
  setRequestLocale(locale)
  const t = lueckenTexte(locale)
  const k = kopf(t, thema as Thema)
  const tk = await getTranslations({ locale, namespace: 'konzept' })
  return (
    <SeitenRahmen>
      <SeitenKopf titel={k.titel} unterzeile={k.kurz} />
      <div className="btmm-inhalt">
        {thema === 'berufseinstieg' && (
          <Abschnitt id="berufseinstieg">
            <p><span className="btmm-marke btmm-marke--geplant">{t.geplant}</span></p>
            <p>{t.einstieg.text}</p>
            <div className="btmm-hinweis btmm-hinweis--offen"><strong>{t.geplant}:</strong> {t.einstieg.hinweis}</div>
            <FaqLohn locale={locale} />
          </Abschnitt>
        )}
        {thema === 'kunden' && (
          <Abschnitt id="kunden">
            <p>{t.kunden.text}</p>
            <p>{t.kunden.abo}</p>
            <p><em>{t.kunden.hinweis}</em></p>
            <p>{t.kunden.mitglied}</p>
          </Abschnitt>
        )}
        {thema === 'lebensphasen' && (
          <Abschnitt id="solidarfonds">
            <p>{tk('gemeinschaft.solidar_text')}</p>
            <p>{tk('gemeinschaft.solidar_rhythmus')}</p>
            <p>{tk('gemeinschaft.solidar_kapazitaet')}</p>
            <p><Link href={`/${locale}/konzept/gemeinschaft`} className="btmm-knopf">{t.mehr}</Link></p>
          </Abschnitt>
        )}
      </div>
    </SeitenRahmen>
  )
}
