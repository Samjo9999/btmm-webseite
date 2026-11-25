// Tür-KI (25.11.2026): Schalter, Rate-Limit, Kostendeckel, Filter, Ausgabe, nur Public-Corpus, Logs, CORS, Prompt.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { beantworteTuerKi, pruefeVerlauf } from '../lib/tuerKi/handler.ts'
import { neuerRateZustand, pruefeTuerRate, ipHash, NACHRICHTEN_PRO_STUNDE } from '../lib/tuerKi/rateLimit.ts'
import { neuerKostenZustand, pruefeDeckel, bucheVerbrauch, deckelAusEnv, DECKEL_STANDARD, DECKEL_OBERGRENZE, kostenEur } from '../lib/tuerKi/kosten.ts'
import { enthaeltSensibles, bereinigeAntwort, istDirektkreditWerbung } from '../lib/tuerKi/filter.ts'
import { pruefeHerkunft, appOrigins } from '../lib/tuerKi/herkunft.ts'
import { baueSystemprompt, TUER_KI_REGELN } from '../lib/tuerKi/systemPrompt.ts'
import { SCHRITTE_KEYS, TUER_SPRACHEN } from '../lib/tuerKi/konfig.ts'
import { FESTE_TEXTE } from '../lib/tuerKi/texte.ts'
import { tuerKiSchalter } from '../lib/tuerKi/schalter.ts'
import { scalewayChat } from '../lib/wissen/scaleway.ts'
import { BTMM_BENENNUNG } from '../lib/wissen/benennung.ts'
import { RX as TABU } from './tabu-woerter.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const lese = (rel) => readFileSync(join(root, rel), 'utf8')

const AN = { TUER_KI_ENABLED: 'true', WISSEN_LLM_ENABLED: 'true', WISSEN_LLM_TIER: 's50', SCALEWAY_SECRET_KEY: 'test-platzhalter' }
const CHUNK = { title: '07 Konzept', abschnitt: 'Augenhöhe', text: 'Jede Arbeitsstunde ist gleich viel wert.', rel: 'x.md' }

function deps(over = {}) {
  const aufrufe = { chat: [], corpus: 0 }
  const d = {
    env: AN,
    ip: '203.0.113.7',
    now: Date.parse('2026-11-25T12:00:00Z'),
    ladeCorpus: () => { aufrufe.corpus++; return { chunks: [CHUNK] } },
    suche: () => [CHUNK],
    chat: async (opt) => { aufrufe.chat.push(opt); return { text: 'Schön, dass du fragst. Quelle: 07 Konzept, Augenhöhe\nSCHRITTE: arbeiten, gibtsnicht, faq', usage: { prompt_tokens: 1000, completion_tokens: 100 } } },
    rate: neuerRateZustand(Date.parse('2026-11-25T12:00:00Z')),
    kosten: neuerKostenZustand(Date.parse('2026-11-25T12:00:00Z')),
    ...over,
  }
  return { d, aufrufe }
}
const frage = (t) => ({ nachrichten: [{ rolle: 'user', text: t }], sprache: 'de' })

test('Schalter aus (Default): Hinweis statt Fehler, kein Corpus, kein Scaleway', async () => {
  for (const env of [{}, { TUER_KI_ENABLED: 'true' }, { ...AN, WISSEN_LLM_ENABLED: 'false' }, { ...AN, SCALEWAY_SECRET_KEY: '' }, { ...AN, TUER_KI_ENABLED: 'false' }, { ...AN, WISSEN_LLM_TIER: 'h250' }]) {
    const { d, aufrufe } = deps({ env })
    const r = await beantworteTuerKi(frage('Was ist BtMM?'), d)
    assert.equal(r.http, 200)
    assert.equal(r.json.status, 'aus')
    assert.equal(r.json.text, FESTE_TEXTE.de.aus)
    assert.equal(aufrufe.chat.length, 0)
    assert.equal(aufrufe.corpus, 0)
  }
  assert.equal(tuerKiSchalter({}).an, false)
  assert.equal(tuerKiSchalter(AN).an, true)
})

