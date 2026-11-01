import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { SeitenKopf, SeitenRahmen, WeiterLinks } from '@/components/btmm/Bausteine'
import { GeldflussDiagramm } from '@/components/btmm/GeldflussDiagramm'
import { NeueInhalteStil } from '@/components/btmm/NeueInhalteStil'
import { SITE_URL } from '@/lib/seiten'

type P = { params: { locale: string } }
export function generateMetadata({ params }: P): Metadata {
  return { title: 'Geldfluss – Prozentzahlen einfach erklärt | BtMM', description: 'Vom Umsatz zu Grundlohn, Rücklagen, Bonus und gemeinsamer Zukunft: der BtMM-Geldfluss als übersichtliches Diagramm mit Prozenten und Beispielrechnung.', alternates: { canonical: `${SITE_URL}/${params.locale}/geldfluss` } }
}
export default function GeldflussSeite({ params: { locale } }: P) {
  setRequestLocale(locale)
  return <SeitenRahmen><div className="btmm-ergaenzung">
    <NeueInhalteStil />
    <SeitenKopf titel="Der BtMM-Geldfluss" unterzeile="Wohin fließt das Geld? Die wichtigsten Schritte, Prozente und Töpfe auf einen Blick." />
    <div className="btmm-inhalt">
      <GeldflussDiagramm />
      <WeiterLinks locale={locale} seiten={['wissen', 'soFunktionierts', 'wasDuSparst', 'kosten', 'mitmachen']} />
    </div>
  </div></SeitenRahmen>
}
