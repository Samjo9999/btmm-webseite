// Außensicht-Fix 24.11.2026: Tabuwörter dürfen in öffentlichen Texten nicht vorkommen.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { RX } from './tabu-woerter.mjs'
import { istGrundsicherungBeispielabschnitt } from '../scripts/index-public-guard.mjs'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
// Ausnahmen: allgemeine Wortbestandteile, kein Bezug auf Gründerfamilie/Tabuthema.
const ERLAUBT = [/werdende (und junge )?Eltern/i]
// Tür-KI (25.11.2026): reine Serverseitige Filterliste, nie sichtbar, dient genau dazu, diese Begriffe abzufangen.
const NUR_FILTERLISTE = new Set(['lib/tuerKi/sensibel-liste.ts'])
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
      if (NUR_FILTERLISTE.has(path.relative(root, f).split(path.sep).join('/'))) continue
      let s = fs.readFileSync(f, 'utf8')
      const rel = path.relative(root, f).split(path.sep).join('/')
      // Nutzer 25.11. 15:30: nur Konzept v22.69.0 Z. 84–113 darf „Grundsicherung“
      // im public-Index führen (Präfix Beispielrechnung:). Andere Tabus bleiben.
      if (rel.endsWith('index-public.json')) {
        const payload = JSON.parse(s)
        for (const c of payload.chunks || []) {
          let blob = [c.title, c.abschnitt, c.text, c.rel].filter(Boolean).join('\n')
          if (istGrundsicherungBeispielabschnitt(c)) {
            blob = blob.replace(/Grundsicherung/gi, '')
          }
          for (const e of ERLAUBT) blob = blob.replace(new RegExp(e.source, e.flags + 'g'), '')
          const m = blob.match(new RegExp(RX.source, 'gi'))
          if (m) treffer.push(`${rel} [${c.abschnitt || ''}]: ${[...new Set(m)].join(', ')}`)
        }
        continue
      }
      for (const e of ERLAUBT) s = s.replace(new RegExp(e.source, e.flags + 'g'), '')
      const m = s.match(new RegExp(RX.source, 'gi'))
      if (m) treffer.push(`${path.relative(root, f)}: ${[...new Set(m)].join(', ')}`)
    }
  }
  assert.deepEqual(treffer, [])
})