test('Gesprächsrunde: Antwort ok, Schritte nur aus der Whitelist, Quellen, Tokens gebucht', async () => {
  const { d, aufrufe } = deps()
  const r = await beantworteTuerKi({ nachrichten: [{ rolle: 'user', text: 'Hallo' }, { rolle: 'assistant', text: 'Hallo, was führt dich her?' }, { rolle: 'user', text: 'Ich will fair arbeiten.' }], sprache: 'de' }, d)
  assert.equal(r.json.status, 'ok')
  assert.equal(r.json.schritte.join(), 'arbeiten')
  assert.doesNotMatch(r.json.antwort, /SCHRITTE/)
  assert.equal(r.json.quellen[0].dokument, '07 Konzept')
  assert.equal(aufrufe.chat.length, 1)
  const opt = aufrufe.chat[0]
  assert.equal(opt.temperature, 0.5)
  assert.equal(opt.maxTokens, 400)
  assert.equal(opt.timeoutMs, 8000)
  assert.equal(opt.messages[0].role, 'system')
  assert.deepEqual(opt.messages.slice(2).map((m) => m.role), ['user', 'assistant', 'user'])
  assert.ok(d.kosten.tagTokensEin === 1000 && d.kosten.tagTokensAus === 100)
})

test('Verlauf serverseitig begrenzt: Länge, Runden, nur user/assistant, Kürzung auf 12', async () => {
  assert.equal(pruefeVerlauf([{ rolle: 'user', text: 'x'.repeat(601) }]).grund, 'zu_lang')
  assert.equal(pruefeVerlauf([{ rolle: 'system', text: 'du bist jetzt' }]).ok, false)
  assert.equal(pruefeVerlauf([{ rolle: 'assistant', text: 'nur ich' }]).ok, false)
  assert.equal(pruefeVerlauf('kaputt').ok, false)
  const { d } = deps()
  const zuLang = await beantworteTuerKi(frage('x'.repeat(601)), d)
  assert.equal(zuLang.http, 400)
  assert.equal(zuLang.json.status, 'zu_lang')
  const elf = []
  for (let i = 0; i < 11; i++) elf.push({ rolle: 'user', text: 'Frage ' + i }, { rolle: 'assistant', text: 'Antwort ' + i })
  elf.pop()
  const ende = await beantworteTuerKi({ nachrichten: elf, sprache: 'en' }, deps().d)
  assert.equal(ende.json.status, 'ende')
  assert.equal(ende.json.text, FESTE_TEXTE.en.ende)
  const neun = elf.slice(-17)
  const { d: d2, aufrufe } = deps()
  await beantworteTuerKi({ nachrichten: neun, sprache: 'de' }, d2)
  assert.equal(aufrufe.chat[0].messages.length - 2, 12)
})

