// Dokumenten-Sync: liest .md aus einem Drive-Ordner und schreibt
// content/drive-dokumente/<slug>.md, content/drive-dokumente/manifest.json
// und public/dokumente/<slug>.md (Download). Regeln siehe lib.mjs.
// Kein Schlüssel im Code: GDRIVE_SA_JSON und GDRIVE_DOCS_FOLDER_ID kommen aus der Umgebung.
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pickLatest, parseDoc, isPublic, DEFAULT_PREFIX } from './lib.mjs'

export async function syncDocs({ source, outDir, publicDir, prefix = DEFAULT_PREFIX, requireFlag = false, log = console.log }) {
  const files = (await source.list()).filter((f) => f.name.endsWith('.md'))
  const { latest, ignored } = pickLatest(files, prefix)
  for (const n of ignored) log(`Ignoriert (Namensschema passt nicht): ${n}`)
  const docs = []
  for (const f of latest) {
    const d = parseDoc(await source.read(f.id), f.slug)
    if (!isPublic(d.oeffentlich, requireFlag)) { log(`Nicht öffentlich: ${f.name}`); continue }
    docs.push({ ...f, ...d })
  }
  mkdirSync(outDir, { recursive: true }); mkdirSync(publicDir, { recursive: true })
  const keep = new Set(docs.map((d) => `${d.slug}.md`))
  for (const dir of [outDir, publicDir]) {
    for (const n of readdirSync(dir)) {
      if (n.endsWith('.md') && !keep.has(n)) { rmSync(join(dir, n)); log(`Entfernt: ${dir}/${n}`) }
    }
  }
  for (const d of docs) {
    writeFileSync(join(outDir, `${d.slug}.md`), d.body)
    writeFileSync(join(publicDir, `${d.slug}.md`), d.body)
  }
  const manifest = docs.map(({ slug, titel, version, datum, aenderung, name }) => ({ slug, titel, version, datum, aenderung, quelle: name }))
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
    async list() {
      const out = []; let page = ''
      do {
        const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`)
        const j = await (await get(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=nextPageToken,files(id,name)&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true${page ? `&pageToken=${page}` : ''}`)).json()
        out.push(...j.files); page = j.nextPageToken
      } while (page)
      return out
    },
    async read(id) { return (await get(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`)).text() },
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { GDRIVE_SA_JSON, GDRIVE_DOCS_FOLDER_ID } = process.env
  if (!GDRIVE_SA_JSON || !GDRIVE_DOCS_FOLDER_ID) { console.error('GDRIVE_SA_JSON und GDRIVE_DOCS_FOLDER_ID fehlen.'); process.exit(1) }
  const m = await syncDocs({
    source: driveSource(JSON.parse(GDRIVE_SA_JSON), GDRIVE_DOCS_FOLDER_ID),
    outDir: 'content/drive-dokumente', publicDir: 'public/dokumente',
    prefix: process.env.DOCS_PROJECT_PREFIX || DEFAULT_PREFIX,
    requireFlag: process.env.DOCS_REQUIRE_PUBLIC_FLAG === 'true',
  })
  console.log(`${m.length} Dokument(e) synchronisiert.`)
}
