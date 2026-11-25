// Holt die Pfad-Zielseiten aller 11 Locales von einem LOKALEN Server (next start) und speichert Status, Text und HTML.
// Nutzung: node scripts/personas/seiten.mjs --basis http://127.0.0.1:3101 --aus <seiten.json>
import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const PF = require('../../public/tuer/pfad.js')

const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d }
const BASIS = opt('--basis', 'http://127.0.0.1:3101'), AUS = opt('--aus', 'seiten.json')
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(BASIS)) { console.error('Nur lokaler Server erlaubt (127.0.0.1).'); process.exit(2) }
const LOCALES = ['de', 'en', 'zh', 'es', 'hi', 'ar', 'bn', 'pt', 'ru', 'ja', 'fr']
const ZUSATZ = ['', '/konzept/wirtschaft', '/kosten', '/geldfluss', '/offene-fragen', '/konzept/gemeinschaft', '/angebote', '/zellen', '/faq']
const hrefs = [...new Set([...Object.values(PF.SCHRITTE).map((s) => s.href), ...ZUSATZ])]

function text(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(header|nav)[\s\S]*?<\/\1>/gi, ' ').replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim().toLowerCase()
}
const seiten = []
const ziele = [['/tuer/index.html?lang=de', 'de', '/tuer']]
for (const l of LOCALES) for (const h of hrefs) ziele.push([`/${l}${h}`, l, h])
for (const [pfad, locale, href] of ziele) {
  const r = await fetch(BASIS + pfad, { redirect: 'follow', headers: { 'user-agent': 'btmm-personas-harness' } })
  const html = await r.text()
  seiten.push({ url: pfad, locale, href, status: r.status, endUrl: r.url.replace(BASIS, ''), text: locale === 'de' ? text(html) : undefined, html })
}
writeFileSync(AUS, JSON.stringify({ basis: BASIS, zeit: new Date().toISOString(), seiten }))
const schlecht = seiten.filter((s) => s.status !== 200)
console.log(`Seiten: ${seiten.length}, nicht 200: ${schlecht.length}`, schlecht.map((s) => `${s.url}→${s.status}`).join(' '))
