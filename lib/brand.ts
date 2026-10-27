// Zentrale Markenkonstanten (Rebranding BtMM). Schreibweise entschieden: „Maximization“ mit z.
export const BRAND_SPELLING = 'Maximization'
export const BRAND_SHORT = 'BtMM'
export const BRAND_LONG = `Back to Meaning ${BRAND_SPELLING}`
export const BRAND_FULL = `${BRAND_SHORT} – ${BRAND_LONG}`
export const BRAND_UNIVERSE = `${BRAND_SHORT} Universe`

// Markenfarben (am Logo gemessen), gespiegelt als CSS-Variablen --btmm-* in app/globals.css
export const BRAND_COLORS = {
  primary: '#9e57a4',
  hell: '#ddcddf',
  dunkel: '#780268',
  akzent: '#b058b3',
  weiss: '#faf9f9',
} as const
