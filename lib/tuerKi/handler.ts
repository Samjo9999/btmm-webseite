/**
 * Kern der Tür-KI-Route (ohne Next), damit er ohne Netz und ohne Scaleway testbar ist.
 * Reihenfolge: Schalter -> Honeypot -> Verlauf prüfen -> Filter (ganzer Verlauf) -> Rate-Limit
 * -> Kontext nur aus dem öffentlichen Index -> Kostendeckel -> Scaleway -> Ausgabefilter.
 * Zustandslos bezogen auf Inhalte: Nachrichten werden weder gespeichert noch geloggt.
 */
import type { WissenChunk } from '../wissen/search.ts'
import type { ChatNachricht, ChatErgebnis, ScalewayOptionen } from '../wissen/scaleway.ts'
import { SCALEWAY_MODEL } from '../wissen/scaleway.ts'
import { TUER_KI, spracheOder, type TuerSprache } from './konfig.ts'
import { tuerKiSchalter, type TuerKiEnv } from './schalter.ts'
import { sensibleNutzerNachrichten, bereinigeAntwort } from './filter.ts'
import { pruefePersistenteRate, rateSalt, type TuerRateRpc, type TuerRateZustand } from './rateLimit.ts'
import { pruefeDeckel, bucheVerbrauch, deckelAusEnv, schaetzeTokens, kostenEur, periodenUtc, type TuerKostenZustand } from './kosten.ts'
import type { TuerKostenReserviere, TuerKostenKorrigiere } from './kostenPersist.ts'
import { baueSystemprompt, ECHO_SAETZE } from './systemPrompt.ts'
import { sichereDirektlieferung } from './gespraech.ts'
import { FESTE_TEXTE } from './texte.ts'

export type TuerNachricht = { rolle: 'user' | 'assistant'; text: string }

export type TuerKiStatus =
  | 'ok' | 'aus' | 'sensibel' | 'limit' | 'deckel' | 'fehler' | 'ende' | 'zu_lang' | 'ungueltig'

export type TuerKiAntwort = {
  status: TuerKiStatus
  text?: string
  antwort?: string
  schritte?: string[]
  /** Erlaubter interner Pfad als Link-Knopf, wenn die Antwort eine Seite nennt. */
  weiterleitung?: string
  quellen?: { dokument: string; abschnitt: string }[]
  /** Indizes der Nutzernachrichten, die der Client aus dem Verlauf entfernen soll. */
  entfernen?: number[]
  generative?: boolean
  modell?: string
}

export type TuerKiDeps = {
  env: TuerKiEnv & { TUER_KI_TAG_EUR?: string; TUER_KI_MONAT_EUR?: string; TUER_KI_RATE_SALT?: string }
  ip: string
  now: number
  /** Nur loadPublicCorpus (siehe app/api/tuer-ki/route.ts). */
  ladeCorpus: () => { chunks: WissenChunk[] }
  suche: (frage: string, chunks: WissenChunk[], n: number) => WissenChunk[]
  chat: (opt: ScalewayOptionen) => Promise<ChatErgebnis | null>
  rate: TuerRateZustand
  kosten: TuerKostenZustand
  /** Persistenter Zähler (tuer_ki_rate_zaehle); in Tests gemockt. */
  zaehleRate: TuerRateRpc
  /** Persistenter Kostendeckel (tuer_ki_kosten_reserviere); in Tests gemockt. */
  reserviereKosten: TuerKostenReserviere
  /** Persistenter Kostendeckel (tuer_ki_kosten_korrigiere); in Tests gemockt. */
  korrigiereKosten: TuerKostenKorrigiere
}

export type TuerKiErgebnis = { http: number; json: TuerKiAntwort; retryAfterSec?: number }

function fest(status: TuerKiStatus, sprache: TuerSprache, key: keyof (typeof FESTE_TEXTE)['de'], extra: Partial<TuerKiAntwort> = {}, http = 200): TuerKiErgebnis {
  return { http, json: { status, text: FESTE_TEXTE[sprache][key], ...extra } }
}

