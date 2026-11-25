import { lesen, slugs, downloadName } from '@/lib/dokumente-web.mjs'

// /dokumente/<slug>.md wird per Rewrite (next.config.mjs) hierher geleitet. Nur Dateien aus content/dokumente-web.
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return slugs().map((slug: string) => ({ slug }))
}

export function GET(_req: Request, { params }: { params: { slug: string } }) {
  const d = lesen(params.slug)
  if (!d) return new Response('Nicht gefunden', { status: 404 })
  return new Response(d.md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${downloadName(d)}"`,
    },
  })
}
