
import { useState } from 'react'
// import Image (use <img>) 
import { X } from 'lucide-react'

interface LogoLightboxProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  style?: React.CSSProperties
}

export function LogoLightbox({ src, alt, width, height, className, style }: LogoLightboxProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`logo-lightbox-trigger ${className || ''}`}
        style={{
          ...style,
          cursor: 'pointer',
          transition: 'transform 0.3s ease, filter 0.3s ease',
          filter: 'drop-shadow(0 0 20px rgba(240, 233, 182, 0.3))',
          animation: 'logo-glow 3s ease-in-out infinite alternate',
        }}
        onClick={() => setOpen(true)}
        onMouseOver={(e) => {
          e.currentTarget.style.filter = 'drop-shadow(0 0 30px rgba(240, 233, 182, 0.8)) drop-shadow(0 0 60px rgba(240, 233, 182, 0.4))'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.filter = 'drop-shadow(0 0 20px rgba(240, 233, 182, 0.3))'
          e.currentTarget.style.transform = ''
        }}
      />
      <style>{`
        @keyframes logo-glow {
          0% { filter: drop-shadow(0 0 15px rgba(240, 233, 182, 0.3)); }
          100% { filter: drop-shadow(0 0 35px rgba(240, 233, 182, 0.6)); }
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
          <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80"
            alt=""
            style={{ position: 'absolute', objectFit: 'cover', top: 0, left: 0, width: '100%', height: '100%' }}
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
            <img 
              src={src}
              alt={alt}
              width={480}
              height={480}
              style={{
                maxWidth: '80vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 40px rgba(240, 233, 182, 0.5)) drop-shadow(0 8px 32px rgba(0,0,0,0.6))',
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
