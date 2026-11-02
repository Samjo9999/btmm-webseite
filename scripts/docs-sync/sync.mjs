// Dokumenten-Sync: liest .md (und .pdf unter pdf/) rekursiv aus einem Drive-Ordner und schreibt
// content/drive-dokumente/<slug>.md, content/drive-dokumente/manifest.json
// public/dokumente/<slug>.md und public/dokumente/pdf/<slug>.pdf (Download). Regeln siehe lib.mjs.
// Kein Schlüssel im Code: GDRIVE_SA_JSON und GDRIVE_DOCS_FOLDER_ID kommen aus der Umgebung.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pickLatest, parseDoc, isPublic, matchPdf, sortDocs, DEFAULT_PREFIX } from './lib.mjs'

export const MD_ROOTS = new Set(['mds', 'md'])
export const PDF_ROOTS = new Set(['pdf', 'pdfs'])
export const PDF_WARN_MB = 10
export const PDF_MAX_MB = 25

function clean(dir, ext, keep, log) {
  for (const n of readdirSync(dir)) {
    if (n.endsWith(ext) && !keep.has(n)) { rmSync(join(dir, n)); log(`Entfernt: ${dir}/${n}`) }
  }
}

export async function syncDocs({ source, outDir, publicDir, pdfDir = join(publicDir, 'pdf'), prefix = DEFAULT_PREFIX, requireFlag = false,
  pdfMaxMb = PDF_MAX_MB, pdfWarnMb = PDF_WARN_MB, log = console.log }) {
  const all = await source.list()
  // Oberste Ebene: NUR MDs/md (für .md) und pdf/pdfs (für .pdf). Alles andere (md-intern, png, ...) wird ignoriert.
  const top = (f) => (f.path?.[0] ?? '').toLowerCase()
  for (const f of all) if (!f.path?.length) log(`Ignoriert (Datei direkt in der Wurzel): ${f.name}`)
  const mdFiles = all.filter((f) => MD_ROOTS.has(top(f)) && /\.md$/i.test(f.name))
  const pdfFiles = all.filter((f) => PDF_ROOTS.has(top(f)) && /\.pdf$/i.test(f.name))
  const { latest, ignored } = pickLatest(mdFiles, prefix, 'md', log)
  const pdfs = pickLatest(pdfFiles, prefix, 'pdf', log)
  for (const n of [...ignored, ...pdfs.ignored]) log(`Ignoriert (Namensschema passt nicht): ${n}`)

  const docs = [], usedPdfs = new Set()
  for (const f of latest) {
    const d = parseDoc(await source.read(f.id), f.basisSlug)
    const pdf = matchPdf(f, pdfs.latest)
    if (pdf) usedPdfs.add(pdf)
    if (!isPublic(d.oeffentlich, requireFlag)) {
      log(`Nicht öffentlich: ${f.name}${pdf ? ` (PDF ${pdf.name} ebenfalls gesperrt)` : ''}`); continue
    }
    docs.push({ ...f, ...d, pdfQuelle: pdf ?? null })
  }
  for (const p of pdfs.latest) {
    if (usedPdfs.has(p)) continue
    if (requireFlag) { log(`PDF ohne MD übersprungen (DOCS_REQUIRE_PUBLIC_FLAG gesetzt): ${p.pfad}`); continue }
    docs.push({ ...p, titel: p.basisSlug, aenderung: null, body: null, pdfQuelle: p, nurPdf: true })
  }

  // PDF-Größe prüfen
  for (const d of docs) {
    const p = d.pdfQuelle
    if (!p) continue
    const mb = p.size != null ? p.size / 1048576 : null
    if (mb != null && mb > pdfMaxMb) { log(`PDF zu groß (${mb.toFixed(1)} MB > ${pdfMaxMb} MB), nicht übernommen: ${p.pfad}`); d.pdfQuelle = null; continue }
    if (mb != null && mb > pdfWarnMb) log(`Warnung: PDF groß (${mb.toFixed(1)} MB): ${p.pfad}`)
  }
  const final = sortDocs(docs.filter((d) => !d.nurPdf || d.pdfQuelle))

  for (const dir of [outDir, publicDir, pdfDir]) mkdirSync(dir, { recursive: true })
  clean(outDir, '.md', new Set(final.filter((d) => d.body != null).map((d) => `${d.slug}.md`)), log)
  clean(publicDir, '.md', new Set(final.filter((d) => d.body != null).map((d) => `${d.slug}.md`)), log)
  clean(pdfDir, '.pdf', new Set(final.filter((d) => d.pdfQuelle).map((d) => `${d.slug}.pdf`)), log)
  for (const d of final) {
    if (d.body != null) {
      writeFileSync(join(outDir, `${d.slug}.md`), d.body)
      writeFileSync(join(publicDir, `${d.slug}.md`), d.body)
    }
    if (d.pdfQuelle) {
      const buf = Buffer.from(await source.readBinary(d.pdfQuelle.id))
      if (buf.length > pdfMaxMb * 1048576) { log(`PDF zu groß, nicht übernommen: ${d.pdfQuelle.pfad}`); d.pdfQuelle = null; continue }
      writeFileSync(join(pdfDir, `${d.slug}.pdf`), buf)
    }
  }
  const manifest = final.map(({ slug, titel, version, datum, aenderung, name, kategorie, pdfQuelle, nurPdf }) => ({
    slug, titel, version, datum, aenderung, quelle: name, kategorie: kategorie ?? null,
    pdf: pdfQuelle ? { datei: `${slug}.pdf`, version: pdfQuelle.version, datum: pdfQuelle.datum, quelle: pdfQuelle.name } : null,
    ...(nurPdf ? { nurPdf: true } : {}),
  }))
  writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  return manifest
}

