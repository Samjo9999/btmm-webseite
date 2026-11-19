import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const route = readFileSync(resolve(root, 'app/api/wissen-mitmacher/route.ts'), 'utf8')
const tiers = readFileSync(resolve(root, 'lib/wissen/llmTiers.ts'), 'utf8')
const preview = readFileSync(
  resolve(root, 'public/vorschau/wissen-mitmacher/index.html'),
  'utf8'
)

assert.match(tiers, /WISSEN_LLM_TIERS/)
assert.match(tiers, /budgetEurMon: 5/)
assert.match(tiers, /budgetEurMon: 15/)
assert.match(tiers, /budgetEurMon: 50/)
assert.match(tiers, /budgetEurMon: 250/)
assert.match(tiers, /isWissenLlmEnabled/)
assert.match(route, /WISSEN_LLM_ENABLED/)
assert.match(route, /WISSEN_LLM_TIER/)
assert.match(route, /SELFHOST_LLM_BASE_URL/)
assert.match(route, /llm_switch_off/)
assert.match(route, /resolveWissenLlmRuntime/)
assert.match(preview, /Schalter aus/)
assert.ok(!preview.includes('checked>\n    Generativ'), 'Generativ darf nicht default-checked sein')
assert.ok(
  readFileSync(resolve(root, 'deploy/selfhost-wissen/docker-compose.yml'), 'utf8').includes(
    'ollama'
  )
)
console.log('sp144-llm-stufen PASS')
