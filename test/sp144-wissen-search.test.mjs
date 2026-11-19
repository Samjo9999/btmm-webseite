import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const index = JSON.parse(readFileSync(join(root, 'content/wissen/index-public.json'), 'utf8'))

assert.ok(index.docCount >= 5, 'docCount')
assert.ok(index.chunks?.length > 10, 'chunks')

const STOP = new Set('und oder der die das ein eine ist sind was wie wer kann man bei für von mit den dem des sich nicht auch hat ich mich mir wir uns auf im in zu zur zum als ob wenn dann noch nur sehr mehr weniger alle alles einen einem einer'.split(' '))
function tokenize(q) {
  return q.toLowerCase().replace(/[?!.,;:„"“”()[\]{}]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))
}
function search(query, chunks, limit = 6) {
  const words = tokenize(query)
  const hits = []
  for (const ch of chunks) {
    const lower = (ch.text || '').toLowerCase()
    let score = 0
    for (const w of words) {
      if (lower.includes(w)) score += 1
    }
    if (score > 0) hits.push({ ...ch, score })
  }
  hits.sort((a, b) => b.score - a.score)
  return hits.slice(0, limit)
}
const hits = search('Was ist der Keim', index.chunks)
assert.ok(hits.length > 0, 'Keim hits')
console.log('PASS sp144-wissen-search', { docs: index.docCount, chunks: index.chunks.length, keimHits: hits.length })
