import { readFileSync } from 'fs'
import { join } from 'path'

// Von scripts/docs-sync/sync.mjs erzeugt (Auto-PR "docs-sync"). Regeln: scripts/docs-sync/lib.mjs
export type DriveDokument = {
  slug: string
  titel: string
  version: string
  datum: string
  aenderung: string | null
  quelle: string
}

const DIR = join(process.cwd(), 'content', 'drive-dokumente')

export function getDriveManifest(): DriveDokument[] {
  try {
    return JSON.parse(readFileSync(join(DIR, 'manifest.json'), 'utf-8'))
  } catch {
    return []
  }
}

export function getDriveDokument(slug: string) {
  const meta = getDriveManifest().find((d) => d.slug === slug)
  if (!meta) return null
  try {
    return { ...meta, content: readFileSync(join(DIR, `${slug}.md`), 'utf-8') }
  } catch {
    return null
  }
}

export function formatDatum(iso: string) {
  const [j, m, t] = iso.split('-')
  return `${t}.${m}.${j}`
}
