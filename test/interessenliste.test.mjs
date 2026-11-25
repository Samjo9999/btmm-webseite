// Interessenliste BtMM: Schalter aus, Texte in 11 Sprachen, Datenschutz-Auflagen. Nur Probedaten.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  CONSENT_TEXT_VERSION, INTERESSEN, SPANNEN, ZAEHLER_MINDESTWERT, EDGE_URL_STANDARD,
  interessenlisteAktiv, edgeUrl, spanneSichtbar, spanneCheckboxSichtbar, spanneGesperrtWegenBeitritt,
  baueNutzlast, tokenAusHash, fehlerSchluessel, zaehlerAnzeigen,
} from '../lib/interessenliste.mjs'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const lies = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const LOCALES = ['de', 'en', 'zh', 'es', 'hi', 'ar', 'bn', 'pt', 'ru', 'ja', 'fr']
const msgs = JSON.parse(lies('messages/interesse.json'))
const SEITEN = [
  'app/[locale]/(seiten)/gruendung/interesse/page.tsx',
  'app/[locale]/(seiten)/gruendung/interesse/bestaetigen/page.tsx',
  'app/[locale]/(seiten)/gruendung/interesse/abmelden/page.tsx',
]

test('Schalter ist standardmaessig aus und nur bei exakt "true" an', () => {
  assert.equal(interessenlisteAktiv({}), false)
  assert.equal(interessenlisteAktiv({ INTERESSENLISTE_AKTIV: '1' }), false)
  assert.equal(interessenlisteAktiv({ INTERESSENLISTE_AKTIV: 'false' }), false)
  assert.equal(interessenlisteAktiv({ INTERESSENLISTE_AKTIV: 'true' }), true)
})

test('Alle neuen Seiten geben bei ausgeschaltetem Schalter 404 und werden nie ohne Schalter gerendert', () => {
  for (const s of SEITEN) {
    const src = lies(s)
    assert.match(src, /dynamic = 'force-dynamic'/, s)
    const meta = src.indexOf('export async function generateMetadata')
    const page = src.indexOf('export default async function')
    assert.ok(meta >= 0 && page > meta, s)
    const metaSrc = src.slice(meta, page)
    const pageSrc = src.slice(page)
    assert.match(metaSrc, /if \(!interessenlisteAktiv\(\)\) notFound\(\)/, s + ' generateMetadata')
    assert.match(pageSrc, /if \(!interessenlisteAktiv\(\)\) notFound\(\)/, s + ' page')
    const guard = metaSrc.indexOf('if (!interessenlisteAktiv()) notFound()')
    const titelOderRobots = metaSrc.search(/title:|robots:/)
    assert.ok(guard >= 0 && titelOderRobots > guard, s + ': kein Titel/robots vor 404')
  }
  assert.match(lies(SEITEN[1]), /index: false/)
  assert.match(lies(SEITEN[2]), /index: false/)
})

test('Impressum-DSE-Block und Sitemap-Eintrag haengen am Schalter', () => {
  const imp = lies('app/[locale]/(seiten)/impressum/page.tsx')
  const i = imp.indexOf('interessenlisteAktiv() && (')
  assert.ok(i > 0)
  assert.ok(imp.indexOf('<h4>Interessenliste</h4>') > i)
  assert.ok(imp.indexOf('<h4>Terminbuchung</h4>') > imp.indexOf('<h4>Interessenliste</h4>'))
  for (const muss of ['Art. 6 Abs. 1 lit. a DSGVO', '§ 7 UWG', 'Resend (Plus Five Five, Inc., USA)', 'Art. 28 DSGVO', 'eu-central-1', 'nach 7 Tagen', '12 Monate nach der', '36', 'keine Tracking-Pixel', 'bis zur Eintragung der Genossenschaft Johannes-Samuel Gartzke', 'nicht über unseren Webserver bei Vercel', 'Pte. Ltd.', '12 Monate einen Prüfwert', 'höchstens', 'Frankfurt', 'innerhalb von 14 Tagen', 'höchstens 2 Stunden']) {
    assert.ok(imp.includes(muss), 'DSE-Block: ' + muss)
  }
  const sb = imp.slice(imp.indexOf('<h4>Supabase</h4>'), imp.indexOf('<h4>Wissens-Assistent'))
  assert.match(sb, /Supabase Pte\. Ltd\./)
  assert.doesNotMatch(sb, /Supabase Inc/)
  assert.doesNotMatch(sb, /Datentransfer in die USA/)
  assert.match(lies('app/sitemap.ts'), /interessenlisteAktiv\(\) \? \[\.\.\.PFADE, '\/gruendung\/interesse'\]/)
  assert.doesNotMatch(imp, /Supabase Inc/)
  assert.ok((imp.match(/Supabase Pte\. Ltd\./g) || []).length >= 2, 'Supabase Pte. Ltd. in DSE')
  const anbieter = imp.slice(0, imp.indexOf('id="datenschutz"'))
  assert.ok(anbieter.includes('Angaben gemäß § 5 DDG'))
  assert.doesNotMatch(anbieter, /Supabase/)
})

