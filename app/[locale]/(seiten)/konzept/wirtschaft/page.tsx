import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Wirtschaft – BtMM Konzept',
  description: 'Pool, Dreiteilung, BtMM-Coin, EK-Preis-Vorteil und Modellrechnungen: Das wirtschaftliche Fundament von Back to Meaning Maximization.',
}

export default async function WirtschaftPage() {
  const t = await getTranslations('konzept')

  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#1a0505',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
      }}>
        <Image
          src="https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1920&q=80"
          alt="Weizenfeld – Wirtschaft die nährt"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1920&q=80"
          alt="Weizenfeld – Wirtschaft die nährt"
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
            {t('wirtschaft.titel')}
          </h1>
          <p style={{
            color: 'var(--btb-oliv)',
            fontFamily: 'var(--font-garamond)',
            fontStyle: 'italic',
            fontSize: '1.1rem',
          }}>
            {t('wirtschaft.untertitel')}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb prose-btb" style={{ maxWidth: 800 }}>

          {/* Intro */}
          <SectionReveal>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
              {t('wirtschaft.intro')}
            </p>
          </SectionReveal>

          {/* Pool */}
          <SectionReveal delay={0.1}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-rot)', marginBottom: '1rem' }}>
              {t('wirtschaft.pool_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>{t('wirtschaft.pool_text')}</p>
            <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{t('wirtschaft.pool_detail')}</p>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Dreiteilung */}
          <SectionReveal delay={0.15}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-rot)', marginBottom: '1rem' }}>
              {t('wirtschaft.dreiteilung_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{t('wirtschaft.dreiteilung_text')}</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              {['verguetung', 'reinvest', 'sozial'].map((key) => (
                <div key={key} className="card-btb" style={{ borderLeft: '4px solid var(--btb-oliv)', paddingLeft: '1.5rem' }}>
                  <p style={{ fontWeight: 600, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    {t(`wirtschaft.dreiteilung_${key}`)}
                  </p>
                </div>
              ))}
            </div>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Stundensatz */}
          <SectionReveal delay={0.2}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-rot)', marginBottom: '1rem' }}>
              {t('wirtschaft.stundensatz_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{t('wirtschaft.stundensatz_text')}</p>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Coin */}
          <SectionReveal delay={0.25}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-rot)', marginBottom: '1rem' }}>
              {t('wirtschaft.coins_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>{t('wirtschaft.coins_text')}</p>
            <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{t('wirtschaft.coins_detail')}</p>
            <blockquote style={{
              borderLeft: '4px solid var(--btb-oliv)',
              paddingLeft: '1.5rem',
              fontStyle: 'italic',
              color: 'var(--btb-dunkel)',
              opacity: 0.8,
              marginBottom: '2rem',
            }}>
              {t('wirtschaft.coins_itadakimasu')}
            </blockquote>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* EK-Preis-Vorteil */}
          <SectionReveal delay={0.3}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-rot)', marginBottom: '1rem' }}>
              {t('wirtschaft.ek_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>{t('wirtschaft.ek_text')}</p>
            <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.3rem', color: 'var(--btb-oliv)', marginBottom: '0.75rem' }}>
              {t('wirtschaft.geringverdiener_titel')}
            </h3>
            <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{t('wirtschaft.geringverdiener_text')}</p>
            <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.3rem', color: 'var(--btb-oliv)', marginBottom: '0.75rem' }}>
              {t('wirtschaft.mittelschicht_titel')}
            </h3>
            <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{t('wirtschaft.mittelschicht_text')}</p>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Modellrechnungen */}
          <SectionReveal delay={0.35}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-rot)', marginBottom: '1rem' }}>
              {t('wirtschaft.modell_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{t('wirtschaft.modell_text')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {['phase1', 'phase2', 'phase3', 'phase4', 'phase5'].map((key, i) => (
                <div key={key} style={{
                  padding: '0.75rem 1rem',
                  background: i === 4 ? 'var(--btb-oliv)' : 'var(--btb-creme)',
                  color: i === 4 ? 'var(--btb-weiss)' : 'var(--btb-dunkel)',
                  borderRadius: 8,
                  fontSize: '0.95rem',
                  fontWeight: i === 4 ? 600 : 400,
                }}>
                  {t(`wirtschaft.modell_${key}`)}
                </div>
              ))}
            </div>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Megafirma */}
          <SectionReveal delay={0.4}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-rot)', marginBottom: '1rem' }}>
              {t('wirtschaft.megafirma_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>{t('wirtschaft.megafirma_text')}</p>
            <p style={{ lineHeight: 1.8, marginBottom: '2rem', fontStyle: 'italic' }}>{t('wirtschaft.megafirma_unesco')}</p>
          </SectionReveal>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link href="/konzept/gemeinschaft" className="btn-primary">
              Weiter: Gemeinschaft
            </Link>
            <Link href="/konzept" className="btn-secondary">
              Zurück zur Übersicht
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
