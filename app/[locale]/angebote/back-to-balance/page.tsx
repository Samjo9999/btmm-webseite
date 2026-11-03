/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { SeitenKopf, Abschnitt, Karte, Offen, Rechnung, Knopf, WeiterLinks, JsonLd, SeitenRahmen, Marke } from '@/components/btmm/Bausteine'
import { seitenMeta, breadcrumbLd, absUrl, href, ORGANISATION_LD, KONTAKT_MAIL, SEITEN } from '@/lib/seiten'

type P = { params: { locale: string } }
export function generateMetadata({ params }: P): Metadata { return seitenMeta('backToBalance', params.locale) }

export default function Seite({ params: { locale } }: P) {
  setRequestLocale(locale)
  return (
    <SeitenRahmen>
      <JsonLd daten={[ORGANISATION_LD, breadcrumbLd(['start', 'backToBalance'], locale),
        { '@type': 'LocalBusiness', name: 'Back to Balance – Körperarbeit', url: absUrl('backToBalance', locale),
          description: SEITEN.backToBalance.beschreibung, email: KONTAKT_MAIL,
          address: { '@type': 'PostalAddress', addressLocality: 'Freiburg im Breisgau', addressCountry: 'DE' },
          parentOrganization: { '@id': ORGANISATION_LD['@id'] } }]} />
      <SeitenKopf titel="Back to Balance – Körperarbeit in Freiburg" unterzeile="Ein Angebot unter dem Dach von BtMM."
        bild="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1920&q=80" bildAlt="Ruhige Körperarbeit" />
      <div className="btmm-inhalt">
        <Abschnitt titel="Was ist das?">
          <p>Back to Balance bietet Körperarbeit in Freiburg an. Es geht um Zeit für den eigenen Körper, um Wahrnehmung und Entspannung.</p>
          <div className="btmm-hinweis btmm-hinweis--rechnung"><strong>Wichtig:</strong> Körperarbeit ersetzt keine ärztliche oder psychotherapeutische Behandlung. Wir machen keine Heilversprechen. Die genaue Formulierung lassen wir von Fachleuten prüfen.</div>
        </Abschnitt>
        <Abschnitt titel="Mehr zum Angebot">
          <div className="btmm-raster">
            <Karte titel="Ablauf" link={`/${locale}/koerperarbeit/ablauf`}><p>Wie eine Sitzung abläuft.</p></Karte>
            <Karte titel="Preise" link={`/${locale}/koerperarbeit/preise`}><p>Was eine Sitzung kostet.</p></Karte>
            <Karte titel="Kontakt" link={`/${locale}/koerperarbeit/kontakt`}><p>Fragen und Termine.</p></Karte>
          </div>
        </Abschnitt>
        <Abschnitt titel="Teil von BtMM">
          <p>Back to Balance gehört zu BtMM, einer geplanten Genossenschaft in Freiburg, die teilt, was allein teuer ist. <a href={href(locale, 'start')}>Mehr über BtMM</a>.</p>
        </Abschnitt>
        <WeiterLinks locale={locale} seiten={['start', 'soFunktionierts', 'mitmachen']} />
      </div>
    </SeitenRahmen>
  )
}
