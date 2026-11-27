#!/usr/bin/env node
/**
 * Erzeugt content/bildnachweise.md aus data/bildnachweise.json (einzige Quelle).
 * Aufruf: node scripts/bildnachweise-md.mjs           (schreibt die Datei)
 *         node scripts/bildnachweise-md.mjs --pruefen (nur prüfen, ob die Datei aktuell ist)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const jsonPfad = join(root, 'data/bildnachweise.json')
const mdPfad = join(root, 'content/bildnachweise.md')

export function bildnachweiseMd(d) {
  const z = []
  z.push('# Bildnachweise')
  z.push('')
  z.push(`Stand ${d.stand}. Die Fotos stehen unter der Unsplash-Lizenz (${d.lizenzUrl}): kostenlos nutzbar, auch gewerblich, ohne Namensnennungspflicht. Wir nennen die Fotografinnen und Fotografen trotzdem. Es handelt sich um echte Fotos. Die Grafik der Eingangstür wurde mit KI erstellt.`)
  z.push('')
  z.push('Diese Datei wird aus `data/bildnachweise.json` erzeugt (`node scripts/bildnachweise-md.mjs`). Nicht von Hand ändern.')
  z.push('')
  z.push('## Fotos')
  z.push('')
  z.push('| Datei | Fotograf | Quelle-URL | Lizenz | Abrufdatum |')
  z.push('| --- | --- | --- | --- | --- |')
  for (const f of d.fotos) {
    z.push(`| ${f.dateien.map((x) => '`' + x + '`').join('<br>')} | ${f.fotograf} | ${f.quelle} | ${f.lizenz} | ${f.abruf} |`)
  }
  z.push('')
  z.push('Verwendung und Bearbeitung:')
  z.push('')
  for (const f of d.fotos) z.push(`- ${f.id}: ${f.verwendung}. Veröffentlicht auf Unsplash am ${f.veroeffentlicht}. ${f.bearbeitung}.`)
  z.push('')
  z.push('## Grafik der Eingangstür')
  z.push('')
  z.push('Die Grafik der Eingangstür (Holztür) wurde mit KI erstellt. Sie bleibt in der Fassung, die vor dem Austausch der Weg- und Kostenbilder im Einsatz war. Das Logo ist Teil der Grafik.')
  z.push('')
  z.push('| Datei | Hinweis |')
  z.push('| --- | --- |')
  for (const k of d.ki) {
    z.push(`| ${k.dateien.map((x) => '`' + x + '`').join('<br>')} | ${k.hinweis} |`)
  }
  z.push('')
  z.push('## Eigene Bilder und Marke')
  z.push('')
  z.push('| Datei | Hinweis |')
  z.push('| --- | --- |')
  for (const e of d.eigene) z.push(`| \`${e.datei}\` | ${e.hinweis} |`)
  z.push('')
  z.push('## Per Link eingebundene Unsplash-Kopfbilder')
  z.push('')
  z.push('Diese Fotos werden direkt von images.unsplash.com geladen (Unsplash-Lizenz). Der Name der Fotografin oder des Fotografen ist über die Bild-ID nicht ermittelbar und noch offen.')
  z.push('')
  z.push('| Bild-URL | Verwendet auf |')
  z.push('| --- | --- |')
  for (const e of d.extern) z.push(`| ${e.url} | ${e.seiten.length} Seite(n) |`)
  z.push('')
  return z.join('\n')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const md = bildnachweiseMd(JSON.parse(readFileSync(jsonPfad, 'utf8')))
  if (process.argv.includes('--pruefen')) {
    let alt = ''
    try { alt = readFileSync(mdPfad, 'utf8') } catch { /* fehlt */ }
    if (alt !== md) { console.error('content/bildnachweise.md ist nicht aktuell. Bitte node scripts/bildnachweise-md.mjs ausführen.'); process.exit(1) }
    console.log('bildnachweise.md aktuell')
  } else {
    writeFileSync(mdPfad, md)
    console.log('geschrieben: content/bildnachweise.md')
  }
}
