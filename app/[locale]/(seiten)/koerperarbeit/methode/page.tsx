import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { NextAvailabilityFloat } from '@/components/NextAvailabilityFloat'
import contactData from '@/data/contact.json'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Methode – Körperarbeit Freiburg | BtMM',
  description: 'Die BtMM-Methode der Körperarbeit: achtsame Präsenz, Begleitung statt Führung, Integration. Ganzheitliche Körperarbeit Freiburg.',
}

export default async function MethodePage() {
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
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&q=80"
          alt="Achtsamkeit und Präsenz"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&q=80"
          alt="Achtsamkeit und Präsenz"
        />
        <div className="hero-text" style={{ maxWidth: 640, position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'var(--btb-creme)', opacity: 0.6, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <Link href="/koerperarbeit" style={{ color: 'var(--btb-creme)', opacity: 0.6 }}>Körperarbeit</Link> ›
          </p>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--btb-creme)',
            marginBottom: '1rem',
          }}>
            {t('methode.titel')}
          </h1>
          <p style={{
            color: 'var(--btb-oliv)',
            fontFamily: 'var(--font-garamond)',
            fontStyle: 'italic',
            fontSize: '1.1rem',
          }}>
            {t('methode.untertitel')}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <p style={{ lineHeight: 1.85, fontSize: '1.1rem', color: 'var(--btb-dunkel)', opacity: 0.85, marginBottom: '1.5rem' }}>
              {t('methode.text1')}
            </p>
            <p style={{ lineHeight: 1.85, fontSize: '1.1rem', color: 'var(--btb-dunkel)', opacity: 0.85, marginBottom: '3rem' }}>
              {t('methode.text2')}
            </p>
          </SectionReveal>

          <SectionReveal delay={0.15}>
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
                <Image
                  src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&q=80"
                  alt="Sanfte Berührung bei der Körperarbeit — achtsame Hände auf dem Rücken"
                  width={800}
                  height={533}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.2}>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              color: 'var(--btb-oliv)',
              fontSize: '1.8rem',
              marginBottom: '1.5rem',
            }}>
              {t('methode.prinzipien_titel')}
            </h2>
          </SectionReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[
              { titel: t('methode.prinzip1_titel'), text: t('methode.prinzip1_text') },
              { titel: t('methode.prinzip2_titel'), text: t('methode.prinzip2_text') },
              { titel: t('methode.prinzip3_titel'), text: t('methode.prinzip3_text') },
            ].map((item, i) => (
              <SectionReveal key={i} delay={0.3 + i * 0.12}>
                <div className="card-btb" style={{ border: '1.5px solid rgba(143,169,66,0.2)' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-garamond)',
                    color: 'var(--btb-rot)',
                    fontSize: '1.15rem',
                    marginBottom: '0.5rem',
                  }}>
                    {item.titel}
                  </h3>
                  <p style={{ lineHeight: 1.7, opacity: 0.75, fontSize: '0.95rem' }}>
                    {item.text}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal delay={0.4}>
            <div style={{
              background: 'rgba(182,24,24,0.05)',
              border: '1.5px solid rgba(182,24,24,0.2)',
              borderRadius: 12, padding: '1.5rem',
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
              marginBottom: '2rem',
            }}>
              <AlertCircle size={22} style={{ color: 'var(--btb-rot)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-garamond)',
                  color: 'var(--btb-rot)',
                  fontSize: '1.1rem',
                  marginBottom: '0.4rem',
                }}>
                  Wichtiger Hinweis
                </h3>
                <p style={{ lineHeight: 1.7, fontSize: '0.95rem', opacity: 0.8 }}>
                  Diese Methode ersetzt keine medizinische oder psychotherapeutische Behandlung. Bei akuten gesundheitlichen Beschwerden konsultieren Sie bitte einen Arzt oder Heilpraktiker.
                </p>
              </div>
            </div>
          </SectionReveal>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/koerperarbeit/ablauf" className="btn-primary">
              Weiter: Ablauf
            </Link>
            <Link href="/koerperarbeit/preise" className="btn-oliv">
              Preise & Buchen
            </Link>
            <Link href="/koerperarbeit" className="btn-secondary">
              Zurück
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
