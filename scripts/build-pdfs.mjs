/**
 * build-pdfs.mjs — Generiert PDFs aus allen Markdown-Dokumenten
 *
 * Wird automatisch im postbuild-Schritt ausgeführt.
 * Legt PDFs in public/dokumente/ ab, damit sie über /dokumente/*.pdf erreichbar sind.
 *
 * Usage: node scripts/build-pdfs.mjs
 */

import { readdir, readFile, writeFile, copyFile } from 'fs/promises';
import { join, basename } from 'path';
import { existsSync, mkdirSync } from 'fs';

const CONTENT_DIR = join(process.cwd(), 'content', 'dokumente');
const PDF_SOURCE_DIR = join(process.cwd(), 'content', 'pdf');
const OUTPUT_DIR = join(process.cwd(), 'public', 'dokumente');
const PRESS_DIR = join(process.cwd(), 'public', 'press');

// Mapping: slug → PDF-Dateiname in content/pdf/
const pdfMapping = {
  'einfuehrung': 'BtB_Einfuehrung.pdf',
  'wirtschaften': 'BtB_Wirtschaften_Anleitung_v1_1_0.pdf',
  'ideen-horizont': 'BTB_Ideen_Horizont_v2_0_0.pdf',
  'gemeinschaftskultur': 'BtB_Gemeinschaftskultur.pdf',
  'handwerk': 'BtB_Handwerk_Ergaenzung.pdf',
};

