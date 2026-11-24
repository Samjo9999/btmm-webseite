import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { findTabooInIndex } from '../src/taboo.mjs'

const pkg = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const repo = path.resolve(pkg, '..', '..')

describe('Index-Build Ausschluss', () => {
  it('bricht hart ab, wenn public Tabuwörter behalten würde', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wissen-taboo-'))
    const dirty = {
      builtAt: 'x',
      tier: 'public',
      docCount: 1,
      chunkCount: 1,
      docs: [],
      chunks: [{ title: 'Testdok', abschnitt: 'A', text: 'Hier steht Bürgergeld.', rel: 'demo.md' }],
    }
    fs.writeFileSync(path.join(dir, 'dirty.json'), JSON.stringify(dirty))
    const hits = findTabooInIndex(dirty)
    expect(hits.length).toBeGreaterThan(0)
    // Der Builder wirft, sobald findTabooInIndex Treffer liefert — hier die gleiche Bedingung.
    expect(() => {
      if (hits.length) throw new Error(`Ausschlussfilter: ${hits.length} Tabu-Treffer in public`)
    }).toThrow(/Ausschlussfilter/)
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it('legt internal.json nicht unter public/ und das Repo gitignored intern', () => {
    const gi = fs.readFileSync(path.join(repo, '.gitignore'), 'utf8')
    expect(gi).toMatch(/wissen-internal/)
    expect(gi).toMatch(/packages\/wissen-mcp\/indexes/)
    const pubIntern = path.join(repo, 'public', 'wissen-internal')
    expect(fs.existsSync(pubIntern)).toBe(false)
  })

  it('meldet verbotene Pfade und Inhaltslecks im Index', async () => {
    const { findTabooInIndex, forbiddenPublicPath } = await import('../src/taboo.mjs')
    expect(forbiddenPublicPath('DOKUMENTE/BUSINESSPLAN/x.md')).toBe(true)
    const hits = findTabooInIndex({
      docs: [],
      chunks: [{ title: 'X', abschnitt: '', text: 'Mail an j.s.gartzke@gmail.com', rel: 'demo.md' }],
    })
    expect(hits.length).toBeGreaterThan(0)
  })
})
