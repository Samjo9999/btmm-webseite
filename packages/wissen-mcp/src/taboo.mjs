/**
 * Wörter, die nie in public- oder Mitmacher-Index stehen dürfen.
 * Quelle: AUSSCHLUSSLISTE.md plus Auftrag E2 (Erkrankung, Jobcenter).
 * intern.json darf sie enthalten.
 */
export const TABOO_WORDS = [
  'bürgergeld',
  'krankheit',
  'erkrankung',
  'elternzeit',
  'schwangerschaft',
  'jobcenter',
  'hildastraße',
  'hildastrasse',
  'karner',
]

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function variants(word) {
  const out = new Set([word, word.toLowerCase()])
  if (word.includes('ß')) out.add(word.replace(/ß/g, 'ss'))
  if (word.includes('ss')) out.add(word.replace(/ss/g, 'ß'))
  return [...out]
}

/** Treffer als ganze Wörter (keine Teiltreffer wie Krankheit ⊂ Krankenkasse). */
export function findTabooHits(text) {
  if (!text) return []
  const src = String(text)
  const found = []
  const seen = new Set()
  for (const word of TABOO_WORDS) {
    for (const v of variants(word)) {
      const re = new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRe(v)}(?![\\p{L}\\p{N}_])`, 'giu')
      if (re.test(src)) {
        const key = word.toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          found.push(key)
        }
      }
    }
  }
  return found
}

export function hasTaboo(text) {
  return findTabooHits(text).length > 0
}

/**
 * Durchsucht ein Index-JSON (Objekt oder Rohstring) nach Tabuwörtern
 * in den öffentlich relevanten Feldern.
 */
export function findTabooInIndex(payload) {
  const hits = []
  const docs = payload?.docs || []
  const chunks = payload?.chunks || []
  for (const d of docs) {
    const blob = [d.title, d.id, d.rel, d.source].filter(Boolean).join('\n')
    const words = findTabooHits(blob)
    if (words.length) hits.push({ kind: 'doc', rel: d.rel || d.id, words })
  }
  for (const c of chunks) {
    const blob = [c.title, c.abschnitt, c.text, c.rel, c.docId].filter(Boolean).join('\n')
    const words = findTabooHits(blob)
    if (words.length) hits.push({ kind: 'chunk', rel: c.rel || c.docId, abschnitt: c.abschnitt, words })
  }
  return hits
}
