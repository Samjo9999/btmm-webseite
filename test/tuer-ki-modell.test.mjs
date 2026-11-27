// Tür-KI: wählbares Modell (TUER_KI_MODEL). Standard bleibt Mistral Small 3.2, nichts ändert sich ohne Env.
import test from 'node:test'
import assert from 'node:assert/strict'
import { beantworteTuerKi } from '../lib/tuerKi/handler.ts'
import { neuerRateZustand } from '../lib/tuerKi/rateLimit.ts'
import { neuerKostenZustand, deckelAusEnv, DECKEL_STANDARD, DECKEL_OBERGRENZE, kostenEur, pruefeDeckel, bucheVerbrauch } from '../lib/tuerKi/kosten.ts'
import { LLM_MODELLE, MODELL_STANDARD_ID, resolveLlmModell } from '../lib/wissen/llmModelle.ts'
import { scalewayChat } from '../lib/wissen/scaleway.ts'

const SALT = 'test-secret-nur-fuer-unit'
const NOW = Date.parse('2026-11-27T12:00:00Z')
const AN = { TUER_KI_ENABLED: 'true', WISSEN_LLM_ENABLED: 'true', WISSEN_LLM_TIER: 's50', SCALEWAY_SECRET_KEY: 'test-platzhalter', TUER_KI_RATE_SALT: SALT }
const CHUNK = { title: '07 Konzept', abschnitt: 'Augenhöhe', text: 'Jede Arbeitsstunde ist gleich viel wert.', rel: 'x.md' }

function deps(env) {
  const aufrufe = { chat: [], reserve: [], korrektur: [] }
  const d = {
    env,
    ip: '203.0.113.7',
    now: NOW,
    ladeCorpus: () => ({ chunks: [CHUNK] }),
    suche: () => [CHUNK],
    chat: async (opt) => { aufrufe.chat.push(opt); return { text: 'Gern. Quelle: 07 Konzept, Augenhöhe', usage: { prompt_tokens: 3000, completion_tokens: 200 } } },
    rate: neuerRateZustand(NOW, SALT),
    kosten: neuerKostenZustand(NOW),
    zaehleRate: async () => ({ stunde: 1, tag: 1 }),
    reserviereKosten: async (...a) => { aufrufe.reserve.push(a); return { erlaubt: true, tagEur: 0, monatEur: 0 } },
    korrigiereKosten: async (...a) => { aufrufe.korrektur.push(a) },
  }
  return { d, aufrufe }
}
const frage = { nachrichten: [{ rolle: 'user', text: 'Was ist BtMM?' }], sprache: 'de' }

test('Modellliste: Standard ist Mistral Small 3.2 mit 0,15 / 0,35 und Obergrenze 0,50 / 10', () => {
  assert.equal(MODELL_STANDARD_ID, 'mistral-small-3.2-24b-instruct-2506')
  const m = resolveLlmModell(undefined)
  assert.deepEqual([m.preisEinEurProMio, m.preisAusEurProMio, m.obergrenzeTagEur, m.obergrenzeMonatEur], [0.15, 0.35, 0.5, 10])
  assert.equal(m.reasoningEffort, undefined)
  assert.equal(m.timeoutMs, 12000)
})

test('Unbekannte, leere oder gefährliche Werte fallen auf den Standard zurück', () => {
  for (const raw of [undefined, null, '', '  ', 'gpt-5', 'qwen3.5-397b-a17b-extra', '__proto__', 'constructor', 'toString']) {
    assert.equal(resolveLlmModell(raw).id, MODELL_STANDARD_ID, String(raw))
  }
  assert.equal(resolveLlmModell('  QWEN3.5-397B-A17B ').id, 'qwen3.5-397b-a17b')
})

