// Zielzahl rund 13 Gründungsmitglieder: 13 ist Ziel, keine Bedingung.
// Build/Test schlägt fehl bei „7 Gründungsmitglied“ und bei 13 in Bedingungsform.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')

const ALT = /7 Gründungsmitglied/
const BEDINGUNG = /erst\s+(mit|ab|bei)\s+13(?!\d)|sobald\s+13(?!\d)/

const DIRS = ['app', 'components', 'messages', 'lib']

function dateien(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name)
    if (e.isDirectory()) return dateien(p)
    return /\.(tsx?|mjs|js|json|md|html|txt)$/.test(e.name) ? [p] : []
  })
}

function oeffentlicheDateien() {
  return DIRS.flatMap((d) => dateien(path.join(root, d)))
}

test('Muster: 7 Gründungsmitglied und 13 als Bedingung werden erkannt', () => {
  assert.match('Wir suchen 7 Gründungsmitglieder.', ALT)
  assert.doesNotMatch('Wir suchen rund 13 Gründungsmitglieder.', ALT)
  assert.match('erst mit 13', BEDINGUNG)
  assert.match('erst ab 13', BEDINGUNG)
  assert.match('erst bei 13', BEDINGUNG)
  assert.match('sobald 13', BEDINGUNG)
  assert.doesNotMatch('sobald drei Mitglieder da sind', BEDINGUNG)
  assert.doesNotMatch('rund 13 Gründungsmitglieder', BEDINGUNG)
  assert.doesNotMatch('sobald 130', BEDINGUNG)
})

test('app, components, messages, lib: kein „7 Gründungsmitglied“', () => {
  const treffer = []
  for (const f of oeffentlicheDateien()) {
    const s = fs.readFileSync(f, 'utf8')
    if (ALT.test(s)) treffer.push(path.relative(root, f))
  }
  assert.deepEqual(treffer, [])
})

test('app, components, messages, lib: 13 nicht in Bedingungsform', () => {
  const treffer = []
  for (const f of oeffentlicheDateien()) {
    const s = fs.readFileSync(f, 'utf8')
    const m = s.match(new RegExp(BEDINGUNG.source, 'g'))
    if (m) treffer.push(`${path.relative(root, f)}: ${m.join(', ')}`)
  }
  assert.deepEqual(treffer, [])
})

test('Gründungsseite: Wortlaut rund 13, ab drei; Meta höchstens 160 Zeichen', () => {
  const src = fs.readFileSync(
    path.join(root, 'app/[locale]/(seiten)/gruendung/page.tsx'),
    'utf8',
  )
  assert.match(src, /An die künftigen Gründungsmitglieder/)
  assert.match(src, /Wir suchen rund 13 Gründungsmitglieder/)
  assert.match(src, /Wir suchen rund 13 Menschen, die die Idee mittragen/)
  assert.match(src, /Gründen können wir schon zu dritt, ohne Zeitdruck/)
  assert.match(src, /sobald drei Mitglieder da sind/)
  assert.doesNotMatch(src, /Ziel sind fünf/)
  assert.doesNotMatch(src, ALT)
  const m = src.match(/description:\s*'([^']+)'/)
  assert.ok(m, 'Meta-Description fehlt')
  assert.ok(m[1].length <= 160, `Meta-Description hat ${m[1].length} Zeichen`)
  assert.match(m[1], /rund 13 Gründungsmitglieder/)
  assert.match(m[1], /sobald drei da sind/)
})

test('Übersetzungen: gruendungsmitglieder_ziel ist rund 13, nicht 7', () => {
  const dir = path.join(root, 'messages')
  for (const loc of fs.readdirSync(dir)) {
    const f = path.join(dir, loc, 'home.json')
    if (!fs.existsSync(f)) continue
    const ziel = JSON.parse(fs.readFileSync(f, 'utf8')).stats.gruendungsmitglieder_ziel
    assert.ok(ziel, `${loc}: Key fehlt`)
    assert.doesNotMatch(String(ziel), /7|৭/, `${loc}: noch Ziel 7 (${ziel})`)
    assert.match(String(ziel), /13|১৩/, `${loc}: Ziel 13 fehlt (${ziel})`)
  }
})
