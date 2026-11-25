import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FRAGEN_PRO_STUNDE,
  FENSTER_MS,
  MAX_HALTEZEIT_MS,
  LIMIT_TEXT,
  pruefeUndZaehle,
  raeumeRateSpeicher,
} from '../lib/wissen/rateLimit.ts'
import { istErlaubtFuerWissenApi, nurErlaubteChunks } from '../lib/wissen/sichtbarkeit.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function lese(rel) {
  return readFileSync(join(root, rel), 'utf8')
}

test('Rate-Limit: 20 Fragen/Stunde, 21. liefert 429, ohne die Frage zu speichern', () => {
  const speicher = new Map()
  const t0 = 1_000_000_000_000
  const id = 'user-a'
  for (let i = 0; i < FRAGEN_PRO_STUNDE; i++) {
    const r = pruefeUndZaehle(id, t0 + i * 1000, speicher)
    assert.equal(r.erlaubt, true, `Frage ${i + 1} muss durchgehen`)
  }
  const zuViel = pruefeUndZaehle(id, t0 + FRAGEN_PRO_STUNDE * 1000, speicher)
  assert.equal(zuViel.erlaubt, false)
  assert.equal(zuViel.status, 429)
  assert.ok(zuViel.retryAfterSec >= 1)
  // Speicher enthält nur User-ID und Zeitstempel, keine Frage
  assert.deepEqual([...speicher.keys()], [id])
  const werte = speicher.get(id)
  assert.equal(werte.length, FRAGEN_PRO_STUNDE)
  assert.ok(werte.every((n) => typeof n === 'number'))
  assert.equal(LIMIT_TEXT.includes('20 Fragen pro Stunde'), true)
})

test('Rate-Limit: nach einer Stunde ist wieder Platz, nach 24 h ist der Eintrag weg', () => {
  const speicher = new Map()
  const t0 = 2_000_000_000_000
  const id = 'user-b'
  for (let i = 0; i < FRAGEN_PRO_STUNDE; i++) {
    pruefeUndZaehle(id, t0, speicher)
  }
  const nochImFenster = pruefeUndZaehle(id, t0 + FENSTER_MS - 1, speicher)
  assert.equal(nochImFenster.erlaubt, false)
  const danach = pruefeUndZaehle(id, t0 + FENSTER_MS + 1, speicher)
  assert.equal(danach.erlaubt, true)

  const alt = new Map([['alt', [t0]]])
  raeumeRateSpeicher(t0 + MAX_HALTEZEIT_MS + 1, alt)
  assert.equal(alt.has('alt'), false)
  raeumeRateSpeicher(t0 + MAX_HALTEZEIT_MS - 1, new Map([['noch', [t0]]]))
  const noch = new Map([['noch', [t0]]])
  raeumeRateSpeicher(t0 + MAX_HALTEZEIT_MS - 1, noch)
  assert.equal(noch.has('noch'), true)
})

test('Zähler trennt User, speichert nie Fragetext', () => {
  const speicher = new Map()
  const t0 = 3_000_000_000_000
  for (let i = 0; i < 5; i++) pruefeUndZaehle('alpha', t0, speicher)
  for (let i = 0; i < 5; i++) pruefeUndZaehle('beta', t0, speicher)
  assert.equal(speicher.get('alpha').length, 5)
  assert.equal(speicher.get('beta').length, 5)
  const dump = JSON.stringify([...speicher.entries()])
  assert.equal(dump.includes('frage'), false)
  assert.equal(dump.includes('Was ist der Keim'), false)
})

test('Sichtbarkeitsfilter: public und mitmacher durch, internal nie', () => {
  const chunks = [
    { title: 'pub', tier: 'public', text: 'öffentlich' },
    { title: 'mit', sichtbarkeit: 'mitmacher', text: 'mitmacher' },
    { title: 'intern', tier: 'internal', text: 'GEHEIM intern' },
    { title: 'intern2', visibility: 'internal', text: 'auch intern' },
    { title: 'ohne', text: 'ohne Stufe' },
  ]
  const erlaubt = nurErlaubteChunks(chunks)
  assert.deepEqual(
    erlaubt.map((c) => c.title),
    ['pub', 'mit']
  )
  assert.equal(istErlaubtFuerWissenApi({ tier: 'internal' }), false)
  assert.equal(istErlaubtFuerWissenApi({ tier: 'PUBLIC' }), true)
})