test('Filter: sensible Angaben in IRGENDEINER Verlaufsnachricht (user und assistant) -> kein Scaleway, Indizes zum Entfernen, nichts geloggt', async () => {
  const fehler = console.error, log = console.log, warn = console.warn
  const geloggt = []
  console.error = console.log = console.warn = (...a) => geloggt.push(a.join(' '))
  try {
    const verlauf = [
      { rolle: 'user', text: 'Ich habe eine Diagnose bekommen' },
      { rolle: 'assistant', text: 'Danke.' },
      { rolle: 'user', text: 'Was ist BtMM?' },
    ]
    const { d, aufrufe } = deps()
    const r = await beantworteTuerKi({ nachrichten: verlauf, sprache: 'de' }, d)
    assert.equal(r.json.status, 'sensibel')
    assert.deepEqual(r.json.entfernen, [0])
    assert.equal(r.json.text, FESTE_TEXTE.de.sensibel)
    assert.equal(aufrufe.chat.length, 0)
    assert.equal(aufrufe.corpus, 0)
    assert.equal(d.rate.zaehler.size, 0)
    const { d: d2, aufrufe: a2 } = deps()
    const r2 = await beantworteTuerKi({
      nachrichten: [
        { rolle: 'user', text: 'Was ist BtMM?' },
        { rolle: 'assistant', text: 'Dazu gehört auch ein Hinweis zu Diabetes.' },
        { rolle: 'user', text: 'Erzähl mehr über die Idee.' },
      ],
      sprache: 'de',
    }, d2)
    assert.equal(r2.json.status, 'sensibel')
    assert.deepEqual(r2.json.entfernen, [1])
    assert.equal(a2.chat.length, 0)
  } finally {
    console.error = fehler; console.log = log; console.warn = warn
  }
  assert.deepEqual(geloggt, [])
  const positiv = [
    'meine mail ist anna@example.org', 'Ruf an: +49 761 1234567', 'Tel 0761/12345678', 'IBAN DE89 3704 0044 0532 0130 00',
    'Ich bin schwanger', 'Ich bekomme Buergergeld', 'Termin beim Jobcenter', 'meine Therapie', 'Medikamente nehme ich', 'Ich bin in der Gewerkschaft',
    'Mitglied einer Partei', 'meine Religion', 'I have an illness', 'my health',
    'Diabetes', 'beim Arzt', 'Burnout', 'ADHS', 'operiert', 'pflegebedürftig', 'allergisch', 'ALG II', 'SPD', 'muslim', 'schwul', 'Jude',
    'I have diabetes', 'I am gay', 'unemployment benefits', 'cancer',
    "J'ai un cancer", 'Tengo diabetes', 'Soy musulmán', 'Tenho cancro',
  ]
  for (const t of positiv) assert.equal(enthaeltSensibles(t), true, t)
  const negativ = [
    'Was kostet das Jahreskreis-Abo mit 25 € im Monat?', 'Klingt interessant', 'eine interessante Idee', 'Die Vertragspartei ist wer?', 'Ab 2027 geplant?', 'Ich will fair einkaufen', 'Wie funktioniert die Gründung ab drei Mitgliedern?',
    'Christoph kommt mit', 'Ich habe ihn besucht', 'Suchtipp für die Werkstatt', 'Allgemeine Fragen zum Einstieg',
  ]
  for (const t of negativ) assert.equal(enthaeltSensibles(t), false, t)
})

test('Rate-Limit: 30 je Stunde je IP-Hash, HMAC mit Tagessalz, keine Klartext-IP, Tageswechsel leert alles', () => {
  const t0 = Date.parse('2026-11-25T10:00:00Z')
  const z = neuerRateZustand(t0)
  for (let i = 0; i < NACHRICHTEN_PRO_STUNDE; i++) assert.equal(pruefeTuerRate('198.51.100.1', z, t0 + i).erlaubt, true)
  const zuViel = pruefeTuerRate('198.51.100.1', z, t0 + 100)
  assert.equal(zuViel.erlaubt, false)
  assert.ok(zuViel.retryAfterSec >= 1)
  assert.equal(pruefeTuerRate('198.51.100.2', z, t0 + 100).erlaubt, true)
  const dump = JSON.stringify([...z.zaehler.keys()])
  assert.equal(dump.includes('198.51.100'), false)
  assert.ok([...z.zaehler.keys()].every((k) => /^[0-9a-f]{64}$/.test(k)))
  assert.equal(pruefeTuerRate('198.51.100.1', z, t0 + 60 * 60 * 1000 + 200).erlaubt, true)
  const h1 = ipHash('198.51.100.1', z, t0)
  const morgen = Date.parse('2026-11-26T00:00:01Z')
  const h2 = ipHash('198.51.100.1', z, morgen)
  assert.notEqual(h1, h2)
  assert.equal(z.zaehler.size, 0)
})

test('Handler: Limit erreicht -> 429 mit Retry-After, kein Scaleway', async () => {
  const { d, aufrufe } = deps()
  for (let i = 0; i < NACHRICHTEN_PRO_STUNDE; i++) pruefeTuerRate(d.ip, d.rate, d.now)
  const r = await beantworteTuerKi(frage('Was ist BtMM?'), d)
  assert.equal(r.http, 429)
  assert.equal(r.json.status, 'limit')
  assert.ok(r.retryAfterSec > 0)
  assert.equal(aufrufe.chat.length, 0)
})

