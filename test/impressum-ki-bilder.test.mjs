// Impressum: Bildnachweis statt KI-Hinweis (Nutzer 27.11.2026: echte Stockfotos statt KI-Bilder).
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'app/[locale]/(seiten)/impressum/page.tsx'), 'utf8')
const nachweise = JSON.parse(readFileSync(join(root, 'data/bildnachweise.json'), 'utf8'))

test('Impressum: Bildnachweis mit Unsplash-Hinweis und Fotografen-Liste, im Abschnitt Urheberrecht', () => {
  const urheber = src.indexOf('<h3>Urheberrecht</h3>')
  const hinweis = src.indexOf('bildHinweis.titel')
  const koerper = src.indexOf('<h3>Hinweis zur Körperarbeit</h3>')
  assert.ok(urheber > 0 && hinweis > urheber && hinweis < koerper)
  assert.match(src, /id="bildnachweise"/)
  assert.match(src, /Fotos: Unsplash, freie Lizenz\. Fotografinnen und Fotografen siehe Bildnachweise unten\./)
  assert.match(src, /BILD_HINWEIS\[locale\]/)
  assert.match(src, /bildnachweise\.fotos\.map/)
})

test('Impressum: in allen 11 Sprachen ein Bildnachweis-Text mit Unsplash, kein KI-Hinweis, kein Grok', () => {
  const block = src.slice(src.indexOf('const BILD_HINWEIS'), src.indexOf('export const dynamic'))
  const sprachen = ['de', 'en', 'fr', 'es', 'pt', 'ru', 'ar', 'hi', 'bn', 'ja', 'zh']
  for (const l of sprachen) {
    const m = block.match(new RegExp(`\\n  ${l}: \\{\\s*titel: '([^']+)',\\s*text: '([^']+)'`))
    assert.ok(m, `Eintrag ${l} fehlt`)
    assert.match(m[2], /Unsplash/, `${l}: Unsplash fehlt`)
  }
  assert.doesNotMatch(block, /Grok|KI-generiert|KI-bearbeitet|AI-generated|AI-edited|trainedAlgorithmic/i)
  assert.doesNotMatch(src, /Grok|KI-generiert oder KI-bearbeitet/)
})

test('Impressum zeigt jeden Nachweis: Fotograf, Quelle-URL (Unsplash-Fotoseite), Lizenz', () => {
  assert.ok(nachweise.fotos.length >= 14)
  for (const f of nachweise.fotos) {
    assert.ok(f.fotograf && f.fotograf.length > 1, f.id)
    assert.match(f.quelle, /^https:\/\/unsplash\.com\/photos\/[A-Za-z0-9_-]+-[A-Za-z0-9_-]{11}$/, f.id)
    assert.match(f.lizenz, /Unsplash/, f.id)
  }
  assert.match(src, /\{f\.fotograf\}/)
  assert.match(src, /href=\{f\.quelle\}/)
  assert.match(src, /bildnachweise\.lizenzUrl/)
})
