import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { AngeboteAccordion } from '@/components/AngeboteAccordion'
import { CancellationForm } from '@/components/CancellationForm'

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

      {/* Stornierung */}
      <section style={{ background: 'var(--btb-weiss)', padding: '2rem 1.5rem' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <div style={{
            borderRadius: 12,
            border: '2px solid rgba(42,124,171,0.3)',
            background: 'rgba(255,255,255,0.5)',
            overflow: 'hidden',
          }}>
            <details>
              <summary style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontFamily: 'var(--font-garamond)',
                fontSize: '1.3rem',
                color: 'var(--btb-dunkel)',
                listStyle: 'none',
              }}>
                <div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'white',
                    background: 'var(--btb-blau, #2a7cab)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 4,
                    marginRight: '0.5rem',
                  }}>
                    Service
                  </span>
                  Termin stornieren
                </div>
              </summary>
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem', lineHeight: 1.6 }}>
                  Gib deine Buchungs-ID und E-Mail-Adresse ein um einen Termin zu stornieren.
                  Die Buchungs-ID findest du in deiner Bestaetigungs-E-Mail.
                </p>
                <CancellationForm />
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Angebote mit Tree Pose */}
      <section className="section" style={{ background: 'var(--btb-creme)', position: 'relative', overflow: 'hidden' }}>
        {/* Tree Pose Silhouette im Hintergrund */}
        <div style={{
          position: 'absolute',
          right: '-2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '300px',
          height: '600px',
          opacity: 0.08,
          pointerEvents: 'none',
        }}>
          <Image
            src="/tree-pose.svg"
            alt=""
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div className="container-btb" style={{ maxWidth: 800, position: 'relative', zIndex: 1 }}>
          <SectionReveal>
            <AngeboteAccordion />
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
