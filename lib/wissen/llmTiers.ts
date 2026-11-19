/**
 * Sp.144 Wissens-LLM-Stufen — Vorbereitung, Default aus.
 * Live-Calls nur wenn WISSEN_LLM_ENABLED=true UND TIER gesetzt.
 * Kein Konto nötig für Prep; Secrets nur Platzhalter bis Dirigent-Karte.
 */

export type WissenLlmTier = 'off' | 's5' | 's15' | 's50' | 'h250'

export const WISSEN_LLM_TIERS: Record<
  Exclude<WissenLlmTier, 'off'>,
  {
    label: string
    provider: 'scaleway' | 'selfhost'
    budgetEurMon: number
    note: string
  }
> = {
  s5: {
    label: 'Scaleway Deckel 5 €/Mon',
    provider: 'scaleway',
    budgetEurMon: 5,
    note: 'Billing-Alert in Scaleway-Konsole; kein Hard-Stop im Code.',
  },
  s15: {
    label: 'Scaleway Deckel 15 €/Mon',
    provider: 'scaleway',
    budgetEurMon: 15,
    note: 'Billing-Alert in Scaleway-Konsole; kein Hard-Stop im Code.',
  },
  s50: {
    label: 'Scaleway Deckel 50 €/Mon',
    provider: 'scaleway',
    budgetEurMon: 50,
    note: 'Billing-Alert in Scaleway-Konsole; kein Hard-Stop im Code.',
  },
  h250: {
    label: 'Self-Host ~250 €/Mon (z. B. Hetzner GEX45)',
    provider: 'selfhost',
    budgetEurMon: 250,
    note: 'Nur vorbereiten (Compose); Server erst nach Dirigent-Karte mieten.',
  },
}

export function parseWissenLlmTier(raw: string | undefined | null): WissenLlmTier {
  const t = (raw || 'off').trim().toLowerCase()
  if (t === 's5' || t === 's15' || t === 's50' || t === 'h250') return t
  return 'off'
}

/** Hard kill-switch: ohne true/1/on nie Live-LLM, auch wenn Secret liegt. */
export function isWissenLlmEnabled(raw: string | undefined | null): boolean {
  const v = (raw || '').trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'on' || v === 'yes'
}

export function resolveWissenLlmRuntime(env: {
  enabled?: string | null
  tier?: string | null
}): {
  enabled: boolean
  tier: WissenLlmTier
  live: boolean
  meta: {
    label: string
    provider: 'extractive' | 'scaleway' | 'selfhost'
    budgetEurMon: number | null
  }
} {
  const enabled = isWissenLlmEnabled(env.enabled)
  const tier = parseWissenLlmTier(env.tier)
  const live = enabled && tier !== 'off'
  if (!live) {
    return {
      enabled,
      tier: 'off',
      live: false,
      meta: { label: 'extractive (Schalter aus)', provider: 'extractive', budgetEurMon: null },
    }
  }
  // live ⇒ tier ist s5|s15|s50|h250
  const def = WISSEN_LLM_TIERS[tier]
  return {
    enabled,
    tier,
    live: true,
    meta: {
      label: def.label,
      provider: def.provider,
      budgetEurMon: def.budgetEurMon,
    },
  }
}
