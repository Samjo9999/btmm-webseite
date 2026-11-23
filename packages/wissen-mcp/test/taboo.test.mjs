import { describe, it, expect } from 'vitest'
import { findTabooHits, hasTaboo, findTabooInIndex, TABOO_WORDS } from '../src/taboo.mjs'
import { chunksFromDocs } from '../src/corpus.mjs'

describe('taboo filter', () => {
  it('kennt die Auftragswörter inklusive Erkrankung und Jobcenter', () => {
    expect(TABOO_WORDS).toEqual(
      expect.arrayContaining([
        'bürgergeld',
        'krankheit',
        'erkrankung',
        'elternzeit',
        'schwangerschaft',
        'jobcenter',
        'hildastraße',
        'hildastrasse',
        'karner',
      ])
    )
  })

  it('findet ganze Wörter, nicht Krankenkasse als Krankheit', () => {
    expect(hasTaboo('frag vorher deine Krankenkasse')).toBe(false)
    expect(findTabooHits('Wer Bürgergeld bezieht, fragt das Jobcenter')).toEqual(
      expect.arrayContaining(['bürgergeld', 'jobcenter'])
    )
    expect(hasTaboo('Hildastraße 12')).toBe(true)
    expect(hasTaboo('Hildastrasse 12')).toBe(true)
    expect(hasTaboo('Chronische Erkrankung')).toBe(true)
    expect(hasTaboo('bei Krankheit oder Ausfall')).toBe(true)
  })

  it('verwirft Tabu-Chunks in public/mitmacher, lässt interne unberührt', () => {
    const docs = [
      {
        id: 'a',
        title: 'Public-Dok',
        rel: 'content/dokumente/demo.md',
        source: 'test',
        tier: 'public',
        content: `# Sauber\n\nDieser Abschnitt erklärt den Keim ohne heikle Wörter.\n\n# Heikel\n\nHier steht Bürgergeld als Beispiel in einem ausreichend langen Abschnitt für den Chunk-Schnitt.`,
      },
    ]
    const dropped = chunksFromDocs(docs, { dropTaboo: true, textLimit: 400 })
    expect(dropped.droppedTaboo).toBeGreaterThanOrEqual(1)
    expect(dropped.chunks.every((c) => !hasTaboo(`${c.title} ${c.abschnitt} ${c.text}`))).toBe(true)
    expect(dropped.chunks.some((c) => /Keim/.test(c.text) || /Keim/.test(c.abschnitt))).toBe(true)

    const intern = chunksFromDocs(docs, { dropTaboo: false, textLimit: 400 })
    expect(intern.chunks.some((c) => hasTaboo(c.text))).toBe(true)
  })

  it('findTabooInIndex meldet verbleibende Treffer', () => {
    const hits = findTabooInIndex({
      docs: [],
      chunks: [{ title: 'X', abschnitt: 'Y', text: 'Karner wohnt hier', rel: 'internal/x.md' }],
    })
    expect(hits.length).toBe(1)
    expect(hits[0].words).toContain('karner')
  })
})
