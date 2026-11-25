#!/usr/bin/env node
// Überzeugungstür: deterministische Persona-Simulation (kein LLM, 0 €).
// Nutzt die ECHTE Pfadlogik (public/tuer/pfad.js) und die echten Tür-Texte (public/tuer/texte.js) des Repos
// sowie die gerenderten Zielseiten (seiten.json von seiten.mjs, lokal 127.0.0.1).
// Nutzung: node scripts/personas/sim.mjs --seiten <seiten.json> --n 1000 --seeds 1,2,3 --aus <dir> [--gegen <schnell.json>]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import { ARCHETYPEN, ALTER, LEBENSLAGE_NACH_ALTER, LEBENSLAGE_NEED, GERAETE, VERTIEFER_ANTEIL, antwortFuer, bankWaehlen, chipFuer } from './personas.mjs'
import { themenAuf, THEMEN } from './themen.mjs'
import { scanPfad, scanAusgeliefert } from './tabu.mjs'

const require = createRequire(import.meta.url)
const REPO = fileURLToPath(new URL('../../', import.meta.url))
const a = process.argv.slice(2), opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d }
const N = Number(String(opt('--n', '1000')).replace(/_/g, ''))
const SEEDS = opt('--seeds', '1').split(',').map(Number)
const AUS = opt('--aus', null)
const BANK = opt('--bank', 'a'); bankWaehlen(BANK)
// Runde 4: Anteil Chip-Nutzer (Rest Freitext); 0 = reiner Freitext wie r1–r3
const CHIP = Number(opt('--chip', '0'))
const SEITEN = JSON.parse(readFileSync(opt('--seiten'), 'utf8'))

const PF = require(REPO + 'public/tuer/pfad.js')
const sb = { window: {} }; vm.runInNewContext(readFileSync(REPO + 'public/tuer/texte.js', 'utf8'), sb)
try { vm.runInNewContext(readFileSync(REPO + 'public/tuer/texte-luecken.js', 'utf8'), sb) } catch {}
try { vm.runInNewContext(readFileSync(REPO + 'public/tuer/texte-r3.js', 'utf8'), sb) } catch {}
try { vm.runInNewContext(readFileSync(REPO + 'public/tuer/texte-r4.js', 'utf8'), sb) } catch {}
const TEXTE = sb.window.BTMM_TUER_TEXTE
const M = PF.merkmaleFuer(TEXTE.de, TEXTE.de, 'de')
let commit = 'unbekannt'; try { commit = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim() } catch {}
const dirty = (() => { try { return execSync('git status --porcelain -- public/tuer', { cwd: REPO }).toString().trim().length > 0 } catch { return false } })()

// ---------- Seiten: Themen (de) und Status (alle Locales) ----------
const THEMA_JE_HREF = {}, STATUS = {}
for (const s of SEITEN.seiten) {
  STATUS[s.locale + '|' + s.href] = s.status
  if (s.locale === 'de' && s.text) THEMA_JE_HREF[s.href] = s.status === 200 ? themenAuf(s.text) : {}
}
const LOCALES = [...new Set(SEITEN.seiten.map((s) => s.locale))].filter((l) => l !== 'de' || true)

// ---------- Tür-Dialog (Spiegel von tuer.js naechsteFrage) ----------
// Fragefolge direkt aus pfad.js (dieselbe Logik wie tuer.js)
const naechsteFrage = (st) => PF.naechsteFrage(st)

// ---------- Zufall ----------
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s >>>= 0; s ^= s << 5; s >>>= 0; return s / 4294967296 } }
const pick = (r, obj) => { const e = Object.entries(obj); let t = r() * e.reduce((x, [, w]) => x + (typeof w === 'number' ? w : w.w), 0); for (const [k, w] of e) { t -= typeof w === 'number' ? w : w.w; if (t <= 0) return k } return e[e.length - 1][0] }
const gauss = (r) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r())

const GERAET = {
  hochkant: { lese: 0.45, schritte: 2, abbruch: 0.03, ohne: 0.1 },
  quer:     { lese: 0.6, schritte: 2.5, abbruch: 0.025, ohne: 0.08 },
  desktop:  { lese: 0.8, schritte: 3, abbruch: 0.015, ohne: 0.06 },
}

