// Persona-Modell für die Überzeugungstür (deterministisch, kein LLM).
// Gewichte laut Nutzer via Dirigent 24.11.2026 00:00. Antworten = realistische Freitext-Varianten je Tür-Frage.
// Bedürfnisse (needs) beziehen sich auf Themen aus themen.mjs; Gewicht 1–3.

export const ARCHETYPEN = {
  meister: { w: 10, label: 'Meister mit Betrieb', schwelle: 0.62, eigen: ['handwerk', 'arbeiten'],
    needs: { betrieb_entlastung: 3, handwerk_recht: 3, lohn: 2, unternehmer: 1, belege: 1 } },
  geselle_werkstatt: { w: 10, label: 'Geselle mit eigener Werkstatt', schwelle: 0.58, eigen: ['handwerk', 'arbeiten'],
    needs: { betrieb_entlastung: 3, handwerk_recht: 3, lohn: 2, einkauf: 1 } },
  tischler: { w: 8, label: 'Tischler/Schreiner', schwelle: 0.6, eigen: ['handwerk', 'arbeiten'],
    needs: { handwerk_recht: 3, betrieb_entlastung: 3, einkauf: 2, lohn: 1 } },
  gewerke: { w: 7, label: 'Andere Gewerke', schwelle: 0.58, eigen: ['handwerk', 'arbeiten'],
    needs: { handwerk_recht: 2, betrieb_entlastung: 3, lohn: 2, einkauf: 1 } },
  unternehmer: { w: 10, label: 'Unternehmer anderer Branchen', schwelle: 0.62, eigen: ['handwerk', 'arbeiten'],
    needs: { unternehmer: 3, betrieb_entlastung: 3, lohn: 2, belege: 1 } },
  solo: { w: 10, label: 'Solo-Selbstständige/Freiberufler', schwelle: 0.56, eigen: ['handwerk', 'arbeiten'],
    needs: { betrieb_entlastung: 3, lohn: 2, gemeinschaft: 1, einkauf: 1 } },
  kunde: { w: 15, label: 'Verbraucher/Kunden', schwelle: 0.52, eigen: ['kunde', 'sparen'],
    needs: { kunde: 3, einkauf: 2, idee: 1 } },
  interessiert: { w: 10, label: 'Interessierte ohne Handwerksbezug', schwelle: 0.52, eigen: ['grundlagen', 'sinn'],
    needs: { idee: 3, gemeinschaft: 2, wohnen: 1 } },
  skeptiker: { w: 10, label: 'Skeptiker', schwelle: 0.68, eigen: ['skeptisch', 'dokumente'],
    needs: { belege: 3, idee: 1, lohn: 1, gruendung: 1 } },
  gruender_sparer: { w: 5, label: 'Gründer/Sparer', schwelle: 0.55, eigen: ['gruenden', 'freiburg', 'sparen'],
    needs: { gruendung: 2, einkauf: 2, mitmachen: 1, idee: 1 } },
  unterstuetzer: { w: 5, label: 'Unterstützer/Förderer', schwelle: 0.52, eigen: ['unterstuetzen', 'anpacken', 'grundlagen', 'sinn'],
    needs: { foerdern: 3, idee: 2, mitmachen: 1 } },
}

export const ALTER = { '18-29': 22, '30-49': 38, '50-64': 27, '65+': 13 }
// Lebenslage abhängig vom Alter (Bezeichnungen tabufrei).
export const LEBENSLAGE_NACH_ALTER = {
  '18-29': { berufseinstieg: 55, familie: 15, umbruch: 30, ruhestand: 0 },
  '30-49': { berufseinstieg: 5, familie: 60, umbruch: 35, ruhestand: 0 },
  '50-64': { berufseinstieg: 0, familie: 35, umbruch: 50, ruhestand: 15 },
  '65+': { berufseinstieg: 0, familie: 10, umbruch: 5, ruhestand: 85 },
}
export const LEBENSLAGE_NEED = { berufseinstieg: 'lage_einstieg', familie: 'lage_familie', umbruch: 'lage_umbruch', ruhestand: 'lage_ruhestand' }
export const GERAETE = { hochkant: 30, quer: 10, desktop: 60 }
export const VERTIEFER_ANTEIL = 0.2

