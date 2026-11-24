import { describe, it, expect } from 'vitest'
import {
  findTabooHits,
  hasTaboo,
  findTabooInIndex,
  findForbiddenContentHits,
  forbiddenPublicPath,
  TABOO_STEMS,
  TABOO_WORDS,
} from '../src/taboo.mjs'
import { chunksFromDocs } from '../src/corpus.mjs'

describe('taboo filter (Wortstämme als Teilwort)', () => {
  it('kennt die Auftrag-Stämme inklusive hartz, hildastr, happyfarm', () => {
    expect(TABOO_WORDS).toEqual(TABOO_STEMS)
    expect(TABOO_STEMS).toEqual(
      expect.arrayContaining([
        'bürgergeld',
        'buergergeld',
        'jobcenter',
        'hartz',
        'krankheit',
        'erkrankung',
        'elternzeit',
        'schwangerschaft',
        'hildastr',
        'karner',
        'happyfarm',
        'elternhof',
      ])
    )
  })

  it('findet Komposita und Beugungen, lässt Krankenkasse durch', () => {
    expect(hasTaboo('frag vorher deine Krankenkasse')).toBe(false)
    expect(hasTaboo('Bürgergeldbezug in der Keimphase')).toBe(true)
    expect(findTabooHits('Bürgergeldbezug')).toEqual(expect.arrayContaining(['bürgergeld']))
    expect(hasTaboo('Beim Jobcenters nachfragen')).toBe(true)
    expect(hasTaboo('im Krankheitsfall vertreten')).toBe(true)
    expect(hasTaboo('gegen-hartz.de als Beispiel')).toBe(true)
    expect(hasTaboo('Hildastr. 12')).toBe(true)
    expect(hasTaboo('Hildastraße 12')).toBe(true)
    expect(hasTaboo('Hildastrasse 12')).toBe(true)
    expect(hasTaboo('happyfarm')).toBe(true)
    expect(hasTaboo('Elternhof-Konzept')).toBe(true)
    expect(hasTaboo('Chronische Erkrankung')).toBe(true)
    expect(hasTaboo('bei Krankheit oder Ausfall')).toBe(true)
    expect(hasTaboo('Dieser Abschnitt erklärt den Keim ohne heikle Wörter.')).toBe(false)
  })

  it('erkennt private Mail und gegen-hartz als Inhaltsleck', () => {
    expect(findForbiddenContentHits('Bitte an j.s.gartzke@gmail.com schreiben')).toEqual(
      expect.arrayContaining(['j.s.gartzke@gmail.com'])
    )
    expect(findForbiddenContentHits('siehe gegen-hartz.de')).toEqual(expect.arrayContaining(['gegen-hartz']))
    expect(findForbiddenContentHits('office.btmm@gmail.com')).toEqual([])
  })

  it('Pfad-Guardrail trifft INTERN/ROTH/BUSINESSPLAN, nicht international', () => {
    expect(forbiddenPublicPath('DOKUMENTE/INTERN_Notizen.md')).toBe(true)
    expect(forbiddenPublicPath('DRIVE/_intern/geheim.md')).toBe(true)
    expect(forbiddenPublicPath('DOKUMENTE/ROTH-2026-11-12/brief.md')).toBe(true)
    expect(forbiddenPublicPath('DOKUMENTE/BUSINESSPLAN/plan.md')).toBe(true)
    expect(forbiddenPublicPath('DRIVE/MDs/04-finanzen/BtMM_foerderung-eigenkapital-2028_v1.1.md')).toBe(true)
    expect(forbiddenPublicPath('content/dokumente/einfuehrung.md')).toBe(false)
    expect(forbiddenPublicPath('DRIVE/MDs/01-aussenkontakt/international-hinweis.md')).toBe(false)
  })

  it('verwirft Tabu-Chunks in public/mitmacher, lässt interne unberührt', () => {
    const docs = [
      {
        id: 'a',
        title: 'Public-Dok',
        rel: 'content/dokumente/demo.md',
        source: 'test',
        tier: 'public',
        content: `# Sauber\n\nDieser Abschnitt erklärt den Keim ohne heikle Wörter.\n\n# Heikel\n\nHier steht Bürgergeldbezug als Beispiel in einem ausreichend langen Abschnitt für den Chunk-Schnitt.`,
      },
    ]
    const dropped = chunksFromDocs(docs, { dropTaboo: true, textLimit: 400 })
    expect(dropped.droppedTaboo).toBeGreaterThanOrEqual(1)
    expect(dropped.chunks.every((c) => !hasTaboo(`${c.title} ${c.abschnitt} ${c.text}`))).toBe(true)
    expect(dropped.chunks.some((c) => /Keim/.test(c.text) || /Keim/.test(c.abschnitt))).toBe(true)

    const intern = chunksFromDocs(docs, { dropTaboo: false, textLimit: 400 })
    expect(intern.chunks.some((c) => hasTaboo(c.text))).toBe(true)
  })

  it('findTabooInIndex meldet verbleibende Treffer und Pfade', () => {
    const hits = findTabooInIndex({
      docs: [],
      chunks: [{ title: 'X', abschnitt: 'Y', text: 'Karner wohnt hier', rel: 'internal/x.md' }],
    })
    expect(hits.length).toBe(1)
    expect(hits[0].words).toContain('karner')

    const pathHits = findTabooInIndex({
      docs: [{ title: 'X', rel: 'DOKUMENTE/INTERN_foo.md' }],
      chunks: [],
    })
    expect(pathHits.some((h) => h.words.includes('verbotener-pfad'))).toBe(true)
  })
})
