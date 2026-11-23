/**
 * FAQ „Wie wird Arbeit bezahlt?“ (PR #38), weit oben auf /faq und auf /fuer-dich/berufseinstieg.
 * Text laut BtMM-Bot aus Konzept 07 v22.68.0 / 06 v1.10.2, siehe lib/inhalte/tuer-luecken.ts.
 */
import { lueckenTexte } from '@/lib/inhalte/tuer-luecken'

export function FaqLohn({ locale }: { locale: string }) {
  const { lohn } = lueckenTexte(locale)
  return (
    <div className="btmm-faq" id="arbeit-bezahlt">
      <details open>
        <summary>{lohn.frage}</summary>
        <p>{lohn.antwort}</p>
      </details>
    </div>
  )
}
