// Fallback für Pfade außerhalb von /[locale] (z. B. /datei.pdf).
// Das Root-Layout rendert kein <html>/<body>, daher hier selbst – sonst React #418.
export default function RootNotFound() {
  return (
    <html lang="de">
      <body style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h1>404</h1>
        <p>Seite nicht gefunden.</p>
        <a href="/de">Zur Startseite</a>
      </body>
    </html>
  )
}
