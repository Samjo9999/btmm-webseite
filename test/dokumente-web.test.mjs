// Dokumente auf der Webseite (/dokumente, /dokumente/[slug]), Stand 25.11.2026.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  slugs, alle, lesen, gruppiert, idAusSlug, parseKopf, beschreibung, pfad, downloadName, ALT_NACH_NEU, GRUPPEN,
} from '../lib/dokumente-web.mjs'
import { hatEmojis } from '../packages/wissen-mcp/src/emoji-filter.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const lese = (rel) => fs.readFileSync(path.join(root, rel), 'utf8')
const DIR = path.join(root, 'content', 'dokumente-web')

const ERWARTET = [
  '00', '01', '02', '03', '04', '05', '06', '07', '08', '08a', '11', '12', '13', '15',
  '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31',
]

test('Route-Liste: genau 30 Dokumentseiten, Nummern wie freigegeben', () => {
  const s = slugs()
  assert.equal(s.length, 30)
  assert.deepEqual(s.map(idAusSlug), ERWARTET)
  assert.equal(new Set(s).size, 30)
  for (const slug of s) assert.match(slug, /^\d{2}[a-z]?-[a-z0-9-]+$/)
})

test('Nur freigegebene Dateien: keine internen Dateien (AENDERUNGEN, work/) im Repo', () => {
  const dateien = fs.readdirSync(DIR)
  assert.equal(dateien.length, 30, dateien.join(','))
  for (const f of dateien) assert.match(f, /^\d{2}[a-z]?-[a-z0-9-]+\.md$/)
  const gefunden = []
  const gehe = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (['node_modules', '.git', '.next'].includes(e.name)) continue
      const p = path.join(d, e.name)
      if (/^aenderungen|^änderungen/i.test(e.name) || (e.isDirectory() && e.name === 'work' && d.includes('dokumente'))) gefunden.push(path.relative(root, p))
      if (e.isDirectory()) gehe(p)
    }
  }
  gehe(root)
  assert.deepEqual(gefunden, [])
  for (const d of alle()) {
    assert.ok(!/AENDERUNGEN|INTERN\b|\[Q\d/.test(d.md), `${d.slug}: interner Marker im Text`)
  }
})

test('Kopf je Dokument: Titel, Nummer, Version, Stand; Hinweissätze genau einmal in der Datei', () => {
  for (const d of alle()) {
    assert.ok(d.titel, `${d.slug}: Titel fehlt`)
    assert.equal(d.nummer, idAusSlug(d.slug), `${d.slug}: Nummer im Kopf passt nicht zum Dateinamen`)
    assert.match(d.version, /^\d+\.\d+\.\d+$/, `${d.slug}: Version`)
    assert.match(d.stand, /^\d{1,2}\. \p{L}+ 20\d\d$/u, `${d.slug}: Stand`)
    const kopf = d.md.split('\n').slice(0, 12).join('\n')
    assert.ok(kopf.includes('BtMM ist noch nicht gegründet'), `${d.slug}: Gründungshinweis im Kopf`)
    assert.ok(/Rechts- oder Steuerberatung/i.test(kopf), `${d.slug}: Rechtshinweis im Kopf`)
  }
  assert.deepEqual(parseKopf('# T\n\n**Dokument 07 · Version 1.2.3 · Stand 5. Mai 2027**'), {
    titel: 'T', nummer: '07', version: '1.2.3', stand: '5. Mai 2027',
  })
})

test('Seiten-Code zeigt die Hinweissätze nicht noch einmal', () => {
  // Beide Sätze stehen schon im Kopf jeder Datei. Die Dokumentseite wiederholt sie nicht.
  const q = lese('app/[locale]/dokumente/[slug]/page.tsx')
  assert.ok(!q.includes('noch nicht gegründet'))
  assert.ok(!/Rechts- oder Steuerberatung/i.test(q))
})

test('Gruppen: jedes Dokument genau einmal, keine Reste', () => {
  const g = gruppiert()
  const alleSlugs = g.flatMap((x) => x.docs.map((d) => d.slug))
  assert.equal(alleSlugs.length, 30)
  assert.equal(new Set(alleSlugs).size, 30)
  assert.ok(!g.some((x) => x.id === 'weitere'), 'Dokument ohne Gruppe')
  assert.equal(g.length, GRUPPEN.length)
  const ids = GRUPPEN.flatMap((x) => x.ids)
  assert.deepEqual([...ids].sort(), [...ERWARTET].sort())
})

test('Seite je Dokument: Impressum-Link, Canonical, nur Deutsch mit Hinweis, statisch', () => {
  const q = lese('app/[locale]/dokumente/[slug]/page.tsx')
  assert.match(q, /\/impressum/)
  assert.match(q, /Impressum<\/Link>/)
  assert.match(q, /canonical/)
  assert.match(q, /nur auf Deutsch verfügbar/)
  assert.match(q, /generateStaticParams/)
  assert.match(q, /dynamicParams = false/)
  const u = lese('app/[locale]/(seiten)/dokumente/page.tsx')
  assert.match(u, /\/impressum/)
  assert.match(u, /canonical/)
  assert.match(u, /nur auf Deutsch verfügbar/)
  // Footer (jede Seite) führt zum Impressum
  assert.match(lese('components/Footer.tsx'), /l\('\/impressum'\)/)
})

test('Sitemap: Übersicht und alle 30 Dokumentseiten', () => {
  const q = lese('app/sitemap.ts')
  assert.match(q, /'\/dokumente'/)
  assert.match(q, /dokumentSlugs\(\)/)
  assert.match(q, /\/de\$\{pfad\}/)
})

