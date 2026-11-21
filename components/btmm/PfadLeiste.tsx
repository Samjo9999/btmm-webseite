'use client'

/**
 * Pfad-Leiste: führt Schritt für Schritt durch den persönlichen Kennenlern-Weg aus der Tür
 * (Nutzer 21.11.2026 00:21: „Das ankommen soll mich gezielt abholen und einen individuellen kennenlernt Pfad erzeugen“).
 * Liest nur sessionStorage („btmm-eintritt-pfad“), nichts an den Server. Erscheint nur, wenn die aktuelle Seite
 * ein Schritt des Wegs ist. Lässt rechts Platz für den Chat-Knopf (fixed, right 24, 56 px).
 */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PFAD_KEY = 'btmm-eintritt-pfad'

type Schritt = { key: string; href: string; titel: string; bezug: string }
type Pfad = { lang: string; index: number; schritte: Schritt[] }

type Texte = {
  weg: string
  schritt: (i: number, n: number) => string
  naechster: string
  fertig: string
  mitmachen: string
  startseite: string
  zurueck: string
  beenden: string
  aria: string
}

const TEXTE: Record<string, Texte> = {
  de: { weg: 'Dein Weg', schritt: (i, n) => `Schritt ${i} von ${n}`, naechster: 'Nächster Schritt', fertig: 'Dein Weg ist fertig', mitmachen: 'Mitmachen', startseite: 'Zur Startseite', zurueck: 'Zurück zum Weg', beenden: 'Weg beenden', aria: 'Dein Weg durch BtMM' },
  en: { weg: 'Your path', schritt: (i, n) => `Step ${i} of ${n}`, naechster: 'Next step', fertig: 'Your path is complete', mitmachen: 'Get involved', startseite: 'To the home page', zurueck: 'Back to the path', beenden: 'End path', aria: 'Your path through BtMM' },
  fr: { weg: 'Ton chemin', schritt: (i, n) => `Étape ${i} sur ${n}`, naechster: 'Étape suivante', fertig: 'Ton chemin est terminé', mitmachen: 'Participer', startseite: "Vers la page d'accueil", zurueck: 'Retour au chemin', beenden: 'Terminer le chemin', aria: 'Ton chemin à travers BtMM' },
  es: { weg: 'Tu camino', schritt: (i, n) => `Paso ${i} de ${n}`, naechster: 'Siguiente paso', fertig: 'Tu camino está completo', mitmachen: 'Participar', startseite: 'Ir a la página de inicio', zurueck: 'Volver al camino', beenden: 'Terminar el camino', aria: 'Tu camino por BtMM' },
  pt: { weg: 'Seu caminho', schritt: (i, n) => `Passo ${i} de ${n}`, naechster: 'Próximo passo', fertig: 'Seu caminho está completo', mitmachen: 'Participar', startseite: 'Ir para a página inicial', zurueck: 'Voltar ao caminho', beenden: 'Encerrar caminho', aria: 'Seu caminho pelo BtMM' },
  ru: { weg: 'Твой путь', schritt: (i, n) => `Шаг ${i} из ${n}`, naechster: 'Следующий шаг', fertig: 'Твой путь пройден', mitmachen: 'Участвовать', startseite: 'На главную', zurueck: 'Назад к пути', beenden: 'Завершить путь', aria: 'Твой путь по BtMM' },
  ar: { weg: 'طريقك', schritt: (i, n) => `الخطوة ${i} من ${n}`, naechster: 'الخطوة التالية', fertig: 'اكتمل طريقك', mitmachen: 'شارك', startseite: 'إلى الصفحة الرئيسية', zurueck: 'العودة إلى الطريق', beenden: 'إنهاء الطريق', aria: 'طريقك عبر BtMM' },
  hi: { weg: 'आपका रास्ता', schritt: (i, n) => `${n} में से चरण ${i}`, naechster: 'अगला चरण', fertig: 'आपका रास्ता पूरा हुआ', mitmachen: 'भाग लें', startseite: 'मुखपृष्ठ पर जाएँ', zurueck: 'रास्ते पर वापस', beenden: 'रास्ता समाप्त करें', aria: 'BtMM में आपका रास्ता' },
  bn: { weg: 'আপনার পথ', schritt: (i, n) => `${n}টির মধ্যে ধাপ ${i}`, naechster: 'পরের ধাপ', fertig: 'আপনার পথ সম্পূর্ণ', mitmachen: 'অংশ নিন', startseite: 'মূল পাতায় যান', zurueck: 'পথে ফিরে যান', beenden: 'পথ শেষ করুন', aria: 'BtMM-এ আপনার পথ' },
  ja: { weg: 'あなたの道', schritt: (i, n) => `ステップ ${i} / ${n}`, naechster: '次のステップ', fertig: '道のりを歩き終えました', mitmachen: '参加する', startseite: 'トップページへ', zurueck: '道に戻る', beenden: '道を終える', aria: 'BtMMを巡るあなたの道' },
  zh: { weg: '你的路', schritt: (i, n) => `第 ${i} 步，共 ${n} 步`, naechster: '下一步', fertig: '你的路已经走完', mitmachen: '参与', startseite: '前往首页', zurueck: '返回路线', beenden: '结束路线', aria: '你穿越 BtMM 的路' },
}

