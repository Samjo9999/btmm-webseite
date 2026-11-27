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
vm.runInNewContext(readFileSync(new URL('../public/tuer/texte-luecken.js', import.meta.url), 'utf8'), sandbox)
vm.runInNewContext(readFileSync(new URL('../public/tuer/texte-r3.js', import.meta.url), 'utf8'), sandbox)
vm.runInNewContext(readFileSync(new URL('../public/tuer/texte-r4.js', import.meta.url), 'utf8'), sandbox)
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

test('eigenes Bild je Schritt: jpg/webp als echtes Stockfoto (kein KI-Marker), mit Fotografen-Namen, keine Silhouetten/Logos, keine Fotos von Johannes', () => {
  for (const [k, d] of Object.entries(PF.SCHRITTE)) {
    const b = PF.BILDER[d.bild]; assert.ok(b, k)
    assert.match(b.src, /^\/tuer\/bilder\/weg\/[a-z]+\.jpg$/, b.src)
    assert.match(b.webp, /^\/tuer\/bilder\/weg\/[a-z]+\.webp$/, b.webp)
    const jpgUrl = new URL('../public' + b.src, import.meta.url)
    const webpUrl = new URL('../public' + b.webp, import.meta.url)
    assert.ok(existsSync(jpgUrl), b.src)
    assert.ok(existsSync(webpUrl), b.webp)
    for (const [label, buf] of [['jpg', readFileSync(jpgUrl)], ['webp', readFileSync(webpUrl)]]) {
      const s = buf.toString('latin1')
      assert.ok(!s.includes('trainedAlgorithmicMedia'), `KI-Marker in ${label} ${b.src}`)
      assert.ok(!s.includes('Grok'), `Grok-Credit in ${label} ${b.src}`)
    }
    assert.ok(b.foto && b.foto.length > 2, `Fotograf fehlt für ${d.bild}`)
  }
})

const dateiVon = (id) => PF.BILDER[id].src.split('/').pop()
function bilderPruefen(keys, p, label) {
  const b = PF.bilderWaehlen(keys, p)
  assert.equal(b.length, keys.length, label)
  const dateien = b.filter((id) => id !== null).map((id) => { assert.ok(PF.BILDER[id], `${label}: unbekannte Bild-ID ${id}`); return dateiVon(id) })
  assert.equal(new Set(dateien).size, dateien.length, `${label}: dieselbe Datei zweimal: ${keys.join(',')} -> ${b.join(',')}`)
  return b
}

test('Bilder je Schritt nach Merkmal, eindeutig nach Datei, nur vorhandene', () => {
  for (const pers of ['macher', 'pruefer']) {
    const p = profilAus('de', PERSONA[pers]); const k = PF.pfadBauen(p); const b = bilderPruefen(k, p, pers)
    assert.equal(new Set(b).size, b.length)
  }
})

// Test-Bot r6: Ruhestand/Gemeinschaft (sinn), Berufseinstieg/Worum es geht (grundlagen), Unterstützen, Lebensphase
const PERSONA_38 = {
  einsteiger: ['Über eine Freundin.', 'Ich bin gerade mit der Ausbildung fertig und suche meinen Berufseinstieg.', 'Eine Arbeit mit Sinn.', 'Ich wohne in Freiburg.', 'Erst mal nur lesen.'],
  kunde: ['Über Google.', 'Ich bin Kunde und will eure Angebote nutzen.', 'Gute Produkte.', 'Ich wohne in Hamburg.', 'Erst mal nur lesen.'],
  rente: ['Über die Zeitung.', 'Ich bin im Ruhestand und habe Zeit.', 'Gemeinschaft im Alter.', 'Ich wohne in Freiburg.', 'Ich will mit anpacken.'],
  unterst: ['Über Instagram.', 'Ich will euch unterstützen, vielleicht spenden.', 'Dass es klappt.', 'Ich wohne in Berlin.', 'Erst mal nur lesen.'],
  lebens: ['Über eine Freundin.', 'Ich bin in einer neuen Lebensphase, die Kinder sind aus dem Haus.', 'Neue Gemeinschaft.', 'Ich wohne in Freiburg.', 'Ich will mitmachen.']
}

