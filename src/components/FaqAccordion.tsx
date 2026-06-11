
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type FaqItem = {
  frage: string
  antwort: string
}

export function FaqAccordion({ fragen }: { fragen: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {fragen.map((item, i) => (
        <div
          key={i}
          style={{
            background: 'var(--btb-weiss)',
            borderRadius: 10,
            border: open === i ? '1.5px solid var(--btb-oliv)' : '1.5px solid var(--btb-creme)',
            overflow: 'hidden',
            transition: 'border-color 0.2s ease',
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-garamond)',
              fontSize: '1.05rem',
              fontWeight: 600,
              color: open === i ? 'var(--btb-oliv)' : 'var(--btb-dunkel)',
              textAlign: 'left',
              gap: '1rem',
            }}
          >
            <span>{item.frage}</span>
            <motion.div
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ flexShrink: 0 }}
            >
              <ChevronDown
                size={20}
                style={{ color: open === i ? 'var(--btb-oliv)' : 'var(--btb-dunkel)', opacity: 0.6 }}
              />
            </motion.div>
          </button>

          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <p style={{
                  padding: '0 1.5rem 1.25rem',
                  color: 'var(--btb-dunkel)',
                  opacity: 0.8,
                  lineHeight: 1.75,
                  fontSize: '0.975rem',
                }}>
                  {item.antwort}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
