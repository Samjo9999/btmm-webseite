import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { loadMitmacherCorpus } from '@/lib/wissen/loadCorpus'
import { formatExtractiveAnswer, searchChunks, type WissenChunk } from '@/lib/wissen/search'
import { resolveWissenLlmRuntime } from '@/lib/wissen/llmTiers'
import { LIMIT_TEXT, pruefeUndZaehle } from '@/lib/wissen/rateLimit'
import { entferneEmojis } from '../../../packages/wissen-mcp/src/emoji-filter.mjs'
import { SCALEWAY_MODEL, scalewayChat } from '@/lib/wissen/scaleway'
import { BTMM_BENENNUNG } from '@/lib/wissen/benennung'

/**
 * Mitmacher-Wissenssuche (Prompt 117).
 * Auth = Bearer JWT App-Supabase. Corpus serverseitig.
 * Extractive Default. Generativ nur wenn WISSEN_LLM_ENABLED=true + TIER (s5|s15|s50|h250)
 * + Secret/Base-URL. Stufen vorbereitet; Live erst nach Dirigent-Karte.
 */

const schema = z.object({
  frage: z.string().min(3),
  generative: z.boolean().optional(),
  mode: z.string().optional(),
})

const DISCLAIMER =
  'Keine Rechtsberatung und ersetzt keine Prüfung durch Prüfungsverband, Steuerberatung oder Anwalt. Stand ungesichert. ZAG/KWG nie als freigegeben. Vor der Gründung: Mitmacher/Interessent.'

const LABEL_ENTWURF = 'Entwurf, noch nicht beschlossen'

/** Systemprompt Mitmacher-Assistent. Benennung zentral in lib/wissen/benennung.ts (Recht-Bot 25.11.2026). */
function mitmacherSystemPrompt(abruf: string): string {
  return (
    `Du bist der BtMM-Mitmacher-Assistent. ${BTMM_BENENNUNG} Antworte auf Deutsch, knapp und klar.\n` +
    `Nutze NUR den gelieferten Corpus-Kontext. Wenn der Kontext nicht reicht: sag es und rate nicht.\n` +
    `Pflicht: ${DISCLAIMER}\n` +
    `Entwürfe immer mit Label „${LABEL_ENTWURF}“ kennzeichnen. Behaupte nie, ZAG/KWG sei freigegeben.\n` +
    `Am Ende: kurze Quellenliste (Dokument + Abschnitt). Abruf-Datum: ${abruf}.`
  )
}

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
  const system = mitmacherSystemPrompt(abruf)
  // Gemeinsamer Aufruf (lib/wissen/scaleway.ts), Parameter wie bisher: temperature 0.2, max_tokens 900.
  const erg = await scalewayChat({
    secret,
    temperature: 0.2,
    maxTokens: 900,
    messages: [
      { role: 'system', content: system },
      {
        role: 'user',
        content: `Frage: ${frage}\n\nCorpus-Kontext:\n${buildContext(hits)}`,
      },
    ],
  })
  if (!erg) return null
  // Nutzerregel 25.11.: LLM-Antwort serverseitig ohne Emojis.
  const text = erg.text
  let antwort = entferneEmojis(text.trim())
  if (!antwort.includes('Keine Rechtsberatung')) {
    antwort += `\n\n—\n${DISCLAIMER}\nAbruf: ${abruf} · Scaleway ${SCALEWAY_MODEL}`
  }
  return antwort
}


async function generateOpenAiCompat(
  frage: string,
  hits: WissenChunk[],
  abruf: string,
  baseUrl: string,
  apiKey: string,
  model: string
): Promise<string | null> {
  if (!hits.length) return null
  const system = mitmacherSystemPrompt(abruf)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
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
      console.error('selfhost-llm', res.status)
      return null
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const textOut = data?.choices?.[0]?.message?.content
    if (typeof textOut !== 'string' || !textOut.trim()) return null
    let antwort = entferneEmojis(textOut.trim())
    if (!antwort.includes('Keine Rechtsberatung')) {
      antwort += `\n\n—\n${DISCLAIMER}\nAbruf: ${abruf} · Self-Host ${model}`
    }
    return antwort
  } catch (e) {
    console.error('selfhost-llm')
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

    const limit = pruefeUndZaehle(userData.user.id)
    if (!limit.erlaubt) {
      return NextResponse.json(
        { error: LIMIT_TEXT },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.retryAfterSec) },
        }
      )
    }
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

    const runtime = resolveWissenLlmRuntime({
      enabled: process.env.WISSEN_LLM_ENABLED,
      tier: process.env.WISSEN_LLM_TIER,
    })
    const secret = (process.env.SCALEWAY_SECRET_KEY || '').trim()
    const selfBase = (process.env.SELFHOST_LLM_BASE_URL || '').trim().replace(/\/$/, '')
    const selfKey = (process.env.SELFHOST_LLM_API_KEY || '').trim()
    const selfModel =
      (process.env.SELFHOST_LLM_MODEL || '').trim() || 'mistral-small'

    if (wantGen && runtime.live) {
      let gen: string | null = null
      let modelUsed = SCALEWAY_MODEL
      let provider: 'scaleway' | 'selfhost' = 'scaleway'
      if (runtime.meta.provider === 'scaleway' && secret) {
        gen = await generateScaleway(frage, hits, abruf, secret)
        provider = 'scaleway'
        modelUsed = SCALEWAY_MODEL
      } else if (runtime.meta.provider === 'selfhost' && selfBase) {
        gen = await generateOpenAiCompat(
          frage,
          hits,
          abruf,
          selfBase,
          selfKey,
          selfModel
        )
        provider = 'selfhost'
        modelUsed = selfModel
      }
      if (gen) {
        return NextResponse.json({
          antwort: gen,
          beantwortet: true,
          quellen,
          generative: true,
          provider,
          model: modelUsed,
          tier: runtime.tier,
          budgetEurMon: runtime.meta.budgetEurMon,
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

    let provider: string = 'extractive'
    if (wantGen && !runtime.live) provider = 'llm_switch_off'
    else if (wantGen && runtime.meta.provider === 'scaleway' && !secret)
      provider = 'scaleway_missing'
    else if (wantGen && runtime.meta.provider === 'selfhost' && !selfBase)
      provider = 'selfhost_missing'

    return NextResponse.json({
      antwort: antwortMit.includes('Keine Rechtsberatung')
        ? antwortMit
        : `${antwortMit}\n\n—\n${DISCLAIMER}\nAbruf: ${abruf}`,
      beantwortet,
      quellen,
      generative: false,
      provider,
      tier: runtime.tier,
      llmEnabled: runtime.enabled,
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
    console.error('wissen-mitmacher')
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
