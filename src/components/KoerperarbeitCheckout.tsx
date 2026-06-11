
import { Link as RouterLink } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'

interface Props {
  produktSlug: string
  label: string
  preis: string
}

export function KoerperarbeitCheckout({ produktSlug, label, preis }: Props) {
  return (
    <RouterLink  to="/koerperarbeit/preise" className="btn-primary"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
      <CalendarDays size={16} />
      {`${label} — ${preis}`}
    </RouterLink>
  )
}