async function main() {
  // Ensure output dir exists
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  let mdToPdf = null;
  // Skip PDF generation on Vercel (no Chrome/Puppeteer available)
  // PDFs are pre-generated locally and committed to public/dokumente/
  const isCI = process.env.VERCEL || process.env.CI || process.env.NETLIFY;
  if (isCI) {
    console.log('CI/Vercel detected — skipping PDF generation (using pre-built PDFs)');
  } else {
    try {
      const mod = await import('md-to-pdf');
      mdToPdf = mod.mdToPdf;
    } catch {
      console.log('md-to-pdf not available — falling back to copying existing PDFs');
    }
  }

  const mdFiles = (await readdir(CONTENT_DIR)).filter(f => f.endsWith('.md'));
  let generated = 0;
  let copied = 0;

  for (const file of mdFiles) {
    const slug = basename(file, '.md');
    const outputPath = join(OUTPUT_DIR, `${slug}.pdf`);

    // Try to generate PDF from Markdown
    if (mdToPdf) {
      try {
        const mdPath = join(CONTENT_DIR, file);
        const pdf = await mdToPdf({ path: mdPath }, {
          stylesheet: [],
          css: `
            @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

            :root {
              --btb-rot: var(--btmm-dunkel);
              --btb-oliv: var(--btmm-primary);
              --btb-creme: var(--btmm-hell);
              --btb-blau: var(--btmm-dunkel);
              --btb-dunkel: var(--btmm-text);
            }

            @page {
              margin: 0;
            }

            body {
              font-family: 'EB Garamond', Georgia, serif;
              color: var(--btb-dunkel);
              background: var(--btb-creme);
              margin: 0;
              padding: 0;
              font-size: 11pt;
              line-height: 1.7;
            }

            /* Content container with padding */
            body > * {
              margin-left: 28mm;
              margin-right: 28mm;
            }

            /* Top banner on first page */
            body::before {
              content: '';
              display: block;
              width: 100%;
              height: 8px;
              background: linear-gradient(90deg, var(--btb-rot), var(--btb-oliv), var(--btb-blau));
              margin: 0 !important;
              padding: 0;
            }

            h1 {
              color: var(--btb-rot);
              font-size: 1.8rem;
              font-weight: 700;
              margin-top: 1.5rem;
              margin-bottom: 0.3rem;
              letter-spacing: -0.01em;
            }

            h1 + p > strong:first-child {
              /* Version line under h1 */
              display: block;
              font-size: 0.85rem;
              color: var(--btb-oliv);
              margin-bottom: 1rem;
            }

            h2 {
              color: var(--btb-oliv);
              font-size: 1.25rem;
              font-weight: 700;
              margin-top: 2rem;
              padding-bottom: 0.3rem;
              border-bottom: 2px solid rgba(158, 87, 164, 0.3);
            }

            h3 {
              color: var(--btb-blau);
              font-size: 1.1rem;
              font-weight: 600;
              margin-top: 1.5rem;
            }

            p { margin: 0.6rem 0; }

            strong { color: var(--btb-dunkel); }

            a { color: var(--btb-blau); text-decoration: none; }

            /* Tables */
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 1rem 0;
              font-size: 0.85rem;
              border-radius: 6px;
              overflow: hidden;
            }
            th {
              background: var(--btb-oliv);
              color: white;
              font-weight: 600;
              padding: 0.6rem 0.75rem;
              text-align: left;
              font-size: 0.8rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            td {
              padding: 0.5rem 0.75rem;
              border-bottom: 1px solid rgba(158, 87, 164, 0.15);
            }
            tr:nth-child(even) td {
              background: rgba(240, 233, 182, 0.3);
            }

            /* Blockquotes */
            blockquote {
              border-left: 4px solid var(--btb-oliv);
              background: rgba(158, 87, 164, 0.08);
              padding: 0.8rem 1.2rem;
              margin: 1.2rem 28mm 1.2rem 0;
              border-radius: 0 8px 8px 0;
              font-style: italic;
              color: #444;
            }

            /* Horizontal rules as decorative dividers */
            hr {
              border: none;
              height: 2px;
              background: linear-gradient(90deg, var(--btb-creme), var(--btb-oliv), var(--btb-creme));
              margin: 2rem 0;
            }

            /* Lists */
            ul, ol { padding-left: 1.5rem; }
            li { margin: 0.3rem 0; }
            li::marker { color: var(--btb-oliv); }

            /* Code blocks */
            code {
              background: rgba(120, 2, 104, 0.1);
              padding: 0.15rem 0.4rem;
              border-radius: 3px;
              font-size: 0.9em;
            }

            /* Footer */
            body::after {
              content: 'Back to Meaning Maximization · backtobalance.online';
              display: block;
              text-align: center;
              font-size: 0.75rem;
              color: var(--btb-oliv);
              opacity: 0.6;
              margin-top: 2rem;
              padding: 1rem 0;
              border-top: 1px solid rgba(158, 87, 164, 0.2);
            }
          `,
          pdf_options: {
            format: 'A4',
            margin: { top: '18mm', bottom: '18mm', left: '0', right: '0' },
            printBackground: true,
          },
        });
        if (pdf?.content) {
          await writeFile(outputPath, pdf.content);
          generated++;
          console.log(`✓ Generated: ${slug}.pdf`);
          continue;
        }
      } catch (e) {
        console.log(`  ⚠ Could not generate ${slug}.pdf: ${e.message}`);
      }
    }

    // Fallback: copy existing PDF from content/pdf/
    const existingPdf = pdfMapping[slug];
    if (existingPdf) {
      const sourcePath = join(PDF_SOURCE_DIR, existingPdf);
      if (existsSync(sourcePath)) {
        await copyFile(sourcePath, outputPath);
        copied++;
        console.log(`↳ Copied: ${existingPdf} → ${slug}.pdf`);
      }
    }
  }

  // Also copy to press folder (Konzept + Satzung)
  const pressFiles = {
  };
  for (const [pressName, source] of Object.entries(pressFiles)) {
    if (existsSync(source) && existsSync(PRESS_DIR)) {
      await copyFile(source, join(PRESS_DIR, pressName));
      console.log(`↳ Press: ${pressName} updated`);
    }
  }

  console.log(`\nDone: ${generated} generated, ${copied} copied from existing PDFs`);
}

main().catch(console.error);
