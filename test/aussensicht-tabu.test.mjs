// Außensicht-Fix 24.11.2026: Tabuwörter dürfen in öffentlichen Texten nicht vorkommen.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { RX } from './tabu-woerter.mjs'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
// Ausnahmen: allgemeine Wortbestandteile, kein Bezug auf Gründerfamilie/Tabuthema.
const ERLAUBT = [/werdende (und junge )?Eltern/i]
// content/wissen-mitglieder: nur serverseitig (JWT), nicht öffentlich – bewusst ausgenommen.
const OEFFENTLICH = ['messages', 'app', 'components', 'lib', 'public', 'content/dokumente', 'content/wissen', 'content/drive-dokumente']

function dateien(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name)
    if (e.isDirectory()) return dateien(p)
    return /\.(tsx?|mjs|js|json|md|html|txt|css)$/.test(e.name) ? [p] : []
  })
}

test('keine Tabuwörter in öffentlichen Texten', () => {
  const treffer = []
  for (const d of OEFFENTLICH) {
    for (const f of dateien(path.join(root, d))) {
      let s = fs.readFileSync(f, 'utf8')
      for (const e of ERLAUBT) s = s.replace(new RegExp(e.source, e.flags + 'g'), '')
      const m = s.match(new RegExp(RX.source, 'gi'))
      if (m) treffer.push(`${path.relative(root, f)}: ${[...new Set(m)].join(', ')}`)
    }
  }
  assert.deepEqual(treffer, [])
})