test('Preise der Stufen stimmen mit der Scaleway-Preisseite (Abruf 27.11.2026) überein', () => {
  const erwartet = {
    'mistral-small-3.2-24b-instruct-2506': [0.15, 0.35],
    'qwen3.5-397b-a17b': [0.6, 3.6],
    'qwen3-235b-a22b-instruct-2507': [0.75, 2.25],
    'mistral-medium-3.5-128b': [1.5, 7.5],
  }
  assert.deepEqual(Object.keys(LLM_MODELLE).sort(), Object.keys(erwartet).sort())
  for (const [id, [ein, aus]] of Object.entries(erwartet)) {
    assert.deepEqual([LLM_MODELLE[id].preisEinEurProMio, LLM_MODELLE[id].preisAusEurProMio], [ein, aus], id)
    assert.ok(LLM_MODELLE[id].timeoutMs < 20000, 'unter maxDuration der Route')
  }
  // Reasoning-Modelle schalten Reasoning aus; reine Instruct-Modelle bekommen den Parameter nicht.
  assert.equal(LLM_MODELLE['qwen3.5-397b-a17b'].reasoningEffort, 'none')
  assert.equal(LLM_MODELLE['mistral-medium-3.5-128b'].reasoningEffort, 'none')
  assert.equal(LLM_MODELLE['qwen3-235b-a22b-instruct-2507'].reasoningEffort, undefined)
})

test('Deckel ohne TUER_KI_MODEL unverändert: Defaults 0,50 / 10, Env kann nicht darüber', () => {
  const d = deckelAusEnv({})
  assert.deepEqual([d.tagEur, d.monatEur], [0.5, 10])
  assert.deepEqual(d.preis, { ein: 0.15, aus: 0.35 })
  assert.equal(deckelAusEnv({ TUER_KI_TAG_EUR: '100', TUER_KI_MONAT_EUR: '999' }).tagEur, 0.5)
  assert.equal(deckelAusEnv({ TUER_KI_TAG_EUR: '100', TUER_KI_MONAT_EUR: '999' }).monatEur, 10)
  assert.deepEqual([DECKEL_OBERGRENZE.tagEur, DECKEL_OBERGRENZE.monatEur], [0.5, 10])
  assert.deepEqual(DECKEL_STANDARD.preis, { ein: 0.15, aus: 0.35 })
})

test('Stärkeres Modell: Standarddeckel bleiben 0,50 / 10, Anhebung nur per Env und nur bis zur Obergrenze 3 / 50', () => {
  const nurModell = deckelAusEnv({ TUER_KI_MODEL: 'qwen3.5-397b-a17b' })
  assert.deepEqual([nurModell.tagEur, nurModell.monatEur], [0.5, 10])
  assert.deepEqual(nurModell.preis, { ein: 0.6, aus: 3.6 })
  const hoch = deckelAusEnv({ TUER_KI_MODEL: 'qwen3.5-397b-a17b', TUER_KI_TAG_EUR: '1,5', TUER_KI_MONAT_EUR: '30' })
  assert.deepEqual([hoch.tagEur, hoch.monatEur], [1.5, 30])
  const zuHoch = deckelAusEnv({ TUER_KI_MODEL: 'qwen3.5-397b-a17b', TUER_KI_TAG_EUR: '100', TUER_KI_MONAT_EUR: '999' })
  assert.deepEqual([zuHoch.tagEur, zuHoch.monatEur], [3, 50])
  // Ohne gültiges Modell greift die hohe Obergrenze nie.
  const tipp = deckelAusEnv({ TUER_KI_MODEL: 'qwen3.5', TUER_KI_TAG_EUR: '100', TUER_KI_MONAT_EUR: '999' })
  assert.deepEqual([tipp.tagEur, tipp.monatEur], [0.5, 10])
})

test('Kostenrechnung nutzt den Preis des gewählten Modells', () => {
  assert.ok(Math.abs(kostenEur(1_000_000, 1_000_000) - 0.5) < 1e-12)
  assert.ok(Math.abs(kostenEur(1_000_000, 1_000_000, { ein: 0.6, aus: 3.6 }) - 4.2) < 1e-12)
  const deckel = deckelAusEnv({ TUER_KI_MODEL: 'qwen3.5-397b-a17b' })
  const z = neuerKostenZustand(NOW)
  bucheVerbrauch(z, 1_000_000, 100_000, NOW, deckel.preis)
  assert.ok(Math.abs(z.tagEur - (0.6 + 0.36)) < 1e-12)
  // Worst-Case-Prüfung rechnet mit dem teureren Preis: bei 0,498 EUR Tagesstand ist die Anfrage nicht mehr erlaubt.
  const z2 = neuerKostenZustand(NOW)
  z2.tagEur = 0.498
  assert.equal(pruefeDeckel(z2, deckelAusEnv({}), 3000, NOW).erlaubt, true)
  assert.equal(pruefeDeckel(z2, deckelAusEnv({ TUER_KI_MODEL: 'qwen3.5-397b-a17b' }), 3000, NOW).erlaubt, false)
})

