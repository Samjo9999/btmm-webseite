/**
 * Tür als Einstieg für alle (Nutzer 20.11.2026 23:51: „Ja, die Tür ist der Einstieg für alle“;
 * 21.11.2026 00:15: „Ja, Tür in alle Sprachen übersetzen“).
 * Wer die Startseite in einer Sitzung zum ersten Mal öffnet, geht zuerst durch die Tür (/tuer/index.html?lang=<locale>).
 * Merker nur in sessionStorage („btmm-tuer-durch“), kein Cookie, nichts an den Server.
 * Mit ?ohne-tuer lässt sich die Weiche überspringen (z. B. für Tests).
 * Crawler, Link-Vorschauen und automatisierte Browser (navigator.webdriver) werden nicht umgeleitet (SEO).
 * Läuft als Inline-Skript, damit die Startseite vor der Weiterleitung nicht aufblitzt.
 */
import { locales } from '@/i18n'

const BOT_MUSTER =
  'bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|whatsapp|telegram|discord|preview|lighthouse|headless'

function skript(locale: string) {
  return `(function(){try{var s=window.sessionStorage;if(location.search.indexOf('ohne-tuer')!==-1){s.setItem('btmm-tuer-durch','1');return}if(navigator.webdriver||/${BOT_MUSTER}/i.test(navigator.userAgent||''))return;if(s.getItem('btmm-tuer-durch')!=='1'){location.replace('/tuer/index.html?lang='+${JSON.stringify(locale)})}}catch(e){}})();`
}

export function TuerWeiche({ locale }: { locale: string }) {
  if (!(locales as readonly string[]).includes(locale)) return null
  return <script dangerouslySetInnerHTML={{ __html: skript(locale) }} />
}