// Freitext je Frage. Wörter bewusst alltagsnah: nicht jede Antwort trifft ein Schlagwort.
const ALLG = {
  herkunft: ['Über Instagram.', 'Hab euch gegoogelt.', 'Ein Kollege hat mir davon erzählt.', 'Flyer beim Bäcker.', 'Weiß nicht mehr genau.', 'Durch einen Link in einer Gruppe.', 'Meine Freundin hat es mir geschickt.', 'Zufällig im Netz gefunden.', 'Auf dem Markt am Stand.', 'Ein Bekannter hat es empfohlen.', 'Podcast.', 'Link per WhatsApp bekommen.'],
  ort: ['Ich wohne in Freiburg.', 'In der Nähe von Freiburg, im Breisgau.', 'Eher woanders, in Köln.', 'Stuttgart.', 'Nicht in Freiburg, aber in Baden.', 'Berlin.', 'Ich wohne im Schwarzwald, eine Stunde weg.', 'Hamburg, also weit weg.', 'Offenburg.', 'Lörrach.'],
  zeit: ['Erst mal lesen.', 'Mal vorbeikommen wäre gut.', 'Ich will mitmachen.', 'Wenig Zeit gerade.', 'Erstmal nur anschauen.', 'Kommt drauf an, was ich lese.', 'Gern mal reden.', 'Mit anpacken, wenn es passt.', 'Keine Ahnung.', 'Erstmal beobachten.'],
  leer: ['Hm.', 'Weiß nicht.', 'Mal sehen.', 'ok', 'Gute Frage.', '-'],
}
const A = {
  meister: {
    motiv: ['Ich bin Tischlermeister mit eigenem Betrieb und die Verwaltung frisst mich auf.', 'Ich habe einen Meisterbetrieb mit drei Leuten und frage mich, was das für meinen Betrieb bringt.', 'Als Meister suche ich Entlastung bei Versicherung und Steuerberater.', 'Ich führe seit 20 Jahren einen Handwerksbetrieb und finde keine Nachfolge.', 'Mein Betrieb läuft, aber die Bürokratie wird immer mehr.', 'Elektromeister, mich interessiert, wie die Genossenschaft mit Aufträgen umgeht.'],
    arbeit: ['Meister im Metallbau, eigener Betrieb.', 'Ich leite eine Schreinerei mit Werkstatt.', 'Installateurmeister, selbstständig seit 2009.', 'Malermeister mit Betrieb.'],
    zweifel: ['Wer haftet, und bleibt mein Betrieb meiner?', 'Zahlen und eine echte Satzung.', 'Wie das mit der Handwerksrolle geht.', 'Ob das wirtschaftlich trägt.'],
    sparen: ['Versicherung und Steuerberater kosten mich jedes Jahr ein Vermögen.', 'Material und Werkzeug sind teuer.', 'Die Fixkosten im Betrieb.'],
  },
  geselle_werkstatt: {
    motiv: ['Ich bin Schreinergeselle und habe eine eigene kleine Werkstatt.', 'Geselle mit eigener Werkstatt, ich will mich selbstständig machen, aber allein ist das teuer.', 'Ich hab eine Werkstatt in der Garage und frage mich, ob ich damit Aufträge machen darf.', 'Mich interessiert, ob ich ohne Meisterbrief arbeiten kann.', 'Ich will nicht ewig angestellt bleiben.', 'Ein Freund meinte, das passt zu meiner Werkstatt.'],
    arbeit: ['Zimmerergeselle, nebenher eigene Werkstatt.', 'Ich arbeite als Geselle in einer Schreinerei und baue abends in meiner Werkstatt.', 'Holz, Möbel, alles was man mit den Händen macht.', 'Geselle, aber ich will mein eigenes Ding.'],
    zweifel: ['Ob ich das rechtlich überhaupt darf.', 'Wie die Versicherung geregelt ist.', 'Echte Zahlen.'],
    sparen: ['Die Versicherung für die Werkstatt ist teuer.', 'Maschinen kosten viel Geld.', 'Miete für die Werkstatt.'],
  },
  tischler: {
    motiv: ['Ich bin Tischler und mich interessiert die Zusammenarbeit mit anderen Betrieben.', 'Schreinerin, ich suche einen fairen Rahmen für meine Arbeit.', 'Tischlerei, zwei Leute, wir überlegen, was danach kommt.', 'Mich hat interessiert, wie Möbelbau in so einem Modell läuft.', 'Holz und Handwerk, und ich habe keine Lust mehr auf Preisdruck.'],
    arbeit: ['Tischler im Innenausbau.', 'Ich bin Schreiner und arbeite in einer kleinen Werkstatt.', 'Möbelbau, Küchen, Treppen.', 'Tischlerin, angestellt, aber mit Plänen.'],
    zweifel: ['Wie das mit Meisterpflicht und Haftung läuft.', 'Eine Satzung und Zahlen.', 'Ob das mehr als eine Idee ist.'],
    sparen: ['Holzpreise sind enorm gestiegen.', 'Material und Maschinen.', 'Versicherung und Buchhaltung.'],
  },
  gewerke: {
    motiv: ['Ich bin Elektriker, mich interessiert das Modell.', 'Maler und Lackierer, ich suche Partner.', 'Garten- und Landschaftsbau, kleiner Betrieb.', 'Trockenbau, selbstständig, oft allein.', 'Sanitär, ich will wissen, wie Aufträge verteilt werden.', 'Dachdecker, ich bin neugierig.'],
    arbeit: ['Elektroinstallation.', 'Maler, eigener Betrieb mit einem Azubi.', 'Galabau.', 'Fliesenleger.'],
    zweifel: ['Wie das mit Zulassungen läuft.', 'Wer zahlt die Versicherung.', 'Zahlen.'],
    sparen: ['Sprit und Material.', 'Versicherung.', 'Werkzeug.'],
  },
  unternehmer: {
    motiv: ['Ich habe eine kleine Firma in der IT und suche ein anderes Wirtschaftsmodell.', 'Ich führe ein Café und frage mich, ob das zu uns passt.', 'Unternehmerin im Einzelhandel, mich interessiert die Genossenschaft als Rahmen.', 'Ich habe ein Unternehmen mit zwölf Leuten, wie würde das bei uns laufen?', 'Mich interessiert, wie Gewinne verteilt werden.'],
    arbeit: ['Geschäftsführer einer kleinen Agentur.', 'Ich habe einen Laden.', 'Firma im Bereich Pflegeprodukte.', 'Inhaberin eines Hofladens.'],
    zweifel: ['Rechtsform, Haftung, Zahlen.', 'Ob ich die Kontrolle behalte.', 'Wie Entscheidungen fallen.'],
    sparen: ['Verwaltung, Steuerberater, Versicherungen.', 'Fixkosten.', 'Personal und Miete.'],
  },
  solo: {
    motiv: ['Ich bin freiberufliche Grafikerin und oft allein mit allem.', 'Solo-selbstständig als Übersetzer, Buchhaltung nervt.', 'Ich arbeite freiberuflich und suche Gemeinschaft im Arbeiten.', 'Selbstständige Physiotherapeutin, ich suche einen fairen Rahmen.', 'Freelancer, mir fehlt Absicherung.'],
    arbeit: ['Freiberuflich im Webdesign.', 'Selbstständig als Fotografin.', 'Coach, selbstständig.', 'Ich gebe Kurse, freiberuflich.'],
    zweifel: ['Ob ich frei bleibe.', 'Wie das Geld fließt.', 'Belege.'],
    sparen: ['Versicherung und Steuerberater.', 'Alles allein zahlen.', 'Absicherung und Rente selbst.'],
  },
  kunde: {
    motiv: ['Ich suche jemanden für eine neue Küche.', 'Ich würde gern bei fairen Betrieben einkaufen.', 'Was kann ich bei euch kaufen?', 'Mich interessiert, ob es günstiger ist als im Laden.', 'Ich suche Handwerker für mein Haus.', 'Ich will wissen, was das für mich als Kundin bringt.'],
    sparen: ['Lebensmittel und Miete.', 'Handwerker sind teuer.', 'Einkauf allgemein.', 'Strom.'],
    zweifel: ['Ob die Preise stimmen.', 'Bewertungen.'],
    wohnen: ['Bezahlbare Wohnung.', 'Ein Haus renovieren.'],
  },
  interessiert: {
    motiv: ['Ich will verstehen, worum es geht.', 'Klingt spannend, mehr erfahren.', 'Neugierig auf andere Wirtschaftsformen.', 'Ich interessiere mich für Gemeinwohl.', 'Ich lese gern über neue Ideen.', 'Einfach interessiert.'],
    sinn: ['Gemeinschaft und faire Arbeit.', 'Menschen, die zusammen etwas aufbauen.', 'Weniger allein sein.', 'Nachhaltig leben.'],
    wohnen: ['Gemeinschaftliches Wohnen.', 'Bezahlbares Wohnen.'],
  },
  skeptiker: {
    motiv: ['Ehrlich gesagt bin ich skeptisch.', 'Klingt zu schön, um wahr zu sein.', 'Ich will sehen, wo der Haken ist.', 'Das hat doch schon oft nicht funktioniert.', 'Ich glaube nicht an Utopien.', 'Ich prüfe erst mal.'],
    zweifel: ['Belege, Zahlen und eine echte Satzung.', 'Wer steckt dahinter und wer haftet.', 'Was passiert, wenn es scheitert.', 'Geprüfte Unterlagen.'],
  },
  gruender_sparer: {
    motiv: ['Ich will mitgründen.', 'Ich möchte im Alltag sparen.', 'Ich will beim Aufbau mithelfen.', 'Geld sparen beim Einkauf.', 'Mitglied werden.'],
    sparen: ['Miete und Lebensmittel.', 'Alles wird teurer.', 'Strom und Auto.'],
  },
  unterstuetzer: {
    motiv: ['Ich würde das gern unterstützen.', 'Ich finde die Idee gut und will helfen, auch mit Geld.', 'Wie kann ich das fördern?', 'Ich möchte etwas beitragen, ohne selbst mitzuarbeiten.', 'Ich spende gern für so etwas.'],
    sinn: ['Gerechtere Wirtschaft.', 'Zukunft für die Region.', 'Gemeinschaft.'],
  },
}
// Lebenslage-Zusätze (tabufrei), werden manchmal an die Motiv-Antwort gehängt.
const LAGE = {
  berufseinstieg: ['Ich bin gerade mit der Ausbildung fertig.', 'Ich steh am Anfang im Beruf.', 'Gerade erst eingestiegen.'],
  familie: ['Wir haben zwei Kinder.', 'Mit Familie muss es sich rechnen.', 'Ich muss an die Kinder denken.'],
  umbruch: ['Ich will mich beruflich neu orientieren.', 'Bei mir ändert sich gerade viel im Job.', 'Ich suche was Neues.'],
  ruhestand: ['Ich bin im Ruhestand.', 'Ich bin Rentner und habe Zeit.', 'Ich gehe bald in Rente.'],
}

