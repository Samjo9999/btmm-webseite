import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseFilename, compareVersions, pickLatest, parseDoc, isPublic } from '../scripts/docs-sync/lib.mjs'
import { syncDocs } from '../scripts/docs-sync/sync.mjs'

test('Dateiname parsen', () => {
  assert.deepEqual(parseFilename('BtMM_satzung_v7.27_2026-11-02.md'), { slug: 'satzung', version: '7.27', datum: '2026-11-02', name: 'BtMM_satzung_v7.27_2026-11-02.md' })
  assert.equal(parseFilename('BtMM_app_anforderungen_v12.3.10_2026-01-05.md').slug, 'app-anforderungen')
  assert.equal(parseFilename('BtMM_app_anforderungen_v12.3.10_2026-01-05.md').version, '12.3.10')
  assert.equal(parseFilename('satzung_v7.27_2026-11-02.md'), null)
  assert.equal(parseFilename('BtMM_satzung_v7_2026-11-02.md'), null)
  assert.equal(parseFilename('BtMM_satzung_v7.27_2026-11-02.txt'), null)
})

test('Versionen numerisch vergleichen', () => {
  assert.ok(compareVersions('7.10', '7.9') > 0)
  assert.ok(compareVersions('7.27.1', '7.27') > 0)
  assert.equal(compareVersions('7.27.0', '7.27'), 0)
  assert.ok(compareVersions('10.0', '9.99') > 0)
})

test('höchste Version pro Slug', () => {
  const { latest, ignored } = pickLatest([
    { id: 'a', name: 'BtMM_satzung_v7.9_2026-10-01.md' },
    { id: 'b', name: 'BtMM_satzung_v7.10_2026-09-01.md' },
    { id: 'c', name: 'BtMM_konzept_v16.1.0_2026-10-01.md' },
    { id: 'd', name: 'notizen.md' },
  ])
  assert.deepEqual(latest.map((l) => l.id), ['c', 'b'])
  assert.deepEqual(ignored, ['notizen.md'])
})

test('Titel, Frontmatter, Freigabe', () => {
  const d = parseDoc('---\noeffentlich: false\naenderung: § 14 überarbeitet\n---\n\nText\n# Satzung eG\n', 'satzung')
  assert.equal(d.titel, 'Satzung eG'); assert.equal(d.oeffentlich, false); assert.equal(d.aenderung, '§ 14 überarbeitet')
  assert.equal(parseDoc('ohne Überschrift', 'x').titel, 'x')
  assert.equal(isPublic(undefined, false), true)
  assert.equal(isPublic(false, false), false)
  assert.equal(isPublic(undefined, true), false)
  assert.equal(isPublic(true, true), true)
})

function fakeDrive(files) {
  return { list: async () => Object.keys(files).map((name) => ({ id: name, name })), read: async (id) => files[id] }
}

test('Sync gegen Fake-Drive: schreiben und aufräumen', async () => {
  const root = mkdtempSync(join(tmpdir(), 'docs-'))
  const out = join(root, 'out'), pub = join(root, 'pub')
  mkdirSync(out); writeFileSync(join(out, 'alt.md'), 'alt')
  const m = await syncDocs({ source: fakeDrive({
    'BtMM_satzung_v7.9_2026-10-01.md': '# Alt',
    'BtMM_satzung_v7.10_2026-11-02.md': '---\naenderung: neu\n---\n# Satzung',
    'BtMM_intern_v1.0_2026-11-02.md': '---\noeffentlich: false\n---\n# Intern',
  }), outDir: out, publicDir: pub, log: () => {} })
  assert.deepEqual(m, [{ slug: 'satzung', titel: 'Satzung', version: '7.10', datum: '2026-11-02', aenderung: 'neu', quelle: 'BtMM_satzung_v7.10_2026-11-02.md' }])
  assert.deepEqual(readdirSync(out).sort(), ['manifest.json', 'satzung.md'])
  assert.deepEqual(readdirSync(pub), ['satzung.md'])
  assert.match(readFileSync(join(out, 'satzung.md'), 'utf8'), /^# Satzung/)
  const m2 = await syncDocs({ source: fakeDrive({ 'BtMM_satzung_v7.10_2026-11-02.md': '# S' }), outDir: out, publicDir: pub, requireFlag: true, log: () => {} })
  assert.deepEqual(m2, []); assert.deepEqual(readdirSync(pub), [])
})
