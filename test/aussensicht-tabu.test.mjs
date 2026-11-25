// Außensicht-Fix 24.11.2026: Tabuwörter dürfen in öffentlichen Texten nicht vorkommen.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { RX } from './tabu-woerter.mjs'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
// Ausnahmen: allgemeine Wortbestandteile, kein Bezug auf Gründerfamilie/Tabuthema.
const ERLAUBT = [/werdende (und junge )?Eltern/i]
const ERLAUBT_INDEX = [/(?<!hof der )eltern(?!zeit|hof)/i]
// Tür-KI (25.11.2026): reine Serverseitige Filterliste, nie sichtbar, dient genau dazu, diese Begriffe abzufangen.
const NUR_FILTERLISTE = new Set(['lib/tuerKi/sensibel-liste.ts', 'lib/wissen/beispielrechnung-ausnahme.mjs'])
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
      // Der Index spiegelt die veröffentlichten Webdokumente (content/dokumente-web). Wie in
      // test/dokumente-web.test.mjs gilt: „Grundsicherung“ ist erlaubt (Nutzer 25.11.), ebenso „Eltern“
      // außer Elternzeit/Elternhof. Alle übrigen Außensicht-Tabus (Jobcenter, Bürgergeld, erkrank,
      // schwanger, Hildastraße, Karner ...) müssen im Index auf 0 stehen; die Schwärz-Regeln
      // (scripts/index-public-schwaerzen.mjs) entfernen sie dort, die Quelldokumente bleiben unverändert.
      if (rel.endsWith('index-public.json')) {
        const payload = JSON.parse(s)
        for (const c of payload.chunks || []) {
          let blob = [c.title, c.abschnitt, c.text, c.rel].filter(Boolean).join('\n')
          blob = blob.replace(/Grundsicherung/gi, '')
          for (const e of [...ERLAUBT, ...ERLAUBT_INDEX]) blob = blob.replace(new RegExp(e.source, e.flags + 'g'), '')
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