function einLauf(r) {
  const typ = pick(r, ARCHETYPEN), A = ARCHETYPEN[typ]
  const alter = pick(r, ALTER), lage = pick(r, LEBENSLAGE_NACH_ALTER[alter]), geraet = pick(r, GERAETE)
  const vertiefer = r() < VERTIEFER_ANTEIL
  const weg = CHIP > 0 && r() < CHIP ? 'chip' : 'freitext'
  const persona = { typ, alter, lage, geraet, vertiefer, weg, leerRate: geraet === 'hochkant' ? 0.12 : 0.07 }
  const G = GERAET[geraet]
  const res = { typ, alter, lage, geraet, vertiefer, weg, wegTyp: weg + '|' + typ, wegLage: weg + '|' + lage, lageErkannt: 0, ueberzeugt: 0, pfadTreffer: 0, abbruch: 0, ohneTuer: 0, pfad: null, fehlend: [] }
  // Tür
  let hrefs
  if (r() < G.ohne) { res.ohneTuer = 1; hrefs = [''] }
  else {
    const st = { gestellt: [], profil: {} }
    for (let f; (f = naechsteFrage(st));) {
      if (r() < G.abbruch) { res.abbruch = 1; return res }
      st.gestellt.push(f.id)
      const t = weg === 'chip' && PF.WAHL[f.id] ? PF.wahlProfil(f.id, chipFuer(r, persona, f.id)) : PF.auswerten(M, antwortFuer(r, persona, f.id))
      for (const k in t) st.profil[k] = (st.profil[k] || 0) + t[k]
    }
    const LAGE_MERKMAL = { berufseinstieg: 'einstieg', familie: 'lebensphase', umbruch: 'lebensphase', ruhestand: PF.SCHRITTE.ruhestand ? 'ruhestand' : 'lebensphase' }
    res.lageErkannt = st.profil[LAGE_MERKMAL[lage]] ? 1 : 0
    const keys = PF.pfadBauen(st.profil)
    res.pfad = keys.join('>')
    const motiv = keys.slice(0, -1)
    res.pfadTreffer = (motiv.slice(0, 2).some((k) => A.eigen.includes(k)) || (typ === 'unterstuetzer' && keys.some((k) => A.eigen.includes(k)))) ? 1 : 0
    hrefs = keys.map((k) => PF.SCHRITTE[k].href)
  }
  // Lesen
  let n = Math.max(1, Math.round(G.schritte + (r() * 2 - 0.7) + (vertiefer ? 2 : 0) + (alter === '65+' ? 0.5 : 0) - (alter === '18-29' ? 0.3 : 0)))
  const anteil = vertiefer ? 1 : Math.min(1, Math.max(0.2, G.lese + (r() - 0.5) * 0.2))
  const needs = { ...A.needs, [LEBENSLAGE_NEED[lage]]: 1 }
  const gedeckt = {}
  let lageImPfad = false
  for (const h of hrefs) {
    const th = THEMA_JE_HREF[h] || {}
    if (th[LEBENSLAGE_NEED[lage]] != null) lageImPfad = true
    if (n-- <= 0) continue
    for (const k in needs) if (th[k] != null && th[k] <= anteil) gedeckt[k] = 1
  }
  let ges = 0, hat = 0
  for (const k in needs) { ges += needs[k]; if (gedeckt[k]) hat += needs[k]; else res.fehlend.push(k) }
  const score = hat / ges + (res.pfadTreffer ? 0.05 : 0)
  const schwelle = A.schwelle + 0.07 * gauss(r)
  res.ueberzeugt = score >= schwelle ? 1 : 0
  res.lageImPfad = lageImPfad ? 1 : 0
  return res
}

