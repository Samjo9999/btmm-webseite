import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('keine Emojis im Quellcode (außer Tests und Docs)', () => {
  const r = spawnSync(process.execPath, [join(root, 'scripts/test-no-emoji.mjs')], {
    cwd: root,
    encoding: 'utf8',
  })
  assert.equal(r.status, 0, r.stderr || r.stdout)
})
