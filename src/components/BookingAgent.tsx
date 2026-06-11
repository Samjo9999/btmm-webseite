
import { useState, useEffect } from 'react'
// import Image (use <img>) 
import { useLocation } from 'react-router-dom'
import { CalendarDays, X, ChevronRight, Clock, Loader2 } from 'lucide-react'

const SUPABASE_URL = 'https://xcngmshjuqoucdlgikao.supabase.co'
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/public-booking`
const COMPANY_ID = '396ad7a6-e4d1-4c7d-abc1-ef9f2c4c2da9'

interface Service {
  id: string
  name: string
  duration_min: number
}

interface Slot {
  start_time: string
  end_time: string
}

type AgentStep = 'greeting' | 'services' | 'dates' | 'slots'

export function BookingAgent() {
  const pathname = useLocation().pathname
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [step, setStep] = useState<AgentStep>('greeting')
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [dates, setDates] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)

  // Hide on the booking page itself
  const isBookingPage = pathname?.includes('/koerperarbeit/buchen')
  const isAngebotePage = pathname?.includes('/koerperarbeit') || pathname?.includes('/angebote')

  // Check sessionStorage for dismissed state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDismissed(sessionStorage.getItem('btb-agent-dismissed') === 'true')
    }
  }, [])

  // Load services when opening
  useEffect(() => {
    if (!open || services.length > 0) return
    fetch(`${FUNCTION_URL}/services?company_id=${COMPANY_ID}`)
      .then((r) => r.json())
      .then((d) => {
        setServices(d.services ?? [])
        if (d.company_logo) setCompanyLogo(d.company_logo)
      })
      .catch(() => {})
  }, [open, services.length])

  function handleDismiss() {
    setOpen(false)
    // Don't set dismissed — button stays visible, just closes the panel
  }

  async function handleSelectService(service: Service) {
    setSelectedService(service)
    setStep('dates')
    setLoading(true)

    // Find available dates in the next 14 days
    const today = new Date()
    const availDates: string[] = []
    const promises: Promise<void>[] = []

    for (let i = 0; i < 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]

      promises.push(
        fetch(`${FUNCTION_URL}/slots?company_id=${COMPANY_ID}&date=${dateStr}&service_id=${service.id}&step=30`)
          .then((r) => r.json())
          .then((data) => {
            if (data.slots && data.slots.length > 0) {
              availDates.push(dateStr)
            }
          })
          .catch(() => {})
      )
    }

    await Promise.all(promises)
    availDates.sort()
    setDates(availDates)
    setLoading(false)
  }

  async function handleSelectDate(dateStr: string) {
    setSelectedDate(dateStr)
    setStep('slots')
    setLoading(true)

    try {
      const res = await fetch(`${FUNCTION_URL}/slots?company_id=${COMPANY_ID}&date=${dateStr}&service_id=${selectedService!.id}&step=30`)
      const data = await res.json()
      setSlots((data.slots ?? []).slice(0, 6)) // Show max 6 slots
    } catch {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('de-DE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  if (isBookingPage || !isAngebotePage) return null

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setStep(services.length > 0 ? 'services' : 'greeting') }}
          aria-label="Terminbuchung"
          style={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#2a7cab',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(42,124,171,0.4)',
            zIndex: 9999,
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <CalendarDays size={24} />
        </button>
      )}

      {/* Card overlay */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 90,
          right: 24,
          width: 340,
          maxHeight: 480,
          borderRadius: 16,
          background: '#f0e9b6',
          border: '1px solid rgba(42,124,171,0.25)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 9999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-garamond), Georgia, serif',
        }}>
          {/* Header */}
          <div style={{
            background: '#2a7cab',
            color: 'white',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {companyLogo ? (
                <div style={{ position: 'relative', height: 22, width: 80, flexShrink: 0 }}>
                  <img  src={companyLogo} alt="" fill style={{ objectFit: 'contain' }} />
                </div>
              ) : (
                <CalendarDays size={18} />
              )}
              <span style={{ fontWeight: 600, fontSize: '1rem' }}>Terminassistent</span>
            </div>
            <button
              onClick={handleDismiss}
              aria-label="Schliessen"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{
            padding: '1rem',
            overflowY: 'auto',
            flex: 1,
          }}>
            {/* Greeting */}
            {step === 'greeting' && (
              <div>
                <p style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: '1rem', color: '#3d3520' }}>
                  Hallo! Ich helfe dir einen passenden Termin zu finden.
                </p>
                {services.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: '#2a7cab' }} />
                  </div>
                ) : (
                  <button
                    onClick={() => setStep('services')}
                    style={{
                      background: '#2a7cab',
                      color: 'white',
                      border: 'none',
                      borderRadius: 10,
                      padding: '0.7rem 1rem',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      width: '100%',
                      fontFamily: 'inherit',
                    }}
                  >
                    Termin finden
                  </button>
                )}
              </div>
            )}

            {/* Services list */}
            {step === 'services' && (
              <div>
                <p style={{ fontSize: '0.9rem', color: '#3d3520', marginBottom: '0.75rem', fontWeight: 600 }}>
                  Was moechtest du buchen?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectService(s)}
                      style={{
                        background: 'white',
                        border: '1px solid rgba(42,124,171,0.2)',
                        borderRadius: 10,
                        padding: '0.7rem 0.9rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.borderColor = '#2a7cab')}
                      onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(42,124,171,0.2)')}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#3d3520', fontSize: '0.9rem' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2 }}>
                          <Clock size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {s.duration_min} Min.
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: '#2a7cab' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            {step === 'dates' && (
              <div>
                <button
                  onClick={() => setStep('services')}
                  style={{
                    background: 'transparent', border: 'none', color: '#2a7cab',
                    cursor: 'pointer', fontSize: '0.8rem', padding: 0, marginBottom: '0.5rem',
                    fontFamily: 'inherit',
                  }}
                >
                  Zurueck
                </button>
                <p style={{ fontSize: '0.9rem', color: '#3d3520', marginBottom: '0.75rem', fontWeight: 600 }}>
                  {selectedService?.name} -- Verfuegbare Tage
                </p>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: '#2a7cab' }} />
                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>Suche freie Termine...</p>
                  </div>
                ) : dates.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#888', padding: '1rem 0' }}>
                    Leider keine freien Termine in den naechsten 14 Tagen.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {dates.map((d) => (
                      <button
                        key={d}
                        onClick={() => handleSelectDate(d)}
                        style={{
                          background: 'white',
                          border: '1px solid rgba(143,169,66,0.3)',
                          borderRadius: 8,
                          padding: '0.6rem 0.9rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontFamily: 'inherit',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#3d3520',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = '#8fa942')}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(143,169,66,0.3)')}
                      >
                        {formatDate(d)}
                        <ChevronRight size={16} style={{ color: '#8fa942' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Time slots */}
            {step === 'slots' && (
              <div>
                <button
                  onClick={() => setStep('dates')}
                  style={{
                    background: 'transparent', border: 'none', color: '#2a7cab',
                    cursor: 'pointer', fontSize: '0.8rem', padding: 0, marginBottom: '0.5rem',
                    fontFamily: 'inherit',
                  }}
                >
                  Zurueck
                </button>
                <p style={{ fontSize: '0.9rem', color: '#3d3520', marginBottom: '0.75rem', fontWeight: 600 }}>
                  {selectedDate && formatDate(selectedDate)} -- Verfuegbare Zeiten
                </p>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: '#2a7cab' }} />
                  </div>
                ) : slots.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#888' }}>Keine freien Zeiten.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    {slots.map((s) => (
                      <div
                        key={s.start_time}
                        style={{
                          background: 'white',
                          border: '1px solid rgba(143,169,66,0.3)',
                          borderRadius: 8,
                          padding: '0.5rem',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#3d3520',
                        }}
                      >
                        {s.start_time}
                      </div>
                    ))}
                  </div>
                )}
                <a
                  href="/koerperarbeit/buchen"
                  style={{
                    display: 'block',
                    background: '#8fa942',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '0.7rem 1rem',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'center',
                    textDecoration: 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  Direkt buchen
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
