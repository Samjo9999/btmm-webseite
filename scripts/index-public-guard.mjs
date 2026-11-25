/**
 * Guardrails für den öffentlichen Wissens-Index (index-public.json).
 * Tabu: Wortstämme als Teilwort (Komposita/Beugungen), Umlaute gefaltet.
 * Pfadregeln: INTERN_ / _intern/ / ROTH- / BUSINESSPLAN u. a.
 * „Krankenkasse“ bleibt erlaubt (enthält nicht den Stamm „krankheit“).
 * PII-Regex (E-Mail, Telefon, IBAN, Straße+Hausnummer) bricht den Build ab.
 * Seit Fertig-PR 4 wird index-public.json nur noch aus content/dokumente-web gebaut
 * (scripts/filter-index-public.mjs). Chunks aus content/dokumente-web sind Spiegel der
 * veröffentlichten Webdokumente: Pfad-Sonderregeln (Dok 15, Förderung) und die
 * Grundsicherung-Kombi-Regel gelten für sie nicht; Tabu, PII und Altwortlaut prüft
 * scripts/index-public-schwaerzen.mjs. Die Beispielrechnung-Ausnahme gilt nur noch für Altquellen.
 * Kein tuer-public-Index.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'
import {
  BEISPIELRECHNUNG_PREFIX,
  GRUNDSICHERUNG_BEISPIEL,
  normalizeRel,
  istGrundsicherungBeispielabschnitt,
  istGrundsicherungBeispielChunk,
  ohneBeispielrechnungPrefix,
  mitBeispielrechnungPrefix,
} from '../lib/wissen/beispielrechnung-ausnahme.mjs'

export {
  BEISPIELRECHNUNG_PREFIX,
  GRUNDSICHERUNG_BEISPIEL,
  normalizeRel,
  istGrundsicherungBeispielabschnitt,
  istGrundsicherungBeispielChunk,
  ohneBeispielrechnungPrefix,
  mitBeispielrechnungPrefix,
}

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

export const DOKUMENTE_WEB_PREFIX = 'content/dokumente-web/'

export function istDokumenteWebRel(rel) {
  return normalizeRel(rel).startsWith(DOKUMENTE_WEB_PREFIX)
}

export function isAllowedRel(rel, allow) {
  const n = normalizeRel(rel)
  if (!allow.allowed.has(n)) return false
  const s = String(rel || '').replace(/\\/g, '/')
  if (allow.blacklist.some((p) => s.includes(p))) return false
  if (FORBIDDEN_PATH_RE.test(s)) return false
  if (istDokumenteWebRel(s)) return true
  if (INDEX_PATH_EXTRA.some((re) => re.test(s))) return false
  return true
}

export function findIndexHits(payload) {
  const hits = []
  for (const c of payload?.chunks || []) {
    const rel = c.rel || ''
    const blob = [c.title, c.abschnitt, c.text, c.rel].filter(Boolean).join('\n')
    const words = findTabooHits(blob)
    const web = istDokumenteWebRel(rel)
    if (FORBIDDEN_PATH_RE.test(blob) || (!web && INDEX_PATH_EXTRA.some((re) => re.test(rel)))) {
      words.push('verbotener-pfad')
    }
    if (!web && istGrundsicherungKombi(blob) && !istGrundsicherungBeispielabschnitt(c)) {
      words.push('grundsicherung')
    }
    if (istGrundsicherungBeispielabschnitt(c) && !String(c.text || '').startsWith(BEISPIELRECHNUNG_PREFIX)) {
      words.push('beispielrechnung-prefix')
    }
    if (words.length) hits.push({ kind: 'chunk', rel, abschnitt: c.abschnitt, words })
  }
  return hits
}


export function chunkTextBlob(chunk) {
  return [chunk?.title, chunk?.abschnitt, chunk?.text, chunk?.rel].filter(Boolean).join('\n')
}

export function absatzKey(chunk) {
  return `${normalizeRel(chunk?.rel)}\0${chunk?.abschnitt || ''}`
}

/** Grundsicherung plus „fünf Menschen“, „alle mit“ oder ein Euro-Betrag. */
export function istGrundsicherungKombi(text) {
  const raw = String(text || '')
  const n = foldDe(raw)
  if (!n.includes('grundsicherung')) return false
  if (/\bfuenf\b/.test(n) && /\bmenschen\b/.test(n)) return true
  if (/\balle mit\b/.test(n)) return true
  if (/\beuro\b/.test(n) || /€/.test(raw)) return true
  return false
}

