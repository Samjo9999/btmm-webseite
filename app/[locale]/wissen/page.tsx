/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { SeitenKopf, Abschnitt, Karte, Offen, Rechnung, Knopf, WeiterLinks, JsonLd, SeitenRahmen, Marke } from '@/components/btmm/Bausteine'
import { seitenMeta, breadcrumbLd, absUrl, href, ORGANISATION_LD, KONTAKT_MAIL, SEITEN } from '@/lib/seiten'

import { RATGEBER } from '@/lib/inhalte/wissen'
type P = { params: { locale: string } }
export function generateMetadata({ params }: P): Metadata { return seitenMeta('wissen', params.locale) }

export default function Seite({ params: { locale } }: P) {
  setRequestLocale(locale)
  return (
    <SeitenRahmen>
      <JsonLd daten={[ORGANISATION_LD, breadcrumbLd(['start', 'wissen'], locale),
        { '@type': 'CollectionPage', name: SEITEN.wissen.titel, url: absUrl('wissen', locale),
          hasPart: RATGEBER.filter((r) => r.status === 'online').map((r) => ({ '@type': 'WebPage', name: r.titel, url: `${absUrl('wissen', locale)}/${r.slug}` })) }]} />
      <SeitenKopf titel="Wissen" unterzeile="Ratgeber rund um Genossenschaft, Teilen und Gemeinschaft. Der Bereich wächst."
        bild="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80" bildAlt="Berge im Morgenlicht" />
      <div className="btmm-inhalt">
        <Abschnitt>
          <div className="btmm-raster">
            {RATGEBER.map((r) => (
              <Karte key={r.slug} titel={r.titel} link={r.status === 'online' ? `/${locale}/wissen/${r.slug}` : undefined}>
                <p>{r.status === 'geplant' && <Marke art="geplant" />} {r.kurz}</p>
              </Karte>
            ))}
          </div>
        </Abschnitt>
        <WeiterLinks locale={locale} seiten={['soFunktionierts', 'mitmachen']} />
      </div>
    </SeitenRahmen>
  )
}
