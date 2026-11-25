import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const STEM_RE_PUBLIC =
  /bürgergeld|buergergeld|hartz|krankheit|erkrankung|elternzeit|schwangerschaft|hildastr|karner|happyfarm|elternhof|oberkirch|j\.s\.gartzke|INTERN_|_intern|ROTH-|BUSINESSPLAN/gi
const STEM_RE_MITMACHER =
  /bürgergeld|buergergeld|jobcenter|hartz|krankheit|erkrankung|elternzeit|schwangerschaft|hildastr|karner|happyfarm|elternhof|oberkirch|j\.s\.gartzke|INTERN_|_intern|ROTH-|BUSINESSPLAN/gi

function assertClean(label, file, re) {
  const raw = readFileSync(file, 'utf8')
  const m = raw.match(re) || []
  assert.equal(m.length, 0, `${label} enthält verbotene Stämme/Pfade: ${[...new Set(m)].join(', ')}`)
}

const pub = join(root, 'content/wissen/index-public.json')
const mit = join(root, 'content/wissen-mitglieder/index.json')
assert.ok(existsSync(pub), 'public index')
assert.ok(existsSync(mit), 'mitmacher index')
assertClean('public', pub, STEM_RE_PUBLIC)
assertClean('mitmacher', mit, STEM_RE_MITMACHER)

const pubCopy = join(root, 'public/wissen/index-public.json')
assert.ok(existsSync(pubCopy), 'ausgelieferter Index public/wissen/index-public.json fehlt')
assertClean('public/wissen', pubCopy, STEM_RE_PUBLIC)

for (const rel of [
  'public/vorschau/wissen-chat/index-public.json',
  'public/vorschau/bewertung-chat-feedback/index-public.json',
]) {
  assert.equal(existsSync(join(root, rel)), false, `keine ausgelieferte Kopie: ${rel}`)
}

assert.equal(existsSync(join(root, 'public/wissen-internal')), false, 'kein internal unter public/')

const pubIdx = JSON.parse(readFileSync(pub, 'utf8'))
const mitIdx = JSON.parse(readFileSync(mit, 'utf8'))
const pubChunks = (pubIdx.chunks || []).length
const mitChunks = (mitIdx.chunks || []).length
// Seit Fertig-PR 4 baut sich public aus den 30 Webdokumenten und nicht mehr aus der Allowlist des Mitmacher-Index:
// kein Größenvergleich mehr, dafür muss der public-Index ausschließlich aus content/dokumente-web stammen.
assert.equal(pubIdx.quelle, 'content/dokumente-web')
assert.ok((pubIdx.chunks || []).every((c) => String(c.rel).startsWith('content/dokumente-web/')))

const tabuPublic =
  'bürgergeld|buergergeld|hartz|krankheit|erkrankung|elternzeit|schwangerschaft|hildastr|karner|happyfarm|elternhof|oberkirch|j\\.s\\.gartzke|INTERN_|_intern|ROTH-|BUSINESSPLAN'
const rgPub = spawnSync(
  'rg',
  ['-i', '--', tabuPublic, 'content/wissen/index-public.json', 'public/wissen/index-public.json'],
  { cwd: root, encoding: 'utf8' }
)
assert.notEqual(rgPub.status, 0, `rg public sollte 0 Treffer liefern, bekam:\n${rgPub.stdout}`)
const rgMit = spawnSync(
  'rg',
  [
    '-i',
    '--',
    'bürgergeld|buergergeld|jobcenter|hartz|krankheit|erkrankung|elternzeit|schwangerschaft|hildastr|karner|happyfarm|elternhof|oberkirch|j\\.s\\.gartzke|INTERN_|_intern|ROTH-|BUSINESSPLAN',
    'content/wissen-mitglieder/index.json',
  ],
  { cwd: root, encoding: 'utf8' }
)
assert.notEqual(rgMit.status, 0, `rg mitmacher sollte 0 Treffer liefern, bekam:\n${rgMit.stdout}`)

console.log(`PASS wissen-ausschluss (public ${pubChunks} aus dokumente-web, mitmacher ${mitChunks})`)