// Satzzeichen-Punkt direkt hinter der Adresse („…@gmail.com.“) darf den Treffer nicht verhindern.
const EMAIL_RE =
  /(?<![\w.+-])[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,24}(?![\w+-])(?!\.\w)/gi

const IBAN_RE = /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){10,30}\b/g

const STREET_RE =
  /\b(?:[A-ZÄÖÜ][a-zäöüß]{1,40}(?:[ -][A-ZÄÖÜ]?[a-zäöüß]{1,30}){0,3})(?:straße|strasse|str\.|allee|gasse|ring|damm|ufer)\s+\d{1,4}[a-zA-Z]?\b/giu

const PHONE_INTL_RE =
  /(?<![\w@])(?:\+|00)\s*49[\s./-]*\(?0?\)?[\s./-]*[1-9]\d{1,4}(?:[\s./-]+\d{2,}){1,4}(?![\w@])/g

const PHONE_NAT_RE =
  /(?<![\w@])0\s*[1-9]\d{1,4}(?:[\s/-]+\d{2,}){1,4}(?![\w@])/g

const PHONE_PAREN_RE =
  /(?<![\w@])\(0[1-9]\d{1,4}\)[\s/-]*\d{3,10}(?![\w@])/g

function collectRegexHits(text, re) {
  const out = []
  const src = String(text || '')
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`
  const clone = new RegExp(re.source, flags)
  let m
  while ((m = clone.exec(src))) {
    out.push(m[0])
    if (m.index === clone.lastIndex) clone.lastIndex += 1
  }
  return out
}

function istPlausibleIban(raw) {
  const compact = String(raw || '').replace(/ /g, '')
  return /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(compact) && compact.length >= 15 && compact.length <= 34
}

function istPlausiblePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) return false
  const trimmed = String(raw || '').trim()
  if (/^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(trimmed)) return false
  if (/^0\d[\s.]\d{2}[\s.]\d{4}$/.test(trimmed)) return false
  return true
}

export function findEmailMatches(text) {
  return collectRegexHits(text, EMAIL_RE)
}

export function findPhoneMatches(text) {
  const out = []
  for (const re of [PHONE_INTL_RE, PHONE_NAT_RE, PHONE_PAREN_RE]) {
    for (const m of collectRegexHits(text, re)) {
      if (istPlausiblePhone(m)) out.push(m)
    }
  }
  return out
}

export function findIbanMatches(text) {
  return collectRegexHits(text, IBAN_RE).filter(istPlausibleIban)
}

export function findStreetMatches(text) {
  return collectRegexHits(text, STREET_RE)
}

export function findPiiHits(chunks) {
  const hits = []
  for (const chunk of chunks || []) {
    const blob = chunkTextBlob(chunk)
    const push = (kind, match) => {
      hits.push({ kind, rel: chunk.rel, abschnitt: chunk.abschnitt, match })
    }
    for (const m of findEmailMatches(blob)) push('email', m)
    for (const m of findIbanMatches(blob)) push('iban', m)
    for (const m of findStreetMatches(blob)) push('street', m)
    for (const m of findPhoneMatches(blob)) push('phone', m)
  }
  return hits
}

function markAbsatzDrop(chunks, pred, reason, dropped) {
  const keys = new Set()
  for (const c of chunks) {
    if (pred(c)) keys.add(absatzKey(c))
  }
  if (keys.size === 0) return chunks
  const seen = new Set()
  for (const c of chunks) {
    const key = absatzKey(c)
    if (!keys.has(key) || seen.has(key)) continue
    seen.add(key)
    dropped.push({ reason, rel: c.rel, abschnitt: c.abschnitt })
  }
  return chunks.filter((c) => !keys.has(absatzKey(c)))
}

function alsPublicChunk(chunk) {
  return {
    title: chunk.title,
    abschnitt: chunk.abschnitt,
    rel: chunk.rel,
    text: chunk.text,
  }
}

/**
 * Filtert den öffentlichen Index: Allowlist, Tabu, Grundsicherung-Kombi
 * (mit gezielter Ausnahme), PII; ganze Absätze fallen gemeinsam.
 * Ausnahme-Chunks erhalten das Präfix „Beispielrechnung:“.
 * @param {object[]} chunks
 * @param {{ allow: { allowed: Set<string>, blacklist?: string[] }, beispielChunks?: object[], extraDrop?: (chunk: object) => boolean }} opts
 */
export function anwendenPublicAusschluss(chunks, opts = {}) {
  const dropped = []
  let list = Array.isArray(chunks) ? chunks.map(alsPublicChunk) : []
  const allow = opts.allow

  for (const raw of opts.beispielChunks || []) {
    const c = alsPublicChunk(raw)
    if (!istGrundsicherungBeispielabschnitt(c)) continue
    const text = ohneBeispielrechnungPrefix(c.text)
    const exists = list.some(
      (x) =>
        istGrundsicherungBeispielabschnitt(x) &&
        x.abschnitt === c.abschnitt &&
        ohneBeispielrechnungPrefix(x.text) === text
    )
    if (!exists) list.push(c)
  }

  const extraDrop = typeof opts.extraDrop === 'function' ? opts.extraDrop : () => false

  list = markAbsatzDrop(list, (c) => findTabooHits(chunkTextBlob(c)).length > 0, 'tabu', dropped)
  list = markAbsatzDrop(list, (c) => extraDrop(c), 'tabu', dropped)
  list = markAbsatzDrop(
    list,
    (c) => istGrundsicherungKombi(chunkTextBlob(c)) && !istGrundsicherungBeispielabschnitt(c),
    'grundsicherung',
    dropped
  )
  list = markAbsatzDrop(
    list,
    (c) => allow && !isAllowedRel(c.rel, allow) && !istGrundsicherungBeispielabschnitt(c),
    'allowlist',
    dropped
  )
  list = markAbsatzDrop(list, (c) => findPiiHits([c]).length > 0, 'pii', dropped)

  list = list.map((c) => {
    if (!istGrundsicherungBeispielabschnitt(c)) return c
    const text = mitBeispielrechnungPrefix(c.text)
    return text === c.text ? c : { ...c, text }
  })

  return { chunks: list, dropped }
}


/** Quelle (nicht ausgeliefert) + die einzige ausgelieferte Datei. */
export const INDEX_WRITE_TARGETS = [
  'content/wissen/index-public.json',
  'public/wissen/index-public.json',
]

/** Alias für Tests/Guard: dieselben Dateien, die existieren und tabu-frei sein müssen. */
export const INDEX_COPIES = INDEX_WRITE_TARGETS

/** Diese Pfade dürfen nicht (mehr) als eigene Kopien ausgeliefert werden. */
export const FORBIDDEN_PUBLIC_COPIES = [
  'public/vorschau/wissen-chat/index-public.json',
  'public/vorschau/bewertung-chat-feedback/index-public.json',
  'public/wissen/index-tuer-public.json',
  'public/tuer/index-public.json',
  'public/tuer-public/index-public.json',
  'content/wissen/index-tuer-public.json',
]

export const DELIVERED_INDEX = 'public/wissen/index-public.json'

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
    for (const s of allow.raw.publicSources || []) {
      const r = String(s.rel || '')
      if (/[*?[]/.test(r) || r.includes('**')) {
        errors.push(`PUBLIC-ALLOWLIST: kein exakter Pfad: ${r}`)
      }
    }
    const beispielChunks = []
    for (const c of payload.chunks || []) {
      if (istGrundsicherungBeispielabschnitt(c)) {
        beispielChunks.push(c)
        if (!String(c.text || '').startsWith(BEISPIELRECHNUNG_PREFIX)) {
          errors.push(`${rel}: Beispielrechnung ohne Präfix: ${c.abschnitt}`)
        }
        continue
      }
      if (!isAllowedRel(c.rel, allow)) {
        errors.push(`${rel}: Chunk nicht auf Public-Allowlist: ${c.rel}`)
      }
    }
    const hits = findIndexHits(payload)
    for (const h of hits) {
      errors.push(`${rel}: ${h.rel} (${h.abschnitt}): ${h.words.join(', ')}`)
    }
    const pii = findPiiHits(payload.chunks || [])
    if (pii.length) {
      const preview = pii
        .slice(0, 8)
        .map((h) => `${h.kind}:${h.match} @ ${h.rel} [${h.abschnitt || ''}]`)
        .join('; ')
      errors.push(`${rel}: PII-Treffer, Build abgebrochen (${pii.length}): ${preview}`)
    }
  }

  for (const rel of FORBIDDEN_PUBLIC_COPIES) {
    try {
      readFileSync(join(root, rel))
      errors.push(`ausgelieferte Kopie verboten (nur ${DELIVERED_INDEX} erlaubt): ${rel}`)
    } catch {
      /* fehlt = gut */
    }
  }

  const pubRoot = join(root, 'public')
  for (const file of walk(pubRoot)) {
    const rel = relative(root, file).replace(/\\/g, '/')
    if (rel.endsWith('index-public.json') || /index-tuer-public\.json$/i.test(rel)) {
      if (rel !== DELIVERED_INDEX) {
        errors.push(`ausgelieferte Kopie verboten (nur ${DELIVERED_INDEX} erlaubt): ${rel}`)
      }
      continue
    }
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
