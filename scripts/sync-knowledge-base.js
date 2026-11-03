#!/usr/bin/env node

/**
 * Synchronisiert BtB-Dokumente in die Supabase Knowledge Base.
 *
 * Nutzung:
 *   node scripts/sync-knowledge-base.js
 *
 * Wird automatisch nach jedem Vercel-Deploy ausgeführt (postbuild).
 * Kann auch manuell aufgerufen werden.
 *
 * Benötigte ENV-Variablen:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (oder NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */

const fs = require('fs')
const path = require('path')

const DOKUMENTE_META = {
  konzept: { titel: 'Vollkonzept', version: 'v15.0.0', tags: ['kern', 'wirtschaft', 'gemeinschaft'] },
  satzung: { titel: 'Satzung eG & e.V.', tags: ['recht', 'struktur'] },
  einfuehrung: { titel: 'Einführung', tags: ['einstieg', 'überblick'] },
  wirtschaften: { titel: 'Wirtschaften im System', version: 'v1.1.0', tags: ['wirtschaft', 'pool', 'coins'] },
  'ideen-horizont': { titel: 'Ideen & Horizonte', version: 'v2.0.0', tags: ['vision', 'zukunft'] },
  gemeinschaftskultur: { titel: 'Gemeinschaftskultur', tags: ['gemeinschaft', 'werte', 'kultur'] },
  handwerk: { titel: 'Handwerk & Zulassungen', tags: ['handwerk', 'recht', 'berufe'] },
}

async function main() {
  const docsDir = path.join(__dirname, '..', 'content', 'dokumente')

  if (!fs.existsSync(docsDir)) {
    console.log('Kein content/dokumente Ordner gefunden — Sync übersprungen.')
    return
  }

  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'))
  console.log(`Gefunden: ${files.length} Dokumente`)

  const documents = files.map(file => {
    const slug = file.replace('.md', '')
    const content = fs.readFileSync(path.join(docsDir, file), 'utf-8')
    const meta = DOKUMENTE_META[slug] || { titel: slug, tags: [] }
    return {
      slug,
      titel: meta.titel,
      inhalt: content,
      version: meta.version || undefined,
      tags: meta.tags,
    }
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log('Supabase nicht konfiguriert — Sync übersprungen.')
    console.log('Setze NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY in Vercel.')
    return
  }

  console.log(`Synchronisiere ${documents.length} Dokumente nach ${supabaseUrl}...`)

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/support-knowledge-base`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify({ action: 'sync', documents }),
    })

    if (!res.ok) {
      console.error(`Sync fehlgeschlagen: ${res.status} ${await res.text()}`)
      return
    }

    const result = await res.json()
    console.log('Sync abgeschlossen:', result.sync)
  } catch (err) {
    console.error('Sync-Fehler:', err.message)
  }
}

main()
