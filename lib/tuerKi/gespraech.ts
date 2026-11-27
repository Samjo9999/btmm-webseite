/**
 * Gesprächsregeln der Tür-KI nach der Modell-Antwort:
 * klare Absicht sofort bedienen, höchstens eine Rückfrage, keine Floskel-Entschuldigungen,
 * schon die erste Antwort enthält einen internen Link (Standard: Einführung).
 */
import type { TuerSprache } from './konfig.ts'
import { ersteWeiterleitung, hatInternenLink } from './links.ts'
import { hatRueckfrage } from './filter.ts'

const MEHR_ERFAHREN = /mehr erfahren|mehr (darüber|dazu|wissen)|weitere information|tell me more|know more|en savoir plus|saber m[aá]s|saber mais|узнать больше|معرفة المزيد|और जान|আরও জান|もっと知|了解更多|mehr (über|zu) (die |das |der |btmm)|was ist btmm|worum geht/i
const LINK_WUNSCH = /verlink|verweisen sie|schicken sie (mir )?(den |die )?link|den link|die seite|dokumentenseite|direkt( den link)?|zeig(en)? sie (mir )?(die seite|den link)|link (bitte|schicken|senden)|send (me )?the link|give me the link|lien|enlace|ссылк|رابط|लिंक|লিঙ্ক|リンク|链接/i

const FLOSKEL = /(?:^|[.!?]\s+)(?:entschuldigen sie[^.?!\n]{0,90}(?:missverst[äa]ndnis|falsch verstanden|umst[äa]nde?)[^.?!\n]{0,30}[.!?]\s*)/gi
const FLOSKEL_ANFANG = /^(?:entschuldigen sie[^.?!\n]{0,90}(?:missverst[äa]ndnis|falsch verstanden|umst[äa]nde?)[^.?!\n]{0,30}[.!?]\s*)/i
const FLOSKEL_EN = /(?:sorry|i(?:'m| am) sorry)[^.?!\n]{0,80}misunderstand[^.?!\n]{0,30}[.!?]\s*/gi

export const STANDARD_LINK_PFAD = '/dokumente/01-einfuehrung'

/** Kurzer Hinweis mit Einführungslink, wenn die Antwort noch keinen internen Link hat. */
export const STANDARD_LINK_SATZ: Record<TuerSprache, string> = {
  de: 'Eine kurze Einführung (rund zehn Minuten) finden Sie unter [Einführung](/dokumente/01-einfuehrung).',
  en: 'A short introduction (about ten minutes) is available at [Introduction](/dokumente/01-einfuehrung).',
  fr: 'Une courte introduction (environ dix minutes) se trouve sous [Introduction](/dokumente/01-einfuehrung).',
  es: 'Una breve introducción (unos diez minutos) está en [Introducción](/dokumente/01-einfuehrung).',
  pt: 'Uma breve introdução (cerca de dez minutos) está em [Introdução](/dokumente/01-einfuehrung).',
  ru: 'Краткое введение (около десяти минут) — в [Einführung](/dokumente/01-einfuehrung).',
  ar: 'مقدمة قصيرة (نحو عشر دقائق) تجدونها تحت [Einführung](/dokumente/01-einfuehrung).',
  hi: 'एक संक्षिप्त परिचय (लगभग दस मिनट) [Einführung](/dokumente/01-einfuehrung) पर है।',
  bn: 'একটি সংক্ষিপ্ত ভূমিকা (প্রায় দশ মিনিট) আছে [Einführung](/dokumente/01-einfuehrung)-এ।',
  ja: '短い導入（約10分）は [Einführung](/dokumente/01-einfuehrung) にあります。',
  zh: '一份简短介绍（约十分钟）见 [Einführung](/dokumente/01-einfuehrung)。',
}

export function erkenntMehrErfahren(text: string): boolean {
  return MEHR_ERFAHREN.test(String(text || ''))
}

export function erkenntLinkWunsch(text: string): boolean {
  return LINK_WUNSCH.test(String(text || ''))
}

export function hatKlareAbsicht(verlauf: { rolle: string; text: string }[]): boolean {
  return verlauf.filter((n) => n.rolle === 'user').some((n) => erkenntMehrErfahren(n.text) || erkenntLinkWunsch(n.text))
}

export function entferneFloskeln(text: string): string {
  let t = String(text || '')
  t = t.replace(FLOSKEL_ANFANG, '')
  t = t.replace(FLOSKEL, '. ')
  t = t.replace(FLOSKEL_EN, '')
  return t.replace(/^[.\s]+/, '').replace(/\s{2,}/g, ' ').trim()
}

/** Letzten Fragesatz entfernen, wenn davor noch ein Aussage-Satz steht. */
export function entferneSchlussfrage(text: string): string {
  const t = String(text || '').trim()
  const m = t.match(/^(.*?[.!])\s+([^.!?\n][^?]*\?\s*)$/)
  if (m && m[1].trim()) return m[1].trim()
  return t
}

export function anzahlRueckfragen(verlauf: { rolle: string; text: string }[]): number {
  return verlauf.filter((n) => n.rolle === 'assistant' && hatRueckfrage(n.text)).length
}

export function sichereDirektlieferung(
  antwort: string,
  verlauf: { rolle: string; text: string }[],
  sprache: TuerSprache,
): { text: string; weiterleitung?: string } {
  let text = entferneFloskeln(antwort)
  const klar = hatKlareAbsicht(verlauf)
  const schonGefragt = anzahlRueckfragen(verlauf) >= 1
  if ((klar || schonGefragt) && hatRueckfrage(text)) text = entferneSchlussfrage(text)
  if (!hatInternenLink(text)) {
    const satz = STANDARD_LINK_SATZ[sprache] || STANDARD_LINK_SATZ.de
    text = text ? (text.replace(/[.!?]?$/, (z) => z || '.') + ' ' + satz) : satz
  }
  return { text: text.trim(), weiterleitung: ersteWeiterleitung(text) }
}
