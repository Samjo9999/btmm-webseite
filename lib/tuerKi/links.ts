/**
 * Sichere interne Links der Tür-KI.
 * Nur relative Pfade und Hosts b-t-m-m.com / www.b-t-m-m.com.
 * Kein javascript:, data:, fremde Domains. Kein HTML aus dem Modell.
 */
import { TUER_KI_SEITEN, TUER_SPRACHEN } from './konfig.ts'

/** Seitentitel (Deutsch; Dokumente sind ebenfalls deutsch). Ohne Rechtsform-Kürzel, ohne Du-Form. */
export const SEITEN_TITEL: Record<string, string> = {
  '/faq': 'Häufige Fragen',
  '/dokumente': 'Dokumente',
  '/mitmachen': 'Mitmachen',
  '/wissen': 'Wissen',
  '/so-funktionierts': 'So funktioniert es',
  '/was-du-sparst': 'Was Sie sparen',
  '/konzept': 'Konzept',
  '/konzept/wirtschaft': 'Wirtschaft',
  '/gruendung': 'Gründung',
  '/chronik': 'Chronik',
  '/offene-fragen': 'Offene Fragen',
  '/fuer-dich': 'Für Sie',
  '/fuer-dich/kunden': 'Für Kundinnen und Kunden',
  '/fuer-dich/berufseinstieg': 'Berufseinstieg',
  '/fuer-dich/lebensphasen': 'Lebensphasen',
  '/fuer-dich/ruhestand': 'Ruhestand',
  '/fuer-dich/unterstuetzen': 'Unterstützen',
}

/** Dateiname ohne .md -> kurzer Titel für den Linktext. */
export const DOKUMENT_TITEL: Record<string, string> = {
  '00-einfach-erklaert': 'BtMM einfach erklärt',
  '01-einfuehrung': 'Einführung',
  '02-aufruf-beteiligung': 'Aufruf zur Beteiligung',
  '03-einladung-gruendung': 'Einladung zur Gründung',
  '04-wirtschaften-anleitung': 'Wirtschaften im System',
  '05-gemeinschaftskultur': 'Leben im System',
  '06-gute-gruende': 'Gute Gründe',
  '07-konzept': 'Vollkonzept',
  '08-satzung': 'Satzung (Entwurf)',
  '08a-ordnungen': 'Ordnungen (Entwurf)',
  '11-handwerk-ergaenzung': 'Handwerk und Zulassungen',
  '12-handwerk-zulassungen': 'Handwerk, Zulassungen und Meisterpflicht',
  '13-ideen-horizonte': 'Ideen und Horizonte',
  '15-geschaeftsmodell': 'Geschäftsmodell (Entwurf)',
  '16-schnelle-einnahmen': 'Schnelle Einnahmen',
  '17-grosser-fahrplan': 'Der große Fahrplan',
  '18-demokratie-schluessel': 'Der Demokratie-Schlüssel',
  '19-soziale-zahlen': 'Soziale Zahlen',
  '20-berufe-ohne-abschluss': 'Berufe ohne Abschluss',
  '21-bildung-finanzieren': 'Bildung finanzieren',
  '22-heilen-schuetzen-vorbeugen': 'Heilen, Schützen, Vorbeugen',
  '23-ausfall-versorgung': 'Wenn jemand ausfällt',
  '24-partner-werden': 'Partner werden',
  '25-ehrliche-bilanz': 'Ehrliche Bilanz',
  '26-fairer-handel': 'Fairer Handel',
  '27-kreislauf': 'BtMM-Kreislauf',
  '28-aufnahme-kurz-erklaert': 'Aufnahme kurz erklärt',
  '29-der-keim': 'Der Keim',
  '30-gewerbe-katalog': 'Gewerbe-Katalog',
  '31-coin-ordnung': 'Coin-Ordnung (Entwurf)',
}

const SEITEN_SET = new Set<string>(TUER_KI_SEITEN)
const LOCALE_PFAD = new RegExp(`^/(${TUER_SPRACHEN.join('|')})(?=/|$)`)
const GEFAEHRLICH = /^(javascript|data|vbscript|file|blob):/i
const ERLAUBTE_HOSTS = new Set(['b-t-m-m.com', 'www.b-t-m-m.com'])

function dokumentSlugAusKurzform(kurz: string): string | null {
  if (DOKUMENT_TITEL[kurz]) return kurz
  const id = /^(\d{1,2}[a-z]?)$/i.exec(kurz)
  if (!id) return null
  const num = id[1].length === 1 && /^\d$/.test(id[1]) ? '0' + id[1] : id[1].toLowerCase()
  const treffer = Object.keys(DOKUMENT_TITEL).find((s) => s === num || s.startsWith(num + '-'))
  return treffer || null
}

