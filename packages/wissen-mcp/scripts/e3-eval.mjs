#!/usr/bin/env node
/**
 * Messlauf gegen E3-TESTFRAGEN.json — extractive, kein LLM.
 */
import fs from 'node:fs'
import path from 'node:path'
import { defaultWebRoot, PKG_ROOT } from '../src/corpus.mjs'
import { searchChunks, formatExtractiveAnswer } from '../src/search.mjs'

const web = process.env.WEB_ROOT || defaultWebRoot()
const fragenPath =
  process.env.E3_FRAGEN || '/workspace/projekte/btmmki/E3-TESTFRAGEN.json'
const outPath =
  process.argv[2] ||
  process.env.E3_OUT ||
  '/workspace/projekte/btmmki/E3-MESSLAUF-E2-2026-11-24.md'

const indexes = {
  public: path.join(web, 'content', 'wissen', 'index-public.json'),
  mitmacher: path.join(web, 'content', 'wissen-mitglieder', 'index.json'),
  internal: path.join(web, 'content', 'wissen-internal', 'index.json'),
}

function loadIndex(tier) {
  const file = indexes[tier]
  if (!fs.existsSync(file)) throw new Error(`Index fehlt: ${file}`)
  return { file, data: JSON.parse(fs.readFileSync(file, 'utf8')) }
}

function matchesMuster(text, muster) {
  if (!muster || !muster.length) return false
  const s = String(text || '')
  return muster.some((m) => s.includes(m))
}

const fragen = JSON.parse(fs.readFileSync(fragenPath, 'utf8'))
const loaded = {
  public: loadIndex('public'),
  mitmacher: loadIndex('mitmacher'),
  internal: loadIndex('internal'),
}

const rows = []
for (const q of fragen.fragen) {
  const idx = loaded[q.index]
  const hits = searchChunks(q.frage, idx.data.chunks || [], 5)
  const answer = formatExtractiveAnswer(q.frage, hits)
  const quellen = answer.quellen || []
  const pfade = quellen.map((s) => s.pfad || '').join(' | ')
  const top = quellen[0] || null
  let korrekteQuelle = false
  let aktuelleVersion = false
  if (q.typ === 'nicht_drin') {
    korrekteQuelle = hits.length === 0
    aktuelleVersion = korrekteQuelle
  } else {
    korrekteQuelle = quellen.some((s) => matchesMuster(s.pfad, q.quellen_muster) || matchesMuster(s.dokument, q.quellen_muster))
    aktuelleVersion =
      korrekteQuelle &&
      (!q.version_muster ||
        !q.version_muster.length ||
        quellen.some(
          (s) =>
            (matchesMuster(s.pfad, q.quellen_muster) || matchesMuster(s.dokument, q.quellen_muster)) &&
            matchesMuster(`${s.pfad} ${s.dokument}`, q.version_muster)
        ))
  }
  rows.push({
    id: q.id,
    bereich: q.bereich,
    stufe: q.zugriffsstufe,
    index: q.index,
    typ: q.typ,
    korrekteQuelle,
    aktuelleVersion,
    top: top
      ? `${top.dokument} — ${top.abschnitt} (${top.score}) [${top.pfad}]`
      : hits.length
        ? `(Treffer, aber keine extractive Quelle)`
        : '— kein Treffer',
    hits: hits.slice(0, 5).map((h) => ({ rel: h.rel, abschnitt: h.abschnitt, score: h.score, title: h.title })),
    frage: q.frage,
  })
}

const okQuelle = rows.filter((r) => r.korrekteQuelle).length
const okVersion = rows.filter((r) => r.aktuelleVersion).length
const byStufe = {}
for (const r of rows) {
  byStufe[r.stufe] ??= { ok: 0, n: 0, ids: [] }
  byStufe[r.stufe].n += 1
  if (r.korrekteQuelle) {
    byStufe[r.stufe].ok += 1
    byStufe[r.stufe].ids.push(r.id)
  }
}

