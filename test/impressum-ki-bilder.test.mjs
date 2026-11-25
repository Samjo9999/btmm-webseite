import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'app/[locale]/(seiten)/impressum/page.tsx'), 'utf8')

const CREDITS = [
  'Bilder erstellt mit Grok (KI)',
  'Images created with Grok (AI)',
  'Images créées avec Grok (IA)',
  'Imágenes creadas con Grok (IA)',
  'Imagens criadas com Grok (IA)',
  'Изображения созданы с помощью Grok (ИИ)',
  'صور أُنشئت باستخدام Grok (ذكاء اصطناعي)',
  'चित्र Grok (एआई) से बनाए गए',
  'ছবিগুলো Grok (এআই) দিয়ে তৈরি',
  '画像は Grok（AI）で作成',
  '图片由 Grok（AI）生成',
]

test('Impressum nennt KI-Bild-Credit der Tür-Fotos in allen Sprachen des Impressums', () => {
  const urheber = src.indexOf('<h3>Urheberrecht</h3>')
  const hinweis = src.indexOf('bildHinweis.titel')
  const koerper = src.indexOf('<h3>Hinweis zur Körperarbeit</h3>')
  assert.ok(urheber > 0 && hinweis > urheber && hinweis < koerper)
  assert.match(src, /KI-generiert oder KI-bearbeitet/)
  assert.match(src, /Fotos im Kennenlern-Weg der Tür/)
  for (const credit of CREDITS) {
    assert.ok(src.includes(credit), `Credit fehlt im Impressum: ${credit}`)
  }
  assert.match(src, /BILD_HINWEIS\[locale\]/)
})
