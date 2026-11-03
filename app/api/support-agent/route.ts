import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { z } from 'zod'

const requestSchema = z.object({
  frage: z.string().min(3, 'Frage zu kurz'),
  name: z.string().optional(),
  email: z.string().email().optional(),
})

interface DokumentAbschnitt {
  dokument: string
  abschnitt: string
  text: string
  relevanz: number
}

function ladeDokumente(): { slug: string; titel: string; content: string }[] {
  const docs = [
    { slug: 'konzept', titel: 'Vollkonzept' },
    { slug: 'satzung', titel: 'Satzung' },
    { slug: 'einfuehrung', titel: 'Einführung' },
    { slug: 'wirtschaften', titel: 'Wirtschaften im System' },
    { slug: 'ideen-horizont', titel: 'Ideen & Horizonte' },
    { slug: 'gemeinschaftskultur', titel: 'Gemeinschaftskultur' },
    { slug: 'handwerk', titel: 'Handwerk & Zulassungen' },
  ]

  return docs.map((doc) => {
    try {
      const content = readFileSync(
        join(process.cwd(), 'content', 'dokumente', `${doc.slug}.md`),
        'utf-8'
      )
      return { ...doc, content }
    } catch {
      return { ...doc, content: '' }
    }
  }).filter(d => d.content.length > 0)
}

function durchsucheDokumente(frage: string, dokumente: { slug: string; titel: string; content: string }[]): DokumentAbschnitt[] {
  const woerter = frage
    .toLowerCase()
    .replace(/[?!.,;:]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2)
    // Stoppwörter entfernen
    .filter(w => !['und', 'oder', 'der', 'die', 'das', 'ein', 'eine', 'ist', 'sind', 'was', 'wie', 'wer', 'kann', 'man', 'bei', 'für', 'von', 'mit', 'den', 'dem', 'des', 'sich', 'nicht', 'auch', 'hat', 'ich', 'mich', 'mir', 'wir', 'uns'].includes(w))

  const ergebnisse: DokumentAbschnitt[] = []

  for (const doc of dokumente) {
    // Dokument in Absätze aufteilen (bei Überschriften oder Doppel-Newlines)
    const abschnitte = doc.content.split(/\n(?=#{1,3}\s)|(?:\n\s*\n)/).filter(a => a.trim().length > 20)

    for (const abschnitt of abschnitte) {
      const textLower = abschnitt.toLowerCase()
      let relevanz = 0

      for (const wort of woerter) {
        // Exakte Wort-Treffer
        const regex = new RegExp(`\\b${wort.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi')
        const treffer = textLower.match(regex)
        if (treffer) {
          relevanz += treffer.length * 2
        }

        // Teilwort-Treffer (z.B. "körper" findet "körperarbeit")
        if (textLower.includes(wort)) {
          relevanz += 1
        }
      }

      // Bonus für Überschriften-Treffer
      const ersteZeile = abschnitt.split('\n')[0]
      if (ersteZeile.startsWith('#')) {
        for (const wort of woerter) {
          if (ersteZeile.toLowerCase().includes(wort)) {
            relevanz += 5
          }
        }
      }

      if (relevanz > 0) {
        ergebnisse.push({
          dokument: doc.titel,
          abschnitt: ersteZeile.replace(/^#+\s*/, '').slice(0, 80),
          text: abschnitt.replace(/^#+\s*.+\n/, '').trim().slice(0, 500),
          relevanz,
        })
      }
    }
  }

  // Nach Relevanz sortieren, Top 3 zurückgeben
  return ergebnisse.sort((a, b) => b.relevanz - a.relevanz).slice(0, 3)
}

function erstelleAntwort(frage: string, treffer: DokumentAbschnitt[]): { antwort: string; beantwortet: boolean } {
  if (treffer.length === 0) {
    return {
      antwort: 'Zu deiner Frage habe ich leider keine passende Information in unseren Dokumenten gefunden. Möchtest du deine Frage an unser Team weiterleiten? Wir antworten persönlich.',
      beantwortet: false,
    }
  }

  const topTreffer = treffer[0]
  let antwort = ''

  if (treffer.length === 1 || topTreffer.relevanz > treffer[1]?.relevanz * 2) {
    // Ein klarer Treffer
    antwort = `Aus unserem Dokument „${topTreffer.dokument}":\n\n${topTreffer.text}`
    if (topTreffer.text.length >= 490) {
      antwort += '\n\n… Für die vollständige Information schau in unsere Dokumente-Seite.'
    }
  } else {
    // Mehrere relevante Treffer
    antwort = 'Ich habe folgende relevante Informationen gefunden:\n\n'
    for (const t of treffer) {
      antwort += `**${t.dokument}** — ${t.abschnitt}:\n${t.text.slice(0, 300)}\n\n`
    }
  }

  antwort += '\n\nWar das hilfreich? Falls du weitere Fragen hast oder persönliche Beratung wünschst, leite ich dich gerne an unser Team weiter.'

  return { antwort, beantwortet: true }
}

async function frageAnClaude(frage: string, dokumenteText: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: `Du bist der Support-Assistent von Back to Meaning Maximization (BtMM), einer Genossenschaft für alternatives Wirtschaften mit Sitz in Freiburg.
Antworte freundlich, klar und auf Deutsch. Beziehe dich NUR auf die folgenden BtMM-Dokumente.
Wenn die Frage nicht aus den Dokumenten beantwortet werden kann, sage das ehrlich und biete an, die Frage an das Team weiterzuleiten.
Halte die Antwort kurz (max 3-4 Sätze) und verweise auf die Dokumente-Seite für Details.

BtMM-DOKUMENTE:
${dokumenteText}`,
        messages: [{ role: 'user', content: frage }],
      }),
    })

    if (!res.ok) return null
    const data = await res.json()
    return data.content?.[0]?.text || null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = requestSchema.parse(body)

    const dokumente = ladeDokumente()
    const alleDokText = dokumente.map(d => `--- ${d.titel} ---\n${d.content}`).join('\n\n')

    // Stufe 1: Claude-basierte Antwort versuchen
    const claudeAntwort = await frageAnClaude(data.frage, alleDokText)

    if (claudeAntwort) {
      return NextResponse.json({
        antwort: claudeAntwort,
        beantwortet: true,
        quelle: 'agent',
      })
    }

    // Stufe 2: Dokumenten-Suche als Fallback
    const treffer = durchsucheDokumente(data.frage, dokumente)
    const { antwort, beantwortet } = erstelleAntwort(data.frage, treffer)

    return NextResponse.json({
      antwort,
      beantwortet,
      quelle: 'suche',
      treffer: treffer.map(t => ({ dokument: t.dokument, abschnitt: t.abschnitt })),
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 })
    }
    console.error('Support agent error:', err)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
