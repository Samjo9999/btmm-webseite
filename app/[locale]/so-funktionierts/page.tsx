/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { SeitenKopf, Abschnitt, Karte, Offen, Rechnung, Knopf, WeiterLinks, JsonLd, SeitenRahmen, Marke } from '@/components/btmm/Bausteine'
import { seitenMeta, breadcrumbLd, absUrl, href, ORGANISATION_LD, KONTAKT_MAIL, SEITEN } from '@/lib/seiten'

type P = { params: { locale: string } }
export function generateMetadata({ params }: P): Metadata { return seitenMeta('soFunktionierts', params.locale) }

const STUFEN = [
  { name: 'Klein anfangen, ab 3 Leuten', text: 'Jede:r bleibt selbstständig und schreibt eigene Rechnungen. Wir arbeiten zusammen, aber niemand ist angestellt.' },
  { name: 'Gemeinsam einkaufen und teilen', text: 'Wir kaufen zusammen ein und teilen Auto, Raum und Werkzeug. Hilfe tauschen wir in Stunden, notiert auf einer einfachen Liste. Jede:r kauft auf eigene Rechnung; eine gemeinsame Kasse gibt es nicht.' },
  { name: 'Gründen, sobald es geht', text: 'Wenn es trägt, gründen wir die Genossenschaft, also einen gemeinsamen Betrieb, der allen gehört. Vorher lassen wir uns kostenlos von Fachleuten beraten.' },
]

export default function Seite({ params: { locale } }: P) {
  setRequestLocale(locale)
  return (
    <SeitenRahmen>
      <JsonLd daten={[
        ORGANISATION_LD,
        breadcrumbLd(['start', 'soFunktionierts'], locale),
        { '@type': 'HowTo', name: 'Wie gründet man eine kleine Genossenschaft? Der BtMM-Weg in drei Stufen', url: absUrl('soFunktionierts', locale),
          step: STUFEN.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })) },
      ]} />
      <SeitenKopf titel="So funktioniert's" unterzeile="In drei Stufen von drei Leuten zur Genossenschaft – klein anfangen, teilen, gründen."
        bild="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80" bildAlt="Weites Feld im Licht" />
      <div className="btmm-inhalt">
        <Abschnitt titel="Wie gründet man eine kleine Genossenschaft?">
          <p>Wir fangen nicht mit einer Gründung an, sondern mit dem Teilen. Erst wenn es im Alltag trägt, kommt die eingetragene Genossenschaft (eG).</p>
        </Abschnitt>
        <Abschnitt titel="Die drei Stufen">
          <div className="btmm-raster">
            {STUFEN.map((s, i) => (
              <Karte key={s.name} titel={`${i + 1}. ${s.name}`}><p>{s.text}</p></Karte>
            ))}
          </div>
        </Abschnitt>
        <Abschnitt titel="Was ist das Ziel?">
          <p>Später wollen wir gemeinsame Betriebe und Häuser, die nie verkauft werden. Das Ergebnis eines Betriebs wird nach einer festen Reihenfolge verteilt, der Kaskade (Satzung § 11): zuerst Rücklage, dann gleicher Grundlohn, dann der Überschuss für Bonus, Eigentum und Soziales/Öko.</p>
          <Offen>Wie wir am Anfang zusammenarbeiten, ohne aus Versehen gemeinsam für Schulden zu haften, klären wir mit Fachleuten, bevor wir mehr Leute aufnehmen. Die Satzung (v7.32.0) ist noch nicht rechtlich geprüft.</Offen>
        </Abschnitt>
        <p style={{ marginTop: '2rem' }}><Knopf link={href(locale, 'mitmachen')}>Mitmachen</Knopf></p>
        <WeiterLinks locale={locale} seiten={['wasDuSparst', 'kosten', 'offeneFragen', 'glossar']} />
      </div>
    </SeitenRahmen>
  )
}
