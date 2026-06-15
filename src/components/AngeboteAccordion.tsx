
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ChevronDown, MapPin, Euro, ArrowRight, Star } from 'lucide-react'

interface ServiceData {
  id: string
  name: string
  duration_min: number
  price: number | null
  first_session_price: number | null
  bundle_size: number | null
  bundle_price: number | null
  bundle_label: string | null
  show_on_website: boolean
  website_description: string | null
  website_details: string[] | null
  website_sort_order: number
  is_featured: boolean
  category: string | null
  location: string | null
  promotion_active?: boolean
}

interface Angebot {
  id: string
  titel: string
  beschreibung: string
  details: string[]
  ort: string
  kategorie: string
  preis: string
  link: string
  verfuegbar: boolean
  hasPromotion: boolean
}

const BASE_COMPANY_ID = '396ad7a6-e4d1-4c7d-abc1-ef9f2c4c2da9'
const SERVICES_API_BASE = 'https://xcngmshjuqoucdlgikao.supabase.co/functions/v1/public-booking/services'

const FALLBACK_ANGEBOTE: Angebot[] = [
  {
    id: 'koerperarbeit-freiburg',
    titel: 'Back to Meaning Maximization Körperarbeit - 79102 Freiburg D',
    beschreibung: 'Tiefgreifende Wellnessmethode für den gesamten Bewegungsapparat. Sanfte Schwingungen bewirken einen Reset auf allen Gelenkebenen.',
    details: [
      'Besonders wohltuend bei Rückenbeschwerden, Verspannungen und Kopfschmerzen',
      'Ideal zur Geburtsvorbereitung und postnatalen Regeneration',
      'Ganzheitlicher Ansatz: Körper, Geist und Nervensystem',
      'Einzelsitzungen und Pakete verfügbar',
    ],
    ort: 'Freiburg',
    kategorie: 'Körperarbeit',
    preis: 'ab 70 €',
    link: '/koerperarbeit',
    verfuegbar: true,
    hasPromotion: false,
  },
]

