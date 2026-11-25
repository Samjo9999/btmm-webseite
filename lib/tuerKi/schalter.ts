/**
 * Tür-KI-Schalter. Live nur, wenn TUER_KI_ENABLED UND der globale Wissens-Schalter
 * (WISSEN_LLM_ENABLED + Scaleway-Stufe) an sind und ein Secret gesetzt ist.
 * Default überall aus. Jeder Schalter einzeln ist Notbremse.
 */
import { isWissenLlmEnabled, resolveWissenLlmRuntime } from '../wissen/llmTiers.ts'

export type TuerKiEnv = {
  TUER_KI_ENABLED?: string
  WISSEN_LLM_ENABLED?: string
  WISSEN_LLM_TIER?: string
  SCALEWAY_SECRET_KEY?: string
}

export type TuerKiSchalter =
  | { an: true; secret: string }
  | { an: false; grund: 'tuer_aus' | 'wissen_aus' | 'kein_scaleway' | 'secret_fehlt' }

export function tuerKiSchalter(env: TuerKiEnv): TuerKiSchalter {
  if (!isWissenLlmEnabled(env.TUER_KI_ENABLED)) return { an: false, grund: 'tuer_aus' }
  const rt = resolveWissenLlmRuntime({ enabled: env.WISSEN_LLM_ENABLED, tier: env.WISSEN_LLM_TIER })
  if (!rt.live) return { an: false, grund: 'wissen_aus' }
  if (rt.meta.provider !== 'scaleway') return { an: false, grund: 'kein_scaleway' }
  const secret = (env.SCALEWAY_SECRET_KEY || '').trim()
  if (!secret) return { an: false, grund: 'secret_fehlt' }
  return { an: true, secret }
}
