// Statische Tür: Holztür bildschirmfüllend, eine Fassung, keine Varianten-Schalter.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const html = readFileSync(join(root, 'public/tuer/index.html'), 'utf8')
const css = readFileSync(join(root, 'public/tuer/tuer.css'), 'utf8')
const js = readFileSync(join(root, 'public/tuer/tuer.js'), 'utf8')
const weiche = readFileSync(join(root, 'components/btmm/TuerWeiche.tsx'), 'utf8')

test('Tür: Flügel, Band, sr-only-Name, leere Alts, keine Glow-Logo-Schichten', () => {
  assert.match(html, /class="fluegel links"/)
  assert.match(html, /class="fluegel rechts"/)
  assert.match(html, /class="tuer-band"/)
  assert.match(html, /class="nur-sr">BtMM – Back to Meaning Maximization/)
  assert.match(html, /<img src="\/tuer\/bilder\/holz\/mobil-links\.jpg" alt=""/)
  assert.match(html, /<img src="\/tuer\/bilder\/holz\/mobil-rechts\.jpg" alt=""/)
  assert.doesNotMatch(html, /class="tuer-licht"|class="tuer-logo"|logo-glow/)
  assert.doesNotMatch(html, /class="tuer-text"/)
})

test('Tür: eine Fassung, feste holz-Pfade, keine Varianten-Parameter', () => {
  const zusammen = html + css + js
  assert.doesNotMatch(zusammen, /[?&]tuer=|[?&]logo=|tuer=v1|logo=gold|logo=beize/)
  assert.doesNotMatch(zusammen, /v1-teak|v2-zeder|v3-rotlack/)
  assert.match(html, /\/tuer\/bilder\/holz\/(mobil|desktop)-(links|rechts)\.(webp|jpg)/)
  for (const name of [
    'mobil-links.webp', 'mobil-rechts.webp', 'desktop-links.webp', 'desktop-rechts.webp',
    'mobil.webp', 'desktop.webp', 'mobil-links.jpg', 'desktop.jpg'
  ]) {
    assert.ok(existsSync(join(root, 'public/tuer/bilder/holz', name)), name)
  }
})

test('Tür-CSS: Band ohne linken Rahmen, reduced-motion nur Fade, --tuer-y', () => {
  assert.match(css, /\.tuer-band\{[^}]*border-left:0/)
  assert.match(css, /prefers-reduced-motion:reduce/)
  assert.match(css, /\.oeffnet \.fluegel\{transform:none;opacity:0\}/)
  assert.match(css, /--tuer-y:50%/)
  assert.match(css, /--tuer-y:48\.3%/)
  assert.match(css, /max-height:175px/)
  assert.doesNotMatch(css, /\.tuer-licht\{|\.tuer-logo\{/)
})

test('11 Locales und ?ohne-tuer= bleiben', () => {
  assert.match(js, /\['de', 'en', 'zh', 'es', 'hi', 'ar', 'bn', 'pt', 'ru', 'ja', 'fr'\]/)
  assert.match(weiche, /ohne-tuer/)
  assert.match(js, /params\.get\('lang'\)/)
})

test('Tür: sichtbarer lokalisierter Bild-Credit, ohne linken Rahmen', () => {
  const html = readFileSync(join(root, 'public/tuer/index.html'), 'utf8')
  const css = readFileSync(join(root, 'public/tuer/tuer.css'), 'utf8')
  const jsTexte = readFileSync(join(root, 'public/tuer/texte.js'), 'utf8')
  assert.match(html, /class="bild-credit"[^>]*data-t="bildCredit"/)
  assert.match(html, /Bilder erstellt mit Grok \(KI\)/)
  assert.doesNotMatch(css, /\.tuer-band \.bild-credit\{[^}]*border-left:\s*[^0]/)
  assert.match(css, /\.tuer-band \.bild-credit\{[^}]*color:var\(--tuer-link\)/)
  const locales = ['de', 'en', 'zh', 'es', 'hi', 'ar', 'bn', 'pt', 'ru', 'ja', 'fr']
  for (const l of locales) {
    const re = new RegExp(l + ':[\\s\\S]*?bildCredit:\\s*"')
    assert.match(jsTexte, re, 'bildCredit in ' + l)
  }
})
