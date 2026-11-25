'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  naechsterScrollY,
  reduzierteBewegung,
  sammleAbschnittTops,
  sammleUntereLeisten,
  sollSichtbar,
  liftUeberElement,
} from '@/lib/mehr-erfahren.mjs'
import '../public/mehr-erfahren.css'

export function ScrollHint() {
  const t = useTranslations('common')
  const [sichtbar, setSichtbar] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  const pruefen = useCallback(() => {
    const gesperrt = typeof document !== 'undefined' && document.body.classList.contains('pfad-leiste-an')
    // W1: nur im Hero zeigen; sobald gescrollt wird (> 120 px), nicht mehr über dem Inhalt stehen
    const imHero = window.scrollY <= 120
    let an = imHero && sollSichtbar({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      scrollY: window.scrollY,
      gesperrt,
    })
    const knopf = ref.current
    if (knopf && an) {
      let lift = sammleUntereLeisten(document, window.innerWidth, window.innerHeight, knopf)
      knopf.style.visibility = 'hidden'
      const r = knopf.getBoundingClientRect()
      const treffer = document.elementFromPoint(r.left + r.width / 2, window.innerHeight - 8)
      const fuss = treffer?.closest('footer')
      if (fuss) lift = Math.max(lift, liftUeberElement(fuss.getBoundingClientRect().top, window.innerHeight))

      // W1 r2: Nie über einem Knopf oder Link stehen (z. B. „Mitmachen“ im Hero auf 390×844).
      // Geprüft wird die Fläche, die der Hinweis unten mittig einnimmt (ca. 170 × 60 px + Abstand).
      const mitte = window.innerWidth / 2
      const unten = window.innerHeight - 24
      let ueberlappt = false
      for (const dy of [4, 20, 36, 52, 68]) {
        for (const dx of [-85, -42, 0, 42, 85]) {
          const el = document.elementFromPoint(mitte + dx, unten - dy)
          const ziel = el?.closest('a, button, input, select, textarea, [role="button"]')
          // Flächige Klickzonen (z. B. „Bild vergrößern“ über dem ganzen Hero-Bild) zählen nicht
          const flaechig = ziel ? ziel.getBoundingClientRect().height > 200 : false
          if (ziel && !flaechig && !ziel.closest('[data-scroll-hint]')) { ueberlappt = true; break }
        }
        if (ueberlappt) break
      }
      if (ueberlappt) an = false

      knopf.style.visibility = 'visible'
      knopf.style.setProperty('--mehr-erfahren-lift', lift > 0 ? `${lift}px` : '0px')
    }
    setSichtbar(an)
  }, [])

  useEffect(() => {
    const start = window.requestAnimationFrame(() => pruefen())
    // Hero-Animationen und Schriften verschieben Knöpfe nach dem ersten Rendern: nachprüfen
    const t1 = window.setTimeout(() => pruefen(), 700)
    const t2 = window.setTimeout(() => pruefen(), 1600)
    const onScroll = () => pruefen()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    window.addEventListener('load', onScroll)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => pruefen()) : null
    if (ro) ro.observe(document.documentElement)
    let to: ReturnType<typeof setTimeout> | undefined
    const spaet = () => {
      clearTimeout(to)
      to = setTimeout(pruefen, 80)
    }
    const mo = typeof MutationObserver !== 'undefined'
      ? new MutationObserver((muts) => {
          if (muts.every((m) => m.target instanceof Element && (m.target as Element).closest('[data-scroll-hint]'))) return
          spaet()
        })
      : null
    if (mo) mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] })
    return () => {
      window.cancelAnimationFrame(start)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('load', onScroll)
      clearTimeout(to)
      ro?.disconnect()
      mo?.disconnect()
    }
  }, [pruefen])

  const weiter = () => {
    const y = naechsterScrollY({
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
      abschnittTops: sammleAbschnittTops(document, window.scrollY),
    })
    window.scrollTo({ top: y, behavior: reduzierteBewegung() ? 'auto' : 'smooth' })
  }

  const label = t('actions.mehr_erfahren')
  const aria = t('actions.mehr_erfahren_aria')

  return (
    <button
      ref={ref}
      type="button"
      data-scroll-hint
      hidden={!sichtbar}
      aria-hidden={!sichtbar}
      tabIndex={sichtbar ? 0 : -1}
      aria-label={aria}
      onClick={weiter}
    >
      <span>{label}</span>
      <svg className="mehr-erfahren-pfeil" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </button>
  )
}
