// Fallback für Pfade außerhalb von /[locale] (z. B. /datei.pdf).
// Das Root-Layout rendert kein <html>/<body>, daher hier selbst – sonst React #418.
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Seite nicht gefunden', robots: { index: false } }

export default function RootNotFound() {
  return (
    <html lang="de">
      <head><title>Seite nicht gefunden</title></head>
      <body style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h1>404</h1>
        <p>Seite nicht gefunden.</p>
        <a href="/de">Zur Startseite</a>
      </body>
    </html>
  )
}
