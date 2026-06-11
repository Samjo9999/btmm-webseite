
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

type Props = {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  locale?: string
}

export function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, duration = 2, locale = 'de-DE' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const count = useMotionValue(0)
  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(
          latest.toLocaleString(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        )
      },
    })
    return controls.stop
  }, [inView, value, duration, count, decimals, locale])

  return (
    <span ref={ref}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}

type SectionRevealProps = {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function SectionReveal({ children, delay = 0, className }: SectionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
