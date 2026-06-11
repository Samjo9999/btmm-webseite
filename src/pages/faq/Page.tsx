// import Image (use <img>)
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { FaqAccordion } from '@/components/FaqAccordion'
import { SupportChat } from '@/components/SupportChat'


export default function FaqPage() {
  const { t } = useTranslation('faq')

  const fragen = [
    { frage: t('fragen.was_ist_btb.frage'), antwort: t('fragen.was_ist_btb.antwort') },
    { frage: t('fragen.wie_mitmachen.frage'), antwort: t('fragen.wie_mitmachen.antwort') },
    { frage: t('fragen.was_kostet.frage'), antwort: t('fragen.was_kostet.antwort') },
    { frage: t('fragen.was_sind_coins.frage'), antwort: t('fragen.was_sind_coins.antwort') },
    { frage: t('fragen.koerperarbeit_unterschied.frage'), antwort: t('fragen.koerperarbeit_unterschied.antwort') },
    { frage: t('fragen.spenden_wohin.frage'), antwort: t('fragen.spenden_wohin.antwort') },
    { frage: t('fragen.app_login.frage'), antwort: t('fragen.app_login.antwort') },
    { frage: t('fragen.zelle_gruenden.frage'), antwort: t('fragen.zelle_gruenden.antwort') },
  ]

  return (
    <>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1505',
        padding: '5rem 1.5rem 4rem', textAlign: 'center',
      }}>
        <img
          src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80"
          alt="Grüne Hügel – Antworten finden"
          style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
        <HeroImageLightbox
          src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80"
          alt="Grüne Hügel – Antworten finden"
        />
        <div className="hero-text" style={{ maxWidth: 680, position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
            color: 'var(--btb-creme)',
            marginBottom: '1rem',
          }}>
            {t('titel')}
          </h1>
          <p style={{ color: 'var(--btb-creme)', opacity: 0.75, lineHeight: 1.75 }}>
            {t('untertitel')}
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <FaqAccordion fragen={fragen} />
          </SectionReveal>

          <SectionReveal delay={0.3}>
            <div style={{
              marginTop: '3rem',
              background: 'var(--btb-creme)',
              borderRadius: 12, padding: '2rem',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-garamond)',
                color: 'var(--btb-oliv)',
                fontSize: '1.5rem',
                marginBottom: '0.75rem',
                textAlign: 'center',
              }}>
                Deine Frage ist nicht dabei?
              </h2>
              <p style={{ opacity: 0.75, marginBottom: '1.5rem', lineHeight: 1.65, textAlign: 'center' }}>
                Unser BtMM-Assistent kennt alle Dokumente und beantwortet deine Fragen sofort.
              </p>
              <SupportChat />
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
