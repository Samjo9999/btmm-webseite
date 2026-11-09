import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'International – BtMM Konzept',
  description: 'Einheitliches System, weltweite Zellen und politische Wirkung durch Existenz: Die internationale Vision von Back to Meaning Maximization.',
}

export default async function InternationalPage() {
  const t = await getTranslations('konzept')

  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#0a1a05',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
      }}>
        <Image
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80"
          alt="Sonnenstrahlen durch Berge – weltweite Vision"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80"
          alt="Sonnenstrahlen durch Berge – weltweite Vision"
        />
        <div className="hero-text" style={{ maxWidth: 640, position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'var(--btb-creme)', opacity: 0.6, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <Link href="/konzept" style={{ color: 'var(--btb-creme)', opacity: 0.6 }}>Konzept</Link> ›
          </p>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--btb-creme)',
            marginBottom: '1rem',
          }}>
            {t('international.titel')}
          </h1>
          <p style={{
            color: 'var(--btb-oliv)',
            fontFamily: 'var(--font-garamond)',
            fontStyle: 'italic',
            fontSize: '1.1rem',
          }}>
            {t('international.untertitel')}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb prose-btb" style={{ maxWidth: 800 }}>

          {/* Intro */}
          <SectionReveal>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
              {t('international.intro')}
            </p>
          </SectionReveal>

          {/* Vision */}
          <SectionReveal delay={0.1}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-oliv)', marginBottom: '1rem' }}>
              {t('international.vision_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{t('international.vision_text')}</p>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Einheit */}
          <SectionReveal delay={0.15}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-oliv)', marginBottom: '1rem' }}>
              {t('international.einheit_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>{t('international.einheit_text')}</p>
            <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{t('international.einheit_detail')}</p>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Zellen weltweit */}
          <SectionReveal delay={0.2}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-oliv)', marginBottom: '1rem' }}>
              {t('international.zellen_weltweit_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{t('international.zellen_weltweit_text')}</p>
          </SectionReveal>

          {/* Politische Wirkung */}
          <SectionReveal delay={0.3}>
            <hr className="divider-btb" />
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-oliv)', marginBottom: '1rem' }}>
              {t('international.politische_wirkung_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{t('international.politische_wirkung_text')}</p>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Sinnmaximierung */}
          <SectionReveal delay={0.35}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-oliv)', marginBottom: '1rem' }}>
              {t('international.sinnmaximierung_titel')}
            </h2>
            <blockquote style={{
              borderLeft: '4px solid var(--btb-oliv)',
              paddingLeft: '1.5rem',
              fontStyle: 'italic',
              color: 'var(--btb-dunkel)',
              opacity: 0.8,
              marginBottom: '2rem',
            }}>
              {t('international.sinnmaximierung_text')}
            </blockquote>
          </SectionReveal>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link href="/konzept" className="btn-secondary">
              Zurück zur Übersicht
            </Link>
            <Link href="/mitmachen" className="btn-primary">
              Mitmachen
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
