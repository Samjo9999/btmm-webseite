
import { useState, useEffect } from 'react'
// import Image (use <img>) 
import { Link as RouterLink } from 'react-router-dom'
import { Clock, Euro, Star, Mail, Phone } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { NextAvailabilityFloat } from '@/components/NextAvailabilityFloat'
import contactData from '@/data/contact.json'
import prices from '@/data/prices.json'

const SERVICES_API = `https://xcngmshjuqoucdlgikao.supabase.co/functions/v1/public-booking/services?company_id=${contactData.company_id ?? '396ad7a6-e4d1-4c7d-abc1-ef9f2c4c2da9'}`

interface BundlePosition {
  position_number: number
  name: string
  price: number
  is_first_session: boolean
}

interface ServiceBundle {
  id: string
  size: number
  price: number
  label?: string
  description?: string
  positions?: BundlePosition[]
}

interface ServiceData {
  id: string
  name: string
  duration_min: number
  price: number | null
  first_session_price: number | null
  bundle_size: number | null
  bundle_price: number | null
  bundle_label: string | null
  bundles?: ServiceBundle[]
  show_on_website: boolean
  website_description: string | null
  website_details: string[] | null
  website_sort_order: number
  is_featured: boolean
  category: string | null
  location: string | null
  promotion_active?: boolean
  promotion_price?: number | null
  promotion_label?: string | null
  promotion_description?: string | null
  promotion_ends_at?: string | null
}

