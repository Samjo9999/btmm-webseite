/**
 * Dokumentfamilie + Versionsvergleich, damit nur die geltende Fassung bleibt.
 */

export function parseVersion(name) {
  const m = String(name).match(/v(\d+(?:[._]\d+)*)([a-z])?/i)
  if (!m) return null
  const parts = m[1].split(/[._]/).map((n) => Number(n))
  const letter = m[2] ? m[2].toLowerCase().charCodeAt(0) - 96 : 0
  return { parts, letter, raw: m[0].replace(/_/g, '.') }
}

export function compareVersions(a, b) {
  if (!a && !b) return 0
  if (!a) return -1
  if (!b) return 1
  const n = Math.max(a.parts.length, b.parts.length)
  for (let i = 0; i < n; i++) {
    const d = (a.parts[i] || 0) - (b.parts[i] || 0)
    if (d) return d
  }
  return a.letter - b.letter
}

const GENERIC_BASENAMES = new Set([
  'readme',
  'stand',
  'wissen',
  'backlog',
  'faq',
  'lizenz',
  'license',
  'changelog',
  'code-stand',
])

/**
 * Stabiler Schlüssel je Dokumentfamilie (ohne Version/Datum).
 * 08-Satzung außen und schlank bleiben getrennte Familien.
 * Generische Namen (README, STAND) werden mit dem Ordner disambiguiert,
 * damit App-README und Werkzeugkasten-STAND nicht zusammenfallen.
 */
export function familyKey(filenameOrRel) {
  const rel = String(filenameOrRel).replace(/\\/g, '/')
  let base = rel.split('/').pop() || ''
  base = base.replace(/\.md$/i, '')
  const variant = /aussen/i.test(base) ? 'aussen' : /schlank/i.test(base) && /satzung/i.test(base) ? 'schlank' : ''
  base = base.replace(/_?\d{4}-\d{2}-\d{2}/g, '')
  base = base.replace(/_?(aussen|schlank)/gi, '')
  base = base.replace(/_?ENTWURF/gi, '')
  base = base.replace(/_?v\d+(?:[._]\d+)*[a-z]?/gi, '')
  base = base.replace(/BtMM_?/gi, '')
  base = base.toLowerCase().replace(/[_.]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const key = variant ? `${base}::${variant}` : base
  const lowerRel = rel.toLowerCase()
  for (const p of ['werkzeugkasten/', 'btmm-app/', 'branchen-software/', 'content/']) {
    if (lowerRel === p.slice(0, -1) || lowerRel.startsWith(p) || lowerRel.includes(`/${p}`)) {
      return `${p.slice(0, -1)}::${key}`
    }
  }
  if (GENERIC_BASENAMES.has(base)) {
    const dir = rel.split('/').slice(-2, -1)[0] || 'root'
    return `${dir.toLowerCase()}::${key}`
  }
  return key
}

export function isInternalOnlyFamily(key, patterns) {
  const k = key.toLowerCase()
  return (patterns || []).some((p) => {
    const pat = String(p).toLowerCase()
    return k === pat || k.startsWith(`${pat}-`) || k.startsWith(`${pat}::`) || k.includes(pat)
  })
}

/** Behält je Familie nur die höchste Version; Pins (exakter rel-Pfad) gewinnen. */
export function selectLatestByFamily(docs, preferRels = []) {
  const prefer = new Set(preferRels.map((r) => r.replace(/\\/g, '/')))
  const byFamily = new Map()
  for (const doc of docs) {
    const key = familyKey(doc.rel || doc.id || '')
    const prev = byFamily.get(key)
    if (!prev) {
      byFamily.set(key, doc)
      continue
    }
    const prevRel = (prev.rel || '').replace(/\\/g, '/')
    const docRel = (doc.rel || '').replace(/\\/g, '/')
    if (prefer.has(docRel) && !prefer.has(prevRel)) {
      byFamily.set(key, doc)
      continue
    }
    if (prefer.has(prevRel) && !prefer.has(docRel)) continue
    const cv = compareVersions(parseVersion(doc.rel || ''), parseVersion(prev.rel || ''))
    if (cv > 0) byFamily.set(key, doc)
    else if (cv === 0 && docRel.length > prevRel.length) {
      byFamily.set(key, doc)
    }
  }
  return [...byFamily.values()]
}
