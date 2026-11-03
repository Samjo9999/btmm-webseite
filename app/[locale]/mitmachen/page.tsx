/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { SeitenKopf, Abschnitt, Karte, Offen, Rechnung, Knopf, WeiterLinks, JsonLd, SeitenRahmen, Marke } from '@/components/btmm/Bausteine'
import { seitenMeta, breadcrumbLd, absUrl, href, ORGANISATION_LD, KONTAKT_MAIL, SEITEN } from '@/lib/seiten'

type P = { params: { locale: string } }
export function generateMetadata({ params }: P): Metadata { return seitenMeta('mitmachen', params.locale) }

export default function Seite({ params: { locale } }: P) {
  setRequestLocale(locale)
  return (
    <SeitenRahmen>
      <JsonLd daten={[ORGANISATION_LD, breadcrumbLd(['start', 'mitmachen'], locale),
        { '@type': 'ContactPage', name: SEITEN.mitmachen.titel, url: absUrl('mitmachen', locale), description: SEITEN.mitmachen.beschreibung }]} />
      <SeitenKopf titel="Mitmachen" unterzeile="Wir suchen die ersten drei in Freiburg. Kein Investment, keine Vorkasse."
        bild="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=80" bildAlt="Hände halten Pflanze – gemeinsam wachsen" />
      <div className="btmm-inhalt">
        <Abschnitt titel="Dein nächster Schritt">
          <div className="btmm-raster">
            <Karte titel="Offener Abend"><p>Komm zu einem offenen Abend und lern uns kennen. Den nächsten Termin schicken wir dir auf Nachfrage.</p></Karte>
            <Karte titel="Einfach melden"><p>Sag uns, dass du mitmachen willst – mehr braucht es am Anfang nicht.</p></Karte>
          </div>
          <p style={{ marginTop: '1.5rem' }}><Knopf link={`mailto:${KONTAKT_MAIL}`}>Schreib uns: {KONTAKT_MAIL}</Knopf></p>
        </Abschnitt>
        <Abschnitt titel="Was dich erwartet">
          <ul>
            <li>Du bleibst am Anfang selbstständig, niemand ist angestellt.</li>
            <li>Wir kaufen gemeinsam ein und teilen Auto, Raum und Werkzeug.</li>
            <li>Erst mit der Genossenschaft kommt ein Anteil von 100 €, auf Wunsch in Raten ab 10 €.</li>
          </ul>
          <Offen>Haftung am Anfang, Rückzahlung des Anteils, Rente und Lohn – siehe <a href={href(locale, 'offeneFragen')}>Offene Fragen</a>.</Offen>
        </Abschnitt>
        <WeiterLinks locale={locale} seiten={['soFunktionierts', 'wasDuSparst', 'kosten', 'faq']} />
      </div>
    </SeitenRahmen>
  )
}
