import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { loadPublicCorpus } from '@/lib/wissen/loadCorpus'
import { formatExtractiveAnswer, searchChunks } from '@/lib/wissen/search'

/**
 * Support-Agent = öffentliche extractive Wissenssuche (Sp.144 / Prompt 116).
 * Dieselbe Retrieval-Logik wie wissen-mcp / Hobby-Wissen-Chat.
 * ANTHROPIC / generative Stufe: absichtlich AUS bis Nutzer-Ja.
 */

const requestSchema = z.object({
  frage: z.string().min(3, 'Frage zu kurz'),
  name: z.string().optional(),
  email: z.string().email().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = requestSchema.parse(body)

    const corpus = loadPublicCorpus()
    const hits = searchChunks(data.frage, corpus.chunks, 6)
    const { antwort, beantwortet, quellen } = formatExtractiveAnswer(hits)

    return NextResponse.json({
      antwort,
      beantwortet,
      quelle: 'suche',
      corpus: {
        source: corpus.source,
        docCount: corpus.docCount,
        chunkCount: corpus.chunks.length,
        builtAt: corpus.builtAt,
      },
      // abwärtskompatibel + neu mit pfad
      treffer: quellen.map((q) => ({
        dokument: q.dokument,
        abschnitt: q.abschnitt,
        pfad: q.pfad,
      })),
      quellen,
      // Hinweis für Clients: kein LLM
      generative: false,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Eingabe', details: err.errors },
        { status: 400 }
      )
    }
    console.error('Support agent error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
