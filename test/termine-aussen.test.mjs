// Termin-Check: keine Jahreszahl 2027–2032 als Gründungs-/Eintragungs-/Betriebsstart-Termin
// nach außen, kein Monat-plus-Jahr wie „März 2028“. Fachdaten (Mindestlohn) bleiben erlaubt.
import test from 'node:test'
import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { findeTermine, findeTermineInText, main } from '../scripts/check-termine-aussen.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('Muster: geplanter Gründungstermin und Monat+Jahr werden erkannt', () => {
  const a = findeTermineInText(
    'Nach der Eintragung (geplant ca. März 2028) kann sie Zuwendungen annehmen.',
    'x.md'
  )
  assert.ok(a.some((t) => t.art === 'monat-jahr'))
  const b = findeTermineInText(
    'Weil die Genossenschaft vielleicht erst 2028 gegründet wird, liest die App den Wert.',
    'x.md'
  )
  assert.ok(b.some((t) => t.art === 'gruendung-jahr' && t.jahr === '2028'))
  const c = findeTermineInText(
    'Die Planzahlen rechnen mit einem Betriebsstart 04/2028 als Rechengröße.',
    'x.md'
  )
  assert.ok(c.some((t) => t.jahr === '2028'))
})

test('Muster: gesetzlicher Mindestlohn und Fachtermine bleiben erlaubt', () => {
  const sauber = [
    'Der gesetzliche Mindestlohn liegt ab 2027 bei 14,60 € (§ 1 MiLoV5).',
    '14,60 € ab 1. Januar 2027 (§ 1 MiLoV5). Für 2028 ist er noch nicht festgesetzt.',
    'Mit dem Betriebsstart eine Anstellung zum Mindestlohn (14,60 Euro ab 2027).',
    'Anmeldeschluss ist der 22. März 2027 bei der Handwerkskammer.',
    'Die EU-Vorgabe muss bis Juni 2027 umgesetzt werden.',
    '20 Euro in der Kaufkraft vom Januar 2027, fortgeschrieben.',
    'Programm bis 31.12.2029 | für BtMM ab eingetragener eG, vor dem finanzierten Vorhaben.',
  ]
  for (const s of sauber) {
    assert.deepEqual(findeTermineInText(s, 'ok.md'), [], s)
  }
})

test('content/dokumente-web, index-public und messages/*: 0 Treffer', () => {
  const treffer = findeTermine(root)
  assert.deepEqual(treffer, [])
  assert.equal(main(root), 0)
})
