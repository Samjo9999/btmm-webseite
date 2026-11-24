#!/usr/bin/env node
/**
 * Baut den public-Index neu (Quelle + eine ausgelieferte Datei): nur Public-Allowlist-Docs,
 * ohne Tabu-Stämme und ohne INTERN_/_intern/ROTH-/BUSINESSPLAN-Inhalte.
 * Schreibt nur content/wissen/index-public.json und public/wissen/index-public.json.
 * Vorschau-Kopien werden nicht erzeugt (und vorhandene entfernt).
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
  isAllowedRel,
  findTabooHits,
  FORBIDDEN_PATH_RE,
  findIndexHits,
} from './index-public-guard.mjs'
import { RX as AUSSENSICHT_RX } from '../test/tabu-woerter.mjs'

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

const kept = []
const dropped = { notAllowed: 0, taboo: 0 }
for (const c of payload.chunks || []) {
  if (!isAllowedRel(c.rel, allow)) {
    dropped.notAllowed += 1
    continue
  }
  const blob = [c.title, c.abschnitt, c.text, c.rel].filter(Boolean).join('\n')
  if (findTabooHits(blob).length || FORBIDDEN_PATH_RE.test(blob) || failsAussensichtTabu(blob)) {
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
for (const rel of INDEX_WRITE_TARGETS) {
  writeFileSync(join(root, rel), json)
  console.log(`wrote ${rel} — ${next.docCount} docs, ${kept.length} chunks`)
}
for (const rel of FORBIDDEN_PUBLIC_COPIES) {
  const f = join(root, rel)
  if (existsSync(f)) {
    unlinkSync(f)
    console.log(`removed leftover copy ${rel}`)
  }
}
console.log('dropped', dropped)
