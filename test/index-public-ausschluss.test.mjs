import test from 'node:test'
import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { INDEX_COPIES, checkPublicIndexes } from '../scripts/index-public-guard.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('public index-public.json: keine Tabu-Stämme, keine internen Pfade, nur Allowlist', () => {
  const errors = checkPublicIndexes(root)
  assert.deepEqual(errors, [])
})

test('rg: 0 Treffer in allen index-public.json-Kopien', () => {
  const rg = spawnSync(
    'rg',
    [
      '-i',
      '--',
      'bürgergeld|buergergeld|jobcenter|hartz|krankheit|erkrankung|elternzeit|schwangerschaft|hildastr|karner|happyfarm|elternhof|j\\.s\\.gartzke|INTERN_|_intern|ROTH-|BUSINESSPLAN',
      ...INDEX_COPIES,
    ],
    { cwd: root, encoding: 'utf8' }
  )
  assert.notEqual(rg.status, 0, `rg sollte 0 Treffer liefern, bekam:\n${rg.stdout}`)
})
