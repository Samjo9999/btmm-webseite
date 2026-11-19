/**
 * BtMM Wissens-Retrieval (extractive) — Port der gemeinsamen Lib
 * (wissen-mcp/src/corpus.mjs). Scaleway-Generativ hinter Auth; öffentlich ohne LLM.
 */

export type WissenChunk = {
  title: string
  abschnitt: string
  text: string
  rel: string
  entwurf?: boolean
  score?: number
}

export type WissenQuelle = {
  dokument: string
  abschnitt: string
  pfad: string
  score?: number
}

const STOP = new Set(
  'und oder der die das ein eine ist sind was wie wer kann man bei für von mit den dem des sich nicht auch hat ich mich mir wir uns auf im in zu zur zum als ob wenn dann noch nur sehr mehr weniger alle alles einen einem einer'.split(
    ' '
  )
)

export function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[?!.,;:„"“”()[\]{}]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
}

export function searchChunks(
  query: string,
  chunks: WissenChunk[],
  limit = 6
): WissenChunk[] {
  const words = tokenize(query)
  if (!words.length) return []
  const hits: WissenChunk[] = []
  for (const ch of chunks) {
    const lower = (ch.text || '').toLowerCase()
    const head = (ch.abschnitt || '').toLowerCase()
    const title = (ch.title || '').toLowerCase()
    let score = 0
    for (const w of words) {
      try {
        const re = new RegExp(
          '\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          'gi'
        )
        const m = lower.match(re)
        if (m) score += m.length * 2
      } catch {
        /* ignore bad regex */
      }
      if (lower.includes(w)) score += 1
      if (head.includes(w)) score += 5
      if (title.includes(w)) score += 3
    }
    if (score > 0) hits.push({ ...ch, score })
  }
  hits.sort((a, b) => (b.score || 0) - (a.score || 0))
  const out: WissenChunk[] = []
  const seen = new Set<string>()
  for (const h of hits) {
    const k = `${h.rel}::${h.abschnitt}`
    if (seen.has(k)) continue
    seen.add(k)
    out.push(h)
    if (out.length >= limit) break
  }
  return out
}

export function formatExtractiveAnswer(
  hits: WissenChunk[]
): { antwort: string; beantwortet: boolean; quellen: WissenQuelle[] } {
  if (!hits.length) {
    return {
      antwort:
        'Dazu habe ich in den freigegebenen BtMM-Texten nichts Passendes gefunden. Die Wissensbasis kann Lücken haben — bei Bedarf persönlich nachfragen.',
      beantwortet: false,
      quellen: [],
    }
  }
  const top = hits.slice(0, 3)
  let antwort: string
  if (top.length === 1 || (top[0].score || 0) > (top[1]?.score || 0) * 1.8) {
    antwort = `Aus „${top[0].title}“ (${top[0].abschnitt}):\n\n${top[0].text}`
  } else {
    antwort =
      'Dazu finden sich mehrere Stellen:\n\n' +
      top
        .map(
          (h, i) =>
            `${i + 1}. **${h.title}** — ${h.abschnitt}\n${h.text.slice(0, 360)}${
              h.text.length > 360 ? '…' : ''
            }`
        )
        .join('\n\n')
  }
  antwort +=
    '\n\n—\nEntwurf/Vorschau · kann lückenhaft sein · keine Rechtsberatung. Generative KI ist absichtlich aus.'
  return {
    antwort,
    beantwortet: true,
    quellen: top.map((h) => ({
      dokument: h.title,
      abschnitt: h.abschnitt,
      pfad: h.rel,
      score: h.score,
    })),
  }
}
