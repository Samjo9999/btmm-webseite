#!/usr/bin/env node
/**
 * Baut den public-Index neu (Quelle + eine ausgelieferte Datei): nur Public-Allowlist-Docs,
 * ohne Tabu-Stämme, ohne INTERN_/_intern/ROTH-/BUSINESSPLAN-Inhalte, ohne PII-Absätze
 * und ohne Grundsicherung-Kombis — außer der gezielten Beispielrechnung
 * (Konzept v22.69.0, Z. 84–113, Präfix „Beispielrechnung:“).
 * Fällt ein Chunk, fällt der ganze Absatz (gleiches rel+abschnitt).
 * Schreibt nur content/wissen/index-public.json und public/wissen/index-public.json.
 * Vorschau- und tuer-public-Kopien werden nicht erzeugt (und vorhandene entfernt).
 *
 * Usage: node scripts/filter-index-public.mjs
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  INDEX_WRITE_TARGETS,
  FORBIDDEN_PUBLIC_COPIES,
  loadPublicAllowlist,
  findIndexHits,
  findPiiHits,
  anwendenPublicAusschluss,
  istGrundsicherungBeispielabschnitt,
  GRUNDSICHERUNG_BEISPIEL,
  BEISPIELRECHNUNG_PREFIX,
  chunkTextBlob,
} from './index-public-guard.mjs'
import { RX as AUSSENSICHT_RX } from '../test/tabu-woerter.mjs'
import { filterEmojisTief, zaehleEmojisTief } from '../packages/wissen-mcp/src/emoji-filter.mjs'

/** Gleiche Ausnahme wie test/aussensicht-tabu.test.mjs */
const ERLAUBT = [/werdende (und junge )?Eltern/i]

function failsAussensichtTabu(blob) {
  let s = String(blob || '')
  for (const e of ERLAUBT) s = s.replace(new RegExp(e.source, e.flags + 'g'), '')
  return new RegExp(AUSSENSICHT_RX.source, 'gi').test(s)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourceRel = 'content/wissen/index-public.json'
const payload = JSON.parse(readFileSync(join(root, sourceRel), 'utf8'))
const allow = loadPublicAllowlist(root)
const beforeCount = (payload.chunks || []).length

const mitmacherPath = join(root, 'content', 'wissen-mitglieder', 'index.json')
if (!existsSync(mitmacherPath)) {
  console.error(`Mitmacher-Index fehlt, Beispielrechnung kann nicht übernommen werden: content/wissen-mitglieder/index.json`)
  process.exit(1)
}
const mitmacher = JSON.parse(readFileSync(mitmacherPath, 'utf8'))
const beispielChunks = (mitmacher.chunks || [])
  .filter(istGrundsicherungBeispielabschnitt)
  .map((c) => ({ title: c.title, abschnitt: c.abschnitt, rel: c.rel, text: c.text }))
if (beispielChunks.length === 0) {
  console.error(`Keine Chunks für ${GRUNDSICHERUNG_BEISPIEL.rel} Z. 84–113 im Mitmacher-Index`)
  process.exit(1)
}

const { chunks: kept, dropped } = anwendenPublicAusschluss(payload.chunks || [], {
  allow,
  beispielChunks,
  extraDrop: (c) => {
    let blob = chunkTextBlob(c)
    // Gezielte Ausnahme (Nutzer 25.11. 15:30): in Z. 84–113 darf „Grundsicherung“ stehen.
    // Andere Außensicht-Tabus gelten weiter.
    if (istGrundsicherungBeispielabschnitt(c)) {
      blob = blob.replace(/Grundsicherung/gi, '')
    }
    return failsAussensichtTabu(blob)
  },
})

const docs = new Set(kept.map((c) => c.rel))
// Nutzerregel 25.11.: keine Emojis im ausgelieferten Index.
const next = filterEmojisTief({
  builtAt: new Date().toISOString(),
  docCount: docs.size,
  chunks: kept,
})
if (zaehleEmojisTief(next)) {
  console.error('Emoji-Filter hinterließ Treffer')
  process.exit(1)
}

const leftover = findIndexHits(next)
const pii = findPiiHits(next.chunks || [])
if (leftover.length || pii.length) {
  console.error('Filter hinterließ Treffer, Build abgebrochen:')
  for (const h of leftover.slice(0, 20)) {
    console.error(` - ${h.rel} (${h.abschnitt}): ${(h.words || []).join(', ')}`)
  }
  for (const h of pii.slice(0, 20)) {
    console.error(` - PII ${h.kind}: ${h.match} @ ${h.rel} [${h.abschnitt || ''}]`)
  }
  process.exit(1)
}

const json = JSON.stringify(next)
for (const rel of INDEX_WRITE_TARGETS) {
  writeFileSync(join(root, rel), json)
  console.log(`wrote ${rel} — ${next.docCount} docs, ${kept.length} chunks (vorher ${beforeCount})`)
}
for (const rel of FORBIDDEN_PUBLIC_COPIES) {
  const f = join(root, rel)
  if (existsSync(f)) {
    unlinkSync(f)
    console.log(`removed leftover copy ${rel}`)
  }
}

const droppedByReason = new Map()
for (const d of dropped) {
  if (!droppedByReason.has(d.reason)) droppedByReason.set(d.reason, [])
  droppedByReason.get(d.reason).push(d)
}
const counts = {}
for (const [reason, items] of droppedByReason) {
  counts[reason] = items.length
  console.log(`  fallen (${reason}, ${items.length} Absätze):`)
  for (const d of items) console.log(`    - ${d.rel} [${d.abschnitt}]`)
}
const beispielKept = (next.chunks || []).filter(istGrundsicherungBeispielabschnitt)
console.log(
  `  Beispielrechnung: ${beispielKept.length} Chunks, Präfix „${BEISPIELRECHNUNG_PREFIX}“ aus ${GRUNDSICHERUNG_BEISPIEL.rel}`
)
console.log('dropped', counts)
