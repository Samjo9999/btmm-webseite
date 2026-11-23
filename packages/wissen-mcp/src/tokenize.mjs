export function foldDe(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
}

export const STOP = new Set(
  'und oder der die das ein eine ist sind was wie wer kann man bei für von mit den dem des sich nicht auch hat ich mich mir wir uns auf im in zu zur zum als ob wenn dann noch nur sehr mehr weniger alle alles einen einem einer welch welche welchen welches einems'.split(
    ' '
  )
)

/** Tokens, die allein keinen Treffer tragen sollen. */
export const WEAK_TOKENS = new Set([
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

function addToken(out, raw) {
  if (!raw) return
  const t = String(raw).toLowerCase().trim()
  if (!t || STOP.has(t)) return
  const shortOk = t.length <= 2 && (/\d/.test(t) || t.startsWith('§'))
  if (t.length > 2 || shortOk) {
    if (!out.includes(t)) out.push(t)
  }
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

/**
 * Tokenisiert eine Anfrage oder einen Text.
 * Bindestrich-Komposita (BtMM-App, e-G, btmm-wirtschaften) werden
 * als Ganzes und in Teilen behalten. Daten und §-Angaben bleiben erhalten.
 */
export function tokenize(q) {
  const tokens = []
  let s = String(q || '').normalize('NFC')

  s = s.replace(/\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/g, (_, d, m, y) => {
    const year = y.length === 2 ? `20${y}` : y
    addToken(tokens, `${d}.${m}.${y}`)
    addToken(tokens, `${year}-${pad2(m)}-${pad2(d)}`)
    addToken(tokens, pad2(d))
    addToken(tokens, pad2(m))
    addToken(tokens, year)
    return ' '
  })
  s = s.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (_, y, m, d) => {
    addToken(tokens, `${y}-${m}-${d}`)
    addToken(tokens, `${Number(d)}.${Number(m)}.${y}`)
    addToken(tokens, d)
    addToken(tokens, m)
    addToken(tokens, y)
    return ' '
  })

  s = s.replace(/§\s*(\d+[a-z]?)/gi, (_, n) => {
    addToken(tokens, `§${n.toLowerCase()}`)
    addToken(tokens, n.toLowerCase())
    return ' '
  })

  s = s
    .toLowerCase()
    .replace(/[?!.,;:„"“”()[\]{}]/g, ' ')
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

export function distinctiveTokens(query) {
  return tokenize(query).filter((t) => {
    if (WEAK_TOKENS.has(t)) return false
    if (/^\d{4}$/.test(t)) return false
    if (t.length >= 4) return true
    if (/^§/.test(t) || /^\d+[a-z]$/i.test(t)) return true
    return false
  })
}
