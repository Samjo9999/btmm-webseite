import { SectionReveal } from '@/components/AnimatedCounter'


export default function ImpressumPage() {
  return (
    <>
      <section style={{
        background: 'var(--btb-oliv)',
        padding: '4rem 1.5rem 3rem',
      }}>
        <div className="container-btb">
          <h1 style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: 'var(--btb-creme)',
          }}>
            Impressum & Datenschutz
          </h1>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--btb-weiss)' }}>
        <div className="container-btb" style={{ maxWidth: 800 }}>
          <SectionReveal>
            <div style={{ marginBottom: '4rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-garamond)',
                color: 'var(--btb-rot)',
                fontSize: '1.8rem',
                marginBottom: '1.5rem',
              }}>
                Impressum
              </h2>

              <div className="prose-btb">
                <h3>Angaben gemäß § 5 DDG (ehem. TMG)</h3>
                <p>
                  Johannes-Samuel Gartzke<br />
                  Hildastr. 12<br />
                  79102 Freiburg im Breisgau<br />
                  Deutschland
                </p>

                <h3>Kontakt</h3>
                <p>
                  E-Mail: back.to.balance.gartzke@gmail.com
                </p>

                <h3>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
                <p>
                  Johannes-Samuel Gartzke<br />
                  Hildastr. 12<br />
                  79102 Freiburg im Breisgau
                </p>

                <h3>EU-Streitschlichtung</h3>
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                  <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
                    https://ec.europa.eu/consumers/odr/
                  </a>
                  <br />
                  Unsere E-Mail-Adresse finden Sie oben im Impressum.
                </p>

                <h3>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h3>
                <p>
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
                  Verbraucherschlichtungsstelle teilzunehmen.
                </p>

                <h3>Haftung für Inhalte</h3>
                <p>
                  Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten
                  nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als
                  Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                  Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
                  Tätigkeit hinweisen.
                </p>
                <p>
                  Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
                  allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
                  erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
                  Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
                  entfernen.
                </p>

                <h3>Haftung für Links</h3>
                <p>
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
                  Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
                  übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
                  Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
                  Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum
                  Zeitpunkt der Verlinkung nicht erkennbar.
                </p>
                <p>
                  Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
                  Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
                  Rechtsverletzungen werden wir derartige Links umgehend entfernen.
                </p>

                <h3>Urheberrecht</h3>
                <p>
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
                  dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
                  der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
                  Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind
                  nur für den privaten, nicht kommerziellen Gebrauch gestattet.
                </p>
                <p>
                  Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die
                  Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
                  gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
                  bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
                  werden wir derartige Inhalte umgehend entfernen.
                </p>

                <h3>Hinweis zur Körperarbeit</h3>
                <p>
                  Die angebotene Körperarbeit ist eine Wellnessmethode und ersetzt keine medizinische
                  Behandlung, Diagnose oder Therapie. Bei gesundheitlichen Beschwerden konsultieren Sie
                  bitte einen Arzt oder Heilpraktiker. Es werden keine Heilversprechen gegeben.
                </p>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.15}>
            <div id="datenschutz">
              <h2 style={{
                fontFamily: 'var(--font-garamond)',
                color: 'var(--btb-rot)',
                fontSize: '1.8rem',
                marginBottom: '1.5rem',
              }}>
                Datenschutzerklärung
              </h2>

              <div className="prose-btb">
                <h3>1. Datenschutz auf einen Blick</h3>
                <h4>Allgemeine Hinweise</h4>
                <p>
                  Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
                  personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
                  Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                  Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem
                  Text aufgeführten Datenschutzerklärung.
                </p>

                <h4>Datenerfassung auf dieser Website</h4>
                <p>
                  <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
                  Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
                  Kontaktdaten können Sie dem Abschnitt &bdquo;Hinweis zur verantwortlichen Stelle&ldquo; in dieser
                  Datenschutzerklärung entnehmen.
                </p>
                <p>
                  <strong>Wie erfassen wir Ihre Daten?</strong><br />
                  Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z. B. über
                  das Kontaktformular). Andere Daten werden automatisch oder nach Ihrer Einwilligung beim
                  Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten
                  (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
                </p>
                <p>
                  <strong>Wofür nutzen wir Ihre Daten?</strong><br />
                  Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
                  gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
                </p>

                <h3>2. Hosting</h3>
                <p>
                  Wir hosten die Inhalte unserer Website bei Vercel Inc., 340 Pine Street, Suite 701,
                  San Francisco, CA 94104, USA. Vercel ist Auftragsverarbeiter gemäß Art. 28 DSGVO.
                  Details zum Datenschutz bei Vercel finden Sie unter:{' '}
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                    https://vercel.com/legal/privacy-policy
                  </a>
                </p>
                <p>
                  Die Verwendung von Vercel erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir
                  haben ein berechtigtes Interesse an einer möglichst zuverlässigen Darstellung unserer
                  Website. Der Datentransfer in die USA wird durch die EU-Standardvertragsklauseln
                  abgesichert.
                </p>

                <h3>3. Allgemeine Hinweise und Pflichtinformationen</h3>
                <h4>Datenschutz</h4>
                <p>
                  Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
                  Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den
                  gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                </p>
                <p>
                  Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der
                  Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz
                  der Daten vor dem Zugriff durch Dritte ist nicht möglich.
                </p>

                <h4>Hinweis zur verantwortlichen Stelle</h4>
                <p>
                  Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
                  Johannes-Samuel Gartzke<br />
                  Hildastr. 12<br />
                  79102 Freiburg im Breisgau<br /><br />
                  E-Mail: back.to.balance.gartzke@gmail.com
                </p>
                <p>
                  Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder
                  gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von
                  personenbezogenen Daten entscheidet.
                </p>

                <h4>Speicherdauer</h4>
                <p>
                  Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt
                  wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die
                  Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen
                  oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht,
                  sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer
                  personenbezogenen Daten haben.
                </p>

                <h4>Ihre Rechte</h4>
                <p>
                  Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und
                  Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein
                  Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine
                  Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese jederzeit für die
                  Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die
                  Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des
                  Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
                </p>
                <p>
                  Die zuständige Aufsichtsbehörde ist:<br />
                  Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit
                  Baden-Württemberg<br />
                  Lautenschlagerstraße 20, 70173 Stuttgart<br />
                  <a href="https://www.baden-wuerttemberg.datenschutz.de" target="_blank" rel="noopener noreferrer">
                    www.baden-wuerttemberg.datenschutz.de
                  </a>
                </p>

                <h3>4. Datenerfassung auf dieser Website</h3>
                <h4>Cookies</h4>
                <p>
                  Diese Website verwendet keine Tracking-Cookies und kein Analytics-Tracking. Es werden
                  ausschließlich technisch notwendige Daten verarbeitet (z. B. Sprachpräferenz).
                </p>

                <h4>Server-Log-Dateien</h4>
                <p>
                  Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten
                  Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
                </p>
                <ul>
                  <li>Browsertyp und Browserversion</li>
                  <li>verwendetes Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>Uhrzeit der Serveranfrage</li>
                  <li>IP-Adresse</li>
                </ul>
                <p>
                  Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
                  Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
                </p>

                <h4>Kontaktformular</h4>
                <p>
                  Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem
                  Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks
                  Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
                  Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Verarbeitung dieser
                  Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Die E-Mail-Zustellung
                  erfolgt über den Dienst Resend (Resend Inc., USA).
                </p>

                <h4>Terminbuchung</h4>
                <p>
                  Bei der Online-Terminbuchung werden folgende Daten erhoben: Name, E-Mail-Adresse,
                  optional Telefonnummer und Anmerkungen. Diese Daten werden ausschließlich zur
                  Terminverwaltung und zum Versand von Bestätigungs- und Erinnerungs-E-Mails verwendet.
                  Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Die Daten werden
                  nach Ablauf der steuerlichen Aufbewahrungsfrist (10 Jahre) gelöscht, sofern keine
                  anderen rechtlichen Gründe entgegenstehen.
                </p>

                <h4>Supabase</h4>
                <p>
                  Für die Terminbuchung und Datenverwaltung nutzen wir Supabase (Supabase Inc., USA)
                  als Auftragsverarbeiter gemäß Art. 28 DSGVO. Personenbezogene Buchungsdaten (Name,
                  E-Mail, Telefon) werden in der Supabase-Datenbank gespeichert. Der Datentransfer
                  in die USA wird durch EU-Standardvertragsklauseln abgesichert. Weitere Informationen:{' '}
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                    https://supabase.com/privacy
                  </a>
                </p>

                <h4>Brevo (E-Mail-Versand)</h4>
                <p>
                  Für den Versand von Buchungsbestätigungen und Erinnerungs-E-Mails nutzen wir den
                  Dienst Brevo (Sendinblue GmbH, Köln). Dabei wird Ihre E-Mail-Adresse und Ihr Name
                  an Brevo übermittelt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
                  (Vertragserfüllung). Brevo ist Auftragsverarbeiter gemäß Art. 28 DSGVO. Weitere
                  Informationen:{' '}
                  <a href="https://www.brevo.com/de/legal/privacypolicy/" target="_blank" rel="noopener noreferrer">
                    https://www.brevo.com/de/legal/privacypolicy/
                  </a>
                </p>

                <h3>5. Externe Dienste</h3>
                <h4>Google Fonts (lokal)</h4>
                <p>
                  Diese Seite nutzt Google Fonts, die lokal über Next.js eingebunden werden. Es findet
                  keine Verbindung zu Servern von Google statt.
                </p>

                <h4>OpenStreetMap / Leaflet</h4>
                <p>
                  Für die Darstellung der Zellen-Karte nutzen wir OpenStreetMap-Kartenmaterial über
                  Leaflet. Beim Laden der Karte werden Kartenkacheln von OpenStreetMap-Servern geladen.
                  Dabei wird Ihre IP-Adresse an OpenStreetMap übermittelt. Weitere Informationen finden
                  Sie in der{' '}
                  <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">
                    Datenschutzerklärung von OpenStreetMap
                  </a>.
                </p>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