const DP: Record<string, string> = { fr: ' : ', ja: '：', zh: '：' }

function nurPfad(href: string) {
  return href.split(/[?#]/)[0].replace(/\/+$/, '')
}

function laden(): Pfad | null {
  try {
    const p = JSON.parse(window.sessionStorage.getItem(PFAD_KEY) || 'null')
    return p && Array.isArray(p.schritte) && p.schritte.length ? p : null
  } catch {
    return null
  }
}

export function PfadLeiste({ locale }: { locale: string }) {
  const pathname = usePathname()
  const [pfad, setPfad] = useState<Pfad | null>(null)
  const [index, setIndex] = useState(-1)

  useEffect(() => {
    const p = laden()
    if (!p || p.lang !== locale) {
      setPfad(null)
      setIndex(-1)
      return
    }
    const hier = nurPfad(pathname || '')
    const passt = (i: number) => i >= 0 && i < p.schritte.length && nurPfad(p.schritte[i].href) === hier
    const i = passt(p.index) ? p.index : p.schritte.findIndex((_, j) => passt(j))
    if (i !== -1 && i !== p.index) {
      p.index = i
      try {
        window.sessionStorage.setItem(PFAD_KEY, JSON.stringify(p))
      } catch {}
    }
    setPfad(p)
    setIndex(i)
  }, [pathname, locale])

  const sichtbar = !!pfad && index !== -1
  useEffect(() => {
    document.body.classList.toggle('pfad-leiste-an', sichtbar)
    return () => document.body.classList.remove('pfad-leiste-an')
  }, [sichtbar])

  const weiter = useCallback(() => {
    if (!pfad) return
    const p = { ...pfad, index: index + 1 }
    try {
      window.sessionStorage.setItem(PFAD_KEY, JSON.stringify(p))
    } catch {}
  }, [pfad, index])

  const beenden = useCallback(() => {
    try {
      window.sessionStorage.removeItem(PFAD_KEY)
    } catch {}
    setPfad(null)
    setIndex(-1)
  }, [])

  if (!sichtbar || !pfad) return null

  const t = TEXTE[locale] || TEXTE.de
  const n = pfad.schritte.length
  const s = pfad.schritte[index]
  const letzter = index >= n - 1
  const naechster = letzter ? null : pfad.schritte[index + 1]
  const zielFertig = /\/mitmachen$/.test(nurPfad(s.href)) ? `/${locale}` : `/${locale}/mitmachen`
  const zielFertigText = zielFertig === `/${locale}` ? t.startseite : t.mitmachen

  const klein: React.CSSProperties = { fontSize: 12, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
  const link: React.CSSProperties = { color: '#6d5f6b', textDecoration: 'underline', background: 'none', border: 0, padding: 0, font: 'inherit', fontSize: 11.5, cursor: 'pointer', whiteSpace: 'nowrap' }
  const knopf: React.CSSProperties = {
    flex: '1 1 auto', minWidth: 0, display: 'block', background: '#780268', color: '#fff', borderRadius: 999,
    padding: '6px 14px', fontSize: 14, fontWeight: 600, lineHeight: 1.4, textDecoration: 'none',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center',
  }

  return (
    <>
      <div aria-hidden="true" style={{ height: 96 }} />
      <nav
        aria-label={t.aria}
        data-pfad-leiste
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
          background: '#faf9f9', color: '#2a1828', borderTop: '1px solid #904b97',
          boxShadow: '0 -6px 20px rgba(40,0,40,0.08)',
          padding: '7px 12px calc(7px + env(safe-area-inset-bottom))',
          // Platz rechts für den Chat-Knopf (right 24 + 56 px), in allen Schreibrichtungen
          paddingRight: 92,
          fontFamily: 'var(--font-garamond), Georgia, serif',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ ...klein, color: '#780268', fontWeight: 700 }}>
            {letzter ? t.fertig : t.weg} · {t.schritt(index + 1, n)}
          </div>
          <div style={{ ...klein, fontStyle: 'italic', color: '#6d5f6b' }} title={s.bezug}>
            {s.bezug}{DP[locale] || ': '}{s.titel}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
            {naechster ? (
              <Link href={naechster.href} onClick={weiter} style={knopf}>
                {t.naechster}{DP[locale] || ': '}{naechster.titel}
              </Link>
            ) : (
              <Link href={zielFertig} style={knopf}>
                {zielFertigText}
              </Link>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flex: 'none' }}>
              <a href={`/tuer/index.html?lang=${locale}&pfad=1`} style={link}>{t.zurueck}</a>
              <button type="button" onClick={beenden} style={link}>{t.beenden}</button>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
