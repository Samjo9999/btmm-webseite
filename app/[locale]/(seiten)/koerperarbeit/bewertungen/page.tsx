'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { ReviewsSection } from '@/components/ReviewsSection'
import { NextAvailabilityFloat } from '@/components/NextAvailabilityFloat'
import contactData from '@/data/contact.json'

export default function BewertungenPage() {
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
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80"
          alt="Gemeinschaft und Vertrauen"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80"
          alt="Gemeinschaft und Vertrauen"
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
            Kundenerfahrungen
          </h1>
          <p style={{ color: 'var(--btb-oliv)', fontFamily: 'var(--font-garamond)', fontStyle: 'italic' }}>
            Was unsere Kunden erleben
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <ReviewsSection companyId={contactData.company_id ?? '396ad7a6-e4d1-4c7d-abc1-ef9f2c4c2da9'} />
          </SectionReveal>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link href="/koerperarbeit/preise" className="btn-primary">
              Termin buchen
            </Link>
            <Link href="/koerperarbeit/preise" className="btn-secondary">
              Preise ansehen
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
