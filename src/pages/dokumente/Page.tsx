'use client'

import { useEffect, useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { DokumentViewer } from '@/components/DokumentViewer'

export default function DokumentePage() {
  const [dokumente, setDokumente] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDokumente() {
      const docsConfig = [
        { slug: 'konzept', titel: 'Vollkonzept', version: 'v16.1.0' },
        { slug: 'satzung', titel: 'Satzung eG & e.V.', version: 'Entwurf' },
        { slug: 'einfuehrung', titel: 'Einführung', version: 'Aktuell' },
        { slug: 'wirtschaften', titel: 'Wirtschaften im System', version: 'v1.1.0' },
        { slug: 'ideen-horizont', titel: 'Ideen & Horizonte', version: 'v2.0.0' },
        { slug: 'gemeinschaftskultur', titel: 'Gemeinschaftskultur', version: 'Aktuell' },
        { slug: 'spendenaufruf', titel: 'Spendenaufruf', version: 'Aktuell' },
        { slug: 'handwerk', titel: 'Handwerk & Zulassungen', version: 'Aktuell' },
      ]
      setDokumente(docsConfig.map((d) => ({ ...d, content: '' })))
      setLoading(false)
    }
    loadDokumente()
  }, [])

  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1505',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
      }}>
        <img 
          src="https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1920&q=80"
          alt="Waldweg – Transparenz und Klarheit"
          style={{ objectFit: 'cover' }}
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1920&q=80"
          alt="Waldweg – Transparenz und Klarheit"
        />
        <div className="hero-text" style={{ maxWidth: 680, position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
            color: 'var(--btb-creme)',
            marginBottom: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap',
          }}>
            <FileText size={40} style={{ color: 'var(--btb-oliv)' }} />
            Dokumente
          </h1>
          <p style={{ color: 'var(--btb-creme)', opacity: 0.75, lineHeight: 1.75 }}>
            Konzeptpapiere, Satzungsentwürfe und weitere Dokumente – als Leseansicht und zum Herunterladen.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb">
          {/* Navigation */}
          <div style={{
            display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap',
          }}>
            {dokumente.map((doc) => (
              <a
                key={doc.slug}
                href={`#dok-${doc.slug}`}
                className="btn-secondary"
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                {doc.titel}
              </a>
            ))}
          </div>

          {/* Dokumente */}
          {dokumente.map((doc, i) => (
            <SectionReveal key={doc.slug} delay={i * 0.1}>
              <div id={`dok-${doc.slug}`} style={{ marginBottom: '4rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '2px solid var(--btb-creme)',
                }}>
                  <div>
                    <h2 style={{
                      fontFamily: 'var(--font-garamond)',
                      color: 'var(--btb-oliv)',
                      fontSize: '1.75rem',
                      marginBottom: '0.25rem',
                    }}>
                      {doc.titel}
                    </h2>
                    <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>{doc.version}</p>
                  </div>
                  <a
                    href={`/dokumente/${doc.slug}.pdf`}
                    download
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                  >
                    <Download size={16} />
                    PDF herunterladen
                  </a>
                </div>

                <div style={{
                  background: 'var(--btb-creme)',
                  borderRadius: 12,
                  padding: '2rem 2.5rem',
                  maxHeight: 600,
                  overflowY: 'auto',
                }}>
                  <DokumentViewer content={doc.content} />
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>
    </>
  )
}