test('Kostendeckel: harter Tages-/Monatsdeckel mit Worst-Case-Prüfung, Sparstufe ab 80 %, Env nur bis Obergrenze', async () => {
  assert.deepEqual([DECKEL_STANDARD.tagEur, DECKEL_STANDARD.monatEur, DECKEL_STANDARD.maxAusgabeTokens, DECKEL_STANDARD.maxEingabeTokens], [0.5, 10, 400, 6000])
  assert.deepEqual([DECKEL_OBERGRENZE.tagEur, DECKEL_OBERGRENZE.monatEur], [0.5, 10])
  assert.equal(deckelAusEnv({ TUER_KI_TAG_EUR: '100', TUER_KI_MONAT_EUR: '999' }).tagEur, 0.5)
  assert.equal(deckelAusEnv({ TUER_KI_TAG_EUR: '100', TUER_KI_MONAT_EUR: '999' }).monatEur, 10)
  assert.equal(deckelAusEnv({ TUER_KI_TAG_EUR: '0,5' }).tagEur, 0.5)
  assert.equal(deckelAusEnv({ TUER_KI_TAG_EUR: 'abc' }).tagEur, 0.5)
  assert.equal(deckelAusEnv({ TUER_KI_TAG_EUR: '0,2', TUER_KI_MONAT_EUR: '5' }).tagEur, 0.2)
  assert.equal(deckelAusEnv({ TUER_KI_TAG_EUR: '0,2', TUER_KI_MONAT_EUR: '5' }).monatEur, 5)
  const now = Date.parse('2026-11-25T12:00:00Z')
  const z = neuerKostenZustand(now)
  assert.equal(pruefeDeckel(z, DECKEL_STANDARD, 3000, now).maxTokens, 400)
  z.tagEur = 0.42
  const spar = pruefeDeckel(z, DECKEL_STANDARD, 3000, now)
  assert.equal(spar.erlaubt && spar.spar && spar.maxTokens, 200)
  z.tagEur = 0.5 - kostenEur(3000, 200) / 2
  assert.equal(pruefeDeckel(z, DECKEL_STANDARD, 3000, now).erlaubt, false)
  assert.equal(pruefeDeckel(neuerKostenZustand(now), DECKEL_STANDARD, 7000, now).erlaubt, false)
  const m = neuerKostenZustand(now); m.monatEur = 10
  assert.equal(pruefeDeckel(m, DECKEL_STANDARD, 100, now).grund, 'monat')
  // Tageswechsel setzt den Tag zurück, nicht den Monat
  const t = neuerKostenZustand(now); bucheVerbrauch(t, 1_000_000, 1_000_000, now)
  assert.ok(Math.abs(t.tagEur - 0.5) < 1e-9)
  pruefeDeckel(t, DECKEL_STANDARD, 10, Date.parse('2026-11-26T08:00:00Z'))
  assert.equal(t.tagEur, 0); assert.ok(t.monatEur > 0.49)
  // Handler: Deckel erreicht -> Notbetrieb, kein Scaleway
  const { d, aufrufe } = deps()
  d.kosten.tagEur = 0.5
  const r = await beantworteTuerKi(frage('Was ist BtMM?'), d)
  assert.equal(r.http, 200)
  assert.equal(r.json.status, 'deckel')
  assert.equal(aufrufe.chat.length, 0)
})