// ---------- Kontroll-Bank B (Holdout) ----------
// Andere, unabhängig formulierte Alltagsantworten. Geschrieben VOR dem Schlagwort-Tuning von r3 und danach nicht an die
// Schlagworte angepasst. Dient als Gegenprobe gegen Überanpassung (Nutzung: sim.mjs --bank b).
const ALLG_B = {
  herkunft: ['Hat mir jemand aus dem Verein gezeigt.', 'Stand in einer Newsletter-Mail.', 'Über Bekannte.', 'Suchmaschine.', 'Irgendwo verlinkt.', 'Hab einen Aufkleber gesehen.', 'Durch meine Nachbarin.', 'LinkedIn.'],
  ort: ['Wohne im Raum Freiburg.', 'Emmendingen.', 'Weit weg, in Leipzig.', 'Im Elsass, kurz hinter der Grenze.', 'Karlsruhe.', 'Bayern.', 'Direkt in der Stadt.'],
  zeit: ['Erst einmal reinschnuppern.', 'Ein paar Stunden im Monat wären drin.', 'Ich schau mir das in Ruhe an.', 'Kommt auf den Termin an.', 'Gerne aktiv werden.', 'Lieber nur informiert bleiben.'],
  leer: ['Keine Angabe.', 'Egal.', 'Hmm, schwer zu sagen.', 'Nichts weiter.', '...'],
}
const A_B = {
  meister: { motiv: ['Mein Handwerksbetrieb hat sechs Mitarbeiter und ich ersticke im Papierkram.', 'Ich bin Bäckermeister und überlege, wie es mit dem Laden weitergeht.', 'Wir sind ein Familienbetrieb im Heizungsbau und suchen neue Wege.', 'Kfz-Meister, eigene Werkstatt, mich interessiert die Kooperation.'],
    arbeit: ['Heizung und Lüftung, Meisterbetrieb.', 'Bäckerei mit Filiale.', 'Kfz-Werkstatt.'], zweifel: ['Was passiert mit meinem Betrieb, wenn ich beitrete?', 'Wie ist die Haftung geregelt?'], sparen: ['Die Kosten für den Steuerberater.', 'Versicherungen.'] },
  geselle_werkstatt: { motiv: ['Ich bin Zimmermann und habe mir eine kleine Halle gemietet.', 'Gesellin im Metallbau, ich habe eine Werkstatt zuhause.', 'Ich bin gelernter Elektroniker und mache nebenbei Reparaturen.', 'Ich will mit meiner Werkstatt eigene Aufträge annehmen.'],
    arbeit: ['Zimmerei, angestellt, nebenbei eigene Projekte.', 'Metallbau.', 'Reparaturen in der eigenen Werkstatt.'], zweifel: ['Darf ich ohne Meister Aufträge machen?', 'Versicherung.'], sparen: ['Hallenmiete.', 'Werkzeug ist teuer.'] },
  tischler: { motiv: ['Ich baue Möbel und suche Leute, die ähnlich denken.', 'Schreinerei mit drei Leuten, wir wollen fairer arbeiten.', 'Ich bin Tischlerin und mir fehlt ein Netzwerk.'],
    arbeit: ['Möbelbau nach Maß.', 'Schreinerei.'], zweifel: ['Wie läuft das mit der Meisterpflicht?'], sparen: ['Holz und Plattenware.'] },
  gewerke: { motiv: ['Ich bin Steinmetz, kleiner Betrieb.', 'Raumausstatterin, selbstständig.', 'Schornsteinfeger, interessiert mich einfach.', 'Gärtnerei, wir suchen Partner.'],
    arbeit: ['Steinmetz.', 'Polsterei.', 'Gärtnerei.'], zweifel: ['Wie mit Zulassungen umgegangen wird.'], sparen: ['Fahrzeugkosten.'] },
  unternehmer: { motiv: ['Ich betreibe ein kleines Restaurant und bin auf der Suche nach einem faireren Modell.', 'Mir gehört eine Buchhandlung, wäre das was für uns?', 'Wir sind ein Start-up mit acht Leuten.', 'Ich habe eine Praxis für Ergotherapie mit Angestellten.', 'Ich leite ein Familienunternehmen im Großhandel.'],
    arbeit: ['Restaurant.', 'Buchhandlung.', 'Software-Start-up.', 'Therapiepraxis mit Team.'], zweifel: ['Wer entscheidet am Ende?', 'Was ist mit meinen Angestellten?'], sparen: ['Personalkosten und Pacht.'] },
  solo: { motiv: ['Ich bin selbstständige Lektorin und arbeite allein von zuhause.', 'Ich mache Yoga-Kurse auf eigene Rechnung.', 'Ich bin Musiker und lebe von Auftritten.', 'Ich arbeite als Hebamme auf eigene Rechnung.'],
    arbeit: ['Lektorat.', 'Kurse auf eigene Rechnung.', 'Musik.'], zweifel: ['Bleibe ich unabhängig?'], sparen: ['Absicherung als Selbstständige.', 'Altersvorsorge.'] },
  kunde: { motiv: ['Wo kann ich bei euch etwas kaufen?', 'Ich brauche jemanden, der mir das Bad macht.', 'Ich kaufe gern regional und fair ein.', 'Gibt es einen Hofladen oder so?', 'Kann ich bei euch einen Kurs buchen?'],
    sparen: ['Essen wird immer teurer.', 'Reparaturen.'], zweifel: ['Ob das Preis-Leistungs-Verhältnis stimmt.'], wohnen: ['Ich renoviere gerade.'] },
  interessiert: { motiv: ['Hab davon gehört und will mehr wissen.', 'Mich interessiert das Konzept dahinter.', 'Bin einfach neugierig, was ihr macht.', 'Ich finde alternative Wirtschaft spannend.'],
    sinn: ['Dass Menschen sich gegenseitig helfen.', 'Ein anderes Miteinander.'], wohnen: ['Gemeinschaftliches Wohnprojekt.'] },
  skeptiker: { motiv: ['Ich glaube erst, wenn ich es sehe.', 'Wie verdient ihr eigentlich Geld?', 'Das klingt nach Sekte.', 'Wer garantiert, dass das klappt?'],
    zweifel: ['Ich will die Zahlen sehen.', 'Wer sind die Verantwortlichen?', 'Gibt es unabhängige Prüfungen?'] },
  gruender_sparer: { motiv: ['Ich möchte zu den Ersten gehören.', 'Ich will meine Ausgaben senken.', 'Ich will beim Start dabei sein.', 'Ich suche Wege, günstiger zu leben.'],
    sparen: ['Wohnen und Essen.', 'Fahrtkosten.'] },
  unterstuetzer: { motiv: ['Ich möchte so etwas gern voranbringen.', 'Ich habe etwas Geld übrig und will es sinnvoll einsetzen.', 'Kann ich euch irgendwie helfen, ohne selbst Mitglied zu werden?', 'Ich würde gern mit meinem Wissen beitragen.', 'Ich finde, so etwas verdient Rückenwind.'],
    sinn: ['Dass es mehr solcher Projekte gibt.', 'Faire Arbeit.'] },
}
const LAGE_B = {
  berufseinstieg: ['Ich mache gerade meine Lehre.', 'Ich habe letztes Jahr mein Studium abgeschlossen.', 'Ich bin noch ganz neu im Arbeitsleben.', 'Ich suche meinen ersten Job.'],
  familie: ['Ich habe eine kleine Tochter.', 'Wir sind zu viert zuhause.', 'Ich bin alleinerziehend.', 'Unser Sohn kommt bald in die Schule.'],
  umbruch: ['Ich stehe gerade vor einem Jobwechsel.', 'Mein Arbeitsvertrag läuft aus.', 'Ich will mich komplett umorientieren.', 'Gerade ist vieles im Wandel.'],
  ruhestand: ['Ich bin seit zwei Jahren pensioniert.', 'Ich arbeite nicht mehr und habe viel Zeit.', 'Meine Enkel sind schon groß.', 'Ich höre nächstes Jahr auf zu arbeiten.'],
}

