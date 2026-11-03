/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { SeitenKopf, Abschnitt, Karte, Offen, Rechnung, Knopf, WeiterLinks, JsonLd, SeitenRahmen, Marke } from '@/components/btmm/Bausteine'
import { seitenMeta, breadcrumbLd, absUrl, href, ORGANISATION_LD, KONTAKT_MAIL, SEITEN } from '@/lib/seiten'

type P = { params: { locale: string } }
export function generateMetadata({ params }: P): Metadata { return seitenMeta('wasDuSparst', params.locale) }

// Zahlen: ANGEBOT.md (26.10.2026), Rechner 09 v2.13.0, realistisches Szenario
const BEISPIELE = [
  { leute: '3 Leute', betrag: 'rund 240 €', text: 'gemeinsam einkaufen, Auto, Raum und Werkzeug teilen' },
  { leute: '5 Leute', betrag: 'rund 290 €', text: 'gleiches Teilen, mehr Köpfe' },
  { leute: '20 Leute', betrag: 'rund 350 €', text: 'nach allen Beiträgen' },
  { leute: '100 Leute', betrag: 'rund 490 €', text: 'nach allen Beiträgen' },
]

export default function Seite({ params: { locale } }: P) {
  setRequestLocale(locale)
  return (
    <SeitenRahmen>
      <JsonLd daten={[ORGANISATION_LD, breadcrumbLd(['start', 'wasDuSparst'], locale),
        { '@type': 'WebPage', name: SEITEN.wasDuSparst.titel, url: absUrl('wasDuSparst', locale), description: SEITEN.wasDuSparst.beschreibung }]} />
      <SeitenKopf titel="Was du sparst" unterzeile="Lohnt sich gemeinsames Einkaufen und Autoteilen? Rechenbeispiele – ehrlich als Rechnung gekennzeichnet."
        bild="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80" bildAlt="Menschen gemeinsam draußen" />
      <div className="btmm-inhalt">
        <Abschnitt titel="Mehr Geld im Monat, laut Rechnung">
          <div className="btmm-raster">
            {BEISPIELE.map((b) => (
              <Karte key={b.leute} titel={b.leute}>
                <div className="btmm-zahl">{b.betrag}</div>
                <p>mehr pro Person im Monat – {b.text}</p>
              </Karte>
            ))}
          </div>
          <Rechnung />
        </Abschnitt>
        <Abschnitt titel="Mehr freie Zeit">
          <p>Wer weniger ausgibt, muss weniger arbeiten. Bei 20 Leuten sind das laut Rechnung rund <strong>29 Stunden weniger im Monat</strong>.</p>
        </Abschnitt>
        <Abschnitt titel="Wovon hängt es ab?">
          <ul>
            <li>Von deinen eigenen Ausgaben: Wer wenig für Auto oder Werkzeug ausgibt, spart dort auch weniger.</li>
            <li>Vom Beitrag: Er fällt erst mit der eG an, nur wenn du die gemeinsamen Dinge nutzt, und darf nie höher sein als das, was du sparst.</li>
            <li>Echte Erfahrungen haben wir noch nicht. Die Zahlen sind Rechnungen.</li>
          </ul>
        </Abschnitt>
        <WeiterLinks locale={locale} seiten={['kosten', 'soFunktionierts', 'offeneFragen', 'mitmachen']} />
      </div>
    </SeitenRahmen>
  )
}
