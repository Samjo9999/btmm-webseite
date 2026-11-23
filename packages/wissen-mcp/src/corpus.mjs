import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { familyKey, isInternalOnlyFamily, selectLatestByFamily } from './versions.mjs'
import { hasTaboo } from './taboo.mjs'
import { chunkDoc } from './search.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const PKG_ROOT = path.resolve(__dirname, '..')

export function defaultBtmmRoot() {
  return process.env.BTMM_ROOT || '/workspace/projekte/btmm'
}

export function defaultWebRoot() {
  return process.env.WEB_ROOT || path.resolve(PKG_ROOT, '..', '..')
}

export function loadSourcesConfig(webRoot = defaultWebRoot()) {
  const pkgPath = path.join(PKG_ROOT, 'sources.json')
  const raw = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  raw._webRoot = webRoot
  raw._btmmRoot = process.env.BTMM_ROOT || raw.btmmRootHint || defaultBtmmRoot()
  return raw
}

function exists(p) {
  return p && fs.existsSync(p)
}

function walkMd(dir, out = []) {
  if (!exists(dir)) return out
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === '_ersetzt' || ent.name.startsWith('.')) continue
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) walkMd(full, out)
    else if (ent.isFile() && ent.name.endsWith('.md')) out.push(full)
  }
  return out
}

const GENERIC_TITLES = /^(kurz gesagt|worum es geht|in fünf sätzen|einleitung|übersicht|kontext)$/i

