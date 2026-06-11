
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Search, MapPin, ArrowRight, Clock, Euro } from 'lucide-react'

interface Angebot {
  id: string
  titel: string
  beschreibung: string
  ort: string
  kategorie: string
  preis: string
  link: string
  verfuegbar: boolean
}

const angebote: Angebot[] = [
  {
    id: 'koerperarbeit-freiburg',
    titel: 'Back to Meaning Maximization Körperarbeit Freiburg',
    beschreibung: 'Tiefgreifende Wellnessmethode für den gesamten Bewegungsapparat. Sanfte Schwingungen bewirken einen Reset auf allen Gelenkebenen. Besonders wohltuend bei Rückenbeschwerden, Verspannungen, Kopfschmerzen und zur Geburtsvorbereitung.',
    ort: 'Freiburg',
    kategorie: 'Körperarbeit',
    preis: 'ab 70 €',
    link: '/koerperarbeit',
    verfuegbar: true,
  },
]

export function AngeboteSuche() {
  const [suche, setSuche] = useState('')

  const gefiltert = angebote.filter((a) => {
    const term = suche.toLowerCase()
    return (
      a.titel.toLowerCase().includes(term) ||
      a.beschreibung.toLowerCase().includes(term) ||
      a.ort.toLowerCase().includes(term) ||
      a.kategorie.toLowerCase().includes(term)
    )
  })

  return (
    <div>
      {/* Suchfeld */}
      <div style={{
        position: 'relative',
        maxWidth: 560,
        margin: '0 auto 2.5rem',
      }}>
        <Search
          size={20}
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--btb-oliv)',
            opacity: 0.5,
          }}
        />
        <input
          type="text"
          placeholder="Angebot suchen (z. B. Körperarbeit, Freiburg ...)"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          style={{
            width: '100%',
            padding: '0.9rem 1rem 0.9rem 3rem',
            borderRadius: 12,
            border: '2px solid var(--btb-oliv)',
            background: 'var(--btb-weiss)',
            fontSize: '1rem',
            fontFamily: 'inherit',
            color: 'var(--btb-dunkel)',
            outline: 'none',
          }}
        />
      </div>

      {/* Ergebnisse */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {gefiltert.map((angebot) => (
          <RouterLink 
            key={angebot.id}
            href={angebot.link}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              className="card-btb"
              style={{
                padding: '2rem',
                borderRadius: 16,
                border: '2px solid var(--btb-oliv)',
                background: 'linear-gradient(135deg, #f8f6ee, var(--btb-creme))',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(26,21,5,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 250 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--btb-weiss)',
                      background: 'var(--btb-oliv)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 6,
                    }}>
                      {angebot.kategorie}
                    </span>
                    {angebot.verfuegbar && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--btb-oliv)',
                        fontWeight: 600,
                      }}>
                        Verfügbar
                      </span>
                    )}
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-garamond)',
                    fontSize: '1.5rem',
                    color: 'var(--btb-dunkel)',
                    marginBottom: '0.75rem',
                  }}>
                    {angebot.titel}
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    opacity: 0.8,
                    marginBottom: '1rem',
                  }}>
                    {angebot.beschreibung}
                  </p>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--btb-oliv)' }}>
                      <MapPin size={16} /> {angebot.ort}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--btb-blau)' }}>
                      <Euro size={16} /> {angebot.preis}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--btb-oliv)' }}>
                  <ArrowRight size={24} />
                </div>
              </div>
            </div>
          </RouterLink>
        ))}

        {gefiltert.length === 0 && (
          <p style={{ textAlign: 'center', opacity: 0.6, fontSize: '1rem', padding: '2rem' }}>
            Keine Angebote gefunden. Weitere Angebote sind in Planung.
          </p>
        )}
      </div>

      {/* Hinweis auf kommende Angebote */}
      <div style={{
        marginTop: '2.5rem',
        padding: '1.5rem 2rem',
        borderRadius: 12,
        background: 'var(--btb-weiss)',
        border: '1px dashed var(--btb-oliv)',
        textAlign: 'center',
        opacity: 0.8,
      }}>
        <p style={{ fontSize: '0.95rem', color: 'var(--btb-dunkel)' }}>
          Weitere Angebote sind in Planung. Je mehr Berufe und Fähigkeiten im System vertreten sind, desto breiter wird das Sortiment.
        </p>
        <RouterLink  to="/mitmachen" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '0.75rem',
          color: 'var(--btb-oliv)',
          fontWeight: 600,
          fontSize: '0.9rem',
        }}>
          Mitmachen <ArrowRight size={14} />
        </RouterLink>
      </div>
    </div>
  )
}