test('Mitmacher-Corpus der API enthält kein internal, Loader filtert', () => {
  const data = JSON.parse(lese('content/wissen-mitglieder/index.json'))
  const internRoh = (data.chunks || []).filter((c) => !istErlaubtFuerWissenApi(c))
  const nachFilter = nurErlaubteChunks(data.chunks || [])
  assert.ok(nachFilter.length > 0)
  assert.deepEqual(
    nachFilter.filter((c) => !istErlaubtFuerWissenApi(c)),
    []
  )
  // aktueller Index hat keine internal-Chunks; Filter bleibt als Netz
  assert.deepEqual(internRoh, [])
  const loader = lese('lib/wissen/loadCorpus.ts')
  assert.match(loader, /nurErlaubteChunks/)
})

test('Fehler-Logs enthalten weder Frage noch Body noch res.text()', () => {
  const dateien = [
    'app/api/wissen-mitmacher/route.ts',
    'lib/wissen/rateLimit.ts',
    'lib/wissen/sichtbarkeit.ts',
    'lib/wissen/loadCorpus.ts',
    'lib/wissen/llmTiers.ts',
    'lib/wissen/search.ts',
  ]
  const logZeilen = []
  for (const rel of dateien) {
    const zeilen = lese(rel).split('\n')
    zeilen.forEach((z, i) => {
      if (/console\.(log|error|warn|info|debug)\s*\(/.test(z)) {
        logZeilen.push(`${rel}:${i + 1}:${z.trim()}`)
      }
    })
  }
  const src = dateien.map(lese).join('\n')
  assert.doesNotMatch(src, /await\s+res\.text\s*\(/)
  assert.match(src, /console\.error\(\s*['"]scaleway['"]\s*,\s*res\.status\s*\)/)
  for (const zeile of logZeilen) {
    assert.doesNotMatch(zeile, /\bfrage\b/i, zeile)
    assert.doesNotMatch(zeile, /\bantwort\b/i, zeile)
    assert.doesNotMatch(zeile, /res\.text/)
    assert.doesNotMatch(zeile, /\bbody\b/i, zeile)
    assert.doesNotMatch(zeile, /await\s+res/)
  }
  const route = lese('app/api/wissen-mitmacher/route.ts')
  assert.match(route, /pruefeUndZaehle/)
  assert.match(route, /status:\s*429/)
  assert.match(route, /LIMIT_TEXT/)
})

test('UI-Hinweis steht unter dem Eingabefeld in Mitmacher- und Vorschau-Chat', () => {
  const text =
    'Bitte keine persönlichen Daten oder Gesundheitsangaben eingeben. Fragen werden nicht gespeichert.'
  for (const rel of [
    'public/vorschau/wissen-mitmacher/index.html',
    'public/vorschau/wissen-chat/index.html',
  ]) {
    const html = lese(rel)
    const formEnde = html.indexOf('</form>')
    const hinweis = html.indexOf(text)
    assert.ok(formEnde > 0, rel)
    assert.ok(hinweis > formEnde, `${rel}: Hinweis muss nach </form> stehen`)
    assert.match(html, /class="ds-hinweis"/)
  }
})

test('DSE-Absatz steht im Impressum direkt nach Supabase, Sie-Form, Link mit noopener', () => {
  const src = lese('app/[locale]/(seiten)/impressum/page.tsx')
  const supabase = src.indexOf('<h4>Supabase</h4>')
  const ki = src.indexOf('<h4>Wissens-Assistent (KI) für Mitmachende</h4>')
  const brevo = src.indexOf('<h4>Brevo (E-Mail-Versand)</h4>')
  assert.ok(supabase > 0 && ki > supabase && ki < brevo)
  assert.match(src, /Wenn Sie angemeldet eine Frage/)
  assert.match(src, /Scaleway SAS/)
  assert.match(
    src,
    /href="https:\/\/www\.scaleway\.com\/en\/docs\/generative-apis\/reference-content\/data-privacy\/"[^>]*rel="noopener noreferrer"/
  )
})
