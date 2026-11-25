/**
 * Sichtbarkeitsfilter für die Wissens-API:
 * nur public und mitmacher, internal nie.
 */

export const ERLAUBTE_SICHTBARKEIT = ['public', 'mitmacher'] as const

export type Sichtbarkeit = (typeof ERLAUBTE_SICHTBARKEIT)[number]

export type SichtChunk = {
  tier?: string
  sichtbarkeit?: string
  visibility?: string
}

export function sichtbarkeitVon(chunk: SichtChunk): string {
  const roh = chunk.tier || chunk.sichtbarkeit || chunk.visibility || ''
  return String(roh).trim().toLowerCase()
}

export function istErlaubtFuerWissenApi(chunk: SichtChunk): boolean {
  const stufe = sichtbarkeitVon(chunk)
  return stufe === 'public' || stufe === 'mitmacher'
}

export function nurErlaubteChunks<T>(chunks: T[]): T[] {
  return chunks.filter((c) => istErlaubtFuerWissenApi(c as SichtChunk))
}
