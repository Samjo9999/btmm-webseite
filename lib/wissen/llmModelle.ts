/**
 * Auswahl des Scaleway-Modells der Tür-KI (Env TUER_KI_MODEL, Standard unverändert).
 * Nur Modelle aus dieser Liste sind wählbar; unbekannter oder leerer Wert fällt auf den Standard
 * zurück, damit ein Tippfehler in der Env nie ein anderes Modell oder einen anderen Preis auslöst.
 * Preise: Scaleway Generative APIs, Preisseite, Abruf 27.11.2026
 * (https://www.scaleway.com/en/pricing/model-as-a-service/), Euro je 1 Mio. Tokens.
 * Keine eigenen Imports, damit Tests das Modul direkt laden können.
 */

export type LlmModellId =
  | 'mistral-small-3.2-24b-instruct-2506'
  | 'qwen3.5-397b-a17b'
  | 'qwen3-235b-a22b-instruct-2507'
  | 'mistral-medium-3.5-128b'

export type LlmModell = {
  id: LlmModellId
  preisEinEurProMio: number
  preisAusEurProMio: number
  /** Scaleway: Reasoning ist bei diesen Modellen ohne Angabe an und kostet Ausgabe-Tokens. */
  reasoningEffort?: 'none'
  /** Abbruch des Aufrufs (ms); muss unter maxDuration der Route (20 s) bleiben. */
  timeoutMs: number
  /** Obergrenze für Tages- und Monatsdeckel per Env (Euro). */
  obergrenzeTagEur: number
  obergrenzeMonatEur: number
}

export const MODELL_STANDARD_ID: LlmModellId = 'mistral-small-3.2-24b-instruct-2506'

export const LLM_MODELLE: Record<LlmModellId, LlmModell> = {
  'mistral-small-3.2-24b-instruct-2506': {
    id: 'mistral-small-3.2-24b-instruct-2506',
    preisEinEurProMio: 0.15,
    preisAusEurProMio: 0.35,
    timeoutMs: 12000,
    obergrenzeTagEur: 0.5,
    obergrenzeMonatEur: 10,
  },
  'qwen3.5-397b-a17b': {
    id: 'qwen3.5-397b-a17b',
    preisEinEurProMio: 0.6,
    preisAusEurProMio: 3.6,
    reasoningEffort: 'none',
    timeoutMs: 16000,
    obergrenzeTagEur: 3,
    obergrenzeMonatEur: 50,
  },
  'qwen3-235b-a22b-instruct-2507': {
    id: 'qwen3-235b-a22b-instruct-2507',
    preisEinEurProMio: 0.75,
    preisAusEurProMio: 2.25,
    timeoutMs: 16000,
    obergrenzeTagEur: 3,
    obergrenzeMonatEur: 50,
  },
  'mistral-medium-3.5-128b': {
    id: 'mistral-medium-3.5-128b',
    preisEinEurProMio: 1.5,
    preisAusEurProMio: 7.5,
    reasoningEffort: 'none',
    timeoutMs: 16000,
    obergrenzeTagEur: 3,
    obergrenzeMonatEur: 50,
  },
}

export function resolveLlmModell(raw: string | undefined | null): LlmModell {
  const id = String(raw ?? '').trim().toLowerCase()
  return Object.prototype.hasOwnProperty.call(LLM_MODELLE, id)
    ? LLM_MODELLE[id as LlmModellId]
    : LLM_MODELLE[MODELL_STANDARD_ID]
}
