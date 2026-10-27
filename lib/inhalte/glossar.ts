// Glossar. Begriffe nur nach Satzung 08 v7.32.0 („Anwartschaft“ gestrichen -> „BtMM-Coin“).
export type Begriff = { begriff: string; erklaerung: string; quelle: string }

export const GLOSSAR: Begriff[] = [
  { begriff: 'Anteil (Geschäftsanteil)', erklaerung: 'Jedes Mitglied übernimmt genau einen Anteil von 100 €, sofort oder in Raten ab 10 € im Monat. Er wird nach fünf Jahren Kündigungsfrist zurückgezahlt; ob das so zulässig ist, wird noch fachlich geprüft.', quelle: 'Satzung § 6' },
  { begriff: 'Anwärter:in', erklaerung: 'Wer Mitglied werden will, lernt die Zelle in einer Anwärterzeit von in der Regel drei bis sechs Monaten kennen, mit einer Patin oder einem Paten. Über die Aufnahme entscheidet die Zellversammlung im Konsent.', quelle: 'Satzung § 4 Abs. 4' },
  { begriff: 'BtMM-Coin', erklaerung: 'Interne Verrechnungseinheit: Ein Coin entspricht immer genau einer geleisteten Stunde. Kein Zahlungsmittel, kein Wertpapier, keine Kryptowährung; gilt nur im Netzwerk.', quelle: 'Satzung § 14' },
  { begriff: 'eG (eingetragene Genossenschaft)', erklaerung: 'Ein gemeinsamer Betrieb, der allen Mitgliedern gehört. BtMM will sie gründen, sobald es trägt; vorher gibt es eine kostenlose Beratung durch Fachleute.', quelle: 'ANGEBOT.md, Konzept 07 Kap. 2' },
  { begriff: 'Kaskade', erklaerung: 'Die Reihenfolge, in der das Ergebnis verteilt wird: zuerst Rücklage, dann gleicher Grundlohn, dann der Überschuss in drei Teile (Bonus, Eigentum, Soziales/Öko).', quelle: 'Satzung § 11' },
  { begriff: 'Knospung', erklaerung: 'Wird eine Zelle zu groß, teilt sie sich. Tochterzellen sind danach eigenständig, behalten aber ihre Beziehungen.', quelle: 'Satzung § 16' },
  { begriff: 'Solidarfonds', erklaerung: 'Gemeinsamer Topf aus 7 % der Lohnsumme (nicht unter 5 %). Er leistet erst ab 10 Mitgliedern.', quelle: 'Satzung § 24' },
  { begriff: 'Unterstützer:in', erklaerung: 'Teilt die Grundwerte und unterstützt in der Freizeit mit Fähigkeiten, Zeit oder Geld, ohne Mitglied zu sein.', quelle: 'Satzung § 4 Abs. 2' },
  { begriff: 'Zelle', erklaerung: 'Die kleine Einheit vor Ort, in der Mitglieder gemeinsam entscheiden, mit eigener Versammlung. Die eG besteht aus Zellen.', quelle: 'Satzung § 15' },
]
