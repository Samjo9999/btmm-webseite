import { describe, it, expect } from 'vitest'
import { familyKey, parseVersion, compareVersions, selectLatestByFamily, isInternalOnlyFamily, sourceRank, isRetiredRel } from '../src/versions.mjs'

describe('versions', () => {
  it('parst Punkt- und Unterstrich-Versionen', () => {
    expect(compareVersions(parseVersion('v9.1.3'), parseVersion('v9_1_2'))).toBeGreaterThan(0)
    expect(compareVersions(parseVersion('v22.69.0'), parseVersion('v22.68.0'))).toBeGreaterThan(0)
    expect(compareVersions(parseVersion('v3.9'), parseVersion('v3.6a'))).toBeGreaterThan(0)
    expect(compareVersions(parseVersion('BtMM_3-jahres-plan_v3.9_2026-11-19.md'), parseVersion('3-JAHRES-PLAN-v3.9-2026-11-19.md'))).toBe(0)
  })

  it('unterscheidet Satzung außen und schlank', () => {
    expect(familyKey('08_BtMM_Satzung_eG_v9_1_3_aussen_ENTWURF.md')).not.toBe(
      familyKey('08_BtMM_Satzung_eG_v9_0_5_schlank_ENTWURF.md')
    )
    expect(familyKey('BtMM_00-einfach-erklaert-start-hier_v1.17.0_2026-11-01.md')).toBe(
      familyKey('00_BtMM_einfach_erklaert_Start_hier_v1_14_0.md')
    )
  })

  it('wählt die gepinnte bzw. neueste Fassung', () => {
    const docs = [
      { rel: 'DOKUMENTE/07_BtMM_Konzept_v22_68_0.md' },
      { rel: 'DOKUMENTE/07_BtMM_Konzept_v22_69_0.md' },
      { rel: 'DRIVE/MDs/03-konzept/BtMM_07-konzept_v22.68.0_2026-11-17.md' },
    ]
    const latest = selectLatestByFamily(docs, ['DOKUMENTE/07_BtMM_Konzept_v22_69_0.md'])
    expect(latest).toHaveLength(1)
    expect(latest[0].rel).toBe('DOKUMENTE/07_BtMM_Konzept_v22_69_0.md')
  })

  it('stuft Dok 15, Förderung, Annahmen und den 3-Jahres-Plan intern ein', () => {
    const pats = [
      '15-geschaeftsmodell-3j',
      'foerderung',
      'foerderung-eigenkapital-2028',
      'annahmen-und-quellen',
      '3-jahres-plan',
    ]
    expect(isInternalOnlyFamily(familyKey('BtMM_15-geschaeftsmodell-3j_v0.5.15_2026-11-17.md'), pats)).toBe(true)
    expect(isInternalOnlyFamily(familyKey('BtMM_annahmen-und-quellen_v1.9_2026-11-19.md'), pats)).toBe(true)
    expect(isInternalOnlyFamily(familyKey('BtMM_3-jahres-plan_v3.9_2026-11-19.md'), pats)).toBe(true)
    expect(isInternalOnlyFamily(familyKey('BtMM_foerderung-eigenkapital-2028_v1.1_2026-11-09.md'), pats)).toBe(true)
    expect(isInternalOnlyFamily(familyKey('BtMM_00-einfach-erklaert-start-hier_v1.17.0.md'), pats)).toBe(false)
  })

  it('hält App-README und Werkzeugkasten-STAND getrennt', () => {
    expect(familyKey('BtMM-App/README.md')).not.toBe(familyKey('branchen-software/README.md'))
    expect(familyKey('werkzeugkasten/STAND.md')).not.toBe(familyKey('DRIVE/md-intern/06-intern/BtMM_stand_v1.0_2026-10-27.md'))
    expect(familyKey('werkzeugkasten/STAND.md')).toMatch(/werkzeugkasten/)
  })

  it('hält die beiden 11er als verschiedene Dokumente', () => {
    expect(familyKey('DRIVE/MDs/03-konzept/BtMM_11-handwerk-ergaenzung_v3.2.0_2026-11-01.md')).toBe(
      '11-handwerk-ergaenzung'
    )
    expect(familyKey('DOKUMENTE/11_BWGV-Mustersatzung-Abgleich.md')).toBe(
      '11-bwgv-mustersatzung-abgleich'
    )
    expect(familyKey('DRIVE/MDs/03-konzept/BtMM_11-handwerk-ergaenzung_v3.2.0_2026-11-01.md')).not.toBe(
      familyKey('DOKUMENTE/11_BWGV-Mustersatzung-Abgleich.md')
    )
  })

  it('gibt Root-Finanzen und DOKUMENTE bei gleicher Version Vorrang vor DRIVE/MDs', () => {
    expect(sourceRank('3-JAHRES-PLAN-v3.9-2026-11-19.md')).toBeGreaterThan(
      sourceRank('DRIVE/MDs/04-finanzen/BtMM_3-jahres-plan_v3.9_2026-11-19.md')
    )
    expect(sourceRank('DOKUMENTE/07_BtMM_Konzept_v22_69_0.md')).toBeGreaterThan(
      sourceRank('DRIVE/MDs/03-konzept/BtMM_07-konzept_v22.68.0_2026-11-17.md')
    )
    const docs = [
      { rel: 'DRIVE/offizielles/btmm/dokumente/04-finanzen/BtMM_3-jahres-plan_v3.9_2026-11-19.md' },
      { rel: '3-JAHRES-PLAN-v3.9-2026-11-19.md' },
    ]
    const latest = selectLatestByFamily(docs)
    expect(latest).toHaveLength(1)
    expect(latest[0].rel).toBe('3-JAHRES-PLAN-v3.9-2026-11-19.md')
  })

  it('erkennt zurückgezogene Satzung v7/v8 und alte 08a', () => {
    expect(isRetiredRel('DOKUMENTE/08_BtMM_Satzung_eG_v7_54_0.md')).toBe(true)
    expect(isRetiredRel('DOKUMENTE/08_BtMM_Satzung_eG_v8_3_0_Kernsatzung_ENTWURF.md')).toBe(true)
    expect(isRetiredRel('DOKUMENTE/08a_BtMM_Ordnungen_ENTWURF.md')).toBe(true)
    expect(isRetiredRel('DOKUMENTE/08_BtMM_Satzung_eG_v9_1_3_aussen_ENTWURF.md')).toBe(false)
    expect(isRetiredRel('DOKUMENTE/08a_BtMM_Ordnungen_v2_0_3_schlank_ENTWURF.md')).toBe(false)
  })
})
