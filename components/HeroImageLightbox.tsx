'use client'

import { useState } from 'react'
import { ImageZoomDialog } from '@/components/ImageZoomDialog'
import { Maximize2 } from 'lucide-react'

interface HeroImageLightboxProps {
  src: string
  alt: string
}

export function HeroImageLightbox({ src, alt }: HeroImageLightboxProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Klick-Overlay über dem Hero-Bild */}
      <button
        onClick={() => setOpen(true)}
        aria-label={`Bild vergrößern: ${alt}`}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1,
          cursor: 'zoom-in',
          background: 'transparent',
          border: 'none',
          padding: 0,
        }}
      />

      {/* Hinweis-Icon unten rechts */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Bild vergrößern"
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 3,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          border: 'none',
          borderRadius: 10,
          padding: '8px 12px',
          cursor: 'zoom-in',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'white',
          fontSize: '0.75rem',
          fontFamily: 'inherit',
          transition: 'background 0.2s',
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)' }}
        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)' }}
      >
        <Maximize2 size={14} />
        <span>Bild ansehen</span>
      </button>

      <ImageZoomDialog src={src} alt={alt} open={open} onOpenChange={setOpen} />
    </>
  )
}
