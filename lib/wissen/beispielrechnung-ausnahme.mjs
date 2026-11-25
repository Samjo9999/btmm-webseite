/**
 * Gezielte Public-Ausnahme für die Grundsicherung-Beispielrechnung
 * (Nutzer 25.11. 15:30, DS-Bot: eine gemeinsame Quelle für Guard und Laufzeit).
 * Nur Konzept v22.69.0, Zeilen 84–113, Chunks mit Präfix „Beispielrechnung:“.
 * Das Dokument steht nicht als Ganzes auf der Public-Allowlist.
 */

export const BEISPIELRECHNUNG_PREFIX = 'Beispielrechnung:'

export const GRUNDSICHERUNG_BEISPIEL = {
  rel: 'DOKUMENTE/07_BtMM_Konzept_v22_69_0.md',
  abschnitte: [
    'Das ehrliche Worst-Case-Szenario',
    'Der erste Schritt: eine Gewerbeanmeldung',
    'Die konkrete Rechnung — Grundsicherungs-Haushalt',
  ],
}

export function normalizeRel(rel) {
  return String(rel || '')
    .replace(/\\/g, '/')
    .replace(/^repos\/btmm-webseite\//, '')
}

export function istGrundsicherungBeispielabschnitt(chunk) {
  return (
    normalizeRel(chunk?.rel) === GRUNDSICHERUNG_BEISPIEL.rel &&
    GRUNDSICHERUNG_BEISPIEL.abschnitte.includes(chunk?.abschnitt)
  )
}

/** Laufzeit und Guard: nur der Abschnitt und nur mit Präfix. */
export function istGrundsicherungBeispielChunk(chunk) {
  return (
    istGrundsicherungBeispielabschnitt(chunk) &&
    String(chunk?.text || '').startsWith(BEISPIELRECHNUNG_PREFIX)
  )
}

export function ohneBeispielrechnungPrefix(text) {
  const t = String(text || '')
  if (t.startsWith(BEISPIELRECHNUNG_PREFIX)) {
    return t.slice(BEISPIELRECHNUNG_PREFIX.length).replace(/^\s+/, '')
  }
  return t
}

export function mitBeispielrechnungPrefix(text) {
  return `${BEISPIELRECHNUNG_PREFIX} ${ohneBeispielrechnungPrefix(text)}`
}

/**
 * Laufzeit- und Guard-Regel: Allowlist oder die gezielte Beispielrechnung
 * (Präfix plus genauer Abschnitt). Alles andere aus Dokument 07 fällt.
 */
export function istLaufzeitPublicChunk(chunk, allowed, blacklist = []) {
  if (istGrundsicherungBeispielChunk(chunk)) return true
  const rel = normalizeRel(chunk?.rel)
  if (!allowed || !allowed.has(rel)) return false
  if ((blacklist || []).some((b) => rel.includes(b))) return false
  return true
}