const offen = rows.filter((r) => !r.korrekteQuelle)
const jetzt = new Date()
const fmt = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'Europe/Berlin',
  dateStyle: 'short',
  timeStyle: 'short',
})

let md = `# E3 Messlauf E2 — ${fmt.format(jetzt)} Europe/Berlin

Messung gegen den neu gebauten Index in \`btmm-webseite\` (Branch feat/btmmki-e2-korpus). Extractive, 0 €, \`WISSEN_LLM_ENABLED\` unberührt.

## Methode

- Fragen: \`${fragenPath}\` (20 Stück).
- Suchlogik: \`packages/wissen-mcp/src/search.mjs\` (Titel-Bias gedeckelt, Bindestrich-Tokens, Mindest-Score).
- Indizes:
  - public: ${loaded.public.data.docCount} Docs / ${loaded.public.data.chunkCount} Chunks, gebaut ${loaded.public.data.builtAt}
  - mitmacher: ${loaded.mitmacher.data.docCount} Docs / ${loaded.mitmacher.data.chunkCount} Chunks, gebaut ${loaded.mitmacher.data.builtAt}
  - internal: ${loaded.internal.data.docCount} Docs / ${loaded.internal.data.chunkCount} Chunks, gebaut ${loaded.internal.data.builtAt} (nicht öffentlich, nicht im Repo unter public/)
- **Korrekte Quelle:** Soll-Dokumentfamilie (Dateimuster) steht unter den Quellen der extractiven Antwort (höchstens 3). Bei Typ \`nicht_drin\`: nur ja, wenn die Suche gar keinen Treffer liefert.
- **Aktuellste Version:** der gelieferte Pfad trägt die geltende Versionsnummer aus dem Fragenset.

## Score

**${okQuelle} von 20 mit richtiger Quelle** — Bestehensgrenze **16/20 ${okQuelle >= 16 ? 'erreicht' : 'nicht erreicht'}**.

Davon mit geltender neuester Version: **${okVersion}/20**.

| Stufe | Score | IDs mit richtiger Quelle |
|---|---|---|
`

for (const [st, v] of Object.entries(byStufe)) {
  md += `| ${st} | ${v.ok}/${v.n} | ${v.ids.join(', ') || '—'} |\n`
}
md += `| **gesamt** | **${okQuelle}/20** | |\n\n## Tabelle\n\n`
md += `| ID | Bereich | Stufe | Index | Typ | Korrekte Quelle | Aktuellste Version | Gelieferte Top-Quelle (Score) |\n`
md += `|---|---|---|---|---|---|---|---|\n`
for (const r of rows) {
  md += `| ${r.id} | ${r.bereich} | ${r.stufe} | ${r.index} | ${r.typ} | ${r.korrekteQuelle ? 'ja' : 'nein'} | ${r.aktuelleVersion ? 'ja' : 'nein'} | ${String(r.top).replace(/\|/g, '/')} |\n`
}

md += `\n## Offene Fragen (${offen.length})\n\n`
if (!offen.length) md += 'Keine.\n'
for (const r of offen) {
  md += `### ${r.id} — ${r.frage}\n\n- Top: ${r.top}\n- Weitere Treffer:\n`
  for (const h of r.hits) md += `  - ${h.score} ${h.title} — ${h.abschnitt} [${h.rel}]\n`
  md += '\n'
}

md += `## Indizes (Pfad)\n\n`
md += `- public: \`${loaded.public.file}\`\n`
md += `- mitmacher: \`${loaded.mitmacher.file}\`\n`
md += `- internal: \`${loaded.internal.file}\` (gitignored)\n`

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, md)
console.log(JSON.stringify({ score: `${okQuelle}/20`, version: `${okVersion}/20`, out: outPath, offen: offen.map((r) => r.id) }, null, 2))
