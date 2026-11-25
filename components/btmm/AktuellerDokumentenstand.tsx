import { NeueInhalteStil } from '@/components/btmm/NeueInhalteStil'
import { Abschnitt, Offen, Karte } from '@/components/btmm/Bausteine'

export function AktuellerDokumentenstand({ locale, thema = 'grundlagen' }: { locale: string; thema?: 'grundlagen' | 'kosten' | 'wirtschaft' | 'gemeinschaft' }) {
  const hinweise = {
    grundlagen: [
      ['Drei Säulen, eine geplante eG', 'Die aktuellen Dokumente beschreiben Nutzengemeinschaft, Gemeinschaftsbetriebe und Gemeinschaftseigentum innerhalb einer geplanten eingetragenen Genossenschaft. Ein zusätzlicher Verein als Träger ist nicht vorgesehen.'],
      ['Erst erproben, dann verpflichten', 'Bezahlte Aufträge, eine verlässliche Finanzierung und fachliche Klärung gehören vor eine Anstellung. Ein Keim ist noch keine eigene Rechtsform. Wer nur gemeinsam einkauft oder unterstützt, muss deshalb nicht selbstständig werden.'],
    ],
    kosten: [
      ['Anteil beim Austritt – Entwurfsstand', 'Der Satzungsentwurf v9.1.4 sieht nicht vor, dass die Einlage in der eG bleibt. Nach dem Satzungsentwurf kannst du die Mitgliedschaft in Textform mit einer Frist von einem Jahr zum Schluss eines Geschäftsjahres kündigen (Satzung § 6 Abs. 1). Das Geschäftsguthaben wird nach dem Ausscheiden nach § 73 GenG in Euro ausgezahlt (Satzung § 6 Abs. 4). Maßgeblich ist die Bilanz zum Ausscheiden; bei Verlusten kann das Guthaben unter dem eingezahlten Betrag liegen. Das ist ein Entwurf, noch nicht beschlossen, und kann sich ändern. BtMM ist noch nicht gegründet, eine Mitgliedschaft ist derzeit nicht möglich. Coins sind kein Geld und nicht in Euro auszahlbar.'],
      ['Beitrag und Nutzen getrennt zeigen', 'Eigene Einkünfte bleiben bei Nutzungsmitgliedern. Pflichtkosten, Dienst-Umlage und ein möglicher Beitrag zum Lebensstandard-Wachstum sollen getrennt in der Nutzen-Bilanz stehen. Ermäßigungen und eine ruhende Mitgliedschaft sind vorgesehen.'],
    ],
    wirtschaft: [
      ['Selbstkosten enthalten auch Arbeit', 'Die aktuelle Anleitung rechnet bei internen Leistungen mit Material, anteiligen Kosten und Arbeitszeit zum gleichen Grundlohn, ohne Gewinnaufschlag. Der Zielwert von 20 Euro brutto je Stunde ist eine Planung, kein bestehendes Lohnangebot. Gearbeitete Betriebsstunden sind zu bezahlen.'],
      ['Die Prozentzahlen haben verschiedene Grundlagen', '10 % Mindestrücklage und 5 % Mindest-Sozialanteil beziehen sich auf die Wertschöpfung. Die Verteilung von Bonus, Reinvestition und Sozialem bezieht sich erst auf den verbleibenden Überschuss nach dem Grundlohn samt Arbeitgeberkosten.'],
    ],
    gemeinschaft: [
      ['Stimme und Schutz', 'Eine Person, eine Stimme ist die Grundlage des Entwurfs. Das Demokratie-Papier schlägt zusätzlich Konsent und eine doppelte Mehrheit für zellenübergreifende Entscheidungen vor. Die rechtliche Umsetzung ist noch offen. Bei Gewalt hat der Schutz Betroffener Vorrang.'],
      ['Der Solidarfonds braucht erst eine Grundlage', 'Ein Solidarfonds ist im Konzept geplant, in der Außen-Satzung v9.1.4 aber nicht geregelt. Geplante Schwellen und Leistungen sind Absicht, keine Zusage, und ersetzen keine gesetzliche Absicherung.'],
    ],
  }[thema]
  return <div className="btmm-ergaenzung"><NeueInhalteStil /><Abschnitt titel="Ergänzung aus den aktuellen Dokumenten">
    <p style={{ fontSize: '0.9rem', opacity: 0.75 }}>Stand: 24. November 2026 · Satzung der geplanten BtMM eG (Entwurf) v9.1.4 · Konzept v22.69.0</p>
    <div className="btmm-raster">{hinweise.map(([titel, text]) => <Karte key={titel} titel={titel}><p>{text}</p></Karte>)}</div>
    <Offen>Die neuen Angaben sind Arbeits- und Satzungsentwürfe. Rechtliche Prüfung, tragfähige Finanzierung und praktische Erprobung stehen vor verbindlichen Zusagen.</Offen>
    <p><a href={`/${locale}/wissen`}>Die neuen Themen verständlich nachlesen →</a> · <a href={`/${locale}/geldfluss`}>Zum Geldfluss-Diagramm →</a></p>
  </Abschnitt></div>
}
