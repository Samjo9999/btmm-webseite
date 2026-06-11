// import Image (use <img>) 
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'


export default function NachhaltigkeitPage() {
  const { t } = useTranslation('konzept')

  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#051010',
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
      }}>
        <img 
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80"
          alt="Waldweg – Nachhaltigkeit durch Struktur"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80"
          alt="Waldweg – Nachhaltigkeit durch Struktur"
        />
        <div className="hero-text" style={{ maxWidth: 640, position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--btb-creme)',
            marginBottom: '1rem',
          }}>
            Nachhaltigkeit bei BtMM
          </h1>
          <p style={{
            color: 'var(--btb-oliv)',
            fontSize: '1.1rem',
            fontFamily: 'var(--font-garamond)',
            fontStyle: 'italic',
            marginBottom: '1.5rem',
          }}>
            Kein Greenwashing. Struktur, die trägt — nicht nur redet.
          </p>
        </div>
      </section>

      {/* Einführung */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '2rem',
              color: 'var(--btb-oliv)',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}>
              Echte Nachhaltigkeit ist nicht optional — sie ist das Geschäftsmodell
            </h2>
            <p style={{ lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1rem' }}>
              Nachhaltigkeit wird oft als Dekoration verstanden: Plastikfreie Verpackung, Bio-Zertifikat, CSR-Bericht. Das ist Greenwashing. Echte Nachhaltigkeit sitzt im Kern des Geschäftsmodells. Im Back to Meaning Maximization System ist sie nicht eine Abteilung — sie ist der gesamte Betriebsmodus.
            </p>
            <p style={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
              Drei Wege, wie BtMM Nachhaltigkeit strukturell verankert:
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Säule 1: Rechtsform */}
      <section className="section" style={{ background: 'transparent' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <h3 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '1.6rem',
              color: 'var(--btb-rot)',
              marginBottom: '1rem',
            }}>
              1. Rechtsform: Genossenschaft + Förderverein
            </h3>
            <p style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1rem' }}>
              <strong>Die eingetragene Genossenschaft (eG)</strong> hat eine einzige Prämisse: Sie kann niemals an Externe verkauft werden. Wer raus geht, geht raus. Die Anteile folgen nicht. Das ist nicht ein Risikoschutz — das ist ein struktureller Schutz vor Übernahme, Privatisierung, Börsengang.
            </p>
            <p style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1rem' }}>
              <strong>Der Förderverein (e.V.)</strong> ist die transparente Schicht nach außen: Spendensammlung, öffentlichkeitsarbeit, Netzwerkaufbau. Seine Organe sind Teil der BtMM-Governance — nicht separat, sondern integriert.
            </p>
            <p style={{ lineHeight: 1.8, fontSize: '1rem' }}>
              Ergebnis: Ein System, das langfristig stabilität garantiert — nicht durch Verträge, sondern durch Rechtsform.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Säule 2: Geschäftslogik */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <h3 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '1.6rem',
              color: 'var(--btb-rot)',
              marginBottom: '1rem',
            }}>
              2. Geschäftslogik: Der Sozial- und Öko-Anteil
            </h3>
            <p style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1rem' }}>
              Im konventionellen System ist Nachhaltigkeit immer ein Zusatzkost — etwas, das die Profitabilität reduziert. Im BtMM-System ist es Standard:
            </p>
            <p style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1rem' }}>
              Der erwirtschaftete Pool wird in <strong>drei gleiche Teile</strong> geteilt:
            </p>
            <ul style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1rem', paddingLeft: '2rem' }}>
              <li><strong>Vergütung:</strong> An die Mitglieder (als Coins)</li>
              <li><strong>Reinvestition:</strong> Fixkosten, Infrastruktur, Wachstum</li>
              <li><strong>Sozial- und Öko-Anteil:</strong> Gemeinschaftsprojekte, ökologische Initiativen, Solidarfonds</li>
            </ul>
            <p style={{ lineHeight: 1.8, fontSize: '1rem' }}>
              Diese Quote ist nicht verhandelbar. Sie sitzt in der Satzung. Ein System, das nur sich nährt, hat keine Zukunft — das ist nicht eine Idee, das ist eine mathematische Regel.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Säule 3: Tägliche Praxis */}
      <section className="section">
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <h3 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '1.6rem',
              color: 'var(--btb-rot)',
              marginBottom: '1rem',
            }}>
              3. Tägliche Praxis: Kein Amazon, kein Nestlé, kein Apple
            </h3>
            <p style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1rem' }}>
              Kein Greenwashing heißt: Kategorische Grenzen.
            </p>
            <p style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1rem' }}>
              BtMM handelt nicht mit Konzernen, deren Geschäftsmodell auf Ausbeutung beruht — weder von Menschen noch von Natur. Das ist nicht moralisch — das ist logisch. Wer ein System baut, das auf gegenseitiger Unterstützung beruht, kann nicht gleichzeitig Geld in Systeme fließen lassen, die auf Ausbeutung gebaut sind.
            </p>
            <p style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1rem' }}>
              Praktisch bedeutet das:
            </p>
            <ul style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1rem', paddingLeft: '2rem' }}>
              <li>Lieferketten, die transparent sind — oder nicht vorhanden</li>
              <li>Produkte, die reparierbar sind — oder nicht gekauft</li>
              <li>Lebensmittel regional und saisonal — nicht global und genmanipuliert</li>
              <li>Energie erneuerbar — oder rational reduziert</li>
            </ul>
            <p style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--btb-creme)' }}>
              <strong>Unsere Anforderung an Partner und Anbieter:</strong> Wir wählen nur Lieferanten und Partner, die echte Nachhaltigkeits- und Fairness-Standards erfüllen. Das bedeutet: Transparente Arbeitsbedingungen, faire Löhne, ökologische Verantwortung und Verzicht auf Ausbeutungspraktiken. Partner, die reine Profitmaximierung verfolgen und Mensch oder Natur ausbeuten, passen nicht in unser System. Das ist kein Marketing-Statement — es ist eine Geschäftsbedingung.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Visionen */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <h3 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '1.6rem',
              color: 'var(--btb-rot)',
              marginBottom: '1rem',
            }}>
              Langfristige Visionen
            </h3>
            <p style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1.5rem' }}>
              <strong>Immobilienstrategie:</strong> Sobald die Genossenschaft wirtschaftlich tragfähig ist, werden Immobilien gekauft — nicht als Investment, sondern als Stabilität. Mitglieder wohnen in Häusern, deren Miete nur Betriebskosten deckt. Keine Gewinnmarge für externe Eigentümer.
            </p>
            <p style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1.5rem' }}>
              <strong>Energiewende:</strong> Eigene Solaranlagen, Wasserkraft, Biomasse — wo möglich. Jede Kilowattstunde, die intern erzeugt wird, erhöht die Unabhängigkeit vom zentralisierten Energiemarkt und senkt die externe Verschuldung.
            </p>
            <p style={{ lineHeight: 1.8, fontSize: '1rem', marginBottom: '1.5rem' }}>
              <strong>Lebensmittelproduktion:</strong> Der Transition Fund finanziert auf lange Sicht Gärtnereien, Imkereien, handwerkliche Bäckereien und Käsereien — Lebensmittelproduktion, die am selben Ort stattfindet wie Konsum. 90 % der Lebensmittel intern verfügbar macht den externen Markt optionaler, nicht existenzieller.
            </p>
            <p style={{ lineHeight: 1.8, fontSize: '1rem' }}>
              Das ist nicht eine Utopie. Das sind die logischen Schritte eines Systems, das strukturell auf Langfristigkeit und gegenseitiger Hilfe gebaut ist.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Back Link */}
      <section className="section" style={{ background: 'transparent', paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="container-btb" style={{ maxWidth: 800, textAlign: 'center' }}>
          <RouterLink  to="/" style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            border: '1px solid var(--btb-rot)',
            color: 'var(--btb-rot)',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--btb-rot)'
              e.currentTarget.style.color = 'var(--btb-creme)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--btb-rot)'
            }}
          >
            ← Zurück zur Startseite
          </RouterLink>
        </div>
      </section>
    </>
  )
}
