'use client'
import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'

export function ImageZoomDialog({ src, alt, open, onOpenChange }: { src: string; alt: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [zoom, setZoom] = useState(1)
  useEffect(() => { if (open) setZoom(1) }, [open])
  const control = { background: '#780268', color: 'white', border: 0, borderRadius: 8, padding: '.6rem .9rem', cursor: 'pointer' } as const
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 10000 }} />
      <Dialog.Content aria-describedby={undefined} style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', gap: '.75rem' }}>
        <Dialog.Title style={{ color: 'white', fontSize: '1rem', textAlign: 'center' }}>{alt}</Dialog.Title>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button style={control} aria-label="Verkleinern" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - .5))}>−</button>
          <output style={{ color: 'white', minWidth: 55, textAlign: 'center' }} aria-live="polite">{Math.round(zoom * 100)} %</output>
          <button style={control} aria-label="Vergrößern" disabled={zoom >= 4} onClick={() => setZoom(z => Math.min(4, z + .5))}>+</button>
          <button style={control} onClick={() => setZoom(1)}>Einpassen</button>
          <Dialog.Close style={control} aria-label="Bild schließen">Schließen ×</Dialog.Close>
        </div>
        <div style={{ width: '100%', flex: 1, minHeight: 0, overflow: 'auto', overscrollBehavior: 'contain' }}>
          <div style={{ position: 'relative', width: `${zoom * 100}%`, height: `${zoom * 100}%`, minHeight: '100%', cursor: zoom < 4 ? 'zoom-in' : 'default' }} onClick={() => setZoom(z => Math.min(4, z + .5))}>
            <Image src={src} alt={alt} fill sizes={`${zoom * 100}vw`} style={{ objectFit: 'contain' }} />
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}
