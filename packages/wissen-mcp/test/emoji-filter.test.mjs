import { describe, it, expect } from 'vitest'
import { entferneEmojis, filterEmojisTief, zaehleEmojisTief } from '../src/emoji-filter.mjs'

describe('Emoji-Filter', () => {
  it('mappt laut Auftrag', () => {
    expect(entferneEmojis('\u2610 a')).toBe('[offen] a')
    expect(entferneEmojis('\u2713 a \u2714 b \u2705 c')).toBe('[erledigt] a [erledigt] b [erledigt] c')
    expect(entferneEmojis('\u274C a')).toBe('[nein] a')
    expect(entferneEmojis('\u26A0\uFE0F a')).toBe('[Achtung] a')
  })
  it('entfernt uebrige Emojis und glaettet Leerzeichen', () => {
    expect(entferneEmojis('a \u{1F389}  b')).toBe('a b')
    expect(entferneEmojis('\u{1F7E1} x')).toBe('x')
  })
  it('laesst Pfeile stehen', () => {
    expect(entferneEmojis('a \u2192 b')).toBe('a \u2192 b')
  })
  it('Tiefenfilter liefert 0 Treffer', () => {
    const out = filterEmojisTief({ chunks: [{ text: '\u2610 \u{1F389}' }] })
    expect(zaehleEmojisTief(out)).toBe(0)
    expect(out.chunks[0].text).toBe('[offen]')
  })
})
