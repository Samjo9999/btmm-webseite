import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { SectionReveal } from '@/components/AnimatedCounter'
import { LogoLightbox } from '@/components/LogoLightbox'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { BRAND_FULL, BRAND_LONG } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: `${BRAND_LONG} – Wirtschaft, die trägt.` },
    description:
      'Back to Meaning Maximization ist eine Genossenschaft im Aufbau: teilen, was einzeln teuer ist, gleicher Lohn für jede Stunde, gemeinsames Eigentum, das nicht verkauft wird. Noch nicht gegründet. Sitz geplant in Freiburg.',
    openGraph: {
      title: `${BRAND_LONG} – Wirtschaft, die trägt.`,
      description:
        'Eine Genossenschaft im Aufbau. Erst leben, dann gründen. Alle Zahlen sind Modellrechnungen, keine Prognose.',
    },
  }
}

const SAULEN = [
  {
    grafik: '/graphics/drei-saeulen.svg',
    titel: 'Teilen',
    text: 'Ihr teilt Einkauf, Carsharing, Räume, Werkzeug und Buchhaltung. Jede und jeder behält das eigene Einkommen. Der Beitrag darf nie höher sein als das, was du sparst.',
  },
  {
    grafik: '/graphics/coin-stunde.svg',
    titel: 'Arbeiten',
    text: 'Wer in einem Betrieb der Gemeinschaft arbeitet, ist angestellt. Jede Stunde bekommt denselben Lohn, mindestens den Mindestlohn, als Ziel 20 Euro. Teams von höchstens zwölf Menschen, ohne Chefs.',
  },
  {
    grafik: '/graphics/waage.svg',
    titel: 'Besitzen',
    text: 'Häuser, Land und Werkstätten gehören allen. Sie werden nie verkauft. Die Miete deckt nur die Kosten.',
  },
]

const WEGE = [
  { titel: 'Unterstützerin oder Unterstützer', kopf: 'ab 50 € im Jahr', text: '10 % Rabatt auf externe Leistungen. Kein Einführungsprozess, kein Zeitaufwand. Dein Beitrag senkt die Kosten, die sonst auf die Mitglieder umgelegt werden.' },
  { titel: 'Förderkundin oder Förderkunde', kopf: 'ab 1.000 € im Jahr', text: 'Zugang zu den Selbstkostenpreisen des gemeinsamen Einkaufs. Ob sich der Betrag über die Preise lohnt, hängt von deinem Verbrauch ab — es ist Unterstützung, keine Geldanlage.' },
  { titel: 'Nutzungsmitglied', kopf: '100 € Geschäftsanteil', text: 'Du nutzt alles Gemeinsame zum Selbstkostenpreis, behältst dein Einkommen und hast Stimmrecht. Den Anteil kannst du in Raten ab 10 € im Monat zahlen. Mitglied bist du ab der ersten Rate — nach der Aufnahme.' },
  { titel: 'Betriebsmitglied', kopf: 'Arbeit in einem Gemeinschaftsbetrieb', text: 'Angestellt bei der Genossenschaft, gleicher Stundenlohn, Sozialversicherung, Bonus-Coins, Solidarfonds. Du gestaltest den Betrieb mit.' },
]

