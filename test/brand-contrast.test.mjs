import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadBrandColors() {
  const src = readFileSync(join(root, 'lib/brand.ts'), 'utf8')
  const colors = {}
  const block = src.split('BRAND_COLORS = {')[1].split('}')[0]
  for (const m of block.matchAll(/(\w+):\s*'([^']+)'/g)) colors[m[1]] = m[2]
  return colors
}
const BRAND_COLORS = loadBrandColors()

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function channel(c) {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

function contrast(a, b) {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

test('Markenfarben in brand.ts und globals.css stimmen überein', () => {
  const css = readFileSync(join(root, 'app/globals.css'), 'utf8')
  for (const [key, value] of Object.entries(BRAND_COLORS)) {
    if (!value.startsWith('#')) continue
    assert.match(css, new RegExp(`--btmm-${key}:\\s*${value}`, 'i'), `--btmm-${key}`)
  }
})

test('WCAG AA: Fließtext und Überschriften auf Weiß und Hell', () => {
  const { text, dunkel, weiss, hell, primary } = BRAND_COLORS
  assert.ok(contrast(text, weiss) >= 4.5, `text/weiss ${contrast(text, weiss).toFixed(2)}`)
  assert.ok(contrast(text, hell) >= 4.5, `text/hell ${contrast(text, hell).toFixed(2)}`)
  assert.ok(contrast(dunkel, weiss) >= 4.5, `dunkel/weiss ${contrast(dunkel, weiss).toFixed(2)}`)
  assert.ok(contrast(dunkel, hell) >= 4.5, `dunkel/hell ${contrast(dunkel, hell).toFixed(2)}`)
  // Weiß auf Button-Dunkel
  assert.ok(contrast(weiss, dunkel) >= 4.5, `weiss/dunkel ${contrast(weiss, dunkel).toFixed(2)}`)
  // Primary nur als große Überschrift auf Weiß (AA large = 3:1)
  assert.ok(contrast(primary, weiss) >= 3, `primary/weiss ${contrast(primary, weiss).toFixed(2)}`)
})

test('Aliase --btb-* zeigen auf BtMM-Tokens', () => {
  const css = readFileSync(join(root, 'app/globals.css'), 'utf8')
  for (const [alias, token] of [
    ['--btb-rot', '--btmm-dunkel'],
    ['--btb-oliv', '--btmm-dunkel'],
    ['--btb-creme', '--btmm-hell'],
    ['--btb-blau', '--btmm-dunkel'],
    ['--btb-dunkel', '--btmm-text'],
    ['--btb-weiss', '--btmm-weiss'],
  ]) {
    assert.match(css, new RegExp(`${alias}:\\s*var\\(${token}\\)`))
  }
})

test('Hero- und Kartenboxen sind weiß halbtransparent', () => {
  const css = readFileSync(join(root, 'app/globals.css'), 'utf8')
  assert.match(css, /--btmm-box:\s*rgba\(255,\s*255,\s*255,\s*0\.8/)
  assert.match(css, /\.hero-text[\s\S]{0,400}background:\s*var\(--btmm-box\)/)
  assert.match(css, /\.card-btb[\s\S]{0,400}background:\s*var\(--btmm-box\)/)
})
