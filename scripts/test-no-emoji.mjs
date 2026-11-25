#!/usr/bin/env node
/**
 * Verbietet Emojis, Dingbats, Häkchen, Warnzeichen, Flaggen und VS16
 * im Quellcode (außer Tests und Docs). Typografische Pfeile (→) und
 * geometrische Aufzählungszeichen (●) sind erlaubt.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'

const root = process.cwd()

const EMOJI_RE =
  /[\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F000}-\u{1FAFF}\u{E0020}-\u{E007F}]/gu

const SKIP_DIR = new Set([
  '.git', 'node_modules', '.next', 'out', 'dist', 'build', 'coverage',
  'docs', 'test', 'tests', '__tests__',
])

const SKIP_FILE = new Set([
  'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock',
  'build_btb.log', 'build_output.txt', 'dev_output.txt',
])

const SKIP_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.pdf', '.zip', '.gz', '.tgz', '.mp3', '.mp4', '.webm',
  '.map', '.wasm', '.md', '.mdx', '.log',
])

function skipPath(rel) {
  const parts = rel.split('/')
  if (parts.some((p) => SKIP_DIR.has(p))) return true
  // generierte Wissens-Indizes (Auszüge offizieller Dokumente)
  if (rel.includes('content/wissen/') || rel.includes('content/wissen-mitglieder/')) return true
  if (rel.includes('public/wissen/') || rel.includes('packages/wissen-mcp/indexes/')) return true
  if (/(^|\/)[^/]+\.(test|spec)\.(js|jsx|ts|tsx|mjs|cjs)$/.test(rel)) return true
  return false
}

const TEXT_EXT = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json',
  '.html', '.css', '.scss', '.txt', '.yml', '.yaml',
  '.svg', // skipped above actually - keep out
])

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') && name !== '.eslintrc.json') {
      if (name !== '.') continue
    }
    if (SKIP_DIR.has(name) || name === '.git') continue
    const full = join(dir, name)
    const rel = relative(root, full)
    if (skipPath(rel)) continue
    const st = statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (st.isFile()) {
      if (SKIP_FILE.has(name)) continue
      const ext = extname(name).toLowerCase()
      // Markdown sonst ausgenommen; content/dokumente-web/ wird mitgeprüft.
      const dokMd = ext === '.md' && rel.startsWith('content/dokumente-web/')
      if (SKIP_EXT.has(ext) && !dokMd) continue
      acc.push(full)
    }
  }
  return acc
}

const hits = []
for (const file of walk(root)) {
  let text
  try {
    const buf = readFileSync(file)
    if (buf.includes(0)) continue
    text = buf.toString('utf8')
  } catch {
    continue
  }
  const rel = relative(root, file)
  const lines = text.split(/\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    EMOJI_RE.lastIndex = 0
    let m
    while ((m = EMOJI_RE.exec(line))) {
      hits.push(`${rel}:${i + 1}:${m.index + 1} ${JSON.stringify(m[0])}`)
    }
  }
}

if (hits.length) {
  console.error(`Emojis im Quellcode gefunden (${hits.length}):`)
  for (const h of hits) console.error('  ' + h)
  process.exit(1)
}

console.log('Keine Emojis im Quellcode (außer Tests und Docs; inkl. content/dokumente-web).')
