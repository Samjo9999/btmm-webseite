/**
 * Guardrails für den öffentlichen Wissens-Index (index-public.json).
 * Tabu: Wortstämme als Teilwort (Komposita/Beugungen), Umlaute gefaltet.
 * Pfadregeln: INTERN_ / _intern/ / ROTH- / BUSINESSPLAN u. a.
 * „Krankenkasse“ bleibt erlaubt (enthält nicht den Stamm „krankheit“).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'

export const TABOO_STEMS = [
  'bürgergeld',
  'buergergeld',
  'jobcenter',
  'hartz',
  'krankheit',
  'erkrankung',
  'elternzeit',
  'schwangerschaft',
  'hildastr',
  'karner',
  'happyfarm',
  'elternhof',
  'j.s.gartzke',
]

export const FORBIDDEN_PATH_RE =
  /INTERN_|\/_intern(?:\/|$)|(?:^|\/)ROTH[-_/]|BUSINESSPLAN/i

const INDEX_PATH_EXTRA = [
  /steuer-briefing/i,
  /datei15/i,
  /15-geschaeftsmodell/i,
  /annahmen-und-quellen/i,
  /(?:^|\/|_)foerderung/i,
  /06-intern/i,
  /md-intern/i,
]

export function foldDe(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
}

export function findTabooHits(text) {
  if (!text) return []
  const folded = foldDe(text)
  const found = []
  const seen = new Set()
  for (const stem of TABOO_STEMS) {
    const f = foldDe(stem)
    if (!f || seen.has(f)) continue
    if (folded.includes(f)) {
      seen.add(f)
      found.push(stem)
    }
  }
  return found
}

export function normalizeRel(rel) {
  return String(rel || '')
    .replace(/\\/g, '/')
    .replace(/^repos\/btmm-webseite\//, '')
}

export function loadPublicAllowlist(root) {
  const raw = JSON.parse(
    readFileSync(join(root, 'content', 'wissen', 'PUBLIC-ALLOWLIST.json'), 'utf8')
  )
  const allowed = new Set(
    (raw.publicSources || []).map((s) => normalizeRel(s.rel))
  )
  const blacklist = raw.blacklistPathPatterns || []
  return { allowed, blacklist, raw }
}

export function isAllowedRel(rel, allow) {
  const n = normalizeRel(rel)
  if (!allow.allowed.has(n)) return false
  const s = String(rel || '').replace(/\\/g, '/')
  if (allow.blacklist.some((p) => s.includes(p))) return false
  if (FORBIDDEN_PATH_RE.test(s)) return false
  if (INDEX_PATH_EXTRA.some((re) => re.test(s))) return false
  return true
}

export function findIndexHits(payload) {
  const hits = []
  for (const c of payload?.chunks || []) {
    const rel = c.rel || ''
    const blob = [c.title, c.abschnitt, c.text, c.rel].filter(Boolean).join('\n')
    const words = findTabooHits(blob)
    if (FORBIDDEN_PATH_RE.test(blob) || INDEX_PATH_EXTRA.some((re) => re.test(rel))) {
      words.push('verbotener-pfad')
    }
    if (words.length) hits.push({ kind: 'chunk', rel, abschnitt: c.abschnitt, words })
  }
  return hits
}

export const INDEX_COPIES = [
  'content/wissen/index-public.json',
  'public/wissen/index-public.json',
  'public/vorschau/wissen-chat/index-public.json',
  'public/vorschau/bewertung-chat-feedback/index-public.json',
]

const SCAN_EXTS = new Set(['.json', '.md', '.html', '.js', '.mjs', '.txt', '.csv', '.xml', '.svg'])

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

/**
 * Prüft alle index-public.json und zusätzlich Pfad-Lecks in public/.
 * @returns {string[]} Fehlerzeilen, leer = sauber
 */
export function checkPublicIndexes(root) {
  const errors = []
  const allow = loadPublicAllowlist(root)
  const stemRe = new RegExp(
    TABOO_STEMS.map((s) => s.replace(/\./g, '\\.')).join('|') +
      '|INTERN_|_intern|ROTH-|BUSINESSPLAN',
    'gi'
  )

  for (const rel of INDEX_COPIES) {
    const file = join(root, rel)
    let raw
    try {
      raw = readFileSync(file, 'utf8')
    } catch {
      errors.push(`fehlt: ${rel}`)
      continue
    }
    const m = raw.match(stemRe) || []
    if (m.length) {
      errors.push(`${rel}: verbotene Stämme/Pfade: ${[...new Set(m)].join(', ')}`)
    }
    let payload
    try {
      payload = JSON.parse(raw)
    } catch (e) {
      errors.push(`${rel}: kein gültiges JSON (${e.message})`)
      continue
    }
    for (const c of payload.chunks || []) {
      if (!isAllowedRel(c.rel, allow)) {
        errors.push(`${rel}: Chunk nicht auf Public-Allowlist: ${c.rel}`)
      }
    }
    const hits = findIndexHits(payload)
    for (const h of hits) {
      errors.push(`${rel}: ${h.rel} (${h.abschnitt}): ${h.words.join(', ')}`)
    }
  }

  const pubRoot = join(root, 'public')
  for (const file of walk(pubRoot)) {
    const rel = relative(root, file).replace(/\\/g, '/')
    if (rel.endsWith('index-public.json')) continue
    if (!SCAN_EXTS.has(extname(file).toLowerCase()) && !rel.endsWith('index-public.json')) {
      // Pfade auch in sonstigen Textdateien; Binär überspringen
      if (!['.map', '.css'].includes(extname(file).toLowerCase())) continue
    }
    let raw
    try {
      raw = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    if (FORBIDDEN_PATH_RE.test(raw)) {
      const found = raw.match(new RegExp(FORBIDDEN_PATH_RE.source, 'gi')) || []
      errors.push(`${rel}: verbotene Pfade: ${[...new Set(found)].join(', ')}`)
    }
  }

  return errors
}
