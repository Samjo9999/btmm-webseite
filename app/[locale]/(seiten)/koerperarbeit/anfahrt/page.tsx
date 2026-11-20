import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Clock, Phone, Mail } from 'lucide-react'
import contactData from '@/data/contact.json'

export const metadata: Metadata = {
  title: 'Anfahrt – Körperarbeit Freiburg',
  description: 'Körperarbeit in Freiburg im Breisgau, Termine nach Absprache. Kontakt zum Gründer per Telefon, E-Mail oder Kontaktformular.',
}

export default function AnfahrtPage() {
  return (
    <>
      <section style={{
        background: 'var(--btb-weiss)',
        padding: '2rem 1.5rem 0',
      }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <p style={{ color: 'var(--btb-dunkel)', opacity: 0.6, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <Link href="/koerperarbeit" style={{ color: 'var(--btb-dunkel)', opacity: 0.6, textDecoration: 'none' }}>Körperarbeit</Link>
            {' › Anfahrt'}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            color: 'var(--btb-dunkel)',
            marginBottom: '0.5rem',
          }}>
            Ort &amp; Anfahrt
          </h1>
          <p style={{ opacity: 0.6, marginBottom: '2rem', lineHeight: 1.7 }}>
            Ganzheitliche Körperarbeit in Freiburg im Breisgau.
          </p>

          {/* Ort */}
          <div style={{
            background: 'var(--btb-creme)',
            borderRadius: 12,
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}>
            <MapPin size={24} style={{ color: 'var(--btb-rot)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--btb-dunkel)', marginBottom: '0.25rem' }}>
                {contactData.gruender_name} · Gründer
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--btb-dunkel)', lineHeight: 1.6 }}>
                {contactData.adresse.strasse}<br />
                {contactData.adresse.plz} {contactData.adresse.ort}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--btb-dunkel)', opacity: 0.7, marginTop: '0.5rem', lineHeight: 1.6 }}>
                Das ist die Postanschrift des Gründers, kein Praxisraum. Termine finden in Freiburg nach Absprache statt – den Ort Ihres Termins sprechen wir mit Ihnen ab.
              </p>
            </div>
          </div>

          {/* Vor dem Termin */}
          <div style={{
            background: 'rgba(182,24,24,0.04)',
            border: '1.5px solid rgba(182,24,24,0.1)',
            borderRadius: 12,
            padding: '1.25rem',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Clock size={20} style={{ color: 'var(--btb-rot)' }} />
              <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.1rem', color: 'var(--btb-dunkel)' }}>
                Vor dem Termin
              </h2>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--btb-dunkel)', opacity: 0.8 }}>
              Bitte kommen Sie 5 Minuten vor Ihrem Termin.
              Tragen Sie bequeme Kleidung — die Arbeit findet in entspannter Atmosphäre statt.
            </p>
          </div>

          {/* Kontakt */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '1rem' }}>
              Fragen? Schreiben Sie mir oder rufen Sie an.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
              <a href={`tel:${contactData.telefon.replace(/\s/g, '')}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                color: 'var(--btb-blau)', fontWeight: 600, textDecoration: 'none',
              }}>
                <Phone size={16} /> {contactData.telefon}
              </a>
              <a href={`mailto:${contactData.email}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                color: 'var(--btb-blau)', fontWeight: 600, textDecoration: 'none',
              }}>
                <Mail size={16} /> {contactData.email}
              </a>
              <Link href="/koerperarbeit/kontakt" style={{ color: 'var(--btb-blau)', fontWeight: 600, textDecoration: 'none' }}>
                Kontaktformular
              </Link>
              <Link href="/koerperarbeit/preise" className="btn-primary" style={{ fontSize: '0.9rem' }}>
                Termin buchen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
