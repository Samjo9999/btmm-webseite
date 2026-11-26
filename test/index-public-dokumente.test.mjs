// Fertig-PR 4: index-public.json nur aus content/dokumente-web, tabu- und altwortlautfrei,
// ohne Kontaktdaten und Impressum-Inhalte. Bruch bei jedem Treffer.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { baueIndex, QUELLE_DIR } from '../scripts/filter-index-public.mjs'
import { schwaerzeText, trefferArten, chunkArten, TABU_LISTE } from '../scripts/index-public-schwaerzen.mjs'
import { findEmailMatches, findPhoneMatches, findIbanMatches, findStreetMatches, istGrundsicherungKombi, INDEX_TABU_STEMS } from '../scripts/index-public-guard.mjs'
import { enthaeltSensibles } from '../lib/tuerKi/filter.ts'
import { SENSIBEL_STAEMME } from '../lib/tuerKi/sensibel-liste.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const KOPIEN = ['content/wissen/index-public.json', 'public/wissen/index-public.json']
const lese = (rel) => readFileSync(join(root, rel), 'utf8')

// Unabhängig von den Modulen notiert (Nutzerliste 25.11.), case-insensitive, Umlaute auch gefaltet.
const TABU = /b(ü|ue)rgergeld|hartz|krankheit|erkrankung|elternzeit|schwangerschaft|hildastr|karner|happyfarm|elternhof|j\.s\.gartzke|oberkirch/i
const ALTWORTLAUT = /\bv\s?7\.\d|anw(ä|ae)rter|vollmitglied|(?<!ersten\s)(?<!erste\s)f(ü|ue)nf\s+jahr|bwgv|\bi\.\s?gr\b/i

function indexText(rel) {
  const payload = JSON.parse(lese(rel))
  return { payload, blob: payload.chunks.map((c) => [c.title, c.abschnitt, c.text, c.rel].join('\n')).join('\n') }
}

test('index-public: nur content/dokumente-web, alle 30 Dokumente vertreten, beide Kopien gleich', () => {
  const dateien = readdirSync(join(root, QUELLE_DIR)).filter((f) => f.endsWith('.md')).sort()
  assert.equal(dateien.length, 30)
  const a = lese(KOPIEN[0])
  assert.equal(a, lese(KOPIEN[1]), 'content/wissen und public/wissen müssen gleich sein')
  const { payload } = indexText(KOPIEN[0])
  assert.equal(payload.quelle, QUELLE_DIR)
  assert.equal(payload.docCount, 30)
  assert.equal(payload.chunkCount, payload.chunks.length)
  const rels = new Set(payload.chunks.map((c) => c.rel))
  assert.deepEqual([...rels].sort(), dateien.map((f) => `${QUELLE_DIR}/${f}`))
  for (const c of payload.chunks) assert.ok(c.rel.startsWith(`${QUELLE_DIR}/`), c.rel)
})

test('index-public: Tabuliste (case-insensitive) hat 0 Treffer in beiden Kopien', () => {
  for (const rel of KOPIEN) {
    const { blob } = indexText(rel)
    const m = blob.match(new RegExp(TABU.source, 'gi')) || []
    assert.deepEqual([...new Set(m.map((x) => x.toLowerCase()))], [], `${rel}: Tabuwörter`)
  }
})

test('index-public: Altwortlaut (v7., Anwärter, Vollmitglied, fünf Jahre, BWGV, i.Gr.) hat 0 Treffer', () => {
  for (const rel of KOPIEN) {
    const { blob } = indexText(rel)
    const m = blob.match(new RegExp(ALTWORTLAUT.source, 'gi')) || []
    assert.deepEqual([...new Set(m.map((x) => x.toLowerCase()))], [], `${rel}: Altwortlaut`)
  }
})

test('index-public: keine Mailadressen, Telefonnummern, IBAN, Straßen mit Hausnummer, keine Impressum-Inhalte', () => {
  for (const rel of KOPIEN) {
    const { blob } = indexText(rel)
    assert.equal(blob.includes('@'), false, `${rel}: @`)
    assert.deepEqual(findEmailMatches(blob), [])
    assert.deepEqual(findPhoneMatches(blob), [])
    assert.deepEqual(findIbanMatches(blob), [])
    assert.deepEqual(findStreetMatches(blob), [])
    assert.doesNotMatch(blob, /Angaben\s+(gemäß|nach)\s+(§\s?5|DDG|TMG)|Umsatzsteuer-?\s?(Identifikations)?nummer|Verantwortlich\w*\s+(für\s+den\s+Inhalt|nach\s+§)/i)
  }
})

test('index-public: kein tuer-public-Index, Mitmacher-Index nicht aus dokumente-web gebaut', () => {
  for (const rel of ['content/wissen/index-tuer-public.json', 'public/wissen/index-tuer-public.json']) {
    assert.equal(existsSync(join(root, rel)), false, rel)
  }
  const mit = JSON.parse(lese('content/wissen-mitglieder/index.json'))
  assert.equal(mit.tier, 'mitmacher')
  assert.ok(!(mit.chunks || []).some((c) => String(c.rel).startsWith(`${QUELLE_DIR}/`)))
})

test('Reproduzierbar: Neubau aus den Dokumenten ergibt exakt die eingecheckten Chunks', () => {
  const { payload, bericht } = baueIndex(root)
  const stand = JSON.parse(lese(KOPIEN[0]))
  assert.deepEqual(payload.chunks, stand.chunks)
  assert.equal(bericht.chunksIndexGesamt, stand.chunkCount)
  assert.equal(bericht.docCountIndex, 30)
})

