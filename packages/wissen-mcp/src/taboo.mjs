/**
 * Wörter und Pfade, die nie in public- oder Mitmacher-Index stehen dürfen.
 * intern.json darf sie enthalten.
 *
 * Tabu: eindeutige Stämme als Teilwort (case-insensitive, Umlaute gefaltet),
 * damit Komposita und Beugungen (Bürgergeldbezug, Jobcenters, Krankheitsfall,
 * Hildastr. 12, gegen-hartz.de) nicht durchrutschen.
 * „Krankenkasse“ bleibt erlaubt (enthält nicht den Stamm „krankheit“).
 *
 * Abgleich 24.11.2026: AUSSCHLUSSLISTE.md nennt Bürgergeld, Krankheit,
 * Elternzeit, Schwangerschaft, Hildastraße, Karner. Der Fix-Auftrag #40
 * ergänzt die Stämme buergergeld, jobcenter, hartz, erkrankung, hildastr,
 * happyfarm, elternhof. Die Datei AUSSCHLUSSLISTE.md selbst enthielt zum
 * Zeitpunkt des Builds noch keine Wildcard-Zeile „krank*“ — „krank*“ wird
 * bewusst nicht als Stamm verwendet, weil sonst „Krankenkasse“ fälschlich
 * getroffen würde.
 */
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
  'oberkirch',
]

/** Zusätzliche Inhaltslecks, die den public/Mitmacher-Build abbrechen. */
export const FORBIDDEN_CONTENT = [
  'j.s.gartzke@gmail.com',
  'j.s.gartzke',
  'gegen-hartz',
  'INTERN_',
  '_intern',
  'ROTH-',
  'BUSINESSPLAN',
]

export function foldDe(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
}

/** Treffer als Teilwort / Wortstamm, nicht nur an Wortgrenzen. */
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

export function hasTaboo(text) {
  return findTabooHits(text).length > 0
}

export function findForbiddenContentHits(text) {
  if (!text) return []
  const folded = foldDe(text)
  return FORBIDDEN_CONTENT.filter((s) => folded.includes(foldDe(s)))
}

/**
 * Pfad-Guardrail für public/Mitmacher.
 * „international“ o. Ä. wird nicht als INTERN gewertet.
 * foerderung/annahmen gelten nur für Pfade, nicht für Fließtext
 * (öffentliche Texte dürfen „Förderung“ erwähnen).
 */
export function forbiddenPublicPath(rel) {
  const s = String(rel || '').replace(/\\/g, '/')
  const rules = [
    /(?:^|\/)INTERN(?:[_/\-.]|$)/i,
    /INTERN_/i,
    /(?:^|\/)_intern(?:\/|$)/i,
    /(?:^|\/)ROTH[-_/]/i,
    /BUSINESSPLAN/i,
    /steuer-briefing/i,
    /datei15/i,
    /foerderung/i,
    /annahmen/i,
    /15-geschaeftsmodell/i,
  ]
  return rules.some((re) => re.test(s))
}

export function findForbiddenPathHits(relOrText) {
  return forbiddenPublicPath(relOrText) ? [String(relOrText)] : []
}

/**
 * Durchsucht ein Index-JSON nach Tabu, verbotenen Pfaden und Inhaltslecks.
 * Pfadregeln nur gegen rel, nicht gegen den Chunk-Fließtext.
 */
export function findTabooInIndex(payload) {
  const hits = []
  const docs = payload?.docs || []
  const chunks = payload?.chunks || []
  for (const d of docs) {
    const rel = d.rel || d.id || ''
    const blob = [d.title, d.id, d.rel, d.source].filter(Boolean).join('\n')
    const words = [...findTabooHits(blob), ...findForbiddenContentHits(blob)]
    if (forbiddenPublicPath(rel)) words.push('verbotener-pfad')
    if (words.length) hits.push({ kind: 'doc', rel, words })
  }
  for (const c of chunks) {
    const rel = c.rel || c.docId || ''
    const blob = [c.title, c.abschnitt, c.text, c.rel, c.docId].filter(Boolean).join('\n')
    const words = [...findTabooHits(blob), ...findForbiddenContentHits(blob)]
    if (forbiddenPublicPath(rel)) words.push('verbotener-pfad')
    if (words.length) hits.push({ kind: 'chunk', rel, abschnitt: c.abschnitt, words })
  }
  return hits
}

/** @deprecated Alias, Tests und ältere Importe. */
export const TABOO_WORDS = TABOO_STEMS
