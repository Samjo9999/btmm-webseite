/**
 * Tür als Einstieg für alle (Nutzer 20.11.2026 23:51: „Ja, die Tür ist der Einstieg für alle“).
 * Wer die Startseite in einer Sitzung zum ersten Mal öffnet, geht zuerst durch die Tür (/tuer/).
 * Merker nur in sessionStorage („btmm-tuer-durch“), kein Cookie, nichts an den Server.
 * Mit ?ohne-tuer lässt sich die Weiche überspringen (z. B. für Tests).
 * Läuft als Inline-Skript, damit die Startseite vor der Weiterleitung nicht aufblitzt.
 */
const SKRIPT = `(function(){try{var s=window.sessionStorage;if(location.search.indexOf('ohne-tuer')!==-1){s.setItem('btmm-tuer-durch','1');return}if(s.getItem('btmm-tuer-durch')!=='1'){location.replace('/tuer/index.html')}}catch(e){}})();`

export function TuerWeiche({ locale }: { locale: string }) {
  // Die Tür gibt es bisher nur auf Deutsch.
  if (locale !== 'de') return null
  return <script dangerouslySetInnerHTML={{ __html: SKRIPT }} />
}
