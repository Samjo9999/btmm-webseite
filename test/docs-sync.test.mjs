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
  return { list: async () => Object.keys(files).map((name) => ({ id: name, name, path: ['MDs'] })), read: async (id) => files[id] }
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
  assert.deepEqual(m, [{ slug: 'satzung', titel: 'Satzung', version: '7.10', datum: '2026-11-02', aenderung: 'neu', quelle: 'BtMM_satzung_v7.10_2026-11-02.md', kategorie: null, pdf: null }])
  assert.deepEqual(readdirSync(out).sort(), ['manifest.json', 'satzung.md'])
  assert.deepEqual(readdirSync(pub).sort(), ['pdf', 'satzung.md'])
  assert.match(readFileSync(join(out, 'satzung.md'), 'utf8'), /^# Satzung/)
  const m2 = await syncDocs({ source: fakeDrive({ 'BtMM_satzung_v7.10_2026-11-02.md': '# S' }), outDir: out, publicDir: pub, requireFlag: true, log: () => {} })
  assert.deepEqual(m2, []); assert.deepEqual(readdirSync(pub), ['pdf'])
})

test('parseDoc: Frontmatter + %%-Header-Zeilen', async () => {
  const { parseDoc } = await import('../scripts/docs-sync/lib.mjs')
  const raw = "---\naenderung: Umbenannt\n---\n%% header: BtMM\n%% header: v22\n# Konzept\nText\n"
  const d = parseDoc(raw, 'x')
  const assert = (await import('node:assert/strict')).default
  assert.equal(d.titel, 'Konzept')
  assert.equal(d.aenderung, 'Umbenannt')
  assert.ok(!d.body.includes('%%'))
  assert.ok(d.body.startsWith('# Konzept'))
})

// --- Rekursion, Kategorien, PDFs ---
import { categoryFromPath, matchPdf } from '../scripts/docs-sync/lib.mjs'

function fakeTree(files) {
  // files: { 'MDs/01-aussenkontakt/BtMM_x_v1.0_2026-01-01.md': inhalt | { size, data } }
  return {
    list: async () => Object.entries(files).map(([p, v]) => {
      const parts = p.split('/'); const name = parts.pop()
      return { id: p, name, path: parts, size: typeof v === 'object' ? v.size : Buffer.byteLength(v) }
    }),
    read: async (id) => files[id],
    readBinary: async (id) => Buffer.from(typeof files[id] === 'object' ? files[id].data : files[id]),
  }
}

test('Kategorie aus Unterordner', () => {
  assert.deepEqual(categoryFromPath(['MDs', '01-aussenkontakt']), { schluessel: '01-aussenkontakt', ordnung: 1, label: 'Aussenkontakt' })
  assert.deepEqual(categoryFromPath(['pdf', '02-recht']), { schluessel: '02-recht', ordnung: 2, label: 'Recht' })
  assert.equal(categoryFromPath(['MDs']), null)
  assert.equal(categoryFromPath([]), null)
  assert.equal(categoryFromPath(['Allgemeines']).ordnung, null)
})

test('doppelte Slugs in verschiedenen Kategorien werden eindeutig', () => {
  const { latest } = pickLatest([
    { id: '1', name: 'BtMM_faq_v1.0_2026-01-01.md', path: ['MDs', '02-recht'] },
    { id: '2', name: 'BtMM_faq_v2.0_2026-01-01.md', path: ['MDs', '01-aussenkontakt'] },
    { id: '3', name: 'BtMM_faq_v1.5_2026-01-01.md', path: ['MDs', '01-aussenkontakt'] },
  ])
  assert.deepEqual(latest.map((l) => [l.slug, l.id]), [['01-aussenkontakt--faq', '2'], ['02-recht--faq', '1']])
})

test('neueste PDF nach Version und Datum', () => {
  const { latest } = pickLatest([
    { id: 'a', name: 'BtMM_satzung_v7.9_2026-12-01.pdf', path: ['pdf'] },
    { id: 'b', name: 'BtMM_satzung_v7.10_2026-10-01.pdf', path: ['pdf'] },
    { id: 'c', name: 'BtMM_satzung_v7.10_2026-10-05.pdf', path: ['pdf'] },
  ], 'BtMM', 'pdf')
  assert.equal(latest.length, 1); assert.equal(latest[0].id, 'c')
  assert.equal(matchPdf({ basisSlug: 'satzung', kategorie: { schluessel: '02-recht' } }, latest).id, 'c')
})

