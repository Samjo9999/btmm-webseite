// Themen = was ein Besucher auf einer Seite finden will. Erkannt per Schlagwort im gerenderten Seitentext (de).
// Ein Thema gilt als abgedeckt, wenn mind. `min` verschiedene Schlagworte im gelesenen Teil der Seite stehen.
export const THEMEN = {
  idee:               { min: 2, w: ['genossenschaft', 'gemeinsam', 'teilen', 'pool', 'zelle', 'augenhöhe', 'gleich viel wert'] },
  betrieb_entlastung: { min: 2, w: ['betriebshaftpflicht', 'steuerberater', 'versicherung', 'verwaltung', 'software', 'buchhaltung', 'fixkosten', 'infrastruktur'] },
  handwerk_recht:     { min: 2, w: ['meister', 'handwerksrolle', 'anlage a', 'anlage-a', 'anlage-b', 'zulassung', 'gewerbeanmeldung', 'handwerkskammer', 'betriebsleitung', '§ 7b'] },
  lohn:               { min: 2, w: ['stundenlohn', 'pro stunde', 'jede stunde', 'netto', 'vergütet', 'lohn', 'gleich bezahlt', 'gleich viel'] },
  einkauf:            { min: 2, w: ['einkauf', 'ek-preis', 'spar', 'günstig', 'kosten', 'teilen', 'großhandel', 'material', 'pro person im monat'] },
  unternehmer:        { min: 2, w: ['unternehmen', 'betrieb', 'marktmacht', 'juristische person', 'kunden', 'umsatz', 'gewinn'] },
  kunde:              { min: 2, w: ['kunden', 'marktpreis', 'leistungen', 'angebot', 'buchen', 'preise', 'intern'] },
  belege:             { min: 2, w: ['satzung', 'dokument', 'prüf', 'risik', 'offene fragen', 'quelle', 'nachlesen', 'herunterladen'] },
  gruendung:          { min: 2, w: ['gründung', 'gründungsmitglied', 'eingetragene genossenschaft', 'mitglieder', 'notar', 'register'] },
  mitmachen:          { min: 1, w: ['mitmachen', 'mitglied werden', 'dabei sein', 'kontakt aufnehmen', 'anfrage'] },
  gemeinschaft:       { min: 2, w: ['gemeinschaft', 'augenhöhe', 'demokrat', 'entscheid', 'menschen', 'zusammen'] },
  foerdern:           { min: 1, w: ['förderkunde', 'unterstütz', 'spende', 'fördern', 'förderer'] },
  wohnen:             { min: 2, w: ['wohnen', 'häuser', 'boden', 'miete', 'wohnung'] },
  // Lebenslagen (tabufrei). Fehlende Abdeckung = Konzept-Lücke melden, nicht erfinden.
  lage_einstieg:      { min: 1, w: ['ausbildung', 'berufseinstieg', 'berufsanfänger', 'azubi', 'auszubildend'] },
  lage_familie:       { min: 1, w: ['familie', 'familien', 'kinder'] },
  lage_umbruch:       { min: 1, w: ['neuorientierung', 'übergang', 'lebensphase', 'neu anfangen', 'umstieg', 'überbrück'] },
  lage_ruhestand:     { min: 1, w: ['ruhestand', 'rentner', 'im alter', 'rente '] },
}

export function themenAuf(text) {
  // text bereits kleingeschrieben; liefert je Thema die früheste Position (0..1), an der es als abgedeckt gilt, sonst null
  const out = {}
  const n = text.length || 1
  for (const [k, t] of Object.entries(THEMEN)) {
    const pos = t.w.map((w) => text.indexOf(w)).filter((i) => i >= 0).sort((a, b) => a - b)
    out[k] = pos.length >= t.min ? pos[t.min - 1] / n : null
  }
  return out
}