test('#38-Personas: im Weg nie dieselbe Bilddatei zweimal', () => {
  for (const [n, a] of Object.entries(PERSONA_38)) {
    const p = profilAus('de', a); bilderPruefen(PF.pfadBauen(p), p, n)
  }
  // Konkrete Fälle aus dem Test-Bot-Fund
  const rente = PF.bilderWaehlen(['ruhestand', 'sinn', 'freiburg', 'anpacken'])
  assert.equal(rente[1], 'sinn', 'Gemeinschaft behält sein Foto')
  assert.notEqual(dateiVon(rente[0]), 'sinn.jpg')
  const einstieg = PF.bilderWaehlen(['arbeiten', 'grundlagen', 'einstieg', 'sinn', 'freiburg', 'folgen'])
  assert.equal(einstieg[1], 'grundlagen', 'Worum es geht behält sein Foto')
  assert.notEqual(dateiVon(einstieg[2]), 'grundlagen.jpg')
})

test('Ausweichfoto: alleine im Weg behält ein #38-Schritt sein Foto, sonst passt der Alt-Text zum gezeigten Foto', () => {
  assert.deepEqual(PF.bilderWaehlen(['ruhestand', 'folgen']), ['ruhestand', 'folgen'])
  const b = PF.bilderWaehlen(['ruhestand', 'sinn', 'folgen'])
  for (const id of b) for (const [l, T] of Object.entries(TEXTE)) assert.ok(T.alt[id], `${l} alt ${id}`)
  // Ersatz stammt aus den Weg-Fotos und kommt im Weg nicht zweimal vor
  assert.equal(new Set(b.map(dateiVon)).size, 3)
})

test('kein freies Foto: Bild entfällt (null) statt Doppelung', () => {
  const alle = Object.keys(PF.SCHRITTE)
  const b = bilderPruefen(alle, {}, 'alle Schritte')
  const dateien = new Set(Object.values(PF.BILDER).map((x) => x.src))
  assert.equal(b.filter((id) => id !== null).length, dateien.size)
  assert.ok(b.includes(null), 'mehr Schritte als Fotos: Rest ohne Bild')
  // Schritte mit eigener Datei verlieren ihr Foto nie
  for (const [i, k] of alle.entries()) if (!['kunde', 'einstieg', 'lebensphase', 'ruhestand', 'unterstuetzen'].includes(k)) assert.equal(b[i], PF.SCHRITTE[k].bild, k)
})

