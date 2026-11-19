#!/usr/bin/env node
/**
 * Neu-Indizierung Mitmacher-Corpus (Sp.144 / Prompt 117).
 * Kein Fine-Tuning, kein LLM. Nur freigegebene Allowlist-Docs.
 * Blacklist: 06-intern / INTERN_ / _ersetzt / PII-Hilfsdateien.
 *
 * Usage:
 *   node scripts/build-wissen-mitglieder.mjs
 *   node scripts/build-wissen-mitglieder.mjs --sync-edge
 *   BTMM_ROOT=/path/to/projekte/btmm node scripts/build-wissen-mitglieder.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(__dirname, '..')
const outFile = path.join(webRoot, 'content', 'wissen-mitglieder', 'index.json')
const allowPath = path.join(webRoot, 'content', 'wissen-mitglieder', 'ALLOWLIST.json')
const LABEL_ENTWURF = 'Entwurf, noch nicht beschlossen'

const syncEdge = process.argv.includes('--sync-edge')
const btmmRoot =
  process.env.BTMM_ROOT ||
  path.resolve(webRoot, '..', '..') // repos/btmm-webseite → btmm

const allow = JSON.parse(fs.readFileSync(allowPath, 'utf8'))

function blocked(rel) {
  const s = rel.replace(/\\/g, '/')
  return (allow.blacklistPathPatterns || []).some((p) => s.includes(p))
}

function chunkMarkdown(content, title, rel, entwurf) {
  const parts = content
    .split(/\n(?=#{1,3}\s)|(?:\n\s*\n)/)
    .filter((a) => a.trim().length > 40)
  const chunks = []
  let i = 0
  for (const raw of parts) {
    i += 1
    const erste = raw.split('\n')[0] || ''
    const abschnitt = erste.startsWith('#')
      ? erste.replace(/^#+\s*/, '').slice(0, 120)
      : `${title} · Abschnitt ${i}`
    const text = raw.replace(/^#+\s*.+\n/, '').trim().slice(0, 1200)
    if (text.length < 20) continue
    chunks.push({
      title: entwurf && !title.includes(LABEL_ENTWURF) ? `${title} — ${LABEL_ENTWURF}` : title,
      abschnitt,
      text,
      rel,
      tier: 'mitmacher',
      entwurf: !!entwurf,
    })
  }
  return chunks
}

const docsMeta = []
const chunks = []

for (const src of allow.sources || []) {
  const rel = src.rel
  if (blocked(rel)) {
    console.warn('skip blacklisted', rel)
    continue
  }
  const file = path.join(btmmRoot, rel)
  if (!fs.existsSync(file)) {
    console.error('MISSING', file)
    process.exitCode = 1
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  if (!content.trim()) continue
  const titleMatch = content.match(/^#\s+(.+)$/m)
  let title = titleMatch ? titleMatch[1].trim() : path.basename(rel, '.md')
  const entwurf = !!src.entwurf || /ENTWURF/i.test(rel) || /ENTWURF/i.test(path.basename(rel))
  if (entwurf && !title.includes(LABEL_ENTWURF)) {
    title = `${title} — ${LABEL_ENTWURF}`
  }
  const id = src.id || path.basename(rel)
  docsMeta.push({
    id,
    title,
    rel,
    chars: content.length,
    entwurf,
  })
  chunks.push(...chunkMarkdown(content, title, rel, entwurf))
}

if (!chunks.length) {
  console.error('no chunks built')
  process.exit(1)
}

const payload = {
  builtAt: new Date().toISOString(),
  tier: 'mitmacher',
  docCount: docsMeta.length,
  chunkCount: chunks.length,
  labelNote: allow.labelNote,
  docs: docsMeta,
  chunks,
}

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, JSON.stringify(payload))
console.log(`wrote ${outFile} — ${payload.docCount} docs, ${payload.chunkCount} chunks`)

if (syncEdge) {
  const edgeCorpus = path.resolve(
    btmmRoot,
    'repos',
    'BtMM-App',
    'supabase',
    'functions',
    'wissen-mitmacher',
    'corpus.json'
  )
  if (!fs.existsSync(path.dirname(edgeCorpus))) {
    console.error('Edge-Pfad fehlt:', edgeCorpus)
    process.exit(1)
  }
  fs.writeFileSync(edgeCorpus, JSON.stringify(payload))
  console.log('synced edge corpus →', edgeCorpus)
}

console.log('Drive-Sync:', allow.driveSyncNote)
