/* BtMM-Universum – Daten für den Prototyp (universum-tuer-v2.2, 17.11.2026; Sp.138 info+Chips 18.11.2026; Sp.135 p/w.chronik-Kalibrierung r3)
   Alle Inhalte aus den BtMM-Dokumenten (Stand 17.11.2026). Kürzel der Quellen siehe BTMM.QUELLEN und QUELLEN.md.
   Fragen und Gewichte: vom Design-Bot aus den Dokumenten abgeleitet (Wegweiser in Dok. 00 u. a.), Ja des Nutzers offen. */

var BTMM = window.BTMM = {};

BTMM.KONTAKT = 'office@b-t-m-m.com'; /* Webseite master, data/contact.json – Abweichung zu den Dokumenten siehe QUELLEN.md */

/* Fragenzahl-Regler (Nutzer 17.11. 22:59 + BtMM-Bot max 24) */
BTMM.FRAGEN_MIN = 5;
BTMM.FRAGEN_DEFAULT = 10;
BTMM.FRAGEN_MAX = 24; /* vorläufig entschieden BtMM-Bot 17.11.; Kernfragen ohne Vertiefungs-Duplikate */

BTMM.QUELLEN = {
  D00: '00 BtMM einfach erklärt v1.14.0',
  D01: '01 Einführung v4.18.1',
  D02: '02 Aufruf zur Beteiligung v2.11.0 (17.11.2026)',
  D28: '28 So wirst du Mitglied v1.7.0',
  S: '08 Satzung, Außenfassung v9.1.2, Entwurf (17.11.2026)',
  O: '08a Ordnungen v2.0.2, Entwurf (17.11.2026)',
  BP: 'Businessplan, Entwurf v0.1.11 (17.11.2026)',
  KA: 'Webseite master, messages/de/koerperarbeit.json'
};

/* Kurzform für die Anzeige im Ablauf */
BTMM.QKURZ = { D00: 'Dok. 00', D01: 'Dok. 01', D02: 'Dok. 02', D28: 'Dok. 28', S: 'Satzung-Entwurf v9.1.2', O: 'Ordnung-Entwurf v2.0.2', BP: 'Businessplan-Entwurf', KA: 'Webseite, Körperarbeit' };


/* Ablauf-Copy aus TEXTE-AUFklaerung-Werbung-2026-11-17.md (Autor-Bot, Flyer-Stil 17.11.) */
BTMM.COPY = {
  "tuer": {
    "h1": "Tritt ein – in deinem Tempo",
    "lead": "Hinter dieser einfachen Tür liegt Back to Meaning Maximization, kurz BtMM: eine Idee, die erst im Alltag entsteht und so bald wie möglich als Genossenschaft gegründet werden soll, sobald drei Mitglieder da sind. Noch ist nichts eingetragen. Es gibt kein Formular, keinen Bezahlknopf und keinen Druck, sofort zu entscheiden.",
    "body": "Was dich erwartet, ist ruhig und klar. Du beantwortest ein paar Fragen, so viele oder so wenige, wie du möchtest. Danach führt dich die Seite Schritt für Schritt dorthin, was für dich gerade passt: wie Teilen und gemeinsames Arbeiten funktionieren, was du sparen kannst, wie Zellen vor Ort aussehen, oder wie du später mitmachen kannst. Immer nur ein Schritt. Immer mit der Wahl, wohin es als Nächstes geht.",
    "fein": "Wenn du willst, öffnest du die Tür später einfach erneut. Kein Zwang, kein Abschluss.",
    "eckdaten": [
      "Was: geführter Einstieg in BtMM",
      "Cookie: erst danach, und nur ein kleines Flag „durchlaufen“",
      "Antworten: nur im Arbeitsspeicher dieses Besuchs — kein Profil, keine Auswertung für Dritte",
      "Danach: normale Startseite, sortiert nach dem, was dir wichtig war"
    ],
    "schluss": "Wenn du willst, öffnest du die Tür später einfach erneut. Kein Zwang, kein Abschluss.",
    "hinweis": "BtMM ist noch nicht eingetragen. Die Genossenschaft wird so bald wie möglich gegründet, sobald drei Mitglieder da sind. Dies ist ein Entwurf zum Einbau, nicht veröffentlicht und nicht rechtssicher.",
    "cta": "Eintreten"
  },
  "anzahl": {
    "h1": "Wie tief willst du heute gehen?",
    "lead": "Bevor der erste Schritt kommt, stellst du mit dem Schieberegler die Zahl der Schritte ein. Voreingestellt und empfohlen sind 10. Das reicht, um dich abzuholen und die wichtigsten Wege zu öffnen, ohne dich zu überfordern.",
    "warum": "Du kannst weniger wählen, wenn du nur einen kurzen Eindruck willst. Oder mehr, wenn du heute weiter gehen möchtest. Im Hintergrund stehen viele dokumentgestützte Schritte bereit. Du siehst davon kein Netz und keine lange Liste — nur die Zahl, die du gerade brauchst.",
    "warumRegler": "Der Regler macht eine einzige Entscheidung greifbar: Wie weit will ich heute gehen? Die Empfehlung bei zehn bleibt sichtbar, damit du einen ruhigen Ausgangspunkt hast. Die Wahl bleibt bei dir. Die Seite baut sich an dir entlang, nicht umgekehrt.",
    "eckdaten": [
      "Steuerung: Schieberegler",
      "Empfohlen / Default: 10 Schritte",
      "Weniger: kurzer Eindruck",
      "Mehr: tieferer Durchlauf heute",
      "Oberfläche: immer nur Zahl und nächster Schritt — kein Netz"
    ],
    "schluss": "Zehn Schritte sind ein guter Mittelweg: genug, damit die nächsten Inhalte zu dir passen, und kurz genug, dass du danach noch Lust hast, weiterzulesen.",
    "hinweis": "Im Besucherstext keine Maximalzahl als Zusage. Das interne Netz ist nur fürs Team, nicht für dich sichtbar.",
    "cta": "Weiter mit 10",
    "labelEmpfohlen": "10 empfohlen"
  },
  "meta": {
    "h1": "Ein Schritt nach dem anderen",
    "kurz": "Jeder Schritt ist absichtlich klein. Mal ist es eine Frage mit wenigen Antworten. Mal ist es eine kurze Inhaltsseite zu einem Thema, das zu dem passt, was du gerade gesagt hast. Danach wählst du den nächsten Schritt. Nicht mehr, nicht weniger.",
    "info": "So entsteht kein Labyrinth und keine lange Liste. Die Seite nimmt mit, was du schon gewählt hast, und schlägt vor, was als Nächstes Sinn ergibt. Du kannst von einer inneren Schale wieder nach außen springen, wenn du etwas Grundlegendes noch einmal brauchst. Und du kannst tiefer gehen, wenn du bereit bist. Es fühlt sich an wie ein ruhiges Gespräch: eine Frage, eine Antwort, ein nächster Vorschlag. Was dich nicht interessiert, bleibt im Hintergrund.",
    "eckdaten": [
      "Pro Schritt: eine Frage oder eine kurze Inhaltsseite",
      "Danach: Wahl des nächsten Schritts",
      "Ziel: verstehen, worum es bei BtMM geht — und eine Startseite, die zu dir passt"
    ],
    "schluss": "Das Ziel ist nicht, dich durch alles zu schicken. Das Ziel ist, dass du am Ende weißt, worum es geht, und dass die normalen Seiten danach in einer Reihenfolge stehen, die zu dir passt.",
    "hinweis": "Meta-Erklärung für den Ablauf — kein Inhaltsversprechen und keine Erfahrungsberichte."
  },
  "wahl": {
    "h1": "Du behältst die Wahl",
    "lead": "Nach jedem Einzelschritt siehst du zwei bis vier Möglichkeiten. Eine führt oft tiefer in das Thema, das du gerade berührt hast. Eine andere öffnet etwas Benachbartes. Manchmal führt eine Option bewusst nach außen, zurück zu den einfachen Worten, auch wenn du schon innen warst.",
    "mehr": "Das ist Absicht. Interesse entsteht nicht immer in einer geraden Linie. Manchmal brauchst du erst die Zahlen, bevor das Konzept sitzt. Manchmal willst du wissen, wie Mitmachen aussieht, bevor du den Geldfluss liest. Die Wahl liegt bei dir. Die drei Schalen „Worum es geht“, „Wie es läuft“ und „Wie du dabei bist“ helfen im Hintergrund bei der Sortierung. Für dich zählen die konkreten Optionen auf dem Bildschirm.",
    "eckdaten": [
      "Optionen: 2–4 nach jedem Schritt",
      "Sprünge: auch zwischen den Schalen möglich",
      "Ende des Durchlaufs: Startseite mit deinen Schwerpunkten — keine Prüfung"
    ],
    "schluss": "Wähle, was sich jetzt richtig anfühlt. Am Ende steht keine Prüfung, sondern eine Startseite, die deine Schwerpunkte kennt.",
    "hinweis": "Kein Zwangspfad. Die Schalen sortieren im Hintergrund; du siehst nur die Optionen.",
    "cta": "Nächsten Schritt wählen"
  },
  "ki": {
    "h1": "Klar und ohne Magie",
    "lead": "Heute wählt eine klare Regel, was als Nächstes kommt. Deine bisherigen Antworten verschieben Gewichte: Themen, die du stark gewählt hast, rücken vor. Themen, die du ausgelassen hast, rücken zurück. Das ist nachvollziehbar und lokal im Browser. Es gibt keinen geheimen Score und keine Persönlichkeitsdiagnose.",
    "netz": "Du siehst kein Spinnennetz. Das Netz ist ein internes Modell für das Team. Du siehst immer nur den einen Schritt und die Wahl danach.",
    "spaeter": "Später kann eine Schnittstelle denselben Auftrag übernehmen: aus deinen Antworten den nächsten sinnvollen Schritt vorschlagen. Auch dann bleiben die Antworten in der Sitzung. Sie werden nicht als Profil gespeichert. Das Cookie speichert nur das Flag „durchlaufen“, nichts von dem, was du gesagt hast.",
    "eckdaten": [
      "Heute: regelbasierte Auswahl im Browser",
      "Später optional: Schnittstelle mit demselben Auftrag",
      "Cookie: nur Flag „durchlaufen“",
      "Kein Profil, kein geheimer Score"
    ],
    "schluss": "Wenn die Schnittstelle fehlt oder zu lange braucht, greift wieder die regelbasierte Auswahl. Die Seite verspricht keine allwissende Maschine — sie hilft dir, den Weg zu finden, der zu dir passt.",
    "hinweis": "Kein Spinnennetz in der Oberfläche. Keine Persönlichkeitsdiagnose. Antworten bleiben in der Sitzung.",
    "cta": "Verstanden · weiter im Ablauf"
  },
  "normal": {
    "h1": "Angekommen — und jederzeit wieder",
    "lead": "Wenn dein Durchlauf fertig ist, öffnet sich die normale Startseite. Die Bereiche stehen sortiert: außen die einfachen Einstiege, in der Mitte Arbeit, Geld und Konzept, innen Mitmachen, Unterstützen und Gründung. Was für dich stark gewichtet war, liegt oft weiter vorn. Du kannst jede Seite in Ruhe lesen, ohne Fragen.",
    "mehr": "Oben oder an klarer Stelle findest du Tür erneut öffnen. Dann startest du den geführten Weg noch einmal. Deine alten Antworten aus dem Arbeitsspeicher fallen weg. Das Flag „durchlaufen“ kann bleiben, damit die Seite weiß, dass du schon einmal da warst. Mit dem Session-Cookie startest du beim Wiederkommen direkt auf der Startseite. Willst du den Einstieg trotzdem noch einmal, reicht „Tür erneut öffnen“. Für einen kompletten Neustart inklusive Flag gibt es den Reset-Weg der Seite.",
    "tuer": "Oben oder an klarer Stelle findest du Tür erneut öffnen. Dann startest du den geführten Weg noch einmal. Deine alten Antworten aus dem Arbeitsspeicher fallen weg. Das Flag „durchlaufen“ kann bleiben, damit die Seite weiß, dass du schon einmal da warst.",
    "eckdaten": [
      "Nach dem Durchlauf: normale Startseite",
      "Aktion: Tür erneut öffnen",
      "Wiederkehr: mit Cookie direkt Startseite",
      "Reset: kompletter Neustart inklusive Flag"
    ],
    "schluss": "Der Normalmodus ist der Alltag der Website: informieren, nachlesen, Kontakt aufnehmen. Der Tür-Weg bleibt die Einladung für alle, die erst ankommen.",
    "hinweis": "Antworten aus dem Durchlauf werden nicht als Profil gespeichert. Nur das Flag „durchlaufen“ kann bleiben.",
    "cta1": "Bereiche entdecken",
    "cta2": "Tür erneut öffnen"
  }
};

/* Schalen von außen nach innen */
BTMM.SCHALEN = [
  { id: 'aussen', name: 'Worum es geht', kurz: 'außen', text: 'Die Idee in einfachen Worten.' },
  { id: 'mitte', name: 'Wie es läuft', kurz: 'Mitte', text: 'Arbeit, Geld, Zellen und Kosten.' },
  { id: 'innen', name: 'Wie du dabei bist', kurz: 'innen', text: 'Mitmachen, unterstützen, gründen.' }
];

