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
    expect(entferneEmojis('\u{1F7E1} x')).toBe('[prüfen] x')
  })
  it('laesst Pfeile stehen', () => {
    expect(entferneEmojis('a \u2192 b')).toBe('a \u2192 b')
  })
  it('Tiefenfilter liefert 0 Treffer', () => {
    const out = filterEmojisTief({ chunks: [{ text: '\u2610 \u{1F389}' }] })
    expect(zaehleEmojisTief(out)).toBe(0)
    expect(out.chunks[0].text).toBe('[offen]')
  })
  it('mappt Ampeln und glaettet Luecken', () => {
    expect(entferneEmojis('\u{1F7E1} unsicher')).toBe('[prüfen] unsicher')
    expect(entferneEmojis('\u{1F7E2} gut')).toBe('[ok] gut')
    expect(entferneEmojis('\u{1F534} schlecht')).toBe('[kritisch] schlecht')
    expect(entferneEmojis('( \u{1F7E1} Steuerberatung und Fachprüfung')).toBe(
      '([prüfen] Steuerberatung und Fachprüfung',
    )
    expect(entferneEmojis('9. November 2026, \u{1F7E1}, nicht rechtssicher')).toBe(
      '9. November 2026, [prüfen], nicht rechtssicher',
    )
    expect(entferneEmojis('Marktpreisen \u{1F7E1}, getrennte Kassen')).toBe(
      'Marktpreisen [prüfen], getrennte Kassen',
    )
    expect(entferneEmojis('( \u{1F389} Steuerberatung')).toBe('(Steuerberatung')
    expect(entferneEmojis('2026, \u{1F389}, nicht')).toBe('2026, nicht')
    expect(entferneEmojis('Marktpreisen \u{1F389}, getrennte')).toBe('Marktpreisen, getrennte')
  })
  it('glaettet Satzzeichen, Etiketten und doppelte Klammern', () => {
    expect(entferneEmojis('Text \u{1F389})')).toBe('Text)')
    expect(entferneEmojis('Text \u{1F389}.')).toBe('Text.')
    expect(entferneEmojis('Hallo \u{1F389}!')).toBe('Hallo!')
    expect(entferneEmojis('(\u{1F534} )')).toBe('([kritisch])')
    expect(entferneEmojis('\u{1F534}\u{1F534} doppelt')).toBe('[kritisch] [kritisch] doppelt')
    expect(entferneEmojis('a\u{1F534}b')).toBe('a [kritisch] b')
    expect(entferneEmojis('[\u{1F534}]')).toBe('[kritisch]')
    expect(entferneEmojis('x \u{1F534}, y')).toBe('x [kritisch], y')
    const tabelle = '| Name  | Wert |\n| a  |  b |'
    expect(entferneEmojis(tabelle)).toBe(tabelle)
    expect(entferneEmojis('| Name  | Wert |\n| \u2713 | x |')).toBe('| Name  | Wert |\n| [erledigt] | x |')
  })
  it('entfernt Doppelung, wenn nach der Abbildung dasselbe Wort folgt', () => {
    expect(entferneEmojis('\u26A0 Achtung')).toBe('Achtung')
    expect(entferneEmojis('\u26A0 achtung')).toBe('achtung')
    expect(entferneEmojis('\u26A0 Achtung:')).toBe('Achtung:')
    expect(entferneEmojis('\u{1F7E1} prüfen')).toBe('prüfen')
    expect(entferneEmojis('\u274CNein')).toBe('Nein')
    expect(entferneEmojis('\u26A0 Hinweis')).toBe('[Achtung] Hinweis')
  })
})
