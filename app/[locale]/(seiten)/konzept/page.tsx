import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { TrendingUp, Users, Globe, ArrowRight, Scale, Leaf, Heart, Shield } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Das Konzept',
  description: 'Das BtMM-Konzept: drei Säulen, gleiche Stunde, BtMM-Coins, selbstverwaltete Zellen. Die Genossenschaft ist geplant und noch nicht gegründet.',
}

export default async function KonzeptPage() {
  const t = await getTranslations('konzept')
  const tc = await getTranslations('common')

  return (
    <>
      {/* Hero */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--btmm-text)',
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
      }}>
        <Image
          src="/images/stock/baumkronen.webp"
          alt="Baumkrone – das Konzept von unten nach oben"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="/images/stock/baumkronen.webp"
          alt="Baumkrone – das Konzept von unten nach oben"
        />
        <div className="hero-text" style={{ maxWidth: 720, position: 'relative', zIndex: 2 }}>
          <SectionReveal>
            <h1 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
              color: 'var(--btb-creme)',
              marginBottom: '1rem',
            }}>
              {t('uebersicht.titel')}
            </h1>
            <p style={{
              color: 'var(--btb-oliv)',
              fontSize: '1.15rem',
              fontFamily: 'var(--font-garamond)',
              fontStyle: 'italic',
              marginBottom: '1.5rem',
            }}>
              {t('uebersicht.untertitel')}
            </p>
            <p style={{ color: 'var(--btb-creme)', opacity: 0.85, lineHeight: 1.8, fontSize: '1.05rem' }}>
              {t('uebersicht.text')}
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Einführung — Was ist BtMM? */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '2rem',
              color: 'var(--btb-oliv)',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}>
              Was wäre, wenn faire Löhne und günstige Preise kein Widerspruch wären?
            </h2>
            <p style={{ lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1rem', textAlign: 'center', maxWidth: 660, margin: '0 auto 1rem' }}>
              Im konventionellen Markt verteuert jede Lohnerhöhung das Produkt. Im BtMM-System gilt das intern nicht: geteilt wird, was sich teilen lässt, gearbeitet wird zum gleichen Lohn, besessen wird gemeinsam. Der frühere Einkommens-Pool ist ersetzt. Intern zahlst du Selbstkosten, nicht den Marktpreis.
            </p>
            <p style={{ lineHeight: 1.8, fontSize: '1.05rem', textAlign: 'center', maxWidth: 660, margin: '0 auto 2rem' }}>
              Eine Stunde ist eine Stunde — ob kochen, bauen, pflegen oder programmieren. Mindestens der gesetzliche Mindestlohn, als Ziel 20 € je Stunde. Alle Zahlen dazu sind Modellrechnungen, keine Prognose. Die eG ist geplant und noch nicht gegründet.
            </p>
          </SectionReveal>

          {/* Kernpunkte als kompakte Kacheln */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem',
          }}>
            {[
              { icon: Scale, label: 'Gleicher Stundensatz', detail: '1 Stunde = 1 Stunde, egal welcher Beruf', color: 'var(--btb-rot)' },
              { icon: TrendingUp, label: 'Verteilungs-Kaskade', detail: 'Zuerst Hilfe und Lohn, dann drei Schalen', color: 'var(--btb-rot)' },
              { icon: Heart, label: 'BtMM-Coin', detail: '1 Coin = 1 Stunde — internes Tauschmittel', color: 'var(--btb-blau)' },
              { icon: Users, label: 'Selbstverwaltete Zellen', detail: 'Demokratisch, dezentral, eigenverantwortlich', color: 'var(--btb-blau)' },
              { icon: Shield, label: 'Solidarfonds', detail: 'Schwangerschaft, Krankheit, Übergänge', color: 'var(--btb-oliv)' },
              { icon: Globe, label: 'Ein System, später weltweit', detail: 'Geplant, heute noch keine Zellen', color: 'var(--btb-oliv)' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <SectionReveal key={i} delay={i * 0.08}>
                  <div style={{
                    padding: '1.25rem',
                    background: 'var(--btb-creme)',
                    borderRadius: 10,
                    borderLeft: `4px solid ${item.color}`,
                    height: '100%',
                  }}>
                    <Icon size={22} style={{ color: item.color, marginBottom: '0.5rem' }} />
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.label}</p>
                    <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5 }}>{item.detail}</p>
                  </div>
                </SectionReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Die drei Aspekte — prominent */}
      <section className="section" style={{ background: 'var(--btb-creme)' }}>
        <div className="container-btb">
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '2rem',
              color: 'var(--btb-oliv)',
              textAlign: 'center',
              marginBottom: '0.5rem',
            }}>
              Das Konzept im Detail
            </h2>
            <p style={{ textAlign: 'center', opacity: 0.65, marginBottom: '2.5rem' }}>
              Drei Säulen — ein Ganzes
            </p>
          </SectionReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              {
                icon: <TrendingUp size={40} style={{ color: 'var(--btb-rot)' }} />,
                titel: t('uebersicht.wirtschaft_titel'),
                text: t('uebersicht.wirtschaft_text'),
                href: '/konzept/wirtschaft',
                color: 'var(--btb-rot)',
                highlights: ['Drei Säulen', 'Gleiche Stunde', 'BtMM-Coin', 'Selbstkosten', 'Modellrechnungen'],
              },
              {
                icon: <Users size={40} style={{ color: 'var(--btb-blau)' }} />,
                titel: t('uebersicht.gemeinschaft_titel'),
                text: t('uebersicht.gemeinschaft_text'),
                href: '/konzept/gemeinschaft',
                color: 'var(--btb-blau)',
                highlights: ['Selbstverwaltete Zellen', 'Solidarfonds', 'Aufnahmeweg', 'Konsequenzen statt Strafen', 'Formen der Beteiligung'],
              },
              {
                icon: <Globe size={40} style={{ color: 'var(--btb-oliv)' }} />,
                titel: t('uebersicht.international_titel'),
                text: t('uebersicht.international_text'),
                href: '/konzept/international',
                color: 'var(--btb-oliv)',
                highlights: ['Weltweite Zellen', 'Einheit statt Streuung', 'Sinnmaximierung', 'Politische Wirkung'],
              },
            ].map((item, i) => (
              <SectionReveal key={i} delay={i * 0.15}>
                <Link href={item.href} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <div className="card-btb konzept-aspekt-card" style={{
                    height: '100%', cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    border: `2px solid ${item.color}33`,
                  }}>
                    <div style={{ marginBottom: '1rem' }}>{item.icon}</div>
                    <h3 style={{
                      fontFamily: 'var(--font-garamond)',
                      fontSize: '1.6rem',
                      color: item.color,
                      marginBottom: '0.75rem',
                    }}>
                      {item.titel}
                    </h3>
                    <p style={{ color: 'var(--btb-dunkel)', opacity: 0.75, lineHeight: 1.7, marginBottom: '1.25rem' }}>
                      {item.text}
                    </p>

                    {/* Themen-Liste */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                      {item.highlights.map((h, j) => (
                        <span key={j} style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 12,
                          background: `${item.color}15`,
                          color: item.color,
                          fontWeight: 500,
                        }}>
                          {h}
                        </span>
                      ))}
                    </div>

                    <span style={{
                      color: item.color,
                      fontWeight: 700,
                      fontSize: '1rem',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                    }}>
                      Konzept lesen <ArrowRight size={18} />
                    </span>
                  </div>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Unverhandelbare Werte */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800, textAlign: 'center' }}>
          <SectionReveal>
            <h2 style={{ fontFamily: 'var(--font-garamond)', color: 'var(--btb-oliv)', fontSize: '2rem', marginBottom: '1.5rem' }}>
              Was unverhandelbar ist
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              textAlign: 'left',
            }}>
              {[
                { label: 'Gleichwürdigkeit', text: 'Unabhängig von Geschlecht, Herkunft oder Vermögen.' },
                { label: 'Nachhaltigkeit', text: 'In allem — Wirtschaften, Bauen, Miteinander.' },
                { label: 'Dezentralität', text: 'Keine Zentrale, die über andere bestimmt.' },
                { label: 'Gewaltfreiheit', text: 'Gegen kein Lebewesen.' },
                { label: 'Heilung', text: 'Des Menschen, der Gemeinschaft, der Erde.' },
                { label: 'Nicht-Besitz', text: 'Anteile sind Bekenntnis, kein Investment.' },
              ].map((v, i) => (
                <div key={i} style={{
                  padding: '1rem',
                  background: 'var(--btb-creme)',
                  borderRadius: 8,
                }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{v.label}</p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5 }}>{v.text}</p>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'var(--btb-creme)' }}>
        <div className="container-btb" style={{ maxWidth: 680, textAlign: 'center' }}>
          <SectionReveal>
            <blockquote style={{
              fontFamily: 'var(--font-garamond)',
              fontStyle: 'italic',
              fontSize: '1.2rem',
              color: 'var(--btb-dunkel)',
              lineHeight: 1.7,
              marginBottom: '2rem',
              opacity: 0.8,
            }}>
              &bdquo;Die Saat liegt noch im Kern. Aber sie ist lebendig. Was sie braucht, um zu keimen, sind Menschen, die ihr Erde und Wasser geben.&ldquo;
            </blockquote>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/mitmachen" className="btn-primary">
                {tc('actions.jetzt_mitmachen')}
              </Link>
              <Link href="/dokumente" className="btn-secondary">
                Alle Dokumente lesen
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
