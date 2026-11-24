import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const STEM_RE =
  /bürgergeld|buergergeld|jobcenter|hartz|krankheit|erkrankung|elternzeit|schwangerschaft|hildastr|karner|happyfarm|elternhof|j\.s\.gartzke|INTERN_|_intern|ROTH-|BUSINESSPLAN/gi

function assertClean(label, file) {
  const raw = readFileSync(file, 'utf8')
  const m = raw.match(STEM_RE) || []
  assert.equal(m.length, 0, `${label} enthält verbotene Stämme/Pfade: ${[...new Set(m)].join(', ')}`)
}

const pub = join(root, 'content/wissen/index-public.json')
const mit = join(root, 'content/wissen-mitglieder/index.json')
assert.ok(existsSync(pub), 'public index')
assert.ok(existsSync(mit), 'mitmacher index')
assertClean('public', pub)
assertClean('mitmacher', mit)

const pubCopy = join(root, 'public/wissen/index-public.json')
if (existsSync(pubCopy)) assertClean('public/wissen', pubCopy)

for (const rel of [
  'public/vorschau/wissen-chat/index-public.json',
  'public/vorschau/bewertung-chat-feedback/index-public.json',
]) {
  const f = join(root, rel)
  if (existsSync(f)) assertClean(rel, f)
}

assert.equal(existsSync(join(root, 'public/wissen-internal')), false, 'kein internal unter public/')

const pubIdx = JSON.parse(readFileSync(pub, 'utf8'))
const mitIdx = JSON.parse(readFileSync(mit, 'utf8'))
const pubChunks = (pubIdx.chunks || []).length
const mitChunks = (mitIdx.chunks || []).length
assert.ok(pubChunks <= mitChunks, `public.chunks (${pubChunks}) > mitmacher.chunks (${mitChunks})`)

const rg = spawnSync(
  'rg',
  [
    '-i',
    '--',
    'bürgergeld|buergergeld|jobcenter|hartz|krankheit|erkrankung|elternzeit|schwangerschaft|hildastr|karner|happyfarm|elternhof|j\\.s\\.gartzke|INTERN_|_intern|ROTH-|BUSINESSPLAN',
    'content/wissen/index-public.json',
    'content/wissen-mitglieder/index.json',
    'public/wissen/index-public.json',
    'public/vorschau/wissen-chat/index-public.json',
    'public/vorschau/bewertung-chat-feedback/index-public.json',
  ],
  { cwd: root, encoding: 'utf8' }
)
assert.notEqual(rg.status, 0, `rg sollte 0 Treffer liefern, bekam:\n${rg.stdout}`)

console.log(`PASS wissen-ausschluss (public ${pubChunks} <= mitmacher ${mitChunks})`)