test('Handler ohne TUER_KI_MODEL: gleiches Modell, kein reasoning_effort, Timeout 12 s, Preis 0,15 / 0,35', async () => {
  const { d, aufrufe } = deps({ ...AN })
  const r = await beantworteTuerKi(frage, d)
  assert.equal(r.json.status, 'ok')
  assert.equal(r.json.modell, 'mistral-small-3.2-24b-instruct-2506')
  assert.equal(aufrufe.chat[0].model, 'mistral-small-3.2-24b-instruct-2506')
  assert.equal(aufrufe.chat[0].reasoningEffort, undefined)
  assert.equal(aufrufe.chat[0].timeoutMs, 12000)
  const echt = aufrufe.korrektur[0][3]
  assert.ok(Math.abs(echt - kostenEur(3000, 200)) < 1e-12)
})

test('Handler mit TUER_KI_MODEL=qwen3.5-397b-a17b: Modell, reasoning none, Timeout 16 s, Preis und Reservierung des neuen Modells', async () => {
  const { d, aufrufe } = deps({ ...AN, TUER_KI_MODEL: 'qwen3.5-397b-a17b', TUER_KI_TAG_EUR: '1.5', TUER_KI_MONAT_EUR: '30' })
  const r = await beantworteTuerKi(frage, d)
  assert.equal(r.json.status, 'ok')
  assert.equal(r.json.modell, 'qwen3.5-397b-a17b')
  assert.equal(aufrufe.chat[0].model, 'qwen3.5-397b-a17b')
  assert.equal(aufrufe.chat[0].reasoningEffort, 'none')
  assert.equal(aufrufe.chat[0].timeoutMs, 16000)
  const preis = { ein: 0.6, aus: 3.6 }
  assert.ok(Math.abs(aufrufe.korrektur[0][3] - kostenEur(3000, 200, preis)) < 1e-12)
  assert.equal(aufrufe.reserve[0][3], 1.5)
  assert.equal(aufrufe.reserve[0][4], 30)
  assert.ok(Math.abs(d.kosten.tagEur - kostenEur(3000, 200, preis)) < 1e-12)
})

test('Handler mit stärkerem Modell und Standarddeckel: harter Stopp beim Tagesdeckel 0,50', async () => {
  const { d, aufrufe } = deps({ ...AN, TUER_KI_MODEL: 'qwen3.5-397b-a17b' })
  d.kosten.tagEur = 0.499
  const r = await beantworteTuerKi(frage, d)
  assert.equal(r.json.status, 'deckel')
  assert.equal(aufrufe.chat.length, 0)
})

test('scalewayChat: Standard-Body unverändert, neues Modell und reasoning_effort nur auf Wunsch', async () => {
  const antwort = { ok: true, json: async () => ({ choices: [{ message: { content: 'x' } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }) }
  let body
  const f = async (_u, init) => { body = JSON.parse(init.body); return antwort }
  await scalewayChat({ secret: 's', messages: [{ role: 'user', content: 'u' }], temperature: 0.5, maxTokens: 10, fetchImpl: f })
  assert.equal(body.model, 'mistral-small-3.2-24b-instruct-2506')
  assert.equal('reasoning_effort' in body, false)
  await scalewayChat({ secret: 's', messages: [{ role: 'user', content: 'u' }], temperature: 0.5, maxTokens: 10, model: 'qwen3.5-397b-a17b', reasoningEffort: 'none', fetchImpl: f })
  assert.equal(body.model, 'qwen3.5-397b-a17b')
  assert.equal(body.reasoning_effort, 'none')
})
