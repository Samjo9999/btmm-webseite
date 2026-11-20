import type { Metadata } from 'next'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Die BtMM-App – Back to Meaning Maximization',
  description: 'Die BtMM-App ist der digitale Workspace von BtMM. Login unter app.b-t-m-m.com.',
}

// Nutzer 20.11.2026: nur Link zur App und kurze Beschreibung, keine Funktionsliste.
export default async function AppPage() {
  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      background: '#0a0f1e',
      padding: '5rem 1.5rem 4rem', textAlign: 'center',
    }}>
      <Image
        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80"
        alt="Nebelwald – Technologie trifft Natur"
        fill
        style={{ objectFit: 'cover' }}
        priority
      />
      <HeroImageLightbox
        src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80"
        alt="Nebelwald – Technologie trifft Natur"
      />
      <div className="hero-text" style={{ maxWidth: 680, position: 'relative', zIndex: 2 }}>
        <h1 style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
          color: 'var(--btb-creme)',
          marginBottom: '1rem',
        }}>
          Die BtMM-App
        </h1>
        <p style={{ color: 'var(--btb-creme)', opacity: 0.85, lineHeight: 1.75, maxWidth: 520, margin: '0 auto 2rem' }}>
          Die BtMM-App ist der digitale Workspace von BtMM.
        </p>
        <a
          href="https://app.b-t-m-m.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          Zur App <ExternalLink size={16} />
        </a>
      </div>
    </section>
  )
}
