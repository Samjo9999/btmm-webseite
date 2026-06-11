
import { Star } from 'lucide-react'

interface RatingDistribution {
  [key: number]: number // star level → count
}

export function PercentStars({ percent, count, averageRating, distribution, maxStars = 6 }: {
  percent: number
  count: number
  averageRating?: number
  distribution?: RatingDistribution
  maxStars?: number
}) {
  const avg = averageRating ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Header: percent + average */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--btb-oliv, #8fa942)' }}>
          {avg > 0 ? avg.toFixed(1) : '–'}
        </span>
        <div style={{ display: 'flex', gap: '0.15rem' }}>
          {Array.from({ length: maxStars }, (_, i) => i + 1).map(s => (
            <Star key={s} size={18}
              fill={s <= Math.round(avg) ? 'var(--btb-oliv, #8fa942)' : 'none'}
              stroke={s <= Math.round(avg) ? 'var(--btb-oliv, #8fa942)' : '#ccc'}
            />
          ))}
        </div>
        <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>
          ({count} {count === 1 ? 'Erfahrung' : 'Erfahrungen'})
        </span>
      </div>

      {/* Distribution bars (Amazon-style) */}
      {distribution && count > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {Array.from({ length: maxStars }, (_, i) => maxStars - i).map(stars => {
            const starCount = distribution[stars] || 0
            const pct = count > 0 ? Math.round((starCount / count) * 100) : 0
            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ width: 45, textAlign: 'right', color: 'var(--btb-dunkel)', opacity: 0.7 }}>
                  {stars} {stars === 1 ? 'Stern' : 'Sterne'}
                </span>
                <div style={{
                  flex: 1, height: 10, borderRadius: 5,
                  background: 'rgba(143,169,66,0.12)',
                  overflow: 'hidden',
                  maxWidth: 200,
                }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: 'var(--btb-oliv, #8fa942)',
                    borderRadius: 5,
                    transition: 'width 0.3s',
                  }} />
                </div>
                <span style={{ width: 70, fontSize: '0.75rem', opacity: 0.5 }}>
                  {starCount}/{count} ({pct}%)
                </span>
              </div>
            )
          })}
          <p style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '0.25rem', fontStyle: 'italic' }}>
            6-Sterne-Skala — bewusst gewählt um differenzierteres Feedback zu ermöglichen.
          </p>
        </div>
      )}
    </div>
  )
}
