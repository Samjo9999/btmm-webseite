import type { Metadata } from 'next'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Chronik – Back to Meaning Maximization',
  description:
    'Die öffentliche Chronik von Back to Meaning Maximization: Meilensteine, Beschlüsse und Geschichten unserer Genossenschaft.',
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  member:     { label: 'Mitglied',    color: 'var(--btb-blau)' },
  cell:       { label: 'Zelle',       color: 'var(--btb-oliv)' },
  resolution: { label: 'Beschluss',   color: 'var(--btb-rot)' },
  solidarity: { label: 'Solidar',     color: 'var(--btb-rot)' },
  donation:   { label: 'Spende',      color: 'var(--btb-oliv)' },
  milestone:  { label: 'Meilenstein', color: '#b68542' },
}

type ChronicleEntry = {
  id: string
  title: string
  content: string | null
  category: string
  is_public: boolean
  created_at: string
  images?: string[] | null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function ChronikPage() {
  const { data: entries } = await supabase
    .from('chronicle_entries')
    .select('id, title, content, category, is_public, created_at, images')
    .eq('is_public', true)
    .not('approved_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50)

  const items: ChronicleEntry[] = entries ?? []

  // Group by year
  const byYear: Record<string, ChronicleEntry[]> = {}
  for (const e of items) {
    const year = new Date(e.created_at).getFullYear().toString()
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(e)
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  return (
    <>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#1a1505',
          padding: '5rem 1.5rem 4rem',
          textAlign: 'center',
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1920&q=80"
          alt="Altes Buch - unsere Geschichte"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1920&q=80"
          alt="Altes Buch - unsere Geschichte"
        />
        <div
          className="hero-text"
          style={{ maxWidth: 720, position: 'relative', zIndex: 2 }}
        >
          <SectionReveal>
            <h1
              style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
                color: 'var(--btb-creme)',
                marginBottom: '1rem',
              }}
            >
              Unsere Chronik
            </h1>
            <p
              style={{
                color: 'var(--btb-oliv)',
                fontSize: '1.15rem',
                fontFamily: 'var(--font-garamond)',
                fontStyle: 'italic',
                marginBottom: '1rem',
              }}
            >
              Geschichte und Meilensteine von Back to Meaning Maximization
            </p>
            <p
              style={{
                color: 'var(--btb-creme)',
                opacity: 0.85,
                lineHeight: 1.8,
                fontSize: '1.05rem',
              }}
            >
              Hier dokumentieren wir transparent unseren Weg: Beschlüsse,
              Meilensteine und Geschichten aus unserer Gemeinschaft.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: 'var(--btb-creme)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          {items.length === 0 ? (
            <SectionReveal>
              <p
                style={{
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  opacity: 0.6,
                  padding: '3rem 0',
                }}
              >
                Noch keine öffentlichen Einträge vorhanden.
              </p>
            </SectionReveal>
          ) : (
            years.map((year) => (
              <div key={year} style={{ marginBottom: '3rem' }}>
                <SectionReveal>
                  <h2
                    style={{
                      fontFamily: 'var(--font-garamond)',
                      fontSize: '1.8rem',
                      color: 'var(--btb-oliv)',
                      marginBottom: '1.5rem',
                      borderBottom: '2px solid var(--btb-oliv)',
                      paddingBottom: '0.5rem',
                    }}
                  >
                    {year}
                  </h2>
                </SectionReveal>

                {/* Timeline line */}
                <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '0.45rem',
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: 'var(--btb-oliv)',
                      opacity: 0.3,
                    }}
                  />

                  {byYear[year].map((entry, i) => {
                    const cat =
                      CATEGORY_META[entry.category] ??
                      CATEGORY_META.milestone
                    return (
                      <SectionReveal key={entry.id} delay={i * 0.05}>
                        <div
                          style={{
                            position: 'relative',
                            marginBottom: '1.5rem',
                          }}
                        >
                          {/* Dot */}
                          <div
                            style={{
                              position: 'absolute',
                              left: '-1.7rem',
                              top: '0.35rem',
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              background: cat.color,
                              border: '2px solid var(--btb-creme)',
                              boxShadow: `0 0 0 2px ${cat.color}`,
                            }}
                          />

                          {/* Card */}
                          <div
                            className="card-btb"
                            style={{
                              borderLeft: `4px solid ${cat.color}`,
                              padding: '1.5rem',
                            }}
                          >
                            {/* Date + Category */}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                                marginBottom: '0.5rem',
                              }}
                            >
                              <time
                                style={{
                                  fontSize: '0.85rem',
                                  color: 'var(--btb-dunkel)',
                                  opacity: 0.55,
                                }}
                              >
                                {formatDate(entry.created_at)}
                              </time>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.15rem 0.6rem',
                                  borderRadius: 12,
                                  background: `${cat.color}18`,
                                  color: cat.color,
                                  fontWeight: 600,
                                }}
                              >
                                {cat.label}
                              </span>
                            </div>

                            {/* Title */}
                            <h3
                              style={{
                                fontFamily: 'var(--font-garamond)',
                                fontSize: '1.3rem',
                                color: 'var(--btb-rot)',
                                marginBottom: '0.5rem',
                                lineHeight: 1.4,
                              }}
                            >
                              {entry.title}
                            </h3>

                            {/* Content */}
                            {entry.content && (
                              <p
                                style={{
                                  lineHeight: 1.75,
                                  fontSize: '1rem',
                                  opacity: 0.8,
                                }}
                              >
                                {entry.content}
                              </p>
                            )}

                            {/* Images */}
                            {entry.images &&
                              Array.isArray(entry.images) &&
                              entry.images.length > 0 && (
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    flexWrap: 'wrap',
                                    marginTop: '1rem',
                                  }}
                                >
                                  {entry.images.map(
                                    (url: string, j: number) => (
                                      <Image
                                        key={j}
                                        src={url}
                                        alt={`${entry.title} - Bild ${j + 1}`}
                                        width={280}
                                        height={180}
                                        style={{
                                          borderRadius: 8,
                                          objectFit: 'cover',
                                        }}
                                      />
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </SectionReveal>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Footer note */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div
          className="container-btb"
          style={{ maxWidth: 600, textAlign: 'center' }}
        >
          <SectionReveal>
            <p
              style={{
                fontFamily: 'var(--font-garamond)',
                fontStyle: 'italic',
                fontSize: '1.1rem',
                opacity: 0.6,
                lineHeight: 1.7,
              }}
            >
              Diese Chronik wird von unseren Mitgliedern über die BtMM Universe
              App gepflegt. Jeder Eintrag wird vor der Veröffentlichung
              geprüft.
            </p>
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
