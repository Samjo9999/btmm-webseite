
import { useState } from 'react'
import { Heart } from 'lucide-react'

const VORSCHLAEGE = [10, 25, 50, 100, 250]

export function SpendenCheckout() {
  const [betrag, setBetrag] = useState(25)
  const [custom, setCustom] = useState('')
  const [laden, setLaden] = useState(false)

  const aktuellerBetrag = custom ? Number(custom) : betrag

  const spenden = async () => {
    if (!aktuellerBetrag || aktuellerBetrag < 1) return
    setLaden(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spende_betrag: aktuellerBetrag }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Checkout konnte nicht gestartet werden.')
    } finally {
      setLaden(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {VORSCHLAEGE.map(v => (
          <button
            key={v}
            onClick={() => { setBetrag(v); setCustom('') }}
            style={{
              padding: '0.6rem 1.2rem', borderRadius: 8,
              border: `2px solid ${betrag === v && !custom ? 'var(--btb-oliv)' : 'var(--btb-creme)'}`,
              background: betrag === v && !custom ? 'var(--btb-oliv)' : 'var(--btb-weiss)',
              color: betrag === v && !custom ? '#fff' : 'var(--btb-dunkel)',
              fontFamily: 'var(--font-garamond)', fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
            }}
          >
            {v} €
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Anderer Betrag:</span>
        <input
          type="number" min="1" max="10000" value={custom}
          onChange={e => { setCustom(e.target.value); setBetrag(0) }}
          placeholder="€"
          style={{ width: 100, padding: '0.5rem 0.75rem', borderRadius: 8, border: '1.5px solid var(--btb-creme)', fontFamily: 'inherit', fontSize: '1rem', textAlign: 'center' }}
        />
        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>€</span>
      </div>
      <button onClick={spenden} disabled={laden || !aktuellerBetrag || aktuellerBetrag < 1} className="btn-oliv"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: laden ? 0.7 : 1, fontSize: '1.05rem' }}>
        <Heart size={18} />
        {laden ? 'Wird vorbereitet …' : `${aktuellerBetrag} € online mit Karte zahlen`}
      </button>
    </div>
  )
}
