import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, cpSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import {
  entferneEmojis,
  filterEmojisTief,
  zaehleEmojis,
  zaehleEmojisTief,
} from '../packages/wissen-mcp/src/emoji-filter.mjs'
import { formatExtractiveAnswer } from '../packages/wissen-mcp/src/search.mjs'
import { EMOJI_INDEX_DATEIEN } from '../scripts/emoji-index-dateien.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('Mapping laut Auftrag', () => {
  assert.equal(entferneEmojis('\u2610 Punkt'), '[offen] Punkt')
  assert.equal(entferneEmojis('\u2713 a'), '[erledigt] a')
  assert.equal(entferneEmojis('\u2714 a'), '[erledigt] a')
  assert.equal(entferneEmojis('\u2705 a'), '[erledigt] a')
  assert.equal(entferneEmojis('\u274C a'), '[nein] a')
  assert.equal(entferneEmojis('\u26A0 a'), '[Achtung] a')
})

test('U+FE0F wird gestrichen, Warnzeichen mit Variantenselektor wird gemappt', () => {
  assert.equal(entferneEmojis('\u26A0\uFE0F Hinweis'), '[Achtung] Hinweis')
  assert.equal(entferneEmojis('x\uFE0Fy'), 'xy')
})

test('uebrige Emojis werden entfernt, doppelte Leerzeichen geglaettet', () => {
  assert.equal(entferneEmojis('Hallo \u{1F389} Welt'), 'Hallo Welt')
  assert.equal(entferneEmojis('\u{1F7E1} gelb'), 'gelb')
  assert.equal(entferneEmojis('\u2605 Stern'), 'Stern')
  assert.equal(entferneEmojis('Flagge \u{1F1E9}\u{1F1EA} Text'), 'Flagge Text')
  assert.equal(entferneEmojis('Familie \u{1F468}\u200D\u{1F469}\u200D\u{1F467} ok'), 'Familie ok')
  assert.equal(entferneEmojis('1\uFE0F\u20E3 eins'), '1 eins')
})

test('Pfeile, Einzug und Tabellen bleiben', () => {
  assert.equal(entferneEmojis('A \u2192 B \u21D2 C'), 'A \u2192 B \u21D2 C')
  assert.equal(entferneEmojis('  - Punkt  mit  Abstand'), '  - Punkt  mit  Abstand')
  assert.equal(entferneEmojis('  - \u{1F389} x  y'), '  - x y')
  assert.equal(entferneEmojis('| \u2713 | \u2610 |'), '| [erledigt] | [offen] |')
  assert.equal(entferneEmojis('\u2776 eins'), '\u2776 eins')
  assert.equal(entferneEmojis('Zeile1\n\u2713 Zeile2\n  Einzug'), 'Zeile1\n[erledigt] Zeile2\n  Einzug')
})

test('Mapping setzt ein Leerzeichen, wenn Text direkt folgt', () => {
  assert.equal(entferneEmojis('\u274CNein'), '[nein] Nein')
  assert.equal(entferneEmojis('\u274C.'), '[nein].')
})

test('Tiefenfilter und Zaehler arbeiten auf Werten, nicht auf Schluesseln', () => {
  const obj = { a: ['\u2713 x', { b: '\u2610 y' }], n: 3, k: null }
  assert.equal(zaehleEmojisTief(obj), 2)
  const sauber = filterEmojisTief(obj)
  assert.deepEqual(sauber, { a: ['[erledigt] x', { b: '[offen] y' }], n: 3, k: null })
  assert.equal(zaehleEmojisTief(sauber), 0)
  assert.equal(zaehleEmojis('ohne'), 0)
})

test('gebaute Indizes: 0 Treffer in U+1F300-1FAFF, U+2600-27BF und U+FE0F', () => {
  const rx = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F]/u
  for (const rel of EMOJI_INDEX_DATEIEN) {
    const raw = readFileSync(join(root, rel), 'utf8')
    assert.equal(rx.test(raw), false, `${rel}: Emoji-Treffer`)
    assert.equal(zaehleEmojisTief(JSON.parse(raw)), 0, rel)
  }
})

test('Post-Process-Skript: saeubert Dateien, --check schlaegt bei Treffern an', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'emoji-idx-'))
  cpSync(join(root, 'scripts'), join(tmp, 'scripts'), { recursive: true })
  cpSync(join(root, 'packages', 'wissen-mcp', 'src'), join(tmp, 'packages', 'wissen-mcp', 'src'), {
    recursive: true,
  })
  for (const rel of EMOJI_INDEX_DATEIEN) {
    mkdirSync(dirname(join(tmp, rel)), { recursive: true })
    writeFileSync(
      join(tmp, rel),
      JSON.stringify({ chunks: [{ title: 'T', abschnitt: 'A', text: '\u2610 offen \u{1F389} fertig', rel: 'x.md' }] })
    )
  }
  const skript = join(tmp, 'scripts', 'filter-index-emoji.mjs')
  const check1 = spawnSync(process.execPath, [skript, '--check'], { encoding: 'utf8' })
  assert.equal(check1.status, 1)
  const lauf = spawnSync(process.execPath, [skript], { encoding: 'utf8' })
  assert.equal(lauf.status, 0, lauf.stderr)
  const check2 = spawnSync(process.execPath, [skript, '--check'], { encoding: 'utf8' })
  assert.equal(check2.status, 0)
  const out = JSON.parse(readFileSync(join(tmp, EMOJI_INDEX_DATEIEN[0]), 'utf8'))
  assert.equal(out.chunks[0].text, '[offen] offen fertig')
})

test('Antwortfilter: extraktive Antwort enthaelt keine Emojis', () => {
  const hits = [
    { title: 'Doc \u2705', abschnitt: 'Abschnitt \u{1F389}', text: '\u2610 Aufgabe \u26A0\uFE0F wichtig', rel: 'a.md', score: 9 },
  ]
  const r = formatExtractiveAnswer('Aufgabe', hits)
  assert.equal(zaehleEmojisTief(r), 0)
  assert.match(r.antwort, /\[offen\] Aufgabe \[Achtung\] wichtig/)
  assert.equal(r.quellen[0].dokument, 'Doc [erledigt]')
  assert.equal(r.quellen[0].abschnitt, 'Abschnitt')
})

test('LLM-Antworten werden serverseitig gefiltert (Route und Corpus-Lader)', () => {
  const route = readFileSync(join(root, 'app/api/wissen-mitmacher/route.ts'), 'utf8')
  assert.match(route, /emoji-filter\.mjs/)
  assert.match(route, /entferneEmojis\(text\.trim\(\)\)/, 'Scaleway-Antwort')
  assert.match(route, /entferneEmojis\(textOut\.trim\(\)\)/, 'Self-Host-Antwort')
  const lader = readFileSync(join(root, 'lib/wissen/loadCorpus.ts'), 'utf8')
  assert.equal((lader.match(/ohneEmojis\(/g) || []).length, 4, 'Definition + 3 Lader')
  const search = readFileSync(join(root, 'lib/wissen/search.ts'), 'utf8')
  assert.match(search, /entferneEmojis\(antwort\)/)
})

test('Build-Skripte nutzen das gemeinsame Filtermodul', () => {
  for (const rel of [
    'packages/wissen-mcp/scripts/build-index.mjs',
    'scripts/filter-index-public.mjs',
    'scripts/filter-index-emoji.mjs',
    'scripts/check-index-public.mjs',
  ]) {
    assert.match(readFileSync(join(root, rel), 'utf8'), /emoji-filter\.mjs/, rel)
  }
})
