import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY nicht gesetzt')
    _stripe = new Stripe(key, { apiVersion: '2026-03-25.dahlia' })
  }
  return _stripe
}

export const PRODUKTE = {
  spende: {
    name: 'Spende an Back to Meaning Maximization',
    description: 'Unterstütze den Aufbau einer gerechteren Wirtschaft.',
  },
  erstsitzung: {
    name: 'Körperarbeit — Erstsitzung',
    description: 'Ersttermin inkl. ausführlichem Gespräch (90 Min.)',
    preis: 7000,
  },
  einzelsitzung: {
    name: 'Körperarbeit — Einzelsitzung',
    description: 'Reguläre Sitzung (60 Min.)',
    preis: 7000,
  },
  paket3: {
    name: 'Körperarbeit — 3er-Paket',
    description: '3 Sitzungen zum Vorteilspreis',
    preis: 18000,
  },
} as const
