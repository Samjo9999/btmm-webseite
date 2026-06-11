
import { useState } from 'react'
// import Image (use <img>) 
import { X, Maximize2 } from 'lucide-react'

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

      {/* Lightbox */}
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
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(8px)',
            cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 44,
              height: 44,
              cursor: 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={24} />
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '90vw', height: '85vh' }}>
            <img 
              src={src}
              alt={alt}style={{ objectFit: 'contain' }}
              sizes="90vw"
            />
          </div>
          <p style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-garamond)',
            fontStyle: 'italic',
          }}>
            {alt}
          </p>
        </div>
      )}
    </>
  )
}
