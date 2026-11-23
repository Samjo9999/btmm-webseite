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
  unterstuetzer: { w: 5, label: 'Unterstützer/Förderer', schwelle: 0.52, eigen: ['anpacken', 'grundlagen', 'sinn'],
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

export function antwortFuer(rand, persona, frageId) {
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
