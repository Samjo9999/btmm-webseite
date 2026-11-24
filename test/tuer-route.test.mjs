import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function matcherMuster() {
  const src = readFileSync(join(root, 'middleware.ts'), 'utf8')
  const found = [...src.matchAll(/matcher:\s*\[[^\]]*?'([^']+)'/gs)]
  assert.equal(found.length, 1, 'genau ein Middleware-Matcher erwartet')
  return found[0][1]
}

/** Next.js-path-to-regexp für diesen Matcher: Anfangs-Lookahead plus Rest der URL. */
function localeMiddlewareGreift(pathname) {
  const raw = matcherMuster()
  const pattern = Function(`return '${raw}'`)()
  return new RegExp(`^${pattern}$`).test(pathname)
}

function rewritesAus(datei) {
  const pfad = join(root, datei)
  if (datei.endsWith('.json')) {
    const data = JSON.parse(readFileSync(pfad, 'utf8'))
    return data.rewrites || []
  }
  const src = readFileSync(pfad, 'utf8')
  const paare = []
  const re = /source:\s*['"]([^'"]+)['"][\s\S]*?destination:\s*['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(src))) paare.push({ source: m[1], destination: m[2] })
  return paare
}

test('Locale-Middleware lässt /tuer aus; Rewrite zeigt auf die statische Tür', () => {
  assert.match(matcherMuster(), /vorschau\|tuer|tuer\|vorschau/)

  for (const pfad of ['/tuer', '/tuer/', '/tuer/index.html', '/tuer/tuer.css', '/vorschau/foo', '/api/contact', '/favicon.ico']) {
    assert.equal(localeMiddlewareGreift(pfad), false, `Middleware darf ${pfad} nicht greifen`)
  }
  for (const pfad of ['/', '/de', '/de/faq', '/en', '/de/tuer']) {
    assert.equal(localeMiddlewareGreift(pfad), true, `Middleware soll ${pfad} greifen`)
  }

  const ziel = { source: '/tuer', destination: '/tuer/index.html' }
  const zielSlash = { source: '/tuer/', destination: '/tuer/index.html' }
  for (const datei of ['next.config.mjs', 'vercel.json']) {
    const list = rewritesAus(datei)
    assert.deepEqual(
      list.filter((r) => r.source === '/tuer' || r.source === '/tuer/').sort((a, b) => a.source.localeCompare(b.source)),
      [ziel, zielSlash],
      datei,
    )
  }

  const weiche = readFileSync(join(root, 'components/btmm/TuerWeiche.tsx'), 'utf8')
  assert.match(weiche, /\/tuer\/index\.html\?lang=/)
})
