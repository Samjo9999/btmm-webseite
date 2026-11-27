// Tür-KI: klickbare interne Links, erste Antwort mit Link, Direktlieferung bei klarer Absicht.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beantworteTuerKi } from '../lib/tuerKi/handler.ts'
import { neuerRateZustand } from '../lib/tuerKi/rateLimit.ts'
import { neuerKostenZustand } from '../lib/tuerKi/kosten.ts'
import { baueSystemprompt } from '../lib/tuerKi/systemPrompt.ts'
import { FESTE_TEXTE, NICHT_VERFUEGBAR } from '../lib/tuerKi/texte.ts'
import { TUER_SPRACHEN } from '../lib/tuerKi/konfig.ts'
import {
  erlaubterPfad,
  parseAntwortMitLinks,
  hatInternenLink,
  normalisiereAntwortLinks,
  sichererHref,
  linkTitel,
  DOKUMENT_TITEL,
  SEITEN_TITEL,
} from '../lib/tuerKi/links.ts'
import { sichereDirektlieferung, STANDARD_LINK_PFAD, STANDARD_LINK_SATZ } from '../lib/tuerKi/gespraech.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const lese = (rel) => readFileSync(join(root, rel), 'utf8')

const AN = { TUER_KI_ENABLED: 'true', WISSEN_LLM_ENABLED: 'true', WISSEN_LLM_TIER: 's50', SCALEWAY_SECRET_KEY: 'test-platzhalter' }
const CHUNK = { title: '01 Einführung', abschnitt: 'Beginn', text: 'BtMM ist eine geplante Genossenschaft.', rel: '01.md' }
const TEST_SALT = 'test-secret-nur-fuer-unit'

function deps(chatText) {
  const aufrufe = { chat: [] }
  const d = {
    env: { ...AN, TUER_KI_RATE_SALT: TEST_SALT },
    ip: '203.0.113.7',
    now: Date.parse('2026-11-27T12:00:00Z'),
    ladeCorpus: () => ({ chunks: [CHUNK] }),
    suche: () => [CHUNK],
    chat: async (opt) => {
      aufrufe.chat.push(opt)
      return { text: chatText, usage: { prompt_tokens: 20, completion_tokens: 30 } }
    },
    rate: neuerRateZustand(Date.parse('2026-11-27T12:00:00Z'), TEST_SALT),
    kosten: neuerKostenZustand(Date.parse('2026-11-27T12:00:00Z')),
    zaehleRate: async () => ({ stunde: 1, tag: 1 }),
    reserviereKosten: async () => ({ erlaubt: true, tagEur: 0, monatEur: 0 }),
    korrigiereKosten: async () => {},
  }
  return { d, aufrufe }
}