test('Ausgabefilter: Emojis, Links, Tabu, Benennung, Direktkredit-Konditionen, Prompt-Echo', async () => {
  const ok = bereinigeAntwort('Gern \u{1F600} siehe [hier](https://evil.example) und www.x.de **fett**\nSCHRITTE: sparen, kunde')
  assert.equal(ok.art, 'ok')
  assert.doesNotMatch(ok.text, /https?:|www\.|\*|\u{1F600}/u)
  assert.deepEqual(ok.schritte, ['sparen', 'kunde'])
  assert.equal(bereinigeAntwort('BtMM eG ist toll').art, 'ersetzt')
  assert.equal(bereinigeAntwort('BtMM ist bereits eingetragen.').art, 'ersetzt')
  assert.equal(bereinigeAntwort('Das ist staatlich anerkannt.').art, 'ersetzt')
  assert.equal(bereinigeAntwort('Das hilft bei Krankheit.').grund, 'tabu')
  assert.equal(bereinigeAntwort('Direktkredite bringen 2 % Zinsen bei 5 Jahren Laufzeit.').grund, 'direktkredit')
  assert.equal(bereinigeAntwort('Ein Nachrangdarlehen ab 500 Euro ist möglich.').grund, 'direktkredit')
  assert.equal(istDirektkreditWerbung('Direktkredite sind für die Zeit nach der Gründung angedacht.'), false)
  assert.equal(bereinigeAntwort('Klar: Du bist die BtMM-KI auf der Eingangstür von Back to Meaning Maximization und so weiter', ['Du bist die BtMM-KI auf der Eingangstür von Back to Meaning Maximization']).grund, 'echo')
  // Handler ersetzt Direktkredit-Werbung durch die feste Antwort
  const { d } = deps({ chat: async () => ({ text: 'Direktkredit mit 3 % Zins, Laufzeit 10 Jahre.', usage: null }) })
  const r = await beantworteTuerKi(frage('Gibt es Direktkredite?'), d)
  assert.equal(r.json.status, 'ok')
  assert.equal(r.json.antwort, FESTE_TEXTE.de.direktkredit)
  assert.equal(r.json.generative, false)
})

test('Scaleway-Fehler: feste Antwort, Log nur Statuscode, kein Inhalt', async () => {
  const fehler = console.error
  const geloggt = []
  console.error = (...a) => geloggt.push(a)
  try {
    const erg = await scalewayChat({ secret: 's', messages: [{ role: 'user', content: 'GEHEIMER INHALT' }], temperature: 0.2, maxTokens: 900, fetchImpl: async () => ({ ok: false, status: 503 }) })
    assert.equal(erg, null)
    const { d } = deps({ chat: (opt) => scalewayChat({ ...opt, fetchImpl: async () => { throw new Error('GEHEIMER INHALT') } }) })
    const r = await beantworteTuerKi(frage('Was ist BtMM?'), d)
    assert.equal(r.json.status, 'fehler')
  } finally {
    console.error = fehler
  }
  assert.deepEqual(geloggt, [['scaleway', 503], ['scaleway']])
})

test('Wissens-KI-Regression: gemeinsamer Scaleway-Aufruf sendet dieselben Parameter wie bisher', async () => {
  let gesendet
  const erg = await scalewayChat({
    secret: 'platzhalter', temperature: 0.2, maxTokens: 900, messages: [{ role: 'system', content: 's' }, { role: 'user', content: 'u' }],
    fetchImpl: async (url, init) => { gesendet = { url, init }; return { ok: true, json: async () => ({ choices: [{ message: { content: '  Antwort  ' } }], usage: { prompt_tokens: 5, completion_tokens: 2 } }) } },
  })
  assert.equal(erg.text, 'Antwort')
  assert.deepEqual(erg.usage, { prompt_tokens: 5, completion_tokens: 2 })
  assert.equal(gesendet.url, 'https://api.scaleway.ai/v1/chat/completions')
  const body = JSON.parse(gesendet.init.body)
  assert.equal(body.model, 'mistral-small-3.2-24b-instruct-2506')
  assert.equal(body.temperature, 0.2)
  assert.equal(body.max_tokens, 900)
  assert.equal(gesendet.init.signal, undefined)
  const route = lese('app/api/wissen-mitmacher/route.ts')
  assert.match(route, /temperature: 0\.2,\n\s+maxTokens: 900/)
  assert.match(route, /loadMitmacherCorpus/)
  assert.doesNotMatch(route, /Genossenschaft Freiburg/)
  assert.doesNotMatch(route, /\beG\b/)
  assert.match(route, /BTMM_BENENNUNG/)
})

