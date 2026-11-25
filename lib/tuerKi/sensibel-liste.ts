/**
 * NUR SERVERSEITIGE FILTERLISTE der Tür-KI (DS-Leitplanken 25.11.2026, Recht-Bot 25.11.2026).
 * Diese Begriffe erscheinen nie in sichtbaren Texten; sie dienen ausschließlich dazu,
 * Eingaben vor dem Modell abzufangen und Ausgaben zu ersetzen. Deshalb ist diese Datei
 * im Tabu-Wächter (test/aussensicht-tabu.test.mjs) ausdrücklich ausgenommen.
 * Treffer werden nie geloggt, auch nicht das Stichwort.
 */

/** Besondere Kategorien (Art. 9 DSGVO) und Sozialleistungen, Teilstring-Treffer nach Normalisierung. */
export const SENSIBEL_STAEMME: readonly string[] = [
  // Gesundheit
  'gesundheit', 'diagnose', 'diagnost', 'krankheit', 'erkrank', 'krank', 'therapie', 'therapeut',
  'medikament', 'tabletten', 'psychiat', 'depressi', 'behinder', 'schwerbehind', 'pflegegrad',
  'schwanger', 'krebs', 'chemo', 'arztbrief', 'befund',
  // Religion, Weltanschauung, Sexualität, Herkunft, Gewerkschaft, Partei
  'religion', 'religioes', 'konfession', 'sexualitaet', 'sexuell', 'homosex', 'bisexu', 'transgender',
  'ethnisch', 'ethnie', 'migrationshintergrund', 'abstammung', 'gewerkschaft',
  // Sozialleistungen
  'buergergeld', 'jobcenter', 'hartz', 'sozialhilfe', 'arbeitslosengeld', 'grundsicherung',
  // Ausweis / Konto
  'personalausweis', 'ausweisnummer', 'reisepass', 'steuer-id', 'steuernummer', 'sozialversicherungsnummer',
  'kontonummer', 'kreditkarte',
  // Englisch
  'health', 'diagnos', 'illness', 'sickness', 'disease', 'therapy', 'medication', 'disabilit',
  'pregnan', 'religio', 'sexual orientation', 'ethnic', 'trade union', 'welfare benefit',
  'passport number', 'credit card',
  // Französisch, Spanisch, Portugiesisch (Grundbestand)
  'maladie', 'grossesse', 'enceinte', 'enfermedad', 'embaraz', 'doenca', 'gravidez', 'salud', 'saude',
]

/** Ganze Wörter (Wortgrenze), um Treffer in zusammengesetzten Wörtern wie „Vertragspartei“ zu vermeiden. */
export const SENSIBEL_WOERTER: readonly RegExp[] = [
  /\bpartei(mitglied\w*|zugehoerig\w*|buch)?\b/,
  /\bgdb\b/,
  /\biban\b/,
  /\bhiv\b/,
]

/** Muster für Kontaktdaten und Kontodaten (auf dem Originaltext, nicht normalisiert). */
export const SENSIBEL_MUSTER: readonly RegExp[] = [
  // E-Mail
  /[^\s@]+@[^\s@]+\.[a-z]{2,}/i,
  // IBAN (Ländercode + Prüfziffer + mindestens 10 weitere Zeichen, Leerzeichen erlaubt)
  /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]){10,30}\b/,
  // Telefon: beginnt mit + / 00 / 0 und hat mindestens 8 Ziffern
  /(?:^|[^\d])(?:\+|00|0)\d(?:[\s\/().-]?\d){7,}/,
]

/** Tabu-Stämme für die Ausgabe (Nutzerregel): treffen sie, wird die Antwort ersetzt. */
export const TABU_AUSGABE: readonly RegExp[] = [
  /b(ü|ue)rgergeld/i, /jobcenter/i, /hartz/i, /krankheit/i, /erkrank/i, /elternzeit/i, /schwanger/i,
  /hildastr/i, /\bkarner/i, /happy\s?farm/i, /elternhof/i, /j\.\s?s\.\s?gartzke/i,
]