test('Link-Parser: Markdown-Link, nackter Pfad /dokumente/01, fremde Domain nicht, javascript: gesperrt', () => {
  const md = parseAntwortMitLinks('Lesen Sie die [Einführung](/dokumente/01-einfuehrung).')
  assert.deepEqual(md.filter((t) => t.typ === 'link'), [{ typ: 'link', pfad: '/dokumente/01-einfuehrung', titel: 'Einführung' }])

  const kurz = parseAntwortMitLinks('Die Seite /dokumente/01 erklärt den Einstieg.')
  const link = kurz.find((t) => t.typ === 'link')
  assert.equal(link.pfad, '/dokumente/01-einfuehrung')
  assert.equal(link.titel, 'Einführung')
  assert.equal(erlaubterPfad('/dokumente/01'), '/dokumente/01-einfuehrung')
  assert.equal(erlaubterPfad('/dokumente/1'), '/dokumente/01-einfuehrung')
  assert.equal(erlaubterPfad('https://b-t-m-m.com/de/dokumente/01-einfuehrung'), '/dokumente/01-einfuehrung')

  const fremd = parseAntwortMitLinks('Siehe https://evil.example/dokumente/01 und www.phishing.test/faq')
  assert.equal(fremd.some((t) => t.typ === 'link'), false)
  assert.equal(erlaubterPfad('https://evil.example/dokumente/01'), null)
  const normFremd = normalisiereAntwortLinks('Siehe https://evil.example/dokumente/01 bitte.')
  assert.doesNotMatch(normFremd, /https?:|evil|phishing/)

  assert.equal(erlaubterPfad('javascript:alert(1)'), null)
  assert.equal(erlaubterPfad('JAVASCRIPT:alert(1)'), null)
  assert.equal(erlaubterPfad('data:text/html,x'), null)
  assert.equal(erlaubterPfad('vbscript:msg'), null)
  assert.equal(erlaubterPfad('//evil.example/x'), null)
  assert.equal(sichererHref('javascript:alert(1)', '/de'), null)
  const jsMd = parseAntwortMitLinks('Nicht klicken: [x](javascript:alert(1))')
  assert.equal(jsMd.some((t) => t.typ === 'link'), false)
  assert.equal(jsMd.map((t) => t.typ === 'text' ? t.text : t.titel).join('').includes('x'), true)

  assert.equal(sichererHref('/dokumente/01', '/de'), '/de/dokumente/01-einfuehrung')
  assert.equal(sichererHref('/faq', '/en'), '/en/faq')
  assert.equal(sichererHref('/faq', 'https://evil'), null)
  assert.equal(hatInternenLink('Kein Pfad hier'), false)
  assert.equal(hatInternenLink('Weiter unter [Mitmachen](/mitmachen)'), true)
  assert.equal(linkTitel('/was-du-sparst'), 'Was Sie sparen')
  assert.equal(linkTitel('/fuer-dich'), 'Für Sie')
  assert.doesNotMatch(linkTitel('/dokumente/08-satzung', 'Satzung der eG'), /eG/)
  for (const t of Object.values(DOKUMENT_TITEL)) assert.doesNotMatch(t, /\beG\b/)
  for (const t of Object.values(SEITEN_TITEL)) assert.doesNotMatch(t, /\bDu\b|\beG\b/)
})

test('Erste Antwort (Handler, ohne vorherige Nachfrage) enthält mindestens einen internen Link', async () => {
  const { d } = deps('BtMM ist eine geplante Genossenschaft. Quelle: 01 Einführung, Beginn')
  const r = await beantworteTuerKi({ nachrichten: [{ rolle: 'user', text: 'Hallo' }], sprache: 'de' }, d)
  assert.equal(r.json.status, 'ok')
  assert.equal(hatInternenLink(r.json.antwort), true, r.json.antwort)
  assert.match(r.json.antwort, /\[Einführung\]\(\/dokumente\/01-einfuehrung\)/)
})

test('Klare Absicht: sofort Link, keine Floskel-Entschuldigung, keine Extra-Frage', async () => {
  const { d } = deps('Entschuldigen Sie das Missverständnis. Die Einführung steht unter /dokumente/01. Was interessiert Sie besonders an BtMM?')
  const r = await beantworteTuerKi({
    nachrichten: [{ rolle: 'user', text: 'Ich möchte mehr erfahren und bitte direkt den Link zur Dokumentenseite.' }],
    sprache: 'de',
  }, d)
  assert.equal(r.json.status, 'ok')
  assert.doesNotMatch(r.json.antwort, /Entschuldigen|Missverständnis|Was interessiert Sie besonders/)
  assert.match(r.json.antwort, /\[Einführung\]\(\/dokumente\/01-einfuehrung\)/)
  assert.equal(r.json.weiterleitung, '/dokumente/01-einfuehrung')
})