function lauf(seed, n) {
  const r = rng(seed * 2654435761)
  const dims = ['typ', 'alter', 'lage', 'geraet', 'vertiefer', 'weg', 'wegTyp', 'wegLage']
  const agg = {}; for (const d of dims) agg[d] = {}
  const pfade = {}, fehlend = {}, fehlendGeraet = {}, nGeraet = {}
  let ges = { n: 0, mitPfad: 0, ueberzeugt: 0, pfadTreffer: 0, abbruch: 0, ohneTuer: 0 }
  for (let i = 0; i < n; i++) {
    const x = einLauf(r)
    ges.n++; if (x.pfad) ges.mitPfad++; ges.ueberzeugt += x.ueberzeugt; ges.pfadTreffer += x.pfadTreffer; ges.abbruch += x.abbruch; ges.ohneTuer += x.ohneTuer
    for (const d of dims) {
      const k = String(x[d]), g = (agg[d][k] ||= { n: 0, mitPfad: 0, ueberzeugt: 0, pfadTreffer: 0, abbruch: 0, lageImPfad: 0, lageErkannt: 0, lageSchrittBeiErkannt: 0 })
      g.n++; g.ueberzeugt += x.ueberzeugt; g.abbruch += x.abbruch; if (x.pfad) g.mitPfad++
      // Pfad-Treffer je Gruppe: Lebenslage braucht zusätzlich Lage-Inhalt im Pfad
      g.pfadTreffer += (d === 'lage' || d === 'wegLage') ? (x.pfadTreffer && x.lageImPfad ? 1 : 0) : x.pfadTreffer
      g.lageImPfad += x.lageImPfad || 0
      if (x.pfad && x.lageErkannt) { g.lageErkannt++; g.lageSchrittBeiErkannt += x.lageImPfad }
    }
    if (x.pfad) { const p = (pfade[x.typ] ||= {}); p[x.pfad] = (p[x.pfad] || 0) + 1 }
    const f = (fehlend[x.typ] ||= {}); for (const k of x.fehlend) f[k] = (f[k] || 0) + 1
    const kg = x.typ + '|' + x.geraet; nGeraet[kg] = (nGeraet[kg] || 0) + 1; if (!x.ueberzeugt) { const fg = (fehlendGeraet[kg] ||= {}); for (const k of x.fehlend) fg[k] = (fg[k] || 0) + 1 }
  }
  // Pfad-Treffer = Anteil passender Pfade unter allen, die einen Pfad bekommen haben (Abbruch und „ohne Fragen“ separat ausgewiesen)
  const q = (g) => ({ n: g.n, ueberzeugt: +(g.ueberzeugt / g.n).toFixed(4), pfadTreffer: +(g.pfadTreffer / (g.mitPfad || 1)).toFixed(4), pfadTrefferAlle: +(g.pfadTreffer / g.n).toFixed(4), abbruch: +(g.abbruch / g.n).toFixed(4), ...(g.lageImPfad !== undefined ? { lageImPfad: +(g.lageImPfad / g.n).toFixed(4), lageErkannt: +(g.lageErkannt / (g.mitPfad || 1)).toFixed(4), lageSchrittBeiErkannt: +(g.lageSchrittBeiErkannt / (g.lageErkannt || 1)).toFixed(4) } : {}) })
  const out = { seed, n, gesamt: q(ges) }
  for (const d of dims) { out[d] = {}; for (const k of Object.keys(agg[d]).sort()) out[d][k] = q(agg[d][k]) }
  out.topPfade = {}; for (const t in pfade) out.topPfade[t] = Object.entries(pfade[t]).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([p, c]) => [p, +(c / out.typ[t].n).toFixed(3)])
  out.fehlendeThemen = {}; for (const t in fehlend) out.fehlendeThemen[t] = Object.fromEntries(Object.entries(fehlend[t]).sort((x, y) => y[1] - x[1]).map(([k, c]) => [k, +(c / out.typ[t].n).toFixed(3)]))
  out.fehlendNichtUeberzeugtJeTypGeraet = {}; for (const kg in fehlendGeraet) out.fehlendNichtUeberzeugtJeTypGeraet[kg] = Object.fromEntries(Object.entries(fehlendGeraet[kg]).sort((x, y) => y[1] - x[1]).slice(0, 4).map(([k, c]) => [k, +(c / nGeraet[kg]).toFixed(3)]))
  return out
}

// ---------- Pfadenden und Tabu ----------
const endpunkte = {}
for (const [k, s] of Object.entries(PF.SCHRITTE)) for (const l of LOCALES) { const st = STATUS[l + '|' + s.href]; if (st !== 200) (endpunkte[k] ||= []).push(`${l}${s.href}=${st ?? 'nicht geprüft'}`) }
const tabu = scanPfad(REPO, SEITEN)
const tabuAus = scanAusgeliefert(REPO)
// Seiten, die im Pfad tatsächlich vorkommen können (Tür + Schritt-Ziele, alle Locales)
const pfadHrefs = new Set(['', ...Object.values(PF.SCHRITTE).map((s) => s.href)])
const tabuImPfad = tabu.treffer.filter((t) => !t.quelle.startsWith('/') || pfadHrefs.has(t.quelle.replace(/^\/[a-z]{2}/, '')) || t.quelle.startsWith('/tuer'))
// Lücken: Themen, die auf KEINER erreichbaren Seite stehen
const luecken = Object.keys(THEMEN).filter((k) => !Object.values(THEMA_JE_HREF).some((th) => th[k] != null))
const luckenImPfad = Object.keys(THEMEN).filter((k) => ![...pfadHrefs].some((h) => (THEMA_JE_HREF[h] || {})[k] != null))

const t0 = Date.now()
const laeufe = SEEDS.map((s) => lauf(s, N))
const ms = Date.now() - t0

// Spannen über Seeds und Abweichung gegen Vergleichslauf
const gruppen = (o) => Object.fromEntries(['typ', 'alter', 'lage', 'geraet', 'vertiefer', 'weg'].flatMap((d) => Object.entries(o[d]).map(([k, v]) => [d + ':' + k, v])))
const G0 = laeufe.map(gruppen)
const spanne = {}; for (const k of Object.keys(G0[0])) { const v = G0.map((g) => g[k]?.ueberzeugt ?? 0); spanne[k] = +((Math.max(...v) - Math.min(...v)) * 100).toFixed(2) }
let abweichung = null
if (opt('--gegen')) { const ref = gruppen(JSON.parse(readFileSync(opt('--gegen'), 'utf8')).laeufe[0]); abweichung = {}; for (const k in G0[0]) if (ref[k]) abweichung[k] = +((G0[0][k].ueberzeugt - ref[k].ueberzeugt) * 100).toFixed(2) }