export default function PreisePage() {
  const [services, setServices] = useState<ServiceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [vatEnabled, setVatEnabled] = useState(false)
  const [vatRate, setVatRate] = useState(19)

  useEffect(() => {
    fetch(SERVICES_API)
      .then(res => res.json())
      .then(data => {
        const visible = (data.services ?? [])
          .filter((s: ServiceData) => s.show_on_website)
          .sort((a: ServiceData, b: ServiceData) => (a.website_sort_order ?? 0) - (b.website_sort_order ?? 0))
        setServices(visible)
        if (data.vat_enabled !== undefined) setVatEnabled(data.vat_enabled)
        if (data.vat_rate !== undefined) setVatRate(data.vat_rate)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  // Calculate "ab X €" — minimum across all displayed services
  const minPrice = services.length > 0
    ? Math.min(...services.map(s => {
        const candidates = [s.price, s.first_session_price].filter((p): p is number => p !== null && p > 0)
        return candidates.length > 0 ? Math.min(...candidates) : Infinity
      }).filter(p => p !== Infinity))
    : null

  return (
    <>
      <NextAvailabilityFloat companyId={contactData.company_id ?? ''} />
      <section className="hero-section">
        <img 
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80"
          alt="Waldweg — Ruhe und Klarheit"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80"
          alt="Waldweg — Ruhe und Klarheit"
        />
        <div className="hero-text" style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'var(--btb-creme)', opacity: 0.6, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <RouterLink  to="/koerperarbeit" style={{ color: 'var(--btb-creme)', opacity: 0.6 }}>Körperarbeit</RouterLink> ›
          </p>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--btb-creme)',
            marginBottom: '0.5rem',
          }}>
            Preise
          </h1>
          <p style={{ color: 'var(--btb-oliv)', fontFamily: 'var(--font-garamond)', fontStyle: 'italic' }}>
            {minPrice ? `ab ${minPrice} € pro Sitzung` : 'Transparente Preise für deinen Körper'}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 900 }}>

          <div style={{
            background: 'rgba(143,169,66,0.08)',
            border: '1.5px solid rgba(143,169,66,0.2)',
            borderRadius: 12, padding: '1.25rem',
            marginBottom: '1rem',
            lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--btb-dunkel)',
          }}>
            <strong style={{ color: 'var(--btb-oliv)' }}>Warum ein Paket?</strong> Tiefsitzende Spannungsmuster können sich überlagern und lösen sich manchmal nicht in einer einzelnen Sitzung. Das 3er-Paket gibt dir die Möglichkeit, deinen Körper über mehrere Sitzungen zu begleiten.
          </div>

          <div style={{
            background: 'rgba(42,124,171,0.08)',
            border: '1.5px solid rgba(42,124,171,0.2)',
            borderRadius: 12, padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
            fontSize: '0.9rem',
          }}>
            <Euro size={18} style={{ color: 'var(--btb-blau)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ lineHeight: 1.7, color: 'var(--btb-dunkel)' }}>
              <strong>BtMM-Mitglieder:</strong> {prices.intern_hinweis}
            </p>
          </div>

          {(loading || error) && (
            <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
              Preise werden geladen...
            </p>
          )}

          {!loading && !error && services.length > 0 && (() => {
            // Build individual price cards from services + bundles
            const cards: Array<{ key: string; title: string; price: number; hint: string; duration: number; featured: boolean; serviceId: string; description?: string; positions?: any[]; isPromotion?: boolean; originalPrice?: number | null; promotionEndsAt?: string | null; savingsPct?: number; savingsEur?: number; perSession?: number }> = []

            // Add promotion cards first (at the top)
            services.forEach(service => {
              if (service.promotion_active && service.promotion_price) {
                const promoValid = !service.promotion_ends_at || new Date(service.promotion_ends_at) > new Date()
                if (promoValid) {
                  cards.push({
                    key: `${service.id}-promotion`,
                    serviceId: service.id,
                    title: service.promotion_label || 'Sonderaktion',
                    price: service.promotion_price,
                    hint: service.promotion_description || '',
                    duration: service.duration_min,
                    featured: false,
                    isPromotion: true,
                    originalPrice: service.price,
                    promotionEndsAt: service.promotion_ends_at,
                  })
                }
              }
            })

            services.forEach(service => {
              const regularPrice = service.price ?? 0

              // 1. Kennenlernsitzung (if first_session_price exists)
              if (service.first_session_price && service.first_session_price > 0) {
                const savEur = regularPrice - service.first_session_price
                const savPct = regularPrice > 0 ? Math.round(savEur / regularPrice * 100) : 0
                cards.push({
                  key: `${service.id}-first`,
                  serviceId: service.id,
                  title: 'Kennenlernsitzung',
                  price: service.first_session_price,
                  hint: 'Deine erste Sitzung zum Kennenlernpreis',
                  duration: service.duration_min,
                  featured: false,
                  savingsPct: savPct > 0 ? savPct : undefined,
                  savingsEur: savEur > 0 ? savEur : undefined,
                })
              }

              // 2. Einzelsitzung (regular price)
              if (regularPrice > 0) {
                cards.push({
                  key: `${service.id}-single`,
                  serviceId: service.id,
                  title: 'Einzelsitzung',
                  price: regularPrice,
                  hint: 'Reguläre Begleitung',
                  duration: service.duration_min,
                  featured: false,
                })
              }

              // 3. Bundles as separate cards
              const bundles = service.bundles?.length ? service.bundles
                : (service.bundle_size && service.bundle_size > 1 && service.bundle_price
                  ? [{ id: `legacy-${service.id}`, size: service.bundle_size, price: service.bundle_price, label: service.bundle_label, description: null, positions: [] }]
                  : [])

              bundles.forEach((bundle: any) => {
                // Ersparnis: Bundle-Preis vs. alle Sitzungen zum regulären Einzelpreis
                const size = bundle.size ?? 3
                const normalTotal = regularPrice * size
                const savingsEur = normalTotal > 0 ? normalTotal - bundle.price : 0
                const savingsPct = normalTotal > 0 ? Math.round(savingsEur / normalTotal * 100) : 0
                const perSession = size > 0 ? Math.round(bundle.price / size * 100) / 100 : 0
                cards.push({
                  key: `bundle-${bundle.id}`,
                  serviceId: service.id,
                  title: bundle.label || `${bundle.size}er-Paket`,
                  price: bundle.price,
                  hint: bundle.description || `${bundle.size}x Sitzung — du buchst den ersten Termin direkt und erhältst ${bundle.size - 1} Buchungscodes für die weiteren Sitzungen.`,
                  duration: service.duration_min,
                  featured: true,
                  positions: bundle.positions,
                  savingsPct: savingsPct > 0 ? savingsPct : undefined,
                  savingsEur: savingsEur > 0 ? savingsEur : undefined,
                  perSession,
                })
              })
            })

            return (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '2.5rem',
            }}>
              {cards.map((card, i) => {

                return (
                  <SectionReveal key={card.key} delay={i * 0.12}>
                    <div className="card-btb" style={{
                      border: card.isPromotion ? '2px solid #b61818' : card.featured ? '2px solid var(--btb-oliv)' : '1.5px solid var(--btb-creme)',
                      position: 'relative',
                      textAlign: 'center',
                    }}>
                      {card.isPromotion && (
                        <div style={{
                          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                          background: '#b61818', color: 'white',
                          borderRadius: 20, padding: '0.2rem 0.8rem',
                          fontSize: '0.75rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                        }}>
                          AKTION
                        </div>
                      )}
                      {card.featured && !card.isPromotion && (
                        <div style={{
                          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                          background: 'var(--btb-oliv)', color: 'white',
                          borderRadius: 20, padding: '0.2rem 0.8rem',
                          fontSize: '0.75rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                        }}>
                          <Star size={12} /> Empfohlen
                        </div>
                      )}

                      <h2 style={{
                        fontFamily: 'var(--font-garamond)',
                        color: 'var(--btb-dunkel)',
                        fontSize: '1.3rem',
                        marginBottom: '1rem',
                      }}>
                        {card.title}
                      </h2>

                      <div style={{
                        fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                        fontFamily: 'var(--font-garamond)',
                        fontWeight: 700,
                        color: card.isPromotion ? '#b61818' : 'var(--btb-rot)',
                        marginBottom: '0.25rem',
                      }}>
                        {card.isPromotion && card.originalPrice && (
                          <span style={{
                            fontSize: '1rem',
                            textDecoration: 'line-through',
                            opacity: 0.5,
                            color: 'var(--btb-dunkel)',
                            marginRight: '0.5rem',
                            fontWeight: 400,
                          }}>
                            {card.originalPrice} €
                          </span>
                        )}
                        {card.price} €
                      </div>
                      {card.isPromotion && card.promotionEndsAt && (
                        <p style={{ fontSize: '0.8rem', color: '#b61818', fontWeight: 600, marginBottom: '0.25rem' }}>
                          Nur noch bis {new Date(card.promotionEndsAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}!
                        </p>
                      )}
                      {card.perSession && card.perSession > 0 && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--btb-dunkel)', opacity: 0.6, marginBottom: '0.15rem' }}>
                          {card.perSession.toFixed(0)} € pro Sitzung
                        </p>
                      )}
                      {card.savingsPct && card.savingsPct > 0 && (
                        <p style={{
                          fontSize: '0.85rem', fontWeight: 700,
                          color: 'var(--btb-oliv)',
                          marginBottom: '0.25rem',
                        }}>
                          {card.savingsPct}% günstiger — spare {card.savingsEur} €
                        </p>
                      )}
                      {vatEnabled && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--btb-dunkel)', opacity: 0.6, marginBottom: '0.25rem' }}>
                          zzgl. {vatRate}% MwSt
                        </p>
                      )}

                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.4rem', color: 'var(--btb-dunkel)', opacity: 0.7, marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                      }}>
                        <Clock size={16} />
                        {card.duration} Minuten
                      </div>

                      <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1.25rem', lineHeight: 1.6 }}>
                        {card.hint}
                      </p>

                      {card.positions && card.positions.length > 0 && (
                        <div style={{
                          background: 'rgba(143,169,66,0.06)',
                          border: '1px solid rgba(143,169,66,0.15)',
                          borderRadius: 8,
                          padding: '0.5rem 0.65rem',
                          textAlign: 'left',
                          marginBottom: '1rem',
                        }}>
                          {card.positions.map((pos: any) => (
                            <div key={pos.position_number} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.78rem',
                              color: 'var(--btb-dunkel)',
                              padding: '0.15rem 0',
                            }}>
                              <span>{pos.position_number}. {pos.name}</span>
                              <span style={{ fontWeight: 600 }}>{Number(pos.price).toFixed(0)} €</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <RouterLink 
                        href={`/koerperarbeit/buchen?service=${card.serviceId}`}
                        className="btn-primary"
                        style={{ display: 'inline-block', fontSize: '0.9rem' }}
                      >
                        Termin buchen
                      </RouterLink>
                    </div>
                  </SectionReveal>
                )
              })}
            </div>
          )})()}

          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '2rem' }}>
              {vatEnabled
                ? `Alle Preise verstehen sich als Nettopreise zzgl. ${vatRate}% MwSt. Terminbuchung direkt online über die Webseite.`
                : 'Alle Preise sind Endpreise. Gemäß § 19 UStG (Kleinunternehmerregelung) wird keine MwSt erhoben. Terminbuchung direkt online über die Webseite.'}
          </p>

          <h2 style={{
            fontFamily: 'var(--font-garamond)',
            color: 'var(--btb-oliv)',
            fontSize: '1.5rem',
            marginBottom: '1rem',
          }}>
            Oder direkt Kontakt aufnehmen
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a
              href="mailto:back.to.balance.gartzke@gmail.com"
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Mail size={16} /> back.to.balance.gartzke@gmail.com
            </a>
            <a
              href="tel:017644453687"
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Phone size={16} /> 0176 44453687
            </a>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <RouterLink  to="/mitmachen" className="btn-secondary">
              BtMM-Mitglied werden
            </RouterLink>
            <RouterLink  to="/koerperarbeit/bewertungen" className="btn-secondary">
              Kundenerfahrungen ansehen
            </RouterLink>
            <RouterLink  to="/koerperarbeit/anfahrt" className="btn-secondary">
              Anfahrt & Standort
            </RouterLink>
          </div>
        </div>
      </section>
    </>
  )
}
