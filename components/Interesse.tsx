'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { AlertCircle, CheckCircle } from 'lucide-react'
import {
  EDGE_REGION,
  INTERESSEN,
  tokenAusHash,
  baueNutzlast,
  fehlerSchluessel,
} from '@/lib/interessenliste.mjs'

// Unverbindliche Interessenliste. Sendet direkt an die Supabase-Edge-Function (eu-central-1).
// Keine Vercel-Route, kein Tracking, nichts vorangekreuzt. Kein Zahlungsfeld.
export function InteresseForm({ edgeUrl }: { edgeUrl: string }) {
  const t = useTranslations('interesse')
  const locale = useLocale()
  const startedAt = useRef(0)
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [interessen, setInteressen] = useState<string[]>([])
  const [consentInfo, setConsentInfo] = useState(false)
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [fehler, setFehler] = useState<string | null>(null)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', border: '1.5px solid var(--btb-creme)', borderRadius: 8,
    fontFamily: 'var(--font-garamond)', fontSize: '1rem', color: 'var(--btb-dunkel)', background: 'var(--btb-weiss)',
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 500, marginBottom: '0.4rem', fontSize: '0.95rem' }
  const zeile: React.CSSProperties = { display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.6rem' }
  const klein: React.CSSProperties = { fontSize: '0.85rem', opacity: 0.8, margin: '0.15rem 0 0' }

  function toggle(wert: string) {
    setInteressen((alt) => alt.includes(wert) ? alt.filter((x) => x !== wert) : [...alt, wert])
  }

  async function absenden(e: React.FormEvent) {
    e.preventDefault()
    setFehler(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return fail('fehler_email')
    if (interessen.length < 1) return fail('fehler_interessen')
    if (!consentInfo) return fail('fehler_consent')
    setStatus('loading')
    try {
      const res = await fetch(edgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-region': EDGE_REGION },
        body: JSON.stringify(baueNutzlast({
          name, email, interessen, consentInfo, sprache: locale, website, startedAt: startedAt.current,
        })),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      })
      const antwort = await res.json().catch(() => null)
      if (res.ok && antwort?.ok === true) {
        setStatus('success')
        setName(''); setEmail(''); setInteressen([]); setConsentInfo(false)
      } else {
        fail(fehlerSchluessel(res.status, antwort?.fehler))
      }
    } catch {
      fail('fehler_allgemein')
    }
  }

  function fail(schluessel: string) {
    setFehler(schluessel)
    setStatus('error')
  }

  if (status === 'success') {
    return (
      <div role="status" style={{ padding: '1.5rem', background: 'rgba(143, 169, 66, 0.1)', borderRadius: 12, border: '1.5px solid var(--btb-oliv)', display: 'flex', gap: '1rem' }}>
        <CheckCircle style={{ color: 'var(--btb-oliv)', flexShrink: 0 }} size={24} />
        <div>
          <p style={{ fontWeight: 600, margin: '0 0 0.25rem' }}>{t('danke_titel')}</p>
          <p style={{ margin: 0 }}>{t('danke_text')}</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={absenden} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} data-interessenliste-form>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div>
          <label htmlFor="il-name" style={labelStyle}>{t('f_name')}</label>
          <input id="il-name" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="given-name" style={inputStyle} />
        </div>
        <div>
          <label htmlFor="il-email" style={labelStyle}>{t('f_email')} *</label>
          <input id="il-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} autoComplete="email" required style={inputStyle} />
        </div>
      </div>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={labelStyle}>{t('interessen_legende')} *</legend>
        {INTERESSEN.map((i) => (
          <div key={i} style={zeile}>
            <input id={`il-i-${i}`} type="checkbox" checked={interessen.includes(i)} onChange={() => toggle(i)} style={{ marginTop: '0.3rem' }} />
            <label htmlFor={`il-i-${i}`}>
              {t(`o_${i}`)}
              {i === 'gruendung' && <span style={{ display: 'block', ...klein }}>{t('o_gruendung_klein')}</span>}
            </label>
          </div>
        ))}
      </fieldset>

      {/* Honeypot: fuer Menschen unsichtbar */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="il-website">Website</label>
        <input id="il-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div>
        <div style={zeile}>
          <input id="il-consent-info" type="checkbox" checked={consentInfo} onChange={(e) => setConsentInfo(e.target.checked)} style={{ marginTop: '0.3rem' }} />
          <label htmlFor="il-consent-info" style={{ fontSize: '0.9rem' }}>{t('consent_info')} *</label>
        </div>
        <p style={klein}>
          <Link href={`/${locale}/impressum#interessenliste`} style={{ color: 'var(--btb-blau)' }}>{t('dse_link')}</Link>
        </p>
        <p style={klein}>{t('volljaehrig')}</p>
        {locale !== 'de' && <p style={klein}>{t('uebersetzung_hinweis')}</p>}
      </div>

      {status === 'error' && fehler && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--btb-rot)', fontSize: '0.95rem' }}>
          <AlertCircle size={18} />
          {t(fehler)}
        </div>
      )}

      <button type="submit" disabled={status === 'loading'} className="btn-primary" style={{ alignSelf: 'flex-start', opacity: status === 'loading' ? 0.7 : 1 }}>
        {status === 'loading' ? t('laden') : t('senden')}
      </button>
    </form>
  )
}

