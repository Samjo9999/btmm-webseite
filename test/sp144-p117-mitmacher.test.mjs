import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { searchChunks } from '../lib/wissen/search.ts'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const idx = path.join(root, 'content/wissen-mitglieder/index.json')
assert.ok(fs.existsSync(idx), 'mitmacher index')
assert.ok(!idx.includes(`${path.sep}public${path.sep}`))
const data = JSON.parse(fs.readFileSync(idx, 'utf8'))
assert.ok(data.chunks.length > 100)
assert.ok(data.chunks.every((c) => !/md-intern|06-intern/i.test(c.rel || '')))
assert.ok(data.chunks.some((c) => c.entwurf))
const hits = searchChunks('Satzung Entwurf Genossenschaft', data.chunks, 4)
assert.ok(hits.length >= 1)

const route = fs.readFileSync(path.join(root, 'app/api/wissen-mitmacher/route.ts'), 'utf8')
assert.match(route, /Keine Rechtsberatung/)
assert.match(route, /getUser/)
assert.match(route, /SCALEWAY_SECRET_KEY/)
assert.match(route, /mistral-small-3.2-24b-instruct-2506/)
assert.doesNotMatch(route, /ANTHROPIC/)

const preview = fs.readFileSync(
  path.join(root, 'public/vorschau/wissen-mitmacher/index.html'),
  'utf8'
)
assert.match(preview, /generative/)
assert.match(preview, /Generativ/)
console.log('p117 mitmacher+scaleway ok', data.docCount, data.chunks.length)
