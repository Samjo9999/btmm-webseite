import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
// import Image (use <img>) 
import { TrendingUp, Users, Leaf, CreditCard, Layout, ExternalLink } from 'lucide-react'
import { SectionReveal } from '@/components/AnimatedCounter'
import { LogoLightbox } from '@/components/LogoLightbox'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { AngeboteAccordion } from '@/components/AngeboteAccordion'

export default function HomePage() {
  const { t } = useTranslation('home')
  const { t: tc } = useTranslation('common')

  return (
    <>
      {/* ── 1. HERO ── */}
      <section style={{
        minHeight: '85vh',
        background: 'var(--btb-creme)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '3rem 1.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Forest background image */}
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80"
          alt="Wald – ein hoch vernetztes Ökosystem"
          style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80"
          alt="Wald – ein hoch vernetztes Ökosystem"
        />
        <div className="hero-text" style={{ position: 'relative', maxWidth: 740, zIndex: 2 }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <LogoLightbox
              src="/logo.png"
              alt="Back to Meaning Maximization Logo"
              width={160}
              height={160}
              style={{ margin: '0 auto', filter: 'drop-shadow(0 0 30px rgba(157, 78, 221, 0.9)) drop-shadow(0 0 20px rgba(157, 78, 221, 0.7)) drop-shadow(0 0 10px rgba(157, 78, 221, 0.6))' }}
            />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            fontWeight: 700,
            color: 'var(--btb-rot)',
            marginBottom: '0.75rem',
            lineHeight: 1.1,
            textShadow: '0 2px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)',
          }}>
            Back to Meaning Maximization
          </h1>

          <p style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
            fontWeight: 500,
            color: '#ffffff',
            marginBottom: '1.5rem',
            lineHeight: 1.4,
            textShadow: '0 2px 12px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)',
          }}>
            Ein anderes Wirtschaftssystem
          </p>

          <p style={{
            fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
            color: '#ffffff',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto 2.5rem',
            textShadow: '0 1px 6px rgba(0,0,0,0.6)',
          }}>
            Back to Meaning Maximization verbindet wirtschaftliche Stärke mit menschlicher Würde — ein System, in dem Bedeutung über Gewinn geht.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <RouterLink  to="/konzept" className="btn-primary">
              Das Konzept
            </RouterLink>
            <RouterLink  to="/mitmachen" className="btn-secondary">
              Mitmachen
            </RouterLink>
          </div>

        </div>
      </section>

      {/* ── 2. WAS IST BTMM ── */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb">
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              textAlign: 'center',
              marginBottom: '0.75rem',
              color: 'var(--btb-oliv)',
            }}>
              Wirtschaft, die trägt
            </h2>
            <p style={{ textAlign: 'center', opacity: 0.6, marginBottom: '3rem', maxWidth: 540, margin: '0 auto 3rem' }}>
              Back to Meaning Maximization ist eine Vision von Wirtschaft, die Menschen und Gemeinschaft ins Zentrum stellt.
            </p>
          </SectionReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              {
                icon: <TrendingUp size={32} style={{ color: 'var(--btb-rot)' }} />,
                titel: 'Wirtschaft mit Sinn',
                text: 'Profitabilität, die einem höheren Zweck dient — nicht Selbstzweck, sondern Mittel zum Zweck.',
                href: '/konzept/wirtschaft',
              },
              {
                icon: <Users size={32} style={{ color: 'var(--btb-blau)' }} />,
                titel: 'Gemeinschaft',
                text: 'Ein Netzwerk von Menschen und Betrieben, die zusammen wirtschaften und voneinander lernen.',
                href: '/konzept/gemeinschaft',
              },
              {
                icon: <Leaf size={32} style={{ color: 'var(--btb-oliv)' }} />,
                titel: 'Nachhaltigkeit',
                text: 'Wirtschaft, die Ressourcen respektiert und für zukünftige Generationen bewahrt.',
                href: '/nachhaltigkeit',
              },
            ].map((item, i) => (
              <SectionReveal key={i} delay={i * 0.15}>
                <div className="card-btb" style={{ height: '100%' }}>
                  <div style={{ marginBottom: '1rem' }}>{item.icon}</div>
                  <h3 style={{
                    fontFamily: 'var(--font-garamond)',
                    fontSize: '1.3rem',
                    color: 'var(--btb-dunkel)',
                    marginBottom: '0.75rem',
                  }}>
                    {item.titel}
                  </h3>
                  <p style={{ color: 'var(--btb-dunkel)', opacity: 0.75, lineHeight: 1.7, marginBottom: '1.25rem' }}>
                    {item.text}
                  </p>
                  <RouterLink  to={item.href} style={{ color: 'var(--btb-blau)', fontWeight: 600, fontSize: '0.9rem' }}>
                    {tc('actions.mehr_erfahren')} →
                  </RouterLink>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2b. ANGEBOTE ── */}
      <section className="section" style={{ background: 'var(--btb-creme)' }}>
        <div className="container-btb">
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              textAlign: 'center',
              marginBottom: '0.75rem',
              color: 'var(--btb-oliv)',
            }}>
              Unser Angebot
            </h2>
            <p style={{ textAlign: 'center', opacity: 0.65, marginBottom: '2.5rem', maxWidth: 560, margin: '0 auto 2.5rem' }}>
              Dienstleistungen und Expertise von erfahrenen Praktizierenden aus unserem Netzwerk.
            </p>
          </SectionReveal>
          <AngeboteAccordion domain="b-t-m-m.com" />
        </div>
      </section>

      {/* ── 3. APP TEASER ── */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb">
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              textAlign: 'center',
              color: 'var(--btb-oliv)',
              marginBottom: '0.5rem',
            }}>
              Das BtM Universe
            </h2>
            <p style={{ textAlign: 'center', opacity: 0.65, marginBottom: '2.5rem' }}>
              Die Plattform für Zusammenarbeit, Buchungen und gegenseitige Unterstützung innerhalb unseres Netzwerks.
            </p>
          </SectionReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}>
            {[
              { icon: <Users size={24} />, titel: 'Vernetzung', text: 'Finde und buche Dienstleistungen von Praktizierenden im Netzwerk.' },
              { icon: <CreditCard size={24} />, titel: 'Tausch-System', text: 'Arbeitsleistung wird fair bewertet und getauscht innerhalb des Systems.' },
              { icon: <Layout size={24} />, titel: 'Workspace', text: 'Dein Betrieb, deine Angebote, deine Gemeinschaft — alles an einem Ort.' },
            ].map((item, i) => (
              <SectionReveal key={i} delay={i * 0.12}>
                <div className="card-btb" style={{ textAlign: 'center' }}>
                  <div style={{
                    color: 'var(--btb-blau)',
                    marginBottom: '0.75rem',
                    display: 'flex', justifyContent: 'center',
                  }}>
                    {item.icon}
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-garamond)',
                    fontSize: '1.1rem',
                    color: 'var(--btb-dunkel)',
                    marginBottom: '0.5rem',
                  }}>
                    {item.titel}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--btb-dunkel)', opacity: 0.7, lineHeight: 1.6 }}>
                    {item.text}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>

          <div style={{ textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <RouterLink  to="/app" className="btn-secondary">
              Zur App
            </RouterLink>
            <a
              href="https://app.b-t-m-m.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Login <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* ── 4. INFINITY LOOP ── */}
      <section style={{
        background: 'linear-gradient(135deg, #1a5a8a 0%, var(--btb-blau) 50%, #1a5a8a 100%)',
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}>
        <div className="container-btb" style={{ maxWidth: 680 }}>
          <SectionReveal>
            <img 
              src="/infinity-gold.png"
              alt="Infinity Loop – Back to Meaning Maximization"
              width={200}
              height={200}
              style={{ margin: '0 auto 1rem', objectFit: 'contain' }}
            />
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              color: 'var(--btb-creme)',
              marginBottom: '0.75rem',
              fontStyle: 'italic',
            }}>
              Wirtschaft neu denken
            </h2>
            <p style={{
              color: 'var(--btb-creme)',
              opacity: 0.85,
              lineHeight: 1.75,
              fontSize: '1.05rem',
              maxWidth: 540,
              margin: '0 auto',
            }}>
              Die heutige Wirtschaft ist in einem Zirkel gefangen: Wachstum um des Wachstums willen, Gewinn als Maß aller Dinge. Back to Meaning Maximization fragt: Was wäre anders, wenn wir Bedeutung, Gemeinschaft und Nachhaltigkeit ins Zentrum stellen würden?
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ── 5. MEMBERSHIP TIERS ── */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb">
          <SectionReveal>
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              textAlign: 'center',
              marginBottom: '0.75rem',
              color: 'var(--btb-oliv)',
            }}>
              {t('mitgliedschaft.titel')}
            </h2>
            <p style={{ textAlign: 'center', opacity: 0.65, marginBottom: '3rem', maxWidth: 560, margin: '0 auto 3rem' }}>
              {t('mitgliedschaft.untertitel')}
            </p>
          </SectionReveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            {(t('mitgliedschaft.stufen', { returnObjects: true }) as any).map((tier: any, i: number) => (
              <SectionReveal key={i} delay={i * 0.12}>
                <div className="card-btb" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{
                    fontFamily: 'var(--font-garamond)',
                    fontSize: '1.25rem',
                    color: 'var(--btb-rot)',
                    marginBottom: '0.5rem',
                  }}>
                    {tier.stufe}
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--btb-oliv)',
                    marginBottom: '0.75rem',
                  }}>
                    {tier.preis}
                  </p>
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--btb-dunkel)',
                    opacity: 0.7,
                    lineHeight: 1.6,
                    marginBottom: '1rem',
                    flex: 1,
                  }}>
                    {tier.beschreibung}
                  </p>
                  <div style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(143,169,66,0.15)',
                    fontSize: '0.85rem',
                    color: 'var(--btb-blau)',
                    fontWeight: 600,
                  }}>
                    {tier.benefits}
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <RouterLink  to="/mitmachen" className="btn-primary">
              {tc('actions.mehr_erfahren')} →
            </RouterLink>
          </div>
        </div>
      </section>

      {/* ── 6. MEMBERSHIP CTA ── */}
      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb">
          <div style={{
            maxWidth: 680, margin: '0 auto',
            background: 'var(--btb-creme)',
            borderRadius: 16, padding: '2.5rem',
            border: '1px solid rgba(143,169,66,0.2)',
          }}>
            <SectionReveal>
              <h2 style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                color: 'var(--btb-oliv)',
                marginBottom: '0.75rem',
              }}>
                Teil unseres Netzwerks werden
              </h2>
              <p style={{ lineHeight: 1.75, opacity: 0.8, marginBottom: '1.75rem' }}>
                Back to Meaning Maximization wächst durch Menschen wie dich. Als Praktizierender, Unternehmer oder Unterstützer kannst du Teil eines Systems sein, das wirtschaftliche Stärke mit menschlicher Würde verbindet. Gemeinsam schaffen wir eine Alternative — lokal und global.
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <RouterLink  to="/mitmachen" className="btn-oliv">
                  Mitmachen
                </RouterLink>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>
    </>
  )
}
