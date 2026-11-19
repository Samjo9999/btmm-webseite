/**
 * Lädt den öffentlichen Wissens-Index (compact JSON) oder fällt auf
 * content/dokumente/*.md zurück. Kein md-intern. Kein LLM.
 */
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import type { WissenChunk } from './search'

export type LoadedCorpus = {
  chunks: WissenChunk[]
  docCount: number
  source: 'index-public' | 'content/dokumente' | 'wissen-mitglieder'
  builtAt?: string
}

function chunksFromMarkdownFiles(dir: string): WissenChunk[] {
  if (!existsSync(dir)) return []
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  const chunks: WissenChunk[] = []
  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf8')
    if (!content.trim()) continue
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : file.replace(/\.md$/, '')
    const parts = content
      .split(/\n(?=#{1,3}\s)|(?:\n\s*\n)/)
      .filter((a) => a.trim().length > 20)
    let i = 0
    for (const part of parts) {
      i += 1
      const erste = part.split('\n')[0] || ''
      const abschnitt = erste.startsWith('#')
        ? erste.replace(/^#+\s*/, '').slice(0, 80)
        : `${title} · Abschnitt ${i}`
      const text = part.replace(/^#+\s*.+\n/, '').trim().slice(0, 900)
      if (text.length < 20) continue
      chunks.push({
        title,
        abschnitt,
        text,
        rel: `content/dokumente/${file}`,
      })
    }
  }
  return chunks
}

export function loadPublicCorpus(): LoadedCorpus {
  const candidates = [
    join(process.cwd(), 'content', 'wissen', 'index-public.json'),
    join(process.cwd(), 'public', 'wissen', 'index-public.json'),
  ]
  for (const p of candidates) {
    if (!existsSync(p)) continue
    try {
      const data = JSON.parse(readFileSync(p, 'utf8')) as {
        chunks?: WissenChunk[]
        docCount?: number
        builtAt?: string
      }
      const chunks = data.chunks || []
      if (chunks.length) {
        return {
          chunks,
          docCount: data.docCount || 0,
          source: 'index-public',
          builtAt: data.builtAt,
        }
      }
    } catch {
      /* fallback */
    }
  }
  const dir = join(process.cwd(), 'content', 'dokumente')
  const chunks = chunksFromMarkdownFiles(dir)
  const docs = new Set(chunks.map((c) => c.rel))
  return {
    chunks,
    docCount: docs.size,
    source: 'content/dokumente',
  }
}

/** Mitmacher-Corpus (Prompt 117) — nur serverseitig, nie public/. */
export function loadMitmacherCorpus(): LoadedCorpus {
  const p = join(process.cwd(), 'content', 'wissen-mitglieder', 'index.json')
  if (!existsSync(p)) {
    throw new Error('Mitmacher-Index fehlt: content/wissen-mitglieder/index.json')
  }
  const raw = JSON.parse(readFileSync(p, 'utf8')) as {
    builtAt?: string
    docCount?: number
    chunks: WissenChunk[]
  }
  return {
    source: 'wissen-mitglieder',
    builtAt: raw.builtAt,
    docCount: raw.docCount ?? 0,
    chunks: raw.chunks || [],
  }
}
