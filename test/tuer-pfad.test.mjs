import { existsSync } from 'node:fs'
// Tür: der Kennenlern-Pfad passt sich individuell an (Nutzer 21.11.2026 00:35).
// Nachweis: unterschiedliche Profile ergeben unterschiedliche Schritt-Auswahl und -Reihenfolge, nicht nur andere Sätze.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'

const require = createRequire(import.meta.url)
const PF = require('../public/tuer/pfad.js')
const sandbox = { window: {} }
vm.runInNewContext(readFileSync(new URL('../public/tuer/texte.js', import.meta.url), 'utf8'), sandbox)
const TEXTE = sandbox.window.BTMM_TUER_TEXTE

function profilAus(lang, antworten) {
  const M = PF.merkmaleFuer(TEXTE[lang], TEXTE.de, lang)
  const p = {}
  for (const a of antworten) for (const [k, v] of Object.entries(PF.auswerten(M, a))) p[k] = (p[k] || 0) + v
  return p
}

const PERSONA = {
  macher: ['Eine Freundin hat mir davon erzählt, wir haben uns auf dem Markt getroffen.', 'Ich will mitmachen und beim Aufbau mithelfen.', 'Was erhoffst du dir? Gemeinschaft auf Augenhöhe.', 'Ich wohne in Freiburg.', 'Ich will mit anpacken, ich habe viel Zeit.'],
  pruefer: ['Über Instagram.', 'Ehrlich gesagt bin ich skeptisch, ob das funktioniert.', 'Belege, Zahlen und eine echte Satzung.', 'Miete und Einkauf sind teuer, ich will Geld sparen.', 'Ich wohne in Hamburg.', 'Erst mal nur lesen.'],
  handwerk_en: ['I found you on Google.', 'I work as a carpenter, my job is in a small workshop.', 'Housing, I would love an apartment I can afford.', 'I live in Berlin.', 'Just read for now.'],
}

test('zwei Profile ergeben unterschiedliche Reihenfolge und Auswahl', () => {
  const a = PF.pfadBauen(profilAus('de', PERSONA.macher))
  const b = PF.pfadBauen(profilAus('de', PERSONA.pruefer))
  assert.notDeepEqual(a, b)
  assert.notEqual(a[0], b[0], 'erster Schritt soll sich unterscheiden')
  assert.notEqual(a.at(-1), b.at(-1), 'Bindung am Ende soll sich unterscheiden')
  assert.ok(b.indexOf('skeptisch') < b.indexOf('grundlagen') && b[0] !== 'grundlagen', 'Prüfer: Belege vor Grundlagen: ' + b.join(','))
  assert.ok(b.includes('sparen') && b.includes('dokumente') && b.at(-1) === 'folgen', b.join(','))
  assert.ok(a.includes('freiburg') && a.at(-1) === 'anpacken' && !a.includes('skeptisch'), a.join(','))
})

test('dritte Persona (en) weicht von beiden ab, Reihenfolge folgt der Gewichtung', () => {
  const c = PF.pfadBauen(profilAus('en', PERSONA.handwerk_en))
  const a = PF.pfadBauen(profilAus('de', PERSONA.macher))
  const b = PF.pfadBauen(profilAus('de', PERSONA.pruefer))
  assert.notDeepEqual(c, a); assert.notDeepEqual(c, b)
  assert.ok(c.includes('arbeiten') && c.includes('wohnen'), c.join(','))
  // gleiche Merkmale, andere Stärke → andere Reihenfolge
  const x = PF.pfadBauen({ sparen: 3, wohnen: 1 }), y = PF.pfadBauen({ sparen: 1, wohnen: 3 })
  assert.ok(x.indexOf('sparen') < x.indexOf('wohnen') && y.indexOf('wohnen') < y.indexOf('sparen'))
})

test('eigenes Bild je Schritt: jpg mit C2PA plus webp, keine Silhouetten/Logos, keine Fotos von Johannes', () => {
  for (const [k, d] of Object.entries(PF.SCHRITTE)) {
    const b = PF.BILDER[d.bild]; assert.ok(b, k)
    assert.match(b.src, /^\/tuer\/bilder\/weg\/[a-z]+\.jpg$/, b.src)
    assert.match(b.webp, /^\/tuer\/bilder\/weg\/[a-z]+\.webp$/, b.webp)
    const jpgUrl = new URL('../public' + b.src, import.meta.url)
    const webpUrl = new URL('../public' + b.webp, import.meta.url)
    assert.ok(existsSync(jpgUrl), b.src)
    assert.ok(existsSync(webpUrl), b.webp)
    const jpg = readFileSync(jpgUrl)
    assert.ok(jpg.includes('jumb') && jpg.includes('c2pa'), 'C2PA fehlt in ' + b.src)
  }
})

test('Bilder je Schritt nach Merkmal, ohne Doppelung, nur vorhandene', () => {
  for (const pers of ['macher', 'pruefer']) {
    const p = profilAus('de', PERSONA[pers]); const k = PF.pfadBauen(p); const b = PF.bilderWaehlen(k, p)
    assert.equal(new Set(b).size, b.length)
    for (const id of b) assert.ok(PF.BILDER[id])
  }
})

test('jede Sprache: Texte vollständig, Bezug und Alt-Texte für alle Schlüssel', () => {
  const keys = Object.keys(PF.SCHRITTE)
  for (const [l, T] of Object.entries(TEXTE)) {
    for (const k of keys) assert.ok(T.schritte[k]?.[0] && T.schritte[k]?.[1], `${l} schritt ${k}`)
    assert.ok(T.kiLabel, `${l} kiLabel`)
    assert.match(T.bildCredit, /Grok/, `${l} bildCredit`)
    assert.doesNotMatch(T.bildCredit, /Illustration/i, `${l} alter Illustrationen-Credit`)
    for (const id of Object.keys(PF.BILDER)) {
      assert.ok(T.alt[id], `${l} alt ${id}`)
      assert.ok(T.alt[id].startsWith(T.kiLabel + ': '), `${l} alt-Präfix ${id}: ${T.alt[id]}`)
    }
    for (const k of keys) { const bz = PF.bezugKey(k, { neugierig: 1, vorbei: 1, anpacken: 1, weit: 1 }); assert.ok(T.bezug[bz], `${l} bezug ${bz}`) }
    assert.ok(T.ds && T.mikText && T.sr, l)
  }
  assert.equal(Object.keys(TEXTE).length, 11)
  assert.equal(TEXTE.de.kiLabel, 'KI-generiertes Bild')
  assert.equal(TEXTE.de.bildCredit, 'Bilder erstellt mit Grok (KI)')
  assert.equal(TEXTE.de.alt.grundlagen, 'KI-generiertes Bild: Mehrere Hände teilen ein frisches Brot über einer Werkbank mit Hobel und Stechbeiteln')
})
