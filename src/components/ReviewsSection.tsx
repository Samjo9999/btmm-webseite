
import { useState, useEffect, useCallback } from 'react'
import { Star } from 'lucide-react'
import { PercentStars } from '@/components/PercentStars'

interface Review {
  id: string
  customer_name: string
  rating: number
  comment: string | null
  created_at: string
}

interface ReviewsSectionProps {
  companyId: string
  serviceId?: string
}

const SUPABASE_URL = 'https://xcngmshjuqoucdlgikao.supabase.co'

function StarRating({ rating, interactive, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0)

  return (
    <div style={{ display: 'flex', gap: '0.2rem' }}>
      {[1, 2, 3, 4, 5, 6].map((star) => (
        <Star
          key={star}
          size={20}
          fill={(interactive ? (hover || rating) : rating) >= star ? 'var(--btb-oliv)' : 'none'}
          stroke={(interactive ? (hover || rating) : rating) >= star ? 'var(--btb-oliv)' : '#ccc'}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'fill 0.15s' }}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(star)}
        />
      ))}
    </div>
  )
}

export function ReviewsSection({ companyId, serviceId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [count, setCount] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', rating: 0, comment: '' })

  const fetchReviews = useCallback(async () => {
    try {
      const params = new URLSearchParams({ company_id: companyId })
      if (serviceId) params.set('service_id', serviceId)
      const res = await fetch(`${SUPABASE_URL}/functions/v1/public-booking/reviews?${params}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        setCount(data.count || 0)
        setAverageRating(data.average_rating || 0)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }, [companyId, serviceId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.rating) return

    setSubmitting(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/public-booking/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          service_id: serviceId || null,
          customer_name: formData.name,
          rating: formData.rating,
          comment: formData.comment || null,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setFormData({ name: '', rating: 0, comment: '' })
      }
    } catch (err) {
      console.error('Error submitting review:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <div style={{ marginTop: '3rem' }}>
      <h2 style={{
        fontFamily: 'var(--font-garamond)',
        fontSize: '1.6rem',
        color: 'var(--btb-dunkel)',
        marginBottom: '1rem',
      }}>
        Kundenerfahrungen
      </h2>

      {count > 0 && (() => {
        const happyCount = reviews.filter(r => r.rating >= 5).length
        const happyPercent = count > 0 ? Math.round((happyCount / count) * 100) : 0
        const dist: Record<number, number> = {}
        reviews.forEach(r => { dist[r.rating] = (dist[r.rating] || 0) + 1 })
        return (
          <div style={{ marginBottom: '1.5rem' }}>
            <PercentStars percent={happyPercent} count={count} averageRating={averageRating} distribution={dist} />
          </div>
        )
      })()}

      {reviews.length > 0 && (
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          {reviews.map((review) => (
            <div key={review.id} style={{
              background: 'var(--btb-creme)',
              border: '1px solid rgba(143,169,66,0.15)',
              borderRadius: 10,
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--btb-dunkel)', fontSize: '0.95rem' }}>
                  {review.customer_name}
                </strong>
                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                  {new Date(review.created_at).toLocaleDateString('de-DE', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              <StarRating rating={review.rating} />
              {review.comment && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--btb-dunkel)', opacity: 0.8 }}>
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {count === 0 && !showForm && (
        <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '1rem' }}>
          Noch keine Erfahrungen vorhanden. Sei der/die Erste!
        </p>
      )}

      {!showForm && !submitted && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'var(--btb-oliv)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '0.6rem 1.2rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Erfahrung schreiben
        </button>
      )}

      {submitted && (
        <div style={{
          background: 'rgba(143,169,66,0.1)',
          border: '1px solid rgba(143,169,66,0.3)',
          borderRadius: 10,
          padding: '1rem 1.25rem',
          fontSize: '0.9rem',
          color: 'var(--btb-oliv)',
          fontWeight: 500,
        }}>
          Danke! Deine Erfahrung erscheint in Kürze — wir filtern lediglich nach Spam.
        </div>
      )}

      {showForm && !submitted && (
        <form onSubmit={handleSubmit} style={{
          background: 'var(--btb-creme)',
          border: '1px solid rgba(143,169,66,0.2)',
          borderRadius: 12,
          padding: '1.5rem',
          marginTop: '1rem',
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--btb-dunkel)' }}>
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--btb-dunkel)' }}>
              Erfahrung
            </label>
            <StarRating rating={formData.rating} interactive onRate={(r) => setFormData(prev => ({ ...prev, rating: r }))} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--btb-dunkel)' }}>
              Kommentar (optional)
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontSize: '0.9rem',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !formData.rating || !formData.name}
            style={{
              background: submitting ? '#999' : 'var(--btb-oliv)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '0.6rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Wird gesendet...' : 'Erfahrung absenden'}
          </button>
        </form>
      )}
    </div>
  )
}
