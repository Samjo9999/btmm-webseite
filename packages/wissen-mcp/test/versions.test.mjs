import { describe, it, expect } from 'vitest'
import { familyKey, parseVersion, compareVersions, selectLatestByFamily, isInternalOnlyFamily } from '../src/versions.mjs'

describe('versions', () => {
  it('parst Punkt- und Unterstrich-Versionen', () => {
    expect(compareVersions(parseVersion('v9.1.3'), parseVersion('v9_1_2'))).toBeGreaterThan(0)
    expect(compareVersions(parseVersion('v22.69.0'), parseVersion('v22.68.0'))).toBeGreaterThan(0)
    expect(compareVersions(parseVersion('v3.9'), parseVersion('v3.6a'))).toBeGreaterThan(0)
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
})

