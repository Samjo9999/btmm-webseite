
import { Suspense, useState, useEffect } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { Check, Mail, Calendar, Loader2, AlertCircle } from 'lucide-react'

function BestaetigungInner() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams?.get('booking_id') || ''
  const sessionId = searchParams?.get('session_id') || ''

  const [verifying, setVerifying] = useState(!!sessionId)
  const [verifiedBookingId, setVerifiedBookingId] = useState(bookingId)
  const [verifyError, setVerifyError] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [bundleCodes, setBundleCodes] = useState<string[] | null>(null)
  const [startTs, setStartTs] = useState('')

  // If we have a session_id, verify the payment and create the booking
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false

    async function verifyAndBook() {
      try {
        const res = await fetch(`/api/verify-checkout?session_id=${sessionId}`)
        const data = await res.json()
        if (cancelled) return

        if (data.error) {
          setVerifyError(data.error)
          setVerifying(false)
          return
        }

        setVerifiedBookingId(data.booking_id || '')
        setCustomerEmail(data.customer_email || '')
        setBundleCodes(data.bundle_codes || null)
        setStartTs(data.start_ts || '')
        setVerifying(false)
      } catch {
        if (!cancelled) {
          setVerifyError('Verbindungsfehler bei der Bestätigung')
          setVerifying(false)
        }
      }
    }

    verifyAndBook()
    return () => { cancelled = true }
  }, [sessionId])

  // Loading state while verifying Stripe payment
  if (verifying) {
    return (
      <section style={{ background: 'var(--btb-weiss)', padding: '4rem 1.5rem' }}>
        <div className="container-btb" style={{ maxWidth: 600, textAlign: 'center' }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: 'var(--btb-blau)', margin: '0 auto 1.5rem' }} />
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            color: 'var(--btb-dunkel)',
            marginBottom: '0.75rem',
          }}>
            Zahlung wird bestätigt...
          </h1>
          <p style={{ opacity: 0.6, lineHeight: 1.7 }}>
            Deine Zahlung wird verarbeitet und dein Termin wird angelegt. Das dauert nur einen Moment.
          </p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </section>
    )
  }

  // Error state
  if (verifyError) {
    return (
      <section style={{ background: 'var(--btb-weiss)', padding: '4rem 1.5rem' }}>
        <div className="container-btb" style={{ maxWidth: 600, textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: '#b61818',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <AlertCircle size={40} color="white" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            color: '#b61818',
            marginBottom: '0.75rem',
          }}>
            Es ist ein Problem aufgetreten
          </h1>
          <p style={{ opacity: 0.7, lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {verifyError}
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '2rem' }}>
            Deine Zahlung wurde möglicherweise verarbeitet. Bitte kontaktiere uns unter{' '}
            <a href="mailto:office@b-t-m-m.com" style={{ color: 'var(--btb-blau)' }}>
              office@b-t-m-m.com
            </a>
          </p>
          <RouterLink  to="/koerperarbeit" className="btn-primary">
            Zurück zur Übersicht
          </RouterLink>
        </div>
      </section>
    )
  }

  return (
    <section style={{ background: 'var(--btb-weiss)', padding: '4rem 1.5rem' }}>
      <div className="container-btb" style={{ maxWidth: 600, textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'var(--btb-oliv, #8fa942)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <Check size={40} color="white" />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          color: 'var(--btb-dunkel)',
          marginBottom: '1rem',
        }}>
          Dein Termin wurde gebucht!
        </h1>

        {sessionId && (
          <p style={{ color: 'var(--btb-oliv)', fontWeight: 600, marginBottom: '1rem' }}>
            Zahlung erfolgreich abgeschlossen
          </p>
        )}

        <div style={{
          background: 'var(--btb-creme, #f0e9b6)',
          borderRadius: 12,
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Mail size={20} style={{ color: 'var(--btb-blau)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
              Du erhältst eine <strong>Bestätigungs-E-Mail</strong>{customerEmail ? ` an ${customerEmail}` : ''} mit allen Details und einer Kalenderdatei (.ics) zum Importieren.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={20} style={{ color: 'var(--btb-oliv)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
              Die <strong>Rechnung</strong> kommt ebenfalls per E-Mail.
            </p>
          </div>
        </div>


        {bundleCodes && bundleCodes.length > 0 && (
          <div style={{
            background: 'rgba(143,169,66,0.1)',
            border: '1px solid var(--btb-oliv)',
            borderRadius: 12,
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--btb-oliv)', marginBottom: '0.5rem' }}>
              Deine Buchungscodes ({bundleCodes.length})
            </p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.75rem' }}>
              Du erhältst diese Codes auch per E-Mail. Löse sie für deine weiteren Sitzungen ein.
            </p>
            {bundleCodes.map((c) => (
              <div key={c} style={{
                fontFamily: 'monospace',
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '2px',
                background: 'var(--btb-creme)',
                borderRadius: 6,
                padding: '0.5rem 1rem',
                marginBottom: '0.35rem',
                textAlign: 'center',
              }}>
                {c}
              </div>
            ))}
          </div>
        )}

        {verifiedBookingId && (
          <p style={{ fontSize: '0.85rem', opacity: 0.5, marginBottom: '1.5rem' }}>
            Buchungs-ID: {verifiedBookingId}
          </p>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <RouterLink  to="/koerperarbeit" className="btn-primary">
            Zurück zur Übersicht
          </RouterLink>
          <RouterLink  to="/koerperarbeit/preise" className="btn-secondary" style={{ textDecoration: 'none' }}>
            Weiteren Termin buchen
          </RouterLink>
        </div>
      </div>
    </section>
  )
}

export default function BestaetigungPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Laden...</div>}>
      <BestaetigungInner />
    </Suspense>
  )
}
