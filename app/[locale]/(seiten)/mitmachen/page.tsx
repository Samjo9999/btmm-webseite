import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { ContactForm } from '@/components/ContactForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mitmachen',
  description: 'So kannst du bei Back to Meaning Maximization dabei sein: Unterstützen, Förderkundin oder Förderkunde, Nutzungs- oder Betriebsmitglied, von weitem oder als eine der ersten drei in Freiburg.',
}

const WEGE = [
  { titel: 'Unterstützerin oder Unterstützer', kopf: 'ab 50 € im Jahr', punkte: ['10 % Rabatt auf externe Leistungen', 'Kein Einführungsprozess', 'Dein Beitrag senkt die umgelegten Kosten'] },
  { titel: 'Förderkundin oder Förderkunde', kopf: 'ab 1.000 € im Jahr', punkte: ['Selbstkostenpreise des gemeinsamen Einkaufs', 'Frühes Commitment, bevor das System stabil ist', 'Unterstützung, keine Geldanlage'] },
  { titel: 'Nutzungsmitglied', kopf: '100 € Geschäftsanteil, auch in Raten ab 10 €', punkte: ['Alles Gemeinsame zum Selbstkostenpreis', 'Eigenes Einkommen bleibt', 'Stimmrecht', 'Aufnahmeweg der Zelle, dann Beitritt'] },
  { titel: 'Betriebsmitglied', kopf: 'zusätzlich Arbeit in einem Gemeinschaftsbetrieb', punkte: ['Angestellt, gleicher Stundenlohn', 'Sozialversicherung, Bonus-Coins', 'Solidarfonds, sobald er leistet', 'Team von höchstens zwölf Menschen'] },
]

const SCHRITTE = [
  { n: '1', titel: 'Ankommen', text: 'Du wirst Unterstützerin oder Unterstützer, mit Zeit oder ab 50 € im Jahr, und trägst dich in die geplante Keim-Karte ein.' },
  { n: '2', titel: 'Kennenlernen', text: 'Ein Arbeitstag, eine gemeinsame Mahlzeit, ein Gespräch. Ihr rechnet durch, was du sparst, was du gibst und was du brauchst. Geplant: 4 bis 8 Wochen.' },
  { n: '3', titel: 'Anwärterzeit', text: 'Du sagst, dass du Mitglied werden willst, und arbeitest in einem Vorhaben mit. Aufbaustunden zählen als Ehrenamt, ohne Anspruch. Geplant: 3 bis 6 Monate, höchstens 12.' },
  { n: '4', titel: 'Entscheidung und Beitritt', text: 'Die Zelle entscheidet. Danach unterschreibst du die Beitrittserklärung und übernimmst einen Geschäftsanteil von 100 €, auch in Raten ab 10 € im Monat.' },
  { n: '5', titel: 'Nachgespräch', text: 'Nach sechs Monaten sprecht ihr offen darüber, was trägt und was nicht. Ein Wechsel der Stufe ist jederzeit möglich, auch zurück, ohne Begründung.' },
]

