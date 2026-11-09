import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Seite nicht gefunden', robots: { index: false } }

export default function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '3rem 1.5rem',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-garamond)',
        fontSize: '5rem',
        color: 'var(--btb-creme)',
        marginBottom: '0.5rem',
      }}>
        404
      </h1>
      <h2 style={{
        fontFamily: 'var(--font-garamond)',
        color: 'var(--btb-oliv)',
        fontSize: '1.5rem',
        marginBottom: '1rem',
      }}>
        Seite nicht gefunden
      </h2>
      <p style={{ opacity: 0.7, marginBottom: '2rem' }}>
        Diese Seite existiert nicht oder wurde verschoben.
      </p>
      <Link href="/" className="btn-primary">
        Zur Startseite
      </Link>
    </div>
  )
}
