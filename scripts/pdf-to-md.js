#!/usr/bin/env node

/**
 * pdf-to-md.js
 * Converts PDFs in content/pdf/ to markdown in content/dokumente/.
 *
 * Usage:
 *   node scripts/pdf-to-md.js           # skip existing .md files
 *   node scripts/pdf-to-md.js --force   # overwrite existing .md files
 *
 * Requires: npm install pdf-parse
 */

const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')

const ROOT = path.resolve(__dirname, '..')
const PDF_DIR = path.join(ROOT, 'content', 'pdf')
const MD_DIR = path.join(ROOT, 'content', 'dokumente')

const mapping = {
  'BtB_Einfuehrung.pdf': 'einfuehrung.md',
  'BtB_Wirtschaften_Anleitung_v1_1_0.pdf': 'wirtschaften.md',
  'BTB_Ideen_Horizont_v2_0_0.pdf': 'ideen-horizont.md',
  'BtB_Gemeinschaftskultur.pdf': 'gemeinschaftskultur.md',
  'BtB_Handwerk_Ergaenzung.pdf': 'handwerk.md',
}

const force = process.argv.includes('--force')

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(MD_DIR)) {
    fs.mkdirSync(MD_DIR, { recursive: true })
  }

  const entries = Object.entries(mapping)
  let converted = 0
  let skipped = 0
  let errors = 0

  for (const [pdfFile, mdFile] of entries) {
    const pdfPath = path.join(PDF_DIR, pdfFile)
    const mdPath = path.join(MD_DIR, mdFile)

    // Check if PDF exists
    if (!fs.existsSync(pdfPath)) {
      console.log(`[SKIP] PDF not found: ${pdfFile}`)
      skipped++
      continue
    }

    // Skip existing markdown unless --force
    if (!force && fs.existsSync(mdPath)) {
      console.log(`[SKIP] Already exists: ${mdFile} (use --force to overwrite)`)
      skipped++
      continue
    }

    try {
      const buffer = fs.readFileSync(pdfPath)
      const data = await pdfParse(buffer)

      // Clean up extracted text: normalise whitespace, keep paragraph breaks
      const text = data.text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()

      const header = `# ${mdFile.replace('.md', '')}\n\n`
      fs.writeFileSync(mdPath, header + text, 'utf-8')

      console.log(`[OK]   ${pdfFile} -> ${mdFile} (${data.numpages} pages)`)
      converted++
    } catch (err) {
      console.error(`[ERR]  ${pdfFile}: ${err.message}`)
      errors++
    }
  }

  console.log(`\nDone. Converted: ${converted}, Skipped: ${skipped}, Errors: ${errors}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
