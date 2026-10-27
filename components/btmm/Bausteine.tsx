// Wiederverwendbare Bausteine für alle neuen BtMM-Seiten (Design wie BtMM-App).
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { SEITEN, href, type SeitenSchluessel } from '@/lib/seiten'
import { BRAND_FULL } from '@/lib/brand'

export function JsonLd({ daten }: { daten: object | object[] }) {
  const graph = Array.isArray(daten) ? daten : [daten]
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }}
    />
  )
}

/** Seitenkopf. Mit `bild` bleibt das farbige Foto der Webseite der Hintergrund (wie bisher),
 *  Logo mit lila Nebel und Titel liegen darüber; ohne `bild` creme Grund mit Glow wie in der App. */
export function SeitenKopf({ titel, unterzeile, bild, bildAlt = '' }: { titel: string; unterzeile?: string; bild?: string; bildAlt?: string }) {
  if (bild) {
    return (
      <section className="btmm-kopf btmm-kopf--bild">
        <Image src={bild} alt={bildAlt} fill style={{ objectFit: 'cover' }} priority />
        <div className="btmm-kopf-glas">
          <span className="btmm-logo-nebel">
            <Image src="/logo.png" alt={`${BRAND_FULL} Logo`} width={80} height={80} priority />
          </span>
          <h1>{titel}</h1>
          {unterzeile && <p className="btmm-unterzeile">{unterzeile}</p>}
        </div>
      </section>
    )
  }
  return (
    <section className="btmm-kopf">
      <span className="btmm-logo-nebel">
        <Image src="/logo.png" alt={`${BRAND_FULL} Logo`} width={88} height={88} priority />
      </span>
      <h1>{titel}</h1>
      {unterzeile && <p className="btmm-unterzeile">{unterzeile}</p>}
    </section>
  )
}

export function Abschnitt({ titel, children, id }: { titel?: string; children: ReactNode; id?: string }) {
  return (
    <section className="btmm-abschnitt" id={id}>
      {titel && <h2>{titel}</h2>}
      {children}
    </section>
  )
}

export function Karte({ titel, children, link }: { titel: string; children?: ReactNode; link?: string }) {
  const inhalt = (
    <>
      <h3>{titel}</h3>
      {children}
    </>
  )
  return link ? <Link href={link} className="btmm-karte">{inhalt}</Link> : <div className="btmm-karte">{inhalt}</div>
}

/** Markiert etwas ausdrücklich als offen / in Prüfung */
export function Offen({ children }: { children: ReactNode }) {
  return (
    <div className="btmm-hinweis btmm-hinweis--offen">
      <strong>Noch offen:</strong> {children}
    </div>
  )
}

/** Markiert Zahlen als Rechnung ohne Zusage */
export function Rechnung({ children }: { children?: ReactNode }) {
  return (
    <div className="btmm-hinweis btmm-hinweis--rechnung">
      <strong>Rechnung, keine Zusage:</strong>{' '}
      {children ?? 'Die Zahlen stammen aus dem BtMM-Rechner (v2.13.0, realistisches Szenario). Was du wirklich sparst, hängt von deinen Ausgaben ab.'}
    </div>
  )
}

export function Marke({ art }: { art: 'offen' | 'geplant' }) {
  return <span className={`btmm-marke btmm-marke--${art}`}>{art === 'offen' ? 'offen' : 'in Planung'}</span>
}

export function Knopf({ link, children }: { link: string; children: ReactNode }) {
  return link.startsWith('mailto:') ? (
    <a href={link} className="btmm-knopf">{children}</a>
  ) : (
    <Link href={link} className="btmm-knopf">{children}</Link>
  )
}

/** Interne Verlinkung: „Weiterlesen“-Karten aus dem Seiten-Register */
export function WeiterLinks({ locale, seiten, titel = 'Weiterlesen' }: { locale: string; seiten: SeitenSchluessel[]; titel?: string }) {
  return (
    <nav className="btmm-weiter" aria-label={titel}>
      <h2>{titel}</h2>
      <div className="btmm-raster">
        {seiten.map((s) => (
          <Karte key={s} titel={SEITEN[s].kurz} link={href(locale, s)}>
            <p style={{ fontSize: '1rem', opacity: 0.8 }}>{SEITEN[s].beschreibung}</p>
          </Karte>
        ))}
      </div>
    </nav>
  )
}

export function SeitenRahmen({ children }: { children: ReactNode }) {
  return <div className="btmm-seite">{children}</div>
}
