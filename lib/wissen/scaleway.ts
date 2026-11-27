/**
 * Gemeinsamer Scaleway-Aufruf (chat/completions) für Wissens-KI und Tür-KI.
 * Aus app/api/wissen-mitmacher/route.ts herausgezogen (Plan Tür-KI 25.11.2026 §7).
 * Loggt nur Statuscode bzw. ein festes Kürzel, nie Inhalte (DS-Auflage).
 * Keine eigenen Imports, damit Unit-Tests das Modul direkt laden können.
 */

export const SCALEWAY_URL = 'https://api.scaleway.ai/v1/chat/completions'
export const SCALEWAY_MODEL = 'mistral-small-3.2-24b-instruct-2506'

export type ChatNachricht = { role: 'system' | 'user' | 'assistant'; content: string }

export type ChatNutzung = { prompt_tokens: number; completion_tokens: number }

export type ChatErgebnis = { text: string; usage: ChatNutzung | null }

export type ScalewayOptionen = {
  secret: string
  messages: ChatNachricht[]
  temperature: number
  maxTokens: number
  /** Abbruch nach dieser Zeit (ms). Ohne Angabe kein Timeout (bisheriges Verhalten der Wissens-KI). */
  timeoutMs?: number
  /** Modell-ID; ohne Angabe der Standard (SCALEWAY_MODEL). */
  model?: string
  /** Nur für Modelle mit Reasoning: 'none' schaltet es aus (sonst verbrauchen Denk-Tokens die Ausgabe). */
  reasoningEffort?: 'none'
  fetchImpl?: typeof fetch
}

export async function scalewayChat(opt: ScalewayOptionen): Promise<ChatErgebnis | null> {
  const f = opt.fetchImpl || fetch
  const ctrl = opt.timeoutMs ? new AbortController() : null
  const timer = ctrl ? setTimeout(() => ctrl.abort(), opt.timeoutMs) : null
  try {
    const res = await f(SCALEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opt.secret}`,
      },
      body: JSON.stringify({
        model: opt.model || SCALEWAY_MODEL,
        ...(opt.reasoningEffort ? { reasoning_effort: opt.reasoningEffort } : {}),
        temperature: opt.temperature,
        max_tokens: opt.maxTokens,
        messages: opt.messages,
      }),
      ...(ctrl ? { signal: ctrl.signal } : {}),
    })
    if (!res.ok) {
      console.error('scaleway', res.status)
      return null
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
      usage?: { prompt_tokens?: number; completion_tokens?: number }
    }
    const text = data?.choices?.[0]?.message?.content
    if (typeof text !== 'string' || !text.trim()) return null
    const u = data?.usage
    const usage =
      u && typeof u.prompt_tokens === 'number' && typeof u.completion_tokens === 'number'
        ? { prompt_tokens: u.prompt_tokens, completion_tokens: u.completion_tokens }
        : null
    return { text: text.trim(), usage }
  } catch {
    console.error('scaleway')
    return null
  } finally {
    if (timer) clearTimeout(timer)
  }
}
