import { describe, it, expect } from 'vitest'
import { tokenize, distinctiveTokens } from '../src/tokenize.mjs'
import { searchChunks, minScoreForQuery, formatExtractiveAnswer, chunkDoc } from '../src/search.mjs'

describe('tokenize', () => {
  it('teilt Bindestrich-Tokens und behält das Ganze', () => {
    const t = tokenize('Wo liegt die Route der BtMM-App und des BtMM-Wirtschaften?')
    expect(t).toEqual(expect.arrayContaining(['btmm-app', 'btmm', 'app', 'btmm-wirtschaften', 'wirtschaften']))
  })

  it('behält §-Angaben und e-G-Teile', () => {
    const t = tokenize('Kündigung nach § 7b GenG in der e-G')
    expect(t).toEqual(expect.arrayContaining(['§7b', '7b', 'geng']))
    expect(t.some((x) => x === 'eg' || x === 'e-g')).toBe(true)
  })

  it('behält Kalenderdaten', () => {
    const t = tokenize('interne Entscheidung vom 26.10.2026')
    expect(t).toEqual(expect.arrayContaining(['26.10.2026', '2026-10-26', '26', '10', '2026']))
  })
})

describe('search quality', () => {
  const chunks = [
    {
      title: 'Back to Meaning Maximization — langes Titelbeispiel',
      abschnitt: 'Einleitung',
      text: 'Allgemeiner Text über die Genossenschaft ohne die fünf Sätze.',
      rel: 'andere.md',
    },
    {
      title: '00 einfach erklärt',
      abschnitt: 'In fünf Sätzen',
      text: 'Eine Genossenschaft im Aufbau. Sie will ein besseres Leben für alle, die mitmachen.',
      rel: 'DRIVE/MDs/01-aussenkontakt/BtMM_00-einfach-erklaert-start-hier_v1.17.0_2026-11-01.md',
    },
    {
      title: '04 Wirtschaften Anleitung',
      abschnitt: '5. Coins verstehen und verwenden',
      text: 'Ein Coin im BtMM-Wirtschaften steht für eine Stunde geleistete Arbeit.',
      rel: 'DRIVE/MDs/03-konzept/BtMM_04-wirtschaften-anleitung_v3.15.2_2026-11-08.md',
    },
  ]

  it('bevorzugt den passenden Abschnitt gegenüber dem Titel-Bias', () => {
    const hits = searchChunks('Was ist Back to Meaning Maximization (BtMM) in wenigen Sätzen?', chunks, 3)
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0].rel).toMatch(/00-einfach-erklaert/)
  })

  it('findet Bindestrich-Quellen wie BtMM-Wirtschaften', () => {
    const hits = searchChunks('Wofür steht ein Coin im BtMM-Wirtschaften?', chunks, 3)
    expect(hits[0].rel).toMatch(/04-wirtschaften/)
  })

  it('liefert keine Treffer bei unbekannten Sachverhalten', () => {
    expect(minScoreForQuery('Welche ISO-9001-Zertifikatsnummer hat die BtMM eG?')).toBeGreaterThan(5)
    const hits = searchChunks('Welche ISO-9001-Zertifikatsnummer hat die BtMM eG?', chunks, 5)
    expect(hits).toEqual([])
    const ans = formatExtractiveAnswer('Welche ISO-9001-Zertifikatsnummer hat die BtMM eG?', hits)
    expect(ans.beantwortet).toBe(false)
  })

  it('lehnt Store-Bewertungs- und Stromfragen ohne Beleg ab', () => {
    const more = [
      ...chunks,
      {
        title: '07 Konzept',
        abschnitt: 'Abschnitt 293',
        text: 'Im Jahr 2025 startet der erste Betrieb. Die App hilft im Alltag.',
        rel: 'DOKUMENTE/07_BtMM_Konzept_v22_69_0.md',
      },
    ]
    expect(
      searchChunks(
        'Welche durchschnittliche Sternebewertung hat die BtMM-App im Apple App Store (Stand 2026)?',
        more,
        5
      )
    ).toEqual([])
    expect(
      searchChunks(
        'Wie hoch war der gemessene Jahresstromverbrauch der BtMM-Hosting-Server im Kalenderjahr 2025, angegeben in Megawattstunden?',
        more,
        5
      )
    ).toEqual([])
  })
})

describe('chunkDoc Satzspiegel', () => {
  it('nimmt %%-Steuerzeilen nicht in den Chunk auf', () => {
    const chunks = chunkDoc({
      title: 'Satzung',
      rel: 'DOKUMENTE/08_BtMM_Satzung_eG_v9_1_4_aussen_ENTWURF.md',
      content: [
        '---',
        'aenderung: "v9.1.4, ersetzt v9.1.3"',
        '---',
        '%% header: Satzung eG (Entwurf)',
        '%% cover: full',
        '%% title: Satzung',
        '%% mail: office.gartzke@gmail.com',
        '%% date: 24. November 2026',
        '',
        '> **Entwurf vom 24. November 2026, Version 9.1.4, zur Vorabprüfung durch den Prüfungsverband.**',
        '',
        '## § 1 Zweck, Firma, Sitz',
        '',
        '(1) Zweck der Genossenschaft ist die Förderung der Mitglieder im Sinne des Genossenschaftsgesetzes.',
        '(2) Die Firma der Genossenschaft lautet Back to Meaning Maximization eG.',
      ].join('\n'),
    })
    expect(chunks.length).toBeGreaterThan(0)
    const blob = chunks.map((c) => `${c.abschnitt}\n${c.text}`).join('\n')
    expect(blob).not.toMatch(/%%/)
    expect(blob).not.toMatch(/office\.gartzke@gmail\.com/)
    expect(blob).toMatch(/Zweck der Genossenschaft/)
  })

  it('entfernt auch %%-Platzhalter, lässt übrigen Text stehen', () => {
    const chunks = chunkDoc({
      title: 'Einfach erklärt',
      rel: 'content/dokumente-web/00-einfach-erklaert.md',
      content: [
        '## Alle Dokumente in der Reihenfolge',
        '',
        'Die Übersicht folgt hier:',
        '%%DOKTABELLE%%',
        'Danach geht der Text weiter, damit der Abschnitt lang genug für einen Chunk bleibt.',
      ].join('\n'),
    })
    expect(chunks.length).toBe(1)
    expect(chunks[0].text).toMatch(/Die Übersicht folgt hier/)
    expect(chunks[0].text).toMatch(/Danach geht der Text weiter/)
    expect(chunks[0].text).not.toMatch(/%%/)
  })
})
