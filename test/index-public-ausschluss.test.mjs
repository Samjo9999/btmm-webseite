import test from 'node:test'
import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import {
  INDEX_COPIES,
  FORBIDDEN_PUBLIC_COPIES,
  DELIVERED_INDEX,
  TABOO_STEMS,
  checkPublicIndexes,
  loadPublicAllowlist,
  anwendenPublicAusschluss,
  findTabooHits,
  findPhoneMatches,
  findEmailMatches,
  findIbanMatches,
  findStreetMatches,
  BEISPIELRECHNUNG_PREFIX,
  GRUNDSICHERUNG_BEISPIEL,
  istGrundsicherungBeispielabschnitt,
} from '../scripts/index-public-guard.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const BEISPIEL_TEXT =
  'Fünf Menschen. Alle mit Grundsicherung, je 563 Euro im Monat. Kein Startkapital.'

function beispielChunk(overrides = {}) {
  return {
    title: '07_BtMM_Konzept_v22_69_0',
    abschnitt: 'Das ehrliche Worst-Case-Szenario',
    rel: GRUNDSICHERUNG_BEISPIEL.rel,
    text: BEISPIEL_TEXT,
    ...overrides,
  }
}

test('public index-public.json: keine Tabu-Stämme, keine internen Pfade, nur Allowlist', () => {
  const errors = checkPublicIndexes(root)
  assert.deepEqual(errors, [])
})

test('rg: 0 Treffer in allen index-public.json-Kopien', () => {
  const rg = spawnSync(
    'rg',
    [
      '-i',
      '--',
      'bürgergeld|buergergeld|jobcenter|hartz|krankheit|erkrankung|elternzeit|schwangerschaft|hildastr|karner|happyfarm|elternhof|oberkirch|j\\.s\\.gartzke|INTERN_|_intern|ROTH-|BUSINESSPLAN',
      ...INDEX_COPIES,
    ],
    { cwd: root, encoding: 'utf8' }
  )
  assert.notEqual(rg.status, 0, `rg sollte 0 Treffer liefern, bekam:\n${rg.stdout}`)
})

test('keine zweiten ausgelieferten index-public.json-Kopien', () => {
  for (const rel of FORBIDDEN_PUBLIC_COPIES) {
    assert.equal(existsSync(join(root, rel)), false, `Kopie darf nicht existieren: ${rel}`)
  }
  assert.equal(existsSync(join(root, DELIVERED_INDEX)), true)
})

