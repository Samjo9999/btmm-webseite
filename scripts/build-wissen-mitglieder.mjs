#!/usr/bin/env node
/**
 * Wrapper: Mitmacher- und Gesamt-Index über packages/wissen-mcp.
 * Optional --sync-edge kopiert den Mitmacher-Index in die App (wenn der Pfad existiert).
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const builder = path.join(webRoot, 'packages', 'wissen-mcp', 'scripts', 'build-index.mjs')
const syncEdge = process.argv.includes('--sync-edge')
const extraArgs = process.argv.slice(2).filter((a) => a !== '--sync-edge')

const result = spawnSync(process.execPath, [builder, ...extraArgs], {
  stdio: 'inherit',
  env: { ...process.env, WEB_ROOT: process.env.WEB_ROOT || webRoot },
  cwd: webRoot,
})
if (result.status) process.exit(result.status ?? 1)

if (syncEdge) {
  const btmmRoot = process.env.BTMM_ROOT || '/workspace/projekte/btmm'
  const src = path.join(webRoot, 'content', 'wissen-mitglieder', 'index.json')
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
    console.error('Edge-Pfad fehlt (übersprungen):', edgeCorpus)
    process.exitCode = 1
  } else {
    fs.copyFileSync(src, edgeCorpus)
    console.log('synced edge corpus →', edgeCorpus)
  }
}