/** Liefert den erlaubten internen Pfad (ohne Locale, Dokument-Kurzform aufgelöst) oder null. */
export function erlaubterPfad(raw: string): string | null {
  let s = String(raw || '').trim()
  if (!s || GEFAEHRLICH.test(s)) return null
  s = s.replace(/[),.;!?]+$/g, '')
  if (/^www\./i.test(s)) s = 'https://' + s
  const hostM = s.match(/^https?:\/\/([^/]+)/i)
  if (hostM) {
    const host = hostM[1].toLowerCase().replace(/:\d+$/, '')
    if (!ERLAUBTE_HOSTS.has(host)) return null
    s = s.replace(/^https?:\/\/[^/]+/i, '') || '/'
  } else if (/^\/\//.test(s) || /^[a-z][a-z0-9+.-]*:/i.test(s)) {
    return null
  }
  if (!s.startsWith('/')) return null
  if (s.startsWith('//')) return null
  s = s.split(/[?#]/)[0]
  try { s = decodeURIComponent(s) } catch { return null }
  if (s.includes('..') || s.includes('//') || s.includes('\\') || s.includes('\0')) return null
  if (!/^\/[a-z0-9/_-]*$/i.test(s)) return null
  const loc = s.match(LOCALE_PFAD)
  if (loc) s = s.slice(loc[0].length) || '/'
  if (s.length > 1) s = s.replace(/\/+$/, '')
  if (SEITEN_SET.has(s)) return s
  const dok = /^\/dokumente\/([a-z0-9-]+)$/i.exec(s)
  if (dok) {
    const slug = dokumentSlugAusKurzform(dok[1].toLowerCase())
    if (slug) return '/dokumente/' + slug
  }
  return null
}

export function linkTitel(pfad: string, vorgabe?: string): string {
  const p = erlaubterPfad(pfad) || pfad
  const vorg = String(vorgabe || '').trim()
  if (vorg && !GEFAEHRLICH.test(vorg) && !/https?:|www\.|javascript:/i.test(vorg) && vorg.length <= 80) {
    if (!/\beG\b/.test(vorg)) return vorg.replace(/\s+/g, ' ')
  }
  if (SEITEN_TITEL[p]) return SEITEN_TITEL[p]
  const dok = /^\/dokumente\/([a-z0-9-]+)$/i.exec(p)
  if (dok && DOKUMENT_TITEL[dok[1]]) return DOKUMENT_TITEL[dok[1]]
  return p
}

export type LinkTeil = { typ: 'text'; text: string } | { typ: 'link'; pfad: string; titel: string }

const MARKDOWN = /\[([^\]]+)\]\(([^)]+)\)/g
const URL = /\bhttps?:\/\/[^\s<>[\]()]+|\bwww\.[^\s<>[\]()]+/gi

function pfadMuster(): RegExp {
  const seiten = [...TUER_KI_SEITEN].sort((a, b) => b.length - a.length).map((s) => s.replace(/\//g, '\\/'))
  // /dokumente oder /dokumente/01 oder /dokumente/01-einfuehrung
  const dok = '\\/dokumente(?:\\/[A-Za-z0-9-]+)?'
  return new RegExp('(' + dok + '|' + seiten.filter((s) => s !== '\\/dokumente').join('|') + ')(?![A-Za-z0-9/_-])', 'g')
}

/** Zerlegt einen Antworttext in Text und sichere interne Links (Markdown, URL, nackter Pfad). */
export function parseAntwortMitLinks(text: string): LinkTeil[] {
  const roh = String(text || '')
  const belegt: { start: number; ende: number; teil: LinkTeil }[] = []

  function merke(start: number, ende: number, teil: LinkTeil) {
    if (belegt.some((b) => start < b.ende && ende > b.start)) return
    belegt.push({ start, ende, teil })
  }

  let m: RegExpExecArray | null
  const md = new RegExp(MARKDOWN.source, 'g')
  while ((m = md.exec(roh))) {
    const pfad = erlaubterPfad(m[2])
    if (pfad) merke(m.index, m.index + m[0].length, { typ: 'link', pfad, titel: linkTitel(pfad, m[1]) })
    else merke(m.index, m.index + m[0].length, { typ: 'text', text: (m[1] || '').trim() })
  }
  const urlRe = new RegExp(URL.source, 'gi')
  while ((m = urlRe.exec(roh))) {
    const pfad = erlaubterPfad(m[0])
    if (pfad) merke(m.index, m.index + m[0].length, { typ: 'link', pfad, titel: linkTitel(pfad) })
    else merke(m.index, m.index + m[0].length, { typ: 'text', text: '' })
  }
  const pfadRe = pfadMuster()
  while ((m = pfadRe.exec(roh))) {
    const pfad = erlaubterPfad(m[1])
    if (pfad) merke(m.index, m.index + m[0].length, { typ: 'link', pfad, titel: linkTitel(pfad) })
  }

  belegt.sort((a, b) => a.start - b.start)
  const teile: LinkTeil[] = []
  let i = 0
  for (const b of belegt) {
    if (b.start > i) teile.push({ typ: 'text', text: roh.slice(i, b.start) })
    teile.push(b.teil)
    i = b.ende
  }
  if (i < roh.length) teile.push({ typ: 'text', text: roh.slice(i) })
  return teile.filter((t) => t.typ === 'link' || t.text !== '')
}

export function hatInternenLink(text: string): boolean {
  return parseAntwortMitLinks(text).some((t) => t.typ === 'link')
}

export function ersteWeiterleitung(text: string): string | undefined {
  const l = parseAntwortMitLinks(text).find((t) => t.typ === 'link')
  return l && l.typ === 'link' ? l.pfad : undefined
}

/** Schreibt erlaubte Links fest als Markdown [Titel](/pfad); entfernt fremde URLs. */
export function normalisiereAntwortLinks(text: string): string {
  const teile = parseAntwortMitLinks(text)
  let s = teile.map((t) => t.typ === 'link' ? `[${t.titel}](${t.pfad})` : t.text).join('')
  s = s.replace(/[ \t]{2,}/g, ' ')
  s = s.replace(/\b(auf|unter|ueber|über|zu|bei|in|an)\s+vorbei\b/gi, 'vorbei')
  return s.replace(/[ \t]+\n/g, '\n').trim()
}

/** Href für den Client: Locale-Präfix (z. B. /de) plus interner Pfad, sonst null. */
export function sichererHref(raw: string, basis: string): string | null {
  const pfad = erlaubterPfad(raw)
  if (!pfad) return null
  const b = String(basis || '').replace(/\/+$/, '')
  if (!/^\/[a-z]{2}$/.test(b) && b !== '') return null
  return b + pfad
}