function titleOf(content, file) {
  let body = String(content || '')
  if (body.startsWith('---')) {
    const end = body.indexOf('\n---', 3)
    if (end !== -1) body = body.slice(end + 4)
  }
  const titleMatch = body.match(/^#\s+(.+)$/m)
  if (titleMatch) {
    const title = titleMatch[1].trim()
    if (!GENERIC_TITLES.test(title) && title.length > 8) return title
  }
  return path.basename(file, '.md')
}

function relTo(root, file) {
  return path.relative(root, file).replace(/\\/g, '/')
}

function makeDoc({ file, root, tier, source, rel }) {
  const content = fs.readFileSync(file, 'utf8')
  if (!content.trim()) return null
  const useRel = rel || relTo(root, file)
  return {
    id: useRel,
    title: titleOf(content, file),
    path: file,
    rel: useRel,
    tier,
    source,
    content,
    mtime: fs.statSync(file).mtime.toISOString(),
    family: familyKey(useRel),
  }
}

const LABEL_ENTWURF = 'Entwurf, noch nicht beschlossen'

function applyEntwurf(doc, forced) {
  const entwurf =
    forced || /ENTWURF/i.test(doc.rel) || /ENTWURF/i.test(path.basename(doc.rel))
  if (entwurf && !doc.title.includes(LABEL_ENTWURF)) {
    doc.title = `${doc.title} — ${LABEL_ENTWURF}`
  }
  doc.entwurf = !!entwurf
  return doc
}

function resolveExisting(candidates) {
  for (const p of candidates) {
    if (exists(p)) return p
  }
  return null
}

export function discoverExtraRoots(cfg) {
  const missing = []
  const found = []
  const extras = cfg.internalExtras || []
  for (const item of extras) {
    const envVal = item.env && process.env[item.env]
    const candidates = [
      envVal,
      ...(item.candidates || []),
    ].filter(Boolean)
    const hit = item.isFile
      ? resolveExisting(candidates)
      : resolveExisting(candidates)
    if (!hit) {
      missing.push({ id: item.id, candidates })
    } else {
      found.push({ ...item, path: hit })
    }
  }
  return { found, missing }
}

/**
 * @param {'public'|'mitmacher'|'internal'} tier
 * @returns {{ docs: object[], missing: object[], droppedTabooChunks?: number }}
 */
export function loadDocs(tier = 'internal', opts = {}) {
  const cfg = opts.config || loadSourcesConfig(opts.webRoot)
  const btmm = opts.btmmRoot || cfg._btmmRoot
  const web = opts.webRoot || cfg._webRoot
  const missing = []
  const collected = []
  const seenFiles = new Set()

  const pushFile = (file, root, docTier, source, rel) => {
    if (!exists(file)) return
    const real = fs.realpathSync(file)
    const key = `${real}::${docTier}`
    if (seenFiles.has(key)) return
    seenFiles.add(key)
    const doc = makeDoc({ file, root, tier: docTier, source, rel })
    if (doc) collected.push(doc)
  }

  // Drive MDs 01–04
  const mdBase = path.join(btmm, 'DRIVE', 'MDs')
  for (const d of ['01-aussenkontakt', '02-recht', '03-konzept', '04-finanzen']) {
    const dir = path.join(mdBase, d)
    for (const file of walkMd(dir)) {
      pushFile(file, btmm, 'public', `DRIVE/MDs/${d}`)
    }
  }

  // DOKUMENTE-Spiegel (oft neuere Fassungen)
  const dok = path.join(btmm, 'DOKUMENTE')
  if (exists(dok)) {
    for (const file of walkMd(dok)) {
      pushFile(file, btmm, 'public', 'DOKUMENTE')
    }
  }

  // Offizielles: nur für intern vorgesehene Familien aufnehmen (Plan, Annahmen, …)
  const offDir = path.join(btmm, 'DRIVE', 'offizielles', 'btmm', 'dokumente')
  if (exists(offDir)) {
    for (const file of walkMd(offDir)) {
      const rel = relTo(btmm, file)
      const fam = familyKey(rel)
      const internalOnly = isInternalOnlyFamily(fam, cfg.internalOnlyFamilies)
      pushFile(file, btmm, internalOnly ? 'internal' : 'public', 'DRIVE/offizielles', rel)
    }
  }

  // Website-Dokumente aus diesem Repo
  const webDocs = path.join(web, 'content', 'dokumente')
  if (exists(webDocs)) {
    for (const file of walkMd(webDocs)) {
      const rel = `content/dokumente/${path.basename(file)}`
      pushFile(file, web, 'public', 'content/dokumente', rel)
    }
  }

  // Pins (geltende Fassungen) — fehlen sie, merken
  for (const rel of cfg.preferRels || []) {
    const file = path.isAbsolute(rel) ? rel : path.join(btmm, rel)
    if (!exists(file)) {
      missing.push({ id: 'pin', rel, path: file })
      continue
    }
    const fam = familyKey(rel)
    const internalOnly = isInternalOnlyFamily(fam, cfg.internalOnlyFamilies)
    pushFile(file, btmm, internalOnly ? 'internal' : 'public', 'pin', rel)
  }

  // Interne Stand-Dateien
  const intern = path.join(btmm, 'DRIVE', 'md-intern', '06-intern')
  if (exists(intern)) {
    for (const file of walkMd(intern)) {
      pushFile(file, btmm, 'internal', 'DRIVE/md-intern/06-intern')
    }
  }
  for (const name of ['BACKLOG.md', 'SPANNUNGEN.md', 'STAND.md', 'BACKLOG-CODE.md', 'CODE-STAND.md']) {
    const p = path.join(btmm, name)
    if (exists(p)) pushFile(p, btmm, 'internal', name, name)
  }

  // Zusätzliche interne Projektquellen (App, Werkzeugkasten, Branchen-Software, …)
  const extras = discoverExtraRoots(cfg)
  missing.push(...extras.missing)
  for (const item of extras.found) {
    if (item.isFile || (exists(item.path) && fs.statSync(item.path).isFile())) {
      const root = item.root || path.dirname(item.path)
      const rel = item.rel || relTo(root, item.path)
      pushFile(item.path, root, 'internal', item.id, rel)
    } else {
      const files = item.files
        ? item.files.map((f) => path.join(item.path, f)).filter(exists)
        : walkMd(item.path).filter((f) => {
            const rel = relTo(item.path, f)
            if (rel.includes('/pruefung/') || rel.startsWith('pruefung/')) return false
            if (item.maxDepth != null) {
              const depth = rel.split('/').length
              if (depth > item.maxDepth) return false
            }
            return true
          })
      for (const file of files) {
        const root = item.root || item.path
        const rel = (item.relPrefix ? `${item.relPrefix}/` : '') + relTo(item.path, file)
        pushFile(file, root, 'internal', item.id, rel)
      }
    }
  }

  // Familien, die nie public/mitmacher werden dürfen
  for (const doc of collected) {
    if (isInternalOnlyFamily(doc.family, cfg.internalOnlyFamilies)) {
      doc.tier = 'internal'
    }
  }

  const latest = selectLatestByFamily(collected, cfg.preferRels || [])

  if (tier === 'public') {
    return { docs: latest.filter((d) => d.tier === 'public'), missing }
  }

  if (tier === 'mitmacher') {
    const allowPath = path.join(web, 'content', 'wissen-mitglieder', 'ALLOWLIST.json')
    if (!exists(allowPath)) {
      throw new Error(`ALLOWLIST fehlt: ${allowPath}`)
    }
    const allow = JSON.parse(fs.readFileSync(allowPath, 'utf8'))
    const docs = []
    for (const src of allow.sources || []) {
      const rel = src.rel
      if ((allow.blacklistPathPatterns || []).some((p) => rel.includes(p))) {
        continue
      }
      const file = path.isAbsolute(rel) ? rel : path.join(btmm, rel)
      if (!exists(file)) {
        missing.push({ id: src.id || rel, rel, path: file })
        continue
      }
      const doc = makeDoc({
        file,
        root: btmm,
        tier: 'mitmacher',
        source: 'allowlist',
        rel,
      })
      if (doc) docs.push(applyEntwurf(doc, !!src.entwurf))
    }
    return { docs, missing }
  }

  // internal: alle neuesten plus intern gestufte
  return { docs: latest, missing }
}

/**
 * Chunks bauen; für public/mitmacher Tabu-Chunks verwerfen.
 * Verbleibende Tabu-Treffer in Titel/rel sind ein Build-Fehler (ruft der Builder).
 */
export function chunksFromDocs(docs, { dropTaboo = false, textLimit = 1200 } = {}) {
  const chunks = []
  let droppedTaboo = 0
  for (const d of docs) {
    for (const c of chunkDoc(d)) {
      const text = String(c.text || '')
        .replace(/^#+\s*.+\n/, '')
        .trim()
        .slice(0, textLimit)
      if (text.length < 20) continue
      const row = {
        docId: c.docId,
        title: d.title,
        abschnitt: c.abschnitt,
        text,
        rel: d.rel,
        source: d.source,
        tier: d.tier,
        entwurf: !!d.entwurf,
      }
      if (dropTaboo && hasTaboo([row.title, row.abschnitt, row.text, row.rel].join('\n'))) {
        droppedTaboo += 1
        continue
      }
      chunks.push(row)
    }
  }
  return { chunks, droppedTaboo }
}

export { chunkDoc }
