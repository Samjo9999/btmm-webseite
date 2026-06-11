// import Image (use <img>) 
import { useTranslation } from 'react-i18next'
import { setRequestLocale } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { NextAvailabilityFloat } from '@/components/NextAvailabilityFloat'
import contactData from '@/data/contact.json'


export default function KoerperarbeitPage() {
  const { t } = useTranslation('koerperarbeit')
  const tc = await getTranslations('common')

  const navLinks = [
    { href: '/koerperarbeit/methode', label: 'Methode' },
    { href: '/koerperarbeit/ablauf', label: 'Ablauf' },
    { href: '/koerperarbeit/fuer-wen', label: 'Für wen?' },
    { href: '/koerperarbeit/preise', label: 'Preise & Buchen' },
    { href: '/koerperarbeit/ueber', label: 'Über Samjo' },
    { href: '/koerperarbeit/anfahrt', label: 'Anfahrt' },
    { href: '/koerperarbeit/kontakt', label: 'Kontakt' },
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
        <img 
          src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1920&q=80"
          alt="Balance und Ruhe"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1920&q=80"
          alt="Balance und Ruhe"
        />
        <div className="hero-text" style={{ maxWidth: 680, position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            color: 'var(--btb-rot, #b61818)',
            marginBottom: '0.25rem',
          }}>
            {t('landing.titel')}
          </h1>
          <p style={{
            color: 'var(--btb-rot, #b61818)',
            fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
            fontFamily: 'var(--font-garamond)',
            marginBottom: '0.5rem',
          }}>
            Körperarbeit
          </p>
          <p style={{
            color: 'var(--btb-oliv)',
            fontSize: '1.15rem',
            fontFamily: 'var(--font-garamond)',
            fontStyle: 'italic',
            marginBottom: '1.5rem',
          }}>
            {t('landing.untertitel')}
          </p>
          <p style={{ color: 'var(--btb-creme)', opacity: 0.8, lineHeight: 1.75, marginBottom: '2rem', maxWidth: 540, margin: '0 auto 2rem' }}>
            {t('landing.text')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <RouterLink  to="/koerperarbeit/preise" className="btn-primary">
              {t('landing.cta_termin')}
            </RouterLink>
            <RouterLink  to="/koerperarbeit/methode" style={{
              background: 'transparent',
              border: '2px solid var(--btb-creme)',
              color: 'var(--btb-creme)',
              borderRadius: 8,
              padding: '0.75rem 1.75rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              {t('landing.cta_methode')}
            </RouterLink>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {navLinks.slice(0, 6).map((item, i) => (
              <SectionReveal key={i} delay={i * 0.1}>
                <RouterLink  to={item.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="card-btb" style={{
                    border: '1.5px solid var(--btb-creme)',
                    transition: 'transform 0.2s ease',
                  }}>
                    <h3 style={{
                      fontFamily: 'var(--font-garamond)',
                      fontSize: '1.2rem',
                      color: 'var(--btb-oliv)',
                      marginBottom: '0.5rem',
                    }}>
                      {item.label}
                    </h3>
                  </div>
                </RouterLink>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