test('Nur öffentlicher Index: Route lädt loadPublicCorpus, nie den Mitmacher-Index', () => {
  const route = lese('app/api/tuer-ki/route.ts')
  assert.match(route, /ladeCorpus:\s*loadPublicCorpus/)
  assert.doesNotMatch(route, /loadMitmacherCorpus|wissen-mitglieder/)
  for (const f of ['handler', 'filter', 'rateLimit', 'kosten', 'systemPrompt', 'schalter', 'herkunft', 'konfig', 'texte']) {
    const src = lese(`lib/tuerKi/${f}.ts`)
    assert.doesNotMatch(src, /loadMitmacherCorpus|wissen-mitglieder|loadCorpus/, f)
  }
  const loader = lese('lib/wissen/loadCorpus.ts')
  assert.match(loader, /Chunks ohne Sichtbarkeits-„Level“ sind hier nicht gesperrt/)
  assert.match(loader, /nurAllowlistChunks/)
  assert.match(loader, /PUBLIC-ALLOWLIST\.json/)
  const sql = lese('docs/tuer-ki/NICHT-ANWENDEN-braucht-Nutzer-Ja_tuer_ki_rate_limit.sql')
  assert.match(sql, /NICHT ANWENDEN/)
  assert.match(sql, /delete from public\.tuer_ki_rate where erstellt < now\(\) - interval '24 hours'/)
  assert.match(sql, /Salzquelle/)
  assert.match(sql, /EU-Region/)
})

test('Keine Inhalte im Log: nur feste Kürzel und Statuscodes', () => {
  const dateien = ['app/api/tuer-ki/route.ts', 'lib/wissen/scaleway.ts', ...['handler', 'filter', 'rateLimit', 'kosten', 'systemPrompt', 'schalter', 'herkunft', 'konfig', 'texte', 'sensibel-liste'].map((f) => `lib/tuerKi/${f}.ts`)]
  const erlaubt = [/^console\.error\('tuer-ki'\)$/, /^console\.error\('scaleway', res\.status\)$/, /^console\.error\('scaleway'\)$/]
  for (const rel of dateien) {
    for (const z of lese(rel).split('\n')) {
      const m = z.match(/console\.\w+\([^)]*\)/)
      if (m) assert.ok(erlaubt.some((r) => r.test(m[0])), `${rel}: ${m[0]}`)
    }
  }
})