export default async function HomePage() {
  const tc = await getTranslations('common')

  return (
    <>
      <section style={{
        minHeight: '85vh',
        background: 'var(--btmm-text)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '3rem 1.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <Image
          src="/images/stock/wald-wurzeln.webp"
          alt="Waldweg zwischen Bäumen – ein vernetztes Ökosystem"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="/images/stock/wald-wurzeln.webp"
          alt="Waldweg zwischen Bäumen – ein vernetztes Ökosystem"
        />
        <div className="hero-text" style={{ position: 'relative', maxWidth: 740, zIndex: 2 }}>
          <div className="btmm-logo-nebel" style={{ marginBottom: '1.5rem', isolation: 'isolate' }}>
            <LogoLightbox
              src="/logo.png"
              alt={`${BRAND_FULL} Logo`}
              width={160}
              height={160}
              style={{ margin: '0 auto', filter: 'drop-shadow(0 0 30px rgba(var(--btmm-glow-rgb), 0.9)) drop-shadow(0 0 20px rgba(var(--btmm-akzent-rgb), 0.7)) drop-shadow(0 0 10px rgba(var(--btmm-glow-rgb), 0.6))' }}
              priority
            />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            fontWeight: 700,
            marginBottom: '0.75rem',
            lineHeight: 1.1,
          }}>
            {BRAND_LONG}
          </h1>

          <p style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
            fontWeight: 500,
            marginBottom: '1.5rem',
            lineHeight: 1.4,
          }}>
            Ein besseres Leben. Gemeinsam.
          </p>

          <p style={{
            fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto 2.5rem',
          }}>
            Wir wollen mehr freie Zeit, gutes Essen, Gesundheit, Bildung und Wohnen ohne Rendite. Dafür teilen wir, was einzeln teuer ist, arbeiten in eigenen Betrieben zum gleichen Lohn und besitzen gemeinsam, was nie verkauft wird.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/konzept" className="btn-primary">Das Konzept</Link>
            <Link href="/mitmachen" className="btn-secondary">Mitmachen</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btmm-hell)' }}>
        <div className="container-btb">
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              textAlign: 'center',
              marginBottom: '0.75rem',
            }}>
              Ein Haus mit drei Säulen
            </h2>
            <p style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: 580, marginInline: 'auto' }}>
              Nutzen, was es Gutes schon gibt. Bauen, wo etwas fehlt. Wachstum heißt hier Lebensstandard-Wachstum — nicht mehr Umsatz.
            </p>
          </SectionReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {SAULEN.map((item, i) => (
              <SectionReveal key={item.titel} delay={i * 0.12}>
                <div className="card-btb" style={{ height: '100%', textAlign: 'center' }}>
                  <Image src={item.grafik} alt="" width={200} height={130} style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.35rem', marginBottom: '0.75rem' }}>
                    {item.titel}
                  </h3>
                  <p style={{ lineHeight: 1.7 }}>{item.text}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btmm-weiss)' }}>
        <div className="container-btb">
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              textAlign: 'center',
              marginBottom: '0.75rem',
            }}>
              So kannst du dabei sein
            </h2>
            <p style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: 580, marginInline: 'auto' }}>
              Verschiedene Wege, kein Zwang zu einer höheren Stufe. Die Genossenschaft gibt es noch nicht — gegründet wird, sobald der erste Betrieb Menschen anstellen will und drei Menschen da sind.
            </p>
          </SectionReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}>
            {WEGE.map((w, i) => (
              <SectionReveal key={w.titel} delay={i * 0.1}>
                <div className="card-btb" style={{ height: '100%' }}>
                  <h3 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.2rem', marginBottom: '0.35rem' }}>{w.titel}</h3>
                  <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--btmm-dunkel)' }}>{w.kopf}</p>
                  <p style={{ lineHeight: 1.65, fontSize: '0.95rem' }}>{w.text}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', maxWidth: 640, marginInline: 'auto', lineHeight: 1.7 }}>
            Weitere Wege: Gemeinschaftsdienst, Ideen-Weg, von weitem dabei und Partner. Die ersten drei müssen in oder bei Freiburg leben — alle anderen nicht.
          </p>
          <div style={{ textAlign: 'center' }}>
            <Link href="/mitmachen" className="btn-primary">{tc('actions.mehr_erfahren')} →</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btmm-hell)' }}>
        <div className="container-btb">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}>
            <SectionReveal>
              <div className="card-btb">
                <Image src="/graphics/brunnen.svg" alt="Brunnen mit Schalen: erst Rücklage und Hilfe, dann gleicher Lohn, dann drei Schalen" width={320} height={200} style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.7rem', marginBottom: '0.75rem' }}>
                  Der Brunnen mit den Schalen
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  Die Betriebe verdienen Geld. Zuerst füllt sich eine Schale für schlechte Zeiten und für Menschen, die Hilfe brauchen. Dann bekommt jede Stunde denselben Lohn. Was überläuft, verteilt sich auf drei Schalen: Bonus, gemeinsame Häuser und Werkstätten, Hilfe und Natur. Im Aufbau liegen die Anteile in Korridoren, im reifen System etwa je ein Drittel. Wenn ein Monat schlecht läuft, sinkt zuerst der Bonus. Der Lohn fällt nie unter den Mindestlohn.
                </p>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.12}>
              <div className="card-btb">
                <Image src="/graphics/coin-stunde.svg" alt="Ein BtMM-Coin entspricht einer Stunde" width={240} height={160} style={{ margin: '0 auto 1rem' }} />
                <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.7rem', marginBottom: '0.75rem' }}>
                  Der BtMM-Coin
                </h2>
                <p style={{ lineHeight: 1.7 }}>
                  Ein Coin entspricht immer einer Stunde Arbeit. Er zählt bezahlte Stunden, trägt den Bonus und ermöglicht den Tausch Stunde gegen Stunde, ohne Euro. Willkommens- und Bonus-Coins werden nur innerhalb von BtMM eingesetzt und nie ausgezahlt. Die genaue rechtliche Ausgestaltung prüft der Prüfungsverband vor der Gründung.
                </p>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      <section style={{
        background: 'linear-gradient(135deg, var(--btmm-dunkel) 0%, var(--btmm-primary) 50%, var(--btmm-dunkel) 100%)',
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}>
        <div className="container-btb" style={{ maxWidth: 680 }}>
          <SectionReveal>
            <Image
              src="/infinity-gold.png"
              alt="Unendlichkeitsschleife – Sinnmaximierung statt Kreislauf um des Wachstums willen"
              width={200}
              height={200}
              style={{ margin: '0 auto 1rem', objectFit: 'contain' }}
            />
          </SectionReveal>
          <SectionReveal delay={0.15}>
            <div className="hero-text" style={{ maxWidth: 640 }}>
              <h2 style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                marginBottom: '0.75rem',
                fontStyle: 'italic',
              }}>
                Lebensstandard-Wachstum statt Wirtschaftswachstum
              </h2>
              <p style={{ lineHeight: 1.75, fontSize: '1.05rem' }}>
                Die übliche Wirtschaft will mehr Umsatz. Wir wollen, dass das Leben besser wird: mehr Zeit, Gesundheit, Bildung und Natur. Das kann sogar wachsen, wenn weniger gekauft wird.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btmm-weiss)' }}>
        <div className="container-btb">
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              textAlign: 'center',
              marginBottom: '0.5rem',
            }}>
              Die BtMM-App
            </h2>
            <p style={{ textAlign: 'center', marginBottom: '2rem', maxWidth: 560, marginInline: 'auto', lineHeight: 1.7 }}>
              Geplant als Werkzeug für Nutzen-Bilanz, Stunden, Coins und Abstimmung in den Zellen. Zugang für Mitglieder unter app.b-t-m-m.com.
            </p>
          </SectionReveal>
          <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/app" className="btn-secondary">Zur App-Seite</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btmm-hell)' }}>
        <div className="container-btb" style={{ maxWidth: 720 }}>
          <div className="hinweis-kasten" style={{ marginBottom: '2rem' }}>
            <p>
              <strong>Ehrlich gesagt:</strong> Die Genossenschaft besteht noch nicht. Es gibt noch keine Mitglieder und keine laufenden Gemeinschaftsbetriebe. Alle Zahlen auf dieser Seite sind Modellrechnungen auf offen benannten Annahmen, keine Prognose und kein Versprechen. Rechtliche Fragen prüft der Prüfungsverband und eine Rechtsberatung vor der Gründung.
            </p>
          </div>
          <div className="card-btb">
            <SectionReveal>
              <h2 style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                marginBottom: '0.75rem',
              }}>
                Wenn dich das anspricht
              </h2>
              <p style={{ lineHeight: 1.75, marginBottom: '1.75rem' }}>
                Schreib uns. Ob als Unterstützerin oder Unterstützer, als eine der ersten drei in Freiburg oder von weitem: Die Tür ist offen. Das Konzept, die Satzung (Entwurf) und der Rechner liegen unter Dokumente.
              </p>
              <Link href="/mitmachen" className="btn-primary">Mitmachen</Link>
            </SectionReveal>
          </div>
        </div>
      </section>
    </>
  )
}
