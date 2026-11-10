import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { SectionReveal } from '@/components/AnimatedCounter'
import { HeroImageLightbox } from '@/components/HeroImageLightbox'
import { FaqAccordion } from '@/components/FaqAccordion'
import { SupportChat } from '@/components/SupportChat'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FAQ – Häufige Fragen | Back to Meaning Maximization',
  description: 'Häufige Fragen zu Back to Meaning Maximization, Mitgliedschaft, Körperarbeit und der BtMM-App.',
}

export default async function FaqPage() {
  const t = await getTranslations('faq')

  const fragen = [
    { frage: t('fragen.was_ist_btb.frage'), antwort: t('fragen.was_ist_btb.antwort') },
    { frage: t('fragen.wie_mitmachen.frage'), antwort: t('fragen.wie_mitmachen.antwort') },
    { frage: t('fragen.was_kostet.frage'), antwort: t('fragen.was_kostet.antwort') },
    { frage: t('fragen.was_sind_coins.frage'), antwort: t('fragen.was_sind_coins.antwort') },
    { frage: t('fragen.koerperarbeit_unterschied.frage'), antwort: t('fragen.koerperarbeit_unterschied.antwort') },
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
        <Image
          src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80"
          alt="Grüne Hügel – Antworten finden"
          fill
          style={{ objectFit: 'cover' }}
          priority
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
