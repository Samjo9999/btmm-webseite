// Tabuwort-Scan für Tür, Pfad-Texte und Pfad-Zielseiten (alle 11 Locales).
// Treffer = harte Tabus (Bürgergeld, Jobcenter, Krankheit, Erkrankung, Elternzeit, Schwangerschaft, Eltern/Elternhof)
// inkl. Übersetzungen. Hinweise = Grenzfälle (z. B. „Mutter“/„Vater“ als Herkunfts-Schlagwort), zählen nicht als Treffer.
// Nutzung: node scripts/personas/tabu.mjs [--seiten <seiten.json>] [--repo-weit] [--json out.json]
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const L = '[\\p{L}\\p{M}]'
const wort = (w) => new RegExp(`(?<!${L})${w}`, 'giu')          // Wortanfang
const ganz = (w) => new RegExp(`(?<!${L})${w}(?!${L})`, 'giu')  // ganzes Wort
const teil = (w) => new RegExp(w, 'giu')                        // Teilstring (CJK, Devanagari, Bengali)

export const TABU = {
  buergergeld: [wort('b(?:ü|ue)rgergeld'), wort("citizens?['’]? ?income"), wort('unemployment benefit'), wort('revenu citoyen'), wort('allocations? ch(?:ô|o)mage'),
    wort('subsidio de desempleo'), wort('ingreso ciudadano'), wort('aux(?:í|i)lio[- ]desemprego'), wort('rendimento do cidad'), wort('пособи[ея] по безработице'),
    teil('إعانة البطالة'), teil('失业救济'), teil('公民收入'), teil('失業手当'), teil('生活保護'), teil('市民手当'), teil('बेरोजगारी भत्ता'), teil('বেকার ভাতা')],
  jobcenter: [wort('job ?cent(?:er|re)'), wort('arbeitsamt'), wort('p(?:ô|o)le emploi'), wort('france travail'), wort('oficina de empleo'), wort('centro de emprego'),
    wort('центр занятости'), teil('مكتب العمل'), teil('مركز التوظيف'), teil('就业中心'), teil('ハローワーク'), teil('ジョブセンター'), teil('रोज़?गार (?:कार्यालय|केंद्र)'), teil('কর্মসংস্থান কেন্দ্র')],
  krankheit: [wort('krankheit'), ganz('krank'), wort('illness'), wort('sickness'), wort('disease'), wort('maladie'), wort('enfermedad'), wort('doen(?:ç|c)a'),
    wort('болезн'), ganz('ال?مرض'), teil('疾病'), teil('生病'), teil('患病'), teil('病気'), teil('疾患'), teil('बीमारी'), teil('অসুস্থ'), wort('রোগ')],
  erkrankung: [wort('erkrank'), wort('заболева')],
  elternzeit: [wort('elternzeit'), wort('parental leave'), wort('maternity leave'), wort('paternity leave'), wort('cong(?:é|e) (?:parental|maternit)'), wort('permiso parental'),
    wort('baja por maternidad'), wort('licen(?:ç|c)a[- ](?:parental|maternidade)'), wort('декрет'), wort('отпуск по уходу'), teil('إجازة الأمومة'), teil('إجازة الوالدين'),
    teil('育儿假'), teil('产假'), teil('育児休業'), teil('育休'), teil('産休'), teil('मातृत्व अवकाश'), teil('পিতৃত্ব'), teil('মাতৃত্বকালীন')],
  schwangerschaft: [wort('schwanger'), wort('pregnan'), wort('grossesse'), wort('enceinte'), wort('embaraz'), wort('gravidez'), wort('gr(?:á|a)vida'), wort('беремен'),
    ganz('حامل'), teil('怀孕'), teil('妊娠'), teil('गर्भ'), teil('গর্ভ')],
  eltern: [wort('eltern'), wort('hof (?:der|meiner|deiner|seiner|ihrer) eltern'), ganz('parents'), ganz('padres'), ganz('pais'), wort('родител'), teil('الوالدين'),
    teil('父母'), teil('両親'), teil('माता-पिता'), teil('বাবা-মা'), teil('মা-বাবা'), teil('পিতামাতা')],
}
// Grenzfälle: werden gemeldet, sind aber kein Treffer (Herkunfts-Schlagworte wie „Mutter hat erzählt“).
export const HINWEIS = { elternteil: [ganz('mutter'), ganz('vater'), ganz('mother'), ganz('father'), ganz('mère|mere'), ganz('père|pere'), ganz('madre'), ganz('padre'), ganz('mãe|mae'), ganz('pai')] }

