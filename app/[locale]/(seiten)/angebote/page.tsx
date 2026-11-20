import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { AngeboteAccordion } from '@/components/AngeboteAccordion'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('angebote')
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

export default async function AngebotePage() {
  const t = await getTranslations('angebote')

  return (
    <>
      {/* Hero */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1505',
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
      }}>
        <Image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80"
          alt="Berglandschaft – Natur als Inspiration"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80"
          alt="Berglandschaft – Natur als Inspiration"
        />
        <div className="hero-text" style={{ maxWidth: 680, position: 'relative', zIndex: 2 }}>
          <SectionReveal>
            <h1 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
              color: 'var(--btb-creme)',
              marginBottom: '1rem',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}>
              {t('hero.titel')}
            </h1>
            <p style={{
              color: 'var(--btb-oliv)',
              fontSize: '1.1rem',
              fontFamily: 'var(--font-garamond)',
              fontStyle: 'italic',
              textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            }}>
              {t('hero.untertitel')}
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Angebote */}
      <section className="section" style={{ background: 'var(--btb-creme)', position: 'relative', overflow: 'hidden' }}>
        <div className="container-btb" style={{ maxWidth: 800, position: 'relative', zIndex: 1 }}>
          <SectionReveal>
            <AngeboteAccordion />
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