test('noindex nur auf Vorschau: Seiten setzen selbst kein noindex, Middleware und robots.ts regeln das', () => {
  for (const rel of ['app/[locale]/dokumente/[slug]/page.tsx', 'app/[locale]/(seiten)/dokumente/page.tsx']) {
    assert.ok(!/noindex|index:\s*false/.test(lese(rel)), rel)
  }
  assert.match(lese('middleware.ts'), /noindex, nofollow/)
  assert.match(lese('app/robots.ts'), /istProdHost/)
})

test('Metadaten je Dokument: Beschreibung mit Titel, Version, Stand; Pfade; Download-Name', () => {
  for (const d of alle()) {
    const b = beschreibung(d)
    assert.ok(b.includes(d.titel) && b.includes(d.version) && b.includes(d.stand))
    assert.ok(b.length < 260, `${d.slug}: Beschreibung zu lang`)
    assert.equal(pfad(d.slug), `/de/dokumente/${d.slug}`)
    assert.equal(downloadName(d), `${d.slug}_v${d.version}.md`)
  }
})

test('MD-Download: Route und Rewrite vorhanden, nur Dateien aus content/dokumente-web', () => {
  const r = lese('app/api/dokumente-md/[slug]/route.ts')
  assert.match(r, /lesen\(params\.slug\)/)
  assert.match(r, /dynamicParams = false/)
  assert.match(lese('next.config.mjs'), /source: '\/dokumente\/:slug\.md', destination: '\/api\/dokumente-md\/:slug'/)
  assert.equal(lesen('../package'), null)
  assert.equal(lesen('AENDERUNGEN'), null)
})

test('Alte Dokumentseiten: Redirects auf vorhandene neue Seiten, alte PDFs und Alt-Seite entfernt', () => {
  const s = new Set(slugs())
  assert.equal(Object.keys(ALT_NACH_NEU).length, 5)
  for (const neu of Object.values(ALT_NACH_NEU)) assert.ok(s.has(neu), neu)
  const alt = fs.existsSync(path.join(root, 'public/dokumente')) ? fs.readdirSync(path.join(root, 'public/dokumente')) : []
  assert.deepEqual(alt.filter((f) => f.endsWith('.pdf')), [])
  assert.ok(!lese('app/[locale]/(seiten)/dokumente/page.tsx').includes('drive-dokumente'))
  assert.ok(!lese('app/[locale]/dokumente/[slug]/page.tsx').includes('drive-dokumente'))
})

test('Bilder in Dokument 00: keine explain/fig-Verweise; relative Bilder bleiben ausgeblendet', () => {
  const md = lese('content/dokumente-web/00-einfach-erklaert.md')
  assert.ok(!/explain\/fig|\.\.\/explain/.test(md), '00 enthält noch explain/fig-Verweise')
  const q = lese('components/DokumentInhalt.tsx')
  assert.match(q, /\^\(https\?:\)\?/)
  assert.ok(!fs.existsSync(path.join(root, 'public', 'explain')))
})

test('Keine Emojis in der Ausgabe (Filter wie im Wissens-Index)', () => {
  for (const d of alle()) assert.equal(hatEmojis(d.md), false, `${d.slug}: Emoji in der Ausgabe`)
})

// Tabu-Prüfung gegen die Außensicht-Regeln (test/tabu-woerter.mjs).
// Streng (immer 0): Tabuwörter, die in keiner Webfassung vorkommen dürfen.
const STRENG = /hildastr|karner|happyfarm|oberkirch|elternhof|hof der eltern|krankheit|elternzeit|schwangerschaft|j\.s\.gartzke/i
test('Tabu streng: keine Treffer in den Dokumenten', () => {
  const treffer = alle().filter((d) => STRENG.test(d.md)).map((d) => d.slug)
  assert.deepEqual(treffer, [])
})

// Gemeldet (Stand 25.11., nach der Quellenbereinigung): Treffer der Außensicht-Liste.
// Grundsicherung und Jobcenter bleiben erlaubt und stehen in der Baseline.
// erkrank, hartz und buergergeld stehen auf 0. Mehr Treffer als in der Baseline schlagen an,
// weniger sind erlaubt (Baseline dann verkleinern). Entscheidung zu den Begriffen liegt bei Nutzer/DS-Bot.
test('Tabu Außensicht: keine neuen Treffer über die gemeldete Baseline hinaus', async () => {
  const { RX } = await import('./tabu-woerter.mjs')
  const ERLAUBT = /werdende (und junge )?Eltern/gi
  const rx = new RegExp(`${RX.source}|hartz|erkrankung`, 'gi')
  const baseline = JSON.parse(lese('test/fixtures/dokumente-web-tabu-baseline.json'))
  const neu = []
  for (const f of fs.readdirSync(DIR)) {
    const s = fs.readFileSync(path.join(DIR, f), 'utf8').replace(ERLAUBT, '')
    const zaehl = {}
    for (const m of s.match(rx) || []) zaehl[m.toLowerCase()] = (zaehl[m.toLowerCase()] || 0) + 1
    for (const [w, n] of Object.entries(zaehl)) {
      const erlaubt = baseline[f]?.[w] ?? 0
      if (n > erlaubt) neu.push(`${f}: ${w} ${n} > ${erlaubt}`)
    }
  }
  assert.deepEqual(neu, [])
})
