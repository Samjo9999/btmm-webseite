// Nutzen für Handwerksbetriebe (Außensicht-Fix 24.11.2026).
// Quellen: konzept.wirtschaft.megafirma_text (Betriebshaftpflicht für alle),
// konzept.wirtschaft.dreiteilung_reinvest (Steuerberater, Versicherung, Software),
// Satzungsentwurf v7.52.0 § 15 Abs. 2 (Verwaltung/Buchhaltung mit gemeinsamen Werkzeugen),
// 19_BtMM_Soziale_Zahlen (Keim-Phase ohne gemeinsame Verwaltung).
// Meisterpflicht-Text: Recht-&-Fristen-Bot, 24.11.2026.
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function HandwerkNutzen({ locale, kompakt = false }: { locale: string; kompakt?: boolean }) {
  const t = await getTranslations({ locale, namespace: 'konzept.handwerk' })
  const punkte = ['haftpflicht', 'steuer', 'verwaltung'] as const
  return (
    <section className="btmm-handwerk" aria-labelledby="btmm-handwerk-titel">
      <h2 id="btmm-handwerk-titel">{t('titel')}</h2>
      <p className="btmm-handwerk-intro">{t('intro')}</p>
      <div className="btmm-raster">
        {punkte.map((p) => (
          <div key={p} className="btmm-karte">
            <h3>{t(`${p}_titel`)}</h3>
            <p>{t(`${p}_text`)}</p>
          </div>
        ))}
      </div>
      <p className="btmm-handwerk-hinweis">{t('hinweis')}</p>
      {kompakt ? (
        <p className="btmm-handwerk-mehr">
          <Link href={`/${locale}/konzept/wirtschaft#meisterpflicht`}>{t('mehr')} →</Link>
        </p>
      ) : (
        <div id="meisterpflicht" className="btmm-hinweis btmm-handwerk-meister">
          <h3>{t('meister_titel')}</h3>
          <p>{t('meister_text')}</p>
        </div>
      )}
    </section>
  )
}