export function scanText(text, quelle) {
  const treffer = [], hinweise = []
  const zeilen = text.split('\n')
  const lauf = (gruppen, ziel) => {
    for (const [art, regs] of Object.entries(gruppen)) for (const re of regs) {
      zeilen.forEach((z, i) => { re.lastIndex = 0; let m; while ((m = re.exec(z))) { ziel.push({ quelle, zeile: i + 1, spalte: m.index + 1, art, wort: m[0], kontext: z.slice(Math.max(0, m.index - 50), m.index + m[0].length + 50).trim() }); if (!re.global) break } })
    }
  }
  lauf(TABU, treffer); lauf(HINWEIS, hinweise)
  return { treffer, hinweise }
}

function dateien(dir, filter) {
  if (!existsSync(dir)) return []
  const out = []
  for (const n of readdirSync(dir)) {
    const p = join(dir, n), s = statSync(p)
    if (s.isDirectory()) out.push(...dateien(p, filter)); else if (filter(p)) out.push(p)
  }
  return out
}

/** Pfad-Scope: alles, was ein Besucher in der Tür und auf den Pfadzielen sieht oder im Payload bekommt. */
export function scanPfad(repo, seiten) {
  const res = { treffer: [], hinweise: [], gescannt: [] }
  const add = (r) => { res.treffer.push(...r.treffer); res.hinweise.push(...r.hinweise) }
  const quellen = [...dateien(join(repo, 'public/tuer'), (p) => /\.(html|js|css)$/.test(p)), join(repo, 'components/btmm/PfadLeiste.tsx'), join(repo, 'components/btmm/TuerWeiche.tsx')]
  for (const f of quellen) if (existsSync(f)) { res.gescannt.push(relative(repo, f)); add(scanText(readFileSync(f, 'utf8'), relative(repo, f))) }
  if (seiten) for (const s of seiten.seiten) if (s.html) { res.gescannt.push(s.url); add(scanText(s.html, s.url)) }
  return res
}
/** Ausgeliefert (Wunsch Test-Bot): alles, was Besucher bekommen oder was in HTML/Payload landet:
 *  Sprachdateien (messages/**, gehen als Payload auf jede Seite), public/** (statisch), Seiten- und Komponenten-Quelltext,
 *  lib/inhalte, content/** (Dokumente, Wissens-Index). Prüft damit auch alt-Texte, Meta und data-Attribute im Quelltext. */
export function scanAusgeliefert(repo) {
  const res = { treffer: [], hinweise: [], dateien: 0 }
  for (const d of ['messages', 'public', 'app', 'components', 'lib', 'content'])
    for (const f of dateien(join(repo, d), (p) => /\.(json|md|mdx|ts|tsx|js|mjs|html|txt|xml|css)$/.test(p) && !/node_modules/.test(p))) {
      res.dateien++
      const r = scanText(readFileSync(f, 'utf8'), relative(repo, f)); res.treffer.push(...r.treffer); res.hinweise.push(...r.hinweise)
    }
  return res
}
/** Repo-weit (nur Bericht): messages, content, public, lib, app. */
export function scanRepo(repo) {
  const res = { treffer: [], hinweise: [] }
  for (const d of ['messages', 'content', 'public', 'lib', 'app', 'components'])
    for (const f of dateien(join(repo, d), (p) => /\.(json|md|mdx|ts|tsx|js|html)$/.test(p) && !/node_modules/.test(p))) {
      const r = scanText(readFileSync(f, 'utf8'), relative(repo, f)); res.treffer.push(...r.treffer); res.hinweise.push(...r.hinweise)
    }
  return res
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null }
  const repo = fileURLToPath(new URL('../../', import.meta.url))
  const seiten = opt('--seiten') ? JSON.parse(readFileSync(opt('--seiten'), 'utf8')) : null
  const out = { pfad: scanPfad(repo, seiten) }
  if (a.includes('--repo-weit')) out.repo = scanRepo(repo)
  const zus = (r) => Object.entries(r.treffer.reduce((m, t) => ((m[t.art] = (m[t.art] || 0) + 1), m), {}))
  console.log('Pfad-Scope Treffer:', out.pfad.treffer.length, zus(out.pfad), '| Hinweise:', out.pfad.hinweise.length, '| Quellen:', out.pfad.gescannt.length)
  for (const t of out.pfad.treffer.slice(0, 40)) console.log(`  ${t.quelle}:${t.zeile}:${t.spalte} [${t.art}] ${t.kontext}`)
  if (out.repo) console.log('Repo-weit Treffer:', out.repo.treffer.length, zus(out.repo))
  if (opt('--json')) writeFileSync(opt('--json'), JSON.stringify(out, null, 1))
  process.exitCode = out.pfad.treffer.length ? 1 : 0
}
