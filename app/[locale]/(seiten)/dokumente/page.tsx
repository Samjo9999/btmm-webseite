import type { Metadata } from 'next'
import Image from 'next/image'
import { FileText, Download } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getDriveManifest, formatDatum, pdfUrl } from '@/lib/drive-dokumente'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dokumente – Back to Meaning Maximization',
  description: 'Dokumente von Back to Meaning Maximization zum Herunterladen.',
}

type Dok = { slug: string; titel: string; version: string; content: string; aenderung?: string | null; drive?: boolean; pdf?: string | null; nurPdf?: boolean; kategorie?: string | null }

async function getDokumente(): Promise<Dok[]> {
  // Sobald die Drive-Pipeline Dokumente geliefert hat, gelten nur diese.
  const drive = getDriveManifest()
  if (drive.length > 0) {
    return drive.map((d) => {
      let content = d.nurPdf ? '' : 'Dokument nicht gefunden.'
      if (!d.nurPdf) try {
        content = readFileSync(join(process.cwd(), 'content', 'drive-dokumente', `${d.slug}.md`), 'utf-8')
      } catch {}
      return { slug: d.slug, titel: d.titel, version: `Version ${d.version} · Stand ${formatDatum(d.datum)}`, aenderung: d.aenderung, content, drive: true, pdf: pdfUrl(d), nurPdf: d.nurPdf, kategorie: d.kategorie?.label ?? null }
    })
  }
  const dokumente = [
    { slug: 'einfuehrung', titel: 'Einführung', version: 'Aktuell' },
    { slug: 'wirtschaften', titel: 'Wirtschaften im System', version: 'v1.1.0' },
    { slug: 'ideen-horizont', titel: 'Ideen & Horizonte', version: 'v2.0.0' },
    { slug: 'gemeinschaftskultur', titel: 'Gemeinschaftskultur', version: 'Aktuell' },
    { slug: 'handwerk', titel: 'Handwerk & Zulassungen', version: 'Aktuell' },
  ]

  return dokumente.map((doc) => {
    try {
      const content = readFileSync(
        join(process.cwd(), 'content', 'dokumente', `${doc.slug}.md`),
        'utf-8'
      )
      return { ...doc, content }
    } catch {
      return { ...doc, content: 'Dokument nicht gefunden.' }
    }
  })
}

// Nutzer 20.11.2026: kein Text, nur die Dokumente als Liste zum Herunterladen.
export default async function DokumentePage() {
  const dokumente = await getDokumente()
  const knopf = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' } as const

  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1505',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
      }}>
        <Image
          src="https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1920&q=80"
          alt="Waldweg – Transparenz und Klarheit"
          fill
          style={{ objectFit: 'cover' }}
          priority
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
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap',
          }}>
            <FileText size={40} style={{ color: 'var(--btb-oliv)' }} />
            Dokumente
          </h1>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {dokumente.map((doc, i) => (
              <SectionReveal key={doc.slug} delay={i * 0.05}>
                <li id={`dok-${doc.slug}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: '1rem',
                  padding: '1.25rem 0',
                  borderBottom: '1px solid var(--btb-creme)',
                }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-garamond)', color: 'var(--btb-oliv)', fontSize: '1.4rem', marginBottom: '0.15rem' }}>
                      {doc.titel}
                    </h2>
                    <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>{doc.version}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {doc.pdf && (
                      <a href={doc.pdf} download className="btn-secondary" style={knopf}>
                        <Download size={16} />
                        PDF herunterladen
                      </a>
                    )}
                    {!doc.pdf && !doc.nurPdf && (
                      <a href={doc.drive ? `/dokumente/${doc.slug}.md` : `/dokumente/${doc.slug}.pdf`} download className="btn-secondary" style={knopf}>
                        <Download size={16} />
                        {doc.drive ? 'Herunterladen' : 'PDF herunterladen'}
                      </a>
                    )}
                  </div>
                </li>
              </SectionReveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
