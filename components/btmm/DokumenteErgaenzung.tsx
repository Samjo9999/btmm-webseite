import { getLocale } from 'next-intl/server'
import { ThemenUeberblick } from '@/components/btmm/ThemenUeberblick'
import { GeldflussDiagramm } from '@/components/btmm/GeldflussDiagramm'
import { AktuellerDokumentenstand } from '@/components/btmm/AktuellerDokumentenstand'
import { NeueInhalteStil } from '@/components/btmm/NeueInhalteStil'

export async function DokumenteErgaenzung() {
  const locale = await getLocale()
  return <div className="btmm-ergaenzung">
    <NeueInhalteStil />
    <AktuellerDokumentenstand locale={locale} />
    <GeldflussDiagramm />
    <p><a href={`/${locale}/geldfluss`}>Diagramm als eigene Seite öffnen →</a></p>
    <ThemenUeberblick locale={locale} />
  </div>
}
