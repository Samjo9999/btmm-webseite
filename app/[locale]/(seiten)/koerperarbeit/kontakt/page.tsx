import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { MapPin, Mail, Phone } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { NextAvailabilityFloat } from '@/components/NextAvailabilityFloat'
import { ContactForm } from '@/components/ContactForm'
import contactData from '@/data/contact.json'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kontakt – Körperarbeit Freiburg',
  description: 'Kontakt für BtMM-Körperarbeit in Freiburg: Gründer Johannes-Samuel Gartzke, Telefon, E-Mail und Kontaktformular. Termine nach Absprache.',
}

export default async function KontaktPage() {
  const t = await getTranslations('koerperarbeit')

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
                      <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{t('kontakt.gruender')}</p>
                      <p style={{ lineHeight: 1.6 }}>
                        {contactData.adresse.strasse}<br />
                        {contactData.adresse.plz} {contactData.adresse.ort}
                      </p>
                      <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.25rem' }}>{t('kontakt.postanschrift_hinweis')}</p>
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

                  {contactData.telefon && (
                    <a
                      href={`tel:${contactData.telefon.replace(/\s/g, '')}`}
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

                <p style={{ lineHeight: 1.7, opacity: 0.8 }}>
                  {t('kontakt.anfahrt_text')}
                </p>

                <div style={{ marginTop: '1rem' }}>
                  <Link href="/koerperarbeit/preise" className="btn-primary">
                    Termin buchen
                  </Link>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>
    </>
  )
}
