/**
 * BtMM Wissens-Retrieval (extractive).
 * Logik identisch mit packages/wissen-mcp/src/search.mjs — bitte beide Stellen
 * gemeinsam ändern. Kein LLM; WISSEN_LLM_ENABLED bleibt unberührt.
 */

import { entferneEmojis } from '../../packages/wissen-mcp/src/emoji-filter.mjs'

export type WissenChunk = {
  title: string
  abschnitt: string
  text: string
  rel: string
  entwurf?: boolean
  score?: number
  docId?: string
}

export type WissenQuelle = {
  dokument: string
  abschnitt: string
  pfad: string
  score?: number
}

function foldDe(s: string) {
  return String(s || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
}

const STOP = new Set(
  'und oder der die das ein eine ist sind was wie wer kann man bei für von mit den dem des sich nicht auch hat ich mich mir wir uns auf im in zu zur zum als ob wenn dann noch nur sehr mehr weniger alle alles einen einem einer welch welche welchen welches einems'.split(
    ' '
  )
)

const WEAK_TOKENS = new Set([
  ...STOP,
  'btmm',
  'app',
  'store',
  'stand',
  'jahr',
  'jahre',
  'jahres',
  'kalenderjahr',
  'kalenderjahres',
  'server',
  'hosting',
  'eg',
  'www',
  'com',
  'http',
  'https',
  'apple',
  'hoch',
  'war',
  'hat',
  'eine',
  'einem',
  'einen',
  'angegeben',
  'durchschnittliche',
  'durchschnitt',
  'gemessene',
  'gemessen',
  'universum',
  'heute',
])

function addToken(out: string[], raw: string | undefined) {
  if (!raw) return
  const t = String(raw).toLowerCase().trim()
  if (!t || STOP.has(t)) return
  const shortOk = t.length <= 2 && (/\d/.test(t) || t.startsWith('§'))
  if (t.length > 2 || shortOk) {
    if (!out.includes(t)) out.push(t)
  }
}

function pad2(n: string | number) {
  return String(n).padStart(2, '0')
}

export function tokenize(q: string): string[] {
  const tokens: string[] = []
  let s = String(q || '').normalize('NFC')

  s = s.replace(/\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/g, (_, d: string, m: string, y: string) => {
    const year = y.length === 2 ? `20${y}` : y
    addToken(tokens, `${d}.${m}.${y}`)
    addToken(tokens, `${year}-${pad2(m)}-${pad2(d)}`)
    addToken(tokens, pad2(d))
    addToken(tokens, pad2(m))
    addToken(tokens, year)
    return ' '
  })
  s = s.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (_, y: string, m: string, d: string) => {
    addToken(tokens, `${y}-${m}-${d}`)
    addToken(tokens, `${Number(d)}.${Number(m)}.${y}`)
    addToken(tokens, d)
    addToken(tokens, m)
    addToken(tokens, y)
    return ' '
  })
  s = s.replace(/§\s*(\d+[a-z]?)/gi, (_, n: string) => {
    addToken(tokens, `§${n.toLowerCase()}`)
    addToken(tokens, n.toLowerCase())
    return ' '
  })

  s = s.toLowerCase().replace(/[?!.,;:„"“”()[\]{}]/g, ' ')
  for (const w of s.split(/\s+/).filter(Boolean)) {
    addToken(tokens, w)
    if (/[-–_./]/.test(w)) {
      for (const p of w.split(/[-–_./]+/)) addToken(tokens, p)
      const joined = w.replace(/[-–_./]+/g, '')
      if (joined && joined !== w) addToken(tokens, joined)
    }
  }
  return tokens
}

const FACT_NAME_TOKENS = new Set([
  'back',
  'meaning',
  'maximization',
  'maximierung',
  'meaningmaximization',
])

export function distinctiveTokens(query: string): string[] {
  return tokenize(query).filter((t) => {
    if (WEAK_TOKENS.has(t)) return false
    if (/^\d{4}$/.test(t)) return false
    if (t.length >= 4) return true
    if (/^§/.test(t) || /^\d+[a-z]$/i.test(t)) return true
    return false
  })
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function countBoundary(hay: string, word: string) {
  try {
    const re = new RegExp('\\b' + escapeRe(word), 'gi')
    return (hay.match(re) || []).length
  } catch {
    return 0
  }
}

export function factTokens(query: string): string[] {
  return tokenize(query).filter((t) => {
    if (WEAK_TOKENS.has(t) || FACT_NAME_TOKENS.has(t)) return false
    if (/^20\d{2}$/.test(t)) return false
    return t.length >= 10 || (/\d/.test(t) && t.length >= 3) || (t.includes('-') && t.length >= 6)
  })
}

export function minScoreForQuery(query: string): number {
  const facts = factTokens(query)
  if (facts.length) return Math.max(6, 3 + facts.length * 2)
  return 3
}

function scoreChunk(query: string, chunk: WissenChunk): number {
  const words = tokenize(query)
  if (!words.length) return 0
  const text = foldDe(chunk.text || '')
  const head = foldDe(chunk.abschnitt || '')
  const title = foldDe(chunk.title || '')
  const rel = foldDe(chunk.rel || chunk.docId || '')

  let score = 0
  let titlePts = 0
  let headPts = 0
  for (const w of words) {
    const w0 = foldDe(w)
    const weak = WEAK_TOKENS.has(w) || FACT_NAME_TOKENS.has(w) || /^20\d{2}$/.test(w) || /^\d{1,2}$/.test(w)
    const n = countBoundary(text, w0)
    if (n) score += weak ? Math.min(1, n) : Math.min(8, n * 2)
    else if (!weak && text.includes(w0)) score += 1
    if (head.includes(w0) && !weak) headPts += 3
    if (title.includes(w0) && !weak) titlePts += 1
    if (rel.includes(w0) && !weak && w0.length >= 4) score += 2
    if (/^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(w) || /^\d{4}-\d{2}-\d{2}$/.test(w)) {
      if (head.includes(w)) score += 10
      else if (text.includes(w)) score += 2
    }
    if (/^\d{2}[a-z]?$/.test(w)) {
      const stamped =
        rel.includes(`/${w}_`) ||
        rel.includes(`/${w}-`) ||
        rel.includes(`_${w}_`) ||
        rel.includes(`_${w}-`) ||
        (rel.split('/').pop() || '').startsWith(w)
      if (stamped) score += 8
    }
  }
  score += Math.min(2, titlePts)
  score += Math.min(6, headPts)

  const facts = factTokens(query).map(foldDe)
  for (const tok of facts) {
    if (title.includes(tok)) score += 6
    else if (head.includes(tok)) score += 4
    else if (rel.includes(tok)) score += 4
  }

  const distinctive = distinctiveTokens(query)
  for (let i = 0; i < distinctive.length - 1; i++) {
    const phrase = foldDe(`${distinctive[i]} ${distinctive[i + 1]}`)
    if (text.includes(phrase) || head.includes(phrase)) score += 6
  }
  return score
}

function tokenInBlob(t: string, blob: string) {
  const b = foldDe(blob)
  const tok = foldDe(t)
  if (b.includes(tok)) return true
  const stems = [
    tok.replace(/slebens$/i, 'sleben'),
    tok.replace(/en$/i, ''),
    tok.replace(/es$/i, ''),
    tok.replace(/er$/i, ''),
    tok.replace(/s$/i, ''),
  ]
  return stems.some((s) => s.length >= 5 && b.includes(s))
}

export function applyMinScore(query: string, hits: WissenChunk[]): WissenChunk[] {
  if (!hits.length) return []
  const min = minScoreForQuery(query)
  const facts = factTokens(query)
  let pool = hits.filter((h) => (h.score || 0) >= min)
  if (facts.length) {
    const withFacts = pool.filter((h) => {
      const blob = `${h.title || ''} ${h.abschnitt || ''} ${h.text || ''} ${h.rel || ''}`.toLowerCase()
      return facts.some((t) => tokenInBlob(t, blob))
    })
    if (withFacts.length) pool = withFacts
    else return []
  }
  return pool
}

export function searchChunks(
  query: string,
  chunks: WissenChunk[],
  limit = 6
): WissenChunk[] {
  const words = tokenize(query)
  if (!words.length) return []
  const hits: WissenChunk[] = []
  for (const ch of chunks) {
    const score = scoreChunk(query, ch)
    if (score > 0) hits.push({ ...ch, score })
  }
  hits.sort((a, b) => (b.score || 0) - (a.score || 0))
  const out: WissenChunk[] = []
  const seen = new Set<string>()
  for (const h of hits) {
    const k = `${h.rel || h.docId || ''}::${h.abschnitt}`
    if (seen.has(k)) continue
    seen.add(k)
    out.push(h)
    if (out.length >= limit) break
  }
  return applyMinScore(query, out)
}

export function formatExtractiveAnswer(
  hits: WissenChunk[]
): { antwort: string; beantwortet: boolean; quellen: WissenQuelle[] } {
  if (!hits.length) {
    return {
      antwort:
        'Dazu habe ich in den freigegebenen BtMM-Texten nichts Passendes gefunden. Die Wissensbasis kann Lücken haben — bei Bedarf persönlich nachfragen.',
      beantwortet: false,
      quellen: [],
    }
  }
  const top = hits.slice(0, 3)
  let antwort: string
  if (top.length === 1 || (top[0].score || 0) > (top[1]?.score || 0) * 1.8) {
    antwort = `Aus „${top[0].title}“ (${top[0].abschnitt}):\n\n${top[0].text}`
  } else {
    antwort =
      'Dazu finden sich mehrere Stellen:\n\n' +
      top
        .map(
          (h, i) =>
            `${i + 1}. **${h.title}** — ${h.abschnitt}\n${h.text.slice(0, 360)}${
              h.text.length > 360 ? '…' : ''
            }`
        )
        .join('\n\n')
  }
  antwort +=
    '\n\n—\nEntwurf/Vorschau · kann lückenhaft sein · keine Rechtsberatung. Generative KI ist absichtlich aus.'
  return {
    // Nutzerregel 25.11.: keine Emojis in Antworten.
    antwort: entferneEmojis(antwort),
    beantwortet: true,
    quellen: top.map((h) => ({
      dokument: entferneEmojis(h.title),
      abschnitt: entferneEmojis(h.abschnitt),
      pfad: h.rel,
      score: h.score,
    })),
  }
}