export default async function MitmachenPage() {
  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--btmm-text)',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
      }}>
        <Image
          src="/images/stock/setzling.webp"
          alt="Hände halten einen jungen Setzling – gemeinsam wachsen"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="/images/stock/setzling.webp"
          alt="Hände halten einen jungen Setzling – gemeinsam wachsen"
        />
        <div className="hero-text" style={{ maxWidth: 680, position: 'relative', zIndex: 2 }}>
          <SectionReveal>
            <h1 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
              marginBottom: '1rem',
            }}>
              Mitmachen
            </h1>
            <p style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
              Die Tür ist offen, der Weg zeigt, ob es passt. Niemand wird zu einer höheren Stufe gedrängt. Die Genossenschaft gibt es noch nicht — du kannst dich trotzdem schon melden.
            </p>
          </SectionReveal>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btmm-hell)' }}>
        <div className="container-btb">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.25rem',
            marginBottom: '3rem',
          }}>
            {WEGE.map((w, i) => (
              <SectionReveal key={w.titel} delay={i * 0.08}>
                <div className="card-btb" style={{ height: '100%' }}>
                  <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.35rem', marginBottom: '0.35rem' }}>{w.titel}</h2>
                  <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{w.kopf}</p>
                  <ul style={{ paddingLeft: '1.1rem', lineHeight: 1.7 }}>
                    {w.punkte.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal>
            <div className="card-btb" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
                Von weitem und als Partner
              </h2>
              <p style={{ lineHeight: 1.75, marginBottom: '0.75rem' }}>
                Die ersten drei müssen in oder bei Freiburg leben, alle anderen nicht. Von weitem kannst du lernen, wie man Einkauf, Auto und Werkzeug teilt, dich für einen späteren Keim am eigenen Ort vormerken lassen, Unterstützerin oder Unterstützer werden oder — sobald es die Genossenschaft gibt — Mitglied mit Stimme ohne Beitrag werden.
              </p>
              <p style={{ lineHeight: 1.75 }}>
                Höfe, Läden, Werkstätten, Vereine und andere Genossenschaften können Partner werden, ohne sich aufzulösen. Das geplante Zeichen „Partner der Back to Meaning Maximization eG“ gibt es erst nach der Gründung.
              </p>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
            }} className="card-btb">
              <div style={{ flex: 1, minWidth: 200 }}>
                <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.4rem', marginBottom: '0.4rem' }}>
                  Du möchtest zu den ersten drei gehören?
                </h2>
                <p style={{ lineHeight: 1.65 }}>
                  Das Gesetz verlangt drei Menschen. Wir gründen so früh wie möglich, sobald wir drei sind und der erste Betrieb anstellen will. Geschäftsanteil 100 €, auch in Raten ab 10 € im Monat. Gründungsmitglieder haben keine Sonderrechte.
                </p>
              </div>
              <Link href="/gruendung" className="btn-primary" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Zur Gründung <ArrowRight size={16} />
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btmm-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '2rem', marginBottom: '0.75rem', textAlign: 'center' }}>
            Der Weg in fünf Schritten
          </h2>
          <p className="hinweis-kasten" style={{ marginBottom: '2rem' }}>
            So beschreibt es der Entwurf „So wirst du Mitglied“. Ob die Aufnahme so allein bei der Zelle liegen darf, prüfen Prüfungsverband und Rechtsberatung vor der Einreichung. Bis die eG besteht, nimmst du am ehesten als Unterstützerin oder Unterstützer teil.
          </p>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0 }}>
            {SCHRITTE.map((s, i) => (
              <SectionReveal key={s.n} delay={i * 0.06}>
                <li className="card-btb" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <span style={{
                    flexShrink: 0, width: 40, height: 40, borderRadius: 20,
                    background: 'var(--btmm-dunkel)', color: 'var(--btmm-weiss)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                  }}>{s.n}</span>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.2rem', marginBottom: '0.35rem' }}>{s.titel}</h3>
                    <p style={{ lineHeight: 1.65 }}>{s.text}</p>
                  </div>
                </li>
              </SectionReveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="kontakt-form" className="section" style={{ background: 'var(--btmm-hell)' }}>
        <div className="container-btb" style={{ maxWidth: 680 }}>
          <SectionReveal>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '2rem', marginBottom: '0.5rem' }}>
              Kontakt aufnehmen
            </h2>
            <p style={{ lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Schreib uns, welcher Weg dich interessiert. Wir antworten an office@b-t-m-m.com.
            </p>
            <div className="hinweis-kasten" style={{ marginBottom: '1.5rem' }}>
              Was wir dir nicht versprechen: keine Genossenschaft heute, keine feste Ersparnis, keinen Gründungstermin. Alle Zahlen sind Modellrechnungen. Ob und wie der Geschäftsanteil bei einem Austritt zurückfließt, wird vor der Gründung geprüft.
            </div>
            <ContactForm
              typ="mitmachen"
              betreff="Mitgliedschaft – Anfrage"
              placeholder="Ich interessiere mich für… / Meine Frage ist…"
            />
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