test('Vorschau-Chats laden /wissen/index-public.json, Rewrites greifen', () => {
  const wissen = readFileSync(join(root, 'public/vorschau/wissen-chat/app.js'), 'utf8')
  const bewertung = readFileSync(join(root, 'public/vorschau/bewertung-chat-feedback/app-wissen.js'), 'utf8')
  assert.match(wissen, /fetch\(['"]\/wissen\/index-public\.json['"]\)/)
  assert.match(bewertung, /fetch\(['"]\/wissen\/index-public\.json['"]\)/)
  assert.doesNotMatch(wissen, /fetch\(['"]index-public\.json['"]\)/)
  assert.doesNotMatch(bewertung, /fetch\(['"]index-public\.json['"]\)/)
  const nextCfg = readFileSync(join(root, 'next.config.mjs'), 'utf8')
  const vercel = readFileSync(join(root, 'vercel.json'), 'utf8')
  for (const src of [
    '/vorschau/wissen-chat/index-public.json',
    '/vorschau/bewertung-chat-feedback/index-public.json',
  ]) {
    assert.match(nextCfg, new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.match(vercel, new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})

test('Tabu-Stämme enthalten oberkirch und happyfarm', () => {
  assert.ok(TABOO_STEMS.includes('oberkirch'))
  assert.ok(TABOO_STEMS.includes('happyfarm'))
  assert.ok(findTabooHits('Werkstatt in Oberkirch').includes('oberkirch'))
  assert.ok(findTabooHits('Hinweis auf HappyFarm').includes('happyfarm'))
  assert.equal(findTabooHits('Krankenkasse bleibt erlaubt').length, 0)
})

test('PII-Regex: Telefon und E-Mail treffen, Fehltreffer bleiben aus', () => {
  assert.ok(findPhoneMatches('Rückruf unter 0761/1234567').length >= 1)
  assert.ok(findPhoneMatches('Mobil +49 761 1234567').length >= 1)
  assert.ok(findPhoneMatches('Tel. (0761) 1234567').length >= 1)
  assert.equal(findPhoneMatches('Stand 03.02.2026 und Summe 000 / 420.000 Euro').length, 0)
  assert.equal(findPhoneMatches('Hash 8bc3b06008858a32 und im November 2013').length, 0)
  assert.equal(findPhoneMatches('in der Gemeinschaft 24, Stufenplan Weg 1').length, 0)
  assert.ok(findEmailMatches('Bitte an test@example.com schreiben').some((m) => m.toLowerCase() === 'test@example.com'))
  assert.equal(findEmailMatches('keine Adresse in diesem Satz').length, 0)
  assert.ok(findIbanMatches('DE89 3704 0044 0532 0130 00').length >= 1)
  assert.equal(findIbanMatches('Kapitel 22 ohne Konto').length, 0)
  assert.ok(findStreetMatches('Gewerbeamt, Fehrenbachallee 12, Freiburg').length >= 1)
  assert.equal(findStreetMatches('Stufenplan Weg 1 und im November 2013').length, 0)
})

test('fällt ein Chunk, fällt der ganze Absatz (rel+abschnitt)', () => {
  const allow = loadPublicAllowlist(root)
  const rel = [...allow.allowed][0]
  const { chunks, dropped } = anwendenPublicAusschluss(
    [
      { title: 't', rel, abschnitt: 'Absatz A', text: 'Erster Teil ohne Treffer.' },
      { title: 't', rel, abschnitt: 'Absatz A', text: 'Rückruf unter 0761/1234567.' },
      { title: 't', rel, abschnitt: 'Absatz B', text: 'Bleibt stehen.' },
    ],
    { allow }
  )
  assert.equal(chunks.length, 1)
  assert.equal(chunks[0].abschnitt, 'Absatz B')
  assert.ok(dropped.some((d) => d.reason === 'pii' && d.abschnitt === 'Absatz A'))
})

test('Grundsicherung-Ausnahme: Konzept v22.69.0 Z. 84–113 bleibt mit Präfix Beispielrechnung:', () => {
  const allow = loadPublicAllowlist(root)
  const { chunks } = anwendenPublicAusschluss([beispielChunk()], { allow })
  assert.equal(chunks.length, 1)
  assert.ok(istGrundsicherungBeispielabschnitt(chunks[0]))
  assert.ok(chunks[0].text.startsWith(BEISPIELRECHNUNG_PREFIX))
  assert.ok(chunks[0].text.includes(BEISPIEL_TEXT))
})

test('gleicher Grundsicherung-Text aus anderer Quelle oder anderem Abschnitt fällt', () => {
  const allow = loadPublicAllowlist(root)
  const otherSource = {
    title: 'anderes-dok',
    rel: [...allow.allowed][0],
    abschnitt: 'Irgendein Abschnitt',
    text: BEISPIEL_TEXT,
  }
  const otherAbschnitt = beispielChunk({
    abschnitt: 'Die ersten drei — warum es sich lohnt, anzufangen',
  })
  const { chunks, dropped } = anwendenPublicAusschluss([otherSource, otherAbschnitt], { allow })
  assert.equal(chunks.length, 0)
  assert.ok(dropped.some((d) => d.reason === 'grundsicherung' && d.rel === otherSource.rel))
  assert.ok(dropped.some((d) => d.reason === 'grundsicherung' && d.rel === GRUNDSICHERUNG_BEISPIEL.rel))
})

test('öffentlicher Index enthält die Beispielrechnung und sonst keine Grundsicherung-Kombi', () => {
  const payload = JSON.parse(readFileSync(join(root, 'content/wissen/index-public.json'), 'utf8'))
  const beispiel = (payload.chunks || []).filter(istGrundsicherungBeispielabschnitt)
  assert.ok(beispiel.length >= 1, 'Ausnahme-Chunks müssen im Index stehen')
  for (const c of beispiel) {
    assert.ok(c.text.startsWith(BEISPIELRECHNUNG_PREFIX), `ohne Präfix: ${c.abschnitt}`)
  }
  const abschnitte = new Set(beispiel.map((c) => c.abschnitt))
  for (const soll of GRUNDSICHERUNG_BEISPIEL.abschnitte) {
    assert.ok(abschnitte.has(soll), `Abschnitt fehlt: ${soll}`)
  }
})
