export type Vertiefung = {
  slug: string; titel: string; kurz: string; einstieg: string
  abschnitte: { titel: string; text: string }[]
  ersterSchritt: string; offen: string; quellen: string[]
}
export const VERTIEFUNGEN: Vertiefung[] = [
  {
    "slug": "keim-vor-ort",
    "titel": "Gemeinsam anfangen – der Keim vor Ort",
    "kurz": "Was schon zu dritt geht und was vor dem ersten Betrieb geklärt sein muss.",
    "einstieg": "Du brauchst nicht zuerst ein Haus oder eine große Organisation. Der Anfang sind Menschen am selben Ort, die ausprobieren, was sie gemeinsam leichter machen können.",
    "abschnitte": [
      {
        "titel": "Erst im Alltag ausprobieren",
        "text": "Ein Keim ist zunächst eine Verabredung, noch keine eingetragene Genossenschaft. Ihr schaut: Wer ist dabei? Welche Fähigkeiten, Räume und Werkzeuge gibt es? Was lohnt sich zu teilen? Beim Einkauf bezahlt jede Person selbst. Die gemeinsame Keim-Kasse ruht, bis ihre rechtliche Gestaltung geklärt ist."
      },
      {
        "titel": "Arbeit und freiwilliger Aufbau sind verschieden",
        "text": "Wer vor der Gründung bezahlte Aufträge übernimmt, handelt im eigenen Namen und rechnet selbst ab. Gewerbe, Versicherung und mögliche Sozialleistungen müssen vorher geklärt werden. Freiwilliger Aufbau ist davon getrennt: Er begründet weder einen Lohnanspruch noch eine spätere Umwandlung in Coins."
      },
      {
        "titel": "Ein Betrieb startet erst, wenn er tragen kann",
        "text": "Belegte Aufträge, eine tragfähige Preisliste und Geld für laufende Kosten gehören vor die erste Anstellung. Geplant ist die Gründung so früh wie möglich mit mindestens drei Menschen. Entscheidend ist, dass der erste Betrieb seine bezahlten Stunden auch in schwächeren Monaten finanzieren kann. Eine große Idee ersetzt diesen Nachweis nicht."
      },
      {
        "titel": "Nicht jeder neue Ort braucht eine neue Genossenschaft",
        "text": "Nach dem Entwurf können neue Gruppen über eine bestehende Zelle begleitet werden und später eine eigene Zelle derselben eG bilden. Ein erster Versuch vor Ort kann mit einem bestehenden Betrieb zusammenarbeiten. Keim-Karte, Begleitung und solche Pilotfelder sind geplant, noch kein überall verfügbares Angebot."
      },
      {
        "titel": "Der erste Versuch liefert echte Erfahrung",
        "text": "Die Dokumente sind bisher weiter entwickelt als der gemeinschaftliche Alltag. Deshalb soll der Anfang offen festhalten, was wirklich gespart wird, wie viel Zeit benötigt wird und welche Aufträge tatsächlich kommen. Auch schwache Ergebnisse zählen: Sie zeigen, was geändert werden muss, bevor größere Verpflichtungen entstehen."
      }
    ],
    "ersterSchritt": "Sprich mit zwei Menschen in deiner Nähe: Was würdet ihr wirklich gemeinsam nutzen? Notiert einen kleinen Versuch und meldet euch damit bei uns.",
    "offen": "Haftung, gemeinsame Kasse, Gewerbe und Vorverkauf müssen vor der praktischen Umsetzung mit Fachleuten geklärt werden. Verkauft wird nur eine Leistung, die tatsächlich erbracht werden kann.",
    "quellen": [
      "00 Start hier v1.16.0",
      "03 Einladung zur Gründung v2.15.1",
      "28 Aufnahme kurz erklärt v1.8.1",
      "29 Der Keim v1.3.1",
      "Satzung v7.35.0, § 13a und § 15",
      "25 Ehrliche Bilanz v1.2.0"
    ]
  },
  {
    "slug": "mitentscheiden",
    "titel": "Mitentscheiden und miteinander leben",
    "kurz": "Eine Person, eine Stimme. Kleine Gruppen, begründete Einwände und Schutz vor Machtmissbrauch.",
    "einstieg": "Gemeinsames Eigentum allein macht noch keine gute Gemeinschaft. Menschen brauchen verständliche Entscheidungen, geschützte Grenzen und einen fairen Weg, dazuzukommen.",
    "abschnitte": [
      {
        "titel": "Eine Person, eine Stimme",
        "text": "Im BtMM-Entwurf hat jedes Mitglied eine Stimme. Mehr Geld bringt keine zusätzlichen Stimmen und keinen höheren Stundenlohn. Was den Alltag einer Zelle betrifft, soll sie selbst entscheiden. Übergreifende Fragen gehören auf die gemeinsame Ebene."
      },
      {
        "titel": "Einwände helfen, Vorschläge besser zu machen",
        "text": "Das Demokratie-Papier schlägt Konsent für Entscheidungen in der Zelle vor: Ein Vorschlag kann gelten, wenn kein schwerwiegender, begründeter Einwand bleibt. Das heißt nicht, dass alle begeistert sein müssen. Für Entscheidungen über mehrere Zellen wird zusätzlich eine doppelte Mehrheit diskutiert – bei den Mitgliedern und bei den Zellen. So sollen große Gruppen kleine nicht einfach überstimmen."
      },
      {
        "titel": "Kennenlernen statt vorschnell dazugehören müssen",
        "text": "Unterstützen ist ein eigener, vollwertiger Weg. Wer später Mitglied werden möchte, lernt die Gruppe im gemeinsamen Tun und mit Begleitung kennen. Die Anwärterzeit ist im Entwurf vorläufig für Erwachsene vorgesehen. Einwände sollen benennen, was noch gebraucht wird; niemand muss sich in eine höhere Stufe drängen lassen."
      },
      {
        "titel": "Gemeinschaft braucht auch Grenzen",
        "text": "Freiwilligkeit, Rückzug und ein respektvoller Umgang gehören zum Alltag. Bei Konflikten sind Klärung und Wiedergutmachung vorgesehen. Bei Gewalt und Grenzverletzungen hat der Schutz Betroffener Vorrang; ein gemeinsames Gespräch darf ihnen nicht aufgezwungen werden. Vertrauenspersonen, unabhängige Ansprechstellen und begrenzte Ämter sollen Macht kontrollierbar machen."
      },
      {
        "titel": "Früh merken, wenn etwas nicht stimmt",
        "text": "Die Zellen sollen regelmäßig nach Überlastung, Nutzen, Zusammenarbeit und ökologischer Wirkung schauen. Dazu kommen Besuche anderer Gruppen mit einem Blick von außen. Diese Rückmeldungen sollen helfen, bevor ein Konflikt oder eine Überforderung groß wird – sie sind keine Überwachung und kein Versprechen, jeden Schaden zu verhindern."
      }
    ],
    "ersterSchritt": "Bring eine Frage oder einen begründeten Einwand mit. Du musst nicht mit allem einverstanden sein, um die Idee kennenzulernen.",
    "offen": "Die doppelte Mehrheit ist ein Vorschlag aus dem Demokratie-Papier, keine bereits geltende Regel. Ihre rechtliche Zulässigkeit und die endgültigen Aufnahme- und Entscheidungsverfahren werden noch geprüft.",
    "quellen": [
      "05 Gemeinschaftskultur v1.7.2",
      "22 Heilen, Schützen, Vorbeugen v1.9.1",
      "18 Demokratie-Schlüssel v1.3.1",
      "28 Aufnahme kurz erklärt v1.8.1",
      "Satzung v7.35.0, §§ 4–10 und §§ 18–23"
    ]
  },
  {
    "slug": "arbeiten-und-lernen",
    "titel": "Arbeiten, lernen und Wissen weitergeben",
    "kurz": "Gleicher Stundenlohn, kleine Teams und Wege zu den Qualifikationen, die wirklich gebraucht werden.",
    "einstieg": "Bei BtMM soll Können wachsen können. Dabei sind drei Dinge zu unterscheiden: bezahlte Betriebsarbeit, gegenseitiger Tausch und freiwilliges Engagement.",
    "abschnitte": [
      {
        "titel": "Jede bezahlte Stunde zählt gleich",
        "text": "In den geplanten Gemeinschaftsbetrieben sind die Beschäftigten angestellt. Für bezahlte Arbeit soll derselbe Grundlohn gelten, unabhängig vom Beruf. Gearbeitet wird in überschaubaren Teams mit höchstens zwölf Menschen; größere Betriebe können aus mehreren Teams bestehen. Der Zielwert von 20 Euro brutto je Stunde ist ein Planwert, kein heute verfügbares Lohnangebot."
      },
      {
        "titel": "Der Lohn braucht echte Aufträge",
        "text": "Ein Betrieb darf nur so viele bezahlte Stunden vereinbaren, wie Aufträge und Finanzierung tragen. Gearbeitete Betriebsstunden sind zu bezahlen; der gesetzliche Mindestlohn bleibt die Untergrenze. Im Aufbau kann das zunächst eine kleine Stelle sein. Bonus und Überschuss sind nicht garantiert. Wer freiwillig beim Aufbau hilft, erhält daraus keinen späteren Zahlungsanspruch; Arbeit für zahlende Kundschaft wird davon getrennt."
      },
      {
        "titel": "Ohne Abschluss heißt nicht ohne Regeln",
        "text": "Erfahrung und gegenseitiges Lernen sollen einen Einstieg ermöglichen. Doch manche Tätigkeiten verlangen einen anerkannten Abschluss, eine Erlaubnis, Sachkunde oder eine fachliche Abnahme. Das gilt auch innerhalb der Gemeinschaft. Die Berufsliste ist eine Orientierung – keine pauschale Erlaubnis für Handwerk, Heilkunde, Betreuung oder sicherheitsrelevante Arbeiten."
      },
      {
        "titel": "Qualifizierung gemeinsam tragen",
        "text": "Ein geplanter Qualifizierungsfonds soll benötigte Nachweise und Abschlüsse ermöglichen. Zuerst werden öffentliche Förderung und der Beitrag des nutzenden Betriebs geprüft. Für den verbleibenden Bedarf sind Zuschüsse gegen Wissensweitergabe oder zinslose Darlehen vorgesehen. Förderung, Rückzahlung und mögliche Bindung werden vor Beginn vereinbart – nicht erst beim Austritt."
      }
    ],
    "ersterSchritt": "Notiere, was du kannst, was du lernen möchtest und welche konkrete Aufgabe damit für andere leichter wird. Zuständige Kammern oder Behörden klären, welche Nachweise dafür nötig sind.",
    "offen": "Es gibt noch keinen auszahlenden Qualifizierungsfonds und keine zugesagte Stelle. Finanzierbarkeit, Arbeitsrecht, Förderbedingungen und die Darlehensgestaltung müssen vor ihrer Einführung geprüft werden.",
    "quellen": [
      "04 Wirtschaften v3.15.1",
      "11 Handwerk v3.2.0",
      "12 Zulassungen v3.0.0",
      "16 Schnelle Einnahmen v2.1.2",
      "20 Berufe ohne Abschluss v1.0.1",
      "21 Bildung finanzieren v1.4.0",
      "Satzung v7.35.0, § 8b und §§ 13–15",
      "25 Ehrliche Bilanz v1.2.0"
    ]
  },
  {
    "slug": "hilfe-bei-ausfall",
    "titel": "Wenn jemand ausfällt: Hilfe vorher organisieren",
    "kurz": "Vertretung für Tiere, Kinder und wichtige Aufgaben – und was der Solidarfonds leisten soll.",
    "einstieg": "Wer krank wird oder einen anderen Notfall erlebt, sollte nicht erst dann erklären müssen, wer die Tiere versorgt oder eine wichtige Aufgabe übernimmt.",
    "abschnitte": [
      {
        "titel": "Die Notfallkarte kommt vor dem Notfall",
        "text": "Geplant sind vorher vereinbarte Hilfekreise und benannte Vertretungen. Eine Notfallkarte hält fest, welche Aufgaben anfallen und wer erreichbar ist. Für besonders wichtige Aufgaben sollen zwei Menschen einspringen können, damit Versorgung nicht an einer einzigen Person hängt."
      },
      {
        "titel": "Hilfe in Stufen",
        "text": "Der Entwurf unterscheidet kurzfristige Hilfe im direkten Umfeld, einen organisierten Ausfall-Dienst und nötigenfalls externe Fachleute. Kleine Gruppen können längere Ausfälle selten allein tragen. Deshalb gehören gegenseitige Hilfe mit anderen Gruppen und professionelle Unterstützung von Anfang an in den Plan."
      },
      {
        "titel": "Solidarität ergänzt die gesetzliche Absicherung",
        "text": "Ein Solidarfonds ist für besondere Lebenslagen vorgesehen, etwa Krankheit, Elternzeit oder Pflege. Er ersetzt weder Sozialversicherung noch gesetzliche Arbeitgeberpflichten. Nach dem Satzungsentwurf wird er angespart, zahlt aber erst nach sechs aufeinanderfolgenden Perioden mit mindestens zehn wirtschaftlich aktiven Vollmitgliedern und ausreichend tragfähigem Lohn. Ausgezahlt werden kann nur, was vorhanden ist."
      },
      {
        "titel": "Privates bleibt geschützt",
        "text": "Fallakten und persönliche Angaben sollen nur die Menschen sehen, die eine Hilfe tatsächlich bearbeiten. Die Gemeinschaft ersetzt keine Vorsorgevollmacht, keinen Pflegedienst und keine medizinische Versorgung. Rechtliche Verantwortung für Kinder, Tiere oder den Betrieb verschwindet durch eine Vertretungsabsprache nicht."
      }
    ],
    "ersterSchritt": "Schreibe auf, welche Versorgung bei deinem Ausfall weiterlaufen muss, und sprich mit zwei vertrauten Menschen über eine Vertretung. Das lässt sich schon heute außerhalb von BtMM vorbereiten.",
    "offen": "Das ist ein geplantes Versorgungsmodell, kein verfügbarer Notfall- oder Pflegedienst. Versicherung, Datenschutz, Zuständigkeiten und die finanzielle Tragfähigkeit werden vor der Umsetzung geklärt. Bei einem akuten Notfall gelten die regulären Hilfs- und Rettungsdienste.",
    "quellen": [
      "19 Soziale Zahlen v1.20.0",
      "22 Heilen, Schützen, Vorbeugen v1.9.1",
      "23 Ausfall und Versorgung v1.5.0",
      "Satzung v7.35.0, § 18b, § 18c und § 24"
    ]
  },
  {
    "slug": "wohnen-und-eigentum",
    "titel": "Gemeinsam besitzen, langfristig wohnen",
    "kurz": "Kostenmiete, Schutz vor spekulativem Verkauf und ein realistischer Weg zum ersten Haus.",
    "einstieg": "Häuser, Land und Werkstätten sollen der Gemeinschaft dauerhaft dienen. Ihr Wert soll sich in einem guten Alltag zeigen, nicht in einem möglichst hohen Verkaufspreis.",
    "abschnitte": [
      {
        "titel": "Miete soll die Kosten decken",
        "text": "Die geplante Kostenmiete umfasst Finanzierung, Betrieb und Instandhaltung. Sie enthält keinen Renditeaufschlag für private Eigentümer. Das macht ein Haus nicht automatisch billig: Kaufpreis, Baukosten, Zinsen und Rücklagen entscheiden, ob ein Vorhaben wirklich tragfähig ist."
      },
      {
        "titel": "Gemeinsames Eigentum schützen",
        "text": "Boden und Gebäude sollen dem spekulativen Verkauf dauerhaft entzogen werden. Dafür sieht der Entwurf eine zusätzliche Sicherung etwa über Erbbaurecht, eine Stiftung oder eine Besitzgesellschaft mit Vetorecht vor. Welche Gestaltung passt, wird vor dem ersten Haus fachlich geklärt."
      },
      {
        "titel": "Bedarf geht vor frühem Dabeisein",
        "text": "Für die Vergabe ist eine transparente Reihenfolge vorgesehen: akute Not, Familien und besondere Bedürfnisse gehen vor bloßer Dauer der Mitgliedschaft. Freiwilliger Aufbau kann innerhalb einer vergleichbaren Bedarfsstufe berücksichtigt werden. Eine Wohnungszusage ergibt sich daraus nicht."
      },
      {
        "titel": "Schritt für Schritt statt eines festen Versprechens",
        "text": "Der Fahrplan beginnt mit gemeinsamem Nutzen und tragfähigen Betrieben. Häuser, Energieanlagen, Schulen oder größere Versorgungseinrichtungen brauchen danach eigenes Kapital und passende Genehmigungen. Sie konkurrieren um dieselben Mittel. Jahreszahlen und Mitgliederzahlen im Rechenmodell sind Szenarien, keine zugesagten Eröffnungstermine."
      }
    ],
    "ersterSchritt": "Teile uns mit, ob du einen geeigneten Ort kennst oder Erfahrung mit gemeinschaftlichem Wohnen, Finanzierung oder Instandhaltung einbringen möchtest.",
    "offen": "Es gibt noch keinen zugesagten Wohnraum. Finanzierung, dauerhafte Eigentumsbindung und die konkrete Vergabeordnung müssen vor einem Wohnprojekt geprüft und beschlossen werden.",
    "quellen": [
      "07 Konzept v22.49.3, Säule 3",
      "17 Großer Fahrplan v1.2.0",
      "Satzung v7.35.0, § 25 und § 25a"
    ]
  },
  {
    "slug": "partner-und-kreislauf",
    "titel": "Partner finden und Ressourcen im Kreislauf halten",
    "kurz": "Bestehende gute Angebote nutzen, reparieren und Unternehmen schrittweise einbinden.",
    "einstieg": "BtMM muss nicht alles selbst neu aufbauen. Wo es bereits ein faires und ökologisches Angebot gibt, soll die Gemeinschaft es nutzen und stärken.",
    "abschnitte": [
      {
        "titel": "Zusammenarbeiten, ohne sich aufzulösen",
        "text": "Höfe, Werkstätten, Läden, Vereine und andere Genossenschaften können nach dem Konzept Partner werden und eigenständig bleiben. Denkbar sind gemeinsame Nachfrage, Vermittlung oder geteilte Dienste. Partner sein ist etwas anderes, als ein Betrieb der Genossenschaft zu werden."
      },
      {
        "titel": "Mit gegenseitiger Hilfe anfangen",
        "text": "Als kleiner erster Schritt ist ein Tandem vorgesehen: zwei eigenständige Gruppen geben einander einen Blick von außen, teilen Erfahrungen und planen Hilfe bei Ausfällen. Weitergehende Schritte – Partnerzeichen, Mitgliedschaft oder ein gemeinsamer Betrieb – bleiben freiwillige, getrennte Entscheidungen. Was bereits möglich ist, muss jeweils konkret vereinbart werden."
      },
      {
        "titel": "Ein freiwilliger Weg für bestehende Unternehmen",
        "text": "Wer weitergehen möchte, kann schrittweise mehr Transparenz, eine faire Verteilung und Beteiligung der Mitarbeitenden entwickeln. Am Ende eines freiwilligen Übergangs kann ein Gemeinschaftsbetrieb mit gleichem Stundenlohn und gleicher Stimme stehen. Der erreichte Stand soll nachvollziehbar sein, statt einen schon vollzogenen Wandel vorzutäuschen."
      },
      {
        "titel": "Nutzen, reparieren, weitergeben",
        "text": "Werkzeug und Räume teilen, Gebrauchtes verwenden, Geräte pflegen und Dinge reparieren: So sinken Materialverbrauch und Kosten. Auch für gemeinsame Häuser soll Instandhaltung angespart werden. Neu gebaut oder ersetzt wird dort, wo vorhandene Lösungen nicht ausreichen."
      },
      {
        "titel": "Lebensqualität ist das Maß",
        "text": "Mehr Umsatz allein ist kein Erfolg. Entscheidend sind gewonnene freie Zeit, Zugang zu gutem Essen, Bildung und Gesundheit sowie die ökologische Wirkung. Die Gemeinschaft soll auch dann vorankommen können, wenn weniger neu gekauft wird."
      },
      {
        "titel": "Fairen Handel nachvollziehbar machen",
        "text": "Regional zuerst, kurze Wege und transparente Herkunft sind die Leitlinie. Material, Lieferkette und Preisaufbau sollen belegbar sein. Eigene Motive, Verleih, Reparatur oder Workshops können bestehende gute Angebote ergänzen. Ein Markenname oder Partnerzeichen ersetzt weder Nachweise noch eine unabhängige Zertifizierung."
      },
      {
        "titel": "Der Kreislauf ist ein zusätzlicher Vorschlag",
        "text": "Weitergeben, tauschen, leihen, reparieren, gebraucht verkaufen und erst dann verwerten: Das Kreislauf-Papier beschreibt dafür eine mögliche Reihenfolge. Zuerst sollen vorhandene Tauschpartys und Repair-Cafés genutzt werden. Eigene Regale, Läden und Reparaturangebote sind optionale spätere Schritte; ihre Ersparnisse werden nicht automatisch in das Grundmodell eingerechnet."
      }
    ],
    "ersterSchritt": "Wenn dein Betrieb oder deine Initiative ähnliche Werte lebt, schreib uns, welche konkrete Zusammenarbeit du dir vorstellen kannst. Ein kleines gemeinsames Vorhaben ist ein guter Anfang.",
    "offen": "Partner-Netz, Handel und eigene Kreislauf-Angebote sind im Aufbau. Kosten, verlässliche Nachfrage, Liefernachweise sowie die Trennung von bezahlter Arbeit und freiwilligem Engagement müssen jeweils geklärt werden. Ein Partnerzeichen wäre keine unabhängige Zertifizierung; ein geprüftes Nachhaltigkeitssiegel ist lediglich eine spätere Idee.",
    "quellen": [
      "00 Start hier v1.16.0",
      "04 Wirtschaften v3.15.1, Kapitel 17",
      "07 Konzept v22.49.3, Partner-Netz",
      "13 Ideen und Horizonte v3.4.1",
      "Satzung v7.35.0, § 18a und § 25a",
      "24 Partner werden v1.5.1",
      "26 Fairer Handel v1.5.0",
      "27 Kreislauf v1.2.0"
    ]
  }
]
