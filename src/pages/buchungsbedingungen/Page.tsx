
import { useState, useEffect } from 'react'

interface ServiceCancellation {
  id: string
  name: string
  cancellation_days: number | null
  late_cancel_fee_percent: number | null
  cancellation_note: string | null
}

export default function BuchungsbedingungenPage() {
  const [services, setServices] = useState<ServiceCancellation[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('https://xcngmshjuqoucdlgikao.supabase.co/functions/v1/public-booking/services?company_id=396ad7a6-e4d1-4c7d-abc1-ef9f2c4c2da9')
      .then(res => res.json())
      .then(data => {
        if (data.services) setServices(data.services)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const headingStyle = {
    fontFamily: 'var(--font-garamond)',
    color: 'var(--btb-rot)',
    fontSize: '1.5rem',
    marginTop: '2rem',
    marginBottom: '1rem',
  }

  return (
    <>
      <section style={{
        background: 'var(--btb-oliv)',
        padding: '4rem 1.5rem 3rem',
      }}>
        <div className="container-btb">
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--btb-creme)',
          }}>
            Buchungsbedingungen
          </h1>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <div className="prose-btb">
            <p style={{ opacity: 0.7, marginBottom: '2rem' }}>
              Stand: aktuell
            </p>

            <h2 style={headingStyle}>
              1. Vertragsschluss
            </h2>
            <p>
              Mit Klick auf &bdquo;Jetzt verbindlich buchen&ldquo; kommt ein Vertrag
              über die gewählte Dienstleistung zustande. Der Vertrag kommt mit Zugang der
              Buchungsbestätigung per E-Mail zustande.
            </p>

            <h2 style={headingStyle}>
              2. Preise
            </h2>
            <p>
              Alle Preise in EUR. Gemäß § 19 UStG (Kleinunternehmerregelung) wird keine
              Umsatzsteuer erhoben und daher auch nicht ausgewiesen. Die Zahlung erfolgt
              vor Ort in bar oder per Überweisung.
            </p>

            <h2 style={headingStyle}>
              3. Stornierung
            </h2>
            {loaded && services.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {services.map(svc => (
                  <div key={svc.id} style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--btb-creme, #f0e9b6)',
                    borderRadius: 10,
                  }}>
                    <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{svc.name}</p>
                    <p style={{ margin: 0 }}>
                      Kostenfreie Stornierung bis{' '}
                      <strong>{svc.cancellation_days ?? 3} Tage</strong> vor dem Termin.
                      Bei späterer Stornierung wird eine Gebühr von{' '}
                      <strong>{svc.late_cancel_fee_percent ?? 50}%</strong> des Preises fällig.
                    </p>
                    {svc.cancellation_note && (
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                        {svc.cancellation_note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>
                Eine kostenfreie Stornierung ist bis 3 Tage vor dem gebuchten Termin möglich.
                Bei späterer Stornierung oder Nichterscheinen wird eine Ausfallgebühr in Höhe
                von 50% des vereinbarten Preises fällig.
              </p>
            )}
            <p style={{ marginTop: '1rem' }}>
              Die Stornierung kann über das Stornierungsformular auf der Termine-Seite oder per
              E-Mail an office@b-t-m-m.com erfolgen.
            </p>

            <h2 style={headingStyle}>
              4. Bundle-Buchungscodes
            </h2>
            <p>
              Buchungscodes aus Paket-Buchungen sind 12 Monate gültig, nicht übertragbar
              und an die bei der Buchung verwendete E-Mail-Adresse gebunden.
              Eine Auszahlung des Restwertes ist nicht möglich.
            </p>

            <h2 style={headingStyle}>
              5. Haftung
            </h2>
            <p>
              Die angebotene Körperarbeit ist eine Wellnessmethode und ersetzt keine medizinische
              Behandlung, Diagnose oder Therapie. Die Teilnahme erfolgt auf eigene Verantwortung.
              Bei gesundheitlichen Beschwerden ist vorab ein Arzt oder Heilpraktiker zu konsultieren.
              Es werden keine Heilversprechen gegeben.
            </p>
            <p>
              Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit nicht Leben,
              Körper oder Gesundheit betroffen sind oder wesentliche Vertragspflichten verletzt werden.
            </p>

            <h2 style={headingStyle}>
              6. Gerichtsstand
            </h2>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Freiburg im
              Breisgau, soweit gesetzlich zulässig.
            </p>

            <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--btb-creme)', borderRadius: 12 }}>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                <strong>Anbieter:</strong><br />
                Johannes-Samuel Gartzke<br />
                Back to Meaning Maximization<br />
                Hildastr. 12, 79102 Freiburg im Breisgau<br />
                E-Mail: office@b-t-m-m.com<br />
                Telefon: 0176 44453687
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
