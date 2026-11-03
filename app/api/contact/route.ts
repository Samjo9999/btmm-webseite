import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name zu kurz'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  nachricht: z.string().min(10, 'Nachricht zu kurz'),
  telefon: z.string().optional(),
  betreff: z.string().optional(),
  typ: z.enum(['kontakt', 'mitmachen', 'gruendung', 'koerperarbeit']).optional(),
  website: z.string().optional(), // Honeypot
  startedAt: z.number().optional(), // Zeitpunkt, zu dem das Formular geladen wurde
})

const MIN_AUSFUELLZEIT_MS = 3000

// Rate-Limit: max. 5 Anfragen pro IP in 10 Minuten.
// Best effort: Der Speicher liegt nur im Arbeitsspeicher der jeweiligen Instanz. Auf
// Serverless (Vercel) hat jede Instanz eigenen Speicher und verliert ihn bei Kaltstarts,
// das Limit ist daher kein harter Schutz.
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const rateLimitStore = new Map<string, number[]>()

function istRateLimitiert(ip: string): boolean {
  const jetzt = Date.now()
  const treffer = (rateLimitStore.get(ip) || []).filter((t) => jetzt - t < RATE_LIMIT_WINDOW_MS)
  if (treffer.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, treffer)
    return true
  }
  treffer.push(jetzt)
  rateLimitStore.set(ip, treffer)
  if (rateLimitStore.size > 5000) {
    for (const [key, werte] of rateLimitStore) {
      if (werte.every((t) => jetzt - t >= RATE_LIMIT_WINDOW_MS)) rateLimitStore.delete(key)
    }
  }
  return false
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unbekannt'
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(request: NextRequest) {
  if (istRateLimitiert(clientIp(request))) {
    return NextResponse.json(
      { error: 'Zu viele Anfragen. Bitte versuche es in einigen Minuten erneut.' },
      { status: 429 },
    )
  }

  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    // Spam-Schutz: Honeypot gefüllt oder zu schnell abgeschickt -> still verwerfen
    if (data.website) {
      return NextResponse.json({ success: true })
    }
    // Ohne startedAt (z. B. veraltete Seite): sichtbarer Fehler statt still verwerfen
    if (!data.startedAt) {
      return NextResponse.json({ error: 'Bitte Seite neu laden.' }, { status: 400 })
    }
    if (Date.now() - data.startedAt < MIN_AUSFUELLZEIT_MS) {
      return NextResponse.json({ success: true })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      if (process.env.NODE_ENV === 'production') {
        // In Produktion nie Erfolg melden, wenn nichts versendet wird
        console.error('Kontaktformular: RESEND_API_KEY fehlt, Anfrage nicht versendet')
        return NextResponse.json(
          { error: 'Das Kontaktformular ist gerade nicht verfügbar. Bitte schreibe an office@b-m-m.com.' },
          { status: 503 },
        )
      }
      // Nur lokal/Entwicklung: nichts versenden, keine Personendaten loggen
      console.log('Contact form submission received (no Resend key, nicht versendet)')
      return NextResponse.json({ success: true, dev: true })
    }

    const { Resend } = await import('resend')
    const resend = new Resend(resendApiKey)

    const betreff = (data.betreff || `Neue Nachricht von ${data.name}`).replace(/[\r\n]+/g, ' ')
    const typLabel = data.typ ? ` [${data.typ}]` : ''

    const { error } = await resend.emails.send({
      from: 'BtMM Website <office@b-m-m.com>',
      to: ['office@b-m-m.com'],
      subject: `${betreff}${typLabel}`,
      html: `
        <h2>Neue Kontaktanfrage</h2>
        <p><strong>Name:</strong> ${esc(data.name)}</p>
        <p><strong>E-Mail:</strong> ${esc(data.email)}</p>
        ${data.telefon ? `<p><strong>Telefon:</strong> ${esc(data.telefon)}</p>` : ''}
        ${data.typ ? `<p><strong>Typ:</strong> ${esc(data.typ)}</p>` : ''}
        <hr />
        <p><strong>Nachricht:</strong></p>
        <p>${esc(data.nachricht).replace(/\n/g, '<br/>')}</p>
      `,
      reply_to: data.email,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'E-Mail konnte nicht gesendet werden' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 })
    }
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
