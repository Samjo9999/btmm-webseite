import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { NextAvailabilityFloat } from '@/components/NextAvailabilityFloat'
import contactData from '@/data/contact.json'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Für wen ist Körperarbeit? – BtMM Freiburg',
  description: 'Für wen ist BtMM-Körperarbeit geeignet? Indikationen, Zielgruppe und Hinweise für ganzheitliche Begleitung in Freiburg.',
}

export default async function FuerWenPage() {
  const t = await getTranslations('koerperarbeit')

  const indikationen = [
    t('fuer_wen.indikation1'),
    t('fuer_wen.indikation2'),
    t('fuer_wen.indikation3'),
    t('fuer_wen.indikation4'),
    t('fuer_wen.indikation5'),
    t('fuer_wen.indikation6'),
    t('fuer_wen.indikation7'),
    t('fuer_wen.indikation8'),
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
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80"
          alt="Bewegung und Körperarbeit für alle"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80"
          alt="Bewegung und Körperarbeit für alle"
        />
        <div className="hero-text" style={{ maxWidth: 640, position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'var(--btb-creme)', opacity: 0.6, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <Link href="/koerperarbeit" style={{ color: 'var(--btb-creme)', opacity: 0.6 }}>Körperarbeit</Link> ›
          </p>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--btb-creme)',
          }}>
            {t('fuer_wen.titel')}
          </h1>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <p style={{ lineHeight: 1.85, fontSize: '1.1rem', opacity: 0.85, marginBottom: '2.5rem' }}>
              {t('fuer_wen.text')}
            </p>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '2.5rem',
            }}>
              <div style={{
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                maxWidth: 600,
                width: '100%',
              }}>
                <Image
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
                  alt="Rücken und Körperhaltung — wo Spannungsmuster entstehen"
                  width={800}
                  height={533}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.15}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', color: 'var(--btb-oliv)', fontSize: '1.8rem', marginBottom: '1.25rem' }}>
              {t('fuer_wen.indikationen_titel')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
              {indikationen.map((ind, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--btb-creme)',
                  borderRadius: 8,
                }}>
                  <CheckCircle size={20} style={{ color: 'var(--btb-oliv)', flexShrink: 0 }} />
                  <span style={{ lineHeight: 1.5 }}>{ind}</span>
                </div>
              ))}
            </div>
          </SectionReveal>

          <SectionReveal delay={0.3}>
            <div style={{
              background: 'rgba(182,24,24,0.05)',
              border: '1.5px solid rgba(182,24,24,0.2)',
              borderRadius: 12, padding: '1.5rem',
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
              marginBottom: '2.5rem',
            }}>
              <AlertCircle size={22} style={{ color: 'var(--btb-rot)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-garamond)',
                  color: 'var(--btb-rot)',
                  fontSize: '1.1rem',
                  marginBottom: '0.4rem',
                }}>
                  {t('fuer_wen.nicht_fuer_titel')}
                </h3>
                <p style={{ lineHeight: 1.7, fontSize: '0.95rem', opacity: 0.8 }}>
                  {t('fuer_wen.nicht_fuer_text')}
                </p>
              </div>
            </div>
          </SectionReveal>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/koerperarbeit/preise" className="btn-primary">
              Termin buchen
            </Link>
            <Link href="/koerperarbeit/preise" className="btn-secondary">
              Preise
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
