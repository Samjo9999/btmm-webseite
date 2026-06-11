// import Image (use <img>) 
import { Link as RouterLink } from 'react-router-dom'
import { Heart, Users, Building2, CheckCircle, ArrowRight } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { ContactForm } from '@/components/ContactForm'


export default function MitmachenPage() {
  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1505',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
      }}>
        <img 
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=80"
          alt="Hände halten Pflanze – gemeinsam wachsen"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=80"
          alt="Hände halten Pflanze – gemeinsam wachsen"
        />
        <div className="hero-text" style={{ maxWidth: 680, position: 'relative', zIndex: 2 }}>
          <SectionReveal>
            <h1 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
              color: 'var(--btb-creme)',
              marginBottom: '1rem',
            }}>
              Mitmachen
            </h1>
            <p style={{ color: 'var(--btb-creme)', opacity: 0.85, lineHeight: 1.8, fontSize: '1.05rem' }}>
              Das System unterscheidet bewusst drei Stufen der Zugehörigkeit — nicht als Hierarchie, sondern als ehrliche Beschreibung dessen, was jemand gerade einbringt und was das System zurückgeben kann. Niemand wird zu einer höheren Stufe gedrängt.
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '4rem',
          }}>
            {/* Unterstützer */}
            <SectionReveal>
              <div className="card-btb" style={{ border: '2px solid rgba(182,24,24,0.2)', height: '100%' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: 'rgba(182,24,24,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <Heart size={28} style={{ color: 'var(--btb-rot)' }} />
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-garamond)',
                  color: 'var(--btb-rot)',
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem',
                }}>
                  Unterstützer
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--btb-dunkel)', opacity: 0.6, marginBottom: '1rem' }}>
                  Trägst die Idee — bevor das System selbst trägt
                </p>
                <div style={{
                  fontSize: '2rem',
                  fontFamily: 'var(--font-garamond)',
                  fontWeight: 700,
                  color: 'var(--btb-rot)',
                  marginBottom: '0.25rem',
                }}>
                  ab 50 €
                </div>
                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1.5rem' }}>pro Jahr</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
                  {[
                    '10 % Rabatt auf alle externen Leistungen',
                    'Zugang zu Veranstaltungen',
                    'Kein Einführungsprozess nötig',
                    'Unterstützung der Gemeinschaft',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <CheckCircle size={16} style={{ color: 'var(--btb-rot)', flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <a href="#kontakt-form" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Unterstützer werden
                </a>
              </div>
            </SectionReveal>

            {/* Fördermitglied */}
            <SectionReveal delay={0.12}>
              <div className="card-btb" style={{ border: '2px solid rgba(42,124,171,0.3)', height: '100%' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: 'rgba(42,124,171,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <Users size={28} style={{ color: 'var(--btb-blau)' }} />
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-garamond)',
                  color: 'var(--btb-blau)',
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem',
                }}>
                  Fördermitglied
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--btb-dunkel)', opacity: 0.6, marginBottom: '1rem' }}>
                  Frühes Commitment — du bist dabei, bevor das System stabil ist
                </p>
                <div style={{
                  fontSize: '2rem',
                  fontFamily: 'var(--font-garamond)',
                  fontWeight: 700,
                  color: 'var(--btb-blau)',
                  marginBottom: '0.25rem',
                }}>
                  ab 1.000 €
                </div>
                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1.5rem' }}>pro Jahr</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
                  {[
                    'Sofort Zugang zu Einkaufspreisen (EK)',
                    '10 % Rabatt auf externe Leistungen',
                    'Zugang zu Veranstaltungen & Updates',
                    'Amortisiert sich durch EK-Preise schnell',
                    'Mitsprache bei Projekten',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <CheckCircle size={16} style={{ color: 'var(--btb-blau)', flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <a href="#kontakt-form" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--btb-blau)', color: 'var(--btb-blau)' }}>
                  Fördermitglied werden
                </a>
              </div>
            </SectionReveal>

            {/* Vollmitglied */}
            <SectionReveal delay={0.24}>
              <div className="card-btb" style={{ border: '2px solid var(--btb-oliv)', height: '100%', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: -14, right: 24,
                  background: 'var(--btb-oliv)', color: 'white',
                  borderRadius: 20, padding: '0.2rem 0.8rem',
                  fontSize: '0.75rem', fontWeight: 700,
                }}>
                  Gründungsphase
                </div>

                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: 'rgba(143,169,66,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <Building2 size={28} style={{ color: 'var(--btb-oliv)' }} />
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-garamond)',
                  color: 'var(--btb-oliv)',
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem',
                }}>
                  Vollmitglied
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--btb-dunkel)', opacity: 0.6, marginBottom: '1rem' }}>
                  Back to Meaning Maximization eG — Alltag, Arbeitszeit, Mitgestaltung
                </p>
                <div style={{
                  fontSize: '2rem',
                  fontFamily: 'var(--font-garamond)',
                  fontWeight: 700,
                  color: 'var(--btb-oliv)',
                  marginBottom: '0.25rem',
                }}>
                  100 €
                </div>
                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1.5rem' }}>Einlage (oder in Arbeitsstunden)</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
                  {[
                    'Vollständige Vergütung über den Pool',
                    'BtMM-Coins für jede geleistete Stunde',
                    'Alles intern zum Einkaufspreis',
                    'Stimmrecht bei allen Entscheidungen',
                    'Solidarfonds bei Krankheit & Elternzeit',
                    'Vollzugang zu App & Workspace',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <CheckCircle size={16} style={{ color: 'var(--btb-oliv)', flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <a href="#kontakt-form" className="btn-oliv" style={{ width: '100%', justifyContent: 'center' }}>
                  Interesse melden
                </a>
              </div>
            </SectionReveal>
          </div>

          {/* Gründung Link */}
          <SectionReveal delay={0.3}>
            <div style={{
              background: 'var(--btb-creme)',
              borderRadius: 12, padding: '2rem',
              display: 'flex', alignItems: 'center', gap: '1.5rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{
                  fontFamily: 'var(--font-garamond)',
                  color: 'var(--btb-rot)',
                  fontSize: '1.3rem',
                  marginBottom: '0.4rem',
                }}>
                  Du möchtest Gründungsmitglied werden?
                </h3>
                <p style={{ opacity: 0.75, fontSize: '0.95rem', lineHeight: 1.65 }}>
                  Wir suchen 7 Gründungsmitglieder für die Genossenschaft. Einlage ab 100 € — oder in Arbeitsstunden. Vollmitgliedschaft ab der ersten geleisteten Stunde.
                </p>
              </div>
              <RouterLink  to="/gruendung" className="btn-primary" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Zur Gründung <ArrowRight size={16} />
              </RouterLink>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Kontaktformular */}
      <section id="kontakt-form" className="section" style={{ background: 'var(--btb-creme)' }}>
        <div className="container-btb" style={{ maxWidth: 680 }}>
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              color: 'var(--btb-oliv)',
              fontSize: '2rem',
              marginBottom: '0.5rem',
            }}>
              Kontakt aufnehmen
            </h2>
            <p style={{ opacity: 0.75, lineHeight: 1.7, marginBottom: '2rem' }}>
              Schreiben Sie uns, welche Stufe Sie interessiert — wir melden uns in Kürze.
            </p>
            <ContactForm
              typ="mitmachen"
              betreff="Mitgliedschaft – Anfrage"
              placeholder="Ich interessiere mich für... / Meine Frage ist..."
            />
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
