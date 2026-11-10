'use client'

import { CommunityExperiencesSection } from '@/components/CommunityExperiencesSection'

export default function ErfahrungenPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--btb-creme, var(--btmm-hell))' }}>
      {/* Hero */}
      <section style={{
        position: 'relative',
        height: '40vh',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img
          src="/images/stock/wiesenlicht.webp"
          alt="Gemeinschaft"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(42,16,40,0.5), rgba(42,16,40,0.7))',
        }} />
        <div style={{ position: 'relative', textAlign: 'center', color: 'var(--btb-creme, var(--btmm-hell))' }}>
          <h1 style={{
            fontFamily: 'var(--font-garamond, "EB Garamond", serif)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}>
            Erfahrungen mit Back to Meaning Maximization
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Was unsere Gemeinschaft bewegt
          </p>
        </div>
      </section>

      <CommunityExperiencesSection showAll />
    </main>
  )
}
