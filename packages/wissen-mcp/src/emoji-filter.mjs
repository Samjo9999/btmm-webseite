/**
 * Emoji-Filter fuer Wissens-Index und Antworten (Nutzerregel 25.11.:
 * keine Emojis in App und Webseite). Quelldokumente bleiben unveraendert,
 * ersetzt wird erst beim Build bzw. vor der Ausgabe.
 *
 * Mapping:
 *   U+2610            -> [offen]
 *   U+2713 U+2714 U+2705 -> [erledigt]
 *   U+274C            -> [nein]
 *   U+26A0            -> [Achtung]
 *   U+1F7E1           -> [prüfen]
 *   U+1F7E2           -> [ok]
 *   U+1F534           -> [kritisch]
 *   U+FE0F            -> gestrichen
 *   alle uebrigen Emojis (U+1F300-1FAFF, U+2600-27BF und ein paar
 *   weitere reine Emoji-Bloecke) -> entfernt
 * Typografische Pfeile (U+2190 ff.) bleiben. Ausnahme im Bereich 2600-27BF:
 * die eingekreisten Ziffern U+2776-2793 sind keine Emojis und bleiben.
 *
 * Nach der Abbildung: folgt direkt dasselbe Wort (Gross/klein egal,
 * optional mit Doppelpunkt), bleibt nur das Wort.
 * Anschliessend Glaettung: "( " -> "(", "[ " -> "[", Leerzeichen vor
 * ).,!?;:] , ", ," -> ",", doppelte Leerzeichen, Abstand zwischen zwei
 * Etiketten, [[x]] -> [x].
 *
 * Der Code selbst enthaelt keine Emoji-Zeichen (nur \u-Escapes).
 */

export const EMOJI_MAPPING = Object.freeze({
  '\u2610': '[offen]',
  '\u2713': '[erledigt]',
  '\u2714': '[erledigt]',
  '\u2705': '[erledigt]',
  '\u274C': '[nein]',
  '\u26A0': '[Achtung]',
  '\u{1F7E1}': '[prüfen]',
  '\u{1F7E2}': '[ok]',
  '\u{1F534}': '[kritisch]',
})

const LABEL_WORTE = [...new Set(Object.values(EMOJI_MAPPING).map((s) => s.slice(1, -1)))]
const DOPPELUNG_RX = new RegExp(
  `\\[(${LABEL_WORTE.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\]:?[ \\t]+([\\p{L}]+)(:)?`,
  'giu',
)

// Bereiche aus dem Auftrag plus reine Emoji-Bloecke (Flaggen, Karten, Uhr, Wiedergabe, Sterne).
const RANGES =
  '\\u{1F000}-\\u{1F2FF}\\u{1F300}-\\u{1FAFF}\\u2600-\\u27BF' +
  '\\u231A\\u231B\\u23E9-\\u23F3\\u23F8-\\u23FA\\u2B1B\\u2B1C\\u2B50\\u2B55'

/** Ein einzelnes Emoji-Zeichen (ohne FE0F, ohne ZWJ). Ziffern-Ausnahme siehe oben. */
const EMOJI_CHAR = `(?![\\u2776-\\u2793])[${RANGES}]`
const EMOJI_RX_SRC = EMOJI_CHAR

/** Treffer-Muster: alle Emojis, die entfernt oder ersetzt werden (global). */
export const EMOJI_RX = new RegExp(EMOJI_RX_SRC, 'gu')
/** Hilfszeichen, die nur mit Emojis vorkommen: Variation Selector-16, Keycap. */
const HILFSZEICHEN_RX = /[\uFE0F\u20E3]/g
/** ZWJ nur dort entfernen, wo es Emojis verbindet. */
const ZWJ_RX = new RegExp(`\\u200D(?=${EMOJI_RX_SRC})|(?<=${EMOJI_RX_SRC})\\u200D`, 'gu')
const ANY_RX = new RegExp(`${EMOJI_RX_SRC}|[\\uFE0F\\u20E3]`, 'u')

