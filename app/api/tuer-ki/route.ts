import { NextRequest, NextResponse } from 'next/server'
import { loadPublicCorpus } from '@/lib/wissen/loadCorpus'
import { searchChunks } from '@/lib/wissen/search'
import { scalewayChat } from '@/lib/wissen/scaleway'
import { beantworteTuerKi } from '@/lib/tuerKi/handler'
import { appOrigins, clientIpAusHeadern, pruefeHerkunft } from '@/lib/tuerKi/herkunft'
import { neuerRateZustand, zaehleTuerRateRpc, type TuerRateZustand } from '@/lib/tuerKi/rateLimit'
import { neuerKostenZustand, type TuerKostenZustand } from '@/lib/tuerKi/kosten'

/**
 * Tür-KI (Plan Tür-KI 25.11.2026): freies Gespräch auf b-t-m-m.com/tuer, ohne Login.
 * Nur öffentlicher Index (loadPublicCorpus), nie der Mitmacher-Index.
 * Schalter TUER_KI_ENABLED + WISSEN_LLM_ENABLED (Default aus) -> Antwort status "aus", kein Fehler.
 * Rate-Limit über tuer_ki_rate_zaehle (service_role); In-Memory nur als zusätzliche Bremse.
 * Loggt nie Inhalte, IP oder Hash; nur ein festes Kürzel bei Serverfehlern.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const g = globalThis as typeof globalThis & { __tuerKiRate?: TuerRateZustand; __tuerKiKosten?: TuerKostenZustand }
function rate(): TuerRateZustand {
  if (!g.__tuerKiRate) {
    const salt = (process.env.TUER_KI_RATE_SALT || '').trim()
    g.__tuerKiRate = neuerRateZustand(Date.now(), salt || undefined)
  }
  return g.__tuerKiRate
}
function kosten(): TuerKostenZustand {
  if (!g.__tuerKiKosten) g.__tuerKiKosten = neuerKostenZustand()
  return g.__tuerKiKosten
}

function herkunft(request: NextRequest) {
  return pruefeHerkunft(
    request.headers.get('origin'),
    request.headers.get('x-forwarded-host') ?? request.headers.get('host'),
    appOrigins(process.env.TUER_KI_APP_ORIGINS)
  )
}

function clientIp(request: NextRequest): string {
  return clientIpAusHeadern((name) => request.headers.get(name))
}

export async function OPTIONS(request: NextRequest) {
  const h = herkunft(request)
  if (!h.erlaubt || !h.cors['Access-Control-Allow-Origin']) return new NextResponse(null, { status: 403 })
  return new NextResponse(null, { status: 204, headers: h.cors })
}

export async function POST(request: NextRequest) {
  const h = herkunft(request)
  if (!h.erlaubt) return NextResponse.json({ status: 'ungueltig' }, { status: 403 })
  const kopf: Record<string, string> = { ...h.cors, 'Cache-Control': 'no-store' }
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ status: 'ungueltig' }, { status: 400, headers: kopf })
    }
    const erg = await beantworteTuerKi(body, {
      env: {
        TUER_KI_ENABLED: process.env.TUER_KI_ENABLED,
        WISSEN_LLM_ENABLED: process.env.WISSEN_LLM_ENABLED,
        WISSEN_LLM_TIER: process.env.WISSEN_LLM_TIER,
        SCALEWAY_SECRET_KEY: process.env.SCALEWAY_SECRET_KEY,
        TUER_KI_TAG_EUR: process.env.TUER_KI_TAG_EUR,
        TUER_KI_MONAT_EUR: process.env.TUER_KI_MONAT_EUR,
        TUER_KI_RATE_SALT: process.env.TUER_KI_RATE_SALT,
      },
      ip: clientIp(request),
      now: Date.now(),
      ladeCorpus: loadPublicCorpus,
      suche: searchChunks,
      chat: scalewayChat,
      rate: rate(),
      kosten: kosten(),
      zaehleRate: zaehleTuerRateRpc,
    })
    if (erg.retryAfterSec) kopf['Retry-After'] = String(erg.retryAfterSec)
    return NextResponse.json(erg.json, { status: erg.http, headers: kopf })
  } catch {
    console.error('tuer-ki')
    return NextResponse.json({ status: 'fehler' }, { status: 500, headers: kopf })
  }
}
