// Bildnachweise: jedes Bild hat einen Eintrag. Unsplash-Fotos: Fotograf, Quelle-URL, Lizenz, Abrufdatum, ohne KI-Marker. Die Holztür ist als KI-Grafik ausgewiesen.
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { bildnachweiseMd } from '../scripts/bildnachweise-md.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const d = JSON.parse(readFileSync(join(root, 'data/bildnachweise.json'), 'utf8'))
const BILD = /\.(jpe?g|png|webp|gif|avif)$/i

function dateien(dir) {
  const out = []
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) out.push(...dateien(p))
    else if (BILD.test(n)) out.push(relative(root, p).split('\\').join('/'))
  }
  return out
}

const erfasst = new Set([...d.fotos.flatMap((f) => f.dateien), ...d.eigene.map((e) => e.datei), ...d.ki.flatMap((k) => k.dateien)])

test('jedes Bild unter public/ (außer public/vorschau) hat einen Bildnachweis-Eintrag', () => {
  const alle = dateien(join(root, 'public')).filter((f) => !f.startsWith('public/vorschau/'))
  assert.ok(alle.length > 30)
  const fehlend = alle.filter((f) => !erfasst.has(f))
  assert.deepEqual(fehlend, [], 'ohne Bildnachweis: ' + fehlend.join(', '))
})

test('jeder Eintrag zeigt auf eine vorhandene Datei', () => {
  for (const f of erfasst) assert.ok(existsSync(join(root, f)), 'Datei fehlt: ' + f)
})

test('jedes Foto: Fotograf, Unsplash-Fotoseite als Quelle, Lizenz, Abrufdatum', () => {
  const ids = new Set()
  for (const f of d.fotos) {
    assert.ok(!ids.has(f.id), 'doppelte id ' + f.id); ids.add(f.id)
    assert.ok(f.fotograf && f.fotograf.length > 1, `${f.id}: Fotograf`)
    assert.match(f.quelle, /^https:\/\/unsplash\.com\/photos\/[A-Za-z0-9_-]+-[A-Za-z0-9_-]{11}$/, `${f.id}: Quelle`)
    assert.ok(!/plus\.unsplash|premium_photo/.test(f.quelle), `${f.id}: kein Unsplash+`)
    assert.match(f.lizenz, /^Unsplash-Lizenz$/, `${f.id}: Lizenz`)
    assert.match(f.abruf, /^\d{2}\.\d{2}\.2026$/, `${f.id}: Abrufdatum`)
    assert.ok(f.dateien.length >= 1)
  }
  const quellen = d.fotos.map((f) => f.quelle)
  assert.equal(new Set(quellen).size, quellen.length, 'dasselbe Foto doppelt belegt')
})

test('alle 12 Weg-Motive und das Kosten-Bild sind als Unsplash-Fotos, die Holztür als KI-Grafik nachgewiesen', () => {
  for (const m of ['arbeiten', 'grundlagen', 'sparen', 'wohnen', 'skeptisch', 'dokumente', 'sinn', 'gruenden', 'freiburg', 'vorbei', 'anpacken', 'folgen']) {
    assert.ok(erfasst.has(`public/tuer/bilder/weg/${m}.jpg`) && erfasst.has(`public/tuer/bilder/weg/${m}.webp`), m)
  }
  for (const n of ['desktop-links', 'desktop-rechts', 'mobil-links', 'mobil-rechts']) assert.ok(erfasst.has(`public/tuer/bilder/holz/${n}.jpg`) && erfasst.has(`public/tuer/bilder/holz/${n}.webp`), n)
  assert.ok(erfasst.has('public/images/kosten-feld.jpg'))
  assert.ok(d.ki.some((k) => k.id === 'tuer-holz'))
  assert.ok(!d.fotos.some((f) => f.id === 'tuer-holz' || (f.dateien || []).some((x) => x.includes('/holz/'))))
  assert.match(d.ki.find((k) => k.id === 'tuer-holz').hinweis, /mit KI/)
})

test('Foto-Dateien tragen keinen KI-Marker (C2PA/XMP) und keinen Grok-Credit', () => {
  for (const f of d.fotos.flatMap((x) => x.dateien)) {
    const s = readFileSync(join(root, f)).toString('latin1')
    assert.ok(!/trainedAlgorithmicMedia|c2pa|Grok/i.test(s), 'KI-Marker in ' + f)
  }
})

test('Unsplash-Fotos ohne KI-Credit; Holztür als KI-Grafik ausgewiesen, ohne Grok-Credit', () => {
  const html = readFileSync(join(root, 'public/tuer/index.html'), 'utf8')
  const texte = readFileSync(join(root, 'public/tuer/texte.js'), 'utf8')
  const impressum = readFileSync(join(root, 'app/[locale]/(seiten)/impressum/page.tsx'), 'utf8')
  const pfad = readFileSync(join(root, 'public/tuer/pfad.js'), 'utf8')
  // Weg-Fotos und Kostenbild: kein Grok, kein „KI-generiert“
  for (const f of d.fotos.flatMap((x) => x.dateien)) {
    const bin = readFileSync(join(root, f)).toString('latin1')
    assert.ok(!/Grok|KI-generiert/i.test(bin), 'KI-Credit in Unsplash-Datei ' + f)
  }
  assert.doesNotMatch(pfad, /Grok|KI-generiert|AI-generated/)
  assert.match(html, /Tür: KI-Grafik; Fotos: Unsplash, freie Lizenz/)
  assert.match(texte, /Tür: KI-Grafik; Fotos: Unsplash, freie Lizenz \(Nachweise im Impressum\)/)
  assert.doesNotMatch(html + texte, /Grok|KI-generiert|AI-generated/)
  assert.match(impressum, /Die Grafik der Eingangstür wurde mit KI erstellt/)
  assert.doesNotMatch(impressum, /Grok|KI-generiert oder KI-bearbeitet/)
})

test('kosten-feld: Pfad in der Seite ist heil und die Datei existiert', () => {
  const s = readFileSync(join(root, 'app/[locale]/kosten/page.tsx'), 'utf8')
  assert.match(s, /\/images\/kosten-feld\.jpg/)
  assert.doesNotMatch(s, /\/images\/\.jpg/)
})

test('content/bildnachweise.md ist aus data/bildnachweise.json erzeugt und aktuell', () => {
  assert.equal(readFileSync(join(root, 'content/bildnachweise.md'), 'utf8'), bildnachweiseMd(d))
})

test('Bilddateien der Unsplash-Fotos bleiben klein (Weg höchstens 450 KB, Kosten höchstens 500 KB)', () => {
  for (const f of d.fotos.flatMap((x) => x.dateien)) {
    const kb = statSync(join(root, f)).size / 1024
    const max = f.includes('/weg/') ? 450 : 500
    assert.ok(kb <= max, `${f} ist ${Math.round(kb)} KB`)
  }
})
