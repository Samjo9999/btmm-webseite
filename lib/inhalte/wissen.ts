// Ratgeber-Register für /wissen. Neuer Artikel: Eintrag hier + Ordner app/[locale]/wissen/<slug>/.
// status 'geplant' = Briefing beim SEO & AEO Desk, noch kein Text.
export type Ratgeber = { slug: string; titel: string; kurz: string; status: 'online' | 'geplant' }

export const RATGEBER: Ratgeber[] = [
  { slug: 'glossar', titel: 'Glossar', kurz: 'Zelle, Anteil, eG, Kaskade, BtMM-Coin – kurz erklärt.', status: 'online' },
  { slug: 'genossenschaft-gruenden', titel: 'Genossenschaft gründen', kurz: 'Schritte, Kosten, Prüfungsverband. Rechtliches bleibt als offen markiert.', status: 'geplant' },
  { slug: 'gemeinsam-einkaufen', titel: 'Gemeinsam einkaufen', kurz: 'Wie Foodcoops funktionieren, mit Rechenbeispiel.', status: 'geplant' },
  { slug: 'auto-und-werkzeug-teilen', titel: 'Auto und Werkzeug teilen', kurz: 'Privates Carsharing und Werkzeug teilen, mit Rechenbeispiel.', status: 'geplant' },
  { slug: 'gemeinschaftlich-wohnen', titel: 'Gemeinschaftlich wohnen', kurz: 'Erbbaurecht und Stiftung gegen Verkauf.', status: 'geplant' },
  { slug: 'selbststaendig-im-verbund', titel: 'Selbstständig im Verbund arbeiten', kurz: 'Zusammenarbeiten und selbstständig bleiben.', status: 'geplant' },
  { slug: 'koerperarbeit', titel: 'Was ist Körperarbeit?', kurz: 'Ablauf einer Sitzung bei Back to Balance – ohne Heilversprechen.', status: 'geplant' },
]
