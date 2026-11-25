/**
 * Unicode-Wortgrenzen für Tabu- und Sensibel-Regex (DS-Bot 25.11.2026).
 * \b hängt an ASCII-\w und trifft kyrillische, arabische oder Devanagari-Wörter nicht.
 */
export const WORT_VOR = String.raw`(?<![\p{L}\p{N}])`
export const WORT_NACH = String.raw`(?![\p{L}\p{N}])`

/** Baut eine Regex mit Unicode-Wortgrenzen und Flag u (weitere Flags optional). */
export function unicodeWortRegex(inner, flags = '') {
  const f = flags.includes('u') ? flags : `${flags}u`
  return new RegExp(`${WORT_VOR}(?:${inner})${WORT_NACH}`, f)
}
