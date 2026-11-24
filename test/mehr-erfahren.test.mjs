import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  istScrollbar,
  istAmEnde,
  sollSichtbar,
  naechsterScrollY,
  untererAbstand,
  labelFuer,
  ariaFuer,
  reduzierteBewegung,
  ENDE_SCHWELLE_PX,
} from '../lib/mehr-erfahren.mjs'

test('kurze Seite: Knopf bleibt aus', () => {
  assert.equal(istScrollbar(800, 800), false)
  assert.equal(sollSichtbar({ scrollHeight: 800, innerHeight: 800, scrollY: 0 }), false)
})

test('lange Seite oben: Knopf sichtbar', () => {
  assert.equal(istScrollbar(3000, 800), true)
  assert.equal(sollSichtbar({ scrollHeight: 3000, innerHeight: 800, scrollY: 0 }), true)
})

test('Mitte der Seite: Knopf bleibt sichtbar (nicht nur vor dem ersten Scroll)', () => {
  assert.equal(sollSichtbar({ scrollHeight: 3000, innerHeight: 800, scrollY: 900 }), true)
})

test('am Seitenende: Knopf aus', () => {
  assert.equal(istAmEnde(2200, 800, 3000, ENDE_SCHWELLE_PX), true)
  assert.equal(sollSichtbar({ scrollHeight: 3000, innerHeight: 800, scrollY: 2200 }), false)
})

test('knapp vor dem Ende (unter Schwelle): Knopf aus', () => {
  // 800 + 2120 = 2920, Höhe 3000, Schwelle 80 → am Ende
  assert.equal(sollSichtbar({ scrollHeight: 3000, innerHeight: 800, scrollY: 2120 }), false)
})

test('knapp über der Schwelle: Knopf an', () => {
  // 800 + 2100 = 2900, 3000 - 80 = 2920 → noch nicht am Ende
  assert.equal(sollSichtbar({ scrollHeight: 3000, innerHeight: 800, scrollY: 2100 }), true)
})

test('gesperrt (Pfad-Leiste): Knopf aus, auch wenn die Seite lang ist', () => {
  assert.equal(sollSichtbar({ scrollHeight: 3000, innerHeight: 800, scrollY: 0, gesperrt: true }), false)
})

test('Klick springt zum nächsten Abschnitt', () => {
  const y = naechsterScrollY({
    scrollY: 0,
    innerHeight: 800,
    scrollHeight: 4000,
    abschnittTops: [0, 900, 1800],
    kopfOffset: 96,
  })
  assert.equal(y, 900 - 96)
})

test('ohne weiteren Abschnitt: etwa eine Bildschirmhöhe, nicht über das Ende', () => {
  const y = naechsterScrollY({
    scrollY: 100,
    innerHeight: 800,
    scrollHeight: 4000,
    abschnittTops: [],
  })
  assert.equal(y, 100 + Math.round(800 * 0.9))
  const amEnde = naechsterScrollY({
    scrollY: 3300,
    innerHeight: 800,
    scrollHeight: 4000,
    abschnittTops: [],
  })
  assert.equal(amEnde, 4000 - 800)
})

test('untere volle Leiste hebt den Knopf an, rechte FABs nicht', () => {
  const ih = 800, iw = 390
  const leiste = { top: 700, height: 100, left: 0, width: 390 }
  const chat = { top: 720, height: 56, left: 310, width: 56 }
  assert.equal(untererAbstand([leiste], iw, ih), 100)
  assert.equal(untererAbstand([chat], iw, ih), 0)
  assert.equal(untererAbstand([leiste, chat], iw, ih), 100)
})

test('Beschriftung folgt der Sprache, Deutsch als Fallback', () => {
  assert.equal(labelFuer('de'), 'Mehr erfahren')
  assert.equal(labelFuer('en-US'), 'Learn more')
  assert.equal(labelFuer('xx'), 'Mehr erfahren')
  assert.match(ariaFuer('de'), /unten/)
})

test('prefers-reduced-motion wird erkannt', () => {
  assert.equal(reduzierteBewegung(() => ({ matches: true })), true)
  assert.equal(reduzierteBewegung(() => ({ matches: false })), false)
})
