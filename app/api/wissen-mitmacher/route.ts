import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { loadMitmacherCorpus } from '@/lib/wissen/loadCorpus'
import { formatExtractiveAnswer, searchChunks, type WissenChunk } from '@/lib/wissen/search'

/**
 * Mitmacher-Wissenssuche (Prompt 117).
 * Auth = Bearer JWT App-Supabase. Corpus serverseitig.
 * Extractive immer; Generativ (Scaleway) wenn SCALEWAY_SECRET_KEY + generative:true.
 */

const schema = z.object({
  frage: z.string().min(3),
  generative: z.boolean().optional(),
  mode: z.string().optional(),
})

const DISCLAIMER =
  'Keine Rechtsberatung und ersetzt keine Prüfung durch Prüfungsverband, Steuerberatung oder Anwalt. Stand ungesichert. ZAG/KWG nie als freigegeben. Vor eG: Mitmacher/Interessent.'

const LABEL_ENTWURF = 'Entwurf, noch nicht beschlossen'
const SCALEWAY_URL = 'https://api.scaleway.ai/v1/chat/completions'
const SCALEWAY_MODEL = 'mistral-small-3.2-24b-instruct-2506'

function buildContext(hits: WissenChunk[]): string {
  return hits
    .slice(0, 5)
    .map((h, i) => {
      const label = (h as { entwurf?: boolean }).entwurf
        ? ` [${LABEL_ENTWURF}]`
        : ''
      return `[${i + 1}] ${h.title}${label} — ${h.abschnitt} (${h.rel})\n${h.text.slice(0, 1200)}`
    })
    .join('\n\n')
}

async function generateScaleway(
  frage: string,
  hits: WissenChunk[],
  abruf: string,
  secret: string
): Promise<string | null> {
  if (!hits.length) return null
  const system =
    `Du bist der BtMM-Mitmacher-Assistent (Genossenschaft Freiburg). Antworte auf Deutsch, knapp und klar.\n` +
    `Nutze NUR den gelieferten Corpus-Kontext. Wenn der Kontext nicht reicht: sag es und rate nicht.\n` +
    `Pflicht: ${DISCLAIMER}\n` +
    `Entwürfe immer mit Label „${LABEL_ENTWURF}“ kennzeichnen. Behaupte nie, ZAG/KWG sei freigegeben.\n` +
    `Am Ende: kurze Quellenliste (Dokument + Abschnitt). Abruf-Datum: ${abruf}.`
  try {
    const res = await fetch(SCALEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        model: SCALEWAY_MODEL,
        temperature: 0.2,
        max_tokens: 900,
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: `Frage: ${frage}\n\nCorpus-Kontext:\n${buildContext(hits)}`,
          },
        ],
      }),
    })
    if (!res.ok) {
      console.error('scaleway', res.status, await res.text())
      return null
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const text = data?.choices?.[0]?.message?.content
    if (typeof text !== 'string' || !text.trim()) return null
    let antwort = text.trim()
    if (!antwort.includes('Keine Rechtsberatung')) {
      antwort += `\n\n—\n${DISCLAIMER}\nAbruf: ${abruf} · Scaleway ${SCALEWAY_MODEL}`
    }
    return antwort
  } catch (e) {
    console.error('scaleway', e)
    return null
  }
}

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
    const parsed = schema.parse(body)
    const frage = parsed.frage
    const wantGen =
      parsed.generative === true ||
      parsed.mode === 'generative' ||
      parsed.mode === 'generativ'

    const corpus = loadMitmacherCorpus()
    const hits = searchChunks(frage, corpus.chunks, 6)
    const { antwort, beantwortet, quellen } = formatExtractiveAnswer(hits)
    const abruf = new Date().toISOString().slice(0, 10)
    const antwortMit =
      antwort.replace(
        /Preview · kann lückenhaft sein · keine Rechtsberatung\. Generative KI absichtlich aus\./,
        `${DISCLAIMER} Abruf: ${abruf}. Extractive.`
      ) || antwort

    const secret = (process.env.SCALEWAY_SECRET_KEY || '').trim()
    if (wantGen && secret) {
      const gen = await generateScaleway(frage, hits, abruf, secret)
      if (gen) {
        return NextResponse.json({
          antwort: gen,
          beantwortet: true,
          quellen,
          generative: true,
          provider: 'scaleway',
          model: SCALEWAY_MODEL,
          rolle: 'mitmacher',
          corpus: {
            source: corpus.source,
            docCount: corpus.docCount,
            chunkCount: corpus.chunks.length,
            builtAt: corpus.builtAt,
          },
        })
      }
    }

    return NextResponse.json({
      antwort: antwortMit.includes('Keine Rechtsberatung')
        ? antwortMit
        : `${antwortMit}\n\n—\n${DISCLAIMER}\nAbruf: ${abruf}`,
      beantwortet,
      quellen,
      generative: false,
      provider: wantGen && !secret ? 'scaleway_missing' : 'extractive',
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