test('CORS nur für freigegebene App-Origins, nie "*", fremde Origins abgewiesen', () => {
  const apps = appOrigins('https://app.example.org, *, capacitor://localhost, kaputt')
  assert.deepEqual(apps, ['https://app.example.org', 'capacitor://localhost'])
  const app = pruefeHerkunft('https://app.example.org', 'b-t-m-m.com', apps)
  assert.equal(app.erlaubt, true)
  assert.equal(app.cors['Access-Control-Allow-Origin'], 'https://app.example.org')
  const selbst = pruefeHerkunft('https://b-t-m-m.com', 'b-t-m-m.com', apps)
  assert.equal(selbst.erlaubt, true)
  assert.deepEqual(selbst.cors, {})
  assert.equal(pruefeHerkunft('https://boese.example', 'b-t-m-m.com', apps).erlaubt, false)
  assert.equal(pruefeHerkunft('https://boese.example', 'b-t-m-m.com', appOrigins('*')).erlaubt, false)

  const leer = appOrigins(undefined)
  assert.deepEqual(leer, [])
  for (const o of ['https://app.b-t-m-m.com', 'https://btmm-app.vercel.app', 'capacitor://localhost', 'http://localhost', 'https://boese.example']) {
    const r = pruefeHerkunft(o, 'b-t-m-m.com', leer)
    assert.equal(r.erlaubt, false, o)
    assert.deepEqual(r.cors, {}, o)
  }
  const quelle = lese('lib/tuerKi/herkunft.ts')
  assert.match(quelle, /BtMM-App #68/)
  assert.match(quelle, /https:\/\/app\.b-t-m-m\.com/)
  assert.ok(quelle.includes('^https:\\/\\/btmm-[a-z0-9-]+-backtobalancegartzke-2433s-projects\\.vercel\\.app$'))
  assert.doesNotMatch(lese('app/api/tuer-ki/route.ts') + quelle, /Allow-Origin['"]?:\s*['"]\*/)
})

test('Honeypot füllt -> abgewiesen ohne Scaleway', async () => {
  const { d, aufrufe } = deps()
  const r = await beantworteTuerKi({ ...frage('Hallo'), website: 'http://spam' }, d)
  assert.equal(r.http, 400)
  assert.equal(aufrufe.chat.length, 0)
})

test('Systemprompt: keine Nie-Liste-Begriffe, keine Tabu-Wörter, Benennung und Recht-Vorgaben enthalten', () => {
  const NIE = [/\beG\b/, /e\.\s?G\./, /eingetragen/i, /staatlich anerkannt/i, /eG i\. ?G\./, /\bZusage/i, /7b/, /HwO/, /§/, /Genossenschaft Freiburg/i, /antwortet frei/i, /%/, /€/, /\d+\s?Euro/i]
  for (const s of TUER_SPRACHEN) {
    const p = baueSystemprompt(s)
    for (const r of NIE) assert.doesNotMatch(p, r, `${s}: ${r}`)
    assert.doesNotMatch(p, new RegExp(TABU.source, 'i'), s)
    assert.doesNotMatch(p, /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u)
  }
  const p = baueSystemprompt('de')
  assert.ok(p.includes(BTMM_BENENNUNG))
  assert.match(BTMM_BENENNUNG, /geplante Genossenschaft \(noch nicht gegründet\), Gründung in Freiburg geplant/)
  assert.match(p, /Mitglied eines Prüfungsverbands/)
  assert.match(p, /unverbindliche Interessenbekundungen/)
  assert.match(p, /nur bei einem Betrieb einlösbar/)
  assert.match(p, /Direktkredite: nur allgemein/)
  assert.match(p, /Frag nie nach Gesundheit, Einkommen, Lebenslage/)
  assert.match(p, /automatischer Assistent, kein Mensch/)
  assert.ok(TUER_KI_REGELN.length > 10)
})

test('Feste Texte: 11 Sprachen, alle Schlüssel, keine Tabu-Wörter, keine Emojis', () => {
  assert.equal(Object.keys(FESTE_TEXTE).length, 11)
  for (const s of TUER_SPRACHEN) {
    for (const k of Object.keys(FESTE_TEXTE.de)) {
      assert.ok(FESTE_TEXTE[s][k], `${s}.${k}`)
      assert.doesNotMatch(FESTE_TEXTE[s][k], new RegExp(TABU.source, 'i'), `${s}.${k}`)
    }
  }
})

test('Schritt-Schlüssel der Route = SCHRITTE in public/tuer/pfad.js', () => {
  const ctx = { window: {} }
  vm.runInNewContext(lese('public/tuer/pfad.js'), ctx)
  const pf = ctx.window.BTMM_TUER_PFAD || ctx.BTMM_TUER_PFAD
  assert.deepEqual([...SCHRITTE_KEYS].sort(), Object.keys(pf.SCHRITTE).sort())
})

test('Tür-Oberfläche: Schalter aus = alter Dialog und alte Texte; KI-Modus mit Start-Klick, Hinweis, Löschen, data-ai-generated', () => {
  const html = lese('public/tuer/index.html')
  const ki = lese('public/tuer/tuer-ki.js')
  const cfg = lese('next.config.mjs')
  assert.match(lese('public/tuer/ki-schalter-aus.js'), /BTMM_TUER_KI_AN = false/)
  assert.match(cfg, /TUER_KI_UI \? '\/tuer\/ki-schalter-an\.js' : '\/tuer\/ki-schalter-aus\.js'/)
  assert.match(cfg, /an\(process\.env\.TUER_KI_ENABLED\) && an\(process\.env\.WISSEN_LLM_ENABLED\)/)
  // Alter Text bleibt, solange der Schalter aus ist (DS: erst mit Go-Live tauschen)
  assert.match(html, /Deine Antworten bleiben nur auf diesem Gerät/)
  assert.match(lese('public/tuer/texte.js'), /Deine Antworten bleiben nur auf diesem Gerät/)
  // KI-Hinweis über dem Eingabefeld, Start-Knopf davor, Honeypot im Formular
  const hinweis = html.indexOf('id="ki-hinweis"'), start = html.indexOf('id="ki-start"'), form = html.indexOf('<form class="eingabe"')
  assert.ok(hinweis > 0 && hinweis < form && start < form)
  assert.match(html, /name="website"/)
  assert.ok(html.indexOf('ki-schalter.js') > html.indexOf('tuer.js'))
  // Ohne Schalter tut tuer-ki.js nichts
  assert.match(ki, /if \(!ALT \|\| !window\.BTMM_TUER_KI_AN/)
  // Netz nur in senden(): genau ein fetch, nach dem Start-Klick
  assert.equal((ki.match(/fetch\(/g) || []).length, 1)
  assert.ok(ki.indexOf('fetch(') > ki.indexOf('function senden('))
  assert.match(ki, /if \(!text \|\| beschaeftigt \|\| !st\.gestartet\) return/)
  assert.match(ki, /setAttribute\('data-ai-generated', 'true'\)/)
  assert.match(ki, /setAttribute\('aria-describedby', 'ki-hinweis ds-hinweis'\)/)
  assert.match(ki, /sessionStorage/)
  assert.doesNotMatch(ki, /localStorage/)
  // Texte 11 Sprachen, mit Art.-50-Hinweis, ohne Versprechen „frei“
  const ctx = { window: {} }
  vm.runInNewContext(lese('public/tuer/texte-ki.js'), ctx)
  const T = ctx.window.BTMM_TUER_KI_TEXTE
  assert.deepEqual(Object.keys(T).sort(), [...TUER_SPRACHEN].sort())
  for (const s of TUER_SPRACHEN) {
    for (const k of Object.keys(T.de)) assert.ok(T[s][k], `${s}.${k}`)
    assert.doesNotMatch(JSON.stringify(T[s]), new RegExp(TABU.source, 'i'), s)
  }
  assert.equal(T.de.kiHinweis, 'Du sprichst mit einer KI. Die Antworten werden automatisch erzeugt und können Fehler enthalten. Automatischer Assistent, kein Mensch, keine Beratung.')
  assert.equal(T.de.starten, 'Mit KI sprechen')
  assert.equal(T.de.loeschen, 'Gespräch löschen')
  assert.doesNotMatch(JSON.stringify(T.de), /frei/i)
})

test('DSE-Absatz Tür-KI: nur bei Schalter an, lit. f, Art. 21, gehashte IP, TDDDG, Art.-50-Satz in Sie-Form', () => {
  const src = lese('app/[locale]/(seiten)/impressum/page.tsx')
  const a = src.indexOf('{tuerKiLive() && (')
  const h = src.indexOf('<h4>Gesprächs-KI auf der Eingangsseite (Tür)</h4>')
  assert.ok(a > 0 && h > a && h < src.indexOf('<h4>Brevo (E-Mail-Versand)</h4>'))
  assert.ok(src.indexOf('<h4>Wissens-Assistent (KI) für Mitmachende</h4>') < a)
  const absatz = src.slice(h, src.indexOf('<h4>Brevo'))
  for (const r of [/Sie sprechen mit einer KI\. Die Antworten werden automatisch erzeugt und können Fehler enthalten\./, /Art\. 6 Abs\. 1 lit\. f DSGVO/, /berechtigtes Interesse/, /Art\. 21 DSGVO/, /in gehashter Form/, /§ 25 Abs\. 2 Nr\. 2 TDDDG/, /Scaleway SAS/, /keinen Menschen/, /Hosting-Anbieter Vercel \(siehe Abschnitt Hosting\)/, /Wir versuchen, Nachrichten mit Gesundheitsangaben, Kontakt- oder Kontodaten automatisch zu erkennen/, /diese Erkennung ist nicht vollständig/]) assert.match(absatz, r)
  assert.doesNotMatch(absatz, /gekürzt/)
  assert.match(src, /an\(process\.env\.TUER_KI_ENABLED\) && an\(process\.env\.WISSEN_LLM_ENABLED\)/)
})
