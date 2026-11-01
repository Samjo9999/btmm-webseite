import type { CSSProperties, ReactNode } from 'react'

const css = `
.btmm-geldfluss { --gf-lila: var(--btmm-dunkel, #780268); --gf-glow: var(--btmm-glow-rgb, 158,87,164); color: var(--btb-dunkel, #1a1505); }
.btmm-geldfluss * { box-sizing: border-box; }
.btmm-geldfluss .gf-intro { max-width: 760px; line-height: 1.7; }
.btmm-geldfluss .gf-legende { display: inline-block; padding: .4rem .8rem; margin: .5rem 0 1rem; border-radius: 99px; color: var(--gf-lila); background: rgba(var(--gf-glow), .1); font-size: .85rem; font-weight: 600; }
.btmm-geldfluss figure { margin: 0; }
.btmm-geldfluss .gf-strecke { padding: clamp(.9rem, 3vw, 2rem); border: 1px solid rgba(var(--gf-glow), .24); border-radius: 20px; background: radial-gradient(ellipse at 50% 0, rgba(var(--gf-glow), .16), transparent 60%), var(--btmm-weiss, #faf9f9); box-shadow: 0 10px 36px rgba(var(--gf-glow), .1); }
.btmm-geldfluss .gf-node { position: relative; padding: 1.15rem 1.25rem; border: 1px solid rgba(var(--gf-glow), .22); border-radius: 13px; background: var(--btb-weiss, #fff); }
.btmm-geldfluss .gf-node h3, .btmm-geldfluss .gf-node h4 { color: var(--gf-lila); font-family: var(--font-garamond), Georgia, serif; line-height: 1.25; margin: .15rem 0 .4rem; }
.btmm-geldfluss .gf-node h3 { font-size: 1.35rem; }
.btmm-geldfluss .gf-node h4 { font-size: 1.2rem; }
.btmm-geldfluss .gf-node p { margin: .35rem 0 0; line-height: 1.6; font-size: .94rem; }
.btmm-geldfluss .gf-hero { text-align: center; border-color: rgba(var(--gf-glow), .5); }
.btmm-geldfluss .gf-kicker { color: var(--gf-lila); font-size: .72rem; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; }
.btmm-geldfluss .gf-betrag { display: block; margin: .35rem 0; font-size: clamp(1.6rem, 4vw, 2.15rem); font-weight: 700; color: var(--gf-lila); font-variant-numeric: tabular-nums; }
.btmm-geldfluss .gf-meta { display: block; font-size: .81rem; line-height: 1.5; opacity: .8; }
.btmm-geldfluss .gf-pfeil { display: grid; place-items: center; margin: .5rem 0; color: var(--gf-lila); gap: .1rem; }
.btmm-geldfluss .gf-pfeil span:first-child { font-size: 1.7rem; line-height: 1; }
.btmm-geldfluss .gf-pfeil small { font-size: .77rem; }
.btmm-geldfluss .gf-raster { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem; }
.btmm-geldfluss .gf-drei { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.btmm-geldfluss .gf-abzweig { border-top: 4px solid var(--gf-lila); }
.btmm-geldfluss .gf-bonus { border-color: var(--btmm-hell, #ddcddf); border-top-color: var(--btmm-dunkel, #780268); }
.btmm-geldfluss .gf-invest { border-color: #9e57a440; border-top-color: var(--btmm-primary, #9e57a4); }
.btmm-geldfluss .gf-sozial { border-color: var(--btmm-hell, #ddcddf); border-top-color: var(--btmm-akzent, #b058b3); }
.btmm-geldfluss .gf-anteil { display: block; font-size: 1.7rem; font-weight: 700; margin: .25rem 0; color: var(--gf-lila); }
.btmm-geldfluss .gf-summen { margin-top: 1.2rem; padding: 1rem; border-radius: 12px; background: rgba(var(--gf-glow), .07); }
.btmm-geldfluss .gf-summen dl { margin: .6rem 0 0; display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: .65rem; }
.btmm-geldfluss .gf-summen dt { font-size: .8rem; line-height: 1.4; }
.btmm-geldfluss .gf-summen dd { margin: .25rem 0 0; font-weight: 700; color: var(--gf-lila); }
.btmm-geldfluss .gf-hinweis { border-left: 3px solid var(--btmm-primary, #9e57a4); padding: .65rem .9rem; margin: 1rem 0; background: rgba(var(--gf-glow), .06); font-size: .86rem; line-height: 1.65; }
.btmm-geldfluss .gf-details { margin-top: 1rem; border: 1px solid rgba(var(--gf-glow), .24); border-radius: 12px; background: var(--btb-weiss, #fff); padding: 0 1.1rem; }
.btmm-geldfluss .gf-details summary { cursor: pointer; padding: 1rem 0; font-weight: 700; color: var(--gf-lila); }
.btmm-geldfluss .gf-details p { line-height: 1.7; }
.btmm-geldfluss .gf-details ul { padding-left: 1.3rem; margin: .25rem 0 1rem; }
.btmm-geldfluss .gf-details li { margin: .55rem 0; line-height: 1.65; }
.btmm-geldfluss .gf-details .gf-raster { margin-bottom: 1rem; }
.btmm-geldfluss .gf-reife { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: .65rem; margin: .8rem 0; }
.btmm-geldfluss .gf-reife > div { padding: .8rem; background: rgba(var(--gf-glow), .06); border-radius: 8px; text-align: center; }
.btmm-geldfluss figcaption { margin: .9rem 0 0; font-size: .82rem; line-height: 1.65; opacity: .8; }
@media(max-width: 620px) {
  .btmm-geldfluss .gf-raster, .btmm-geldfluss .gf-drei { grid-template-columns: 1fr; }
  .btmm-geldfluss .gf-summen dl { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .btmm-geldfluss .gf-reife { grid-template-columns: 1fr; }
  .btmm-geldfluss .gf-node { padding: 1rem; }
}
@media print {
  .btmm-geldfluss .gf-strecke { box-shadow: none; }
  .btmm-geldfluss .gf-node { break-inside: avoid; }
}
`