/* 14 Bereiche – Autor-Texte Flyer-Stil 17.11.2026 (TEXTE-AUFklaerung-Werbung). HWG-Korrektur Recht bleibt. */
BTMM.BEREICHE = [
  {
    "id": "so-funktionierts",
    "titel": "So funktioniert's",
    "schale": "aussen",
    "kurz": "Teilen, arbeiten zum gleichen Lohn für jede Stunde, besitzen, was nie verkauft wird. Erst leben, dann gründen — so bald wie möglich, sobald drei Mitglieder da sind.",
    "abschnitte": [],
    "quelle": "D00; BP",
    "h1": "Drei Säulen — klar und nah",
    "lead": [
      "BtMM ruht auf drei Säulen. Teilen: Einkauf, Carsharing, Räume, Werkzeug und Buchhaltung gemeinsam nutzen. Jede und jeder behält das eigene Einkommen. Arbeiten: In einem Betrieb der Gemeinschaft bekommt jede Stunde denselben Lohn, egal welche Arbeit. Besitzen: Häuser, Land und Werkstätten gehören allen und werden nie verkauft. Die Miete deckt nur die Kosten.",
      "Gibt es schon ein faires, ökologisches Angebot, nutzen wir es und kaufen dort gemeinsam ein. Selbst gebaut wird nur, was fehlt. Am Anfang reicht das oft: gemeinsam einkaufen, Stunden tauschen, ganz ohne Genossenschaft. Jede und jeder kauft auf eigene Rechnung. Es gibt keine gemeinsame Kasse."
    ],
    "eckdaten": [
      "Säulen: Teilen · Arbeiten · Besitzen",
      "Grundsatz: Nutzen, was gut ist. Bauen, wo etwas fehlt.",
      "Gründung: so bald wie möglich, sobald drei Mitglieder da sind",
      "Bis dahin: Alltag zuerst, ohne Eintragung"
    ],
    "schluss": "Die Genossenschaft selbst wird so bald wie möglich gegründet, sobald drei Mitglieder da sind. Bis dahin entsteht der Alltag zuerst. Du kannst die Logik schon leben, bevor etwas eingetragen ist — melde dich, wenn du mitbauen willst.",
    "hinweis": "Noch nicht eingetragen. Gründung so bald wie möglich, sobald drei Mitglieder da sind. Keine gemeinsame Kasse in der Vor-Phase; jede und jeder auf eigene Rechnung.",
    "cta": "Weiter zu Was du sparst · oder FAQ"
  },
  {
    "id": "was-du-sparst",
    "titel": "Was du sparst",
    "schale": "aussen",
    "kurz": "Zu dritt rund 240 € im Monat je Person — Modellrechnung, keine Zusage. Dein Beitrag darf nie größer sein als das, was du sparst.",
    "abschnitte": [],
    "quelle": "D02; D00; D28",
    "h1": "Was entstehen kann — als Modell, nicht als Zusage",
    "lead": [
      "Schon zu dritt kann gemeinsamer Einkauf beim Bio-Großhandel und Zeit-Tausch jeder Person rund 240 € im Monat bringen. Das ist eine Modellrechnung, keine Zusage. Wer zusammenzieht, spart in derselben Rechnung noch rund 250 € Miete. Zu fünft liegen die Zahlen bei rund 290 € im Monat. Bei 20 Mitgliedern zeigt das Modell rund 29 Stunden weniger Arbeit im Monat.",
      "Dein Beitrag darf nie größer sein als das, was du sparst. Die Waage bleibt sichtbar. Alle Zahlen stehen auf offen genannten Annahmen. Mit dem Rechner „00 BtMM einfach gerechnet“ kannst du mit deinen eigenen Zahlen nachrechnen."
    ],
    "eckdaten": [
      "Zu dritt (Modell): ca. 240 € / Monat je Person",
      "Mit Zusammenziehen (Modell): plus ca. 250 € Miete",
      "Zu fünft (Modell): ca. 290 € / Monat",
      "Bei 20 (Modell): ca. 29 Stunden weniger Arbeit / Monat",
      "Regel: Beitrag ≤ Ersparnis (Waage)"
    ],
    "schluss": "Ehrlich gesagt: Prognosen gibt es hier nicht. Was zählt, ist, dass du siehst, wo Entlastung entstehen kann, und dass du selbst prüfst, ob die Annahmen zu deinem Leben passen.",
    "hinweis": "Alle Spar-Zahlen sind Modellrechnungen auf offen genannten Annahmen — keine Prognose und keine Garantie.",
    "cta": "Rechner nutzen (wenn verlinkt) · weiter zu FAQ oder Kosten"
  },
  {
    "id": "faq",
    "titel": "FAQ",
    "schale": "aussen",
    "kurz": "Kurze Antworten: Gibt es BtMM schon, was riskiere ich, wie komme ich raus?",
    "abschnitte": [
      {
        "h": "Gibt es BtMM schon?",
        "t": "Bisher auf dem Papier und in der Rechnung, noch nicht im Alltag. Gegründet wird so bald wie möglich, sobald drei Mitglieder da sind. Die Genossenschaft ist noch nicht eingetragen.",
        "q": "D02, „Kurz gesagt“; BP, Weg A"
      },
      {
        "h": "Was riskiere ich als Mitglied?",
        "t": "Höchstens deinen Anteil. Nachschüsse gibt es nicht.",
        "q": "S, § 2 Abs. 4"
      },
      {
        "h": "Wie komme ich wieder raus?",
        "t": "Mit einem Jahr Frist zum Ende des Geschäftsjahres.",
        "q": "S, § 6 Abs. 1"
      },
      {
        "h": "Wie viel habe ich zu sagen?",
        "t": "Jedes Mitglied hat eine Stimme.",
        "q": "S, § 5 Abs. 4"
      },
      {
        "h": "Muss ich in Freiburg wohnen?",
        "t": "Nur die ersten drei, weil ein Betrieb drei Menschen braucht, die zusammen arbeiten. Alle anderen können überall sein.",
        "q": "D02, „Von weitem dabei“"
      },
      {
        "h": "Kann ich vor der Eintragung etwas geben?",
        "t": "Vor der Eintragung nimmt niemand Spenden an. Geld fließt nur für Leistungen, die du wirklich bekommst.",
        "q": "D02, „Spenden“"
      }
    ],
    "quelle": "D02; S; BP",
    "h1": "Kurze Antworten auf die ersten Fragen",
    "lead": [],
    "eckdaten": [
      "Stand: noch nicht eingetragen; Gründung so bald wie möglich, sobald drei Mitglieder da sind",
      "Risiko (nach Eintragung): höchstens der Anteil; keine Nachschüsse",
      "Stimme: eine je Mitglied",
      "Kontakt: office@b-t-m-m.com"
    ],
    "schluss": "Diese Fragen bleiben bewusst kurz. Wer tiefer lesen will, findet Satzungsentwurf, Ordnungen und Erklärdokumente unter Dokumente. Wenn etwas offen bleibt: melde dich.",
    "hinweis": "Vor der Eintragung keine Spendenannahme. FAQ ersetzt keine Rechtsberatung; Satzung ist Entwurf.",
    "cta": "Zu Mitmachen · oder Offene Fragen"
  },
  {
    "id": "koerperarbeit",
    "titel": "Körperarbeit",
    "schale": "mitte",
    "kurz": "Körperarbeit zur Entspannung und zum Wohlbefinden — erstes Geschäftsfeld der geplanten Genossenschaft. Heute unter dem Namen Back to Balance.",
    "abschnitte": [],
    "quelle": "KA; S; BP",
    "h1": "Zur Ruhe kommen — der erste Betrieb",
    "lead": [
      "Körperarbeit zur Entspannung und zum Wohlbefinden ist das erste Geschäftsfeld der geplanten Genossenschaft. Heute gibt es das Angebot unter dem Namen Back to Balance. Du liegst bekleidet auf einer bequemen Liege. Sanfte Schwingungen laden dazu ein, den ganzen Körper von den Zehen bis zur Nasenspitze bewusst wahrzunehmen.",
      "Für Menschen jeden Alters. Für alle, die zur Ruhe kommen möchten. Für Menschen, die viel sitzen und einen Ausgleich suchen.",
      "Viele berichten direkt danach von Wohlbefinden, Leichtigkeit und einem Gefühl von Gleichgewicht. Manche bemerken das noch an den folgenden Tagen."
    ],
    "eckdaten": [
      "Angebot heute: Back to Balance",
      "Form: bekleidet auf der Liege; sanfte Schwingungen",
      "Rolle für BtMM: erstes Geschäftsfeld der geplanten Genossenschaft",
      "Weiter: Kosten · Gründung"
    ],
    "schluss": "Für BtMM ist dieser Betrieb der konkrete Anfang: ein Angebot, das Menschen schon jetzt nutzen können, und zugleich der erste Baustein der späteren Genossenschaft. Wenn du mehr dazu wissen willst, lies weiter oder melde dich.",
    "hinweis": "Die Körperarbeit ersetzt keine medizinische oder psychotherapeutische Behandlung. Bei ungeklärten Beschwerden bitte von einer Ärztin oder einem Arzt abklären lassen.",
    "cta": "Mehr zu Kosten · oder Gründung"
  },
  {
    "id": "zellen",
    "titel": "Zellen",
    "schale": "mitte",
    "kurz": "Eine Zelle ist eine Gruppe vor Ort: Teil der Genossenschaft, ohne eigene Kasse und ohne eigene Währung.",
    "abschnitte": [],
    "quelle": "D02; S; O; D01",
    "h1": "Nähe vor Ort — Teil von einem Ganzen",
    "lead": [
      "Sobald an einem Ort drei Menschen anfangen wollen, machen wir sie miteinander bekannt. Aus jeder Dreiergruppe kann ein Keim werden und später eine Zelle derselben Genossenschaft. Eine Zelle ist ein unselbstständiger Teil: keine eigene Rechtsform, keine eigene Kasse, keine eigenen Konten, keine eigene Währung. Mitglied bist du in der Genossenschaft, nicht in einem Parallelverein.",
      "Was eine Zelle selbst regeln kann, regelt sie selbst. Zugleich berichtet jede Zelle über Versammlungen und Mittel. Mitglieder können Einsicht nehmen. So bleibt Nähe vor Ort und Verbindlichkeit nach innen."
    ],
    "eckdaten": [
      "Start: drei Menschen am selben Ort",
      "Zelle: unselbstständiger Teil derselben Genossenschaft",
      "Nicht: eigene Rechtsform, Kasse, Konten, Währung",
      "Mitgliedschaft: in der Genossenschaft"
    ],
    "schluss": "Zellen sind der Weg, wie die Idee an vielen Orten wachsen kann, ohne sich in getrennte Inseln zu teilen. Du bleibst Teil von einem Ganzen, auch wenn dein Alltag lokal ist — melde dich, wenn du einen Keim suchst.",
    "hinweis": "Keine Parallelvereine. Zellen haben keine eigene Kasse und keine eigene Währung.",
    "cta": "Zu Mitmachen · oder Geldfluss"
  },
  {
    "id": "geldfluss",
    "titel": "Geldfluss",
    "schale": "mitte",
    "kurz": "Erst der Lohn, mindestens Mindestlohn. Dann die Rücklage. Über den Rest entscheiden die Mitglieder.",
    "abschnitte": [],
    "quelle": "O; S; D00; D01",
    "h1": "Lohn zuerst — dann der Rest",
    "lead": [
      "Zuerst kommt der Lohn. Wer angestellt ist, bekommt mindestens den gesetzlichen Mindestlohn. Der Lohn hängt nicht vom Ergebnis ab und wird nicht nur aus einem Überschuss gezahlt. Ziel ist derselbe Lohn für jede Stunde.",
      "Dann kommt die Rücklage. Mindestens 10 % des Jahresüberschusses gehen in die Rücklage, bis sie 10 % der Bilanzsumme erreicht. Über den Rest, etwa eine Rückvergütung, beschließt die Generalversammlung. Im Konzept stehen dabei Bonus für alle, die gearbeitet haben, Mittel für Häuser und Werkzeug sowie Mittel für soziale und ökologische Projekte.",
      "Liegen Ergebnis oder Liquidität sechs Monate unter Plan, beruft der Vorstand die Generalversammlung ein. Bis dahin keine neuen Kredite und Investitionen. Das ist die Bremse, die verhindert, dass Hoffnung die Zahlen überholt."
    ],
    "eckdaten": [
      "1. Lohn (mind. gesetzlicher Mindestlohn; Ziel: gleiche Stunde)",
      "2. Rücklage (≥ 10 % des Jahresüberschusses, bis 10 % der Bilanzsumme)",
      "3. Rest: Beschluss der Generalversammlung",
      "Notfall: 6 Monate unter Plan → Generalversammlung; bis dahin keine neuen Kredite/Investitionen"
    ],
    "schluss": "Klarheit vor Optimismus: Die Reihenfolge steht fest, damit Zahlen und Hoffnung nicht die Plätze tauschen. Wenn du nachrechnen willst, lies Kosten und Offene Fragen.",
    "hinweis": "Konzept und Entwurf — nicht rechtssicher. Keine Zusage zu Bonus oder Ausschüttung.",
    "cta": "Zu Kosten · oder Offene Fragen"
  },
  {
    "id": "kosten",
    "titel": "Kosten",
    "schale": "mitte",
    "vorziehbar": true,
    "kurz": "Vor der Eintragung nur Geld für Leistungen. Danach 100 € Anteil, auf Wunsch in Raten ab 10 €. Keine Nachschüsse.",
    "abschnitte": [],
    "quelle": "D02; S; D00; D01",
    "h1": "Was Geld hier bedeutet",
    "lead": [
      "Bis zur Eintragung fließt nur Geld für Leistungen, die du bekommst. Für alles andere werden Zusagen gesammelt. Es gibt keinen öffentlichen Bezahlweg für Anteile und keinen Aufruf, jetzt Geld zu hinterlegen.",
      "Nach der Eintragung gilt im Entwurf: 100 € je Anteil, sofort oder in Raten ab 10 € im Monat, spätestens nach zehn Monaten voll eingezahlt. Weitere Anteile nur mit Zustimmung des Vorstands, höchstens zehn. Laufende Beiträge zahlt nur, wer die gemeinsamen Einrichtungen nutzt. Der Beitrag soll nie höher sein als die Ersparnis."
    ],
    "eckdaten": [
      "Vor Eintragung: nur Geld für Leistungen, die du bekommst; keine Spendenannahme",
      "Nach Eintragung (Entwurf): 100 € je Anteil; Raten ab 10 € / Monat; voll in 10 Monaten",
      "Weitere Anteile: nur mit Vorstandszustimmung, höchstens zehn",
      "Keine Nachschüsse; Anteile sind Bekenntnis, kein Investment"
    ],
    "schluss": "Wenn du zu den ersten gehören willst, melde dich — nicht, weil ein Bezahlknopf wartet, sondern weil der Ort noch formbar ist.",
    "hinweis": "Vor der Eintragung nimmt niemand Spenden an. Kein öffentlicher Bezahlweg für Anteile. Zahlen = Entwurf.",
    "cta": "FAQ · oder Mitmachen"
  },
  {
    "id": "konzept",
    "titel": "Konzept",
    "schale": "mitte",
    "kurz": "Lebensstandard-Wachstum statt Wirtschaftswachstum: mehr Zeit, Gesundheit und Ruhe statt mehr Umsatz.",
    "abschnitte": [],
    "quelle": "D01; D00",
    "h1": "Mehr Leben — nicht mehr Umsatz um jeden Preis",
    "lead": [
      "Das Ziel ist nicht mehr Umsatz um jeden Preis. Das Ziel ist mehr freie Zeit, gutes Essen aus der Region, Körperarbeit für alle, Lernen ohne Auslese, Wohnen ohne Rendite und Quartiere, in denen Kinder auf der Straße spielen. Wer Auto, Werkzeug und Wohnraum teilt, kauft weniger und lebt trotzdem besser. Das ist der Kern von Sinnmaximierung.",
      "Gleichwürdigkeit, gleiche Stunde, Nachhaltigkeit. Dezentralität, Subsidiarität, Kooperation. Gewaltfreiheit, Heilung, Geist. Nicht-Besitz, Nutzen vor Beitrag. Elf Werte, die Orientierung geben, bevor Regeln ins Detail gehen.",
      "Vom Haus zur Stadt heißt: zuerst ein Gemeinschaftshaus, das nie verkauft wird. Dann Quartiere mit Parken am Rand und Gärten statt Straßen. Später Dörfer und Städte, die wieder lebendig werden. Das ist weit gedacht und trotzdem Schritt für Schritt."
    ],
    "eckdaten": [
      "Kern: Sinnmaximierung statt Umsatzmaximierung",
      "Werte: elf Orientierungspunkte (u. a. Gleichwürdigkeit, gleiche Stunde, Nicht-Besitz)",
      "Weg: Haus → Quartier → weiter, Schritt für Schritt",
      "Stand: Konzept / Vorbereitung"
    ],
    "schluss": "Wenn dich dieser Rahmen trägt, lies So funktioniert's oder die Chronik — und melde dich, wenn du mitgestalten willst.",
    "hinweis": "Weit gedacht, aber kein fertiger Alltag. Konzept ersetzt keine Satzung und keine Prüfung.",
    "cta": "Zu So funktioniert's · oder Chronik"
  },
  {
    "id": "mitmachen",
    "titel": "Mitmachen",
    "schale": "innen",
    "kurz": "Je nachdem, wie nah du bist: von weitem folgen und selbst sparen oder in Freiburg den Anfang mitbauen. Melde dich — kein Formular.",
    "abschnitte": [],
    "quelle": "D02; D00; S",
    "h1": "Mitmachen — nah oder von weitem",
    "lead": [
      "Wohnst du in Freiburg oder in der Nähe, kannst du zu den ersten gehören und von Anfang an mitbestimmen, wie der Ort wird: welche Betriebe, welche Regeln, welche Kultur. Von weitem kannst du im eigenen Leben sparen, Einkauf, Auto und Werkzeug mit Freundinnen und Freunden teilen und den Rechner als Vorlage nutzen. Echte Zahlen aus dem Keim-Tagebuch sollen offen liegen, auch wenn etwas nicht läuft. Ein eigener Keim über die Keim-Karte ist in Vorbereitung.",
      "Mit einem Anteil von 100 € wärst du nach der Eintragung Mitglied, mit einer Stimme in der Generalversammlung. Bis dahin gilt: einfach melden. Schreib an office@b-t-m-m.com, wo du wohnst und was dich interessiert. Kein Formular, kein Bezahlknopf."
    ],
    "eckdaten": [
      "Nähe: Freiburg / Umgebung — mit den ersten mitbestimmen",
      "Weite: sparen, teilen, folgen, Keim später",
      "Nach Eintragung (Entwurf): 100 € Anteil, eine Stimme",
      "Jetzt: office@b-t-m-m.com — kein Formular, kein Bezahlknopf"
    ],
    "schluss": "Du bestimmst von Anfang an mit, wenn du zu den ersten gehörst. Das ist der stärkste Grund, dich jetzt zu zeigen: nicht weil etwas fertig ist, sondern weil der Ort noch formbar ist.",
    "hinweis": "Noch nicht eingetragen. Mitgliedschaft und Anteil erst nach Eintragung. Bis dahin nur: melde dich.",
    "cta": "Melde dich unter office@b-t-m-m.com",
    "kontakt": true
  },
  {
    "id": "unterstuetzen",
    "titel": "Unterstützen",
    "schale": "innen",
    "kurz": "Mit Zeit und Können helfen oder Weitersagen. Keine öffentlichen geldbezogenen Angebote im jetzigen Zuschnitt.",
    "abschnitte": [],
    "hinweis": "Keine öffentlichen geldbezogenen Unterstützungsangebote. Vor der Eintragung kein Spendenaufruf.",
    "quelle": "D02; D00; Recht+Finanz/BtMM-Bot 17.11.",
    "h1": "Zeit, Können, Weitersagen",
    "lead": [
      "Du kannst mit Zeit und Können helfen: Videos schneiden, gestalten, übersetzen, programmieren. Deine Hilfe wird sichtbar, und du sammelst Referenzen. Du kannst Weitersagen: wer andere überzeugen will, findet in den Erklärdokumenten und im Aufruf zur Beteiligung die Argumente.",
      "Recht und Finanz haben im jetzigen Zuschnitt keine Freigabe für öffentliche geldbezogene Unterstützungsangebote. Auch nach einer späteren Eintragung gilt im aktuellen Plan: öffentlich dauerhaft nur Zeit, Können und Weitersagen. Vor der Eintragung sowieso kein öffentlicher Aufruf, Geld zu geben."
    ],
    "eckdaten": [
      "Öffentlich erlaubt: Zeit · Können · Weitersagen",
      "Kontakt: office@b-t-m-m.com",
      "Nicht öffentlich: geldbezogene Unterstützungs-CTAs",
      "Vor Eintragung: kein Aufruf, Geld zu geben"
    ],
    "schluss": "Unterstützen heißt hier: mitmachen, wo deine Kraft liegt, und die Idee weitertragen. Das reicht, und es bleibt ehrlich — schreib uns, wenn du kannst.",
    "cta": "Schreib an office@b-t-m-m.com · oder Weitersagen mit den Dokumenten",
    "kontakt": true
  },
  {
    "id": "gruendung",
    "titel": "Gründung",
    "schale": "innen",
    "kurz": "Gegründet wird so bald wie möglich, sobald drei Mitglieder da sind. Nur melde dich — kein Formular.",
    "abschnitte": [],
    "quelle": "BP; S; D00; Nutzer 17.11.",
    "h1": "Erst leben — dann gründen",
    "lead": [
      "Gegründet wird so bald wie möglich, sobald drei Mitglieder da sind. Erst leben, dann gründen. Mindestens drei Gründungsmitglieder unterschreiben die Satzung und übernehmen je mindestens einen Anteil. Womit? Mit einem ersten Geschäftsfeld: Körperarbeit zur Entspannung und zum Wohlbefinden. Dazu gemeinsame Einrichtungen für die Mitglieder: Einkauf, Mobilität, Räume und Werkzeug.",
      "Die Satzung ist ein Entwurf. Vor der Gründung prüft sie ein Prüfungsverband. BtMM ist noch nicht eingetragen. Es gibt kein Gründungsformular und keinen Bezahlknopf auf der Seite."
    ],
    "eckdaten": [
      "Stand: so bald wie möglich, sobald drei Mitglieder da sind",
      "Mindestzahl: drei Gründungsmitglieder",
      "Erstes Geschäftsfeld: Körperarbeit (Back to Balance)",
      "Satzung: Entwurf, Prüfung vor Gründung",
      "Jetzt: melde dich — office@b-t-m-m.com"
    ],
    "schluss": "Melde dich, wenn du zu den ersten gehören willst. Du bestimmst von Anfang an, wie der Ort wird. Das ist der Moment, in dem Interesse zu Verantwortung werden kann, ohne dass jemand dich drängt.",
    "hinweis": "Noch nicht eingetragen. Kein Gründungsformular, kein Bezahlknopf. Satzung = Entwurf, nicht rechtssicher.",
    "cta": "Melde dich unter office@b-t-m-m.com",
    "kontakt": true
  },
  {
    "id": "dokumente",
    "titel": "Dokumente",
    "schale": "innen",
    "kurz": "Erklärungen, Satzungsentwurf und Ordnung zum Nachlesen.",
    "abschnitte": [
      {
        "h": "Zum Einstieg",
        "l": [
          "00 BtMM einfach erklärt",
          "01 Einführung",
          "02 Aufruf zur Beteiligung",
          "28 So wirst du Mitglied"
        ],
        "q": "Dateiliste DOKUMENTE/"
      },
      {
        "h": "Genau nachlesen",
        "l": [
          "Schlanker Satzungsentwurf (Außenfassung v9.1.2)",
          "Ordnungen (v2.0.2)",
          "Businessplan-Entwurf (v0.1.11)"
        ],
        "q": "S; O; BP"
      },
      {
        "h": "Hinweis",
        "t": "Im Prototyp sind die Dateien hier noch nicht verlinkt. Später gehören die Links an genau diese Stelle. Lies in dem Tempo, das zu dir passt. Die kurzen Seiten ersetzen die Dokumente nicht. Sie öffnen die Tür dazu.",
        "q": "Design-Bot (offen)"
      }
    ],
    "quelle": "DOKUMENTE/; S; O; BP",
    "h1": "Lesen, was schon da ist",
    "lead": [
      "Zum Einstieg liegen die Erklärungen bereit: 00 BtMM einfach erklärt, 01 Einführung, 02 Aufruf zur Beteiligung, 28 So wirst du Mitglied. Wer genauer lesen will, findet den schlanken Satzungsentwurf (Außenfassung v9.1.2), die Ordnungen (v2.0.2) und den Businessplan-Entwurf (v0.1.11).",
      "Im Prototyp sind die Dateien hier noch nicht verlinkt. Später gehören die Links an genau diese Stelle. Lies in dem Tempo, das zu dir passt. Die kurzen Seiten ersetzen die Dokumente nicht. Sie öffnen die Tür dazu."
    ],
    "eckdaten": [
      "Einstieg: 00, 01, 02, 28",
      "Vertiefung: Satzung v9.1.2 · Ordnungen v2.0.2 · Businessplan v0.1.11",
      "Status Links: im Prototyp noch nicht verlinkt"
    ],
    "schluss": "Nimm dir, was du brauchst — und komm zurück, wenn du magst.",
    "hinweis": "Links im Prototyp noch nicht gesetzt. Dokumente sind Entwürfe / Stand der Vorbereitung.",
    "cta": "Dokumente öffnen (sobald verlinkt) · zurück zur Startseite"
  },
  {
    "id": "offene-fragen",
    "titel": "Offene Fragen",
    "schale": "innen",
    "vorziehbar": true,
    "kurz": "Ehrlich offen: ob sich drei Menschen finden, ob der erste Betrieb trägt und was die Fachleute sagen.",
    "abschnitte": [
      {
        "h": "Was noch offen ist",
        "l": [
          "Ob sich drei Menschen finden, die den Anfang am selben Ort wagen.",
          "Ob der erste Betrieb wirklich so viel verkauft, wie wir rechnen. Deshalb stellt er erst an, wenn belegte Aufträge da sind.",
          "Was Steuerberatung und Prüfungsverband zu den Regeln sagen."
        ],
        "q": "D00, „Ehrlich gesagt“"
      },
      {
        "h": "Rechtlich nicht abgesichert",
        "l": [
          "Die Satzung ist ein Entwurf, nicht rechtssicher.",
          "Fragen zu späteren Wegen nach der Eintragung sind noch nicht abschließend geprüft."
        ],
        "q": "S, Vorbemerkung; D02"
      },
      {
        "h": "Was klärt kein Papier?",
        "t": "Das klären die ersten Menschen und die ersten zwölf Monate. Vielleicht bist du eine oder einer davon. Wir sagen offen, was noch nicht geklärt ist. Genau deshalb kannst du der Einladung trauen: hier wird nichts glattgebügelt.",
        "q": "D00, „Ehrlich gesagt“"
      }
    ],
    "quelle": "D00; S; D02",
    "h1": "Was noch offen ist",
    "lead": [
      "Offen ist, ob sich drei Menschen finden, die den Anfang am selben Ort wagen. Offen ist, ob der erste Betrieb wirklich so viel verkauft, wie wir rechnen. Deshalb stellt er erst an, wenn belegte Aufträge da sind. Offen ist auch, was Steuerberatung und Prüfungsverband zu den Regeln sagen.",
      "Rechtlich nicht abgesichert: Die Satzung ist ein Entwurf, nicht rechtssicher. Fragen zu späteren Wegen nach der Eintragung sind noch nicht abschließend geprüft."
    ],
    "eckdaten": [
      "Offen: drei Menschen am Ort · Tragfähigkeit des ersten Betriebs · Fachmeinungen",
      "Satzung: Entwurf, nicht rechtssicher",
      "Anstellung: erst bei belegten Aufträgen"
    ],
    "schluss": "Das klären die ersten Menschen und die ersten zwölf Monate. Vielleicht bist du eine oder einer davon. Wir sagen offen, was noch nicht geklärt ist — genau deshalb kannst du der Einladung trauen.",
    "hinweis": "Hier wird nichts glattgebügelt. Offene Punkte sind Absicht der Transparenz, keine Verheimlichung.",
    "cta": "Melde dich unter office@b-t-m-m.com · oder Chronik lesen"
  },
  {
    "id": "chronik",
    "titel": "Chronik",
    "schale": "innen",
    "kurz": "Was bisher entschieden wurde, mit Datum — öffentlich nachlesbar.",
    "abschnitte": [
      {
        "h": "Bisher",
        "l": [
          "Oktober 2026: Die Erklär-Dokumente 00, 01 und 28 erscheinen.",
          "10. November 2026: Kein eigener Verein. Spenden später an die Genossenschaft, für Projekte der Allgemeinheit.",
          "16. November 2026: Der schlanke Weg, mit einem ersten Geschäftsfeld. 17. November 2026: Gründung so bald wie möglich, sobald drei Mitglieder da sind — ohne festes Datum.",
          "17. November 2026: Schlanker Satzungsentwurf v9.1.2 und Ordnung v2.0.2."
        ],
        "q": "D00/D01/D28 Versionsdatum; D02 Änderungsvermerk; BP Weg A; S und O Kopf"
      },
      {
        "h": "Warum Chronik?",
        "t": "Die Chronik zeigt, dass Entscheidungen datiert und nachlesbar sind. Nichts davon ist schon Alltag. Alles davon ist Arbeit auf dem Weg dorthin. Wenn du später wiederkommst, siehst du hier, was sich bewegt hat.",
        "q": "D02; BP; S; O"
      }
    ],
    "quelle": "D02; BP; S; O",
    "h1": "Nachlesbare Schritte",
    "lead": [
      "Oktober 2026: Die Erklär-Dokumente 00, 01 und 28 erscheinen. Am 10. November 2026: kein eigener Verein; Spenden später an die Genossenschaft, für Projekte der Allgemeinheit. Am 16. November 2026: der schlanke Weg, mit einem ersten Geschäftsfeld. Am 17. November 2026: schlanker Satzungsentwurf v9.1.2 und Ordnung v2.0.2; Gründung so bald wie möglich, sobald drei Mitglieder da sind — ohne festes Datum.",
      "Die Chronik zeigt, dass Entscheidungen datiert und nachlesbar sind. Nichts davon ist schon Alltag. Alles davon ist Arbeit auf dem Weg dorthin."
    ],
    "eckdaten": [
      "Okt. 2026: Erklär-Dokumente 00, 01, 28",
      "10.11.2026: kein eigener Verein; Spenden später an eG für Allgemeinheit",
      "16.–17.11.2026: schlanker Weg; Gründung so bald wie möglich (3 Mitglieder), ohne festes Datum",
      "17.11.2026: Satzung v9.1.2 · Ordnung v2.0.2"
    ],
    "schluss": "Wenn du später wiederkommst, siehst du hier, was sich bewegt hat — und ob du mitgehen willst.",
    "hinweis": "Chronik = öffentliche Meilensteine, kein fertiger Alltag. „Spenden“ hier nur als Chronik-Fakt, nie als Aufruf.",
    "cta": "Zu Dokumente · oder Gründung"
  }
];

