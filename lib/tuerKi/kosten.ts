/**
 * Harter Kostendeckel der Tür-KI (Plan Tür-KI §4/§5). Zählt nur Token-Summen je Tag/Monat,
 * ohne Hash, Sitzung oder Inhalt. Vor jedem Aufruf wird der ungünstigste Fall
 * (geschätzte Eingabe + volle Ausgabe) gegen Tages- und Monatsdeckel geprüft.
 *
 * Eigener Kostendeckel, getrennt von S50 der Wissens-KI (kein Anteil an S50):
 * 0,50 €/Tag und 10 €/Monat, harter Stopp. Env darf die Werte senken, nicht über
 * die Obergrenze (0,50 / 10) anheben. In Scaleway gibt es keinen harten Euro-Deckel,
 * der den Verbrauch stoppt; der Stopp liegt im Code (plus optional Billing-Alerts).
 * Bei erreichtem Deckel gilt der Notbetrieb: kein Scaleway-Aufruf.
 *
 * Verbindlich über Instanzen, Kaltstarts und Deploys hinweg: persistenter Zähler
 * über Supabase-RPC (tuer_ki_kosten_reserviere / tuer_ki_kosten_korrigiere,
 * service_role). Der In-Memory-Zähler in dieser Datei und in globalThis gilt
 * nur als zusätzliche Bremse je Instanz. SQL in docs/tuer-ki/ (noch nicht anwenden).
 * Bei DB-Fehler: fail-closed, kein LLM-Aufruf. Einschalten der Tür-KI frühestens 01.12.2026.
 */

export const PREIS_EIN_EUR_PRO_MIO = 0.15
export const PREIS_AUS_EUR_PRO_MIO = 0.35

export type TuerDeckel = {
  tagEur: number
  monatEur: number
  warnAnteil: number
  maxEingabeTokens: number
  maxAusgabeTokens: number
  sparAusgabeTokens: number
}

export const DECKEL_STANDARD: TuerDeckel = {
  tagEur: 0.5,
  monatEur: 10,
  warnAnteil: 0.8,
  maxEingabeTokens: 6000,
  maxAusgabeTokens: 400,
  sparAusgabeTokens: 200,
}

export const DECKEL_OBERGRENZE = { tagEur: 0.5, monatEur: 10 } as const

function zahl(raw: string | undefined, standard: number, max: number): number {
  const n = Number(String(raw ?? '').replace(',', '.'))
  if (!Number.isFinite(n) || n < 0 || String(raw ?? '').trim() === '') return standard
  return Math.min(n, max)
}

export function deckelAusEnv(env: { TUER_KI_TAG_EUR?: string; TUER_KI_MONAT_EUR?: string }): TuerDeckel {
  return {
    ...DECKEL_STANDARD,
    tagEur: zahl(env.TUER_KI_TAG_EUR, DECKEL_STANDARD.tagEur, DECKEL_OBERGRENZE.tagEur),
    monatEur: zahl(env.TUER_KI_MONAT_EUR, DECKEL_STANDARD.monatEur, DECKEL_OBERGRENZE.monatEur),
  }
}

export function schaetzeTokens(text: string): number {
  return Math.ceil(String(text || '').length / 3.5)
}

export function kostenEur(ein: number, aus: number): number {
  return (ein * PREIS_EIN_EUR_PRO_MIO + aus * PREIS_AUS_EUR_PRO_MIO) / 1_000_000
}

export type TuerKostenZustand = {
  tag: string
  monat: string
  tagEur: number
  monatEur: number
  tagTokensEin: number
  tagTokensAus: number
}

/** UTC-Perioden, identisch mit dem persistenten Zähler. */
export function periodenUtc(now = Date.now()): { tag: string; monat: string } {
  const d = new Date(now).toISOString()
  return { tag: d.slice(0, 10), monat: d.slice(0, 7) }
}

export function neuerKostenZustand(now = Date.now()): TuerKostenZustand {
  const { tag, monat } = periodenUtc(now)
  return { tag, monat, tagEur: 0, monatEur: 0, tagTokensEin: 0, tagTokensAus: 0 }
}

function rollen(z: TuerKostenZustand, now: number) {
  const p = periodenUtc(now)
  if (p.monat !== z.monat) {
    z.monat = p.monat
    z.monatEur = 0
  }
  if (p.tag !== z.tag) {
    z.tag = p.tag
    z.tagEur = 0
    z.tagTokensEin = 0
    z.tagTokensAus = 0
  }
}

export type DeckelErgebnis =
  | { erlaubt: true; maxTokens: number; spar: boolean }
  | { erlaubt: false; grund: 'tag' | 'monat' | 'anfrage' }

export function pruefeDeckel(
  z: TuerKostenZustand,
  deckel: TuerDeckel,
  geschaetztEin: number,
  now = Date.now()
): DeckelErgebnis {
  rollen(z, now)
  if (geschaetztEin > deckel.maxEingabeTokens) return { erlaubt: false, grund: 'anfrage' }
  const spar = z.tagEur >= deckel.warnAnteil * deckel.tagEur || z.monatEur >= deckel.warnAnteil * deckel.monatEur
  const maxTokens = spar ? deckel.sparAusgabeTokens : deckel.maxAusgabeTokens
  const schlimmstenfalls = kostenEur(geschaetztEin, maxTokens)
  if (z.tagEur + schlimmstenfalls > deckel.tagEur) return { erlaubt: false, grund: 'tag' }
  if (z.monatEur + schlimmstenfalls > deckel.monatEur) return { erlaubt: false, grund: 'monat' }
  return { erlaubt: true, maxTokens, spar }
}

export function bucheVerbrauch(z: TuerKostenZustand, ein: number, aus: number, now = Date.now()) {
  rollen(z, now)
  const eur = kostenEur(ein, aus)
  z.tagEur += eur
  z.monatEur += eur
  z.tagTokensEin += ein
  z.tagTokensAus += aus
}
