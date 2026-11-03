import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

/**
 * Synchronisiert alle BtMM-Dokumente in die Supabase Knowledge Base.
 *
 * Aufruf:
 *   POST /api/sync-knowledge-base
 *   Header: x-sync-secret: <SYNC_SECRET aus env>
 *
 * Kann manuell oder als Vercel Deploy Hook aufgerufen werden.
 * Vergleicht Checksums — nur geänderte Dokumente werden aktualisiert.
 */

const DOKUMENTE_META: Record<string, { titel: string; version?: string; tags: string[] }> = {
  konzept: { titel: 'Vollkonzept', version: 'v15.0.0', tags: ['kern', 'wirtschaft', 'gemeinschaft'] },
  satzung: { titel: 'Satzung eG (Entwurf)', tags: ['recht', 'struktur'] },
  einfuehrung: { titel: 'Einführung', tags: ['einstieg', 'überblick'] },
  wirtschaften: { titel: 'Wirtschaften im System', version: 'v1.1.0', tags: ['wirtschaft', 'pool', 'coins'] },
  'ideen-horizont': { titel: 'Ideen & Horizonte', version: 'v2.0.0', tags: ['vision', 'zukunft'] },
  gemeinschaftskultur: { titel: 'Gemeinschaftskultur', tags: ['gemeinschaft', 'werte', 'kultur'] },
  handwerk: { titel: 'Handwerk & Zulassungen', tags: ['handwerk', 'recht', 'berufe'] },
}

export async function POST(request: NextRequest) {
  // Einfacher Auth-Check
  const secret = request.headers.get('x-sync-secret')
  const expectedSecret = process.env.SYNC_SECRET
  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const docsDir = join(process.cwd(), 'content', 'dokumente')
    const files = readdirSync(docsDir).filter(f => f.endsWith('.md'))

    const documents = files.map(file => {
      const slug = file.replace('.md', '')
      const content = readFileSync(join(docsDir, file), 'utf-8')
      const meta = DOKUMENTE_META[slug] || { titel: slug, tags: [] }

      return {
        slug,
        titel: meta.titel,
        inhalt: content,
        version: meta.version || undefined,
        tags: meta.tags,
      }
    })

    // An die BtMM-App Supabase Edge Function senden
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      // Kein Supabase konfiguriert — nur die Dokumente zurückgeben
      return NextResponse.json({
        success: true,
        mode: 'dry-run',
        message: 'Supabase nicht konfiguriert. Dokumente wurden nicht synchronisiert.',
        documents: documents.map(d => ({ slug: d.slug, titel: d.titel, chars: d.inhalt.length })),
      })
    }

    const syncRes = await fetch(`${supabaseUrl}/functions/v1/support-knowledge-base`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        action: 'sync',
        documents,
      }),
    })

    if (!syncRes.ok) {
      const errorText = await syncRes.text()
      return NextResponse.json({
        success: false,
        error: `Sync fehlgeschlagen: ${syncRes.status}`,
        details: errorText,
      }, { status: 502 })
    }

    const syncResult = await syncRes.json()

    return NextResponse.json({
      success: true,
      sync: syncResult.sync,
      documents_count: documents.length,
    })
  } catch (err) {
    console.error('Knowledge base sync error:', err)
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Sync fehlgeschlagen',
    }, { status: 500 })
  }
}
