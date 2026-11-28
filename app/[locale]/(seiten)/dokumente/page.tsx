import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, FileText } from 'lucide-react'
import { BRAND_FULL } from '@/lib/brand'
import { gruppiert, pfad, SITE } from '@/lib/dokumente-web.mjs'
import pdfStand from '@/data/dokumente-pdf.json'

export const dynamic = 'force-static'

const PDF: Record<string, { version: string; stand: string }> = pdfStand

type Doc = { slug: string; titel: string; nummer: string; version: string; stand: string }
type Gruppe = { id: string; titel: string; text: string; docs: Doc[] }

export function generateMetadata(): Metadata {
  const titel = 'Dokumente – Konzept, Satzung und Leitfäden'
  const text =
    'Alle BtMM-Dokumente zum Lesen und Herunterladen: Konzept, Satzung (Entwurf), Ordnungen und Leitfäden. BtMM ist noch nicht gegründet, alles sind Entwürfe.'
  return {
    title: { absolute: `${titel} | ${BRAND_FULL}` },
    description: text,
    alternates: { canonical: `${SITE}/de/dokumente` },
    openGraph: { title: titel, description: text, url: `${SITE}/de/dokumente`, locale: 'de_DE' },
  }
}

export default function DokumentePage({ params }: { params: { locale: string } }) {
  const gruppen = gruppiert() as Gruppe[]
  const anzahl = gruppen.reduce((n, g) => n + g.docs.length, 0)
  return (
    <>
      <section style={{ background: 'var(--btb-oliv)', padding: '4rem 1.5rem 3rem' }}>
        <div className="container-btb" style={{ maxWidth: 900 }}>
          <h1 style={{ fontFamily: 'var(--font-garamond)', fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--btb-creme)' }}>Dokumente</h1>
          <p style={{ color: 'var(--btb-creme)', opacity: 0.9, marginTop: '0.75rem', lineHeight: 1.6 }}>
            {anzahl} Dokumente zum Lesen und Herunterladen. Alles sind Entwürfe, keine Rechts- oder Steuerberatung.
          </p>
          {params.locale !== 'de' && (
            <p role="note" style={{ color: 'var(--btb-creme)', marginTop: '0.75rem', fontWeight: 600 }}>
              Die Dokumente sind nur auf Deutsch verfügbar.
            </p>
          )}
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 900 }}>
          {gruppen.map((g) => (
            <div key={g.id} id={g.id} style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontFamily: 'var(--font-garamond)', color: 'var(--btb-rot)', fontSize: '1.6rem', marginBottom: '0.25rem' }}>{g.titel}</h2>
              {g.text && <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '0.5rem' }}>{g.text}</p>}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {g.docs.map((d) => (
                  <li
                    key={d.slug}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem 0', borderBottom: '1px solid var(--btb-creme)' }}
                  >
                    <div style={{ minWidth: 0, flex: '1 1 260px' }}>
                      <Link href={pfad(d.slug, 'de')} style={{ fontFamily: 'var(--font-garamond)', color: 'var(--btb-oliv)', fontSize: '1.3rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} aria-hidden="true" />
                        {d.titel}
                      </Link>
                      <p style={{ fontSize: '0.85rem', opacity: 0.65, marginTop: '0.15rem' }}>
                        Dokument {d.nummer} · Version {d.version} · Stand {d.stand}
                      </p>
                      {PDF[d.slug] && (
                        <p style={{ fontSize: '0.85rem', opacity: 0.65 }}>
                          PDF: Version {PDF[d.slug].version} · Stand {PDF[d.slug].stand}
                        </p>
                      )}
                    </div>
                    {PDF[d.slug] && (
                      <a href={`/pdf/${d.slug}.pdf`} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }} aria-label={`${d.titel} als PDF öffnen`}>
                        <Download size={16} aria-hidden="true" />
                        PDF
                      </a>
                    )}
                    <a href={`/dokumente/${d.slug}.md`} download className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }} aria-label={`${d.titel} als Markdown herunterladen`}>
                      <Download size={16} aria-hidden="true" />
                      Markdown
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p style={{ fontSize: '0.9rem', opacity: 0.75 }}>
            <Link href={`/${params.locale}/impressum`} style={{ color: 'var(--btb-oliv)' }}>Impressum</Link>
          </p>
        </div>
      </section>
    </>
  )
}
