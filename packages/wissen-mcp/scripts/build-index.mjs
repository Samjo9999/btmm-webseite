#!/usr/bin/env node
/**
 * Baut public-, Mitmacher- und internal-Index.
 * WISSEN_LLM_ENABLED bleibt unberührt (kein LLM).
 *
 * public/mitmacher: Tabu-Chunks werden verworfen; verbleibende Treffer
 * in der Ausgabedatei beenden den Build mit Exit 1.
 * internal.json wird nie unter public/ oder ins Client-Bundle geschrieben.
 *
 * Usage (Repo-Root):
 *   BTMM_ROOT=/workspace/projekte/btmm node packages/wissen-mcp/scripts/build-index.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadDocs, chunksFromDocs, defaultWebRoot, defaultBtmmRoot, PKG_ROOT } from '../src/corpus.mjs'
import { findTabooInIndex, forbiddenPublicPath, findForbiddenContentHits } from '../src/taboo.mjs'
import { filterEmojisTief, zaehleEmojisTief } from '../src/emoji-filter.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const webRoot = process.env.WEB_ROOT || defaultWebRoot()
const btmmRoot = process.env.BTMM_ROOT || defaultBtmmRoot()

const args = new Set(process.argv.slice(2))
const failOnMissing = args.has('--fail-on-missing')

function writeJson(file, payload) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(payload))
  console.log(`wrote ${file} — ${payload.docCount} docs, ${payload.chunkCount} chunks`)
}

function assertNoTaboo(label, payload, file) {
  const hits = findTabooInIndex(payload)
  if (!hits.length) {
    console.log(`taboo-check ${label}: 0 Treffer`)
    return
  }
  console.error(`TABU in ${label} (${file}):`)
  for (const h of hits.slice(0, 30)) {
    console.error(`  ${h.kind} ${h.rel || ''} ${h.abschnitt || ''} → ${h.words.join(', ')}`)
  }
  if (hits.length > 30) console.error(`  … ${hits.length - 30} weitere`)
  process.exitCode = 1
  throw new Error(`Ausschlussfilter: ${hits.length} Tabu-Treffer in ${label}`)
}

function compactPublic(payload) {
  return {
    builtAt: payload.builtAt,
    docCount: payload.docCount,
    chunkCount: payload.chunkCount,
    tier: 'public',
    chunks: payload.chunks.map((c) => ({
      title: c.title,
      abschnitt: c.abschnitt,
      text: String(c.text).slice(0, 900),
      rel: c.rel,
    })),
  }
}

const missingAll = []

function buildTier(tier, { dropTaboo, textLimit }) {
  const { docs, missing } = loadDocs(tier, { webRoot, btmmRoot })
  missingAll.push(...missing.map((m) => ({ tier, ...m })))
  const { chunks, droppedTaboo } = chunksFromDocs(docs, { dropTaboo, textLimit })
  const payload = {
    builtAt: new Date().toISOString(),
    tier,
    docCount: docs.length,
    chunkCount: chunks.length,
    droppedTaboo: dropTaboo ? droppedTaboo : 0,
    docs: docs.map((d) => ({
      id: d.id,
      title: d.title,
      rel: d.rel,
      source: d.source,
      tier: d.tier,
      mtime: d.mtime,
      chars: d.content.length,
      entwurf: !!d.entwurf,
    })),
    chunks,
  }
  console.log(`${tier}: ${docs.length} docs, ${chunks.length} chunks (tabu-chunks verworfen: ${droppedTaboo})`)
  return emojiFrei(tier, payload)
}

/** Nutzerregel 25.11.: keine Emojis im Index. Quelldokumente bleiben unveraendert. */
function emojiFrei(label, payload) {
  const vorher = zaehleEmojisTief(payload)
  const sauber = filterEmojisTief(payload)
  const nachher = zaehleEmojisTief(sauber)
  console.log(`emoji-filter ${label}: ${vorher} Treffer vorher, ${nachher} nachher`)
  if (nachher) throw new Error(`Emoji-Filter: ${nachher} Treffer in ${label} uebrig`)
  return sauber
}

