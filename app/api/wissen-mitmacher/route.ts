import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { loadMitmacherCorpus } from '@/lib/wissen/loadCorpus'
import { formatExtractiveAnswer, searchChunks } from '@/lib/wissen/search'

/**
 * Mitmacher-Wissenssuche (Prompt 117).
 * Auth = Bearer JWT des BtMM-App-Supabase (gleiche Konten).
 * Corpus nur serverseitig. Extractive, kein LLM.
 */

const schema = z.object({ frage: z.string().min(3) })

const DISCLAIMER =
  'Keine Rechtsberatung und ersetzt keine Prüfung durch Prüfungsverband, Steuerberatung oder Anwalt. Stand ungesichert. ZAG/KWG nie als freigegeben. Vor eG: Mitmacher/Interessent.'

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || ''
    const m = /^Bearer\s+(\S+)/i.exec(auth.trim())
    if (!m) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      return NextResponse.json({ error: 'supabase env fehlt' }, { status: 500 })
    }

    const sb = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${m[1]}` } },
    })
    const { data: userData, error: userErr } = await sb.auth.getUser()
    if (userErr || !userData.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { frage } = schema.parse(body)
    const corpus = loadMitmacherCorpus()
    const hits = searchChunks(frage, corpus.chunks, 6)
    const { antwort, beantwortet, quellen } = formatExtractiveAnswer(hits)
    const abruf = new Date().toISOString().slice(0, 10)
    const antwortMit =
      antwort.replace(
        /Preview · kann lückenhaft sein · keine Rechtsberatung\. Generative KI absichtlich aus\./,
        `${DISCLAIMER} Abruf: ${abruf}. Extractive, kein LLM.`
      ) || antwort

    return NextResponse.json({
      antwort: antwortMit.includes('Keine Rechtsberatung')
        ? antwortMit
        : `${antwortMit}\n\n—\n${DISCLAIMER}\nAbruf: ${abruf}`,
      beantwortet,
      quellen,
      generative: false,
      rolle: 'mitmacher',
      corpus: {
        source: corpus.source,
        docCount: corpus.docCount,
        chunkCount: corpus.chunks.length,
        builtAt: corpus.builtAt,
      },
    })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: e.issues }, { status: 400 })
    }
    console.error('wissen-mitmacher', e)
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
