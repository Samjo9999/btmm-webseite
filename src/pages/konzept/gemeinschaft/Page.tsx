// import Image (use <img>) 
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'


export default function GemeinschaftPage() {
  const { t } = useTranslation('konzept')

  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#051a0a',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
      }}>
        <img 
          src="https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&q=80"
          alt="Waldlichtung – Gemeinschaft im Licht"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&q=80"
          alt="Waldlichtung – Gemeinschaft im Licht"
        />
        <div className="hero-text" style={{ maxWidth: 640, position: 'relative', zIndex: 2 }}>
          <p style={{ color: 'var(--btb-creme)', opacity: 0.6, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <RouterLink  to="/konzept" style={{ color: 'var(--btb-creme)', opacity: 0.6 }}>Konzept</RouterLink> ›
          </p>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--btb-creme)',
            marginBottom: '1rem',
          }}>
            {t('gemeinschaft.titel')}
          </h1>
          <p style={{
            color: 'var(--btb-oliv)',
            fontFamily: 'var(--font-garamond)',
            fontStyle: 'italic',
            fontSize: '1.1rem',
          }}>
            {t('gemeinschaft.untertitel')}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb prose-btb" style={{ maxWidth: 800 }}>

          {/* Intro */}
          <SectionReveal>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
              {t('gemeinschaft.intro')}
            </p>
          </SectionReveal>

          {/* Zellen */}
          <SectionReveal delay={0.1}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-blau)', marginBottom: '1rem' }}>
              {t('gemeinschaft.zellen_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>{t('gemeinschaft.zellen_text')}</p>
            <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{t('gemeinschaft.zellen_detail')}</p>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Solidarfonds */}
          <SectionReveal delay={0.15}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-blau)', marginBottom: '1rem' }}>
              {t('gemeinschaft.solidar_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{t('gemeinschaft.solidar_text')}</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              <div className="card-btb" style={{ borderLeft: '4px solid var(--btb-oliv)', paddingLeft: '1.5rem' }}>
                <p style={{ fontWeight: 600, lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {t('gemeinschaft.solidar_rhythmus')}
                </p>
              </div>
              <div className="card-btb" style={{ borderLeft: '4px solid var(--btb-oliv)', paddingLeft: '1.5rem' }}>
                <p style={{ fontWeight: 600, lineHeight: 1.6, fontSize: '0.95rem' }}>
                  {t('gemeinschaft.solidar_kapazitaet')}
                </p>
              </div>
            </div>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Gleichwürdigkeit */}
          <SectionReveal delay={0.2}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-blau)', marginBottom: '1rem' }}>
              {t('gemeinschaft.gleichwuerdigkeit_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>{t('gemeinschaft.gleichwuerdigkeit_text')}</p>
            <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{t('gemeinschaft.gleichwuerdigkeit_transparenz')}</p>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Konsequenzen */}
          <SectionReveal delay={0.25}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-blau)', marginBottom: '1rem' }}>
              {t('gemeinschaft.konsequenz_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>{t('gemeinschaft.konsequenz_text')}</p>
            <blockquote style={{
              borderLeft: '4px solid var(--btb-oliv)',
              paddingLeft: '1.5rem',
              fontStyle: 'italic',
              color: 'var(--btb-dunkel)',
              opacity: 0.8,
              marginBottom: '2rem',
            }}>
              {t('gemeinschaft.konsequenz_stufen')}
            </blockquote>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Stufen */}
          <SectionReveal delay={0.3}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-blau)', marginBottom: '1rem' }}>
              {t('gemeinschaft.stufen_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{t('gemeinschaft.stufen_text')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                { key: 'stufen_unterstuetzer', highlight: false },
                { key: 'stufen_anwaerter', highlight: false },
                { key: 'stufen_vollmitglied', highlight: true },
              ].map(({ key, highlight }) => (
                <div key={key} style={{
                  padding: '0.75rem 1rem',
                  background: highlight ? 'var(--btb-oliv)' : 'var(--btb-creme)',
                  color: highlight ? 'var(--btb-weiss)' : 'var(--btb-dunkel)',
                  borderRadius: 8,
                  fontSize: '0.95rem',
                  fontWeight: highlight ? 600 : 400,
                }}>
                  {t(`gemeinschaft.${key}`)}
                </div>
              ))}
            </div>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Wohnraumvergabe */}
          <SectionReveal delay={0.35}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-blau)', marginBottom: '1rem' }}>
              {t('gemeinschaft.wohnraum_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{t('gemeinschaft.wohnraum_text')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {['wohnraum_stufe1', 'wohnraum_stufe2', 'wohnraum_stufe3', 'wohnraum_stufe4', 'wohnraum_stufe5'].map((key, i) => (
                <div key={key} style={{
                  padding: '0.75rem 1rem',
                  background: i === 0 ? 'var(--btb-rot)' : 'var(--btb-creme)',
                  color: i === 0 ? 'var(--btb-weiss)' : 'var(--btb-dunkel)',
                  borderRadius: 8,
                  fontSize: '0.95rem',
                  fontWeight: i === 0 ? 600 : 400,
                }}>
                  {t(`gemeinschaft.${key}`)}
                </div>
              ))}
            </div>
            <p style={{ lineHeight: 1.8, marginBottom: '2rem' }}>{t('gemeinschaft.wohnraum_detail')}</p>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Kompetenz statt Zertifikat */}
          <SectionReveal delay={0.38}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-blau)', marginBottom: '1rem' }}>
              {t('gemeinschaft.bildung_titel')}
            </h2>
            <p style={{ lineHeight: 1.8, marginBottom: '1.5rem' }}>{t('gemeinschaft.bildung_text')}</p>
            <div className="card-btb" style={{ borderLeft: '4px solid var(--btb-oliv)', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, lineHeight: 1.6, fontSize: '0.95rem' }}>
                {t('gemeinschaft.bildung_nachweis')}
              </p>
            </div>
            <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>{t('gemeinschaft.bildung_kinder')}</p>
            <p style={{ lineHeight: 1.8, marginBottom: '1rem' }}>{t('gemeinschaft.bildung_kollektiv')}</p>
            <blockquote style={{
              borderLeft: '4px solid var(--btb-oliv)',
              paddingLeft: '1.5rem',
              fontStyle: 'italic',
              color: 'var(--btb-dunkel)',
              opacity: 0.8,
              marginBottom: '2rem',
            }}>
              {t('gemeinschaft.bildung_grenze')}
            </blockquote>
            <hr className="divider-btb" />
          </SectionReveal>

          {/* Was dieses System nicht ist */}
          <SectionReveal delay={0.35}>
            <h2 style={{ fontFamily: 'var(--font-garamond)', fontSize: '1.8rem', color: 'var(--btb-blau)', marginBottom: '1rem' }}>
              {t('gemeinschaft.nicht_ist_titel')}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              {['nicht_kommunismus', 'nicht_anarchismus', 'nicht_investment'].map((key) => (
                <div key={key} className="card-btb" style={{ borderLeft: '4px solid var(--btb-oliv)', paddingLeft: '1.5rem' }}>
                  <p style={{ fontWeight: 600, lineHeight: 1.6, fontSize: '0.95rem' }}>
                    {t(`gemeinschaft.${key}`)}
                  </p>
                </div>
              ))}
            </div>
          </SectionReveal>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            <RouterLink  to="/konzept/international" className="btn-primary">
              Weiter: International
            </RouterLink>
            <RouterLink  to="/konzept" className="btn-secondary">
              Zurück zur Übersicht
            </RouterLink>
          </div>
        </div>
      </section>
    </>
  )
}