/** Prüft und kürzt den Verlauf vom Client. Gibt null bei ungültiger Form zurück. */
export function pruefeVerlauf(raw: unknown):
  | { ok: true; verlauf: TuerNachricht[]; nutzerRunden: number }
  | { ok: false; grund: 'ungueltig' | 'zu_lang' } {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 40) return { ok: false, grund: 'ungueltig' }
  const verlauf: TuerNachricht[] = []
  for (const n of raw) {
    if (!n || typeof n !== 'object') return { ok: false, grund: 'ungueltig' }
    const { rolle, text } = n as { rolle?: unknown; text?: unknown }
    if ((rolle !== 'user' && rolle !== 'assistant') || typeof text !== 'string') return { ok: false, grund: 'ungueltig' }
    const t = text.trim()
    if (!t) return { ok: false, grund: 'ungueltig' }
    if (rolle === 'user' && t.length > TUER_KI.maxZeichenNutzer) return { ok: false, grund: 'zu_lang' }
    verlauf.push({ rolle, text: rolle === 'assistant' ? t.slice(0, TUER_KI.maxZeichenAssistent) : t })
  }
  if (verlauf[verlauf.length - 1].rolle !== 'user') return { ok: false, grund: 'ungueltig' }
  const nutzerRunden = verlauf.filter((n) => n.rolle === 'user').length
  return { ok: true, verlauf, nutzerRunden }
}

export function baueKontext(hits: WissenChunk[]): string {
  return hits
    .slice(0, TUER_KI.kontextTreffer)
    .map((h, i) => {
      const label = h.entwurf ? ' [Entwurf, noch nicht beschlossen]' : ''
      return `[${i + 1}] ${h.title}${label}, ${h.abschnitt}\n${h.text.slice(0, TUER_KI.kontextZeichen)}`
    })
    .join('\n\n')
}

