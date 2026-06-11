// import Image (use <img>) 
import { useTranslation } from 'react-i18next'
import { setRequestLocale } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { MapPin, Mail, Phone } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { NextAvailabilityFloat } from '@/components/NextAvailabilityFloat'
import { ContactForm } from '@/components/ContactForm'
import contactData from '@/data/contact.json'


export default function KontaktPage() {
  const { t } = useTranslation('koerperarbeit')

  return (
    <>
      <NextAvailabilityFloat companyId={contactData.company_id ?? ''} />
      <section className="hero-section">
        <img 
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
          alt="Freiburg im Breisgau — Schwarzwald"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
          alt="Freiburg im Breisgau — Schwarzwald"
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
            {t('kontakt.titel')}
          </h1>
          <p style={{ color: 'var(--btb-oliv)', fontFamily: 'var(--font-garamond)', fontStyle: 'italic' }}>
            {t('kontakt.untertitel')}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'start',
          }}>
            {/* Kontaktformular */}
            <SectionReveal>
              <h2 style={{
                fontFamily: 'var(--font-garamond)',
                color: 'var(--btb-oliv)',
                fontSize: '1.5rem',
                marginBottom: '1.5rem',
              }}>
                {t('kontakt.formular_titel')}
              </h2>
              <ContactForm
                typ="koerperarbeit"
                betreff="Körperarbeit – Anfrage"
                placeholder="Deine Frage oder Anmerkung..."
              />
            </SectionReveal>

            {/* Kontaktdaten & Anfahrt */}
            <SectionReveal delay={0.2}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-garamond)',
                  color: 'var(--btb-oliv)',
                  fontSize: '1.5rem',
                  marginBottom: '1.5rem',
                }}>
                  {t('kontakt.adresse_titel')}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <MapPin size={20} style={{ color: 'var(--btb-rot)', marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{contactData.adresse.strasse}</p>
                      <p style={{ opacity: 0.7 }}>{contactData.adresse.plz} {contactData.adresse.ort}</p>
                    </div>
                  </div>

                  <a
                    href={`mailto:${contactData.email}`}
                    style={{
                      display: 'flex', gap: '0.75rem', alignItems: 'center',
                      color: 'var(--btb-dunkel)', textDecoration: 'none',
                    }}
                  >
                    <Mail size={20} style={{ color: 'var(--btb-blau)', flexShrink: 0 }} />
                    <span>{contactData.email}</span>
                  </a>

                  {contactData.telefon !== '+49 (0) TODO' && (
                    <a
                      href={`tel:${contactData.telefon}`}
                      style={{
                        display: 'flex', gap: '0.75rem', alignItems: 'center',
                        color: 'var(--btb-dunkel)', textDecoration: 'none',
                      }}
                    >
                      <Phone size={20} style={{ color: 'var(--btb-blau)', flexShrink: 0 }} />
                      <span>{contactData.telefon}</span>
                    </a>
                  )}
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-garamond)',
                  color: 'var(--btb-oliv)',
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                }}>
                  {t('kontakt.anfahrt_titel')}
                </h2>

                {/* Map placeholder */}
                <div style={{
                  background: 'var(--btb-creme)',
                  borderRadius: 12, height: 220,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: '0.5rem',
                  color: 'var(--btb-dunkel)', opacity: 0.5,
                  border: '1px solid rgba(143,169,66,0.2)',
                }}>
                  <MapPin size={28} />
                  <p style={{ fontSize: '0.85rem' }}>TODO: Google Maps Embed</p>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <RouterLink  to="/koerperarbeit/preise" className="btn-primary">
                    Termin buchen
                  </RouterLink>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>
    </>
  )
}
