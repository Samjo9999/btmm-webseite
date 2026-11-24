/**
 * Zielseiten der Überzeugungstür für Gruppen, die bisher keinen eigenen Inhalt hatten (PR #38):
 * Berufseinstieg, Kundinnen und Kunden, Lebensphasen (Solidarfonds), Ruhestand, Unterstützen.
 * Texte: lib/inhalte/tuer-luecken.ts und lib/inhalte/tuer-r3.ts (Runde 3, quellenbelegt).
 * Eigene Route, damit sie sich nicht mit dem Außensicht-Branch überschneidet.
 * Runde 4: statt app/[locale]/(seiten)/fuer-dich/[thema] je Thema eine feste Route (fuer-dich/<thema>/page.tsx), weil die Lint-Regel
 * @next/next/no-html-link-for-pages zwei dynamische Segmente in einem Pfad als „passt auf alles“ liest (Lint über Basis).
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { SeitenKopf, Abschnitt, SeitenRahmen } from '@/components/btmm/Bausteine'
import { FaqLohn } from '@/components/btmm/FaqLohn'
import { lueckenTexte } from '@/lib/inhalte/tuer-luecken'
import { r3Texte } from '@/lib/inhalte/tuer-r3'
import { SITE_URL, KONTAKT_MAIL, href } from '@/lib/seiten'
import { BRAND_FULL } from '@/lib/brand'
import Link from 'next/link'

const THEMEN = ['berufseinstieg', 'kunden', 'lebensphasen', 'ruhestand', 'unterstuetzen'] as const
type Thema = (typeof THEMEN)[number]
export type FuerDichThema = Thema

function kopf(t: ReturnType<typeof lueckenTexte>, thema: Thema, locale: string) {
  if (thema === 'berufseinstieg') return { titel: t.einstieg.titel, kurz: t.einstieg.kurz }
  if (thema === 'kunden') return { titel: t.kunden.titel, kurz: t.kunden.kurz }
  if (thema === 'ruhestand' || thema === 'unterstuetzen') { const r = r3Texte(locale)[thema]; return { titel: r.titel, kurz: r.kurz } }
  return { titel: t.lebensphasen.titel, kurz: t.lebensphasen.kurz }
}

export function fuerDichMeta(thema: Thema, locale: string): Metadata {
  const k = kopf(lueckenTexte(locale), thema, locale)
  const url = `${SITE_URL}/${locale}/fuer-dich/${thema}`
  return { title: { absolute: `${k.titel} | ${BRAND_FULL}` }, description: k.kurz, alternates: { canonical: url }, openGraph: { title: k.titel, description: k.kurz, url } }
}

export async function FuerDichSeite({ locale, thema }: { locale: string; thema: Thema }) {
  if (!THEMEN.includes(thema)) notFound()
  setRequestLocale(locale)
  const t = lueckenTexte(locale)
  const k = kopf(t, thema as Thema, locale)
  const r3 = r3Texte(locale)
  const tk = await getTranslations({ locale, namespace: 'konzept' })
  return (
    <SeitenRahmen>
      <SeitenKopf titel={k.titel} unterzeile={k.kurz} />
      <div className="btmm-inhalt">
        {thema === 'berufseinstieg' && (
          <Abschnitt id="berufseinstieg">
            <p><span className="btmm-marke btmm-marke--geplant">{t.geplant}</span></p>
            <p>{t.einstieg.text}</p>
            <div className="btmm-hinweis btmm-hinweis--offen"><strong>{t.geplant}:</strong> {t.einstieg.hinweis}</div>
            <FaqLohn locale={locale} />
          </Abschnitt>
        )}
        {thema === 'kunden' && (
          <Abschnitt id="kunden">
            <p>{t.kunden.text}</p>
            <p>{t.kunden.abo}</p>
            <p><em>{t.kunden.hinweis}</em></p>
            <p>{t.kunden.mitglied}</p>
          </Abschnitt>
        )}
        {thema === 'lebensphasen' && (
          <Abschnitt id="solidarfonds">
            <p>{tk('gemeinschaft.solidar_text')}</p>
            <p>{tk('gemeinschaft.solidar_rhythmus')}</p>
            <p>{tk('gemeinschaft.solidar_kapazitaet')}</p>
            <p><Link href={`/${locale}/konzept/gemeinschaft`} className="btmm-knopf">{t.mehr}</Link></p>
          </Abschnitt>
        )}
        {thema === 'ruhestand' && (
          <Abschnitt id="ruhestand">
            <p><span className="btmm-marke btmm-marke--geplant">{r3.marke}</span></p>
            <ul>{r3.ruhestand.punkte.map((x) => <li key={x}>{x}</li>)}</ul>
            <div className="btmm-hinweis btmm-hinweis--offen"><strong>{r3.geld.titel}:</strong> {r3.geld.text}</div>
            <p>{r3.ruhestand.offen} <Link href={href(locale, 'offeneFragen')}>{r3.ruhestand.offenLink} →</Link></p>
            <p><small>{r3.quelle}</small></p>
          </Abschnitt>
        )}
        {thema === 'unterstuetzen' && (
          <Abschnitt id="unterstuetzen">
            <p><a href={`mailto:${KONTAKT_MAIL}`} className="btmm-knopf">{r3.unterstuetzen.knopf}</a></p>
            <p>{r3.unterstuetzen.text}</p>
            <p>{r3.unterstuetzen.weg}</p>
            <div className="btmm-hinweis btmm-hinweis--offen"><strong>{r3.geld.titel}:</strong> {r3.geld.text}</div>
            <p><Link href={href(locale, 'mitmachen')}>{r3.unterstuetzen.mitmachen} →</Link></p>
            <p><small>{r3.quelle}</small></p>
          </Abschnitt>
        )}
      </div>
    </SeitenRahmen>
  )
}
