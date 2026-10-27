/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { SeitenKopf, Abschnitt, Karte, Offen, Rechnung, Knopf, WeiterLinks, JsonLd, SeitenRahmen, Marke } from '@/components/btmm/Bausteine'
import { seitenMeta, breadcrumbLd, absUrl, href, ORGANISATION_LD, KONTAKT_MAIL, SEITEN } from '@/lib/seiten'

import { FAQ } from '@/lib/inhalte/faq'
type P = { params: { locale: string } }
export function generateMetadata({ params }: P): Metadata { return seitenMeta('faq', params.locale) }

export default function Seite({ params: { locale } }: P) {
  setRequestLocale(locale)
  return (
    <SeitenRahmen>
      <JsonLd daten={[ORGANISATION_LD, breadcrumbLd(['start', 'faq'], locale),
        { '@type': 'FAQPage', url: absUrl('faq', locale),
          mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.frage, acceptedAnswer: { '@type': 'Answer', text: f.antwort } })) }]} />
      <SeitenKopf titel="Häufige Fragen" unterzeile="Kurze Antworten – und ehrlich, wo etwas noch offen ist."
        bild="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80" bildAlt="Grüne Hügellandschaft" />
      <div className="btmm-inhalt">
        <Abschnitt>
          <div className="btmm-faq">
            {FAQ.map((f) => (
              <details key={f.frage}>
                <summary>{f.frage}</summary>
                <p>{f.antwort}</p>
              </details>
            ))}
          </div>
        </Abschnitt>
        <WeiterLinks locale={locale} seiten={['offeneFragen', 'kosten', 'glossar', 'mitmachen']} />
      </div>
    </SeitenRahmen>
  )
}
