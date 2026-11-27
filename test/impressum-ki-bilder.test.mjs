// Impressum: Bildnachweis (Unsplash-Fotos; Holztür als KI-Grafik, Nutzerkorrektur 27.11.2026).
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'app/[locale]/(seiten)/impressum/page.tsx'), 'utf8')
const nachweise = JSON.parse(readFileSync(join(root, 'data/bildnachweise.json'), 'utf8'))

test('Impressum: Bildnachweis mit Unsplash-Hinweis, Fotografen-Liste und Hinweis zur Holztür, im Abschnitt Urheberrecht', () => {
  const urheber = src.indexOf('<h3>Urheberrecht</h3>')
  const hinweis = src.indexOf('bildHinweis.titel')
  const koerper = src.indexOf('<h3>Hinweis zur Körperarbeit</h3>')
  assert.ok(urheber > 0 && hinweis > urheber && hinweis < koerper)
  assert.match(src, /id="bildnachweise"/)
  assert.match(src, /Fotos: Unsplash, freie Lizenz\. Fotografinnen und Fotografen siehe Bildnachweise unten\. Die Grafik der Eingangstür wurde mit KI erstellt\./)
  assert.match(src, /BILD_HINWEIS\[locale\]/)
  assert.match(src, /bildnachweise\.fotos\.map/)
})

test('Impressum: in allen 11 Sprachen Unsplash-Fotos und Hinweis, dass die Eingangstür mit KI erstellt wurde', () => {
  const block = src.slice(src.indexOf('const BILD_HINWEIS'), src.indexOf('export const dynamic'))
  const sprachen = ['de', 'en', 'fr', 'es', 'pt', 'ru', 'ar', 'hi', 'bn', 'ja', 'zh']
  const tuerHinweis = {
    de: /Eingangstür wurde mit KI erstellt/,
    en: /entrance door was created with AI/,
    fr: /porte d.entrée a été créé par IA/,
    es: /puerta de entrada se creó con IA/,
    pt: /porta de entrada foi criado com IA/,
    ru: /входной двери создана с помощью ИИ/,
    ar: /بالذكاء الاصطناعي/,
    hi: /एआई से बनाया/,
    bn: /এআই দিয়ে তৈরি/,
    ja: /AIで作成/,
    zh: /由人工智能制作/,
  }
  for (const l of sprachen) {
    const m = block.match(new RegExp(`\\n  ${l}: \\{\\s*titel: '([^']+)',\\s*text: '([^']+)'`))
    assert.ok(m, `Eintrag ${l} fehlt`)
    assert.match(m[2], /Unsplash/, `${l}: Unsplash fehlt`)
    assert.match(m[2], tuerHinweis[l], `${l}: Hinweis zur Eingangstür fehlt`)
  }
  assert.doesNotMatch(block, /Grok/)
  assert.doesNotMatch(src, /Grok|KI-generiert oder KI-bearbeitet/)
})

test('Impressum zeigt jeden Unsplash-Nachweis: Fotograf, Quelle-URL (Unsplash-Fotoseite), Lizenz; Holztür nicht als Unsplash-Foto', () => {
  assert.ok(nachweise.fotos.length >= 13)
  assert.ok(!nachweise.fotos.some((f) => f.id === 'tuer-holz'))
  assert.ok(nachweise.ki?.some((k) => k.id === 'tuer-holz'))
  for (const f of nachweise.fotos) {
    assert.ok(f.fotograf && f.fotograf.length > 1, f.id)
    assert.match(f.quelle, /^https:\/\/unsplash\.com\/photos\/[A-Za-z0-9_-]+-[A-Za-z0-9_-]{11}$/, f.id)
    assert.match(f.lizenz, /Unsplash/, f.id)
  }
  assert.match(src, /\{f\.fotograf\}/)
  assert.match(src, /href=\{f\.quelle\}/)
  assert.match(src, /bildnachweise\.lizenzUrl/)
})
