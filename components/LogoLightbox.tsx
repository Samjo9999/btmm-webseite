'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImageZoomDialog } from '@/components/ImageZoomDialog'

interface LogoLightboxProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  style?: React.CSSProperties
  priority?: boolean
}

export function LogoLightbox({ src, alt, width, height, className, style, priority }: LogoLightboxProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`logo-lightbox-trigger ${className || ''}`}
        style={{
          ...style,
          cursor: 'pointer',
          transition: 'transform 0.3s ease, filter 0.3s ease',
          filter: 'drop-shadow(0 0 20px rgba(var(--btmm-glow-rgb), 0.3))',
          animation: 'logo-glow 3s ease-in-out infinite alternate',
        }}
        priority={priority}
        onClick={() => setOpen(true)}
        onMouseOver={(e) => {
          e.currentTarget.style.filter = 'drop-shadow(0 0 30px rgba(var(--btmm-glow-rgb), 0.8)) drop-shadow(0 0 60px rgba(var(--btmm-akzent-rgb), 0.4))'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(var(--btmm-glow-rgb), 0.3))'
          e.currentTarget.style.transform = ''
        }}
      />
      <style>{`
        @keyframes logo-glow {
          0% { filter: drop-shadow(0 0 15px rgba(var(--btmm-glow-rgb), 0.6)) drop-shadow(0 0 30px rgba(var(--btmm-akzent-rgb), 0.35)); }
          100% { filter: drop-shadow(0 0 25px rgba(var(--btmm-glow-rgb), 0.9)) drop-shadow(0 0 55px rgba(var(--btmm-akzent-rgb), 0.6)); }
        }
      `}</style>

      <ImageZoomDialog src={src} alt={alt} open={open} onOpenChange={setOpen} />
    </>
  )
}
