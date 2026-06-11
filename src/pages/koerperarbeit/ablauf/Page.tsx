// import Image (use <img>) 
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { NextAvailabilityFloat } from '@/components/NextAvailabilityFloat'
import contactData from '@/data/contact.json'


export default function AblaufPage() {
  const { t } = useTranslation('koerperarbeit')

  const schritte = [
    { nummer: '01', titel: t('ablauf.schritt1_titel'), text: t('ablauf.schritt1_text') },
    { nummer: '02', titel: t('ablauf.schritt2_titel'), text: t('ablauf.schritt2_text') },
    { nummer: '03', titel: t('ablauf.schritt3_titel'), text: t('ablauf.schritt3_text') },
    { nummer: '04', titel: t('ablauf.schritt4_titel'), text: t('ablauf.schritt4_text') },
  ]

  return (
    <>
      <NextAvailabilityFloat companyId={contactData.company_id ?? ''} />
      <section className="hero-section">
        <img
          src="https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=1920&q=80"
          alt="Ruhiger Behandlungsraum — Raum für Veränderung"
          style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=1920&q=80"
          alt="Ruhiger Behandlungsraum — Raum für Veränderung"
        />
        <div className="hero-text" style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'var(--btb-creme)', opacity: 0.6, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <RouterLink  to="/koerperarbeit" style={{ color: 'var(--btb-creme)', opacity: 0.6 }}>Körperarbeit</RouterLink> ›
          </p>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--btb-creme)',
            marginBottom: '0.5rem',
          }}>
            {t('ablauf.titel')}
          </h1>
          <p style={{ color: 'var(--btb-oliv)', fontFamily: 'var(--font-garamond)', fontStyle: 'italic', fontSize: '1.1rem' }}>
            {t('ablauf.untertitel')}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '3rem',
            }}>
              <div style={{
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                maxWidth: 600,
                width: '100%',
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&q=80"
                  alt="Ruhiger Behandlungsraum mit warmem Licht — Raum für Körperarbeit"
                  width={800}
                  height={533}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>
          </SectionReveal>

          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: 28, top: 0, bottom: 0, width: 2,
              background: 'var(--btb-creme)',
            }} />

            {schritte.map((schritt, i) => (
              <SectionReveal key={i} delay={i * 0.18}>
                <div style={{
                  display: 'flex', gap: '2rem',
                  marginBottom: '3rem',
                  position: 'relative',
                }}>
                  {/* Number bubble */}
                  <div style={{
                    flexShrink: 0,
                    width: 56, height: 56,
                    borderRadius: '50%',
                    background: 'var(--btb-oliv)',
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-garamond)',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    position: 'relative', zIndex: 1,
                  }}>
                    {schritt.nummer}
                  </div>

                  <div style={{ paddingTop: '0.75rem' }}>
                    <h2 style={{
                      fontFamily: 'var(--font-garamond)',
                      color: 'var(--btb-dunkel)',
                      fontSize: '1.5rem',
                      marginBottom: '0.6rem',
                    }}>
                      {schritt.titel}
                    </h2>
                    <p style={{ lineHeight: 1.8, color: 'var(--btb-dunkel)', opacity: 0.75, fontSize: '1rem' }}>
                      {schritt.text}
                    </p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <RouterLink  to="/koerperarbeit/preise" className="btn-primary">
              Termin buchen
            </RouterLink>
            <RouterLink  to="/koerperarbeit/fuer-wen" className="btn-secondary">
              Für wen ist das?
            </RouterLink>
          </div>
        </div>
      </section>
    </>
  )
}
