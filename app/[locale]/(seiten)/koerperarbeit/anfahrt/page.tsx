import Link from 'next/link'
import { MapPin, Train, Clock, Phone } from 'lucide-react'

export default function AnfahrtPage() {
  return (
    <>
      <section style={{
        background: 'var(--btb-weiss)',
        padding: '2rem 1.5rem 0',
      }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <p style={{ color: 'var(--btb-dunkel)', opacity: 0.6, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <Link href="/koerperarbeit" style={{ color: 'var(--btb-dunkel)', opacity: 0.6, textDecoration: 'none' }}>Körperarbeit</Link>
            {' › Anfahrt'}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            color: 'var(--btb-dunkel)',
            marginBottom: '0.5rem',
          }}>
            So finden Sie zu uns
          </h1>
          <p style={{ opacity: 0.6, marginBottom: '2rem', lineHeight: 1.7 }}>
            Ganzheitliche Körperarbeit im Herzen von Freiburg — zentral gelegen, gut erreichbar.
          </p>

          {/* Adresse */}
          <div style={{
            background: 'var(--btb-creme)',
            borderRadius: 12,
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}>
            <MapPin size={24} style={{ color: 'var(--btb-rot)', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--btb-dunkel)', marginBottom: '0.25rem' }}>
                Back to Meaning Maximization — Ganzheitliche Körperarbeit
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--btb-dunkel)', lineHeight: 1.6 }}>
                Hildastraße 12<br />
                79102 Freiburg im Breisgau
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--btb-dunkel)', opacity: 0.7, marginTop: '0.5rem', lineHeight: 1.6 }}>
                Im Gebäude des ehemaligen Artraums — auf der gegenüberliegenden Straßenseite der Straßenbahnhaltestelle.
              </p>
            </div>
          </div>

          {/* Anfahrtsbeschreibung */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              background: 'rgba(42,124,171,0.06)',
              border: '1.5px solid rgba(42,124,171,0.15)',
              borderRadius: 12,
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Train size={20} style={{ color: 'var(--btb-blau)' }} />
                <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.1rem', color: 'var(--btb-dunkel)' }}>
                  Mit der Straßenbahn
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--btb-dunkel)', opacity: 0.8 }}>
                Die Praxis liegt am Anfang der Hildastraße, direkt an der Straßenbahnhaltestelle.
                Von der Haltestelle aus sehen Sie das Gebäude auf der gegenüberliegenden Straßenseite —
                dort wo der ehemalige Artraum war. Wenige Schritte vom Hauptbahnhof entfernt.
              </p>
            </div>

            <div style={{
              background: 'rgba(143,169,66,0.06)',
              border: '1.5px solid rgba(143,169,66,0.15)',
              borderRadius: 12,
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <MapPin size={20} style={{ color: 'var(--btb-oliv)' }} />
                <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.1rem', color: 'var(--btb-dunkel)' }}>
                  Mit dem Auto
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--btb-dunkel)', opacity: 0.8 }}>
                Parkplätze finden Sie in den umliegenden Seitenstraßen oder im Parkhaus am Hauptbahnhof.
                Die Hildastraße liegt zentral in der Innenstadt, wenige Gehminuten vom Bahnhof entfernt.
              </p>
            </div>

            <div style={{
              background: 'rgba(182,24,24,0.04)',
              border: '1.5px solid rgba(182,24,24,0.1)',
              borderRadius: 12,
              padding: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Clock size={20} style={{ color: 'var(--btb-rot)' }} />
                <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.1rem', color: 'var(--btb-dunkel)' }}>
                  Vor dem Termin
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--btb-dunkel)', opacity: 0.8 }}>
                Bitte kommen Sie 5 Minuten vor Ihrem Termin.
                Tragen Sie bequeme Kleidung — die Arbeit findet in entspannter Atmosphäre statt.
                Bei Fragen zur Anfahrt erreichen Sie uns unter 0176 44453687.
              </p>
            </div>
          </div>

          {/* OpenStreetMap Embed */}
          <div style={{
            borderRadius: 12,
            overflow: 'hidden',
            border: '1.5px solid var(--btb-creme)',
            marginBottom: '2rem',
          }}>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=7.836%2C47.992%2C7.843%2C47.996&layer=mapnik&marker=47.9938%2C7.8396"
              style={{ width: '100%', height: 350, border: 0 }}
              loading="lazy"
              title="Standort Back to Meaning Maximization — Hildastraße 12, Freiburg"
            />
            <div style={{
              background: 'var(--btb-creme)',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--btb-dunkel)' }}>
                <MapPin size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                Hildastraße 12, 79102 Freiburg im Breisgau
              </span>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=47.9938,7.8396"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--btb-blau)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                }}
              >
                Route planen →
              </a>
            </div>
          </div>

          {/* Kontakt */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '1rem' }}>
              Fragen zur Anfahrt? Wir helfen gerne.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="tel:017644453687" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                color: 'var(--btb-blau)', fontWeight: 600, textDecoration: 'none',
              }}>
                <Phone size={16} /> 0176 44453687
              </a>
              <Link href="/koerperarbeit/preise" className="btn-primary" style={{ fontSize: '0.9rem' }}>
                Termin buchen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
