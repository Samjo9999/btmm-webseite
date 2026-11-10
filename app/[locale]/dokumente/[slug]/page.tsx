import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Download } from 'lucide-react'
import { DokumentViewer } from '@/components/DokumentViewer'
import { getDriveDokument, formatDatum, pdfUrl } from '@/lib/drive-dokumente'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const doc = getDriveDokument(params.slug)
  return { title: doc ? `${doc.titel}` : 'Dokument' }
}

export default function DokumentSeite({ params }: { params: { locale: string; slug: string } }) {
  const doc = getDriveDokument(params.slug)
  if (!doc) notFound()
  const pdf = pdfUrl(doc)
  return (
    <section className="section" style={{ background: 'var(--btb-weiss)' }}>
      <div className="container-btb">
        <Link href={`/${params.locale}/dokumente`} style={{ fontSize: '0.9rem', color: 'var(--btb-oliv)' }}>← Alle Dokumente</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', margin: '1.5rem 0', paddingBottom: '1rem', borderBottom: '2px solid var(--btb-creme)' }}>
          <div>
            {doc.kategorie && <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6 }}>{doc.kategorie.label}</p>}
            <h1 style={{ fontFamily: 'var(--font-garamond)', color: 'var(--btb-oliv)', fontSize: '2rem' }}>{doc.titel}</h1>
            <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>Version {doc.version} · Stand {formatDatum(doc.datum)}</p>
            {doc.aenderung && <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Änderung: {doc.aenderung}</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
          {pdf && (
            <a href={pdf} download={`${doc.slug}_v${doc.pdf!.version}.pdf`} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Download size={16} /> PDF herunterladen
            </a>
          )}
          {!doc.nurPdf && <a href={`/dokumente/${doc.slug}.md`} download={`${doc.slug}_v${doc.version}.md`} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', alignSelf: 'flex-start' }}>
            <Download size={16} /> Markdown herunterladen
          </a>}
          </div>
        </div>
        {!doc.nurPdf && <div style={{ background: 'var(--btb-creme)', borderRadius: 12, padding: '2rem 2.5rem' }}>
          <DokumentViewer content={doc.content} />
        </div>}
      </div>
    </section>
  )
}
