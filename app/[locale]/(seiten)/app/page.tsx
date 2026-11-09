import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Users, CreditCard, Layout, Vote, BookOpen } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Die BtMM-App – Back to Meaning Maximization',
  description: 'Die BtMM-App für Mitglieder: Pool, Coins, Workspace, Abstimmung und Berufsmodule. Login unter app.b-t-m-m.com.',
}

const features = [
  {
    icon: Users,
    titel: 'Pool',
    text: 'Der gemeinsame Pool bündelt Ressourcen aller Mitglieder. Projekte werden gemeinsam finanziert, und jeder kann auf den Pool zugreifen, wenn er ihn braucht. Transparenz ist dabei keine Option, sondern Grundprinzip.',
    color: 'var(--btb-blau)',
  },
  {
    icon: CreditCard,
    titel: 'BtMM-Coins',
    text: 'Mitglieder können Leistungen über BtMM-Coins tauschen – ohne Geldfluss. Körperarbeit gegen Beratung, Handwerk gegen Bildung. Die interne Währung macht den Tausch einfach und nachvollziehbar.',
    color: 'var(--btb-oliv)',
  },
  {
    icon: Layout,
    titel: 'Workspace',
    text: 'Gemeinsamer digitaler Arbeitsraum für Projekte, Dokumente und Kommunikation. Alle Mitglieder einer Zelle haben Zugang. Transparenz und Zusammenarbeit auf einer Plattform.',
    color: 'var(--btb-rot)',
  },
  {
    icon: Vote,
    titel: 'Abstimmung',
    text: 'Entscheidungen werden gemeinsam getroffen. Das Abstimmungsmodul macht demokratische Prozesse einfach und dokumentiert. Jede Stimme zählt gleich.',
    color: 'var(--btb-blau)',
  },
  {
    icon: BookOpen,
    titel: 'Berufsmodule',
    text: 'Spezifische Module für verschiedene Berufsfelder – Handwerk, Beratung, Bildung, Gesundheit. Jedes Modul unterstützt die Besonderheiten der jeweiligen Branche innerhalb des BtMM-Systems.',
    color: 'var(--btb-oliv)',
  },
]

export default async function AppPage() {
  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#0a0f1e',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
      }}>
        <Image
          src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80"
          alt="Nebelwald – Technologie trifft Natur"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80"
          alt="Nebelwald – Technologie trifft Natur"
        />
        <div className="hero-text" style={{ maxWidth: 680, position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
            color: 'var(--btb-creme)',
            marginBottom: '1rem',
          }}>
            Die BtMM-App
          </h1>
          <p style={{
            color: 'var(--btb-oliv)',
            fontFamily: 'var(--font-garamond)',
            fontStyle: 'italic',
            fontSize: '1.15rem',
            marginBottom: '1.5rem',
          }}>
            Dein digitales Werkzeug für die Gemeinschaft
          </p>
          <p style={{ color: 'var(--btb-creme)', opacity: 0.8, lineHeight: 1.75, marginBottom: '2rem', maxWidth: 520, margin: '0 auto 2rem' }}>
            Die BtMM-App ist das digitale Zuhause der Gemeinschaft. Hier werden Ressourcen verwaltet, Entscheidungen getroffen und Leistungen getauscht.
          </p>
          <a
            href="https://app.b-t-m-m.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Zur App <ExternalLink size={16} />
          </a>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb">
          <SectionReveal>
            <p style={{
              textAlign: 'center',
              fontFamily: 'var(--font-garamond)',
              fontStyle: 'italic',
              fontSize: '1.1rem',
              color: 'var(--btb-dunkel)',
              opacity: 0.7,
              marginBottom: '3rem',
            }}>
              Die App ist kein Duplikat von etwas Bestehendem – sie ist das Werkzeug für eine neue Art des Wirtschaftens.
            </p>
          </SectionReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}>
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <SectionReveal key={i} delay={i * 0.12}>
                  <div className="card-btb" style={{ border: `1.5px solid ${feature.color}22` }}>
                    <div style={{
                      width: 48, height: 48,
                      borderRadius: 10,
                      background: `${feature.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '1rem',
                    }}>
                      <Icon size={24} style={{ color: feature.color }} />
                    </div>
                    <h2 style={{
                      fontFamily: 'var(--font-garamond)',
                      color: feature.color,
                      fontSize: '1.4rem',
                      marginBottom: '0.75rem',
                    }}>
                      {feature.titel}
                    </h2>
                    <p style={{ lineHeight: 1.75, color: 'var(--btb-dunkel)', opacity: 0.75 }}>
                      {feature.text}
                    </p>
                  </div>
                </SectionReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA: Login */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #050d1a, #0a1a2d)' }}>
        <div className="container-btb" style={{ maxWidth: 640, textAlign: 'center' }}>
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              color: 'var(--btb-creme)',
              fontSize: '2rem',
              marginBottom: '1rem',
            }}>
              Nur für Mitglieder
            </h2>
            <p style={{ color: 'var(--btb-creme)', opacity: 0.75, lineHeight: 1.75, marginBottom: '2rem' }}>
              Die App ist ausschließlich für BtMM-Mitglieder zugänglich. Werde Mitglied und erhalte Zugang zu allen Funktionen.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://app.b-t-m-m.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Login → app.b-t-m-m.com <ExternalLink size={15} />
              </a>
              <Link href="/mitmachen" style={{
                background: 'transparent',
                border: '2px solid var(--btb-creme)',
                color: 'var(--btb-creme)',
                borderRadius: 8, padding: '0.75rem 1.75rem',
                fontWeight: 600, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              }}>
                Mitglied werden
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
