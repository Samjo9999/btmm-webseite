/**
 * NUR SERVERSEITIGE FILTERLISTE der Tür-KI (DS-Leitplanken 25.11.2026, Recht-Bot 25.11.2026,
 * DS-Bot-Auflagen 25.11.2026). Diese Begriffe erscheinen nie in sichtbaren Texten; sie dienen
 * ausschließlich dazu, Eingaben vor dem Modell abzufangen und Ausgaben zu ersetzen. Deshalb ist
 * diese Datei im Tabu-Wächter (test/aussensicht-tabu.test.mjs) ausdrücklich ausgenommen.
 * Treffer werden nie geloggt, auch nicht das Stichwort.
 * Begriffe mit Wortgrenze gelten nach Umlaut-Normalisierung (ä→ae, ö→oe, ü→ue, Akzente weg).
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
  // Russisch, Arabisch, Hindi, Bengalisch, Japanisch, Chinesisch (Stämme: krank, Diagnose, schwanger, Krebs, Religion)
  'болезн', 'диагноз', 'беремен', 'онколог', 'религи',
  'مرض', 'تشخيص', 'حامل', 'سرطان', 'ديان',
  'बीमारी', 'निदान', 'गर्भवती', 'कैंसर', 'धर्म',
  'অসুখ', 'গর্ভবতী', 'ক্যান্সার', 'ধর্ম',
  '病気', '診断', '妊娠', '癌', '宗教',
  '疾病', '生病', '诊断', '診斷', '怀孕', '懷孕', '癌症',
]

/** Ganze Wörter bzw. Wortanfang mit Wortgrenze, um Fehltreffer wie Christoph, besucht, Suchtipp, Vertragspartei zu vermeiden. */
export const SENSIBEL_WOERTER: readonly RegExp[] = [
  /\bpartei(mitglied\w*|zugehoerig\w*|buch)?\b/,
  /\bgdb\b/,
  /\biban\b/,
  /\bhiv\b/,
  // Deutsch, Gesundheit und Soziales (Wortgrenze, umlaut-normalisiert)
  /\baerzt/,
  /\barzt/,
  /\bklinik/,
  /\bkrankenhaus/,
  /\bdiabetes\b/,
  /\bburn\s*-?\s*out\b/,
  /\badhs\b/,
  /\bautis/,
  /\ballerg/,
  /\bsucht\b/,
  /\boperiert/,
  /\bpflegebeduerft/,
  /\balg\s*(ii|2)\b/,
  /\barbeitslos/,
  /\bwohngeld\b/,
  /\bsozialamt\b/,
  /\bschulden\b/,
  // Religion, Weltanschauung, Sexualität
  /\bmuslim/,
  /\bislam(?:isch|ismus)?\b/,
  /\bjude(?:n|ntum)?\b/,
  /\bjuedisch/,
  /\bchrist(?:lich|entum|in|en|us)?\b/,
  /\bbuddhis/,
  /\bhindu/,
  /\batheis/,
  /\bschwul/,
  /\blesb/,
  /\bqueer/,
  /\blgbt/,
  // Parteien nur als ganze Wörter
  /\b(?:spd|cdu|csu|afd|fdp)\b/,
  // Englisch
  /\bcancer\b/,
  /\bdoctor\b/,
  /\bhospital\b/,
  /\bgay\b/,
  /\blesbian\b/,
  /\bjewish\b/,
  /\bchristian\b/,
  /\bunemployment\b/,
  /\bjob\s*-?\s*seekers?\b/,
  // Französisch, Spanisch, Portugiesisch (Akzente sind vor dem Test bereits entfernt)
  /\bcancro\b/,
  /\bdiabetes?\b/,
  /\bmusulman/,
  /\bhomosexuel/,
  /\bchomage\b/,
  /\bdesempleo\b/,
  /\bdesemprego\b/,
  /\bmedecin/,
  /\bmedicos?\b/,
  // Russisch: рак nur als ganzes Wort
  /\bрак\b/,
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
