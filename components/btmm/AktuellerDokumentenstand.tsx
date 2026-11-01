import { NeueInhalteStil } from '@/components/btmm/NeueInhalteStil'
import { Abschnitt, Offen, Karte } from '@/components/btmm/Bausteine'

export function AktuellerDokumentenstand({ locale, thema = 'grundlagen' }: { locale: string; thema?: 'grundlagen' | 'kosten' | 'wirtschaft' | 'gemeinschaft' }) {
  const hinweise = {
    grundlagen: [
      ['Drei Säulen, eine geplante eG', 'Die aktuellen Dokumente beschreiben Nutzengemeinschaft, Gemeinschaftsbetriebe und Gemeinschaftseigentum innerhalb einer geplanten eingetragenen Genossenschaft. Ein zusätzlicher Verein als Träger ist nicht vorgesehen.'],
      ['Erst erproben, dann verpflichten', 'Bezahlte Aufträge, eine verlässliche Finanzierung und fachliche Klärung gehören vor eine Anstellung. Ein Keim ist noch keine eigene Rechtsform. Wer nur gemeinsam einkauft oder unterstützt, muss deshalb nicht selbstständig werden.'],
    ],
    kosten: [
      ['Anteil beim Austritt – neuer Entwurfsstand', 'Satzung v7.35.0 sieht vor, dass die Einlage grundsätzlich in der eG bleibt. Auf Wunsch sollen interne Gutschein-Coins möglich sein. Die Zulässigkeit ist ungeklärt. Gesetzlich vorgeschriebene Auszahlungen gehen vor; für diesen Fall nennt der Entwurf die Feststellung des zweiten Geschäftsjahres nach dem Ausscheiden. Eine geprüfte Rückzahlungszusage gibt es nicht.'],
      ['Beitrag und Nutzen getrennt zeigen', 'Eigene Einkünfte bleiben bei Nutzungsmitgliedern. Pflichtkosten, Dienst-Umlage und ein möglicher Beitrag zum Lebensstandard-Wachstum sollen getrennt in der Nutzen-Bilanz stehen. Ermäßigungen und eine ruhende Mitgliedschaft sind vorgesehen.'],
    ],
    wirtschaft: [
      ['Selbstkosten enthalten auch Arbeit', 'Die aktuelle Anleitung rechnet bei internen Leistungen mit Material, anteiligen Kosten und Arbeitszeit zum gleichen Grundlohn, ohne Gewinnaufschlag. Der Zielwert von 20 Euro brutto je Stunde ist eine Planung, kein bestehendes Lohnangebot. Gearbeitete Betriebsstunden sind zu bezahlen.'],
      ['Die Prozentzahlen haben verschiedene Grundlagen', '10 % Mindestrücklage und 5 % Mindest-Sozialanteil beziehen sich auf die Wertschöpfung. Die Verteilung von Bonus, Reinvestition und Sozialem bezieht sich erst auf den verbleibenden Überschuss nach dem Grundlohn samt Arbeitgeberkosten.'],
    ],
    gemeinschaft: [
      ['Stimme und Schutz', 'Eine Person, eine Stimme ist die Grundlage des Entwurfs. Das Demokratie-Papier schlägt zusätzlich Konsent und eine doppelte Mehrheit für zellenübergreifende Entscheidungen vor. Die rechtliche Umsetzung ist noch offen. Bei Gewalt hat der Schutz Betroffener Vorrang.'],
      ['Der Solidarfonds braucht erst eine Grundlage', 'Der Entwurf setzt vor Leistungen sechs aufeinanderfolgende Perioden mit mindestens zehn wirtschaftlich aktiven Vollmitgliedern und ausreichend tragfähigem Lohn voraus. Er zahlt nur aus vorhandenem Bestand und ersetzt keine gesetzliche Absicherung.'],
    ],
  }[thema]
  return <div className="btmm-ergaenzung"><NeueInhalteStil /><Abschnitt titel="Ergänzung aus den aktuellen Dokumenten">
    <p style={{ fontSize: '0.9rem', opacity: 0.75 }}>Stand: 1. November 2026 · Konzept v22.49.3 und Satzungsentwurf v7.35.0</p>
    <div className="btmm-raster">{hinweise.map(([titel, text]) => <Karte key={titel} titel={titel}><p>{text}</p></Karte>)}</div>
    <Offen>Die neuen Angaben sind Arbeits- und Satzungsentwürfe. Rechtliche Prüfung, tragfähige Finanzierung und praktische Erprobung stehen vor verbindlichen Zusagen.</Offen>
    <p><a href={`/${locale}/wissen`}>Die neuen Themen verständlich nachlesen →</a> · <a href={`/${locale}/geldfluss`}>Zum Geldfluss-Diagramm →</a></p>
  </Abschnitt></div>
}