// ---------- Kontroll-Bank C (nachträglicher Holdout) ----------
// Geschrieben NACH dem Schlagwort-Tuning von r3 (24.11. ca. 01:45) und danach nicht mehr für Schlagworte genutzt.
// Bewusst andere Satzbauten, Umgangssprache und Tippfehler. Nutzung: sim.mjs --bank c
const ALLG_C = {
  herkunft: ['Weiß ich gar nicht mehr.', 'Hat jemand im Chat geteilt.', 'Radio.', 'Aus dem Stadtteilblatt.', 'Mein Mann hat es gefunden.', 'Durch Zufall.'],
  ort: ['Südlich von Freiburg.', 'Ganz woanders.', 'Ortenau.', 'Nähe Basel.', 'Mannheim.'],
  zeit: ['Weiß noch nicht.', 'Erstmal gucken.', 'Ich hätte Lust mitzumachen.', 'Nur am Wochenende.', 'Viel Zeit habe ich nicht.'],
  leer: ['Kein Kommentar.', 'Später.', 'Hmm.', 'Ka.'],
}
const A_C = {
  meister: { motiv: ['Hab nen Malerbetrieb, Meister seit 15 Jahren, suche Entlastung.', 'Meisterin im Friseurhandwerk mit eigenem Salon.', 'Unser Betrieb sucht einen Nachfolger, vielleicht ist das eine Lösung.'], arbeit: ['Friseursalon.', 'Malerbetrieb.'], zweifel: ['Wer bestimmt dann über meinen Betrieb?'], sparen: ['Die ganzen Abgaben.'] },
  geselle_werkstatt: { motiv: ['Bin Geselle, schraube in meiner eigenen Garage an Fahrrädern.', 'Hab ne kleine Holzwerkstatt und darf nicht offiziell anbieten.', 'Gelernter Installateur mit Werkzeug im Keller.'], arbeit: ['Fahrradreparatur.', 'Holzarbeiten.'], zweifel: ['Ob das legal ist.'], sparen: ['Werkstattkosten.'] },
  tischler: { motiv: ['Ich mach Möbel aus Altholz.', 'Wir sind eine Schreinerei im Dorf.', 'Ich bin Tischlergesellin und suche Kollegen.'], arbeit: ['Altholzmöbel.'], zweifel: ['Meisterpflicht?'], sparen: ['Maschinen.'] },
  gewerke: { motiv: ['Ich bin Fliesenleger und arbeite allein.', 'Wir sind ein kleiner Elektrobetrieb.', 'Ich mache Dachrinnen und Spenglerarbeiten.'], arbeit: ['Spengler.'], zweifel: ['Zulassung?'], sparen: ['Diesel.'] },
  unternehmer: { motiv: ['Mir gehört eine kleine Pension am See.', 'Ich habe einen Onlineshop mit vier Leuten.', 'Wir betreiben eine Physiopraxis.', 'Ich bin Chefin einer Reinigungsfirma.'], arbeit: ['Onlinehandel.', 'Reinigungsfirma.'], zweifel: ['Was wird aus meinem Unternehmen?'], sparen: ['Lohnnebenkosten.'] },
  solo: { motiv: ['Ich bin Illustratorin und mache alles alleine.', 'Ich bin selbständiger Programmierer.', 'Ich arbeite als freie Journalistin.'], arbeit: ['Illustration.', 'Programmieren auf Rechnung.'], zweifel: ['Bleibe ich frei?'], sparen: ['Versicherungen.'] },
  kunde: { motiv: ['Ich möchte Gemüse direkt vom Erzeuger.', 'Mein Dach ist undicht, wer kann das machen?', 'Wo gibts eure Sachen?', 'Ich hätte gern einen Saunagutschein.'], sparen: ['Lebensmittelpreise.'], zweifel: ['Ist das teurer als normal?'], wohnen: ['Altbau sanieren.'] },
  interessiert: { motiv: ['Was ist BtMM eigentlich?', 'Ich hab mal reingeschaut.', 'Erzählt mal.'], sinn: ['Dass nicht jeder für sich kämpft.'], wohnen: ['Wohnprojekt.'] },
  skeptiker: { motiv: ['Wo ist der Pferdefuß?', 'Ich trau dem Braten nicht.', 'Wer kassiert hier?'], zweifel: ['Einen Wirtschaftsprüfer.', 'Unterlagen bitte.'] },
  gruender_sparer: { motiv: ['Ich will Gründungsmitglied werden.', 'Ich will weniger Geld ausgeben.', 'Wann geht es los?'], sparen: ['Wohnkosten.'] },
  unterstuetzer: { motiv: ['Ich finde das toll und will was dazugeben.', 'Kann ich euch mit meiner Erfahrung als Steuerfachwirtin helfen?', 'Ich würde mich ehrenamtlich einbringen.', 'Wie kann ich euch unter die Arme greifen?'], sinn: ['Gemeinsinn.'] },
}
const LAGE_C = {
  berufseinstieg: ['Bin noch Azubi.', 'Frisch von der Uni.', 'Hab gerade angefangen zu arbeiten.'],
  familie: ['Zwei Kleine zuhause.', 'Ich kümmere mich um meine Kids.', 'Familienvater.'],
  umbruch: ['Gerade alles neu.', 'Ich steige aus meinem alten Job aus.', 'Zeit für was anderes.'],
  ruhestand: ['Bin in Pension.', 'Seit letztem Jahr Rentnerin.', 'Ich bin 68 und arbeite nicht mehr.'],
}
const BANKEN = { a: { A, LAGE, ALLG }, b: { A: A_B, LAGE: LAGE_B, ALLG: ALLG_B }, c: { A: A_C, LAGE: LAGE_C, ALLG: ALLG_C } }
let BANK = BANKEN.a
export function bankWaehlen(name) { BANK = BANKEN[name] || BANKEN.a }

export function antwortFuer(rand, persona, frageId) {
  const { A, LAGE, ALLG } = BANK
  const a = A[persona.typ]
  if (rand() < persona.leerRate) return ALLG.leer[(rand() * ALLG.leer.length) | 0]
  if (frageId === 'lage') { // Lebensphase: meist ehrlich beantwortet, manchmal ausweichend
    return rand() < 0.75 ? LAGE[persona.lage][(rand() * LAGE[persona.lage].length) | 0] : ALLG.leer[(rand() * ALLG.leer.length) | 0]
  }
  let pool = (a && a[frageId]) || ALLG[frageId]
  if (!pool) { // Vertiefungsfrage ohne eigene Antwort: kurze Motiv-Wiederholung oder leer
    pool = rand() < 0.5 && a && a.motiv ? a.motiv : ALLG.leer
  }
  let t = pool[(rand() * pool.length) | 0]
  if (frageId === 'motiv' && rand() < 0.35) t += ' ' + LAGE[persona.lage][(rand() * LAGE[persona.lage].length) | 0]
  if (persona.alter === '18-29' && rand() < 0.3) t = t.toLowerCase().replace(/[.,]/g, '')
  return t
}
