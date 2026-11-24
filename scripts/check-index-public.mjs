#!/usr/bin/env node
/** Bricht Build/CI ab, wenn public-Index oder public/-Pfade Lecks enthalten. */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkPublicIndexes } from './index-public-guard.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const errors = checkPublicIndexes(root)
if (errors.length) {
  console.error('index-public Guard fehlgeschlagen:')
  for (const e of errors) console.error(' -', e)
  process.exit(1)
}
console.log('PASS index-public Guard (0 Treffer)')