// --- Google Drive über Service-Konto (JWT, ohne Zusatzpakete) ---
async function driveToken(sa) {
  const { createSign } = await import('node:crypto')
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/drive.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`
  const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url')
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  })
  if (!r.ok) throw new Error(`Token-Abruf fehlgeschlagen: HTTP ${r.status}`)
  return (await r.json()).access_token
}

export function driveSource(sa, folderId) {
  let tok
  const get = async (url) => {
    tok ??= await driveToken(sa)
    const r = await fetch(url, { headers: { authorization: `Bearer ${tok}` } })
    if (!r.ok) throw new Error(`Drive-Fehler: HTTP ${r.status}`)
    return r
  }
  return {
    // Rekursiv: liefert { id, name, size, path } mit path = Ordnernamen relativ zum Wurzelordner.
    async list() {
      const out = [], seen = new Set()
      const walk = async (id, path, depth) => {
        if (seen.has(id) || depth > 10) return
        seen.add(id)
        let page = ''
        do {
          const q = encodeURIComponent(`'${id}' in parents and trashed = false`)
          const j = await (await get(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=nextPageToken,files(id,name,mimeType,size)&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true${page ? `&pageToken=${page}` : ''}`)).json()
          for (const f of j.files) {
            const isDir = f.mimeType === 'application/vnd.google-apps.folder'
            if (depth === 0 && isDir && !MD_ROOTS.has(f.name.toLowerCase()) && !PDF_ROOTS.has(f.name.toLowerCase())) continue
            if (isDir) await walk(f.id, [...path, f.name], depth + 1)
            else out.push({ id: f.id, name: f.name, size: f.size, path })
          }
          page = j.nextPageToken
        } while (page)
      }
      await walk(folderId, [], 0)
      return out
    },
    async readBinary(id) { return (await get(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`)).arrayBuffer() },
    async read(id) { return (await get(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`)).text() },
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { GDRIVE_SA_JSON, GDRIVE_DOCS_FOLDER_ID } = process.env
  if (!GDRIVE_SA_JSON || !GDRIVE_DOCS_FOLDER_ID) { console.error('GDRIVE_SA_JSON und GDRIVE_DOCS_FOLDER_ID fehlen.'); process.exit(1) }
  const m = await syncDocs({
    source: driveSource(JSON.parse(GDRIVE_SA_JSON), GDRIVE_DOCS_FOLDER_ID),
    outDir: 'content/drive-dokumente', publicDir: 'public/dokumente', pdfDir: 'public/dokumente/pdf',
    pdfMaxMb: Number(process.env.DOCS_PDF_MAX_MB) || PDF_MAX_MB,
    prefix: process.env.DOCS_PROJECT_PREFIX || DEFAULT_PREFIX,
    requireFlag: process.env.DOCS_REQUIRE_PUBLIC_FLAG === 'true',
  })
  console.log(`${m.length} Dokument(e) synchronisiert.`)
}
