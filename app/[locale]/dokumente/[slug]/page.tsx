import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Download } from 'lucide-react'
import { DokumentInhalt } from '@/components/DokumentInhalt'
import { BRAND_FULL } from '@/lib/brand'
import { lesen, slugs, gruppiert, beschreibung, pfad, downloadName, SITE } from '@/lib/dokumente-web.mjs'

// Die Dokumente gibt es nur auf Deutsch. Andere Sprachen zeigen einen Hinweis und verweisen auf den deutschen Text.
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return slugs().map((slug: string) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const d = lesen(params.slug)
  if (!d) return { title: 'Dokument' }
  const url = `${SITE}${pfad(d.slug, 'de')}`
  return {
    title: { absolute: `${d.titel ?? 'Dokument'} (Version ${d.version}) | ${BRAND_FULL}` },
    description: beschreibung(d),
    alternates: { canonical: url },
    openGraph: { title: d.titel ?? undefined, description: beschreibung(d), url, locale: 'de_DE' },
  }
}

const knopf = { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' } as const

export default function DokumentSeite({ params }: { params: { locale: string; slug: string } }) {
  const d = lesen(params.slug)
  if (!d) notFound()
  const deutsch = params.locale === 'de'
  const gruppe = (gruppiert() as { titel: string; docs: { slug: string }[] }[]).find((g) => g.docs.some((x) => x.slug === d.slug))
  return (
    <section className="section" style={{ background: 'var(--btb-weiss)' }}>
      <div className="container-btb" style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', margin: '0 0 1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--btb-creme)' }}>
          <nav aria-label="Brotkrumen" style={{ fontSize: '0.9rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link href={`/${params.locale}/dokumente`} style={{ color: 'var(--btb-oliv)' }}>Alle Dokumente</Link>
            {gruppe && <span style={{ opacity: 0.6 }}>/ {gruppe.titel}</span>}
          </nav>
          <a href={`/dokumente/${d.slug}.md`} download={downloadName(d)} className="btn-secondary" style={knopf}>
            <Download size={16} aria-hidden="true" />
            Markdown herunterladen
          </a>
        </div>

        {deutsch ? (
          <div style={{ background: 'var(--btb-creme)', borderRadius: 12, padding: 'clamp(1rem, 4vw, 2.5rem)' }}>
            <DokumentInhalt content={d.md} />
          </div>
        ) : (
          <div style={{ background: 'var(--btb-creme)', borderRadius: 12, padding: '1.5rem' }}>
            <h1 style={{ fontFamily: 'var(--font-garamond)', color: 'var(--btb-rot)', fontSize: '1.7rem', marginBottom: '0.75rem' }}>{d.titel}</h1>
            <p role="note" style={{ marginBottom: '1rem', fontWeight: 600 }}>Dieses Dokument ist nur auf Deutsch verfügbar.</p>
            <Link href={pfad(d.slug, 'de')} className="btn-secondary" style={knopf}>Zum deutschen Text</Link>
          </div>
        )}

        <p style={{ fontSize: '0.9rem', marginTop: '1.5rem', opacity: 0.8 }}>
          <Link href={`/${params.locale}/impressum`} style={{ color: 'var(--btb-oliv)' }}>Impressum</Link>
        </p>
      </div>
    </section>
  )
}
