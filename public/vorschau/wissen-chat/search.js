/* Extractive BtMM-Suche — kein LLM. Gleicher Algorithmus wie packages/wissen-mcp/src/search.mjs */
const STOP = new Set('und oder der die das ein eine ist sind was wie wer kann man bei für von mit den dem des sich nicht auch hat ich mich mir wir uns auf im in zu zur zum als ob wenn dann noch nur sehr mehr weniger alle alles einen einem einer welch welche welchen welches einems'.split(' '))
const WEAK = new Set([...STOP, 'btmm', 'app', 'store', 'stand', 'jahr', 'jahre', 'jahres', 'kalenderjahr', 'kalenderjahres', 'server', 'hosting', 'eg', 'www', 'com', 'http', 'https', 'apple', 'hoch', 'war', 'hat', 'eine', 'einem', 'einen', 'angegeben', 'durchschnittliche', 'durchschnitt', 'gemessene', 'gemessen', 'universum', 'heute'])

function addToken(out, raw) {
  if (!raw) return
  const t = String(raw).toLowerCase().trim()
  if (!t || STOP.has(t)) return
  const shortOk = t.length <= 2 && (/\d/.test(t) || t.startsWith('§'))
  if ((t.length > 2 || shortOk) && !out.includes(t)) out.push(t)
}
function pad2(n) { return String(n).padStart(2, '0') }

export function tokenize(q) {
  const tokens = []
  let s = String(q || '').normalize('NFC')
  s = s.replace(/\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/g, (_, d, m, y) => {
    const year = y.length === 2 ? `20${y}` : y
    addToken(tokens, `${d}.${m}.${y}`)
    addToken(tokens, `${year}-${pad2(m)}-${pad2(d)}`)
    addToken(tokens, pad2(d)); addToken(tokens, pad2(m)); addToken(tokens, year)
    return ' '
  })
  s = s.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (_, y, m, d) => {
    addToken(tokens, `${y}-${m}-${d}`)
    addToken(tokens, `${Number(d)}.${Number(m)}.${y}`)
    addToken(tokens, d); addToken(tokens, m); addToken(tokens, y)
    return ' '
  })
  s = s.replace(/§\s*(\d+[a-z]?)/gi, (_, n) => {
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

function distinctive(query) {
  return tokenize(query).filter((t) => {
    if (WEAK.has(t) || /^\d{4}$/.test(t)) return false
    if (t.length >= 4) return true
    return /^§/.test(t) || /^\d+[a-z]$/i.test(t)
  })
}

function countBoundary(hay, word) {
  try {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi')
    return (hay.match(re) || []).length
  } catch { return 0 }
}

function scoreChunk(query, ch) {
  const words = tokenize(query)
  if (!words.length) return 0
  const text = (ch.text || '').toLowerCase()
  const head = (ch.abschnitt || '').toLowerCase()
  const title = (ch.title || '').toLowerCase()
  const rel = (ch.rel || '').toLowerCase()
  let score = 0, titlePts = 0, headPts = 0
  const NAME = new Set(['back','meaning','maximization','maximierung','meaningmaximization'])
  for (const w of words) {
    const weak = WEAK.has(w) || NAME.has(w)
    const n = countBoundary(text, w)
    if (n) score += weak ? Math.min(1, n) : Math.min(8, n * 2)
    else if (!weak && text.includes(w)) score += 1
    if (head.includes(w) && !weak) headPts += 3
    if (title.includes(w) && !weak) titlePts += 1
    if (rel.includes(w) && !weak && w.length >= 4) score += 2
  }
  score += Math.min(2, titlePts)
  score += Math.min(6, headPts)
  const dist = distinctive(query)
  for (let i = 0; i < dist.length - 1; i++) {
    const phrase = `${dist[i]} ${dist[i + 1]}`
    if (text.includes(phrase) || head.includes(phrase)) score += 6
  }
  return score
}

export function searchChunks(query, chunks, limit = 6) {
  const words = tokenize(query)
  if (!words.length || !chunks?.length) return []
  const hits = []
  for (const ch of chunks) {
    const score = scoreChunk(query, ch)
    if (score > 0) hits.push({ score, ...ch })
  }
  hits.sort((a, b) => b.score - a.score)
  const out = []
  const seen = new Set()
  for (const h of hits) {
    const k = `${h.rel}::${h.abschnitt}`
    if (seen.has(k)) continue
    seen.add(k)
    out.push(h)
    if (out.length >= limit) break
  }
  if (!out.length) return []
  const NAME = new Set(['back','meaning','maximization','maximierung','meaningmaximization'])
  const facts = tokenize(query).filter((t) => {
    if (WEAK.has(t) || NAME.has(t) || /^20\d{2}$/.test(t)) return false
    return t.length >= 8 || (/\d/.test(t) && t.length >= 3) || (t.includes('-') && t.length >= 6)
  })
  const min = facts.length ? Math.max(6, 3 + facts.length * 2) : 3
  if ((out[0].score || 0) < min) return []
  if (facts.length) {
    const blob = `${out[0].title || ''} ${out[0].abschnitt || ''} ${out[0].text || ''} ${out[0].rel || ''}`.toLowerCase()
    if (!facts.some((t) => blob.includes(t))) return []
  }
  return out
}

export function formatAnswer(hits) {
  if (!hits.length) {
    return {
      html: '<p>Dazu habe ich in den freigegebenen BtMM-Texten nichts Passendes gefunden. Die Wissensbasis kann Lücken haben.</p>',
      quellen: [],
    }
  }
  const top = hits.slice(0, 3)
  let html
  if (top.length === 1 || top[0].score > (top[1]?.score || 0) * 1.8) {
    html = `<p>Aus „<strong>${esc(top[0].title)}</strong>“ (${esc(top[0].abschnitt)}):</p><p>${esc(top[0].text)}</p>`
  } else {
    html =
      '<p>Dazu finden sich mehrere Stellen:</p><ol>' +
      top
        .map(
          (h) =>
            `<li><strong>${esc(h.title)}</strong> — ${esc(h.abschnitt)}<br>${esc(h.text.slice(0, 360))}${h.text.length > 360 ? '…' : ''}</li>`
        )
        .join('') +
      '</ol>'
  }
  html += '<p class="klein leise">Entwurf/Vorschau · kann lückenhaft sein · keine Rechtsberatung. Kein LLM.</p>'
  return {
    html,
    quellen: top.map((h) => ({ dokument: h.title, abschnitt: h.abschnitt, pfad: h.rel })),
  }
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
