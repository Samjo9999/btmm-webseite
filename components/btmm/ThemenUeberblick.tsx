import { NeueInhalteStil } from '@/components/btmm/NeueInhalteStil'
import { Abschnitt, Karte } from '@/components/btmm/Bausteine'
import { VERTIEFUNGEN } from '@/lib/inhalte/vertiefungen'

export function ThemenUeberblick({ locale }: { locale: string }) {
  return <div className="btmm-ergaenzung"><NeueInhalteStil /><Abschnitt titel="Neu: Was das im Alltag bedeutet">
    <p>Die wichtigsten ergänzenden Gedanken aus den aktuellen Dokumenten – kurz erklärt und als Entwurf eingeordnet.</p>
    <div className="btmm-raster">
      <Karte titel="Geldfluss auf einen Blick" link={`/${locale}/geldfluss`}><p>Wie aus Einnahmen Grundlohn, Rücklagen, Bonus und gemeinsame Zukunft werden – mit Prozenten und kurzen Erklärungen.</p></Karte>
      {VERTIEFUNGEN.map(a => <Karte key={a.slug} titel={a.titel} link={`/${locale}/wissen/${a.slug}`}><p>{a.kurz}</p></Karte>)}
    </div>
  </Abschnitt></div>
}