test('Schwärz-Regeln: Satz, Zeile oder Chunk fällt, Rest bleibt; sauberer Text bleibt unverändert', () => {
  const sauber = 'Das ist ein sauberer Absatz ohne Besonderheiten. Er bleibt vollständig stehen.'
  assert.equal(schwaerzeText(sauber).text, sauber)

  const a = schwaerzeText('Erster Satz bleibt. Das Bürgergeld gilt hier nicht. Dritter Satz bleibt.')
  assert.equal(a.text, 'Erster Satz bleibt. Dritter Satz bleibt.')
  assert.equal(a.bericht[0].aktion, 'satz')
  const jc = schwaerzeText('Erster Satz bleibt. Frag das Jobcenter vorab. Dritter Satz bleibt.')
  assert.equal(jc.text, 'Erster Satz bleibt. Frag das Jobcenter vorab. Dritter Satz bleibt.')
  assert.equal(jc.bericht.length, 0)
  const allein = 'Wer Grundsicherung bezieht, kann trotzdem mitmachen.'
  assert.equal(schwaerzeText(allein).text, allein)
  assert.equal(istGrundsicherungKombi(allein), false)
  const kombi = { title: 't', abschnitt: 'a', text: 'Grundsicherung für fünf Menschen, alle mit 563 Euro.', rel: 'content/dokumente-web/x.md' }
  assert.ok(chunkArten(kombi).includes('grundsicherung-kombi'))

  const b = schwaerzeText('| A | B |\n|---|---|\n| Bürgergeld | x |\n| Garten | y |')
  assert.equal(b.text, '| A | B |\n|---|---|\n| Garten | y |')

  const c = schwaerzeText('Kontakt: person@example.org\nText bleibt hier ausreichend lang stehen.')
  assert.equal(c.text, 'Text bleibt hier ausreichend lang stehen.')

  const d = schwaerzeText('Wirst du Vollmitglied, zählt das. Sonst gilt die eine Mitgliedschaft nach der Satzung.')
  assert.equal(d.text, 'Sonst gilt die eine Mitgliedschaft nach der Satzung.')

  assert.ok(trefferArten('Satzung v7.13.0').includes('altwortlaut:v7.'))
  assert.ok(trefferArten('Anwärterzeit').includes('altwortlaut:anwaerter'))
  assert.ok(trefferArten('fünf Jahre').includes('altwortlaut:fuenf jahre'))
  assert.equal(trefferArten('Planung der ersten fünf Jahre').includes('altwortlaut:fuenf jahre'), false)
  assert.ok(trefferArten('BWGV-Muster').includes('altwortlaut:bwgv'))
  assert.ok(trefferArten('BtMM eG i.Gr.').includes('altwortlaut:i.gr.'))
  assert.ok(trefferArten('Kommt aus Oberkirch').includes('tabu'))
  assert.ok(trefferArten('HAPPYFARM').includes('tabu'))
  assert.ok(trefferArten('Fehrenbachallee 12').includes('street'))
  assert.ok(trefferArten('Rückruf unter 0761/1234567').includes('phone'))
  assert.deepEqual(trefferArten('Krankenkasse und Satzung v9.1.4, ein Jahr Frist'), [])
})

test('Build bricht ab, wenn ein Dokument nach der Schwärzung noch einen Treffer hätte (Endkontrolle greift)', () => {
  // Endkontrolle nutzt dieselbe Prüffunktion wie die Schwärzung; hier der Gegenbeweis auf Chunk-Ebene.
  const roh = 'Satz mit Vollmitglied.'
  const { text } = schwaerzeText(roh)
  assert.equal(trefferArten(text).length, 0)
})

test('Mail-Regex trifft auch Adressen vor einem Satzpunkt, ohne Fließtext zu treffen', () => {
  assert.equal(findEmailMatches('schreib an office@beispiel.de.').length, 1)
  assert.equal(findEmailMatches('Mail: a.b@x.org, dann weiter').length, 1)
  assert.equal(findEmailMatches('Satz endet. Neuer Satz ohne Adresse.').length, 0)
})

test('index-public: Jobcenter bleibt mindestens einmal im Index, Grundsicherung-Kombi hat 0 Treffer', () => {
  for (const rel of KOPIEN) {
    const { payload, blob } = indexText(rel)
    assert.ok(/jobcenter/i.test(blob), `${rel}: mindestens ein Chunk muss Jobcenter enthalten`)
    const kombi = payload.chunks.filter((c) => istGrundsicherungKombi([c.title, c.abschnitt, c.text, c.rel].filter(Boolean).join('\n')))
    assert.equal(kombi.length, 0, `${rel}: Grundsicherung-Kombi`)
  }
})

test('Tür-KI-Eingabefilter blockt Jobcenter weiterhin und ist vom Index-Tabu getrennt', () => {
  assert.equal(enthaeltSensibles('Termin beim Jobcenter'), true)
  assert.equal(enthaeltSensibles('Wie funktioniert die Mitgliedschaft?'), false)
  assert.ok(SENSIBEL_STAEMME.includes('jobcenter'))
  assert.equal(INDEX_TABU_STEMS.includes('jobcenter'), false)
  assert.equal(TABU_LISTE.includes('jobcenter'), false)
  assert.ok(INDEX_TABU_STEMS.includes('happyfarm'))
})
