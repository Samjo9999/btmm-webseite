import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const tabooRe =
  /(?<![\p{L}\p{N}_])(bürgergeld|krankheit|erkrankung|elternzeit|schwangerschaft|jobcenter|hildastraße|hildastrasse|karner)(?![\p{L}\p{N}_])/giu

function assertClean(label, file) {
  const raw = readFileSync(file, 'utf8')
  const m = raw.match(tabooRe) || []
  assert.equal(m.length, 0, `${label} enthält Tabuwörter: ${m.join(', ')}`)
}

const pub = join(root, 'content/wissen/index-public.json')
const mit = join(root, 'content/wissen-mitglieder/index.json')
assert.ok(existsSync(pub), 'public index')
assert.ok(existsSync(mit), 'mitmacher index')
assertClean('public', pub)
assertClean('mitmacher', mit)

const pubCopy = join(root, 'public/wissen/index-public.json')
if (existsSync(pubCopy)) assertClean('public/wissen', pubCopy)

assert.equal(existsSync(join(root, 'public/wissen-internal')), false, 'kein internal unter public/')

// rg-Äquivalent auf die gebauten public/mitmacher-Dateien
const rg = spawnSync(
  'rg',
  [
    '-i',
    '-P',
    '--',
    '(?<![\\p{L}\\p{N}_])(bürgergeld|krankheit|erkrankung|elternzeit|schwangerschaft|jobcenter|hildastraße|hildastrasse|karner)(?![\\p{L}\\p{N}_])',
    'content/wissen/index-public.json',
    'content/wissen-mitglieder/index.json',
    'public/wissen/index-public.json',
  ],
  { cwd: root, encoding: 'utf8' }
)
assert.notEqual(rg.status, 0, `rg sollte 0 Treffer liefern, bekam:\n${rg.stdout}`)

console.log('PASS wissen-ausschluss')
