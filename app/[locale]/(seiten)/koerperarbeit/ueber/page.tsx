import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { NextAvailabilityFloat } from '@/components/NextAvailabilityFloat'
import contactData from '@/data/contact.json'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Über den Begleiter – Körperarbeit Freiburg | BtMM',
  description: 'Samjo – Körperarbeiter und Begleiter bei Back to Meaning Maximization in Freiburg. Ausbildung, Ansatz und Hintergrund.',
}

export default async function UeberPage() {
  const t = await getTranslations('koerperarbeit')

  const qualifikationen = [
    t('ueber.qualifikation1'),
    t('ueber.qualifikation2'),
    t('ueber.qualifikation3'),
  ]

  return (
    <>
      <NextAvailabilityFloat companyId={contactData.company_id ?? ''} />
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#0d1a05',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
      }}>
        <Image
          src="https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1920&q=80"
          alt="Heilende Hände — Körperarbeit"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1920&q=80"
          alt="Heilende Hände — Körperarbeit"
        />
        <div className="hero-text" style={{ maxWidth: 640, position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'var(--btb-creme)', opacity: 0.6, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <Link href="/koerperarbeit" style={{ color: 'var(--btb-creme)', opacity: 0.6 }}>Körperarbeit</Link> ›
          </p>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--btb-creme)',
            marginBottom: '0.5rem',
          }}>
            {t('ueber.titel')}
          </h1>
          <p style={{ color: 'var(--btb-oliv)', fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: '1.2rem' }}>
            {t('ueber.name')}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'start',
          }}>
            <SectionReveal>
              <div style={{
                background: 'linear-gradient(135deg, var(--btb-creme), rgba(143,169,66,0.15))',
                borderRadius: 16, aspectRatio: '3/4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(143,169,66,0.2)',
              }}>
                <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>TODO: Portrait Samjo</p>
              </div>
            </SectionReveal>

            <SectionReveal delay={0.2}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-garamond)',
                  color: 'var(--btb-rot)',
                  fontSize: '2rem',
                  marginBottom: '1.5rem',
                }}>
                  {t('ueber.name')}
                </h2>

                <p style={{ lineHeight: 1.85, fontSize: '1.05rem', opacity: 0.85, marginBottom: '1.25rem' }}>
                  {t('ueber.text1')}
                </p>
                <p style={{ lineHeight: 1.85, fontSize: '1.05rem', opacity: 0.85, marginBottom: '2rem' }}>
                  {t('ueber.text2')}
                </p>

                <div style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  maxWidth: 600,
                  width: '100%',
                  marginBottom: '2rem',
                }}>
                  <Image
                    src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80"
                    alt="Körperarbeiter bei einer achtsamen Behandlung — Hände und Präsenz"
                    width={800}
                    height={533}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-garamond)',
                  color: 'var(--btb-oliv)',
                  fontSize: '1.3rem',
                  marginBottom: '1rem',
                }}>
                  {t('ueber.qualifikationen_titel')}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                  {qualifikationen.map((q, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <CheckCircle size={18} style={{ color: 'var(--btb-oliv)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.95rem', opacity: 0.8 }}>{q}</span>
                    </div>
                  ))}
                </div>

                <Link href="/koerperarbeit/preise" className="btn-primary">
                  Termin buchen
                </Link>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>
    </>
  )
}
