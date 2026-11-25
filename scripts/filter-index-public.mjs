#!/usr/bin/env node
/**
 * Baut den oeffentlichen Wissens-Index (index-public.json) NUR aus content/dokumente-web/ (alle Dokumente).
 * Keine DRIVE-/BTMM_ROOT-Quellen. Der Mitmacher-Index (content/wissen-mitglieder) und der interne Index
 * werden hier weder gelesen noch geschrieben. Es gibt keinen tuer-public-Index.
 *
 * Pipeline: chunkDoc je Dokument -> Schwaerz-Regeln (scripts/index-public-schwaerzen.mjs: Tabuwoerter,
 * Altwortlaut, Mail/Telefon/IBAN/Adresse, Impressum, interne Marker) -> Emoji-Filter -> Endkontrolle.
 * Bleibt irgendein Treffer, bricht der Build mit Exit 1 ab. Quelldokumente werden nie veraendert.
 *
 * Schreibt content/wissen/index-public.json und public/wissen/index-public.json (die einzige ausgelieferte Kopie).
 *
 * Usage: node scripts/filter-index-public.mjs [--bericht=<datei.json>] [--trocken]
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chunkDoc } from '../packages/wissen-mcp/src/search.mjs'
import { filterEmojisTief, zaehleEmojisTief } from '../packages/wissen-mcp/src/emoji-filter.mjs'
import { INDEX_WRITE_TARGETS } from './index-public-guard.mjs'
import { schwaerzeText, trefferArten, chunkArten } from './index-public-schwaerzen.mjs'

export const QUELLE_DIR = 'content/dokumente-web'
export const TEXT_LIMIT = 900
const INTERN = /^(aenderungen|änderungen|intern|work|readme)/i

const defaultRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

function titelAus(md, datei) {
  return /^#\s+(.+)$/m.exec(md)?.[1]?.trim() || datei.replace(/\.md$/, '')
}

/**
 * Baut Index und Bericht im Speicher.
 * @returns {{ payload: object, bericht: object }}
 */
export function baueIndex(root = defaultRoot, { builtAt = new Date().toISOString() } = {}) {
  const dir = join(root, QUELLE_DIR)
  const dateien = readdirSync(dir).filter((f) => f.endsWith('.md') && !INTERN.test(f)).sort()
  const chunks = []
  const je_quelle = {}
  const entfernt = []

  for (const datei of dateien) {
    const rel = `${QUELLE_DIR}/${datei}`
    const content = readFileSync(join(dir, datei), 'utf8')
    const title = titelAus(content, datei)
    const roh = chunkDoc({ id: rel, rel, title, content, source: 'dokumente-web', tier: 'public' })
    const stat = (je_quelle[rel] = { chunksRoh: 0, chunksIndex: 0, saetzeEntfernt: 0, zeilenEntfernt: 0, chunksEntfernt: 0 })
    for (const c of roh) {
      const text0 = String(c.text || '').replace(/^#+\s*.+\n/, '').trim().slice(0, TEXT_LIMIT)
      if (text0.length < 20) continue
      stat.chunksRoh += 1
      const kopfArten = trefferArten([title, c.abschnitt, rel].join('\n'))
      if (kopfArten.length) {
        stat.chunksEntfernt += 1
        entfernt.push({ rel, abschnitt: c.abschnitt, aktion: 'chunk (Titel/Abschnitt)', arten: kopfArten })
        continue
      }
      const rohRow = { title, abschnitt: c.abschnitt, text: text0, rel }
      if (chunkArten(rohRow).includes('grundsicherung-kombi')) {
        stat.chunksEntfernt += 1
        entfernt.push({ rel, abschnitt: c.abschnitt, aktion: 'chunk (Grundsicherung-Kombi)', arten: ['grundsicherung-kombi'] })
        continue
      }
      const { text, bericht } = schwaerzeText(text0)
      for (const b of bericht) {
        if (b.aktion === 'satz') stat.saetzeEntfernt += 1
        else stat.zeilenEntfernt += 1
        entfernt.push({ rel, abschnitt: c.abschnitt, aktion: b.aktion, arten: b.arten })
      }
      const row = { title, abschnitt: c.abschnitt, text, rel }
      if (text.length < 20 || chunkArten(row).length) {
        stat.chunksEntfernt += 1
        entfernt.push({ rel, abschnitt: c.abschnitt, aktion: 'chunk (Rest zu kurz oder Blob-Treffer)', arten: chunkArten(row) })
        continue
      }
      chunks.push(row)
      stat.chunksIndex += 1
    }
  }

  const sauber = filterEmojisTief({
    builtAt,
    docCount: new Set(chunks.map((c) => c.rel)).size,
    chunkCount: chunks.length,
    tier: 'public',
    quelle: QUELLE_DIR,
    chunks,
  })
  if (zaehleEmojisTief(sauber)) throw new Error('Emoji-Filter hinterliess Treffer')

  // Endkontrolle: nichts darf durchrutschen.
  const rest = []
  for (const c of sauber.chunks) {
    const a = chunkArten(c)
    if (a.length) rest.push(`${c.rel} [${c.abschnitt}]: ${a.join(', ')}`)
    if (!c.rel.startsWith(`${QUELLE_DIR}/`)) rest.push(`${c.rel}: Quelle ausserhalb von ${QUELLE_DIR}`)
  }
  if (rest.length) throw new Error(`Endkontrolle: ${rest.length} Treffer\n${rest.slice(0, 20).join('\n')}`)

  const arten = {}
  for (const e of entfernt) for (const a of e.arten) arten[a] = (arten[a] || 0) + 1
  return {
    payload: sauber,
    bericht: {
      dokumente: dateien.length,
      docCountIndex: sauber.docCount,
      chunksRohGesamt: Object.values(je_quelle).reduce((s, x) => s + x.chunksRoh, 0),
      chunksIndexGesamt: sauber.chunkCount,
      artenGesamt: arten,
      jeQuelle: je_quelle,
      entfernt,
    },
  }
}

function main() {
  const args = process.argv.slice(2)
  const berichtPfad = args.find((a) => a.startsWith('--bericht='))?.slice('--bericht='.length)
  const trocken = args.includes('--trocken')
  const { payload, bericht } = baueIndex(defaultRoot)
  const json = JSON.stringify(payload)
  if (!trocken) {
    for (const rel of INDEX_WRITE_TARGETS) {
      mkdirSync(dirname(join(defaultRoot, rel)), { recursive: true })
      writeFileSync(join(defaultRoot, rel), json)
      console.log(`wrote ${rel} — ${payload.docCount} docs, ${payload.chunkCount} chunks`)
    }
  }
  console.log(`Quelle: ${QUELLE_DIR} (${bericht.dokumente} Dokumente), Roh-Chunks ${bericht.chunksRohGesamt}, im Index ${bericht.chunksIndexGesamt}`)
  console.log(`Entfernt nach Art: ${JSON.stringify(bericht.artenGesamt)}`)
  console.log('Mitmacher-/internal-Index unberuehrt, kein tuer-public, kein DRIVE.')
  if (berichtPfad) {
    writeFileSync(berichtPfad, JSON.stringify(bericht, null, 2))
    console.log(`Bericht: ${berichtPfad}`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