// Bestaetigen und Abmelden: Der Token steht im URL-Fragment (#t=...) und geht nie an einen Webserver.
// Erst ein Klick sendet ihn per POST an die Edge Function (Mail-Scanner, die Links nur aufrufen, loesen nichts aus).
export function InteresseToken({ aktion, edgeUrl }: { aktion: 'bestaetigen' | 'abmelden'; edgeUrl: string }) {
  const t = useTranslations('interesse')
  const locale = useLocale()
  // null auf dem Server, danach der Fragment-Wert (Fragment geht nie an einen Server)
  const hash = useSyncExternalStore(
    () => () => {},
    () => window.location.hash,
    () => null,
  )
  const token = hash === null ? undefined : tokenAusHash(hash)
  const [status, setStatus] = useState<'bereit' | 'laden' | 'ok' | 'abgelaufen' | 'ungueltig' | 'fehler'>('bereit')

  async function los() {
    if (!token) return
    setStatus('laden')
    try {
      const res = await fetch(edgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-region': EDGE_REGION },
        body: JSON.stringify({ action: aktion, token }),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
      })
      const antwort = await res.json().catch(() => null)
      if (res.ok && antwort?.ok === true) {
        setStatus('ok')
        // Token aus der Adressleiste entfernen
        window.history.replaceState(null, '', window.location.pathname)
      } else if (res.status === 410) setStatus('abgelaufen')
      else if (res.status === 404 || res.status === 400) setStatus('ungueltig')
      else setStatus('fehler')
    } catch {
      setStatus('fehler')
    }
  }

  const k = aktion === 'bestaetigen' ? 'bestaetigen' : 'abmelden'
  if (token === undefined) return null
  if (status === 'ok') {
    return (
      <div role="status">
        <p style={{ fontWeight: 600 }}>{aktion === 'bestaetigen' ? t('bestaetigen_ok_titel') : t('abmelden_ok')}</p>
        {aktion === 'bestaetigen' && <p>{t('bestaetigen_ok')}</p>}
        <p><Link href={`/${locale}/gruendung`}>{t('zurueck')}</Link></p>
      </div>
    )
  }
  if (!token || status === 'ungueltig') return <p role="alert">{t(`${k}_ungueltig`)}</p>
  if (status === 'abgelaufen') return <p role="alert">{t('bestaetigen_abgelaufen')}</p>
  return (
    <div>
      <p>{t(`${k}_text`)}</p>
      {status === 'fehler' && <p role="alert" style={{ color: 'var(--btb-rot)' }}>{t('fehler_allgemein')}</p>}
      <button type="button" className="btn-primary" onClick={los} disabled={status === 'laden'}>
        {status === 'laden' ? t('laden') : t(`${k}_knopf`)}
      </button>
    </div>
  )
}
