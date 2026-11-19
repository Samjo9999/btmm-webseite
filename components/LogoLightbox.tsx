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
          cursor: 'pointer',
          transition: 'transform 0.3s ease, filter 0.3s ease',
          filter: 'drop-shadow(0 0 28px rgba(158, 87, 164, 0.95)) drop-shadow(0 0 48px rgba(176, 88, 179, 0.7)) drop-shadow(0 4px 18px rgba(0, 0, 0, 0.4))',
          animation: 'logo-glow 3s ease-in-out infinite alternate',
          ...style,
        }}
        priority={priority}
        onClick={() => setOpen(true)}
        onMouseOver={(e) => {
          e.currentTarget.style.filter = 'drop-shadow(0 0 32px rgba(158, 87, 164, 1)) drop-shadow(0 0 56px rgba(176, 88, 179, 0.85)) drop-shadow(0 4px 18px rgba(0, 0, 0, 0.4))'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.filter = (style && style.filter) ? String(style.filter) : 'drop-shadow(0 0 28px rgba(158, 87, 164, 0.95)) drop-shadow(0 0 48px rgba(176, 88, 179, 0.7)) drop-shadow(0 4px 18px rgba(0, 0, 0, 0.4))'
          e.currentTarget.style.transform = ''
        }}
      />
      <style>{`
        @keyframes logo-glow {
          0% { filter: drop-shadow(0 0 22px rgba(158, 87, 164, 0.85)) drop-shadow(0 0 40px rgba(176, 88, 179, 0.55)) drop-shadow(0 4px 18px rgba(0, 0, 0, 0.35)); }
          100% { filter: drop-shadow(0 0 28px rgba(158, 87, 164, 0.95)) drop-shadow(0 0 48px rgba(176, 88, 179, 0.7)) drop-shadow(0 4px 18px rgba(0, 0, 0, 0.4)); }
        }
      `}</style>

      <ImageZoomDialog src={src} alt={alt} open={open} onOpenChange={setOpen} />
    </>
  )
}
