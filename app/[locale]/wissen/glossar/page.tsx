/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { SeitenKopf, Abschnitt, Karte, Offen, Rechnung, Knopf, WeiterLinks, JsonLd, SeitenRahmen, Marke } from '@/components/btmm/Bausteine'
import { seitenMeta, breadcrumbLd, absUrl, href, ORGANISATION_LD, KONTAKT_MAIL, SEITEN } from '@/lib/seiten'

import { GLOSSAR } from '@/lib/inhalte/glossar'
type P = { params: { locale: string } }
export function generateMetadata({ params }: P): Metadata { return seitenMeta('glossar', params.locale) }

export default function Seite({ params: { locale } }: P) {
  setRequestLocale(locale)
  return (
    <SeitenRahmen>
      <JsonLd daten={[ORGANISATION_LD, breadcrumbLd(['start', 'wissen', 'glossar'], locale),
        { '@type': 'DefinedTermSet', name: 'BtMM-Glossar', url: absUrl('glossar', locale),
          hasDefinedTerm: GLOSSAR.map((b) => ({ '@type': 'DefinedTerm', name: b.begriff, description: b.erklaerung })) }]} />
      <SeitenKopf titel="Glossar" unterzeile="Die wichtigsten Begriffe von BtMM, nach der Satzung v7.32.0 (Entwurf, rechtlich noch nicht geprüft)." />
      <div className="btmm-inhalt">
        <Abschnitt>
          <dl className="btmm-raster">
            {GLOSSAR.map((b) => (
              <div key={b.begriff} className="btmm-karte" id={b.begriff.toLowerCase().replace(/[^a-z0-9äöü]+/g, '-')}>
                <dt><h3>{b.begriff}</h3></dt>
                <dd><p>{b.erklaerung}</p><p style={{ fontSize: '0.95rem', opacity: 0.7, marginTop: '.4rem' }}>Quelle: {b.quelle}</p></dd>
              </div>
            ))}
          </dl>
        </Abschnitt>
        <WeiterLinks locale={locale} seiten={['soFunktionierts', 'faq', 'mitmachen']} />
      </div>
    </SeitenRahmen>
  )
}
