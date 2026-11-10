import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Users, ArrowRight } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { ContactForm } from '@/components/ContactForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gründung',
  description: 'Offener Brief zur geplanten Gründung der Back to Meaning Maximization eG: drei Menschen in Freiburg, erst leben, dann gründen.',
}

const schritte = [
  { schritt: '1', titel: 'Erst leben', text: 'Gemeinsamer Einkauf und Zeit-Tausch, noch ohne Genossenschaft. Jede und jeder kauft auf eigene Rechnung; es gibt keine gemeinsame Kasse (rechtlich offen, Fachleute fragen).' },
  { schritt: '2', titel: 'Drei Menschen am selben Ort', text: 'Die ersten drei leben in Freiburg oder in der Nähe. Zu fünft geht der Anfang schneller. Das Gesetz verlangt drei Mitglieder.' },
  { schritt: '3', titel: 'Gründung, wenn der erste Betrieb anstellt', text: 'Gegründet wird so früh wie möglich, sobald wir drei sind und der erste Betrieb Menschen anstellen will. Geschäftsanteil 100 €, auch in Raten ab 10 € im Monat. Ob die eG direkt zu dritt gegründet wird, klärt die Erstberatung beim Prüfungsverband.' },
  { schritt: '4', titel: 'Prüfungsverband und erster Betrieb', text: 'Prüfung der Satzung, dann der Jahreskreis des ersten Betriebs. Angestellt wird erst, wenn belegte Aufträge den Mindestlohn tragen.' },
  { schritt: '5', titel: 'Die Zelle wächst', text: 'Nutzen-Bilanz, gleiche Stunde, später weitere Mitglieder und — wenn es passt — neue Zellen. Kein fester Termin, keine zugesagte Wachstumsgeschwindigkeit.' },
]