function servicesToAngebote(services: ServiceData[], vatEnabled: boolean, vatRate: number): Angebot[] {
  // Group services by category + location
  const groups = new Map<string, ServiceData[]>()
  for (const s of services) {
    const key = `${s.category || 'Sonstiges'}-${s.location || 'Unbekannt'}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s)
  }

  return Array.from(groups.entries()).map(([key, groupServices]) => {
    const first = groupServices[0]
    const category = first.category || 'Sonstiges'
    const location = first.location || ''

    // Calculate "ab X €" from minimum price across group
    const allPrices = groupServices.flatMap(s => {
      const candidates = [s.price, s.first_session_price].filter((p): p is number => p !== null && p > 0)
      return candidates
    })
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : null

    // Collect website_details from all services, or use descriptions
    const details = groupServices.flatMap(s => s.website_details ?? [])
    const beschreibung = groupServices
      .map(s => s.website_description)
      .filter((d): d is string => !!d)
      .join(' ')
      || `${category} in ${location}`

    const hasPromotion = groupServices.some(s => s.promotion_active === true)

    return {
      id: key,
      titel: `Back to Meaning Maximization ${category} - ${location}`,
      beschreibung,
      details: details.length > 0 ? details : [
        'Einzelsitzungen und Pakete verfügbar',
      ],
      ort: location,
      kategorie: category,
      preis: minPrice ? formatPrice(minPrice, vatEnabled, vatRate, true) : 'Preis auf Anfrage',
      link: '/koerperarbeit',
      verfuegbar: true,
      hasPromotion,
    }
  })
}

const pulseKeyframes = `
@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
`

function formatPrice(base: number, vatEnabled: boolean, vatRate: number, isRange: boolean = false): string {
  const prefix = isRange ? 'ab ' : ''
  if (vatEnabled) {
    const brutto = base * (1 + vatRate / 100)
    return `${prefix}${brutto.toFixed(0)} € (Brutto)`
  }
  return `${prefix}${base.toFixed(0)} € (Netto, § 19 UStG)`
}

interface AngeboteAccordionProps {
  domain?: string; // 'b-t-m-m.com' (default) or 'b-t-m-m.com'
}

export function AngeboteAccordion({ domain = 'b-t-m-m.com' }: AngeboteAccordionProps = {}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [angebote, setAngebote] = useState<Angebot[]>(FALLBACK_ANGEBOTE)
  const [vatEnabled, setVatEnabled] = useState(false)
  const [vatRate, setVatRate] = useState(19)

  useEffect(() => {
    const apiUrl = `${SERVICES_API_BASE}?company_id=${BASE_COMPANY_ID}&domain=${domain}`
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        const visible = (data.services ?? [])
          .filter((s: ServiceData) => s.show_on_website)
          .sort((a: ServiceData, b: ServiceData) => (a.website_sort_order ?? 0) - (b.website_sort_order ?? 0))

        setVatEnabled(data.vat_enabled ?? false)
        setVatRate(data.vat_rate ?? 19)

        if (visible.length > 0) {
          setAngebote(servicesToAngebote(visible, data.vat_enabled ?? false, data.vat_rate ?? 19))
        } else {
          setAngebote([]) // No services enabled — show nothing
        }
      })
      .catch(() => {
        // Keep fallback on error
      })
  }, [domain])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <style dangerouslySetInnerHTML={{ __html: pulseKeyframes }} />
      <p style={{
        textAlign: 'center',
        marginBottom: '2rem',
        opacity: 0.7,
        fontSize: '1rem',
      }}>
        Weitere Angebote wachsen mit jedem neuen Mitglied und jeder Fähigkeit im System.
      </p>

      {angebote.map((angebot) => {
        const isOpen = openId === angebot.id
        return (
          <div
            key={angebot.id}
            style={{
              borderRadius: 12,
              border: `2px solid ${isOpen ? 'var(--btb-oliv)' : 'rgba(143,169,66,0.3)'}`,
              background: isOpen ? 'var(--btb-weiss)' : 'rgba(255,255,255,0.5)',
              overflow: 'hidden',
              transition: 'border-color 0.3s, background 0.3s',
            }}
          >
            {/* Header — always visible */}
            <button
              onClick={() => setOpenId(isOpen ? null : angebot.id)}
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--btb-weiss)',
                    background: 'var(--btb-oliv)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 4,
                  }}>
                    {angebot.kategorie}
                  </span>
                  {angebot.verfuegbar && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--btb-oliv)', fontWeight: 600 }}>
                      Verfügbar
                    </span>
                  )}
                  {angebot.hasPromotion && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'white',
                      background: '#b61818',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 4,
                      animation: 'pulse-badge 2s ease-in-out infinite',
                    }}>
                      AKTION
                    </span>
                  )}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-garamond)',
                  fontSize: '1.3rem',
                  color: 'var(--btb-dunkel)',
                  margin: 0,
                }}>
                  {angebot.titel}
                </h3>
              </div>
              <ChevronDown
                size={22}
                style={{
                  color: 'var(--btb-oliv)',
                  flexShrink: 0,
                  transition: 'transform 0.3s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                }}
              />
            </button>

            {/* Expandable content */}
            <div style={{
              maxHeight: isOpen ? '600px' : '0',
              opacity: isOpen ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.4s ease, opacity 0.3s ease',
            }}>
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <p style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  opacity: 0.8,
                  marginBottom: '1rem',
                }}>
                  {angebot.beschreibung}
                </p>

                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  {angebot.details.map((detail, i) => (
                    <li key={i} style={{
                      fontSize: '0.9rem',
                      color: 'var(--btb-dunkel)',
                      opacity: 0.75,
                      paddingLeft: '1.25rem',
                      position: 'relative',
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        color: 'var(--btb-oliv)',
                      }}>
                        ✓
                      </span>
                      {detail}
                    </li>
                  ))}
                </ul>

                <div style={{
                  display: 'flex',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  fontSize: '0.9rem',
                  marginBottom: '1.25rem',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--btb-oliv)' }}>
                    <MapPin size={16} /> {angebot.ort}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--btb-blau)' }}>
                    <Euro size={16} /> {angebot.preis}
                  </span>
                  <RouterLink 
                    to={`${angebot.link}/bewertungen`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--btb-oliv)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Star size={16} /> Erfahrungen
                  </RouterLink>
                </div>

                <RouterLink 
                  to={angebot.link}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--btb-blau)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Mehr erfahren <ArrowRight size={16} />
                </RouterLink>
              </div>
            </div>
          </div>
        )
      })}

      {/* Hinweis */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1.25rem 1.5rem',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.5)',
        border: '1px dashed var(--btb-oliv)',
        textAlign: 'center',
        opacity: 0.8,
      }}>
        <p style={{ fontSize: '0.95rem', color: 'var(--btb-dunkel)' }}>
          Weitere Angebote sind in Planung. Je mehr Berufe und Fähigkeiten im System vertreten sind, desto breiter wird das Sortiment.
        </p>
        <RouterLink  to="/mitmachen" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '0.75rem',
          color: 'var(--btb-oliv)',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}>
          Mitmachen <ArrowRight size={14} />
        </RouterLink>
      </div>
    </div>
  )
}