function Pfeil({ text }: { text?: string }) {
  return <div className="gf-pfeil" aria-hidden="true"><span>↓</span>{text && <small>{text}</small>}</div>
}

function Knoten({ schritt, titel, children, className = '', style }: { schritt?: string; titel: string; children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`gf-node ${className}`} style={style}>
    {schritt && <span className="gf-kicker">{schritt}</span>}
    <h3>{titel}</h3>
    {children}
  </div>
}

/** Ergänzung zum bestehenden Inhalt. Keine echten Einnahmen oder Auszahlungszusagen. */
export function GeldflussDiagramm() {
  return <section className="btmm-geldfluss btmm-abschnitt" id="geldfluss" aria-labelledby="geldfluss-titel">
    <style>{css}</style>
    <h2 id="geldfluss-titel">Wo jeder Euro hingehen soll</h2>
    <p className="gf-intro">Erst die Kosten abziehen. Dann Rücklagen bilden und die Arbeit bezahlen. Nur der Rest wird aufgeteilt. So ist der Geldfluss im aktuellen BtMM-Entwurf gedacht.</p>
    <span className="gf-legende">Planungsstand · November 2026 · kein laufendes Finanzsystem</span>

    <figure aria-describedby="geldfluss-quelle">
      <div className="gf-strecke">
        <Knoten schritt="1 · Einnahmen der Gemeinschaftsbetriebe" titel="Kundschaft bezahlt den Marktpreis" className="gf-hero">
          <p>Umsatz in Euro → Umsatzsteuer, unmittelbare Sachkosten und Betriebs-Fixkosten abziehen.</p>
          <span className="gf-meta">Die folgenden Prozente beziehen sich auf die verbleibende Wertschöpfung, nicht auf den gesamten Umsatz.</span>
        </Knoten>
        <Pfeil />
        <Knoten schritt="2 · Gemeinsame Ausgangsbasis" titel="Wertschöpfung = 100 %" className="gf-hero">
          <strong className="gf-betrag">Beispiel: 1.000 €</strong>
          <span className="gf-meta">Frei gewähltes Rechenbeispiel, keine gemessenen Einnahmen. Prozentbasis: diese 1.000 €.</span>
        </Knoten>
        <Pfeil text="Zuerst die Mindestanteile reservieren" />
        <div className="gf-raster">
          <Knoten schritt="Von der Wertschöpfung" titel="Mindest-Rücklage" className="gf-abzweig gf-invest">
            <strong className="gf-anteil">10 % · 100 €</strong>
            <p>Gehört zur Reinvestition: Eigentum, Werkzeug und Aufbau.</p>
          </Knoten>
          <Knoten schritt="Von der Wertschöpfung" titel="Mindest-Sozialanteil" className="gf-abzweig gf-sozial">
            <strong className="gf-anteil">5 % · 50 €</strong>
            <p>Gehört zum Sozial- und Öko-Anteil: Menschen und Umwelt.</p>
          </Knoten>
        </div>
        <Pfeil text="Im Beispiel bleiben 850 €" />
        <Knoten schritt="3 · Vor jeder Überschussverteilung" titel="Gleicher Grundlohn für bezahlte Arbeit" className="gf-hero">
          <strong className="gf-betrag">Beispiel: 650 €</strong>
          <p>Einschließlich Arbeitgeberanteilen. Der tatsächliche Betrag richtet sich nach Lohn und bezahlten Stunden, nicht nach einem festen Prozentsatz.</p>
          <span className="gf-meta">Der Zielwert von 20 €/h brutto ist ein Planwert. Mindestlohn und gesetzliche Arbeitgeberpflichten gelten unabhängig von einem Bonus.</span>
        </Knoten>
        <Pfeil text="1.000 € − 100 € − 50 € − 650 €" />
        <Knoten schritt="4 · Nur was wirklich übrig bleibt" titel="Verteilbarer Überschuss" className="gf-hero">
          <strong className="gf-betrag">Beispiel: 200 €</strong>
          <p>Diese 200 € sind jetzt die neue Prozentbasis: 100 % des Überschusses.</p>
        </Knoten>
        <Pfeil text="Richtwert im Aufbau: 25 % + 50 % + 25 % = 100 %" />
        <div className="gf-raster gf-drei">
          <Knoten schritt="Vom Überschuss" titel="Bonus" className="gf-abzweig gf-bonus">
            <strong className="gf-anteil">25 % · 50 €</strong>
            <p>Bonus-Coins für die bezahlte Arbeit. Das Geld bleibt als gebundene Coin-Rücklage.</p>
            <span className="gf-meta">Aufbau-Korridor: 20–30 %</span>
          </Knoten>
          <Knoten schritt="Vom Überschuss" titel="Reinvestition" className="gf-abzweig gf-invest">
            <strong className="gf-anteil">50 % · 100 €</strong>
            <p>Gemeinsames Eigentum, Betriebsmittel und neue Möglichkeiten aufbauen.</p>
            <span className="gf-meta">Aufbau-Korridor: 40–60 %</span>
          </Knoten>
          <Knoten schritt="Vom Überschuss" titel="Soziales & Ökologie" className="gf-abzweig gf-sozial">
            <strong className="gf-anteil">25 % · 50 €</strong>
            <p>Solidarfonds zuerst. Danach soziale und ökologische Vorhaben.</p>
            <span className="gf-meta">Aufbau-Korridor: 20–30 %</span>
          </Knoten>
        </div>
        <div className="gf-summen">
          <strong>Alle 1.000 € bleiben nachvollziehbar</strong>
          <dl>
            <div><dt>Lohn einschließlich Arbeitgeberanteilen</dt><dd>650 €</dd></div>
            <div><dt>Bonus-Rücklage</dt><dd>50 €</dd></div>
            <div><dt>Reinvestition einschließlich 100 € Mindest-Rücklage</dt><dd>200 €</dd></div>
            <div><dt>Soziales & Ökologie einschließlich 50 € Mindestanteil</dt><dd>100 €</dd></div>
          </dl>
        </div>
        <p className="gf-hinweis"><strong>Kein Überschuss, kein Bonus:</strong> Die Reihenfolge bleibt wichtig. Läuft es schlechter, sinkt zuerst der Überschuss. Der Entwurf sieht danach den Einsatz freigegebener Rücklagen und gegebenenfalls künftig weniger vereinbarte Arbeitsstunden vor. Bereits geleistete Arbeit muss bezahlt werden. Es wird weder ein bestimmter Bonus noch eine bestimmte Anzahl künftiger Arbeitsstunden versprochen.</p>
      </div>

      <details className="gf-details">
        <summary>Später: ein Drittel je Topf – wann gilt das?</summary>
        <p>Im reifen System ist die Drittelung der Regelfall. Die Prozentbasis bleibt der Überschuss nach Mindestanteilen und Grundlohn.</p>
        <div className="gf-reife">
          <div><strong className="gf-anteil">⅓</strong>Bonus<br /><span className="gf-meta">Korridor: 33–40 %</span></div>
          <div><strong className="gf-anteil">⅓</strong>Reinvestition<br /><span className="gf-meta">Korridor: 27–35 %</span></div>
          <div><strong className="gf-anteil">⅓</strong>Soziales & Ökologie<br /><span className="gf-meta">Korridor: 27–35 %</span></div>
        </div>
        <p>Der Entwurf verlangt dafür mindestens 20 Vollmitglieder und sechs aufeinanderfolgende Halbjahre, in denen der jeweils geltende Ziellohn von zunächst 20 €/h getragen wird. Die Generalversammlung legt die konkrete Verteilung innerhalb der Korridore fest. Die drei Anteile müssen zusammen immer 100 % ergeben.</p>
      </details>

      <details className="gf-details">
        <summary>Wohin geht die Reinvestition weiter?</summary>
        <ul>
          <li><strong>Zellstärkung: 5 % des Reinvestitionsanteils</strong> nach der vorrangigen Zuführung zur Lohnreserve. Der Topf ruht, solange weniger als drei Zellen vorhanden sind.</li>
          <li><strong>Dach: Pflichtkosten und gemeinsame Investitionen.</strong> Die Grenze richtet sich nach dem höheren Wert aus 15 % des gesamten Reinvestitionsanteils oder den nachgewiesenen, nicht anderweitig gedeckten Pflichtkosten. Im Aufbau gilt zusätzlich eine Grenze von 1.000 € monatlich, soweit die Pflichtkosten nicht höher sind. Eine Beschlussregel kann diese Grenze anpassen.</li>
          <li><strong>Rest an die Zellen: im Aufbau 60 % Sockel / 40 % Wachstum.</strong> Der Sockel verteilt sich gleichmäßig auf berechtigte Zellen; Wachstum nach wirtschaftlich aktiven Mitgliedern.</li>
          <li><strong>Ideen-Topf: mindestens 10 % des jeweiligen Zellen-Anteils.</strong> Für neue Vorhaben. Die übrigen Mittel dienen unter anderem Werkzeug, Räumen und gemeinsamem Eigentum.</li>
        </ul>
        <p className="gf-hinweis">Das sind Unterverteilungen unterschiedlicher Töpfe. Sie werden nicht zu den Prozenten der Hauptgrafik addiert. Für die Lohnreserve ist hier kein pauschaler Prozentsatz angesetzt.</p>
      </details>

      <details className="gf-details">
        <summary>Solidarfonds: 7 % wovon?</summary>
        <ul>
          <li><strong>7 % der Grundlohn-Lohnsumme</strong> aus Gemeinschaftsbetrieben und Gemeinschaftsdiensten – Grundlohn × bezahlte Stunden. Die Arbeitgeberanteile gehören nicht zu dieser Prozentbasis.</li>
          <li><strong>Aus dem Sozial- und Öko-Anteil, nicht zusätzlich oben drauf.</strong> Die Zuführung ist auf den verfügbaren Sozial- und Öko-Anteil begrenzt. Die Quote kann angepasst werden, aber nach dem Entwurf nicht unter 5 %.</li>
          <li><strong>Gesetzliche Leistungen werden ergänzt.</strong> Der Fonds ist noch kein vorhandenes Versicherungs- oder Leistungsversprechen. Er zahlt erst nach den Startbedingungen des § 24 und nur aus vorhandenem Bestand.</li>
          <li><strong>Was danach bleibt:</strong> soziale und ökologische Projekte. Bei einer Verteilung an die Zellen ist 70 % Sockel / 30 % Wachstum vorgesehen, sofern nichts anderes beschlossen wird. Möglich sind auch gemeinsame oder überregionale Vorhaben.</li>
        </ul>
      </details>

      <details className="gf-details">
        <summary>Andere Geldwege: Beiträge, Anteile und Kredite</summary>
        <p>Diese Mittel haben eigene Zwecke. Sie sind keine zusätzlichen Prozentsätze der betrieblichen Wertschöpfung:</p>
        <div className="gf-raster">
          <Knoten titel="Geschäftsanteil & Direktkredite"><p>Geschäftsanteil: vorgesehen sind 100 € je Mitglied. Direktkredite haben eigene Verträge. Beides ist getrennt von Umsatz und Lohn zu behandeln; Einlage-, Rückzahlungs- und Kreditregeln werden rechtlich geprüft.</p></Knoten>
          <Knoten titel="Beitrag & Gemeinschaftsdienste"><p>Die vorgesehenen Beiträge tragen gemeinsame Pflichtkosten; bezahlte Dienste werden über Umlagen oder ihre Leistungspreise gedeckt. Ersparnis und Kosten sollen transparent gegenüberstehen.</p></Knoten>
          <Knoten titel="Lebensstandard-Fonds"><p>Ab zehn Vollmitgliedern sieht der Entwurf 5–10 % der typischen Ersparnis vor, zunächst 5 %; ruhende Mitgliedschaften sind ausgenommen. Für gemeinsame Lebensqualität, nicht für den laufenden Grundlohn.</p></Knoten>
          <Knoten titel="Qualifizierungsfonds"><p>Bis zu 20 % des Lebensstandard-Fonds können nach jährlichem Beschluss für benötigte Abschlüsse und Nachweise vorgesehen werden; hinzu kommen Rückzahlungen. Noch kein verfügbares Förderangebot.</p></Knoten>
        </div>
      </details>

      <details className="gf-details">
        <summary>Wo liegt das Geld: „Haus“ und „Fluss“?</summary>
        <div className="gf-raster">
          <Knoten titel="Haus · Rücklagen und längerfristige Mittel"><p>Vorgesehen sind Bankkonten mit gesetzlicher Einlagen- oder Institutssicherung. Hier liegen unter anderem Einlagen, Reserven, Direktkredite und der überwiegende Teil der Coin-Rücklage.</p></Knoten>
          <Knoten titel="Fluss · laufende Zahlungen"><p>Ein Zahlungskonto für Einnahmen und Auszahlungen. Der Puffer soll höchstens drei Monatsauszahlungen je Zelle umfassen; darüberliegende Mittel gehen ins Haus. Das ist eine Betragsgrenze, kein fester Umsatzprozentsatz.</p></Knoten>
        </div>
        <p><strong>Bonus-Coins sollen zu 100 % gedeckt bleiben.</strong> Die Rücklage wird nicht an der Börse angelegt und nicht verliehen. Das ist eine vorgesehene interne Deckungsregel, keine Garantie gegen einen Verlust und keine persönliche Einlagensicherung für Coins.</p>
        <p>Kontenmodell, Zahlungsdienstleister, Freigaben und rechtliche Sicherung sind noch zu prüfen. Vor der eG rechnet jede Person auf eigene Rechnung ab; die gemeinsame Keim-Kasse ruht bis zur Klärung.</p>
      </details>

      <figcaption id="geldfluss-quelle">Grundlage: Satzungsentwurf v7.35.0, insbesondere §§ 8a, 8b, 11, 12, 14a und 24; Konzept v22.49.3; Wirtschaften v3.15.1. Vereinfachte Darstellung des Entwurfs, keine bereits verfügbaren Leistungen. Die 1.000-Euro-Rechnung wurde nur gewählt, um die Prozentbasen sichtbar zu machen.</figcaption>
    </figure>
  </section>
}