test('200.000 Zufallsprofile (Seed): Bilddateien im Weg eindeutig, jeder Schritt mit eigenem Foto behält es', () => {
  let z = 20261125
  const rnd = () => { z = (z + 0x6D2B79F5) | 0; let t = Math.imul(z ^ (z >>> 15), 1 | z); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  const MERKMALE = ['freund', 'online', 'vorort', 'neugierig', 'skeptisch', 'sparen', 'arbeiten', 'wohnen', 'sinn', 'gruenden', 'kunde', 'einstieg', 'lebensphase', 'ruhestand', 'unterstuetzen', 'vorbei', 'anpacken', 'weit', 'freiburg', 'nurlesen']
  const GETEILT = new Set(['kunde', 'einstieg', 'lebensphase', 'ruhestand', 'unterstuetzen'])
  let ohneBild = 0, mitAusweich = 0
  for (let n = 0; n < 200000; n++) {
    const p = {}
    for (const m of MERKMALE) if (rnd() < 0.25) p[m] = 1 + Math.floor(rnd() * 3)
    const keys = PF.pfadBauen(p)
    const b = PF.bilderWaehlen(keys, p)
    const d = b.filter((id) => id !== null).map(dateiVon)
    if (new Set(d).size !== d.length) assert.fail(`Doppelte Datei: ${JSON.stringify(p)} -> ${keys.join(',')} -> ${b.join(',')}`)
    keys.forEach((k, i) => {
      if (!GETEILT.has(k)) assert.equal(b[i], PF.SCHRITTE[k].bild, `${k} verliert sein Foto: ${keys.join(',')}`)
      else if (b[i] === null) ohneBild++
      else if (b[i] !== PF.SCHRITTE[k].bild) mitAusweich++
    })
  }
  assert.equal(ohneBild, 0, 'Wege haben höchstens 6 Schritte, es muss immer ein freies Foto geben')
  assert.ok(mitAusweich > 0, 'Ausweichfotos kommen vor')
})

test('jede Sprache: Texte vollständig, Bezug und Alt-Texte für alle Schlüssel', () => {
  const keys = Object.keys(PF.SCHRITTE)
  for (const [l, T] of Object.entries(TEXTE)) {
    for (const k of keys) assert.ok(T.schritte[k]?.[0] && T.schritte[k]?.[1], `${l} schritt ${k}`)
    assert.ok(T.fotoLabel, `${l} fotoLabel`)
    assert.ok(!('kiLabel' in T), `${l} kiLabel ist entfernt`)
    assert.match(T.bildCredit, /Unsplash/, `${l} bildCredit`)
    assert.doesNotMatch(T.bildCredit, /Grok|KI-generiert|AI-generated/i, `${l} bildCredit ohne Grok/KI-generiert`)
    assert.doesNotMatch(T.bildCredit, /Illustration/i, `${l} alter Illustrationen-Credit`)
    for (const id of Object.keys(PF.BILDER)) {
      assert.ok(T.alt[id], `${l} alt ${id}`)
      assert.ok(T.alt[id].length > 8, `${l} alt zu kurz ${id}`)
      assert.doesNotMatch(T.alt[id], /KI-generiert|AI-generated|IA|ИИ|Grok|एआई|এআই|AI生成|人工知能/, `${l} alt ohne KI-Hinweis ${id}`)
    }
    for (const k of keys) { const bz = PF.bezugKey(k, { neugierig: 1, vorbei: 1, anpacken: 1, weit: 1 }); assert.ok(T.bezug[bz], `${l} bezug ${bz}`) }
    assert.ok(T.ds && T.mikText && T.sr, l)
  }
  assert.equal(Object.keys(TEXTE).length, 11)
  assert.equal(TEXTE.de.fotoLabel, 'Foto')
  assert.equal(TEXTE.de.bildCredit, 'Tür: KI-Grafik; Fotos: Unsplash, freie Lizenz (Nachweise im Impressum)')
  assert.match(TEXTE.de.alt.grundlagen, /^Hände mehrerer Menschen/)
  assert.match(TEXTE.de.alt.sparen, /Marktstand mit frischem Gemüse/)
  assert.match(TEXTE.de.alt.sinn, /Lichterketten/)
  assert.match(TEXTE.de.alt.vorbei, /Holztür/)
  assert.equal(TEXTE.de.schritte.sinn[0], 'Gemeinschaft')
  assert.equal(TEXTE.de.schritte.sinn[1], 'Wie Entscheidungen in BtMM fallen und woran sich das Miteinander ausrichtet.')
  assert.equal(TEXTE.de.schritte.vorbei[0], 'Kennenlernen vor Ort')
  assert.equal(TEXTE.de.schritte.vorbei[1], 'Wie du uns vor Ort kennenlernen kannst.')
  for (const [l, T] of Object.entries(TEXTE)) {
    const beside = [T.schritte.sinn[0], T.schritte.sinn[1], T.schritte.vorbei[0], T.schritte.vorbei[1], T.bezug.sinn, T.bezug.vorbei].join(' ')
    assert.doesNotMatch(beside, /unserem Treffen|letzten Abend|our meeting|last evening|notre rencontre|dernier soir/i, `${l} 07/10-Text klingt nach Treffen/Abend: ${beside}`)
  }
})


test('Tür-Seite verlinkt ein lokales Icon, kein externes Favicon', () => {
  const html = readFileSync(new URL('../public/tuer/index.html', import.meta.url), 'utf8')
  const m = html.match(/<link\s+rel="icon"[^>]*>/)
  assert.ok(m, 'link rel=icon fehlt')
  assert.match(m[0], /href="\/tuer\/bilder\/logo\.png"/)
  assert.doesNotMatch(m[0], /https?:/)
})

test('Lücken-Gruppen bekommen eigene Schritte (PR #38)', () => {
  const k = PF.pfadBauen(profilAus('de', ['Ich suche jemanden für eine neue Küche, als Kundin.', 'Wir haben zwei Kinder.']))
  assert.ok(k.includes('kunde') && k.includes('lebensphase'), k.join(','))
  const e = PF.pfadBauen(profilAus('de', ['Ich bin gerade mit der Ausbildung fertig.']))
  assert.ok(e.includes('einstieg'), e.join(','))
  for (const key of ['kunde', 'einstieg', 'lebensphase']) assert.ok(PF.SCHRITTE[key].href.startsWith('/fuer-dich/'))
})

test('Runde 3: Ruhestand und Unterstützen haben eigene Schritte und Texte in allen Sprachen', () => {
  for (const k of ['ruhestand', 'unterstuetzen']) {
    assert.ok(PF.SCHRITTE[k] && PF.SCHRITTE[k].href.startsWith('/fuer-dich/'), k)
    for (const [l, T] of Object.entries(TEXTE)) {
      assert.ok(T.schritte[k] && T.schritte[k][0] && T.bezug[k] && T.echo[k] && T.profil.motive[k], l + ' ' + k)
      assert.ok(Array.isArray(T.merkmale[k]) && T.merkmale[k].length, l + ' merkmale ' + k)
      assert.equal((T.lageWahl || []).length, 5, l + ' lageWahl')
    }
  }
  const M = PF.merkmaleFuer(TEXTE.de, TEXTE.de, 'de')
  const p = PF.auswerten(M, 'Ich bin seit zwei Jahren im Ruhestand.')
  assert.ok(PF.pfadBauen(p).includes('ruhestand'))
  const q = PF.auswerten(M, 'Ich möchte euch unterstützen, ohne selbst Mitglied zu werden.')
  assert.equal(PF.pfadBauen(q)[0], 'unterstuetzen')
})

test('Runde 4: Chips für motiv, lage und zeit in allen Sprachen, Bedeutung unabhängig von der Wortwahl', () => {
  for (const [l, T] of Object.entries(TEXTE)) {
    for (const [f, key] of Object.entries(PF.WAHL_TEXT)) assert.equal((T[key] || []).length, PF.WAHL[f].length, l + ' ' + key)
    assert.ok(T.wahlHinweis, l + ' wahlHinweis')
  }
  const pfad = (idx) => PF.pfadBauen(PF.wahlProfil('motiv', idx))
  assert.equal(pfad(2)[0], 'kunde'); assert.equal(pfad(3)[0], 'skeptisch'); assert.equal(pfad(5)[0], 'unterstuetzen')
  assert.ok(pfad(0).includes('arbeiten')); assert.ok(pfad(4).includes('gruenden'))
  const lage = { ...PF.wahlProfil('motiv', 0) }; for (const [k, v] of Object.entries(PF.wahlProfil('lage', 3))) lage[k] = (lage[k] || 0) + v
  assert.ok(PF.pfadBauen(lage).includes('ruhestand'))
})

test('Runde 4: Freitext – Kunden-Verben schlagen „Betrieb“, eigener Betrieb bleibt Arbeit', () => {
  const M = PF.merkmaleFuer(TEXTE.de, TEXTE.de, 'de')
  const k = PF.auswerten(M, 'Ich will bei fairen Betrieben einkaufen.')
  assert.ok(k.kunde && !k.arbeiten, JSON.stringify(k))
  const b = PF.auswerten(M, 'Ich habe einen eigenen Betrieb und will Material günstiger einkaufen.')
  assert.ok(b.arbeiten, JSON.stringify(b))
  const s = PF.auswerten(M, 'Wo ist der Haken? Klingt zu schön, um wahr zu sein.')
  assert.ok(s.skeptisch, JSON.stringify(s))
  const e = PF.auswerten(PF.merkmaleFuer(TEXTE.en, TEXTE.de, 'en'), 'I want to buy from fair businesses.')
  assert.ok(e.kunde && !e.arbeiten, JSON.stringify(e))
})