export async function beantworteTuerKi(body: unknown, d: TuerKiDeps): Promise<TuerKiErgebnis> {
  const b = (body && typeof body === 'object' ? body : {}) as { nachrichten?: unknown; sprache?: unknown; website?: unknown }
  const sprache = spracheOder(b.sprache)

  // 1. Schalter (Default aus): sauberer Hinweis, kein Fehler, kein Netz.
  const schalter = tuerKiSchalter(d.env)
  if (!schalter.an) return fest('aus', sprache, 'aus')

  // 2. Honeypot
  if (typeof b.website === 'string' && b.website.trim()) return { http: 400, json: { status: 'ungueltig' } }

  // 3. Verlauf (Rundenzahl, Länge) serverseitig begrenzen
  const geprueft = pruefeVerlauf(b.nachrichten)
  if (!geprueft.ok) {
    return geprueft.grund === 'zu_lang' ? fest('zu_lang', sprache, 'zuLang', {}, 400) : { http: 400, json: { status: 'ungueltig' } }
  }

  // 4. Sensible Angaben in IRGENDEINER Verlaufsnachricht (user und assistant): kein Modellaufruf, nichts loggen
  const sensibel = sensibleNutzerNachrichten(geprueft.verlauf)
  if (sensibel.length) return fest('sensibel', sprache, 'sensibel', { entfernen: sensibel })

  if (geprueft.nutzerRunden > TUER_KI.maxNutzerRunden) return fest('ende', sprache, 'ende')

  // 5. Persistentes Rate-Limit je IP-Hash (RPC); In-Memory nur als zusätzliche Bremse.
  // Ohne Salz oder bei DB-Fehler: fail-closed, Hinweis mit Links, kein LLM.
  const rate = await pruefePersistenteRate({
    ip: d.ip,
    salt: rateSalt(d.env),
    now: d.now,
    rpc: d.zaehleRate,
    memory: d.rate,
  })
  if (!rate.erlaubt) {
    if (rate.art === 'fail_closed') return fest('fehler', sprache, 'fehler')
    return { ...fest('limit', sprache, 'limit', {}, 429), retryAfterSec: rate.retryAfterSec }
  }

  // 6. Kontext nur aus dem öffentlichen Index
  const verlauf = geprueft.verlauf.slice(-TUER_KI.maxNachrichtenVerlauf)
  const nutzer = verlauf.filter((n) => n.rolle === 'user')
  const frage = nutzer.slice(-2).map((n) => n.text).join(' ')
  const corpus = d.ladeCorpus()
  let hits = d.suche(frage, corpus.chunks, TUER_KI.kontextTreffer)
  const system = baueSystemprompt(sprache)

  const baue = (h: WissenChunk[], v: TuerNachricht[]): ChatNachricht[] => [
    { role: 'system', content: system },
    { role: 'system', content: h.length ? `Kontext aus öffentlichen Unterlagen:\n${baueKontext(h)}` : 'Kontext aus öffentlichen Unterlagen: (kein Treffer)' },
    ...v.map((n) => ({ role: n.rolle, content: n.text }) as ChatNachricht),
  ]

  // 7. Kostendeckel: Eingabe schätzen, notfalls Verlauf und Kontext kürzen, dann hart prüfen
  const deckel = deckelAusEnv(d.env)
  let v = verlauf
  let messages = baue(hits, v)
  let ein = schaetzeTokens(messages.map((m) => m.content).join('\n'))
  while (ein > deckel.maxEingabeTokens && (v.length > 1 || hits.length > 1)) {
    if (v.length > 1) v = v.slice(2).length ? v.slice(2) : v.slice(-1)
    else hits = hits.slice(0, -1)
    messages = baue(hits, v)
    ein = schaetzeTokens(messages.map((m) => m.content).join('\n'))
  }
  const dk = pruefeDeckel(d.kosten, deckel, ein, d.now)
  if (!dk.erlaubt) return fest('deckel', sprache, 'deckel')

  // 8. Persistenter Deckel: Worst-Case reservieren. Ohne RPC oder bei Fehler: fail-closed.
  const { tag, monat } = periodenUtc(d.now)
  const schlimmstenfalls = kostenEur(ein, dk.maxTokens)
  try {
    const reserve = await d.reserviereKosten(tag, monat, schlimmstenfalls, deckel.tagEur, deckel.monatEur)
    if (!reserve || reserve.erlaubt !== true) return fest('deckel', sprache, 'deckel')
  } catch {
    return fest('fehler', sprache, 'fehler')
  }

  // 9. Scaleway (ein Versuch, Timeout, kein Retry)
  const erg = await d.chat({
    secret: schalter.secret,
    messages,
    temperature: TUER_KI.temperature,
    maxTokens: dk.maxTokens,
    timeoutMs: TUER_KI.timeoutMs,
  })
  const echtEin = erg?.usage?.prompt_tokens ?? ein
  const echtAus = erg ? (erg.usage?.completion_tokens ?? dk.maxTokens) : 0
  const echtEur = kostenEur(echtEin, echtAus)
  try {
    await d.korrigiereKosten(tag, monat, schlimmstenfalls, echtEur, echtEin, echtAus)
  } catch {
    // Reservierung bleibt als Worst-Case stehen. Nichts loggen (kein Inhalt).
  }
  bucheVerbrauch(d.kosten, echtEin, echtAus, d.now)
  if (!erg) return fest('fehler', sprache, 'fehler')

  // 10. Ausgabefilter
  const aus = bereinigeAntwort(erg.text, ECHO_SAETZE)
  if (aus.art === 'ersetzt') {
    const key = aus.grund === 'direktkredit' ? 'direktkredit' : 'ersetzt'
    const fest = sichereDirektlieferung(FESTE_TEXTE[sprache][key], verlauf, sprache)
    return { http: 200, json: { status: 'ok', antwort: fest.text, schritte: [], weiterleitung: fest.weiterleitung, quellen: [], generative: false } }
  }
  const sicher = sichereDirektlieferung(aus.text, verlauf, sprache)
  const quellen = hits.slice(0, 3).map((h) => ({ dokument: h.title, abschnitt: h.abschnitt }))
  return {
    http: 200,
    json: { status: 'ok', antwort: sicher.text, schritte: aus.schritte, weiterleitung: sicher.weiterleitung, quellen, generative: true, modell: SCALEWAY_MODEL },
  }
}
