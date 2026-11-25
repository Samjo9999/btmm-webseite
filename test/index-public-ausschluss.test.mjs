import test from 'node:test'
import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { INDEX_COPIES, FORBIDDEN_PUBLIC_COPIES, checkPublicIndexes } from '../scripts/index-public-guard.mjs'

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

test('keine zweiten ausgelieferten index-public.json-Kopien', () => {
  for (const rel of FORBIDDEN_PUBLIC_COPIES) {
    assert.equal(existsSync(join(root, rel)), false, `Kopie darf nicht existieren: ${rel}`)
  }
})

test('Vorschau-Chats laden /wissen/index-public.json, Rewrites greifen', () => {
  const wissen = readFileSync(join(root, 'public/vorschau/wissen-chat/app.js'), 'utf8')
  const bewertung = readFileSync(join(root, 'public/vorschau/bewertung-chat-feedback/app-wissen.js'), 'utf8')
  assert.match(wissen, /fetch\(['"]\/wissen\/index-public\.json['"]\)/)
  assert.match(bewertung, /fetch\(['"]\/wissen\/index-public\.json['"]\)/)
  assert.doesNotMatch(wissen, /fetch\(['"]index-public\.json['"]\)/)
  assert.doesNotMatch(bewertung, /fetch\(['"]index-public\.json['"]\)/)
  const nextCfg = readFileSync(join(root, 'next.config.mjs'), 'utf8')
  const vercel = readFileSync(join(root, 'vercel.json'), 'utf8')
  for (const src of [
    '/vorschau/wissen-chat/index-public.json',
    '/vorschau/bewertung-chat-feedback/index-public.json',
  ]) {
    assert.match(nextCfg, new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.match(vercel, new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})
