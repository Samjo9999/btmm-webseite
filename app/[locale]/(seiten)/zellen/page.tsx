import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Users, ExternalLink, Plus } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Zellen – Back to Meaning Maximization',
  description: 'Entdecke die BtMM-Zellen rund um die Welt. Lokale Gemeinschaften, ein gemeinsames System.',
}

// Sample cell data — in production, this would come from a database
const cells = [
  {
    id: 1,
    name: 'Freiburg (Gründungszelle)',
    location: 'Freiburg im Breisgau, Deutschland',
    coordinates: { lat: 48.0021, lon: 7.8421 },
    members: 4,
    focus: ['Körperarbeit', 'Handwerk', 'Beratung'],
    status: 'aktiv',
    color: 'var(--btb-rot)',
  },
  {
    id: 2,
    name: 'Berlin (Gründungsvorbereitung)',
    location: 'Berlin, Deutschland',
    coordinates: { lat: 52.5200, lon: 13.4050 },
    members: 0,
    focus: ['Bildung', 'Technologie'],
    status: 'planung',
    color: 'var(--btb-blau)',
  },
]

export default async function ZellenPage() {
  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1505',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
      }}>
        <Image
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80"
          alt="Netzwerk von Lichtern – dezentrales System"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80"
          alt="Netzwerk von Lichtern – dezentrales System"
        />
        <div className="hero-text" style={{ maxWidth: 680, position: 'relative', zIndex: 2 }}>
          <SectionReveal>
            <h1 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
              color: 'var(--btb-creme)',
              marginBottom: '1rem',
            }}>
              Zellen
            </h1>
            <p style={{ color: 'var(--btb-creme)', opacity: 0.85, lineHeight: 1.8, fontSize: '1.05rem' }}>
              Lokale Gemeinschaften, die ein gemeinsames System bilden. Dezentral organisiert, global verbunden.
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb">
          {/* Overview */}
          <SectionReveal>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}>
              <div className="card-btb" style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontFamily: 'var(--font-garamond)',
                  fontWeight: 700,
                  color: 'var(--btb-rot)',
                  marginBottom: '0.5rem',
                }}>
                  {cells.length}
                </div>
                <p style={{ color: 'var(--btb-dunkel)', opacity: 0.7 }}>Zellen aktiv oder in Gründung</p>
              </div>

              <div className="card-btb" style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontFamily: 'var(--font-garamond)',
                  fontWeight: 700,
                  color: 'var(--btb-blau)',
                  marginBottom: '0.5rem',
                }}>
                  {cells.reduce((sum, c) => sum + c.members, 0)}
                </div>
                <p style={{ color: 'var(--btb-dunkel)', opacity: 0.7 }}>Aktive Mitglieder</p>
              </div>

              <div className="card-btb" style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontFamily: 'var(--font-garamond)',
                  fontWeight: 700,
                  color: 'var(--btb-oliv)',
                  marginBottom: '0.5rem',
                }}>
                  {new Set(cells.flatMap(c => c.focus)).size}
                </div>
                <p style={{ color: 'var(--btb-dunkel)', opacity: 0.7 }}>Fachbereiche</p>
              </div>
            </div>
          </SectionReveal>

          {/* Cells Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}>
            {cells.map((cell, idx) => (
              <SectionReveal key={cell.id} delay={idx * 0.1}>
                <div className="card-btb" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}>
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-garamond)',
                        fontSize: '1.3rem',
                        color: cell.color,
                        marginBottom: '0.25rem',
                      }}>
                        {cell.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', opacity: 0.7 }}>
                        <MapPin size={14} />
                        {cell.location}
                      </div>
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.3rem 0.6rem',
                      borderRadius: 4,
                      background: cell.status === 'aktiv' ? 'rgba(143,169,66,0.1)' : 'rgba(42,124,171,0.1)',
                      color: cell.status === 'aktiv' ? 'var(--btb-oliv)' : 'var(--btb-blau)',
                    }}>
                      {cell.status === 'aktiv' ? '🟢 Aktiv' : '🔄 Planung'}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                  }}>
                    <div>
                      <div style={{
                        fontSize: '1.5rem',
                        fontFamily: 'var(--font-garamond)',
                        fontWeight: 700,
                        color: cell.color,
                      }}>
                        {cell.members}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--btb-dunkel)', opacity: 0.6 }}>Mitglieder</p>
                    </div>
                  </div>

                  {/* Focus Areas */}
                  <div style={{ marginBottom: '1.5rem', flexGrow: 1 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--btb-dunkel)' }}>
                      Schwerpunkte
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {cell.focus.map((f) => (
                        <span
                          key={f}
                          style={{
                            display: 'inline-block',
                            background: `rgba(${cell.color === 'var(--btb-rot)' ? '182,24,24' : cell.color === 'var(--btb-blau)' ? '42,124,171' : '143,169,66'},0.08)`,
                            color: cell.color,
                            padding: '0.35rem 0.7rem',
                            borderRadius: 6,
                            fontSize: '0.8rem',
                            fontWeight: 500,
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <a href={`/zellen/${cell.id}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    background: `rgba(${cell.color === 'var(--btb-rot)' ? '182,24,24' : cell.color === 'var(--btb-blau)' ? '42,124,171' : '143,169,66'},0.08)`,
                    color: cell.color,
                    border: `1.5px solid ${cell.color}`,
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}>
                    Details <ExternalLink size={14} />
                  </a>
                </div>
              </SectionReveal>
            ))}

            {/* Create Cell CTA */}
            <SectionReveal delay={cells.length * 0.1}>
              <div className="card-btb" style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(182,24,24,0.05), rgba(143,169,66,0.05))',
                borderStyle: 'dashed',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: 'rgba(182,24,24,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <Plus size={28} style={{ color: 'var(--btb-rot)' }} />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-garamond)',
                  fontSize: '1.2rem',
                  color: 'var(--btb-rot)',
                  marginBottom: '0.5rem',
                }}>
                  Neue Zelle
                </h3>
                <p style={{
                  color: 'var(--btb-dunkel)',
                  opacity: 0.7,
                  fontSize: '0.9rem',
                  marginBottom: '1.5rem',
                  lineHeight: 1.5,
                }}>
                  Du möchtest eine BtMM-Zelle in deiner Nähe gründen?
                </p>
                <Link href="/mitmachen" className="btn-primary" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  Kontakt aufnehmen
                </Link>
              </div>
            </SectionReveal>
          </div>

          {/* Info Section */}
          <SectionReveal>
            <div style={{
              background: 'var(--btb-creme)',
              borderRadius: 12,
              padding: '2rem',
              marginTop: '2rem',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-garamond)',
                color: 'var(--btb-oliv)',
                fontSize: '1.3rem',
                marginBottom: '1rem',
              }}>
                Wie funktionieren Zellen?
              </h3>
              <p style={{
                color: 'var(--btb-dunkel)',
                opacity: 0.8,
                lineHeight: 1.7,
                marginBottom: '1rem',
              }}>
                Jede Zelle ist eine lokale Gemeinschaft von BtMM-Mitgliedern, die zusammenarbeiten, Ressourcen teilen und Leistungen tauschen. Dezentral organisiert — aber mit gemeinsamen Werten und Systemen verbunden.
              </p>
              <p style={{
                color: 'var(--btb-dunkel)',
                opacity: 0.8,
                lineHeight: 1.7,
              }}>
                Zellen können verschiedene Schwerpunkte haben — Körperarbeit, Handwerk, Beratung, Bildung. Was zählt: Die Menschen arbeiten im Sinne einer gerechteren Wirtschaft zusammen.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
