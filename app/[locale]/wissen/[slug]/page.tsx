import { NeueInhalteStil } from '@/components/btmm/NeueInhalteStil'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { SeitenKopf, Abschnitt, Offen, Knopf, WeiterLinks, JsonLd, SeitenRahmen, Marke } from '@/components/btmm/Bausteine'
import { VERTIEFUNGEN } from '@/lib/inhalte/vertiefungen'
import { SITE_URL, KONTAKT_MAIL, breadcrumbLd } from '@/lib/seiten'

type P = { params: { locale: string; slug: string } }

export function generateMetadata({ params }: P): Metadata {
  const artikel = VERTIEFUNGEN.find(a => a.slug === params.slug)
  if (!artikel) return {}
  const url = `${SITE_URL}/${params.locale}/wissen/${artikel.slug}`
  return { title: `${artikel.titel} | BtMM`, description: artikel.kurz, alternates: { canonical: url }, openGraph: { title: artikel.titel, description: artikel.kurz, url } }
}

export default function WissensSeite({ params: { locale, slug } }: P) {
  setRequestLocale(locale)
  const artikel = VERTIEFUNGEN.find(a => a.slug === slug)
  if (!artikel) notFound()
  return <SeitenRahmen><div className="btmm-ergaenzung"><NeueInhalteStil />
    <JsonLd daten={[
      breadcrumbLd(['start', 'wissen'], locale),
      { '@type': 'Article', headline: artikel.titel, description: artikel.kurz, inLanguage: 'de', url: `${SITE_URL}/${locale}/wissen/${slug}` },
    ]} />
    <SeitenKopf titel={artikel.titel} unterzeile={artikel.kurz} />
    <div className="btmm-inhalt">
      <Abschnitt>
        <p><Marke art="geplant" /> Stand: November 2026</p>
        <p>{artikel.einstieg}</p>
      </Abschnitt>
      {artikel.abschnitte.map(a => <Abschnitt key={a.titel} titel={a.titel}><p>{a.text}</p></Abschnitt>)}
      <Abschnitt titel="Dein erster Schritt">
        <p>{artikel.ersterSchritt}</p>
        <p><Knopf link={`mailto:${KONTAKT_MAIL}`}>Mit uns ins Gespräch kommen</Knopf></p>
      </Abschnitt>
      <Offen>{artikel.offen}</Offen>
      <Abschnitt titel="Grundlage">
        <p style={{ fontSize: '0.9rem', opacity: 0.75 }}>Die wichtigsten Gedanken aus den aktuellen BtMM-Entwürfen, für die Webseite zusammengefasst: {artikel.quellen.join('; ')}. Die Genossenschaft ist im Aufbau; diese Entwürfe sind keine bereits verfügbaren Leistungen oder rechtlich geprüften Zusagen.</p>
      </Abschnitt>
      <WeiterLinks locale={locale} seiten={['wissen', 'soFunktionierts', 'offeneFragen', 'mitmachen']} />
    </div>
  </div></SeitenRahmen>
}
