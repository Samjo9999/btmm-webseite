#!/usr/bin/env node
/**
 * Baut die 4 index-public.json-Kopien neu: nur Public-Allowlist-Docs,
 * ohne Tabu-Stämme und ohne INTERN_/_intern/ROTH-/BUSINESSPLAN-Inhalte.
 *
 * Usage: node scripts/filter-index-public.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  INDEX_COPIES,
  loadPublicAllowlist,
  isAllowedRel,
  findTabooHits,
  FORBIDDEN_PATH_RE,
  findIndexHits,
} from './index-public-guard.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourceRel = 'content/wissen/index-public.json'
const payload = JSON.parse(readFileSync(join(root, sourceRel), 'utf8'))
const allow = loadPublicAllowlist(root)

const kept = []
const dropped = { notAllowed: 0, taboo: 0 }
for (const c of payload.chunks || []) {
  if (!isAllowedRel(c.rel, allow)) {
    dropped.notAllowed += 1
    continue
  }
  const blob = [c.title, c.abschnitt, c.text, c.rel].filter(Boolean).join('\n')
  if (findTabooHits(blob).length || FORBIDDEN_PATH_RE.test(blob)) {
    dropped.taboo += 1
    continue
  }
  kept.push(c)
}

const docs = new Set(kept.map((c) => c.rel))
const next = {
  builtAt: new Date().toISOString(),
  docCount: docs.size,
  chunks: kept,
}

const leftover = findIndexHits(next)
if (leftover.length) {
  console.error('Filter hinterließ Treffer:', leftover)
  process.exit(1)
}

const json = JSON.stringify(next)
for (const rel of INDEX_COPIES) {
  writeFileSync(join(root, rel), json)
  console.log(`wrote ${rel} — ${next.docCount} docs, ${kept.length} chunks`)
}
console.log('dropped', dropped)
