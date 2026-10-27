'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

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

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {/* Wald-Hintergrund */}
          <Image
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80"
            alt=""
            fill
            style={{ position: 'absolute', objectFit: 'cover' }}
            priority
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(26, 21, 5, 0.6)' }} />

          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', cursor: 'default', zIndex: 1 }}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: -44,
                right: 0,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              <X size={32} />
            </button>
            <Image
              src={src}
              alt={alt}
              width={480}
              height={480}
              style={{
                maxWidth: '80vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 40px rgba(var(--btmm-glow-rgb), 0.5)) drop-shadow(0 8px 32px rgba(0,0,0,0.6))',
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
