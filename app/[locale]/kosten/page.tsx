/* eslint-disable @typescript-eslint/no-unused-vars */
// BTMM-ADD-KOSTEN-IMPORT-START
import { AktuellerDokumentenstand } from '@/components/btmm/AktuellerDokumentenstand'
// BTMM-ADD-KOSTEN-IMPORT-END
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
        bild="/images/kosten-feld.jpg" bildAlt="Weites Feld im Licht" />
      <div className="btmm-inhalt">
{/* BTMM-ADD-KOSTEN-STAND-START */}
<AktuellerDokumentenstand locale={locale} thema="kosten" />
{/* BTMM-ADD-KOSTEN-STAND-END */}
        <Abschnitt titel="Am Anfang">
          <div className="btmm-raster">
            <Karte titel="Kein Investment"><p>In den ersten beiden Stufen zahlst du nichts ein.</p></Karte>
            <Karte titel="Nur was du nutzt"><p>Du zahlst deinen Teil vom gemeinsamen Einkauf, also das, was du selbst nutzt.</p></Karte>
          </div>
        </Abschnitt>
        <Abschnitt titel="Was kostet ein Genossenschaftsanteil?">
          <div className="btmm-raster">
            <Karte titel="Anteil"><div className="btmm-zahl">100 €</div><p>erst nach Gründung der geplanten eG, auf Wunsch in monatlichen Raten von mindestens 10 € (Satzung § 2 Abs. 1, Entwurf)</p></Karte>
            <Karte titel="Beitrag"><p>Ein kleiner Beitrag, nur wenn du die gemeinsamen Dinge nutzt. Er darf nie höher sein als das, was du sparst.</p></Karte>
            <Karte titel="Gründungskosten"><p>Nach heutigem Plan privat vorfinanziert.</p></Karte>
          </div>
          <Offen>Nach dem Satzungsentwurf kannst du die Mitgliedschaft in Textform mit einer Frist von einem Jahr zum Schluss eines Geschäftsjahres kündigen (Satzung § 6 Abs. 1). Das Geschäftsguthaben wird nach dem Ausscheiden nach § 73 GenG in Euro ausgezahlt (Satzung § 6 Abs. 4). Maßgeblich ist die Bilanz zum Ausscheiden; bei Verlusten kann das Guthaben unter dem eingezahlten Betrag liegen. Das ist ein Entwurf, noch nicht beschlossen, und kann sich ändern. BtMM ist noch nicht gegründet, eine Mitgliedschaft ist derzeit nicht möglich.</Offen>
        </Abschnitt>
        <WeiterLinks locale={locale} seiten={['wasDuSparst', 'offeneFragen', 'faq', 'mitmachen']} />
      </div>
    </SeitenRahmen>
  )
}
