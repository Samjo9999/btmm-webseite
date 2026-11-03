import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import { Download, Mail, Clock, Users, Globe, Scale } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('presse')
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  }
}

const kernaussagen = [
  {
    key: 'gleichwuerdig' as const,
    icon: Scale,
    color: 'var(--btb-rot)',
  },
  {
    key: 'infrastruktur' as const,
    icon: Users,
    color: 'var(--btb-blau)',
  },
  {
    key: 'international' as const,
    icon: Globe,
    color: 'var(--btb-oliv)',
  },
]

const downloads = [
  { key: 'logo_png' as const, href: '/press/logo.png' },
]

export default async function PressePage() {
  const t = await getTranslations('presse')

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
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
          alt="Berggipfel – Weitblick"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
          alt="Berggipfel – Weitblick"
        />
        <div className="hero-text" style={{ maxWidth: 680, position: 'relative', zIndex: 2 }}>
          <SectionReveal>
            <h1 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
              color: 'var(--btb-creme)',
              marginBottom: '1rem',
            }}>
              {t('hero.titel')}
            </h1>
            <p style={{
              color: 'var(--btb-oliv)',
              fontSize: '1.1rem',
              fontFamily: 'var(--font-garamond)',
              fontStyle: 'italic',
              marginBottom: '2rem',
            }}>
              {t('hero.untertitel')}
            </p>
            <a
              href="mailto:office@b-m-m.com"
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Mail size={18} />
              {t('hero.kontakt_button')}
            </a>
          </SectionReveal>
        </div>
      </section>

      {/* Kurzprofil */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 780 }}>
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '2rem',
              color: 'var(--btb-oliv)',
              marginBottom: '1.5rem',
            }}>
              {t('kurzprofil.titel')}
            </h2>
            <p style={{ lineHeight: 1.75, marginBottom: '2rem', opacity: 0.85 }}>
              {t('kurzprofil.beschreibung')}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'max-content 1fr',
              gap: '0.75rem 2rem',
              fontSize: '1rem',
            }}>
              {(['rechtsform', 'gruendungsort', 'gruendungsjahr', 'website'] as const).map((field) => (
                <>
                  <span key={`${field}-label`} style={{ fontWeight: 600, color: 'var(--btb-dunkel)' }}>
                    {t(`kurzprofil.${field}_label`)}
                  </span>
                  <span key={`${field}-value`} style={{ color: 'var(--btb-dunkel)', opacity: 0.8 }}>
                    {t(`kurzprofil.${field}`)}
                  </span>
                </>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Kernaussagen */}
      <section className="section" style={{ background: 'var(--btb-creme)' }}>
        <div className="container-btb">
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '2rem',
              color: 'var(--btb-oliv)',
              textAlign: 'center',
              marginBottom: '2.5rem',
            }}>
              {t('kernaussagen.titel')}
            </h2>
          </SectionReveal>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {kernaussagen.map((item, i) => {
              const Icon = item.icon
              return (
                <SectionReveal key={item.key} delay={i * 0.15}>
                  <div className="card-btb" style={{
                    height: '100%',
                    border: `2px solid ${item.color}22`,
                    textAlign: 'center',
                    padding: '2.5rem 2rem',
                  }}>
                    <Icon size={40} style={{ color: item.color, marginBottom: '1rem' }} />
                    <h3 style={{
                      fontFamily: 'var(--font-garamond)',
                      fontSize: '1.4rem',
                      color: item.color,
                      marginBottom: '0.75rem',
                    }}>
                      {t(`kernaussagen.${item.key}.titel`)}
                    </h3>
                    <p style={{ color: 'var(--btb-dunkel)', opacity: 0.75, lineHeight: 1.7 }}>
                      {t(`kernaussagen.${item.key}.text`)}
                    </p>
                  </div>
                </SectionReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Downloads */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 780 }}>
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '2rem',
              color: 'var(--btb-oliv)',
              marginBottom: '2rem',
            }}>
              {t('downloads.titel')}
            </h2>
          </SectionReveal>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}>
            {downloads.map((item, i) => (
              <SectionReveal key={item.key} delay={i * 0.1}>
                <a
                  href={item.href}
                  download
                  className="card-btb press-download-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    textDecoration: 'none',
                    color: 'var(--btb-dunkel)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={24} style={{ color: 'var(--btb-blau)', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      {t(`downloads.${item.key}`)}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--btb-blau)', fontWeight: 500 }}>
                      {t('downloads.herunterladen')}
                    </p>
                  </div>
                </a>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pressekontakt */}
      <section className="section" style={{ background: 'var(--btb-creme)' }}>
        <div className="container-btb" style={{ maxWidth: 580, textAlign: 'center' }}>
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '2rem',
              color: 'var(--btb-oliv)',
              marginBottom: '2rem',
            }}>
              {t('kontakt.titel')}
            </h2>
            <div className="card-btb" style={{ padding: '2.5rem 2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {t('kontakt.name_label')}
                </p>
                <p style={{ opacity: 0.8 }}>{t('kontakt.name')}</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {t('kontakt.email_label')}
                </p>
                <p>
                  <a
                    href={`mailto:${t('kontakt.email')}`}
                    style={{ color: 'var(--btb-blau)', fontWeight: 500 }}
                  >
                    {t('kontakt.email')}
                  </a>
                </p>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: 'var(--btb-oliv)',
                fontSize: '0.9rem',
                marginTop: '1.5rem',
              }}>
                <Clock size={16} />
                <p style={{ margin: 0 }}>{t('kontakt.hinweis')}</p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