/** Zaehlt Zeichen, die der Filter entfernen oder ersetzen wuerde (inkl. U+FE0F). */
export function zaehleEmojis(text) {
  const s = String(text ?? '')
  return (s.match(EMOJI_RX) || []).length + (s.match(HILFSZEICHEN_RX) || []).length
}

export function hatEmojis(text) {
  return ANY_RX.test(String(text ?? ''))
}

function gleicheWortDoppelungEntfernen(s) {
  return s.replace(DOPPELUNG_RX, (all, label, wort, colon = '') => {
    if (label.toLocaleLowerCase('de') === wort.toLocaleLowerCase('de')) {
      return wort + (colon || '')
    }
    return all
  })
}

const ETIKETT_INNER = LABEL_WORTE.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
const ETIKETT = `\\[(?:${ETIKETT_INNER})\\]`
const ETIKETT_NACH_WORT_RX = new RegExp(`([\\p{L}\\p{N}])(${ETIKETT})`, 'gu')
const ETIKETT_VOR_WORT_RX = new RegExp(`(${ETIKETT})([\\p{L}\\p{N}])`, 'gu')
const ZWEI_ETIKETTEN_RX = new RegExp(`(${ETIKETT})(${ETIKETT})`, 'g')
const DOPPELTE_KLAMMER_RX = new RegExp(`\\[\\[(${ETIKETT_INNER})\\]\\]`, 'g')

function glaette(s) {
  let prev
  do {
    prev = s
    s = s.replace(DOPPELTE_KLAMMER_RX, '[$1]')
    s = s.replace(ZWEI_ETIKETTEN_RX, '$1 $2')
    s = s.replace(ETIKETT_NACH_WORT_RX, '$1 $2')
    s = s.replace(ETIKETT_VOR_WORT_RX, '$1 $2')
    s = s.replace(/,[ \t]*,/g, ',')
    s = s.replace(/[ \t]+([).,!?;:\]])/g, '$1')
    s = s.replace(/\([ \t]+/g, '(')
    s = s.replace(/\[[ \t]+/g, '[')
    s = s.replace(/[ \t]{2,}/g, ' ')
  } while (s !== prev)
  return s
}

function ersetzeZeile(zeile) {
  if (!ANY_RX.test(zeile)) return zeile
  const einzug = /^[ \t]*/.exec(zeile)[0]
  let s = zeile.replace(HILFSZEICHEN_RX, '').replace(ZWJ_RX, '')
  s = s.replace(EMOJI_RX, (m, offset, ganz) => {
    const ersatz = EMOJI_MAPPING[m]
    if (ersatz === undefined) return ''
    const next = ganz.charAt(offset + m.length)
    return /[\p{L}\p{N}]/u.test(next) ? `${ersatz} ` : ersatz
  })
  s = gleicheWortDoppelungEntfernen(s)
  const koerper = glaette(s.trim())
  return koerper ? einzug + koerper : ''
}

/** Entfernt bzw. ersetzt Emojis in einem String. Nur geaenderte Zeilen werden geglaettet. */
export function entferneEmojis(text) {
  if (typeof text !== 'string' || !text) return text
  if (!ANY_RX.test(text)) return text
  return text.split('\n').map(ersetzeZeile).join('\n')
}

/** Wendet den Filter rekursiv auf alle Strings (Werte) in Objekten/Arrays an; liefert eine Kopie. */
export function filterEmojisTief(wert) {
  if (typeof wert === 'string') return entferneEmojis(wert)
  if (Array.isArray(wert)) return wert.map(filterEmojisTief)
  if (wert && typeof wert === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(wert)) out[k] = filterEmojisTief(v)
    return out
  }
  return wert
}

/** Zaehlt Emoji-Treffer ueber alle Strings eines Objekts (Werte, nicht Schluessel). */
export function zaehleEmojisTief(wert) {
  if (typeof wert === 'string') return zaehleEmojis(wert)
  if (Array.isArray(wert)) return wert.reduce((n, v) => n + zaehleEmojisTief(v), 0)
  if (wert && typeof wert === 'object') {
    return Object.values(wert).reduce((n, v) => n + zaehleEmojisTief(v), 0)
  }
  return 0
}