test('Fallback „Hinweis mit Links“ und feste Texte enthalten klickbare interne Links', () => {
  for (const s of TUER_SPRACHEN) {
    assert.equal(hatInternenLink(NICHT_VERFUEGBAR[s]), true, s)
    assert.match(NICHT_VERFUEGBAR[s], /\/dokumente\/01-einfuehrung/)
    assert.equal(hatInternenLink(STANDARD_LINK_SATZ[s]), true, s)
    assert.equal(hatInternenLink(FESTE_TEXTE[s].aus), true, 'aus ' + s)
  }
  const teile = parseAntwortMitLinks(NICHT_VERFUEGBAR.de)
  const pfade = teile.filter((t) => t.typ === 'link').map((t) => t.pfad)
  assert.ok(pfade.includes('/dokumente/01-einfuehrung'))
  assert.ok(pfade.includes('/dokumente'))
  assert.ok(pfade.includes('/faq'))
})

test('Systemprompt verlangt Link schon in der ersten Antwort und festes Markdown-Format', () => {
  const p = baueSystemprompt('de')
  assert.match(p, /Schon die erste Antwort enthält mindestens einen klickbaren internen Link/)
  assert.match(p, /\[Titel\]\(\/pfad\)/)
  assert.match(p, /\[Einführung\]\(\/dokumente\/01-einfuehrung\)/)
  assert.match(p, /Höchstens eine Rückfrage im ganzen Gespräch/)
  assert.match(p, /Keine floskelhaften Entschuldigungen/)
  assert.doesNotMatch(p, /ohne Markdown/)
  assert.doesNotMatch(p, /Pfad als einfachen Text ohne Markdown/)
})

test('Begrüßung, erste Frage und Client-Renderer: Links von Anfang an, sicher, ohne innerHTML', () => {
  const texte = lese('public/tuer/texte-ki.js')
  assert.match(texte, /begruessung: "Hallo, schön, dass Sie da sind\. Eine Einführung \(rund zehn Minuten\) finden Sie unter \[Einführung\]\(\/dokumente\/01-einfuehrung\)\."/)
  assert.match(texte, /ersteFrage: "Was führt Sie zu BtMM, oder was möchten Sie wissen\? Zur Einführung: \[Einführung\]\(\/dokumente\/01-einfuehrung\)\."/)
  const ki = lese('public/tuer/tuer-ki.js')
  assert.match(ki, /function setzeMitLinks/)
  assert.match(ki, /function parseAntwortMitLinks/)
  assert.match(ki, /function erlaubterPfad/)
  assert.match(ki, /className = 'ki-inlink'/)
  assert.match(ki, /createElement\('a'\)/)
  assert.match(ki, /a\.href = BASIS \+ teile\[t\]\.pfad/)
  assert.match(ki, /javascript\|data\|vbscript\|file\|blob/)
  const innerZuweisungen = [...ki.matchAll(/innerHTML\s*=\s*([^;]+)/g)].map((m) => m[1].trim())
  assert.ok(innerZuweisungen.length > 0 && innerZuweisungen.every((v) => v === "''" || v === '""'), String(innerZuweisungen))
  assert.doesNotMatch(ki, /dangerouslySetInnerHTML/)
  assert.match(ki, /setzeMitLinks\(li, text\)/)
  assert.match(ki, /wer === 'antwort'/)
  const css = lese('public/tuer/tuer.css')
  assert.match(css, /\.ki-inlink/)
  assert.match(css, /min-height:\s*44px/)
  assert.match(css, /:focus-visible/)
  assert.equal(STANDARD_LINK_PFAD, '/dokumente/01-einfuehrung')
})

test('Direktlieferung hängt den Einführungslink an, wenn noch keiner vorkommt', () => {
  const leer = sichereDirektlieferung('BtMM plant eine Genossenschaft.', [{ rolle: 'user', text: 'Hallo' }], 'de')
  assert.match(leer.text, /\[Einführung\]\(\/dokumente\/01-einfuehrung\)/)
  assert.equal(leer.weiterleitung, '/dokumente/01-einfuehrung')
  const schon = sichereDirektlieferung('Mehr unter [Dokumente](/dokumente).', [{ rolle: 'user', text: 'Hallo' }], 'de')
  assert.doesNotMatch(schon.text, /01-einfuehrung/)
  assert.equal(schon.weiterleitung, '/dokumente')
})
