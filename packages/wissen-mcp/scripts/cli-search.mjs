import fs from 'node:fs'
import path from 'node:path'
import { defaultWebRoot, PKG_ROOT } from '../src/corpus.mjs'
import { searchChunks, formatExtractiveAnswer } from '../src/search.mjs'

const q = process.argv.slice(2).join(' ') || 'Solidarfonds'
const tier = process.env.TIER || 'public'
const web = process.env.WEB_ROOT || defaultWebRoot()

const files = {
  public: path.join(web, 'content', 'wissen', 'index-public.json'),
  mitmacher: path.join(web, 'content', 'wissen-mitglieder', 'index.json'),
  internal: path.join(web, 'content', 'wissen-internal', 'index.json'),
}
const file = files[tier] || files.public
if (!fs.existsSync(file)) {
  console.error('Index fehlt:', file)
  process.exit(1)
}
const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const hits = searchChunks(q, data.chunks || [], 5)
console.log(JSON.stringify({ tier, query: q, docCount: data.docCount, file, ...formatExtractiveAnswer(q, hits), hits }, null, 2))
