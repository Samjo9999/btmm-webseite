// import Image (use <img>) 
import { Link as RouterLink } from 'react-router-dom'
import { Users, ArrowRight } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { ContactForm } from '@/components/ContactForm'


const schritte = [
  { schritt: '1', titel: 'Gründungsmitglieder finden', text: '7 Menschen, die diese Idee mittragen. Kein Zeitdruck — wir wachsen in dem Tempo, das zu uns passt.' },
  { schritt: '2', titel: 'Gründungsversammlung & Notar', text: 'Ein Termin, eine Unterschrift, 100 € Einlage. Die Back to Meaning Maximization eG wird beim Genossenschaftsregister Freiburg eingetragen.' },
  { schritt: '3', titel: 'Prüfverband & Aufbau', text: 'Mitgliedschaft im BWGV, Gewerbeanmeldung, erste Großhandelseinkäufe. Die operative Arbeit übernehmen die, die Zeit haben.' },
  { schritt: '4', titel: 'Die erste Zelle lebt', text: 'Gemeinsamer Einkauf, erste interne Leistungen, Stundenbuch. BtMM im Rohformat — noch ohne App, aber real.' },
  { schritt: '5', titel: 'Wachstum', text: 'App geht live, Pool füllt sich, Stundensatz steigt. Weitere Mitglieder und Zellen kommen dazu.' },
]

export default function GruendungPage() {
  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1505',
        padding: '5rem 1.5rem 4rem',
      }}>
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
          alt="Sonnenaufgang über Feld – ein neuer Anfang"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
          alt="Sonnenaufgang über Feld – ein neuer Anfang"
        />
        <div className="hero-text" style={{ maxWidth: 760, position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            color: 'var(--btb-creme)',
            marginBottom: '1rem',
          }}>
            An die 7 Gründungsmitglieder
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
                Wir suchen 7 Gründungsmitglieder für die Genossenschaft. Und hier ist die ehrliche Nachricht: <strong>Du musst nicht sofort Vollzeit einsteigen.</strong> Was wir brauchen, sind 7 Menschen, die diese Idee mittragen — auch wenn du anfangs nur bei der Gründungsversammlung dabei bist und das System im Hintergrund wachsen lässt.
              </p>
              <p>
                <strong>Der formale Aufwand ist überschaubar:</strong> ein Termin beim Notar, deine Unterschrift, 100 € Einlage (oder in Arbeitsstunden). Die operative Arbeit — Einkauf organisieren, erste Strukturen aufbauen, App einrichten — übernehmen zunächst die, die Zeit und Energie dafür haben. Nicht jeder muss alles machen. Aber jeder muss wirklich dahinterstehen.
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
                – Samjo, Freiburg 2026
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
              Kein fester Zeitplan — das System wächst in dem Tempo, das zu den Menschen passt, die es aufbauen. Was feststeht, ist die Reihenfolge.
            </p>
          </SectionReveal>

          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 24, top: 0, bottom: 0, width: 2,
              background: 'rgba(143,169,66,0.3)',
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
                <li><strong>Einlage:</strong> 100 € — oder gleichwertig in Arbeitsstunden</li>
                <li><strong>Zeitaufwand Gründung:</strong> Gründungsversammlung + Notartermin (wenige Stunden)</li>
                <li><strong>Danach:</strong> So viel oder wenig aktive Beteiligung, wie du geben kannst</li>
                <li><strong>Was zählt:</strong> Dein Name, dein Bekenntnis, deine Stimme bei Entscheidungen</li>
                <li><strong>Perspektive:</strong> Langfristig — kein kurzfristiges Investment</li>
              </ul>
              <p style={{ marginTop: '1rem', fontStyle: 'italic', opacity: 0.8 }}>
                Die operative Aufbauarbeit liegt anfangs bei 1–2 Personen. Die anderen Gründungsmitglieder tragen das System mit — durch ihr Commitment und ihre Stimme. Beides ist unverzichtbar.
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