test('Sync rekursiv mit PDFs, Sperre, PDF ohne MD, Größenlimit', async () => {
  const root = mkdtempSync(join(tmpdir(), 'docs-'))
  const out = join(root, 'out'), pub = join(root, 'pub'), pdfDir = join(pub, 'pdf')
  const logs = []
  const tree = {
    'MDs/02-recht/BtMM_satzung_v7.10_2026-11-02.md': '# Satzung',
    'MDs/01-aussenkontakt/BtMM_intern_v1.0_2026-11-02.md': '---\noeffentlich: false\n---\n# Intern',
    'MDs/01-aussenkontakt/BtMM_flyer_v1.0_2026-11-02.md': '# Flyer',
    'pdf/02-recht/BtMM_satzung_v7.9_2026-11-01.pdf': '%PDF alt',
    'pdf/02-recht/BtMM_satzung_v7.10_2026-11-02.pdf': '%PDF neu',
    'pdf/01-aussenkontakt/BtMM_intern_v1.0_2026-11-02.pdf': '%PDF intern',
    'pdf/BtMM_waise_v1.0_2026-11-02.pdf': '%PDF waise',
    'pdf/01-aussenkontakt/BtMM_flyer_v1.0_2026-11-02.pdf': { size: 30 * 1048576, data: '%PDF gross' },
  }
  const m = await syncDocs({ source: fakeTree(tree), outDir: out, publicDir: pub, log: (l) => logs.push(l) })
  assert.deepEqual(m.map((d) => d.slug), ['flyer', 'satzung', 'waise'])
  const satzung = m.find((d) => d.slug === 'satzung')
  assert.deepEqual(satzung.kategorie, { schluessel: '02-recht', ordnung: 2, label: 'Recht' })
  assert.equal(satzung.pdf.version, '7.10')
  assert.equal(readFileSync(join(pdfDir, 'satzung.pdf'), 'utf8'), '%PDF neu')
  assert.equal(m.find((d) => d.slug === 'flyer').pdf, null)
  assert.ok(logs.some((l) => l.startsWith('PDF zu groß')))
  assert.equal(m.find((d) => d.slug === 'waise').nurPdf, true)
  assert.deepEqual(readdirSync(pdfDir).sort(), ['satzung.pdf', 'waise.pdf'])
  assert.ok(logs.some((l) => l.includes('ebenfalls gesperrt')))

  const logs2 = []
  const m2 = await syncDocs({ source: fakeTree({
    'MDs/02-recht/BtMM_satzung_v7.10_2026-11-02.md': '---\noeffentlich: true\n---\n# Satzung',
    'pdf/02-recht/BtMM_satzung_v7.10_2026-11-02.pdf': '%PDF neu',
    'pdf/BtMM_waise_v1.0_2026-11-02.pdf': '%PDF waise',
  }), outDir: out, publicDir: pub, requireFlag: true, log: (l) => logs2.push(l) })
  assert.deepEqual(m2.map((d) => d.slug), ['satzung'])
  assert.deepEqual(readdirSync(pdfDir), ['satzung.pdf'])
  assert.ok(logs2.some((l) => l.startsWith('PDF ohne MD übersprungen')))
})

test('nur MDs/ und pdf/ auf oberster Ebene; md-intern, png, Wurzeldateien ignoriert', async () => {
  const root = mkdtempSync(join(tmpdir(), 'docs-'))
  const out = join(root, 'out'), pub = join(root, 'pub'), logs = []
  const m = await syncDocs({ source: fakeTree({
    'md/03-konzept/BtMM_konzept_v1.0_2026-11-02.md': '# Konzept',
    'md-intern/BtMM_geheim_v1.0_2026-11-02.md': '# Geheim',
    'md-intern/02-recht/BtMM_notiz_v1.0_2026-11-02.md': '# Notiz',
    'MD-INTERN/pdf/BtMM_geheim_v1.0_2026-11-02.pdf': '%PDF',
    'png/BtMM_bild_v1.0_2026-11-02.md': '# Bild',
    'code/pdf/BtMM_x_v1.0_2026-11-02.pdf': '%PDF',
    'BtMM_wurzel_v1.0_2026-11-02.md': '# Wurzel',
    'PDFS/04-finanzen/BtMM_plan_v1.0_2026-11-02.pdf': '%PDF plan',
  }), outDir: out, publicDir: pub, log: (l) => logs.push(l) })
  assert.deepEqual(m.map((d) => d.slug), ['konzept', 'plan'])
  const alles = JSON.stringify(m) + readdirSync(out).join() + readdirSync(pub).join() + readdirSync(join(pub, 'pdf')).join()
  for (const w of ['geheim', 'notiz', 'bild', 'wurzel', 'x.pdf']) assert.ok(!alles.includes(w), w)
  assert.ok(logs.some((l) => l.includes('direkt in der Wurzel')))
})
