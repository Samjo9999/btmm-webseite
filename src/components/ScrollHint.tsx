
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState, useCallback, useRef } from 'react'

export function ScrollHint() {
  const [visible, setVisible] = useState(true)
  const [dunkel, setDunkel] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  const check = useCallback(() => {
    const scrollable = document.documentElement.scrollHeight > window.innerHeight
    const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 80)
    setVisible(scrollable && !atBottom)

    // Hint kurz unsichtbar machen um den echten Hintergrund zu messen
    if (ref.current) {
      ref.current.style.visibility = 'hidden'
    }

    requestAnimationFrame(() => {
      // Mehrere Punkte am unteren Rand prüfen für bessere Erkennung
      const punkte = [
        document.elementFromPoint(window.innerWidth / 2, window.innerHeight - 40),
        document.elementFromPoint(window.innerWidth / 2, window.innerHeight - 80),
        document.elementFromPoint(window.innerWidth / 3, window.innerHeight - 60),
      ]

      let helligkeitSum = 0
      let count = 0

      for (const el of punkte) {
        if (!el) continue
        // Durch die DOM-Hierarchie nach oben gehen bis eine echte Hintergrundfarbe gefunden wird
        let current: Element | null = el
        while (current) {
          const bg = window.getComputedStyle(current).backgroundColor
          const match = bg.match(/\d+/g)
          if (match && match.length >= 3) {
            const [r, g, b] = match.map(Number)
            const a = match[3] ? parseFloat(match[3]) : 1
            if (a > 0.1) { // Nicht transparent
              helligkeitSum += (r * 299 + g * 587 + b * 114) / 1000
              count++
              break
            }
          }
          current = current.parentElement
        }
      }

      if (count > 0) {
        setDunkel(helligkeitSum / count < 140)
      }

      if (ref.current) {
        ref.current.style.visibility = 'visible'
      }
    })
  }, [])

  useEffect(() => {
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check, { passive: true })
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [check])

  if (!visible) return null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.2rem',
        cursor: 'pointer',
        zIndex: 50,
        pointerEvents: 'auto',
        background: dunkel ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(8px)',
        borderRadius: 20,
        padding: '0.4rem 1rem 0.3rem',
        transition: 'background 0.4s',
      }}
      onClick={() => {
        window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' })
      }}
    >
      <span style={{
        fontSize: '0.7rem',
        color: dunkel ? '#ffffff' : 'var(--btb-dunkel)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        transition: 'color 0.4s',
      }}>
        Mehr entdecken
      </span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown size={20} style={{
          color: dunkel ? 'var(--btb-creme)' : 'var(--btb-rot)',
          transition: 'color 0.4s',
        }} />
      </motion.div>
    </motion.div>
  )
}
