/**
 * Sichtbarkeit und Scroll-Ziel für den schwebenden „Mehr erfahren“-Knopf
 * (erweitert den ScrollHint aus beb1d8e / PR #39).
 * Reine Funktionen, ohne DOM-Zwang — für Tests und UI.
 */

export const ENDE_SCHWELLE_PX = 80
export const KOPF_OFFSET_PX = 96

export const LABELS = {
  de: 'Mehr erfahren',
  en: 'Learn more',
  zh: '了解更多',
  es: 'Más información',
  hi: 'और जानें',
  ar: 'اعرف المزيد',
  bn: 'আরও জানুন',
  pt: 'Saiba mais',
  ru: 'Узнать больше',
  ja: '詳しく見る',
  fr: 'En savoir plus',
}

export const ARIA = {
  de: 'Mehr erfahren, weiter nach unten scrollen',
  en: 'Learn more, scroll down',
  zh: '了解更多，向下滚动',
  es: 'Más información, bajar en la página',
  hi: 'और जानें, नीचे स्क्रॉल करें',
  ar: 'اعرف المزيد، مرّر إلى الأسفل',
  bn: 'আরও জানুন, নিচে স্ক্রোল করুন',
  pt: 'Saiba mais, rolar para baixo',
  ru: 'Узнать больше, прокрутить вниз',
  ja: '詳しく見る、下にスクロール',
  fr: 'En savoir plus, défiler vers le bas',
}

export function localeKurz(lang) {
  return String(lang || 'de').slice(0, 2).toLowerCase()
}

export function labelFuer(lang) {
  return LABELS[localeKurz(lang)] || LABELS.de
}

export function ariaFuer(lang) {
  return ARIA[localeKurz(lang)] || ARIA.de
}

export function istScrollbar(scrollHeight, innerHeight) {
  return Number(scrollHeight) > Number(innerHeight) + 1
}

export function istAmEnde(scrollY, innerHeight, scrollHeight, schwelle = ENDE_SCHWELLE_PX) {
  return Number(innerHeight) + Number(scrollY) >= Number(scrollHeight) - schwelle
}

/**
 * @param {{ scrollHeight: number, innerHeight: number, scrollY: number, gesperrt?: boolean }} s
 */
export function sollSichtbar(s) {
  if (s.gesperrt) return false
  return istScrollbar(s.scrollHeight, s.innerHeight) && !istAmEnde(s.scrollY, s.innerHeight, s.scrollHeight)
}

export function reduzierteBewegung(matchMedia) {
  try {
    const fn = matchMedia || (typeof window !== 'undefined' ? window.matchMedia.bind(window) : null)
    return !!(fn && fn('(prefers-reduced-motion: reduce)').matches)
  } catch {
    return false
  }
}

/** Mindest-Fortschritt, sonst gilt der Abschnitt als schon erreicht. */
export const SCROLL_SCHWELLE_PX = 48

/**
 * Nächster Abschnitt unterhalb der aktuellen Position, sonst etwa 0,8 Viewport-Höhen.
 * Abschnitte, deren Ziel (top − Kopf) nicht über scrollY + Schwelle liegt, werden übersprungen —
 * sonst bleibt der Sprung bei 0 hängen, wenn der erste Block noch im Kopfbereich sitzt.
 * @param {{ scrollY: number, innerHeight: number, scrollHeight: number, abschnittTops?: number[], kopfOffset?: number }} s
 */
export function naechsterScrollY(s) {
  const scrollY = Number(s.scrollY) || 0
  const innerHeight = Number(s.innerHeight) || 0
  const scrollHeight = Number(s.scrollHeight) || 0
  const max = Math.max(0, scrollHeight - innerHeight)
  const kopf = s.kopfOffset == null ? KOPF_OFFSET_PX : s.kopfOffset
  const tops = (s.abschnittTops || []).map(Number).filter((n) => Number.isFinite(n)).sort((a, b) => a - b)
  const naechster = tops.find((t) => t - kopf > scrollY + SCROLL_SCHWELLE_PX)
  if (naechster != null) {
    return Math.min(max, Math.max(0, naechster - kopf))
  }
  return Math.min(max, scrollY + Math.round(innerHeight * 0.8))
}

/** Feste/sticky Leisten am unteren Rand (volle Breite oder links), Höhe in px. Rechte FABs werden ignoriert. */
export function untererAbstand(rects, innerWidth, innerHeight) {
  let lift = 0
  for (const r of rects || []) {
    if (!r) continue
    const top = r.top
    const height = r.height
    const left = r.left
    const width = r.width
    if (!(height > 0) || top > innerHeight - 8) continue
    if (top + height < innerHeight - 8) continue
    if (left > innerWidth * 0.5) continue
    if (width > innerWidth * 0.35) {
      lift = Math.max(lift, innerHeight - top)
    }
  }
  return lift
}

export const ABSCHNITT_SELEKTOR =
  'main h2, main section, main .btmm-abschnitt, main .btmm-kopf, [data-mehr-erfahren-abschnitt], footer'

export function sammleAbschnittTops(doc, scrollY) {
  const y0 = scrollY == null ? (typeof window !== 'undefined' ? window.scrollY : 0) : scrollY
  const list = doc.querySelectorAll(ABSCHNITT_SELEKTOR)
  const tops = []
  for (const el of list) {
    const r = el.getBoundingClientRect()
    if (r.height < 24) continue
    tops.push(r.top + y0)
  }
  return tops
}

export function sammleUntereLeisten(doc, innerWidth, innerHeight, eigen) {
  const rects = []
  const knoten = doc.querySelectorAll('body *')
  for (const el of knoten) {
    if (el === eigen || (eigen && eigen.contains(el))) continue
    if (el.closest && el.closest('[data-scroll-hint]')) continue
    const st = doc.defaultView ? doc.defaultView.getComputedStyle(el) : null
    if (!st || (st.position !== 'fixed' && st.position !== 'sticky')) continue
    if (st.display === 'none' || st.visibility === 'hidden') continue
    const r = el.getBoundingClientRect()
    rects.push(r)
  }
  return untererAbstand(rects, innerWidth, innerHeight)
}

/** Abstand, damit der Knopf über einem im Viewport sichtbaren Element (z. B. footer) sitzt. */
export function liftUeberElement(elementTop, innerHeight, extra = 8) {
  if (elementTop == null || !Number.isFinite(elementTop)) return 0
  if (elementTop >= innerHeight) return 0
  return Math.max(0, innerHeight - elementTop + extra)
}