// Stopp-Kriterium
const g = G0[0], pruef = []
for (const [k, v] of Object.entries(g)) {
  if (v.ueberzeugt < 0.7) pruef.push(`${k} überzeugt ${(v.ueberzeugt * 100).toFixed(1)} % < 70`)
  if (v.pfadTreffer < 0.8) pruef.push(`${k} Pfad-Treffer ${(v.pfadTreffer * 100).toFixed(1)} % < 80`)
}
if (SEEDS.length > 1) for (const [k, v] of Object.entries(spanne)) if (k.startsWith('typ:') && v > 3) pruef.push(`${k} Seed-Spanne ${v} pp > 3`)
if (abweichung) for (const [k, v] of Object.entries(abweichung)) if (Math.abs(v) > 2) pruef.push(`${k} Abweichung zum Vergleich ${v} pp > 2`)
if (tabuImPfad.length) pruef.push(`Tabu-Treffer im Pfad: ${tabuImPfad.length}`)
if (tabuAus.treffer.length) pruef.push(`Tabu-Treffer in ausgelieferten Dateien: ${tabuAus.treffer.length}`)
if (Object.keys(endpunkte).length) pruef.push(`Pfadziele nicht 200: ${Object.values(endpunkte).flat().length}`)

const ergebnis = {
  zeit: new Date().toISOString(), commit, bank: BANK, chipAnteil: CHIP, tuerGeaendertUncommitted: dirty, n: N, seeds: SEEDS, laufzeitMs: ms, kostenEuro: 0,
  modell: 'deterministisch, kein LLM; Überzeugt = gewichtete Abdeckung der Persona-Bedürfnisse durch die gelesenen Pfadseiten ≥ persönliche Schwelle',
  stopp: { bestanden: pruef.length === 0, offen: pruef },
  spanneSeedsPp: SEEDS.length > 1 ? spanne : null, abweichungPp: abweichung,
  tabu: { trefferImPfad: tabuImPfad.length, treffer: tabuImPfad, trefferAusserhalbPfad: tabu.treffer.length - tabuImPfad.length, hinweise: tabu.hinweise.length, quellen: tabu.gescannt.length,
    ausgeliefert: { dateien: tabuAus.dateien, treffer: tabuAus.treffer.length, liste: tabuAus.treffer, hinweise: tabuAus.hinweise.length } },
  pfadziele: { nicht200: endpunkte }, konzeptLuecken: { nirgends: luecken, nichtImPfad: luckenImPfad },
  laeufe,
}
if (AUS) { mkdirSync(AUS, { recursive: true }); writeFileSync(AUS + '/ergebnis.json', JSON.stringify(ergebnis, null, 1)) }
const pct = (x) => (x * 100).toFixed(1).padStart(5)
console.log(`commit ${commit.slice(0, 7)}${dirty ? '+lokal' : ''}  Bank ${BANK}  Chip-Anteil ${CHIP}  N=${N} seeds=${SEEDS} ${ms} ms  Kosten 0 €`)
for (const d of ['typ', 'alter', 'lage', 'geraet', 'vertiefer', 'weg']) { console.log(`-- ${d}`); for (const [k, v] of Object.entries(laeufe[0][d])) console.log(`  ${k.padEnd(18)} überzeugt ${pct(v.ueberzeugt)} %  Pfad ${pct(v.pfadTreffer)} %  Abbruch ${pct(v.abbruch)} %${d === 'lage' ? '  Lage erkannt ' + pct(v.lageErkannt) + ' %, davon Lage-Schritt ' + pct(v.lageSchrittBeiErkannt) + ' %' : ''}${SEEDS.length > 1 ? '  Spanne ' + spanne[d + ':' + k] + ' pp' : ''}${abweichung ? '  Δ ' + abweichung[d + ':' + k] + ' pp' : ''}`) }
console.log(`Tabu im Pfad: ${tabuImPfad.length} (außerhalb Pfad: ${tabu.treffer.length - tabuImPfad.length}), ausgeliefert: ${tabuAus.treffer.length} in ${tabuAus.dateien} Dateien  Pfadziele ≠200: ${Object.values(endpunkte).flat().length}  Lücken: ${luecken.join(',') || '-'} | nicht im Pfad: ${luckenImPfad.join(',') || '-'}`)
console.log(`Stopp-Kriterium: ${pruef.length ? 'NICHT erfüllt (' + pruef.length + ' Punkte)' : 'ERFÜLLT'}`)