test('Link von /gruendung auf die Interessenliste nur bei Schalter an', () => {
  const src = lies('app/[locale]/(seiten)/gruendung/page.tsx')
  assert.match(src, /dynamic = 'force-dynamic'/)
  const i = src.indexOf('interessenlisteAktiv() &&')
  assert.ok(i > 0)
  assert.match(src.slice(i, i + 800), /\/gruendung\/interesse/)
  assert.equal([...src.matchAll(/gruendung\/interesse/g)].length, 1)
})

test('Keine Vercel-API-Route und kein Service-Role-Key fuer die Interessenliste', () => {
  const api = fs.readdirSync(path.join(root, 'app/api'))
  assert.deepEqual(api.filter((n) => /interesse/i.test(n)), [])
  for (const f of ['components/Interesse.tsx', 'lib/interessenliste.mjs', ...SEITEN]) {
    const src = lies(f)
    assert.doesNotMatch(src, /service[_-]?role|SERVICE_ROLE|resend|RESEND/i, f)
    assert.doesNotMatch(src, /\/api\//, f)
    assert.doesNotMatch(src, /mailerlite|startnext|gofundme|stripe|paypal|checkout/i, f)
  }
  assert.match(lies('components/Interesse.tsx'), /fetch\(edgeUrl/)
  assert.match(EDGE_URL_STANDARD, /^https:\/\/xcngmshjuqoucdlgikao\.supabase\.co\/functions\/v1\/interessenliste$/)
})

test('Edge-URL: nur https aus der Umgebung, sonst Standard', () => {
  assert.equal(edgeUrl({}), EDGE_URL_STANDARD)
  assert.equal(edgeUrl({ INTERESSENLISTE_EDGE_URL: 'http://boese.example.invalid' }), EDGE_URL_STANDARD)
  assert.equal(edgeUrl({ INTERESSENLISTE_EDGE_URL: 'https://example.invalid/f' }), 'https://example.invalid/f')
})

test('Spanne nur bei Dankeschoen, zweite Checkbox nur bei gewaehlter Spanne', () => {
  assert.equal(spanneSichtbar(['informiert']), false)
  assert.equal(spanneSichtbar(['informiert', 'dankeschoen']), true)
  assert.equal(spanneCheckboxSichtbar(['dankeschoen'], 'keine'), false)
  assert.equal(spanneCheckboxSichtbar(['dankeschoen'], '25_50'), true)
  assert.equal(spanneCheckboxSichtbar(['gruendung'], '25_50'), false)
  assert.equal(spanneSichtbar(['dankeschoen', 'beitritt']), false)
  assert.equal(spanneSichtbar(['dankeschoen', 'gruendung']), false)
  assert.equal(spanneGesperrtWegenBeitritt(['dankeschoen', 'beitritt']), true)
  assert.equal(spanneGesperrtWegenBeitritt(['dankeschoen', 'gruendung']), true)
  assert.equal(spanneGesperrtWegenBeitritt(['dankeschoen']), false)
})

test('Nutzlast: Spanne nur mit Dankeschoen UND zweiter Einwilligung, sonst null', () => {
  const basis = { name: ' ', email: ' probe@example.invalid ', consentInfo: true, sprache: 'de', startedAt: 1 }
  const ohneZweite = baueNutzlast({ ...basis, interessen: ['dankeschoen'], spanne: '50_100', consentSpanne: false })
  assert.equal(ohneZweite.spanne, null)
  assert.equal(ohneZweite.consentSpanne, false)
  assert.equal(ohneZweite.name, null)
  assert.equal(ohneZweite.email, 'probe@example.invalid')
  const mit = baueNutzlast({ ...basis, interessen: ['dankeschoen'], spanne: '50_100', consentSpanne: true })
  assert.equal(mit.spanne, '50_100')
  const ohneDank = baueNutzlast({ ...basis, interessen: ['gruendung'], spanne: '50_100', consentSpanne: true })
  assert.equal(ohneDank.spanne, null)
  const mitBeitritt = baueNutzlast({ ...basis, interessen: ['dankeschoen', 'beitritt'], spanne: '100_250', consentSpanne: true })
  assert.equal(mitBeitritt.spanne, null)
  assert.equal(mitBeitritt.consentSpanne, false)
  const mitGruendung = baueNutzlast({ ...basis, interessen: ['dankeschoen', 'gruendung'], spanne: '100_250', consentSpanne: true })
  assert.equal(mitGruendung.spanne, null)
  assert.equal(mitGruendung.consentSpanne, false)
  assert.equal(mit.consentTextVersion, CONSENT_TEXT_VERSION)
  assert.equal(mit.action, 'anmelden')
  // kein Kommentarfeld, keine IP, kein User-Agent
  assert.deepEqual(Object.keys(mit).sort(), ['action', 'consentInfo', 'consentSpanne', 'consentTextVersion', 'email', 'interessen', 'name', 'spanne', 'sprache', 'startedAt', 'website'])
})

test('Token nur aus dem URL-Fragment', () => {
  assert.equal(tokenAusHash('#t=' + 'A'.repeat(43)), 'A'.repeat(43))
  assert.equal(tokenAusHash('?t=' + 'A'.repeat(43)), null)
  assert.equal(tokenAusHash('#t=kurz'), null)
  assert.equal(tokenAusHash(''), null)
  const form = lies('components/Interesse.tsx')
  assert.match(form, /window\.location\.hash/)
  assert.doesNotMatch(form, /searchParams|location\.search/)
})

test('Fehlerzuordnung und Zaehler-Mindestwert', () => {
  assert.equal(fehlerSchluessel(429), 'fehler_limit')
  assert.equal(fehlerSchluessel(503), 'fehler_aus')
  assert.equal(fehlerSchluessel(400, 'email'), 'fehler_email')
  assert.equal(zaehlerAnzeigen(ZAEHLER_MINDESTWERT - 1), false)
  assert.equal(zaehlerAnzeigen(ZAEHLER_MINDESTWERT), true)
})

test('Formular: nichts vorangekreuzt, Pflicht-Checkbox, Honeypot, Link zur DSE, keine Zahlungsfelder', () => {
  const f = lies('components/Interesse.tsx')
  assert.match(f, /useState\(false\)/)
  assert.doesNotMatch(f, /defaultChecked|checked=\{true\}/)
  assert.match(f, /aria-hidden="true"/)
  assert.match(f, /impressum#interessenliste/)
  assert.match(f, /spanne_nicht_mit_beitritt/)
  assert.match(f, /locale !== 'de'/)
  assert.match(f, /uebersetzung_hinweis/)
  assert.doesNotMatch(f, /iban|kreditkarte|lastschrift|textarea|kommentar/i)
  assert.match(f, /credentials: 'omit'/)
  assert.match(f, /x-region/)
})

test('Texte: 11 Sprachen mit identischen Schluesseln, nichts leer', () => {
  const de = Object.keys(msgs.de).sort()
  for (const l of LOCALES) {
    assert.deepEqual(Object.keys(msgs[l]).sort(), de, l)
    for (const [k, v] of Object.entries(msgs[l])) assert.ok(typeof v === 'string' && v.trim().length >= 2, `${l}.${k}`)
  }
  for (const i of INTERESSEN) assert.ok(`o_${i}` in msgs.de, i)
  for (const s of SPANNEN) assert.ok(`s_${s}` in msgs.de, s)
})

test('Texte: Pflichtinhalte der Einwilligung, wortgleich aus der Datenschutz-Freigabe (DE)', () => {
  const d = msgs.de
  for (const muss of ['Ich willige ein, dass Johannes-Samuel Gartzke (Kleingewerbe', 'Plus Five Five, Inc., USA', 'Auftragsverarbeiter', 'die Daten liegen bei Supabase', 'es fließt kein Geld', 'ich trete damit nicht bei', 'mit Wirkung für die Zukunft widerrufen', 'office@b-t-m-m.com', 'BtMM eG', 'kann widersprechen']) {
    assert.ok(d.consent_info.includes(muss), muss)
  }
  assert.ok(d.consent_spanne.startsWith('Ich willige gesondert ein, dass die von mir gewählte, unverbindliche Betragsspanne gespeichert wird.'))
  assert.ok(d.consent_spanne.includes('nicht veröffentlicht'))
  assert.ok(d.o_gruendung === 'Ich kann mir vorstellen, BtMM als Gründungsmitglied mitzugründen.')
  assert.ok(d.o_gruendung_klein.startsWith('Unverbindlich. Gründungsmitglieder zeichnen auf der Gründungsversammlung einen Geschäftsanteil'))
  assert.ok(d.spanne_hinweis.includes('keine Geschäftsanteile'))
  assert.ok(d.lead.includes('Es fließt kein Geld.'))
  assert.ok(d.passiert.includes('vorläufig') && d.passiert.includes('höchstens 7 Tage'))
  assert.ok(d.danke_text.startsWith('Bitte sieh in dein Postfach') && d.danke_text.includes('7 Tagen'))
  assert.ok(d.abmelden_text.includes('Prüfwert') && d.abmelden_text.includes('12 Monate'))
  assert.ok(d.abmelden_ok.includes('Prüfwert') && d.abmelden_ok.includes('12 Monate'))
  assert.ok(d.spanne_nicht_mit_beitritt.includes('Beitritt') && d.spanne_nicht_mit_beitritt.includes('Gründungsmitglied'))
  assert.ok(msgs.en.uebersetzung_hinweis.startsWith('This translation was machine-generated.'))
})

test('Texte: Option Gruendung ohne Betraege und ohne Geld-Werbung, kein Beitritts-Label', () => {
  for (const l of LOCALES) {
    assert.doesNotMatch(msgs[l].o_gruendung + msgs[l].o_gruendung_klein, /€|\beuros?\b|\d{2,}/i, l)
  }
  assert.doesNotMatch(msgs.de.o_beitritt, /^Mitglied werden/)
  assert.ok(msgs.de.o_beitritt.includes('kein Beitritt jetzt'))
})

test('Texte: kein Spenden-, Rendite-, Zahlungs- oder Heilwording, keine Emojis', () => {
  const verboten = /spende|spenden|donat|absetzbar|gemeinnützig|rendite|zins|darlehen|jetzt sichern|zahlung jetzt|heilung|heilt|krebs/i
  const emoji = /[\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F000}-\u{1FAFF}]/u
  for (const l of LOCALES) {
    for (const [k, v] of Object.entries(msgs[l])) {
      assert.doesNotMatch(v, emoji, `${l}.${k}`)
      if (l === 'de' || l === 'en') assert.doesNotMatch(v, verboten, `${l}.${k}`)
    }
  }
})

test('Texte: Unverbindlichkeit in jeder Sprache beim Lead und bei der Spanne ohne Euro-Summen oeffentlich', () => {
  for (const l of LOCALES) {
    assert.ok(msgs[l].lead.length > 60, l)
    assert.ok(msgs[l].spanne_hinweis.length > 40, l)
  }
  // keine Euro-Summen ausserhalb der Spannen-Labels (oeffentlich nur Zaehler)
  for (const l of LOCALES) assert.doesNotMatch(msgs[l].zaehler, /€|\beuros?\b/i)
  assert.ok(msgs.de.zaehler.includes('{anzahl}'))
})

test('Texte: Formularseiten nutzen den Namensraum interesse; i18n laedt ihn aus einer Datei', () => {
  assert.match(lies('i18n.ts'), /messages\/interesse\.json/)
  assert.match(lies('i18n.ts'), /angebote, interesse \}/)
  assert.deepEqual(Object.keys(msgs).sort(), [...LOCALES].sort())
})

test('Texte: Tabuwoerter kommen nicht vor (eigene Pruefung dieser Dateien)', async () => {
  const { RX } = await import('./tabu-woerter.mjs')
  for (const l of LOCALES) {
    const s = JSON.stringify(msgs[l])
    assert.doesNotMatch(s, new RegExp(RX.source, 'i'), l)
  }
  for (const f of ['components/Interesse.tsx', 'lib/interessenliste.mjs', ...SEITEN]) {
    assert.doesNotMatch(lies(f), new RegExp(RX.source, 'i'), f)
  }
  // Anschrift steht nur im Impressum, nicht im Formular
  assert.doesNotMatch(JSON.stringify(msgs.de), /Hildastr/i)
})
