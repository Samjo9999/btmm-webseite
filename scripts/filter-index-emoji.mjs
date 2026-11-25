#!/usr/bin/env node
/**
 * Post-Process: wendet den Emoji-Filter auf die vorhandenen Index-Dateien an
 * (ohne Reindex aus Drive, ohne Netz, ohne Secrets). Quelldokumente bleiben unveraendert.
 * Mapping und Regeln: packages/wissen-mcp/src/emoji-filter.mjs
 *
 * Usage: node scripts/filter-index-emoji.mjs [--check]
 *   --check  schreibt nichts, Exit 1 bei Treffern
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { filterEmojisTief, zaehleEmojisTief } from '../packages/wissen-mcp/src/emoji-filter.mjs'
import { EMOJI_INDEX_DATEIEN } from './emoji-index-dateien.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const nurPruefen = process.argv.includes('--check')
let offen = 0
for (const rel of EMOJI_INDEX_DATEIEN) {
  const file = join(root, rel)
  const payload = JSON.parse(readFileSync(file, 'utf8'))
  const vorher = zaehleEmojisTief(payload)
  if (nurPruefen) {
    console.log(`${rel}: ${vorher} Treffer`)
    offen += vorher
    continue
  }
  const sauber = filterEmojisTief(payload)
  const nachher = zaehleEmojisTief(sauber)
  if (nachher) {
    console.error(`${rel}: ${nachher} Treffer uebrig`)
    process.exit(1)
  }
  if (vorher) writeFileSync(file, JSON.stringify(sauber))
  console.log(`${rel}: ${vorher} Treffer vorher, ${nachher} nachher`)
}
if (offen) process.exit(1)