const pub = buildTier('public', { dropTaboo: true, textLimit: 900 })
const mit = buildTier('mitmacher', { dropTaboo: true, textLimit: 1200 })
const intern = buildTier('internal', { dropTaboo: false, textLimit: 1200 })

function assertPublicGuards(label, payload) {
  const pathHits = []
  for (const d of payload.docs || []) {
    if (forbiddenPublicPath(d.rel)) pathHits.push(d.rel)
  }
  for (const c of payload.chunks || []) {
    if (forbiddenPublicPath(c.rel)) pathHits.push(`${c.rel} :: ${c.abschnitt || ''}`)
  }
  if (pathHits.length) {
    console.error(`VERBOTENER PFAD in ${label}:`)
    for (const h of pathHits.slice(0, 30)) console.error(' ', h)
    throw new Error(`Pfad-Guardrail: ${pathHits.length} Treffer in ${label}`)
  }
  const contentHits = []
  for (const c of payload.chunks || []) {
    const blob = [c.title, c.abschnitt, c.text, c.rel].join('\n')
    const words = findForbiddenContentHits(blob)
    if (words.length) contentHits.push({ rel: c.rel, words })
  }
  if (contentHits.length) {
    console.error(`INHALTSLECK in ${label}:`, contentHits.slice(0, 10))
    throw new Error(`Inhalts-Guardrail: ${contentHits.length} Treffer in ${label}`)
  }
}

assertNoTaboo('public', pub, 'public')
assertNoTaboo('mitmacher', mit, 'mitmacher')
assertPublicGuards('public', pub)
assertPublicGuards('mitmacher', mit)

if (pub.chunkCount > mit.chunkCount) {
  throw new Error(
    `Allowlist-Guardrail: public.chunks (${pub.chunkCount}) darf nicht größer sein als mitmacher.chunks (${mit.chunkCount})`
  )
}
console.log(`größen-check: public ${pub.chunkCount} <= mitmacher ${mit.chunkCount}`)

const pubCompact = compactPublic(pub)

const publicTargets = [
  path.join(webRoot, 'content', 'wissen', 'index-public.json'),
  path.join(webRoot, 'public', 'wissen', 'index-public.json'),
]
for (const f of publicTargets) writeJson(f, pubCompact)

// Keine zweiten Auslieferungs-Kopien unter den Vorschau-Pfaden.
const leftoverPublicCopies = [
  path.join(webRoot, 'public', 'vorschau', 'wissen-chat', 'index-public.json'),
  path.join(webRoot, 'public', 'vorschau', 'bewertung-chat-feedback', 'index-public.json'),
]
for (const f of leftoverPublicCopies) {
  if (fs.existsSync(f)) fs.unlinkSync(f)
}

writeJson(path.join(webRoot, 'content', 'wissen-mitglieder', 'index.json'), mit)

// intern: nur lokal, nie unter public/
const internDir = path.join(webRoot, 'content', 'wissen-internal')
const internPkg = path.join(PKG_ROOT, 'indexes')
writeJson(path.join(internDir, 'index.json'), intern)
writeJson(path.join(internPkg, 'internal.json'), intern)

if (missingAll.length) {
  console.warn('fehlende Quellen:')
  for (const m of missingAll) {
    console.warn(`  [${m.tier || ''}] ${m.id || ''} ${m.rel || ''} ${m.path || (m.candidates || []).join(' | ')}`)
  }
  if (failOnMissing) {
    process.exitCode = 1
    throw new Error(`${missingAll.length} Quellen fehlen`)
  }
}

// Sicherheitsnetz: keine internal-Datei unter public/
const publicIntern = path.join(webRoot, 'public', 'wissen-internal')
if (fs.existsSync(publicIntern)) {
  throw new Error('internal-Index darf nicht unter public/ liegen: ' + publicIntern)
}

console.log('BTMM_ROOT', btmmRoot)
console.log('WEB_ROOT', webRoot)
console.log('WISSEN_LLM_ENABLED unberührt (kein LLM im Build)')
