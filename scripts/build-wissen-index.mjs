#!/usr/bin/env node
/** Einstieg: siehe packages/wissen-mcp/scripts/build-index.mjs */
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const result = spawnSync(
  process.execPath,
  [path.join(webRoot, 'packages', 'wissen-mcp', 'scripts', 'build-index.mjs'), ...process.argv.slice(2)],
  { stdio: 'inherit', env: { ...process.env, WEB_ROOT: process.env.WEB_ROOT || webRoot }, cwd: webRoot }
)
process.exit(result.status ?? 1)
