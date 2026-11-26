#!/usr/bin/env node
/**
 * Bricht Test/Build ab, wenn in content/dokumente-web, index-public oder messages/*
 * eine Jahreszahl 2027–2032 als Gründungs-, Eintragungs- oder Betriebsstart-Termin
 * nach außen steht, oder ein Monat-plus-Jahr wie „März 2028“.
 * Gesetzliche und fachliche Daten (Mindestlohn, Anmeldeschluss, Programmende,
 * Kaufkraft) bleiben erlaubt. Treffer werden gemeldet, nichts still geändert.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const defaultRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

export const JAHR_RE = /\b(202[7-9]|203[0-2])\b/g
export const MONAT_JAHR_RE =
  /\b(?:Januar|Februar|März|Maerz|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+(202[7-9]|203[0-2])\b/gi

const GRUENDUNG_RE =
  /gr(?:u|ü)ndung|gegr(?:u|ü)ndet|gr(?:u|ü)nden|eintragung|eingetragen(?:er|en|e|es)?|betriebsstart|betriebsbeginn/i

/** Fach- oder Gesetzeskontext, in dem die Jahreszahl kein Außen-Termin der Genossenschaft ist. */
const FACH_RE =
  /mindestlohn|milov5?|milog|anmeldeschluss|lehrgang|fachkraft|infoblatt|umsetz(?:ung|t)|fusion|verbraucherpreis|kaufkraft|tariflohn|zusatzbeitrag|stundenlohn|ausschreibung|pr(?:ü|ue)fungsverband|programm\s+bis|g(?:ü|ue)ltigkeitsdatum|handwerkskammer/i

function lokal(text, start, end, radius = 36) {
  return text.slice(Math.max(0, start - radius), Math.min(text.length, end + radius))
}

function istFachdatum(umfeld) {
  const u = String(umfeld || '')
  if (FACH_RE.test(u)) return true
  if (/(?:€|euro)\s*ab\s*20\d{2}/i.test(u)) return true
  if (/f(?:ü|ue)r\s+20\d{2}[^.]{0,40}(?:nicht festgesetzt|annahme)/i.test(u)) return true
  if (/\b20\d{2}\s*[–-]\s*20\d{2}\b/.test(u) && /ausschreibung|planjahre|finanzplan/i.test(u)) return true
  if (
    /\bbis\s+(?:Januar|Februar|März|Maerz|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+(?:202[7-9]|203[0-2])\b/i.test(u) &&
    !GRUENDUNG_RE.test(u)
  ) {
    return true
  }
  return false
}

function einzug(s) {
  return String(s || '').replace(/\s+/g, ' ').trim().slice(0, 180)
}

/**
 * @param {string} text
 * @param {string} rel
 * @returns {{rel: string, art: string, jahr?: string, auszug: string}[]}
 */
export function findeTermineInText(text, rel) {
  const treffer = []
  const src = String(text || '')
  if (!src) return treffer

  const teile = []
  for (const zeile of src.split('\n')) {
    if (zeile.trim().startsWith('|')) {
      for (const zelle of zeile.split('|')) {
        const t = zelle.trim()
        if (t && t !== '---' && !/^[-:]+$/.test(t)) teile.push(t)
      }
    } else {
      teile.push(zeile)
    }
  }

  for (const teil of teile) {
    for (const m of teil.matchAll(new RegExp(MONAT_JAHR_RE.source, 'gi'))) {
      const umfeld = lokal(teil, m.index, m.index + m[0].length, 48)
      if (istFachdatum(umfeld) || istFachdatum(teil)) continue
      treffer.push({ rel, art: 'monat-jahr', jahr: m[2] || m[1], auszug: einzug(umfeld) })
    }
    for (const m of teil.matchAll(new RegExp(JAHR_RE.source, 'g'))) {
      const umfeld = lokal(teil, m.index, m.index + m[0].length, 48)
      if (istFachdatum(umfeld)) continue
      if (!GRUENDUNG_RE.test(umfeld) && !GRUENDUNG_RE.test(lokal(teil, m.index, m.index + m[0].length, 72))) continue
      // Jahreszahl klebt am Fachwort (Mindestlohn 2027), auch wenn weiter weg ein Gründungswort steht.
      if (istFachdatum(lokal(teil, m.index, m.index + m[0].length, 24))) continue
      treffer.push({ rel, art: 'gruendung-jahr', jahr: m[1], auszug: einzug(umfeld) })
    }
  }
  return treffer
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

/**
 * @param {string} root
 * @returns {{rel: string, art: string, jahr?: string, auszug: string}[]}
 */
export function findeTermine(root = defaultRoot) {
  const treffer = []
  const dokDir = join(root, 'content', 'dokumente-web')
  for (const name of readdirSync(dokDir).filter((f) => f.endsWith('.md')).sort()) {
    const rel = `content/dokumente-web/${name}`
    treffer.push(...findeTermineInText(readFileSync(join(root, rel), 'utf8'), rel))
  }

  for (const rel of ['content/wissen/index-public.json', 'public/wissen/index-public.json']) {
    const payload = JSON.parse(readFileSync(join(root, rel), 'utf8'))
    for (const c of payload.chunks || []) {
      const blob = [c.title, c.abschnitt, c.text].filter(Boolean).join('\n')
      const hits = findeTermineInText(blob, rel)
      for (const h of hits) treffer.push({ ...h, rel: `${rel} [${c.rel || ''} | ${c.abschnitt || ''}]` })
    }
  }

  const msgRoot = join(root, 'messages')
  for (const p of walk(msgRoot)) {
    if (!/\.(json|md|txt)$/.test(p)) continue
    const rel = relative(root, p).split('\\').join('/')
    treffer.push(...findeTermineInText(readFileSync(p, 'utf8'), rel))
  }
  return treffer
}

export function main(root = defaultRoot) {
  const treffer = findeTermine(root)
  if (treffer.length) {
    console.error(`Termin-Check fehlgeschlagen: ${treffer.length} Treffer (2027–2032 bei Gründung/Eintragung/Betriebsstart oder Monat+Jahr)`)
    for (const t of treffer) console.error(` - ${t.rel} [${t.art}]: ${t.auszug}`)
    return 1
  }
  console.log('PASS Termin-Check (0 Treffer)')
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main())
}
