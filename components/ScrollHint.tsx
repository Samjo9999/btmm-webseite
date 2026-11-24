'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  naechsterScrollY,
  reduzierteBewegung,
  sammleAbschnittTops,
  sammleUntereLeisten,
  sollSichtbar,
} from '@/lib/mehr-erfahren.mjs'
import '../public/mehr-erfahren.css'

export function ScrollHint() {
  const t = useTranslations('common')
  const [sichtbar, setSichtbar] = useState(false)
  const ref = useRef<HTMLButtonElement>(null)

  const pruefen = useCallback(() => {
    const gesperrt = typeof document !== 'undefined' && document.body.classList.contains('pfad-leiste-an')
    const an = sollSichtbar({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      scrollY: window.scrollY,
      gesperrt,
    })
    setSichtbar(an)
    const knopf = ref.current
    if (knopf && an) {
      const lift = sammleUntereLeisten(document, window.innerWidth, window.innerHeight, knopf)
      knopf.style.setProperty('--mehr-erfahren-lift', lift > 0 ? `${lift + 8}px` : '0px')
    }
  }, [])

  useEffect(() => {
    const start = window.requestAnimationFrame(() => pruefen())
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

