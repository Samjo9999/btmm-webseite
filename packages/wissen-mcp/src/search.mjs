import { entferneEmojis } from './emoji-filter.mjs'
import { tokenize, distinctiveTokens, WEAK_TOKENS, foldDe } from './tokenize.mjs'

/** Namensbestandteile, die allein keine Belegpflicht auslösen. */
const FACT_NAME_TOKENS = new Set([
  'back',
  'meaning',
  'maximization',
  'maximierung',
  'meaningmaximization',
])

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function countBoundary(hay, word) {
  try {
    const re = new RegExp(`\\b${escapeRe(word)}`, 'gi')
    return (hay.match(re) || []).length
  } catch {
    return 0
  }
}

/** Fakt-Tokens: lange Komposita, Ziffern (keine Jahreszahlen), Bindestrich-Begriffe. */
export function factTokens(query) {
  return tokenize(query).filter((t) => {
    if (WEAK_TOKENS.has(t) || FACT_NAME_TOKENS.has(t)) return false
    if (/^20\d{2}$/.test(t)) return false
    return t.length >= 10 || (/\d/.test(t) && t.length >= 3) || (t.includes('-') && t.length >= 6)
  })
}

/** Mindest-Score, darunter gilt die Frage als nicht belegbar („steht nicht drin“). */
export function minScoreForQuery(query) {
  const facts = factTokens(query)
  if (facts.length) return Math.max(6, 3 + facts.length * 2)
  return 3
}

/**
 * Senkt den Titel-Bonus (früher +3 je Wort, +5 je Überschrift) und
 * gewichtet Text- und Phrasentreffer stärker.
 */
export function scoreChunk(query, chunk) {
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

export function searchChunks(query, chunks, limit = 6) {
  const words = tokenize(query)
  if (!words.length) return []
  const hits = []
  for (const ch of chunks) {
    const score = scoreChunk(query, ch)
    if (score > 0) hits.push({ ...ch, score })
  }
  hits.sort((a, b) => (b.score || 0) - (a.score || 0))
  const out = []
  const seen = new Set()
  for (const h of hits) {
    const k = `${h.rel || h.docId || ''}::${h.abschnitt}`
    if (seen.has(k)) continue
    seen.add(k)
    out.push(h)
    if (out.length >= limit) break
  }
  return applyMinScore(query, out)
}

/**
 * Unbekannte Fragen sollen keine Halluzinations-Treffer liefern:
 * ohne genug markante Tokens im Top-Treffer wird die Liste geleert.
 */
function tokenInBlob(t, blob) {
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

export function applyMinScore(query, hits) {
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

export function formatExtractiveAnswer(query, hits) {
  if (!hits.length) {
    return {
      antwort:
        'Dazu habe ich in den freigegebenen BtMM-Texten nichts Passendes gefunden. Die Wissensbasis kann Lücken haben — bei Bedarf persönlich nachfragen.',
      quellen: [],
      beantwortet: false,
    }
  }
  const top = hits.slice(0, 3)
  let antwort = ''
  if (top.length === 1 || top[0].score > (top[1]?.score || 0) * 1.8) {
    antwort = `Aus „${top[0].title}“ (${top[0].abschnitt}):\n\n${top[0].text}`
  } else {
    antwort =
      'Dazu finden sich mehrere Stellen:\n\n' +
      top
        .map(
          (h, i) =>
            `${i + 1}. **${h.title}** — ${h.abschnitt}\n${String(h.text).slice(0, 320)}${
              String(h.text).length > 320 ? '…' : ''
            }`
        )
        .join('\n\n')
  }
  antwort +=
    '\n\n—\nEntwurf/Vorschau · kann lückenhaft sein · keine Rechtsberatung. Generative KI ist absichtlich aus.'
  return {
    // Nutzerregel 25.11.: keine Emojis in Antworten.
    antwort: entferneEmojis(antwort),
    quellen: top.map((h) => ({
      dokument: entferneEmojis(h.title),
      abschnitt: entferneEmojis(h.abschnitt),
      pfad: h.rel,
      score: h.score,
    })),
    beantwortet: true,
  }
}

/** Suche über Dokumente (live, ohne vorgebauten Index). */
export function searchDocs(query, docs, opts = {}) {
  const limit = opts.limit ?? 8
  const chunks = []
  for (const doc of docs) {
    for (const ch of chunkDoc(doc)) chunks.push(ch)
  }
  return searchChunks(query, chunks, limit)
}

/**
 * Chunk by headings / blank lines
 * @param {{ id?: string, title: string, content: string, rel: string, source?: string, tier?: string }} doc
 */
export function chunkDoc(doc) {
  let content = String(doc.content || '')
  if (content.startsWith('---')) {
    const end = content.indexOf('\n---', 3)
    if (end !== -1) {
      const after = content.slice(end + 4)
      if (after.startsWith('\n') || after === '') content = after.replace(/^\n/, '')
    }
  }
  // Satzspiegel-Steuerzeilen (%% header, %% mail, Platzhalter wie %%DOKTABELLE%%) gehören nicht in den Index.
  // Die Quelldateien bleiben unveraendert.
  const lines = content.split('\n').filter((line) => !/^\s*%%/.test(line))
  const sections = []
  let heading = doc.title || ''
  let buf = []
  const flush = () => {
    const text = buf.join('\n').trim()
    if (text.length > 40) sections.push({ heading, text })
    buf = []
  }
  for (const line of lines) {
    const m = line.match(/^(#{1,3})\s+(.+)/)
    if (m) {
      flush()
      heading = m[2].trim().slice(0, 120)
      continue
    }
    // Fettdruck-Zeilen wie **Entscheidung (Nutzer, 26.10.2026):** als Abschnitt
    const bold = line.match(/^\*\*([^*]{6,120})\*\*:?\s*(.*)$/)
    if (bold && /entscheidung|\d{1,2}\.\d{1,2}\.\d{2,4}|\d{4}-\d{2}-\d{2}/i.test(bold[1])) {
      flush()
      heading = bold[1].trim().slice(0, 120)
      if (bold[2] && bold[2].trim()) buf.push(bold[2])
      continue
    }
    if (line.trim() === '' && buf.join('\n').trim().length > 80) {
      flush()
    } else {
      buf.push(line)
    }
  }
  flush()
  return sections.map((s, i) => ({
    docId: doc.id || doc.rel,
    title: doc.title,
    abschnitt: s.heading || `${doc.title} · Abschnitt ${i + 1}`,
    text: s.text,
    rel: doc.rel,
    source: doc.source,
    tier: doc.tier,
  }))
}
