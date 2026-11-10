import Link from 'next/link'
import contactData from '@/data/contact.json'

// Buchung vorerst nur als unverbindliche Anfrage: keine verbindliche Buchung,
// keine Vorkasse, kein Zahlungslink (RECHT.md, Fragen BtMM-Bot 03.11.2026, Nr. 3).
export default function BuchenPage() {
  const betreff = encodeURIComponent('Terminanfrage Körperarbeit')
  return (
    <div>
      <section style={{ background: 'var(--btb-weiss)', padding: '2rem 1.5rem 0' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <p style={{ color: 'var(--btb-dunkel)', opacity: 0.6, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <Link href="/koerperarbeit" style={{ color: 'var(--btb-dunkel)', opacity: 0.6, textDecoration: 'none' }}>Körperarbeit</Link>
            {' › '}
            <Link href="/koerperarbeit/preise" style={{ color: 'var(--btb-dunkel)', opacity: 0.6, textDecoration: 'none' }}>Preise</Link>
            {' › Anfrage'}
          </p>
        </div>
      </section>

      <section style={{ background: 'var(--btb-weiss)', padding: '1rem 1.5rem 3rem' }}>
        <div className="container-btb prose-btb" style={{ maxWidth: 800 }}>
          <h1 style={{ fontFamily: 'var(--font-garamond)', color: 'var(--btb-rot)' }}>Termin anfragen</h1>
          <p>
            Termine vergeben wir derzeit nur auf Anfrage. Deine Anfrage ist unverbindlich:
            Es kommt noch kein Vertrag zustande, und es gibt keine Vorkasse und keine Online-Zahlung.
            Wir melden uns per E-Mail und stimmen den Termin mit dir ab.
          </p>
          <p>
            <a className="btn-primary" href={`mailto:${contactData.email}?subject=${betreff}`}>
              Anfrage per E-Mail senden
            </a>
          </p>
          <p>
            Oder nutze das <Link href="/koerperarbeit/kontakt">Kontaktformular</Link>.
          </p>
        </div>
      </section>
    </div>
  )
}
