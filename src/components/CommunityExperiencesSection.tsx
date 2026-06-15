
import { useState, useEffect } from 'react'
import { Star, UserCheck, Send } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { PercentStars } from '@/components/PercentStars'

const SUPABASE_URL = 'https://xcngmshjuqoucdlgikao.supabase.co'
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/public-booking`
const COMPANY_ID = '396ad7a6-e4d1-4c7d-abc1-ef9f2c4c2da9'

interface CommunityReview {
  id: string
  reviewer_name: string
  rating: number
  comment: string | null
  is_member_verified: boolean
  created_at: string
}

interface CommunityExperiencesSectionProps {
  showAll?: boolean
}

export function CommunityExperiencesSection({ showAll = false }: CommunityExperiencesSectionProps) {
  const [reviews, setReviews] = useState<CommunityReview[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    loadReviews()
  }, [])

  async function loadReviews() {
    try {
      const res = await fetch(`${FUNCTION_URL}/community-reviews?company_id=${COMPANY_ID}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      setAverageRating(data.average_rating || 0)
      setCount(data.count || 0)
    } catch (err) {
      console.error('Error loading reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !rating) return

    setSubmitting(true)
    try {
      const res = await fetch(`${FUNCTION_URL}/community-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: COMPANY_ID,
          reviewer_name: name.trim(),
          rating,
          comment: comment.trim() || null,
        }),
      })
      const data = await res.json()
      if (data.status === 'success') {
        setSubmitted(true)
        setName('')
        setRating(0)
        setComment('')
      }
    } catch (err) {
      console.error('Error submitting review:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const enthusiasmPercent = count > 0
    ? Math.round((reviews.filter(r => r.rating >= 5).length / count) * 100)
    : 0
  const communityDist: Record<number, number> = {}
  reviews.forEach(r => { communityDist[r.rating] = (communityDist[r.rating] || 0) + 1 })

  const displayedReviews = showAll ? reviews : reviews.slice(0, 6)

  if (loading) return null

  return (
    <section className="section" style={{ background: 'var(--btb-creme, #f0e9b6)' }}>
      <div className="container-btb" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
          textAlign: 'center',
          color: 'var(--btb-oliv)',
          marginBottom: '1.5rem',
        }}>
          Was unsere Gemeinschaft erlebt
        </h2>

        {/* Rating summary */}
        {count > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <PercentStars percent={enthusiasmPercent} count={count} averageRating={averageRating} distribution={communityDist} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.75rem',
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-garamond)' }}>
                {averageRating.toFixed(1)}
              </span>
              <div style={{ display: 'flex' }}>
                {[1, 2, 3, 4, 5, 6].map(s => (
                  <Star
                    key={s}
                    size={18}
                    fill={s <= Math.round(averageRating) ? '#8fa942' : 'none'}
                    stroke={s <= Math.round(averageRating) ? '#8fa942' : '#ccc'}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#666' }}>
                Durchschnitt
              </span>
            </div>
          </div>
        )}

        {/* Reviews list */}
        {displayedReviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            {displayedReviews.map(review => (
              <div key={review.id} style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{review.reviewer_name}</span>
                  <div style={{ display: 'flex' }}>
                    {[1, 2, 3, 4, 5, 6].map(s => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= review.rating ? '#8fa942' : 'none'}
                        stroke={s <= review.rating ? '#8fa942' : '#ccc'}
                      />
                    ))}
                  </div>
                  {review.is_member_verified && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      background: '#e8f4fd',
                      color: '#2a7cab',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 500,
                    }}>
                      <UserCheck size={12} />
                      Mitglied &#10003;
                    </span>
                  )}
                </div>
                {review.comment && (
                  <p style={{ fontSize: '0.9rem', color: '#444', lineHeight: 1.6, margin: '0.5rem 0' }}>
                    {review.comment}
                  </p>
                )}
                <span style={{ fontSize: '0.75rem', color: '#999' }}>
                  {new Date(review.created_at).toLocaleDateString('de-DE', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
            Noch keine Erfahrungen geteilt. Sei der/die Erste!
          </p>
        )}

        {/* Show all link (only in homepage mode) */}
        {!showAll && reviews.length > 6 && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <RouterLink
              to="/erfahrungen"
              style={{
                color: 'var(--btb-blau, #2a7cab)',
                fontWeight: 600,
                fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              Alle anzeigen &rarr;
            </RouterLink>
          </div>
        )}

        {/* Submit form toggle */}
        {!showForm && !submitted && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--btb-oliv, #8fa942)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Send size={16} />
              Erfahrung teilen
            </button>
          </div>
        )}

        {/* Submitted confirmation */}
        {submitted && (
          <div style={{
            textAlign: 'center',
            padding: '1.5rem',
            background: 'rgba(143,169,66,0.1)',
            border: '1px solid rgba(143,169,66,0.3)',
            borderRadius: '10px',
          }}>
            <p style={{ color: 'var(--btb-oliv)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              Vielen Dank!
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Deine Erfahrung wird nach kurzer Pruefung veroeffentlicht.
            </p>
          </div>
        )}

        {/* Form */}
        {showForm && !submitted && (
          <form onSubmit={handleSubmit} style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            marginTop: '1.5rem',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '1.3rem',
              fontWeight: 700,
              marginBottom: '1rem',
            }}>
              Erfahrung teilen
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Dein Name"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                  Bewertung
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5, 6].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    >
                      <Star
                        size={28}
                        fill={s <= (hoverRating || rating) ? '#8fa942' : 'none'}
                        stroke={s <= (hoverRating || rating) ? '#8fa942' : '#ccc'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px' }}>
                  Deine Erfahrung (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Was hat dich bewegt? Was moechtest du teilen?"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <p style={{ fontSize: '0.75rem', color: '#999' }}>
                Deine Erfahrung wird vor der Veroeffentlichung auf Authentizitaet geprueft.
              </p>

              <button
                type="submit"
                disabled={submitting || !name.trim() || !rating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'var(--btb-oliv, #8fa942)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting || !name.trim() || !rating ? 0.5 : 1,
                  alignSelf: 'flex-start',
                }}
              >
                <Send size={16} />
                {submitting ? 'Wird gesendet...' : 'Erfahrung teilen'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
