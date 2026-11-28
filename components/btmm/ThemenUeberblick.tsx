import { NeueInhalteStil } from '@/components/btmm/NeueInhalteStil'
import { Abschnitt, Karte } from '@/components/btmm/Bausteine'
import { VERTIEFUNGEN } from '@/lib/inhalte/vertiefungen'

// Reihenfolge wie VERTIEFUNGEN; Fotos aus data/bildnachweise.json.
const FOTOS = ['gruenden', 'sinn', 'arbeiten', 'anpacken', 'wohnen', 'folgen'].map(n => `/tuer/bilder/weg/${n}.webp`)

export function ThemenUeberblick({ locale }: { locale: string }) {
  return <div className="btmm-ergaenzung"><NeueInhalteStil /><Abschnitt titel="Was das im Alltag bedeutet">
    <p>Die wichtigsten ergänzenden Gedanken aus den aktuellen Dokumenten – kurz erklärt und als Entwurf eingeordnet.</p>
    <div className="btmm-raster">
      <Karte titel="Geldfluss auf einen Blick" link={`/${locale}/geldfluss`} bild="/tuer/bilder/weg/dokumente.webp"><p>Wie aus Einnahmen Grundlohn, Rücklagen, Bonus und gemeinsame Zukunft werden – mit Prozenten und kurzen Erklärungen.</p></Karte>
      {VERTIEFUNGEN.map((a, i) => <Karte key={a.slug} titel={a.titel} link={`/${locale}/wissen/${a.slug}`} bild={FOTOS[i % FOTOS.length]}><p>{a.kurz}</p></Karte>)}
    </div>
  </Abschnitt></div>
}
