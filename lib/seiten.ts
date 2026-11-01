// Zentrales Seiten-Register (Seitenstruktur SEO & AEO Desk, 27.10.2026).
// Neue Seiten: hier eintragen, Ordner unter app/[locale]/ anlegen, fertig.
// Titel, Meta-Description, Canonical und interne Links kommen alle von hier.
import type { Metadata } from 'next'
import { BRAND_FULL } from '@/lib/brand'

export const SITE_URL = 'https://b-t-m-m.com'
export const KONTAKT_MAIL = 'office.btmm@gmail.com'

export type Seite = {
  pfad: string
  titel: string
  beschreibung: string
  /** kurzer Linktext für Karten und Navigation */
  kurz: string
  bereich: 'kern' | 'wissen' | 'geplant'
}

export const SEITEN = {
  start: {
    pfad: '/',
    titel: 'Teilen, was allein teuer ist – Genossenschaft in Freiburg',
    beschreibung:
      'BtMM: Menschen in Freiburg teilen Einkauf, Auto, Raum und Werkzeug und gründen später eine Genossenschaft. Klein anfangen ab 3 Leuten, kein Investment.',
    kurz: 'Start',
    bereich: 'kern',
  },
  soFunktionierts: {
    pfad: '/so-funktionierts',
    titel: "So funktioniert's – in drei Stufen zur Genossenschaft",
    beschreibung:
      'Wie gründet man eine kleine Genossenschaft? Bei BtMM in drei Stufen: selbstständig ab 3 Leuten, gemeinsam einkaufen und teilen, dann die eG gründen.',
    kurz: "So funktioniert's",
    bereich: 'kern',
  },
  wasDuSparst: {
    pfad: '/was-du-sparst',
    titel: 'Was du sparst – Rechenbeispiele für gemeinsames Einkaufen und Teilen',
    beschreibung:
      'Lohnt sich gemeinsames Einkaufen und Autoteilen? Rechenbeispiele aus dem BtMM-Rechner: rund 240 € im Monat zu dritt – als Rechnung, nicht als Zusage.',
    kurz: 'Was du sparst',
    bereich: 'kern',
  },
  kosten: {
    pfad: '/kosten',
    titel: 'Kosten – kein Investment, Anteil 100 € erst ab Gründung',
    beschreibung:
      'Was kostet ein Genossenschaftsanteil bei BtMM? Kein Investment, keine Vorkasse. Erst mit der eG 100 € Anteil, auf Wunsch in Raten ab 10 €.',
    kurz: 'Kosten',
    bereich: 'kern',
  },
  offeneFragen: {
    pfad: '/offene-fragen',
    titel: 'Offene Fragen – was bei BtMM noch nicht geklärt ist',
    beschreibung:
      'Ehrlich offen: Haftung am Anfang, Rückzahlung des Anteils, Rente und Lohn. Was BtMM noch mit Fachleuten klärt, bevor mehr Menschen dazukommen.',
    kurz: 'Offene Fragen',
    bereich: 'kern',
  },
  backToBalance: {
    pfad: '/angebote/back-to-balance',
    titel: 'Back to Balance – Körperarbeit in Freiburg',
    beschreibung:
      'Back to Balance: Körperarbeit in Freiburg als Teil von BtMM. Ablauf, Kontakt und wie das Angebot zur Genossenschaft gehört – ohne Heilversprechen.',
    kurz: 'Back to Balance',
    bereich: 'kern',
  },
  faq: {
    pfad: '/faq',
    titel: 'FAQ – Häufige Fragen zu BtMM',
    beschreibung:
      'Kurze Antworten zu BtMM: Haftung, Anteil und Kündigung, BtMM-Coin, Mitmachen ab 18 und was noch offen ist.',
    kurz: 'FAQ',
    bereich: 'kern',
  },
  mitmachen: {
    pfad: '/mitmachen',
    titel: 'Mitmachen – komm zu einem offenen Abend',
    beschreibung:
      'Mitmachen bei BtMM in Freiburg: Komm zu einem offenen Abend oder schreib uns, dass du dabei sein willst. Kein Investment, keine Vorkasse.',
    kurz: 'Mitmachen',
    bereich: 'kern',
  },
  wissen: {
    pfad: '/wissen',
    titel: 'Wissen – Ratgeber zu Genossenschaft, Teilen und Gemeinschaft',
    beschreibung:
      'Ratgeber von BtMM: Genossenschaft gründen, gemeinsam einkaufen, Auto und Werkzeug teilen, gemeinschaftlich wohnen und ein Glossar der Begriffe.',
    kurz: 'Wissen',
    bereich: 'wissen',
  },
  glossar: {
    pfad: '/wissen/glossar',
    titel: 'Glossar – Begriffe von BtMM einfach erklärt',
    beschreibung:
      'Zelle, Anteil, eG, Kaskade, BtMM-Coin: die wichtigsten Begriffe von BtMM kurz erklärt, nach der Satzung v7.32.0.',
    kurz: 'Glossar',
    bereich: 'wissen',
  },
} as const satisfies Record<string, Seite>

export type SeitenSchluessel = keyof typeof SEITEN

/** Die acht Kernseiten in Navigationsreihenfolge */
export const KERNSEITEN: SeitenSchluessel[] = [
  'soFunktionierts',
  'wasDuSparst',
  'kosten',
  'offeneFragen',
  'backToBalance',
  'faq',
  'mitmachen',
]

export function href(locale: string, s: SeitenSchluessel) {
  const p = SEITEN[s].pfad
  return p === '/' ? `/${locale}` : `/${locale}${p}`
}

export function absUrl(s: SeitenSchluessel, locale = 'de') {
  return `${SITE_URL}${href(locale, s)}`
}

/** Metadata (Titel, Description, Canonical, OpenGraph) aus dem Register */
export function seitenMeta(s: SeitenSchluessel, locale = 'de'): Metadata {
  const seite = SEITEN[s]
  return {
    title: { absolute: `${seite.titel} | ${BRAND_FULL}` },
    description: seite.beschreibung,
    alternates: { canonical: absUrl(s, locale) },
    openGraph: { title: seite.titel, description: seite.beschreibung, url: absUrl(s, locale), locale: 'de_DE' },
  }
}

/** BreadcrumbList-JSON-LD für eine Seite */
export function breadcrumbLd(kette: SeitenSchluessel[], locale = 'de') {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: kette.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: SEITEN[s].kurz,
      item: absUrl(s, locale),
    })),
  }
}

export const ORGANISATION_LD = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organisation`,
  name: BRAND_FULL,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  email: KONTAKT_MAIL,
  address: { '@type': 'PostalAddress', addressLocality: 'Freiburg im Breisgau', addressCountry: 'DE' },
  description: 'Geplante Genossenschaft (eG in Gründung) in Freiburg: teilen, was allein teuer ist.',
}
