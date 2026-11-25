/* eslint-disable @typescript-eslint/no-unused-vars */
// BTMM-ADD-OFFENE-FRAGEN-IMPORT-START
import { AktuellerDokumentenstand } from '@/components/btmm/AktuellerDokumentenstand'
// BTMM-ADD-OFFENE-FRAGEN-IMPORT-END
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { SeitenKopf, Abschnitt, Karte, Offen, Rechnung, Knopf, WeiterLinks, JsonLd, SeitenRahmen, Marke } from '@/components/btmm/Bausteine'
import { seitenMeta, breadcrumbLd, absUrl, href, ORGANISATION_LD, KONTAKT_MAIL, SEITEN } from '@/lib/seiten'

type P = { params: { locale: string } }
export function generateMetadata({ params }: P): Metadata { return seitenMeta('offeneFragen', params.locale) }

const OFFEN = [
  { titel: 'Haftung am Anfang', text: 'Wie wir am Anfang zusammenarbeiten können, ohne aus Versehen gemeinsam für Schulden zu haften. Das klären wir mit Fachleuten, bevor wir mehr Leute aufnehmen.' },
  { titel: 'Kündigung und Auszahlung', text: 'Nach dem Satzungsentwurf kannst du die Mitgliedschaft in Textform mit einer Frist von einem Jahr zum Schluss eines Geschäftsjahres kündigen (Satzung § 6 Abs. 1). Das Geschäftsguthaben wird nach dem Ausscheiden nach § 73 GenG in Euro ausgezahlt (Satzung § 6 Abs. 4). Maßgeblich ist die Bilanz zum Ausscheiden; bei Verlusten kann das Guthaben unter dem eingezahlten Betrag liegen. Das ist ein Entwurf, noch nicht beschlossen, und kann sich ändern. BtMM ist noch nicht gegründet, eine Mitgliedschaft ist derzeit nicht möglich.' },
  { titel: 'Rente', text: 'Mit dem geplanten Lohn reicht die gesetzliche Rente allein nicht. Wir arbeiten an einer Lösung, versprechen aber keine Rente.' },
  { titel: 'Lohn am Anfang', text: 'In einem gemeinsamen Betrieb mit wenigen Leuten liegt der Lohn erst knapp über dem Mindestlohn.' },
  { titel: 'Satzung', text: 'Die Satzung der geplanten BtMM eG (Entwurf v9.1.4, Stand 24. November 2026) ist noch nicht beschlossen und kann sich ändern. Verbindlich wird nur die beschlossene Satzung. BtMM ist noch nicht gegründet, eine Mitgliedschaft ist derzeit nicht möglich.' },
  { titel: 'Zahlen', text: 'Alle Zahlen sind Rechnungen. Echte Erfahrungen haben wir noch nicht.' },
]

export default function Seite({ params: { locale } }: P) {
  setRequestLocale(locale)
  return (
    <SeitenRahmen>
      <JsonLd daten={[ORGANISATION_LD, breadcrumbLd(['start', 'offeneFragen'], locale),
        { '@type': 'WebPage', name: SEITEN.offeneFragen.titel, url: absUrl('offeneFragen', locale), description: SEITEN.offeneFragen.beschreibung }]} />
      <SeitenKopf titel="Was noch offen ist" unterzeile="Wir sagen ehrlich, was noch nicht geklärt ist. Das klären wir mit Fachleuten, bevor mehr Menschen dazukommen."
        bild="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80" bildAlt="Lichtung im Wald" />
      <div className="btmm-inhalt">
{/* BTMM-ADD-OFFENE-FRAGEN-STAND-START */}
<AktuellerDokumentenstand locale={locale} thema="grundlagen" />
{/* BTMM-ADD-OFFENE-FRAGEN-STAND-END */}
        <Abschnitt>
          <div className="btmm-raster">
            {OFFEN.map((o) => (
              <Karte key={o.titel} titel={o.titel}><p><Marke art="offen" /> {o.text}</p></Karte>
            ))}
          </div>
        </Abschnitt>
        <Abschnitt titel="Was heißt das für dich?">
          <p>Nichts auf dieser Webseite ist eine Rechts-, Steuer- oder Finanzberatung. Wenn sich etwas klärt, schreiben wir es hier dazu.</p>
        </Abschnitt>
        <WeiterLinks locale={locale} seiten={['faq', 'kosten', 'soFunktionierts', 'mitmachen']} />
      </div>
    </SeitenRahmen>
  )
}
