
import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot } from 'lucide-react'
import { ContactForm } from './ContactForm'

interface Nachricht {
  rolle: 'user' | 'agent'
  text: string
}

export function SupportChat() {
  const [frage, setFrage] = useState('')
  const [nachrichten, setNachrichten] = useState<Nachricht[]>([
    {
      rolle: 'agent',
      text: 'Hallo! Ich bin der BtMM-Assistent und kenne alle Dokumente und Konzepte von Back to Meaning Maximization. Stell mir deine Frage — ich versuche sie direkt zu beantworten.',
    },
  ])
  const [laden, setLaden] = useState(false)
  const [zeigeFormular, setZeigeFormular] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [nachrichten, laden])

  const senden = async () => {
    const text = frage.trim()
    if (!text || laden) return

    setFrage('')
    setNachrichten(prev => [...prev, { rolle: 'user', text }])
    setLaden(true)

    try {
      const res = await fetch('/api/support-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frage: text }),
      })

      if (res.ok) {
        const data = await res.json()
        setNachrichten(prev => [...prev, { rolle: 'agent', text: data.antwort }])
        if (!data.beantwortet) setZeigeFormular(true)
      } else {
        setNachrichten(prev => [...prev, {
          rolle: 'agent',
          text: 'Entschuldigung, es gab ein technisches Problem. Bitte versuche es nochmal oder nutze das Kontaktformular unten.',
        }])
        setZeigeFormular(true)
      }
    } catch {
      setNachrichten(prev => [...prev, {
        rolle: 'agent',
        text: 'Verbindungsproblem. Bitte versuche es erneut.',
      }])
    } finally {
      setLaden(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--btb-weiss)',
      borderRadius: 12,
      border: '1.5px solid var(--btb-creme)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--btb-blau)',
        color: '#fff',
        padding: '0.6rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <Bot size={18} />
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-garamond)', fontSize: '0.95rem' }}>
          BtMM Assistent
        </span>
      </div>

      {/* Nachrichten */}
      <div
        ref={scrollRef}
        style={{
          overflowY: 'auto',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          minHeight: 220,
          maxHeight: 400,
        }}
      >
        {nachrichten.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'flex-start',
              flexDirection: msg.rolle === 'user' ? 'row-reverse' : 'row',
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: msg.rolle === 'agent' ? 'var(--btb-blau)' : 'var(--btb-oliv)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {msg.rolle === 'agent'
                ? <Bot size={14} style={{ color: '#fff' }} />
                : <User size={14} style={{ color: '#fff' }} />
              }
            </div>
            <div style={{
              background: msg.rolle === 'agent' ? 'var(--btb-creme)' : 'rgba(42,124,171,0.1)',
              borderRadius: 10,
              padding: '0.5rem 0.75rem',
              maxWidth: '82%',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              color: 'var(--btb-dunkel)',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {laden && (
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--btb-blau)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Bot size={14} style={{ color: '#fff' }} />
            </div>
            <div style={{
              background: 'var(--btb-creme)', borderRadius: 10,
              padding: '0.5rem 0.75rem', fontSize: '0.88rem',
              color: 'var(--btb-dunkel)', opacity: 0.6,
            }}>
              Suche in den BtMM-Dokumenten …
            </div>
          </div>
        )}

        {zeigeFormular && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(143,169,66,0.08)',
            borderRadius: 10,
            border: '1px dashed var(--btb-oliv)',
          }}>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem', opacity: 0.8 }}>
              Deine Frage braucht eine persönliche Antwort. Hier kannst du sie an unser Team weiterleiten:
            </p>
            <ContactForm
              typ="kontakt"
              betreff={`Support: ${nachrichten.filter(n => n.rolle === 'user').pop()?.text.slice(0, 60) || ''}`}
              placeholder="Ergänze hier ggf. weitere Details …"
            />
          </div>
        )}
      </div>

      {/* Eingabe */}
      {!zeigeFormular && (
        <div style={{
          borderTop: '1px solid var(--btb-creme)',
          padding: '0.6rem',
          display: 'flex',
          gap: '0.4rem',
        }}>
          <input
            type="text"
            value={frage}
            onChange={e => setFrage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && senden()}
            placeholder="Stelle deine Frage …"
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: 8,
              border: '1.5px solid var(--btb-creme)',
              fontFamily: 'inherit',
              fontSize: '0.88rem',
              outline: 'none',
              color: 'var(--btb-dunkel)',
            }}
            disabled={laden}
          />
          <button
            onClick={senden}
            disabled={laden || !frage.trim()}
            style={{
              background: 'var(--btb-blau)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.5rem 0.75rem',
              cursor: laden || !frage.trim() ? 'default' : 'pointer',
              opacity: laden || !frage.trim() ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Send size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
