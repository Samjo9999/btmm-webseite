#!/usr/bin/env node
/** Bricht Build/CI ab, wenn public-Index oder public/-Pfade Lecks enthalten. */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { checkPublicIndexes } from './index-public-guard.mjs'
import { zaehleEmojisTief } from '../packages/wissen-mcp/src/emoji-filter.mjs'
import { EMOJI_INDEX_DATEIEN } from './emoji-index-dateien.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const errors = checkPublicIndexes(root)
for (const rel of EMOJI_INDEX_DATEIEN) {
  try {
    const n = zaehleEmojisTief(JSON.parse(readFileSync(join(root, rel), 'utf8')))
    if (n) errors.push(`${rel}: ${n} Emoji-Treffer (npm run wissen:emoji-filter)`)
  } catch (e) {
    errors.push(`${rel}: nicht lesbar (${e.message})`)
  }
}
if (errors.length) {
  console.error('index-public Guard fehlgeschlagen:')
  for (const e of errors) console.error(' -', e)
  process.exit(1)
}
console.log('PASS index-public Guard (0 Treffer)')
