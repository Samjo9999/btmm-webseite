/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { SeitenKopf, Abschnitt, Karte, Offen, Rechnung, Knopf, WeiterLinks, JsonLd, SeitenRahmen, Marke } from '@/components/btmm/Bausteine'
import { seitenMeta, breadcrumbLd, absUrl, href, ORGANISATION_LD, KONTAKT_MAIL, SEITEN } from '@/lib/seiten'

type P = { params: { locale: string } }
export function generateMetadata({ params }: P): Metadata { return seitenMeta('kosten', params.locale) }

export default function Seite({ params: { locale } }: P) {
  setRequestLocale(locale)
  return (
    <SeitenRahmen>
      <JsonLd daten={[ORGANISATION_LD, breadcrumbLd(['start', 'kosten'], locale),
        { '@type': 'WebPage', name: SEITEN.kosten.titel, url: absUrl('kosten', locale), description: SEITEN.kosten.beschreibung }]} />
      <SeitenKopf titel="Was kostet es dich – und was nicht?" unterzeile="Kein Investment, keine Vorkasse. Der Anteil kommt erst mit der Genossenschaft."
        bild="https://images.unsplash.com/photo-1526304640581-d334cdbbf35f?w=1920&q=80" bildAlt="Münzen und Pflanze" />
      <div className="btmm-inhalt">
        <Abschnitt titel="Am Anfang">
          <div className="btmm-raster">
            <Karte titel="Kein Investment"><p>In den ersten beiden Stufen zahlst du nichts ein.</p></Karte>
            <Karte titel="Nur was du nutzt"><p>Du zahlst deinen Teil vom gemeinsamen Einkauf, also das, was du selbst nutzt.</p></Karte>
          </div>
        </Abschnitt>
        <Abschnitt titel="Was kostet ein Genossenschaftsanteil?">
          <div className="btmm-raster">
            <Karte titel="Anteil"><div className="btmm-zahl">100 €</div><p>erst ab Gründung der eG, auf Wunsch in Raten ab 10 € im Monat (Satzung § 6)</p></Karte>
            <Karte titel="Beitrag"><p>Ein kleiner Beitrag, nur wenn du die gemeinsamen Dinge nutzt. Er darf nie höher sein als das, was du sparst.</p></Karte>
            <Karte titel="Gründungskosten"><p>Nach heutigem Plan privat vorfinanziert.</p></Karte>
          </div>
          <Offen>Der Anteil soll nach fünf Jahren Kündigungsfrist zurückgezahlt werden. Ob das so zulässig ist, klären wir noch mit Fachleuten.</Offen>
        </Abschnitt>
        <WeiterLinks locale={locale} seiten={['wasDuSparst', 'offeneFragen', 'faq', 'mitmachen']} />
      </div>
    </SeitenRahmen>
  )
}
