
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

export function CancellationForm() {
  const searchParams = useSearchParams()
  const [bookingId, setBookingId] = useState('')
  const [email, setEmail] = useState('')

  // Auto-fill aus URL-Parametern (aus E-Mail-Link)
  useEffect(() => {
    const cancelId = searchParams?.get('cancel_id')
    const cancelEmail = searchParams?.get('cancel_email')
    if (cancelId) setBookingId(cancelId)
    if (cancelEmail) setEmail(cancelEmail)
  }, [searchParams])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [lateCancellation, setLateCancellation] = useState<{ fee_percent: number; message: string } | null>(null)

  const doCancel = async (force = false) => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('https://xcngmshjuqoucdlgikao.supabase.co/functions/v1/public-booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId.trim(), email: email.trim(), force }),
      })

      const data = await res.json()

      if (res.ok && data.status === 'late_cancellation') {
        setLateCancellation({ fee_percent: data.fee_percent, message: data.message })
      } else if (res.ok) {
        setLateCancellation(null)
        setResult({ success: true, message: 'Dein Termin wurde erfolgreich storniert. Du erhältst eine Bestätigung per E-Mail.' })
        setBookingId('')
        setEmail('')
      } else {
        setLateCancellation(null)
        setResult({ success: false, message: data.error || 'Die Stornierung konnte nicht durchgeführt werden. Bitte überprüfe deine Angaben.' })
      }
    } catch {
      setResult({ success: false, message: 'Ein Verbindungsfehler ist aufgetreten. Bitte versuche es erneut.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    setLateCancellation(null)
    await doCancel(false)
  }

  const handleForceCancel = async () => {
    await doCancel(true)
  }

  return (
    <div style={{
      background: 'var(--btb-creme, #f0e9b6)',
      borderRadius: 12,
      padding: '1.5rem',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      <form onSubmit={handleCancel} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="text"
          placeholder="Buchungs-ID"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          required
          style={{
            padding: '0.7rem 1rem',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.15)',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            background: 'white',
          }}
        />
        <input
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '0.7rem 1rem',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.15)',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            background: 'white',
          }}
        />
        {!lateCancellation && (
          <button
            type="submit"
            disabled={loading || !bookingId.trim() || !email.trim()}
            style={{
              background: 'var(--btb-blau, #2a7cab)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '0.7rem 1rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontFamily: 'inherit',
              opacity: (!bookingId.trim() || !email.trim()) ? 0.5 : 1,
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={16} />}
            {loading ? 'Wird storniert...' : 'Termin stornieren'}
          </button>
        )}
      </form>

      {lateCancellation && (
        <div style={{
          marginTop: '0.75rem',
          padding: '1rem',
          borderRadius: 8,
          background: 'rgba(182,24,24,0.08)',
          border: '1px solid rgba(182,24,24,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--btb-rot, #b61818)', flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: '0.9rem' }}>
              {lateCancellation.message}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleForceCancel}
              disabled={loading}
              style={{
                background: 'var(--btb-rot, #b61818)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '0.6rem 1rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {loading ? 'Wird storniert...' : `Trotzdem stornieren (Gebühr akzeptieren)`}
            </button>
            <button
              type="button"
              onClick={() => setLateCancellation(null)}
              style={{
                background: 'transparent',
                color: 'var(--btb-blau, #2a7cab)',
                border: '1px solid var(--btb-blau, #2a7cab)',
                borderRadius: 8,
                padding: '0.6rem 1rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: 8,
          background: result.success ? 'rgba(143,169,66,0.15)' : 'rgba(182,24,24,0.1)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          fontSize: '0.9rem',
        }}>
          {result.success
            ? <CheckCircle2 size={18} style={{ color: 'var(--btb-oliv, #8fa942)', flexShrink: 0, marginTop: 2 }} />
            : <XCircle size={18} style={{ color: 'var(--btb-rot, #b61818)', flexShrink: 0, marginTop: 2 }} />
          }
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}