export default async function GruendungPage() {
  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--btmm-text)',
        padding: '5rem 1.5rem 4rem',
      }}>
        <Image
          src="/images/stock/feld-morgen.webp"
          alt="Sonnenaufgang über Feld – ein neuer Anfang"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="/images/stock/feld-morgen.webp"
          alt="Sonnenaufgang über Feld – ein neuer Anfang"
        />
        <div className="hero-text" style={{ maxWidth: 760, position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            color: 'var(--btb-creme)',
            marginBottom: '1rem',
          }}>
            An die Gründungsmitglieder
          </h1>
          <p style={{
            color: 'var(--btb-oliv)',
            fontFamily: 'var(--font-garamond)',
            fontStyle: 'italic',
            fontSize: '1.15rem',
          }}>
            Ein offener Brief
          </p>
        </div>
      </section>

      {/* Der Brief */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 720 }}>
          <SectionReveal>
            <div className="prose-btb">
              <p>
                Wenn du diesen Brief liest, dann vielleicht weil du spürst, dass etwas anders sein könnte. Dass Wirtschaft nicht so sein muss, wie sie ist. Dass Zusammenarbeit auf Augenhöhe möglich ist. Dass Fürsorge und wirtschaftliche Stärke keine Gegensätze sind.
              </p>
              <p>
                Back to Meaning Maximization entsteht gerade. Nicht als fertiges System, das von oben eingeführt wird, sondern als lebendiger Prozess, der von den Menschen geprägt wird, die es aufbauen.
              </p>
              <p>
                Für die Gründung braucht es drei Menschen am selben Ort. Zu fünft geht der Anfang schneller. Die ehrliche Nachricht: <strong>Du musst nicht sofort Vollzeit einsteigen.</strong> Was wir brauchen, sind Menschen, die diese Idee mittragen. Die operative Arbeit übernehmen zunächst die, die Zeit haben.
              </p>
              <p>
                <strong>Wenn gegründet wird:</strong> deine Unterschrift unter die Satzung, 100 € Geschäftsanteil (auch in Raten ab 10 € im Monat). Gründungsmitglieder haben keine Sonderrechte: Wer später kommt, bekommt denselben Lohn und dieselbe Stimme. Der Vorteil der Ersten ist die Zeit, nicht ein Vorrecht.
              </p>
              <p>
                Was wir nicht suchen, sind Menschen, die ein fertiges Produkt kaufen wollen. Wir suchen Mitgründer — Menschen, die die Idee tragen und bereit sind, ihren Namen dafür zu geben. Manche werden von Tag eins operativ mitarbeiten. Andere tragen das System still mit — und das ist genauso wertvoll.
              </p>
              <p>
                Die Genossenschaft ist das rechtliche Gerüst. Aber das Eigentliche ist die Gemeinschaft, die sich darin aufbaut. Die gegenseitige Verlässlichkeit. Das gemeinsame Lernen. Die geteilte Vision.
              </p>
              <p>
                Wenn du glaubst, dass du diese Person sein könntest — melde dich. Wir werden sprechen, uns kennenlernen, und dann entscheiden wir gemeinsam, ob es passt.
              </p>
              <p style={{ fontFamily: 'var(--font-garamond)', fontStyle: 'italic', color: 'var(--btb-rot)' }}>
                – Samjo, Freiburg
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Zeitplan */}
      <section className="section" style={{ background: 'var(--btb-creme)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              color: 'var(--btb-oliv)',
              fontSize: '2rem',
              marginBottom: '0.75rem',
            }}>
              Der Weg
            </h2>
            <p style={{ opacity: 0.7, lineHeight: 1.7, marginBottom: '2.5rem' }}>
              Kein Gründungstermin. Erst leben, dann gründen. Die Reihenfolge folgt dem Konzept; die Dauer hängt davon ab, wann drei Menschen da sind und der erste Betrieb anstellen kann.
            </p>
          </SectionReveal>

          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 24, top: 0, bottom: 0, width: 2,
              background: 'rgba(158,87,164,0.35)',
            }} />

            {schritte.map((item, i) => (
              <SectionReveal key={i} delay={i * 0.15}>
                <div style={{
                  display: 'flex', gap: '2rem', marginBottom: '2rem',
                  position: 'relative',
                }}>
                  <div style={{
                    flexShrink: 0, width: 48, height: 48,
                    borderRadius: '50%',
                    background: 'var(--btb-weiss)',
                    border: '2px solid var(--btb-oliv)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', zIndex: 1,
                    fontFamily: 'var(--font-garamond)',
                    fontWeight: 700,
                    color: 'var(--btb-oliv)',
                    fontSize: '1.1rem',
                  }}>
                    {item.schritt}
                  </div>

                  <div className="card-btb" style={{ flex: 1, background: 'var(--btb-weiss)' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-garamond)',
                      color: 'var(--btb-dunkel)',
                      fontSize: '1.2rem',
                      marginBottom: '0.5rem',
                    }}>
                      {item.titel}
                    </h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7, lineHeight: 1.6 }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Was bringt ein Gründungsmitglied mit? */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 720 }}>
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              color: 'var(--btb-oliv)',
              fontSize: '2rem',
              marginBottom: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <Users size={28} /> Was wir suchen
            </h2>
            <div className="prose-btb" style={{ marginBottom: '2rem' }}>
              <p>Ein Gründungsmitglied bringt vor allem eins mit: die ehrliche Überzeugung, dass dieses System entstehen soll.</p>
              <ul>
                <li><strong>Einlage:</strong> 100 € — auch in Raten ab 10 € im Monat, voll eingezahlt spätestens zehn Monate nach der Zulassung</li>
                <li><strong>Zeitaufwand Gründung:</strong> Gründungsversammlung + Notartermin (wenige Stunden)</li>
                <li><strong>Danach:</strong> So viel oder wenig aktive Beteiligung, wie du geben kannst</li>
                <li><strong>Was zählt:</strong> Dein Name, dein Bekenntnis, deine Stimme bei Entscheidungen</li>
                <li><strong>Perspektive:</strong> Langfristig — kein kurzfristiges Investment</li>
              </ul>
              <p style={{ marginTop: '1rem', fontStyle: 'italic', opacity: 0.8 }}>
                Für den Aufbau gibt niemand mehr Zeit, als 48 Stunden Wochenarbeit zulassen. In Zeit gerechnet ist der Anfang zuerst ein Minus; die Modellrechnung sieht die Zeit später zurück. Das ist keine Zusage.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Kontaktformular */}
      <section id="kontakt" className="section" style={{ background: 'var(--btb-creme)' }}>
        <div className="container-btb" style={{ maxWidth: 680 }}>
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              color: 'var(--btb-oliv)',
              fontSize: '2rem',
              marginBottom: '0.5rem',
            }}>
              Melde dich
            </h2>
            <p style={{ opacity: 0.75, lineHeight: 1.7, marginBottom: '2rem' }}>
              Du interessierst dich dafür, Gründungsmitglied zu werden? Schreib uns – wir antworten persönlich.
            </p>
            <ContactForm
              typ="gruendung"
              betreff="Gründungsmitglied – Interesse"
              placeholder="Erzähl uns kurz von dir: wer du bist, was dich antreibt und warum du glaubst, dass BtMM dein Projekt sein könnte."
            />
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