BTMM.STANDPUNKTE = {
  neugierig: 'Neugierig',
  sparen: 'Will im Alltag sparen',
  kunde: 'Sucht Körperarbeit',
  anbieter: 'Will selbst arbeiten',
  gruenden: 'Will mit anfangen',
  skeptisch: 'Skeptisch',
  sinn: 'Sucht Sinn und Gemeinschaft'
};

/* FRAGEN: Pool aus BtMM-Dokumenten abgeleitet (Design-Bot v2.2). Keine erfundenen Fakten in den Quellenangaben.
   w = Gewichte je Bereich, p = Standpunkt-Punkte, prio = Basisreihenfolge in der Schale.
   Auswahl zur Laufzeit: waehleNaechsteFrage(...) in app.js (jetzt regelbasiert; später KI-API). */
BTMM.FRAGEN = [
  { id: "a1", schale: "aussen", prio: 1, q: "D00 Wegweiser", text: "Was führt dich her?", info: "BtMM heißt Back to Meaning Maximization: eine Idee für Teilen, gemeinsames Arbeiten und gemeinsames Eigentum. Die Genossenschaft ist noch nicht eingetragen; gegründet wird so bald wie möglich, sobald drei Mitglieder da sind. Dieser Weg stellt nur ein paar ruhige Fragen — ohne Formularzwang und ohne Bezahlknopf.", antworten: [
    { t: "Ich will wissen, worum es geht", w: { "so-funktionierts": 2, konzept: 1 }, p: { neugierig: 10 } },
    { t: "Ich prüfe erst, ob das trägt", w: { "offene-fragen": 3, faq: 2, kosten: 1 }, p: { skeptisch: 4 } },
    { t: "Ich will im Alltag sparen", w: { "was-du-sparst": 3, kosten: 1 }, p: { sparen: 6 } },
    { t: "Ich suche Körperarbeit", w: { koerperarbeit: 4 }, p: { kunde: 8 } },
    { t: "Ich will in einem Betrieb arbeiten", w: { geldfluss: 2, zellen: 1, gruendung: 1 }, p: { anbieter: 6 } },
    { t: "Ich wohne in Freiburg und will den Keim verstehen", w: { gruendung: 3, mitmachen: 2 }, p: { gruenden: 7 } },
    { t: "Ich suche Sinn und Gemeinschaft", w: { konzept: 2, mitmachen: 1 }, p: { sinn: 8 } }
  ] },
  { id: "a2", schale: "aussen", prio: 2, q: "D02 „Es gibt einen Moment“", text: "Wie stehst du jetzt zu der Idee?", info: "Du hast schon einen ersten Eindruck. Es geht nicht darum, begeistert zu sein, sondern ehrlich zu sagen, wo du gerade stehst — stimmig, unsicher, skeptisch oder noch offen.", antworten: [
    { t: "Klingt stimmig", w: { konzept: 1, "so-funktionierts": 1 }, p: { neugierig: 1, sinn: 1 } },
    { t: "Will ich genauer verstehen", w: { faq: 2, "so-funktionierts": 1 }, p: { neugierig: 1 } },
    { t: "Skeptisch", w: { "offene-fragen": 3, kosten: 2, faq: 2 }, p: { skeptisch: 3 } },
    { t: "Kenne ich noch nicht", w: { "so-funktionierts": 2, faq: 1 }, p: { neugierig: 1 } }
  ] },
  { id: "a3", schale: "aussen", prio: 3, q: "D02 „Von weitem dabei“", text: "Wo wohnst du?", info: "BtMM denkt vom Ort her: ein Keim entsteht dort, wo sich Menschen finden. Von weitem kannst du folgen und später selbst etwas aufbauen; vor Ort kannst du den ersten Schritt mitgestalten.", antworten: [
    { t: "In Freiburg oder in der Nähe", w: { mitmachen: 2, gruendung: 1, koerperarbeit: 1 }, p: {  } },
    { t: "Woanders", w: { zellen: 2, mitmachen: 1, unterstuetzen: 1, gruendung: -1 }, p: {  } }
  ] },
  { id: "a4", schale: "aussen", prio: 4, q: "D00 „Ein Haus mit drei Säulen“", text: "Was würdest du am ehesten teilen?", info: "Eine Säule von BtMM ist Teilen: Dinge und Kosten, die allein teuer sind, gemeinsam nutzen. Ob Einkauf, Auto, Werkzeug oder Zeit — du entscheidest, was für dich nah liegt.", antworten: [
    { t: "Den Einkauf", w: { "was-du-sparst": 2 }, p: { sparen: 3 } },
    { t: "Ein Auto", w: { "was-du-sparst": 1, konzept: 1 }, p: { sparen: 3 } },
    { t: "Räume und Werkzeug", w: { "so-funktionierts": 1, zellen: 1 }, p: {  } },
    { t: "Zeit: eine Stunde gegen eine Stunde", w: { zellen: 1, geldfluss: 1 }, p: { anbieter: 2 } }
  ] },
  { id: "a5", schale: "aussen", prio: 5, q: "D00 „Das Ziel“", text: "Was hieße für dich ein besseres Leben?", info: "BtMM zielt nicht auf Wachstum um jeden Preis, sondern auf ein Leben mit mehr Zeit, Ruhe, bezahlbarem Wohnen und Menschen, die füreinander da sind. Was „besser“ heißt, bestimmst du.", antworten: [
    { t: "Mehr freie Zeit", w: { "was-du-sparst": 2 }, p: { sparen: 3 } },
    { t: "Gesundheit und Ruhe", w: { koerperarbeit: 2 }, p: { kunde: 3 } },
    { t: "Wohnen ohne Rendite", w: { konzept: 2, geldfluss: 1 }, p: { sinn: 1 } },
    { t: "Menschen, die füreinander da sind", w: { zellen: 1, konzept: 1, mitmachen: 1 }, p: { sinn: 1 } }
  ] },
  { id: "a6", schale: "aussen", prio: 6, q: "D00 Wegweiser", text: "Was willst du zuerst wissen?", info: "Auf der Seite findest du Kosten, mögliche Ersparnis, den Geldfluss und ehrlich offene Punkte. Du wählst, womit du anfangen willst — ohne Verkaufsdruck.", antworten: [
    { t: "Was es kostet", w: { kosten: 3 }, p: { sparen: 4 } },
    { t: "Was ich spare", w: { "was-du-sparst": 3 }, p: { sparen: 4 } },
    { t: "Wohin das Geld geht", w: { geldfluss: 3 }, p: {  } },
    { t: "Was noch offen ist", w: { "offene-fragen": 3 }, p: { skeptisch: 1 } }
  ] },
  { id: "a7", schale: "aussen", prio: 7, q: "D00 „Die ersten drei“ (Zeit)", text: "Wie viel Zeit hättest du dafür?", info: "Der Keim braucht keine Vollzeit von dir. Manche lesen nur mit; andere bringen ab und zu Stunden; wenige bauen regelmäßig mit. Deine Zeitangabe steuert nur, welche nächsten Schritte Sinn ergeben.", antworten: [
    { t: "Kaum Zeit", w: { kosten: 1, unterstuetzen: 1, gruendung: -1 }, p: { sparen: 2 } },
    { t: "Ab und zu ein paar Stunden", w: { mitmachen: 1, unterstuetzen: 1 }, p: {  } },
    { t: "Regelmäßig, auch neben dem Beruf", w: { gruendung: 2, zellen: 1 }, p: { gruenden: 2 } }
  ] },
  { id: "a8", schale: "aussen", prio: 8, q: "Lesart (Bedienung)", text: "Wie liest du am liebsten?", info: "Manche wollen drei Sätze, andere Zahlen, andere den Hintergrund. Die Seite kann kurz, mit Belegen oder ausführlich werden — du wählst die Lesart.", antworten: [
    { t: "Kurz und knapp", w: { faq: 2 }, p: {  } },
    { t: "Mit Zahlen", w: { "was-du-sparst": 1, geldfluss: 1, kosten: 1 }, p: { sparen: 3 } },
    { t: "Ausführlich, mit Hintergrund", w: { konzept: 1, dokumente: 2 }, p: {  } }
  ] },
  { id: "a9", schale: "aussen", prio: 9, q: "D00 „In fünf Sätzen“", text: "Was spricht dich an den drei Säulen am meisten an?", info: "BtMM ruht auf drei Säulen: Teilen (Nutzengemeinschaft), Arbeiten (gleicher Lohn je Stunde) und Besitzen (Gemeinschaftseigentum, das nicht verkauft wird). Welche Säule dich zuerst anspricht, öffnet den passenden Einstieg.", antworten: [
    { t: "Teilen: Einkauf und Dinge gemeinsam", w: { "so-funktionierts": 2, "was-du-sparst": 1 }, p: { sparen: 3 } },
    { t: "Arbeiten: gleicher Lohn je Stunde", w: { geldfluss: 2, konzept: 1 }, p: { anbieter: 3 } },
    { t: "Besitzen: Häuser, die nie verkauft werden", w: { konzept: 2, geldfluss: 1 }, p: { sinn: 1 } },
    { t: "Alles zusammen", w: { "so-funktionierts": 2, konzept: 1 }, p: { neugierig: 1 } }
  ] },
  { id: "a10", schale: "aussen", prio: 10, q: "D00 „Der Grundsatz“", text: "„Nutzen, was gut ist. Bauen, wo etwas fehlt.“ Wie klingt das?", info: "Der Grundsatz lautet: Nutzen, was gut ist — und nur dort neu bauen, wo etwas fehlt. Das hält den Keim klein und praktisch, statt alles auf einmal zu erfinden.", antworten: [
    { t: "Pragmatisch und richtig", w: { "so-funktionierts": 2 }, p: { neugierig: 1 } },
    { t: "Ich will Beispiele sehen", w: { "so-funktionierts": 1, faq: 1 }, p: {  } },
    { t: "Klingt zu vage", w: { "offene-fragen": 2, faq: 1 }, p: { skeptisch: 2 } }
  ] },
  { id: "a11", schale: "aussen", prio: 11, q: "D00 „Die Waage“", text: "Dürfte dein Beitrag höher sein als deine Ersparnis?", info: "Die Idee kennt eine Waage: Was du gibst und was du sparst, soll langfristig stimmig bleiben. Ob dein Beitrag manchmal höher sein darf als deine Ersparnis, ist eine Haltung — keine Pflicht.", antworten: [
    { t: "Nein, nie", w: { "was-du-sparst": 2, kosten: 1 }, p: { sparen: 3 } },
    { t: "Manchmal schon, wenn es Sinn macht", w: { konzept: 1, unterstuetzen: 1 }, p: { sinn: 1 } },
    { t: "Weiß ich noch nicht", w: { faq: 1, kosten: 1 }, p: { neugierig: 1 } }
  ] },
  { id: "a12", schale: "aussen", prio: 12, q: "D00 „Bezahlt, getauscht oder geschenkt“", text: "Wie würdest du Leistungen untereinander regeln wollen?", info: "Leistungen können bezahlt, in Stunden getauscht oder — wo es passt — geschenkt werden. BtMM will das transparent halten, nicht alles über einen Zwangsweg laufen lassen.", antworten: [
    { t: "Mit Geld bezahlen", w: { kosten: 2, geldfluss: 1 }, p: {  } },
    { t: "Stunden tauschen", w: { zellen: 2, geldfluss: 1 }, p: { sinn: 1 } },
    { t: "Auch schenken, wenn es passt", w: { konzept: 1, unterstuetzen: 1 }, p: { sinn: 1 } }
  ] },
  { id: "a13", schale: "aussen", prio: 13, q: "D00 „Vom Haus zur Stadt“", text: "„Erst leben, dann gründen.“ Passt das zu dir?", info: "Der Weg heißt: erst leben und ausprobieren, dann gründen. Die Genossenschaft kommt so bald wie möglich, sobald drei Mitglieder da sind — nicht als leeres Versprechen mit festem Datum.", antworten: [
    { t: "Ja, klein anfangen", w: { "so-funktionierts": 2, gruendung: 1 }, p: { gruenden: 3 } },
    { t: "Ich will lieber sofort eine feste Struktur", w: { gruendung: 2, dokumente: 1 }, p: { gruenden: 3 } },
    { t: "Unklar", w: { faq: 1, "offene-fragen": 1 }, p: { neugierig: 1 } }
  ] },
  { id: "a14", schale: "aussen", prio: 14, q: "D02 „Kurz gesagt“", text: "Interessiert dich eher Nähe oder Weite?", info: "Nähe heißt: vor Ort mitbauen. Weite heißt: von woanders folgen, sparen und später selbst einen Keim setzen. Beides ist vorgesehen.", antworten: [
    { t: "Nähe: mitbauen vor Ort", w: { mitmachen: 2, gruendung: 2 }, p: { gruenden: 4 } },
    { t: "Weite: folgen und selbst sparen", w: { "was-du-sparst": 2, unterstuetzen: 1 }, p: { sparen: 3 } },
    { t: "Beides, je nach Phase", w: { mitmachen: 1, zellen: 1 }, p: { neugierig: 1 } }
  ] },
  { id: "a15", schale: "aussen", prio: 15, q: "D02 „Was entstehen soll“", text: "Was soll für dich zuerst entstehen?", info: "Am Anfang steht oft Alltagshilfe und gemeinsamer Einkauf, ein erster Betrieb mit Einkommen oder ein Ort zum Ankommen und Mitreden. Was zuerst entsteht, hängt davon ab, wer sich findet.", antworten: [
    { t: "Gemeinsamer Einkauf und Alltagshilfe", w: { "was-du-sparst": 3 }, p: { sparen: 4 } },
    { t: "Ein erster Betrieb mit Einkommen", w: { geldfluss: 2, gruendung: 1 }, p: { anbieter: 3 } },
    { t: "Ein Ort zum Ankommen und Mitreden", w: { zellen: 2, mitmachen: 1 }, p: { sinn: 1 } }
  ] },
  { id: "a16", schale: "aussen", prio: 16, q: "D02 „Was nicht gebraucht wird“", text: "Was stößt dich bei Projekten oft ab?", info: "BtMM will ohne Verkaufsdruck, ohne Abo-Fallen und ohne Hochglanz daherkommen. Was dich bei anderen Projekten abgestoßen hat, hilft der Seite, dich ehrlich abzuholen.", antworten: [
    { t: "Verkaufsdruck und Abo-Fallen", w: { konzept: 2, faq: 1 }, p: { sinn: 2 } },
    { t: "Unklare Zahlen", w: { "was-du-sparst": 1, "offene-fragen": 2 }, p: { skeptisch: 1 } },
    { t: "Zu viel Ideologie, zu wenig Praxis", w: { "so-funktionierts": 2, zellen: 1 }, p: {  } }
  ] },
  { id: "a17", schale: "aussen", prio: 17, q: "D01 Kap. 1 „Die Idee“", text: "Faire Löhne und günstige Preise zugleich — glaubst du das?", info: "Die Idee verbindet faire Löhne für Arbeitende mit günstigeren Preisen durch Teilen und ohne Renditelogik. Ob das trägt, zeigen erst echte Zahlen und Belege — die Seite zeigt Annahmen offen.", antworten: [
    { t: "Ja, wenn Kosten geteilt werden", w: { konzept: 2, "was-du-sparst": 1 }, p: { neugierig: 1 } },
    { t: "Nur mit Belegen", w: { "was-du-sparst": 2, "offene-fragen": 2 }, p: { skeptisch: 3 } },
    { t: "Eher nicht", w: { "offene-fragen": 3, faq: 1 }, p: { skeptisch: 3 } }
  ] },
  { id: "a18", schale: "aussen", prio: 18, q: "D01 Kap. 6 „Gleichwürdigkeit“", text: "Wie wichtig ist dir Gleichwürdigkeit in Gruppen?", info: "Gleichwürdigkeit heißt: jede Stunde zählt gleich, unabhängig vom Status der Arbeit. In Gruppen soll niemand über andere stehen, nur weil die Rolle anders heißt.", antworten: [
    { t: "Sehr wichtig", w: { konzept: 2, zellen: 1 }, p: { sinn: 2 } },
    { t: "Wichtig, aber mit klaren Rollen", w: { zellen: 1, geldfluss: 1 }, p: {  } },
    { t: "Mir egal, Hauptsache Ergebnis", w: { geldfluss: 1, "was-du-sparst": 1 }, p: {  } }
  ] },
  { id: "a19", schale: "aussen", prio: 19, q: "D28 „Worum es geht“", text: "Kennst du Genossenschaften schon?", info: "BtMM soll eine Genossenschaft werden — mit Anteilen, Mitbestimmung und begrenztem Risiko. Kennst du das Modell schon, oder soll die Seite es erst erklären?", antworten: [
    { t: "Ja, aus eigener Erfahrung", w: { dokumente: 1, gruendung: 1 }, p: {  } },
    { t: "Nur vom Hörensagen", w: { faq: 1, "so-funktionierts": 1 }, p: { neugierig: 1 } },
    { t: "Nein", w: { "so-funktionierts": 2, faq: 1 }, p: { neugierig: 1 } }
  ] },
  { id: "a20", schale: "aussen", prio: 20, q: "D00 „Ehrlich gesagt“", text: "Wie gehst du mit offenen Punkten um?", info: "In der Keim-Phase bleibt vieles bewusst offen: Regeln, Orte, Tempo. Ehrlichkeit dazu ist Teil des Angebots, kein Makel.", antworten: [
    { t: "Ich will sie sofort sehen", w: { "offene-fragen": 3 }, p: { skeptisch: 1 } },
    { t: "Erst die Idee, dann die Lücken", w: { "so-funktionierts": 2, konzept: 1 }, p: { neugierig: 1 } },
    { t: "Offene Punkte machen mich unsicher", w: { "offene-fragen": 2, faq: 2 }, p: { skeptisch: 3 } }
  ] },
  { id: "a21", schale: "aussen", prio: 21, q: "KA / D00 „Gesundheit“", text: "Brauchen du oder Nahestehende Entspannung und Körperruhe?", info: "Körperarbeit zur Entspannung ist das erste geplante Geschäftsfeld im Keim. Sie ist Wellness, kein Ersatz für ärztliche Wege — und ein konkreter Einstieg, an dem sich Teilen und Arbeiten zeigen können.", antworten: [
    { t: "Ja, regelmäßig", w: { koerperarbeit: 3 }, p: { kunde: 3 } },
    { t: "Ab und zu", w: { koerperarbeit: 1 }, p: { kunde: 2 } },
    { t: "Eher nicht", w: { "so-funktionierts": 1 }, p: {  } }
  ] },
  { id: "a22", schale: "aussen", prio: 22, q: "D00 „Ein Netz mit allen, die ähnlich denken“", text: "Willst du eher allein oder mit anderen sparen und teilen?", info: "Teilen und Sparen funktioniert allein begrenzt; mit anderen wird es greifbar. Du kannst erst allein lesen oder von Anfang an mit Menschen denken.", antworten: [
    { t: "Mit anderen", w: { zellen: 2, "was-du-sparst": 1 }, p: { sinn: 1 } },
    { t: "Zuerst allein ausprobieren", w: { "was-du-sparst": 2, faq: 1 }, p: { sparen: 1 } },
    { t: "Beides", w: { zellen: 1, "was-du-sparst": 1 }, p: {  } }
  ] },
  { id: "a23", schale: "aussen", prio: 23, q: "BP Weg A / D00", text: "Wie weit denkst du voraus?", info: "Der Blick reicht von den nächsten Monaten bis zu Quartieren und Häusern. Gegründet wird so bald wie möglich mit drei Mitgliedern — ohne festes Datum als Deadline nach außen.", antworten: [
    { t: "Nächste Monate", w: { "was-du-sparst": 1, kosten: 1 }, p: { sparen: 3 } },
    { t: "Bis zur möglichen Gründung (so bald wie möglich)", w: { gruendung: 2, dokumente: 1 }, p: { gruenden: 3 } },
    { t: "Jahrzehnte, Quartiere und Häuser", w: { konzept: 1, chronik: 2 }, p: { sinn: 2 } }
  ] },
  { id: "a24", schale: "aussen", prio: 24, q: "D02 „Woher die Idee kommt“", text: "Was zieht dich an einer Idee an?", info: "Manche kommen über die Geschichte, manche über Zahlen, manche über Menschen und Ort. BtMM hat all das — du wählst den Zugang.", antworten: [
    { t: "Die Geschichte dahinter", w: { chronik: 3, konzept: 1 }, p: { sinn: 1 } },
    { t: "Die Zahlen und der Plan", w: { "was-du-sparst": 2, kosten: 1, geldfluss: 1 }, p: {  } },
    { t: "Die Menschen und der Ort", w: { zellen: 2, mitmachen: 1 }, p: { sinn: 1 } }
  ] },
  { id: "a25", schale: "aussen", prio: 25, q: "D19 / D00 „Die Waage“", text: "Wie wichtig sind dir konkrete Euro- und Stunden-Zahlen?", info: "Wo es geht, arbeitet BtMM mit Euro- und Stunden-Zahlen und nennt Annahmen. Haltung ohne Belege reicht manchen; anderen sind Tabellen der Einstieg.", antworten: [
    { t: "Sehr — ohne Zahlen bin ich raus", w: { "was-du-sparst": 3, kosten: 2 }, p: { sparen: 4, skeptisch: 1 } },
    { t: "Hilfreich, aber nicht alles", w: { "was-du-sparst": 1, konzept: 1 }, p: {  } },
    { t: "Eher die Haltung als die Tabelle", w: { konzept: 2 }, p: { sinn: 1 } }
  ] },
  { id: "a26", schale: "aussen", prio: 26, q: "D13 „Einsamkeit“", text: "Spielt Einsamkeit oder Anschluss für dich eine Rolle?", info: "Neben Sparen und Arbeit geht es auch um Anschluss: Menschen, die füreinander da sind. Ob das für dich zählt, steuert spätere Schritte zu Zellen und Mitmachen.", antworten: [
    { t: "Ja, Anschluss fehlt mir oft", w: { zellen: 2, mitmachen: 1 }, p: { sinn: 2 } },
    { t: "Manchmal", w: { zellen: 1, konzept: 1 }, p: { sinn: 1 } },
    { t: "Nein", w: { "so-funktionierts": 1 }, p: {  } }
  ] },
  { id: "a27", schale: "aussen", prio: 27, q: "D17 „Häuser / Energie / Essen“", text: "Welches Fernziel interessiert dich am ehesten?", info: "Fernziele können Wohnen, Ernährung, Gesundheit oder erst der Alltag sein. Der Keim fängt klein an; das Große bleibt Fahrplan, kein Versprechen für morgen.", antworten: [
    { t: "Gemeinschaftliches Wohnen", w: { konzept: 2, geldfluss: 1 }, p: { sinn: 1 } },
    { t: "Regionale Ernährung und Höfe", w: { konzept: 1, "was-du-sparst": 1 }, p: {  } },
    { t: "Gesundheit und Pflege", w: { koerperarbeit: 2, konzept: 1 }, p: { kunde: 3 } },
    { t: "Erst der Alltag, später das Große", w: { "so-funktionierts": 2, "was-du-sparst": 1 }, p: { sparen: 3 } }
  ] },
  { id: "a28", schale: "aussen", prio: 28, q: "D01 „Partner“", text: "Könntest du als Betrieb, Verein oder Initiative Partner sein?", info: "Betriebe, Vereine und Initiativen können Partner werden, ohne sofort Mitglied zu sein. Der Partner-Weg ist ein eigener Einstieg neben dem persönlichen Keim.", antworten: [
    { t: "Ja, denkbar", w: { mitmachen: 2, konzept: 1 }, p: { anbieter: 2 } },
    { t: "Vielleicht später", w: { mitmachen: 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "a29", schale: "aussen", prio: 29, q: "D00 „Die ersten drei“", text: "Würdest du zu den ersten dreien am Ort gehören wollen?", info: "Für eine Gründung braucht es mindestens drei Mitglieder. Ob du zu den ersten am Ort gehören willst, ist eine ruhige Frage — kein Druck, dich jetzt festzulegen.", antworten: [
    { t: "Ja, wenn der Ort passt", w: { gruendung: 3, mitmachen: 2 }, p: { gruenden: 4 } },
    { t: "Eher als vierte oder fünfte Person", w: { zellen: 2, mitmachen: 1 }, p: {  } },
    { t: "Nein, von weitem reichen", w: { unterstuetzen: 1, "was-du-sparst": 1, gruendung: -1 }, p: {  } }
  ] },
  { id: "a30", schale: "aussen", prio: 30, q: "D02 „Crowdfunding / Aufbau“", text: "Wie stehst du zu Crowdfunding für den Aufbau?", info: "Für den Aufbau wird auch Crowdfunding diskutiert — transparent und ohne Kaufzwang. Wie du dazu stehst, öffnet oder schließt spätere Info-Seiten.", antworten: [
    { t: "Interessant, wenn transparent", w: { unterstuetzen: 2, kosten: 1 }, p: {  } },
    { t: "Lieber erst Leistung oder Anteil", w: { kosten: 2, mitmachen: 1 }, p: {  } },
    { t: "Eher skeptisch", w: { "offene-fragen": 2 }, p: { skeptisch: 3 } }
  ] },
  { id: "a31", schale: "aussen", prio: 31, q: "FAQ / S § 6", text: "Wie wichtig ist dir ein klarer Ausstieg?", info: "Ein klarer Ausstieg (Kündigungsregeln in der Satzungs-Entwurfswelt) gehört zur Fairness. Ohne Ausstieg kein guter Einstieg — so die Haltung.", antworten: [
    { t: "Sehr — ohne Ausstieg kein Einstieg", w: { faq: 3, kosten: 1 }, p: { skeptisch: 1 } },
    { t: "Wichtig, aber nicht das Erste", w: { faq: 1, "so-funktionierts": 1 }, p: {  } },
    { t: "Weniger, wenn der Sinn stimmt", w: { konzept: 1, mitmachen: 1 }, p: { sinn: 1 } }
  ] },
  { id: "a32", schale: "aussen", prio: 32, q: "D00 „Bildung / Wohnen / Ruhe“", text: "Welches Lebensfeld ist dir gerade am nächsten?", info: "Wohnen, Arbeit, Gesundheit/Ruhe oder Gemeinschaft: BtMM berührt mehrere Lebensfelder. Welches dir jetzt am nächsten ist, sortiert die nächsten Inhalte.", antworten: [
    { t: "Wohnen und Alltagskosten", w: { "was-du-sparst": 2, kosten: 1 }, p: { sparen: 4 } },
    { t: "Arbeit und Einkommen", w: { geldfluss: 2 }, p: { anbieter: 3 } },
    { t: "Gesundheit und Ruhe", w: { koerperarbeit: 2 }, p: { kunde: 3 } },
    { t: "Gemeinschaft und Sinn", w: { konzept: 2, zellen: 1 }, p: { sinn: 1 } }
  ] },
  { id: "m1", schale: "mitte", prio: 1, q: "D01 Kap. 6 „Gleiche Stunde“", text: "Derselbe Lohn für jede Stunde, egal welche Arbeit. Wie klingt das?", info: "In BtMM soll jede Arbeitsstunde denselben Lohn bringen — Küche wie Buchhaltung. Das ist Haltung und Entwurf zugleich; die genaue Umsetzung folgt mit Betrieb und Regeln.", antworten: [
    { t: "Gerecht", w: { konzept: 2, geldfluss: 1 }, p: { sinn: 1 } },
    { t: "Ich frage mich, ob das trägt", w: { geldfluss: 2, "offene-fragen": 2 }, p: { skeptisch: 1 } },
    { t: "Dazu will ich mehr wissen", w: { geldfluss: 2, faq: 1 }, p: { anbieter: 2 } }
  ] },
  { id: "m2", schale: "mitte", prio: 2, q: "S § 1 Abs. 4", text: "Interessiert dich Körperarbeit für dich selbst?", ueberspringenWenn: { a1: 2 }, info: "Körperarbeit kannst du als Kund:in nutzen, ohne gleich mitzubauen. Sie ist der geplante erste Betrieb — und ein Weg, BtMM im Alltag zu spüren.", antworten: [
    { t: "Ja", w: { koerperarbeit: 3 }, p: { kunde: 3 } },
    { t: "Vielleicht", w: { koerperarbeit: 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "m3", schale: "mitte", prio: 3, q: "D02 „Ehrlich gesagt“; S § 2", text: "Was ist dir beim Geld am wichtigsten?", info: "Beim Geld zählen begrenztes Risiko, faire Preise und die Frage, wohin Überschüsse fließen. Die Seite zeigt Entwürfe: Anteil, Rücklage, Rückvergütung — noch Keim, noch nicht eingetragen.", antworten: [
    { t: "Kein Risiko über den Anteil hinaus", w: { kosten: 3, faq: 1 }, p: { skeptisch: 1 } },
    { t: "Faire Preise und Ersparnis", w: { "was-du-sparst": 2, kosten: 1 }, p: { sparen: 4 } },
    { t: "Wohin Überschüsse fließen", w: { geldfluss: 3 }, p: {  } }
  ] },
  { id: "m4", schale: "mitte", prio: 4, q: "D02 Keim; O § 2", text: "Könntest du dir vorstellen, in einer Gruppe vor Ort mitzumachen?", info: "Zellen sind lokale Gruppen ohne eigene Kasse und ohne eigene Währung. Mitmachen vor Ort heißt: mit anderen am selben Ort lesen, planen, ausprobieren.", antworten: [
    { t: "Ja", w: { zellen: 3, mitmachen: 1 }, p: { sinn: 2, gruenden: 1 } },
    { t: "Nur digital / von weitem", w: { zellen: 1, unterstuetzen: 1 }, p: {  } },
    { t: "Nein", w: { faq: 1 }, p: {  } }
  ] },
  { id: "m5", schale: "mitte", prio: 5, q: "D01 Kap. 1; D28 Stufenplan", text: "Bist du selbstständig?", ueberspringenWenn: { a1: 3 }, info: "Selbstständige und Angestellte können später anders anknüpfen — als Anbietende, Kundschaft oder Mitbauende. Die Frage sortiert nur den nächsten Info-Pfad.", antworten: [
    { t: "Ja", w: { geldfluss: 2, gruendung: 1 }, p: { anbieter: 3 } },
    { t: "Nein, angestellt", w: { geldfluss: 1, "was-du-sparst": 1 }, p: {  } },
    { t: "Auf der Suche", w: { mitmachen: 1, "offene-fragen": 1 }, p: {  } }
  ] },
  { id: "m6", schale: "mitte", prio: 6, q: "D00 „Besitzen“", text: "Häuser und Land, die nie verkauft werden. Spricht dich das an?", info: "Gemeinschaftseigentum meint Häuser und Land, die nicht wieder privat verkauft werden. Das ist ein Fernziel mit Regeln — kein Kaufangebot auf dieser Seite.", antworten: [
    { t: "Sehr", w: { konzept: 3 }, p: { sinn: 3 } },
    { t: "Interessiert mich", w: { konzept: 1, geldfluss: 1 }, p: {  } },
    { t: "Klingt mir zu groß", w: { "offene-fragen": 2, gruendung: 1 }, p: { skeptisch: 2 } }
  ] },
  { id: "m7", schale: "mitte", prio: 7, q: "Lesart (Bedienung)", text: "Wie genau willst du die Zahlen sehen?", info: "Zahlen gibt es als Kurzfassung oder mit Tabellen und Annahmen. Du wählst die Tiefe; nichts wird verschwiegen, nichts geschönt.", antworten: [
    { t: "Nur die Kurzfassung", w: { faq: 2, "was-du-sparst": 1 }, p: {  } },
    { t: "Tabellen und Annahmen", w: { "was-du-sparst": 2, geldfluss: 2, dokumente: 1 }, p: { skeptisch: 1 } },
    { t: "Später, erst die Idee", w: { konzept: 1, "so-funktionierts": 1 }, p: {  } }
  ] },
  { id: "m8", schale: "mitte", prio: 8, q: "D02 „Echte Zahlen“", text: "Was würde dich überzeugen?", info: "Überzeugen sollen echte Zahlen, belegte Aufträge und Menschen, die schon mitdenken — nicht Sprüche. Was für dich zählt, öffnet die passenden Belege.", antworten: [
    { t: "Ehrliche Antworten auf offene Fragen", w: { "offene-fragen": 3 }, p: { skeptisch: 1 } },
    { t: "Belegte Aufträge und echte Ersparnis", w: { "was-du-sparst": 2, geldfluss: 1 }, p: { sparen: 4 } },
    { t: "Menschen, die schon mitmachen", w: { zellen: 2, mitmachen: 1 }, p: { sinn: 1 } }
  ] },
  { id: "m9", schale: "mitte", prio: 9, q: "O § 9 Mindestlohn", text: "Mindestlohn unabhängig vom Ergebnis — wie bewertest du das?", info: "Ein Mindestlohn unabhängig vom Tagesergebnis soll Arbeitende schützen. Ob das finanzierbar ist, bleibt eine offene Rechnung — ehrlich benannt.", antworten: [
    { t: "Schützt die Arbeitenden", w: { geldfluss: 2, konzept: 1 }, p: { anbieter: 3 } },
    { t: "Klingt gut, will den Mechanismus sehen", w: { geldfluss: 2, dokumente: 1 }, p: {  } },
    { t: "Zweifel, ob das finanzierbar ist", w: { "offene-fragen": 2, geldfluss: 1 }, p: { skeptisch: 2 } }
  ] },
  { id: "m10", schale: "mitte", prio: 10, q: "S § 2 Abs. 3 Rücklage", text: "Mindestens 10 % Rücklage vom Überschuss — sinnvoll?", info: "Vom Überschuss sollen mindestens zehn Prozent in die Rücklage — so der Satzungsentwurf. Das dämpft Schwankungen, bevor über den Rest gesprochen wird.", antworten: [
    { t: "Ja, Sicherheit zuerst", w: { geldfluss: 2, kosten: 1 }, p: {  } },
    { t: "Nur wenn die Mitglieder mitentscheiden", w: { geldfluss: 1, dokumente: 1 }, p: { sinn: 2 } },
    { t: "Weiß ich nicht", w: { faq: 1 }, p: {  } }
  ] },
  { id: "m11", schale: "mitte", prio: 11, q: "S § 2 Abs. 5 Rückvergütung", text: "Über den Rest sollen Mitglieder entscheiden. Wichtig für dich?", info: "Was nach Lohn und Rücklage bleibt, entscheiden die Mitglieder. Mitbestimmung ist hier kein Extra, sondern Teil der Idee.", antworten: [
    { t: "Ja, Mitbestimmung ist zentral", w: { geldfluss: 2, mitmachen: 1 }, p: { gruenden: 3, sinn: 1 } },
    { t: "Mir reicht Transparenz", w: { geldfluss: 1, dokumente: 1 }, p: {  } },
    { t: "Weniger wichtig", w: {  }, p: {  } }
  ] },
  { id: "m12", schale: "mitte", prio: 12, q: "S § 3 Abs. 5", text: "Wenn es sechs Monate unter Plan läuft: Mitglieder entscheiden. Beruhigt dich das?", info: "Läuft es sechs Monate unter Plan, entscheiden wieder die Mitglieder — nicht still eine Spitze. Das soll Vertrauen schaffen, kein Panik-Signal.", antworten: [
    { t: "Ja", w: { "offene-fragen": 1, geldfluss: 1, faq: 1 }, p: {  } },
    { t: "Nur mit klaren Regeln", w: { dokumente: 2, "offene-fragen": 1 }, p: { skeptisch: 1 } },
    { t: "Nein, das ist mir zu riskant", w: { "offene-fragen": 3 }, p: { skeptisch: 3 } }
  ] },
  { id: "m13", schale: "mitte", prio: 13, q: "S § 5 Abs. 4", text: "Eine Stimme je Mitglied — passt das?", info: "Eine Stimme je Mitglied, unabhängig von der Zahl der Anteile: so der Entwurf. Mitbestimmung nach Köpfen, nicht nach Kapitalmacht.", antworten: [
    { t: "Ja", w: { konzept: 1, mitmachen: 1 }, p: { sinn: 3 } },
    { t: "Eher nach Anteilen gewichten", w: { kosten: 1, dokumente: 1 }, p: {  } },
    { t: "Unentschieden", w: { faq: 1 }, p: {  } }
  ] },
  { id: "m14", schale: "mitte", prio: 14, q: "S § 2 Abs. 4", text: "Keine Nachschüsse — wie wichtig ist dir das?", info: "Keine Nachschüsse: Du riskierst höchstens deinen Anteil. Das ist eine zentrale Sicherheitslinie im Entwurf.", antworten: [
    { t: "Unverzichtbar", w: { kosten: 3, faq: 2 }, p: { skeptisch: 1 } },
    { t: "Wichtig", w: { kosten: 2 }, p: {  } },
    { t: "Nebensache", w: { konzept: 1 }, p: {  } }
  ] },
  { id: "m15", schale: "mitte", prio: 15, q: "S § 2 Abs. 1–2", text: "100 € Anteil, Raten ab 10 €, bis zu zehn Anteile mit Zustimmung. Passt das?", info: "Nach der Eintragung ist ein Anteil von 100 € vorgesehen, auf Wunsch in Raten ab 10 €, mit Obergrenzen und Zustimmung. Vor der Eintragung gibt es keinen öffentlichen Anteilskauf.", antworten: [
    { t: "Ja", w: { kosten: 2, mitmachen: 1 }, p: { gruenden: 2 } },
    { t: "Nur die Raten-Variante", w: { kosten: 2 }, p: { sparen: 4 } },
    { t: "Zu früh, will erst lesen", w: { dokumente: 2, "offene-fragen": 1 }, p: { skeptisch: 1 } }
  ] },
  { id: "m16", schale: "mitte", prio: 16, q: "O § 2–3 Zellen", text: "Zellen ohne eigene Kasse und ohne eigene Währung — klar?", info: "Zellen bleiben bewusst einfach: keine eigene Kasse, keine eigene Währung. So bleibt der Überblick bei der Genossenschaft, der Alltag aber vor Ort.", antworten: [
    { t: "Ja, so bleibt es einfach", w: { zellen: 2 }, p: {  } },
    { t: "Ich hätte gerne mehr Autonomie vor Ort", w: { zellen: 2, "offene-fragen": 1 }, p: {  } },
    { t: "Unklar, brauche Beispiele", w: { zellen: 1, faq: 1 }, p: { neugierig: 1 } }
  ] },
  { id: "m17", schale: "mitte", prio: 17, q: "O § 10 Arbeitszeitkonto", text: "Arbeitszeitkonto und Arbeit auf Abruf — relevant für dich?", info: "Arbeitszeitkonten und Arbeit auf Abruf sind für Betriebe gedacht, die flexibel planen. Betrifft dich das nicht, kannst du es überspringen.", antworten: [
    { t: "Ja, ich plane mit flexibler Zeit", w: { geldfluss: 2 }, p: { anbieter: 2 } },
    { t: "Eher feste Zeiten", w: { geldfluss: 1 }, p: {  } },
    { t: "Betrifft mich nicht", w: {  }, p: {  } }
  ] },
  { id: "m18", schale: "mitte", prio: 18, q: "BP Kap. 3 Angebot", text: "Körperarbeit als erstes Geschäftsfeld — überzeugend?", info: "Körperarbeit ist als erstes Geschäftsfeld geplant — ein greifbarer Start, nicht das ganze Universum auf einmal. Später können weitere Felder folgen.", antworten: [
    { t: "Ja", w: { koerperarbeit: 2, gruendung: 1 }, p: { kunde: 3 } },
    { t: "Nur als Start, später mehr", w: { konzept: 1, gruendung: 1 }, p: {  } },
    { t: "Lieber ein anderes Feld zuerst", w: { "offene-fragen": 1, konzept: 1 }, p: {  } }
  ] },
  { id: "m19", schale: "mitte", prio: 19, q: "BP Kap. 4 Markt", text: "Vergleichbare Modelle und Wettbewerb — willst du das lesen?", info: "Markt und vergleichbare Modelle stehen im Businessplan. Wer Vergleich lesen will, findet ihn; wer erst die Idee will, kann kurz bleiben.", antworten: [
    { t: "Ja, unbedingt", w: { dokumente: 2, konzept: 1 }, p: { skeptisch: 1 } },
    { t: "Kurz reicht", w: { faq: 1, konzept: 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "m20", schale: "mitte", prio: 20, q: "BP Kap. 7 Risiken", text: "Chancen und Risiken offen sehen?", info: "Chancen und Risiken sollen nebeneinander stehen. Wer Risiken zuerst will, wird dorthin geführt — ohne Drama, mit Klarheit.", antworten: [
    { t: "Ja, Risiken zuerst", w: { "offene-fragen": 3, dokumente: 1 }, p: { skeptisch: 3 } },
    { t: "Beides ausgewogen", w: { "offene-fragen": 1, konzept: 1 }, p: {  } },
    { t: "Erst die Vision", w: { konzept: 2 }, p: { sinn: 1 } }
  ] },
  { id: "m21", schale: "mitte", prio: 21, q: "D04 „Grundprinzip“ / D00", text: "Stunden erfassen und intern verrechnen — interessiert dich das?", info: "Stunden erfassen und intern verrechnen macht Teilen und gleichen Lohn nachvollziehbar. Der Mechanismus ist Entwurf — zum Verstehen, nicht zum Sofort-Buchen.", antworten: [
    { t: "Ja, ich will den Mechanismus verstehen", w: { geldfluss: 3 }, p: { anbieter: 2 } },
    { t: "Nur grob", w: { geldfluss: 1, faq: 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "m22", schale: "mitte", prio: 22, q: "D01 Kap. 6 Werte", text: "Welche Haltung ist dir am wichtigsten?", info: "Werte wie Gewaltfreiheit, Nutzen vor Besitz, Dezentralität und gleiche Stunde tragen die Idee. Welche Haltung dir am wichtigsten ist, färbt die nächsten Seiten.", antworten: [
    { t: "Gewaltfreiheit und Heilung", w: { konzept: 2 }, p: { sinn: 2 } },
    { t: "Nachhaltigkeit und Nutzen vor Besitz", w: { konzept: 2 }, p: { sinn: 1 } },
    { t: "Dezentralität und Subsidiarität", w: { zellen: 2, konzept: 1 }, p: {  } },
    { t: "Gleiche Stunde und Gleichwürdigkeit", w: { geldfluss: 1, konzept: 1 }, p: { sinn: 1 } }
  ] },
  { id: "m23", schale: "mitte", prio: 23, q: "D19 Soziale Zahlen", text: "Größenstufen (3, 5, 20, 100 …) — willst du die Tabellen sehen?", info: "Größenstufen (wenige Menschen bis viele) zeigen, was sich bei Wachstum grob ändert. Es sind Modellzahlen, keine Prognose.", antworten: [
    { t: "Ja", w: { "was-du-sparst": 3, dokumente: 1 }, p: { sparen: 3 } },
    { t: "Später", w: { "was-du-sparst": 1 }, p: {  } },
    { t: "Nein, zu abstrakt", w: { "so-funktionierts": 1 }, p: {  } }
  ] },
  { id: "m24", schale: "mitte", prio: 24, q: "D17 Fahrplan", text: "Interessiert dich der lange Fahrplan (Häuser, Energie, Bildung)?", info: "Der lange Fahrplan nennt Häuser, Energie, Bildung — als Richtung, nicht als Terminplan. Der Keim bleibt der erste Schritt.", antworten: [
    { t: "Ja", w: { chronik: 3, konzept: 1 }, p: { sinn: 1 } },
    { t: "Nur die nächsten Schritte", w: { "so-funktionierts": 1, gruendung: 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "m25", schale: "mitte", prio: 25, q: "D21 Bildung finanzieren", text: "Bildung und Weiterbildung finanzieren — Thema für dich?", info: "Bildung und Weiterbildung sollen später mitgedacht und mitfinanziert werden. Ob das dein Thema ist, steuert nur die Infotiefe.", antworten: [
    { t: "Ja", w: { konzept: 2, kosten: 1 }, p: {  } },
    { t: "Später", w: { konzept: 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "m26", schale: "mitte", prio: 26, q: "D02 „Direktkredit“", text: "Direktkredit nach der Gründung — denkbar für dich?", info: "Direktkredit nach der Gründung ist eine mögliche Finanzierungsform unter Mitgliedern — mit Regeln, ohne öffentlichen Bezahlweg jetzt.", antworten: [
    { t: "Vielleicht, wenn alles trägt", w: { unterstuetzen: 2, kosten: 1 }, p: { gruenden: 2 } },
    { t: "Nein", w: {  }, p: {  } },
    { t: "Weiß ich nicht", w: { "offene-fragen": 1, kosten: 1 }, p: {  } }
  ] },
  { id: "m27", schale: "mitte", prio: 27, q: "D28 „Worauf geachtet wird“", text: "Worauf soll bei neuen Mitgliedern geachtet werden?", info: "Bei neuen Mitgliedern soll auf Haltung, Transparenz und Passung zum Ort geachtet werden — nicht auf schnelles Kapital.", antworten: [
    { t: "Verlässlichkeit und Offenheit", w: { zellen: 1, mitmachen: 1 }, p: { sinn: 2 } },
    { t: "Fachliche Fähigkeiten", w: { geldfluss: 1, gruendung: 1 }, p: { anbieter: 2 } },
    { t: "Beides, ohne Ausgrenzung", w: { konzept: 1, zellen: 1 }, p: { sinn: 2 } }
  ] },
  { id: "m28", schale: "mitte", prio: 28, q: "D00 „Brunnen“ / Geldfluss", text: "Reicht dir die Reihenfolge Lohn → Rücklage → Rest?", info: "Geldfluss-Idee: zuerst Lohn, dann Rücklage, dann Rest nach Mitgliederentscheid. Die Reihenfolge schützt Arbeit und Substanz.", antworten: [
    { t: "Ja", w: { geldfluss: 2 }, p: {  } },
    { t: "Will Details und Gegenstimmen", w: { geldfluss: 2, "offene-fragen": 1 }, p: { skeptisch: 1 } },
    { t: "Unklar", w: { faq: 1, geldfluss: 1 }, p: {  } }
  ] },
  { id: "m29", schale: "mitte", prio: 29, q: "KA „Für wen / nicht für“", text: "Körperarbeit ersetzt keine Therapie. Passt diese Grenze?", info: "Körperarbeit ersetzt keine Therapie und keine ärztliche Behandlung. Die Grenze gehört zur Ehrlichkeit des Angebots.", antworten: [
    { t: "Ja, wichtig", w: { koerperarbeit: 1, faq: 1 }, p: { kunde: 2 } },
    { t: "Egal", w: {  }, p: {  } },
    { t: "Will dazu mehr Kontext", w: { koerperarbeit: 1, dokumente: 1 }, p: {  } }
  ] },
  { id: "m30", schale: "mitte", prio: 30, q: "S § 8 / O Zellen", text: "Selbst regeln, offen berichten — wie findest du das?", info: "Zellen sollen vieles selbst regeln und offen berichten. Autonomie vor Ort, Transparenz nach innen — so der Ordnungsentwurf.", antworten: [
    { t: "Genau richtig", w: { zellen: 2 }, p: { sinn: 1 } },
    { t: "Brauch mehr Kontrolle von oben", w: { dokumente: 1, zellen: 1 }, p: {  } },
    { t: "Zu lose", w: { "offene-fragen": 1 }, p: { skeptisch: 1 } }
  ] },
  { id: "m31", schale: "mitte", prio: 31, q: "D02 „Vorbestellen“", text: "Würdest du eine Leistung vorbestellen, die du selbst bekommst?", info: "Vorbestellen heißt: eine Leistung, die du selbst bekommst, im Keim mittragen — kein Spendenaufruf und kein Anteilskauf vor Eintragung.", antworten: [
    { t: "Ja", w: { koerperarbeit: 2, unterstuetzen: 1 }, p: { kunde: 2 } },
    { t: "Vielleicht", w: { unterstuetzen: 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "m32", schale: "mitte", prio: 32, q: "BP 1.2 Finanzierung", text: "Kapitalbedarf und Finanzierung willst du …", info: "Kapitalbedarf und Finanzierung stehen im Plan mit Annahmen. Du wählst, wie tief du einsteigst.", antworten: [
    { t: "Genau nachlesen", w: { dokumente: 2, kosten: 2 }, p: { skeptisch: 1 } },
    { t: "Nur die Kurzfassung", w: { kosten: 1, faq: 1 }, p: {  } },
    { t: "Später", w: {  }, p: {  } }
  ] },
  { id: "i1", schale: "innen", prio: 1, q: "D02 „je nachdem, wie nah du bist“", text: "Wie möchtest du dabei sein?", info: "Du kannst nah mitbauen, von weitem folgen oder erst nur verstehen. BtMM lässt die Distanz bei dir — ohne Druck, dich sofort festzulegen.", antworten: [
    { t: "Mitbauen in Freiburg", w: { mitmachen: 3, gruendung: 2 }, p: { gruenden: 4 } },
    { t: "Von weitem folgen und sparen", w: { "was-du-sparst": 2, unterstuetzen: 1 }, p: { sparen: 4 } },
    { t: "Mit Zeit und Können helfen", w: { unterstuetzen: 3 }, p: {  } },
    { t: "Erst alles lesen", w: { dokumente: 2, "offene-fragen": 1 }, p: { skeptisch: 1 } }
  ] },
  { id: "i2", schale: "innen", prio: 2, q: "S § 2 Abs. 1", text: "100 € Anteil, in Raten ab 10 €, erst nach der Eintragung. Wie passt das?", info: "Der Geschäftsanteil (100 €, Raten möglich) gilt erst nach der Eintragung. Jetzt in der Keim-Phase gibt es keinen Kaufbutton und keinen Anteilshandel auf der Seite.", antworten: [
    { t: "Passt", w: { kosten: 2, mitmachen: 1 }, p: { gruenden: 2 } },
    { t: "Nur wenn ich die Satzung kenne", w: { dokumente: 2, kosten: 1 }, p: {  } },
    { t: "Ich will erst die Bedingungen prüfen", w: { "offene-fragen": 2, dokumente: 2 }, p: { skeptisch: 1 } }
  ] },
  { id: "i3", schale: "innen", prio: 3, q: "D02 „Dein nächster Schritt“", text: "Was brauchst du als Nächstes?", info: "Als Nächstes reichen oft Lesen, eine Mail an office@b-t-m-m.com oder einfach weiter durch die Tür. „Melde dich“ ist der CTA — nicht Bezahlen.", antworten: [
    { t: "Kontakt aufnehmen", w: { mitmachen: 3 }, p: { gruenden: 2 } },
    { t: "Dokumente lesen", w: { dokumente: 3 }, p: {  } },
    { t: "Antworten auf meine Zweifel", w: { "offene-fragen": 3, faq: 1 }, p: { skeptisch: 2 } }
  ] },
  { id: "i4", schale: "innen", prio: 4, q: "D02 „Mithelfen von zu Hause“", text: "Was würdest du einbringen?", info: "Von zu Hause kannst du Text, Technik, Netzwerk oder ruhige Mithilfe einbringen. Nicht alles braucht Anwesenheit in Freiburg.", antworten: [
    { t: "Gestalten, Videos, Übersetzen", w: { unterstuetzen: 3 }, p: {  } },
    { t: "Programmieren oder Technik", w: { unterstuetzen: 2, dokumente: 1 }, p: {  } },
    { t: "Netzwerk und Weitersagen", w: { unterstuetzen: 2, mitmachen: 1 }, p: {  } },
    { t: "Noch unklar", w: { faq: 1 }, p: {  } }
  ] },
  { id: "i5", schale: "innen", prio: 5, q: "D02 „Keim-Tagebuch“", text: "Willst du verfolgen, wie es weitergeht?", info: "Ein Keim-Tagebuch / Chronik macht Entscheidungen nachvollziehbar. Du kannst mitlesen, ohne Mitglied zu sein.", antworten: [
    { t: "Ja, regelmäßig", w: { chronik: 3, mitmachen: 1 }, p: {  } },
    { t: "Ab und zu", w: { chronik: 2 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "i6", schale: "innen", prio: 6, q: "S Vorbemerkung", text: "Kennst du die Satzung schon?", info: "Die Satzung ist Entwurf und wird vor der Gründung geprüft. Du musst sie nicht auswendig kennen — aber du kannst sie lesen, wenn du magst.", antworten: [
    { t: "Ja", w: { "offene-fragen": 1 }, p: {  } },
    { t: "Teilweise", w: { dokumente: 2 }, p: {  } },
    { t: "Nein", w: { dokumente: 3, faq: 1 }, p: {  } }
  ] },
  { id: "i7", schale: "innen", prio: 7, q: "D02 „Unterstützer“, „Spenden“", text: "Willst du lieber etwas geben als mitmachen?", info: "Unterstützen und Mitmachen sind verschiedene Wege. Geben ohne Mitbauen ist möglich; Mitarbeiten ohne Geld ebenso — beides ohne Zwang.", antworten: [
    { t: "Ja, Zeit und Können", w: { unterstuetzen: 3 }, p: {  } },
    { t: "Ja, später auch Geld", w: { unterstuetzen: 2, kosten: 1 }, p: {  } },
    { t: "Nein, ich will eher mitarbeiten", w: { mitmachen: 2 }, p: { gruenden: 3 } }
  ] },
  { id: "i8", schale: "innen", prio: 8, q: "D00 „Ein Netz mit allen, die ähnlich denken“", text: "Hast du einen Hof, Laden, Verein oder Betrieb?", info: "Höfe, Läden, Vereine und Betriebe können Andockpunkte sein. Wenn du so etwas hast, öffnet sich der Partner-Pfad.", antworten: [
    { t: "Ja", w: { konzept: 1, mitmachen: 2 }, p: { anbieter: 2 } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "i9", schale: "innen", prio: 9, q: "D02 „Spenden“", text: "Spenden erst nach Eintragung, ohne Quittung — klar?", info: "Spenden sind erst nach Eintragung und ohne Quittungsversprechen in der Keim-Kommunikation vorgesehen. Unklarheiten dazu bleiben bewusst benannt.", antworten: [
    { t: "Ja", w: { unterstuetzen: 1, faq: 1 }, p: {  } },
    { t: "Will dazu mehr Rechtstext", w: { dokumente: 2, "offene-fragen": 1 }, p: { skeptisch: 1 } },
    { t: "Spenden will ich nicht", w: {  }, p: {  } }
  ] },
  { id: "i10", schale: "innen", prio: 10, q: "D02 „Von weitem dabei“; Recht/BtMM-Bot 17.11.", text: "Wie möchtest du von weitem unterstützen?", info: "Von weitem unterstützen kann heißen: mitlesen, teilen, später selbst einen Keim setzen — oder eher mitarbeiten statt Geld geben. Du wählst die Form.", antworten: [
    { t: "Mit Zeit und Können", w: { unterstuetzen: 3 }, p: {  } },
    { t: "Weitersagen", w: { unterstuetzen: 2, mitmachen: 1 }, p: {  } },
    { t: "Später, nach Eintragung und neuem Ja", w: { unterstuetzen: 1, "offene-fragen": 1 }, p: {  } },
    { t: "Gar nicht — eher mitarbeiten", w: { mitmachen: 2 }, p: { gruenden: 3 } }
  ] },
  { id: "i11", schale: "innen", prio: 11, q: "S Unterschriften / BP", text: "Mindestens drei Gründungsmitglieder — wie stehst du dazu?", info: "Mindestens drei Gründungsmitglieder braucht es zur Eintragung. Bis dahin sprechen wir von Keim und Mitmacher:innen — nicht von fertiger Mitgliedschaft.", antworten: [
    { t: "Ich könnte eine:r davon sein", w: { gruendung: 3, mitmachen: 2 }, p: { gruenden: 4 } },
    { t: "Ich unterstütze, gründe nicht", w: { unterstuetzen: 2 }, p: {  } },
    { t: "Zu früh", w: { "offene-fragen": 1 }, p: {  } }
  ] },
  { id: "i12", schale: "innen", prio: 12, q: "BP Weg A", text: "Gründung so bald wie möglich, sobald drei Mitglieder da sind — zu spät, zu früh oder okay?", info: "Gründung so bald wie möglich, sobald drei Mitglieder da sind — ohne festes Jahr als Deadline nach außen. Zu früh, zu spät oder okay: deine Einschätzung reicht.", antworten: [
    { t: "Okay, lieber solide", w: { gruendung: 1, konzept: 1 }, p: { gruenden: 3 } },
    { t: "Lieber früher", w: { gruendung: 2, "offene-fragen": 1 }, p: { gruenden: 4 } },
    { t: "Zu weit weg für mich", w: { "was-du-sparst": 1, unterstuetzen: 1 }, p: {  } }
  ] },
  { id: "i13", schale: "innen", prio: 13, q: "D28 „Du musst nicht alles aufgeben“", text: "Müsstest du deinen bisherigen Weg aufgeben?", info: "Du musst deinen bisherigen Weg nicht aufgeben, um BtMM zu verstehen oder mitzudenken. Anschluss ist Ergänzung, kein Abbruch.", antworten: [
    { t: "Nein, Parallelweg ist wichtig", w: { mitmachen: 1, faq: 1 }, p: {  } },
    { t: "Teilweise umstellen würde ich", w: { mitmachen: 2 }, p: { gruenden: 2 } },
    { t: "Weiß ich nicht", w: { "offene-fragen": 1 }, p: {  } }
  ] },
  { id: "i14", schale: "innen", prio: 14, q: "D28 „Was wir dir nicht versprechen“", text: "Keine Garantien — kannst du damit leben?", info: "BtMM verspricht keine Garantien auf Erfolg, Ersparnis oder Tempo. Wer das aushält, passt besser zum Keim als jede Hochglanzzusage.", antworten: [
    { t: "Ja, wenn ehrlich kommuniziert", w: { "offene-fragen": 1, faq: 1 }, p: {  } },
    { t: "Nur mit klaren Abbruchkriterien", w: { "offene-fragen": 2, dokumente: 1 }, p: { skeptisch: 1 } },
    { t: "Schwer", w: { "offene-fragen": 3 }, p: { skeptisch: 2 } }
  ] },
  { id: "i15", schale: "innen", prio: 15, q: "Kontakt / D02", text: "Würdest du eine Mail an office@b-t-m-m.com schreiben?", info: "Kontakt läuft über office@b-t-m-m.com. Eine Mail reicht als „melde dich“ — kein Formularzwang, kein Telefonzwang auf der Seite.", antworten: [
    { t: "Ja, bald", w: { mitmachen: 3 }, p: { gruenden: 2 } },
    { t: "Vielleicht", w: { mitmachen: 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "i16", schale: "innen", prio: 16, q: "Chronik 10./16.11.", text: "Interessiert dich die Chronik der Entscheidungen?", info: "Die Chronik (u. a. 10. und 16. November 2026) zeigt, was beschlossen wurde. Nachlesen statt Gerüchten.", antworten: [
    { t: "Ja", w: { chronik: 3, dokumente: 1 }, p: {  } },
    { t: "Kurz reicht", w: { chronik: 2 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "i17", schale: "innen", prio: 17, q: "Dokumente-Seite", text: "Welche Dokumente willst du zuerst?", info: "Dokumente (Konzept, Satzungsentwurf, Pläne) liegen gestuft bereit. Du wählst, womit du startest.", antworten: [
    { t: "00 einfach erklärt", w: { "so-funktionierts": 1, dokumente: 2 }, p: { neugierig: 1 } },
    { t: "Satzung und Ordnung", w: { dokumente: 3 }, p: { skeptisch: 1 } },
    { t: "Businessplan", w: { dokumente: 2, kosten: 1 }, p: {  } },
    { t: "Aufruf zur Beteiligung", w: { mitmachen: 1, dokumente: 1 }, p: {  } }
  ] },
  { id: "i18", schale: "innen", prio: 18, q: "Offene Fragen", text: "Welche offene Frage beschäftigt dich am meisten?", info: "Offene Fragen — Recht, Geld, Ort, Tempo — gehören zur Seite. Welche dich beschäftigt, führt zu den ehrlichen Lücken.", antworten: [
    { t: "Ob sich drei Menschen finden", w: { "offene-fragen": 2, gruendung: 1 }, p: {  } },
    { t: "Ob der erste Betrieb trägt", w: { "offene-fragen": 2, geldfluss: 1 }, p: { skeptisch: 1 } },
    { t: "Recht und Satzung", w: { "offene-fragen": 2, dokumente: 2 }, p: { skeptisch: 1 } },
    { t: "Keine besondere", w: { mitmachen: 1 }, p: {  } }
  ] },
  { id: "i19", schale: "innen", prio: 19, q: "D01 „Von weitem dabei“", text: "Was wäre dein erster Schritt von weitem?", info: "Von weitem reicht oft: lesen, eine Frage mailen, die Idee teilen. Der erste Schritt muss nicht groß sein.", antworten: [
    { t: "Selbst mit Freunden teilen und sparen", w: { "was-du-sparst": 3 }, p: { sparen: 4 } },
    { t: "Keim-Tagebuch / News folgen", w: { chronik: 3 }, p: {  } },
    { t: "Zeit spenden", w: { unterstuetzen: 3 }, p: {  } }
  ] },
  { id: "i20", schale: "innen", prio: 20, q: "D02 Partner", text: "Partner-Weg (Betrieb/Verein) für dich?", info: "Der Partner-Weg ist für Organisationen. Passt er zu dir, gibt es eigene nächste Seiten — parallel zum persönlichen Mitmachen.", antworten: [
    { t: "Ja", w: { mitmachen: 2, konzept: 1 }, p: { anbieter: 2 } },
    { t: "Nein", w: {  }, p: {  } },
    { t: "Später prüfen", w: { dokumente: 1 }, p: {  } }
  ] },
  { id: "i21", schale: "innen", prio: 21, q: "Mitmachen-Seite", text: "Willst du am Ende klar zu Mitmachen oder Unterstützen geführt werden?", info: "Am Ende des Weges kann die Seite klar zu Mitmachen oder Unterstützen führen — als Orientierung, nicht als Druck. Du bleibst frei, nur zu lesen.", antworten: [
    { t: "Ja, klar zum Mitmachen-Weg", w: { mitmachen: 3 }, p: { gruenden: 3 } },
    { t: "Ja, Unterstützen", w: { unterstuetzen: 3 }, p: {  } },
    { t: "Erst Startseite, dann selbst wählen", w: { faq: 1 }, p: {  } }
  ] },
  { id: "i22", schale: "innen", prio: 22, q: "D00 Wegweiser", text: "Soll die Seite nach dem Durchlauf „normal“ ohne Tür sein?", info: "Nach dem Durchlauf öffnet sich der Normalmodus: informieren, nachlesen, Kontakt. Die Tür bleibt für später, wenn du neu einsteigen willst.", antworten: [
    { t: "Ja", w: {  }, p: {  } },
    { t: "Tür lieber immer zeigen", w: {  }, p: {  } },
    { t: "Egal", w: {  }, p: {  } }
  ] },
  { id: "i23", schale: "innen", prio: 23, q: "S § 6 Mitgliedschaft", text: "Ein Jahr Kündigungsfrist zum Geschäftsjahresende — akzeptabel?", info: "Im Entwurf: Kündigung mit Frist zum Geschäftsjahresende. Ausstieg soll klar und fair sein — Details in der Satzung.", antworten: [
    { t: "Ja", w: { faq: 1, kosten: 1 }, p: {  } },
    { t: "Lieber kürzer", w: { "offene-fragen": 1, faq: 2 }, p: { skeptisch: 1 } },
    { t: "Weiß ich nicht", w: { dokumente: 1 }, p: {  } }
  ] },
  { id: "i24", schale: "innen", prio: 24, q: "D02 „Geschäftsanteil“", text: "Mitgliedschaft als Bekenntnis, nicht als Investment — einverstanden?", info: "Mitgliedschaft ist als Bekenntnis und Mitverantwortung gedacht, nicht als Investment-Produkt. Renditelogik gehört nicht dazu.", antworten: [
    { t: "Ja", w: { konzept: 1, kosten: 1 }, p: { sinn: 3 } },
    { t: "Nur mit klarer Satzung", w: { dokumente: 2 }, p: {  } },
    { t: "Nein, ich erwarte Rendite", w: { "offene-fragen": 2 }, p: { skeptisch: 1 } }
  ] },
  { id: "i25", schale: "innen", prio: 25, q: "Intern gesperrt: Gründungsaufruf", text: "Reicht „melde dich“ ohne Formular und Bezahlknopf?", info: "Öffentlich bleibt es bei „melde dich“ — ohne Formular- und Bezahlknopf vor der Eintragung. Internes bleibt intern.", antworten: [
    { t: "„Melde dich“ reicht", w: { mitmachen: 2 }, p: {  } },
    { t: "Ich will ein klares Formular", w: { mitmachen: 1, "offene-fragen": 1 }, p: {  } },
    { t: "Noch zu früh für beides", w: { dokumente: 1 }, p: {  } }
  ] },
  { id: "i26", schale: "innen", prio: 26, q: "D13 Fail Festival / Scheitern", text: "Darf Scheitern Teil der Kultur sein?", info: "Scheitern darf benannt und gelernt werden — Fail-Festival-Idee als Kultur, nicht als Heldengeschichte.", antworten: [
    { t: "Ja, bitte ehrlich", w: { konzept: 2, "offene-fragen": 1 }, p: { sinn: 1 } },
    { t: "Nur mit Lernbericht", w: { dokumente: 1, "offene-fragen": 1 }, p: {  } },
    { t: "Eher nicht öffentlich", w: {  }, p: {  } }
  ] },
  { id: "i27", schale: "innen", prio: 27, q: "D17 „Was den Fahrplan bremst“", text: "Willst du lesen, was den Plan bremsen kann?", info: "Was den Fahrplan bremsen kann (Recht, Geld, Menschen, Ort), soll lesbar sein. Wer das will, bekommt die Bremsen zuerst.", antworten: [
    { t: "Ja", w: { "offene-fragen": 2, dokumente: 1 }, p: { skeptisch: 1 } },
    { t: "Kurz", w: { "offene-fragen": 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "i28", schale: "innen", prio: 28, q: "Körperarbeit → Betrieb", text: "Wärst du Kund:in, Mitwirkende:r oder beides?", info: "Beim ersten Betrieb Körperarbeit kannst du Kund:in, Mitwirkende:r oder beides sein — oder keines. Rollen bleiben wählbar.", antworten: [
    { t: "Kund:in", w: { koerperarbeit: 3 }, p: { kunde: 2 } },
    { t: "Mitwirkende:r", w: { geldfluss: 1, mitmachen: 2 }, p: { anbieter: 2 } },
    { t: "Beides", w: { koerperarbeit: 2, mitmachen: 1 }, p: { kunde: 2 } },
    { t: "Keins", w: {  }, p: {  } }
  ] },
  { id: "i29", schale: "innen", prio: 29, q: "Zellen Keim", text: "Sollen wir dich mit zwei anderen am Ort bekannt machen, wenn es drei gibt?", info: "Wenn sich drei am Ort finden, kann die Seite helfen, euch bekannt zu machen — nur mit deiner Zustimmung. Kein automatisches Matching hinter dem Rücken.", antworten: [
    { t: "Ja", w: { zellen: 3, mitmachen: 2 }, p: { sinn: 2, gruenden: 1 } },
    { t: "Nur wenn ich zustimme", w: { zellen: 2, faq: 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "i30", schale: "innen", prio: 30, q: "Datenschutz / Cookie", text: "Session-Cookie nur „Tür erledigt“ — okay für dich?", info: "Ein kleines Session-Cookie kann merken, dass du die Tür schon durchlaufen hast. Antworten bleiben im Arbeitsspeicher des Besuchs; Details stehen in der DSE.", antworten: [
    { t: "Ja", w: {  }, p: {  } },
    { t: "Will die DSE dazu lesen", w: { dokumente: 1, faq: 1 }, p: { skeptisch: 1 } },
    { t: "Lieber jedes Mal die Tür", w: {  }, p: {  } }
  ] },
  { id: "i31", schale: "innen", prio: 31, q: "Mehrsprachigkeit", text: "Reicht Deutsch vorerst?", info: "Die Seite startet auf Deutsch. Andere Sprachen können folgen — sag Bescheid, wenn du sie jetzt brauchst.", antworten: [
    { t: "Ja", w: {  }, p: {  } },
    { t: "Bald auch andere Sprachen", w: { unterstuetzen: 1 }, p: {  } },
    { t: "Brauche jetzt eine andere Sprache", w: { faq: 1, "offene-fragen": 1 }, p: {  } }
  ] },
  { id: "i32", schale: "innen", prio: 32, q: "Abschluss", text: "Wenn die Seite sich neu baut: was soll oben stehen?", info: "Wenn sich die Startseite neu sortiert, sollen deine Schwerpunkte oben liegen: Einstieg, Kosten oder offene Fragen. Du hast mitgewählt.", antworten: [
    { t: "Mein Einstieg und die stärksten Argumente", w: { mitmachen: 1, konzept: 1 }, p: {  } },
    { t: "Kosten und Sparen", w: { kosten: 2, "was-du-sparst": 2 }, p: { sparen: 4 } },
    { t: "Offene Fragen und Dokumente", w: { "offene-fragen": 2, dokumente: 2 }, p: { skeptisch: 1 } }
  ] },

  { id: "a33", schale: "aussen", prio: 33, q: "D07 „Drei Säulen“ / D00", text: "Welche Säule willst du zuerst verstehen?", info: "Die drei Säulen — Teilen, Arbeiten, Besitzen — greifen ineinander. Du kannst eine zuerst verstehen, bevor die anderen dazukommen.", antworten: [
    { t: "Teilen (Nutzengemeinschaft)", w: { "so-funktionierts": 2, "was-du-sparst": 1 }, p: { sparen: 3 } },
    { t: "Arbeiten (Gemeinschaftsbetriebe)", w: { geldfluss: 2 }, p: { anbieter: 3 } },
    { t: "Besitzen (Gemeinschaftseigentum)", w: { konzept: 2 }, p: { sinn: 1 } }
  ] },
  { id: "a34", schale: "aussen", prio: 34, q: "D19 „Was Größe bringt“", text: "Interessiert dich, was mehr Mitglieder verändern?", info: "Mit mehr Menschen ändern sich Ersparnis, Arbeitsteilung und mögliche Orte. Größen-Tabellen machen das grob sichtbar — ohne Garantie.", antworten: [
    { t: "Ja, die Größen-Tabellen", w: { "was-du-sparst": 3, dokumente: 1 }, p: { sparen: 3 } },
    { t: "Nur grob", w: { "was-du-sparst": 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "m33", schale: "mitte", prio: 33, q: "S § 9 Prüfungsverband", text: "Vor der Gründung prüft ein Prüfungsverband die Satzung. Beruhigt dich das?", info: "Vor der Gründung prüft ein Prüfungsverband die Satzung. Das ist vorgeschrieben und soll Sicherheit geben — Berichte kannst du später einsehen wollen.", antworten: [
    { t: "Ja", w: { dokumente: 1, faq: 1 }, p: {  } },
    { t: "Nur wenn ich den Bericht sehen kann", w: { dokumente: 2, "offene-fragen": 1 }, p: { skeptisch: 1 } },
    { t: "Nein, egal", w: {  }, p: {  } }
  ] },
  { id: "m34", schale: "mitte", prio: 34, q: "O § 11 Vorstand und Ehrenamt", text: "Vorstand und Ehrenamt mit Mindestpfad — willst du das nachlesen?", info: "Vorstand und Ehrenamt brauchen einen klaren Mindestpfad. Wer Rollen nachlesen will, findet sie in Ordnung und Satzungsentwurf.", antworten: [
    { t: "Ja", w: { dokumente: 2, geldfluss: 1 }, p: {  } },
    { t: "Später", w: { faq: 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
  { id: "i33", schale: "innen", prio: 33, q: "BP Kap. 5 Marketing", text: "Wie soll dich BtMM erreichen?", info: "BtMM soll dich ehrlich und ruhig erreichen — ohne Druck, mit klaren Zahlen wo nötig. Wie Werbung ankommt, darfst du mitbestimmen.", antworten: [
    { t: "Ehrlich und ruhig, ohne Druck", w: { konzept: 1, mitmachen: 1 }, p: { sinn: 1 } },
    { t: "Mit klaren Zahlen und Terminen", w: { "was-du-sparst": 1, kosten: 1 }, p: { sparen: 3 } },
    { t: "Gar nicht aktiv — ich komme selbst", w: { faq: 1 }, p: {  } }
  ] },
  { id: "i34", schale: "innen", prio: 34, q: "D02 „Für Betriebe, Vereine und Initiativen“", text: "Passt der Partner-Weg zu einer Organisation von dir?", info: "Für Betriebe, Vereine und Initiativen gibt es den Partner-Weg. Wenn du eine Organisation mitbringst, ist das ein eigener Einstieg.", antworten: [
    { t: "Ja", w: { mitmachen: 2, konzept: 1 }, p: { anbieter: 2 } },
    { t: "Vielleicht", w: { mitmachen: 1 }, p: {  } },
    { t: "Nein", w: {  }, p: {  } }
  ] },
];

BTMM.POOL_ECHT = 102;
BTMM.POOL_KI_PLATZHALTER = 0; /* Pool ≥100 dokumentgestützt; KI-Vertiefungen bleiben optionale Simulation darüber hinaus */
BTMM.VERTEILUNG = {
  '5':  { aussen: 2, mitte: 2, innen: 1 },
  '10': { aussen: 4, mitte: 3, innen: 3 },
  'alle': { aussen: 99, mitte: 99, innen: 99 },
  '100plus': { aussen: 99, mitte: 99, innen: 99 }
};

/* KI-Vertiefung: Konzept/Simulation nach Pool-Ende bei Wahl „100+“. Deutlich im UI gekennzeichnet. */
BTMM.KI_VERTIEFUNGEN = [
  { id: 'kv1', wennStandpunkt: 'skeptisch', q: 'Konzept · Folgefrage (Simulation)', text: 'Du wirkst skeptisch. Welche Belege würden dich am ehesten überzeugen?', antworten: [
    { t: 'Belegte Aufträge des ersten Betriebs', w: { 'offene-fragen': 2, geldfluss: 2 }, p: { skeptisch: 1 } },
    { t: 'Geprüfte Satzung', w: { dokumente: 3 }, p: { skeptisch: 1 } },
    { t: 'Unabhängige Zahlenprüfung', w: { 'was-du-sparst': 2, 'offene-fragen': 1 }, p: { skeptisch: 1 } } ], hinweis: 'Simulierte Vertiefung aus Standpunkt „skeptisch“ + Pool-Ende' },
  { id: 'kv2', wennStandpunkt: 'sparen', q: 'Konzept · Folgefrage (Simulation)', text: 'Du willst sparen. Soll die nächste Seite zuerst Euro oder Stunden zeigen?', antworten: [
    { t: 'Euro im Monat', w: { 'was-du-sparst': 3, kosten: 1 }, p: { sparen: 1 } },
    { t: 'Stunden weniger Arbeit', w: { 'was-du-sparst': 2, konzept: 1 }, p: { sparen: 1 } },
    { t: 'Beides kurz', w: { 'was-du-sparst': 2, faq: 1 }, p: {} } ], hinweis: 'Simulierte Vertiefung aus Standpunkt „sparen“' },
  { id: 'kv3', wennStandpunkt: 'gruenden', q: 'Konzept · Folgefrage (Simulation)', text: 'Du willst mit anfangen. Was brauchst du vor dem Kontakt?', antworten: [
    { t: 'Klarheit zu Gründung ohne festes Datum und drei Personen', w: { gruendung: 3 }, p: { gruenden: 1 } },
    { t: 'Kosten und Risiko in einem Blick', w: { kosten: 2, faq: 1 }, p: {} },
    { t: 'Direkt den Mitmachen-Weg', w: { mitmachen: 3 }, p: { gruenden: 1 } } ], hinweis: 'Simulierte Vertiefung aus Standpunkt „gruenden“' },
  { id: 'kv4', wennStandpunkt: 'kunde', q: 'Konzept · Folgefrage (Simulation)', text: 'Körperarbeit scheint relevant. Willst du Ablauf, Grenzen oder BtMM-Bezug zuerst?', antworten: [
    { t: 'Ablauf der Sitzung', w: { koerperarbeit: 3 }, p: { kunde: 1 } },
    { t: 'Was sie nicht ersetzt', w: { koerperarbeit: 2, faq: 1 }, p: { kunde: 1 } },
    { t: 'Rolle als erstes Geschäftsfeld', w: { koerperarbeit: 2, gruendung: 1 }, p: {} } ], hinweis: 'Simulierte Vertiefung aus Standpunkt „kunde“' },
  { id: 'kv5', wennStandpunkt: 'anbieter', q: 'Konzept · Folgefrage (Simulation)', text: 'Du denkst an Mitwirken im Betrieb. Was zuerst?', antworten: [
    { t: 'Lohn und Mindestlohn-Regel', w: { geldfluss: 3 }, p: { anbieter: 1 } },
    { t: 'Selbstständig bis zur Gründung', w: { geldfluss: 1, faq: 1 }, p: { anbieter: 1 } },
    { t: 'Zellen und Teams', w: { zellen: 2 }, p: {} } ], hinweis: 'Simulierte Vertiefung aus Standpunkt „anbieter“' },
  { id: 'kv6', wennStandpunkt: 'sinn', q: 'Konzept · Folgefrage (Simulation)', text: 'Sinn und Gemeinschaft stehen vorn. Was soll die Seite betonen?', antworten: [
    { t: 'Werte und Haltung', w: { konzept: 3 }, p: { sinn: 1 } },
    { t: 'Orte und Zellen', w: { zellen: 2, mitmachen: 1 }, p: { sinn: 1 } },
    { t: 'Aufruf: ihr müsst nicht allein kämpfen', w: { mitmachen: 2, konzept: 1 }, p: { sinn: 1 } } ], hinweis: 'Simulierte Vertiefung aus Standpunkt „sinn“' },
  { id: 'kv7', wennStandpunkt: 'neugierig', q: 'Konzept · Folgefrage (Simulation)', text: 'Neugierig — welche Schale soll als Nächstes aufklappen?', antworten: [
    { t: 'Worum es geht (außen)', w: { 'so-funktionierts': 2, faq: 1 }, p: { neugierig: 1 } },
    { t: 'Wie es läuft (Mitte)', w: { geldfluss: 1, kosten: 1, zellen: 1 }, p: {} },
    { t: 'Wie du dabei bist (innen)', w: { mitmachen: 2, unterstuetzen: 1 }, p: {} } ], hinweis: 'Simulierte Vertiefung aus Standpunkt „neugierig“' },
  { id: 'kv8', wennStandpunkt: null, q: 'Konzept · Meta (Simulation)', text: 'Soll die KI eher nachfragen oder eher Seiten umsortieren?', antworten: [
    { t: 'Weiter nachfragen', w: { faq: 1 }, p: {} },
    { t: 'Jetzt Seitenreihenfolge zeigen', w: {}, p: {} },
    { t: 'Beides kurz', w: {}, p: {} } ], hinweis: 'Allgemeine Simulationskarte nach Pool-Ende' }
];

/* ARGUMENTKETTEN je Standpunkt: außen sanft, innen das Hauptargument. Jede Aussage aus einem Dokument, Quelle dabei. */
BTMM.ARGUMENTE = {
  neugierig: {
    aussen: { kern: 'Teilen, was einzeln teuer ist.', punkte: ['Einkauf, Carsharing, Räume und Werkzeug', 'Dein Einkommen behältst du'], quelle: 'D00, „Ein Haus mit drei Säulen“' },
    mitte:  { kern: 'Eine Stunde ist eine Stunde.', punkte: ['Derselbe Lohn für jede Arbeit', 'Teams von höchstens zwölf, ohne Chefs'], quelle: 'D00, „Arbeiten“' },
    innen:  { kern: 'Mehr Leben statt mehr Umsatz.', punkte: ['Wer teilt, kauft weniger und lebt trotzdem besser', 'Das ist der Kern von Sinnmaximierung'], quelle: 'D00, „Das Ziel“' }
  },
  sparen: {
    aussen: { kern: 'Gemeinsam einkaufen, auf eigene Rechnung.', punkte: ['Beim Bio-Großhandel', 'Keine gemeinsame Kasse'], quelle: 'D02, „Was entstehen soll“; D00, „Vom Haus zur Stadt“' },
    mitte:  { kern: 'Dein Beitrag ist nie höher als deine Ersparnis.', punkte: ['Beitrag nur, wenn du die gemeinsamen Dinge nutzt', 'Vor der Eintragung kein Geld außer für Leistungen'], quelle: 'D00, „Die Waage“; D02' },
    innen:  { kern: 'Zu dritt rund 240 € mehr im Monat, für jeden.', punkte: ['Bei 20 Mitgliedern rund 29 Stunden weniger Arbeit im Monat', 'Modellrechnung, keine Prognose'], quelle: 'D02, „Was entstehen soll“; D00, „Das Ziel“' }
  },
  kunde: {
    aussen: { kern: 'Zeit zum Entspannen, mit sanften Schwingungen.', punkte: ['Den ganzen Körper bewusst wahrnehmen', 'Für Menschen jeden Alters'], quelle: 'KA, landing.text, fuer_wen' },
    mitte:  { kern: 'Körperarbeit für alle, als Teil des Alltags.', punkte: ['Ein fester Moment der Ruhe', 'Ersetzt keine medizinische Behandlung'], quelle: 'D00, „Gesundheit“; KA, fuer_wen' },
    innen:  { kern: 'Deine Sitzung trägt den ersten Betrieb.', punkte: ['Körperarbeit ist das erste Geschäftsfeld der Genossenschaft', 'Angestellt wird erst, wenn belegte Aufträge da sind'], quelle: 'S, § 1 Abs. 4; D00, „Ehrlich gesagt“' }
  },
  anbieter: {
    aussen: { kern: 'Bis zur Gründung bleibst du selbstständig.', punkte: ['Eigene Rechnungen', 'Niemand wird angestellt'], quelle: 'D28, Stufenplan' },
    mitte:  { kern: 'Was gemeinsam getragen wird, wird für jeden kleiner.', punkte: ['Fixkosten, Versicherung, Buchhaltung', 'Schlechte Monate trägst du nicht allein'], quelle: 'D01, Kap. 1' },
    innen:  { kern: 'Eine Stunde ist eine Stunde, gleich welcher Beruf.', punkte: ['Mindestens Mindestlohn, nie nur aus dem Überschuss', 'Den Betrieb führen die, die in ihm arbeiten'], quelle: 'D01, Kap. 1 und 6; O, § 9' }
  },
  gruenden: {
    aussen: { kern: 'Erst leben, dann gründen.', punkte: ['Gemeinsam einkaufen und Stunden tauschen', 'Ganz ohne Genossenschaft'], quelle: 'D00, „Vom Haus zur Stadt“' },
    mitte:  { kern: 'Du riskierst höchstens deinen Anteil.', punkte: ['Keine Nachschüsse', '100 €, in Raten ab 10 €, ein Jahr Kündigungsfrist'], quelle: 'S, § 2 Abs. 1 und 4, § 6 Abs. 1' },
    innen:  { kern: 'Du bestimmst von Anfang an, wie der Ort wird.', punkte: ['Welche Betriebe, welche Regeln, welche Kultur', 'Gründung so bald wie möglich, sobald drei Mitglieder da sind'], quelle: 'D00, „Die ersten drei“; BP, Weg A; S, Unterschriften' }
  },
  skeptisch: {
    aussen: { kern: 'Wir sagen offen, was noch nicht geklärt ist.', punkte: ['Die Satzung ist ein Entwurf', 'Alle Zahlen sind Modellrechnungen'], quelle: 'S, Vorbemerkung; D02, „Kurz gesagt“' },
    mitte:  { kern: 'Vor der Eintragung nimmt niemand Geld an.', punkte: ['Außer für Leistungen, die du bekommst', 'Keine Spenden vorher'], quelle: 'D02, „Kurz gesagt“, „Spenden“' },
    innen:  { kern: 'Gegründet wird erst, wenn es trägt.', punkte: ['Angestellt wird erst mit belegten Aufträgen', 'Sechs Monate unter Plan: die Mitglieder entscheiden, keine neuen Kredite'], quelle: 'D00, „Ehrlich gesagt“; S, § 3 Abs. 5' }
  },
  sinn: {
    aussen: { kern: 'Kein Produkt. Kein Abo. Keine App.', punkte: ['Teil von etwas sein, das wirklich trägt'], quelle: 'D02, „Es gibt einen Moment“' },
    mitte:  { kern: 'Elf Werte tragen alles andere.', punkte: ['Gleichwürdigkeit, Gewaltfreiheit, Nachhaltigkeit', 'Eine Stunde ist eine Stunde'], quelle: 'D01, Kap. 6' },
    innen:  { kern: 'Ihr müsst nicht alleine kämpfen.', punkte: ['Eine Gemeinschaft, in der Menschen füreinander da sind', 'Gebraucht werden Menschen, die sagen: Ich glaube daran'], quelle: 'D02, „Was entstehen soll“, „Was nicht gebraucht wird“' }
  }
};
