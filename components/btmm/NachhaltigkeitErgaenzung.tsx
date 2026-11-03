import { getLocale } from 'next-intl/server'
import { Abschnitt, Karte, Offen, Knopf } from '@/components/btmm/Bausteine'
import { NeueInhalteStil } from '@/components/btmm/NeueInhalteStil'

export async function NachhaltigkeitErgaenzung() {
  const locale = await getLocale()
  return <div className="btmm-ergaenzung"><NeueInhalteStil /><div className="btmm-inhalt">
    <Abschnitt titel="Nachhaltigkeit im Alltag – aktueller Entwurf">
      <p>Stand November 2026: Weniger neu kaufen, Dinge länger nutzen und Entscheidungen nachvollziehbar machen. Die folgenden Ergänzungen ordnen die älteren Darstellungen darunter anhand der aktuellen Dokumente ein.</p>
      <div className="btmm-raster">
        <Karte titel="Teilen statt mehrfach kaufen"><p>Werkzeug, Räume und Fahrzeuge gemeinsam nutzen. Erst prüfen, was vor Ort vorhanden ist; eine gemeinsame Anschaffung braucht Nachfrage, Zuständigkeit und eine tragfähige Rechnung.</p></Karte>
        <Karte titel="Reparieren und weitergeben"><p>Weitergeben, tauschen, leihen, reparieren, gebraucht verkaufen und erst danach verwerten. Vorhandene Repair-Cafés und Tauschpartys zuerst nutzen. Eigene Läden und Regale sind spätere Optionen.</p></Karte>
        <Karte titel="Regional und nachvollziehbar"><p>Kurze Wege, transparente Herkunft und belegbare Arbeitsbedingungen als Leitlinie. Ein Partnerzeichen ersetzt keine unabhängige Zertifizierung. Preis, Qualität und tatsächliche Wirkung gemeinsam prüfen.</p></Karte>
        <Karte titel="Wirkung sichtbar machen"><p>Für konkrete Vorhaben festhalten: Was wurde gemeinsam genutzt oder repariert? Welche Kosten entstanden? Welche Material- oder Energieeinsparung lässt sich belegen? Ohne belastbare Daten keine festen Umweltversprechen.</p></Karte>
      </div>
    </Abschnitt>
    <Abschnitt titel="Eine geplante Genossenschaft, klare Geldflüsse">
      <p>Die aktuellen Entwürfe sehen eine eingetragene Genossenschaft vor; einen zusätzlichen Förderverein als Träger nicht. Die Rechtsform allein garantiert weder Nachhaltigkeit noch Unverkäuflichkeit. Konkrete Regeln und ihre rechtliche Prüfung bleiben entscheidend.</p>
      <p>Die Drittelung betrifft im reifen Modell den verbleibenden Überschuss nach Mindestanteilen und Grundlohn, nicht den gesamten Umsatz. Für die Aufbauphase gelten andere Korridore. Kreislaufangebote werden nicht als zusätzliche garantierte Ersparnis ins Grundmodell eingerechnet.</p>
      <Knopf link={`/${locale}/geldfluss`}>Geldfluss mit Prozenten ansehen</Knopf>
    </Abschnitt>
    <Offen>Gemeinsame Betriebe, Wohnraum, eigene Energieversorgung und Kreislaufangebote sind Vorhaben im Aufbau. Finanzierung, Genehmigungen, Nachfrage und messbare Wirkung müssen für jedes Projekt geklärt werden.</Offen>
    <Abschnitt titel="Klein anfangen"><p>Bring einen reparierbaren Gegenstand mit, nutze ein vorhandenes Angebot vor Ort oder verabrede eine gemeinsame Nutzung. Erst ausprobieren und Erfahrungen dokumentieren, bevor neue Infrastruktur entsteht.</p><p style={{ fontSize: '.9rem', opacity: .75 }}>Grundlage: Konzept v22.49.3, Satzungsentwurf v7.35.0, Wirtschaften v3.15.1, Fairer Handel v1.5.0 und Kreislauf v1.2.0. Zusammenfassung von Entwürfen, keine geprüften Leistungszusagen.</p></Abschnitt>
  </div></div>
}
