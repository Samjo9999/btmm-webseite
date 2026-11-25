/**
 * NUR SERVERSEITIGE FILTERLISTE der Tür-KI (DS-Leitplanken 25.11.2026, Recht-Bot 25.11.2026,
 * DS-Bot-Auflagen 25.11.2026). Diese Begriffe erscheinen nie in sichtbaren Texten; sie dienen
 * ausschließlich dazu, Eingaben vor dem Modell abzufangen und Ausgaben zu ersetzen. Deshalb ist
 * diese Datei im Tabu-Wächter (test/aussensicht-tabu.test.mjs) ausdrücklich ausgenommen.
 * Treffer werden nie geloggt, auch nicht das Stichwort.
 * Begriffe mit Wortgrenze gelten nach Umlaut-Normalisierung (ä→ae, ö→oe, ü→ue, Akzente weg).
 * Wortgrenzen sind Unicode-Lookarounds (?<![\p{L}\p{N}]) / (?![\p{L}\p{N}]) mit Flag u, nicht \b.
 */

import { unicodeWortRegex } from './wortgrenzen.mjs'

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
  // Belegte weitere Formen (DS-Bot, optional): Sozialleistung / Identität
  'пособи', // пособие, пособия (Sozialleistung)
  'إعانة', // allowance / benefit
  '低保', // dibao, Mindestsicherung in der VR China
  '同性恋', // 同性戀, Homosexualität
]

/** Ganze Wörter bzw. Wortanfang mit Unicode-Wortgrenze, um Fehltreffer wie Christoph, besucht, Suchtipp, Vertragspartei zu vermeiden. */
export const SENSIBEL_WOERTER: readonly RegExp[] = [
  unicodeWortRegex('partei(mitglied\\w*|zugehoerig\\w*|buch)?'),
  unicodeWortRegex('gdb'),
  unicodeWortRegex('iban'),
  unicodeWortRegex('hiv'),
  // Deutsch, Gesundheit und Soziales (Wortgrenze, umlaut-normalisiert)
  unicodeWortRegex('aerzt\\p{L}*'),
  unicodeWortRegex('arzt\\p{L}*'),
  unicodeWortRegex('klinik\\p{L}*'),
  unicodeWortRegex('krankenhaus\\p{L}*'),
  unicodeWortRegex('diabetes'),
  unicodeWortRegex('burn\\s*-?\\s*out'),
  unicodeWortRegex('adhs'),
  unicodeWortRegex('autis\\p{L}*'),
  unicodeWortRegex('allerg\\p{L}*'),
  unicodeWortRegex('sucht'),
  unicodeWortRegex('operiert\\p{L}*'),
  unicodeWortRegex('pflegebeduerft\\p{L}*'),
  unicodeWortRegex('alg\\s*(ii|2)'),
  unicodeWortRegex('arbeitslos\\p{L}*'),
  unicodeWortRegex('wohngeld'),
  unicodeWortRegex('sozialamt'),
  unicodeWortRegex('schulden'),
  // Religion, Weltanschauung, Sexualität
  unicodeWortRegex('muslim\\p{L}*'),
  unicodeWortRegex('islam(?:isch|ismus)?'),
  unicodeWortRegex('jude(?:n|ntum)?'),
  unicodeWortRegex('juedisch\\p{L}*'),
  unicodeWortRegex('christ(?:lich|entum|in|en|us)?'),
  unicodeWortRegex('buddhis\\p{L}*'),
  unicodeWortRegex('hindu\\p{L}*'),
  unicodeWortRegex('atheis\\p{L}*'),
  unicodeWortRegex('schwul\\p{L}*'),
  unicodeWortRegex('lesb\\p{L}*'),
  unicodeWortRegex('queer\\p{L}*'),
  unicodeWortRegex('lgbt\\p{L}*'),
  // Parteien nur als ganze Wörter
  unicodeWortRegex('(?:spd|cdu|csu|afd|fdp)'),
  // Englisch
  unicodeWortRegex('cancer'),
  unicodeWortRegex('doctor'),
  unicodeWortRegex('hospital'),
  unicodeWortRegex('gay'),
  unicodeWortRegex('lesbian'),
  unicodeWortRegex('jewish'),
  unicodeWortRegex('christian'),
  unicodeWortRegex('unemployment'),
  unicodeWortRegex('job\\s*-?\\s*seekers?'),
  // Französisch, Spanisch, Portugiesisch (Akzente sind vor dem Test bereits entfernt)
  unicodeWortRegex('cancro'),
  unicodeWortRegex('diabetes?'),
  unicodeWortRegex('musulman\\p{L}*'),
  unicodeWortRegex('homosexuel\\p{L}*'),
  unicodeWortRegex('chomage'),
  unicodeWortRegex('desempleo'),
  unicodeWortRegex('desemprego'),
  unicodeWortRegex('medecin\\p{L}*'),
  unicodeWortRegex('medicos?'),
  // Russisch: рак und гей nur als ganze Wörter (рак sonst auch „Krebs“ als Tier)
  unicodeWortRegex('рак'),
  // й verliert in normalisiere den Breve (NFD) und wird zu и
  unicodeWortRegex('геи'),
  // Arabisch, Hindi, Bengalisch (belegte Wörter; Unicode-Wortgrenze, nicht \\b)
  unicodeWortRegex('مريض'),
  unicodeWortRegex('बीमार'),
  unicodeWortRegex('समलैंगिक'),
  unicodeWortRegex('সমকামী'),
]

/** Muster für Kontaktdaten und Kontodaten (auf dem Originaltext, nicht normalisiert). */
export const SENSIBEL_MUSTER: readonly RegExp[] = [
  // E-Mail
  /[^\s@]+@[^\s@]+\.[a-z]{2,}/i,
  // IBAN (Ländercode + Prüfziffer + mindestens 10 weitere Zeichen, Leerzeichen erlaubt)
  /(?<![\p{L}\p{N}])[A-Z]{2}\d{2}(?:\s?[A-Z0-9]){10,30}(?![\p{L}\p{N}])/u,
  // Telefon: beginnt mit + / 00 / 0 und hat mindestens 8 Ziffern
  /(?:^|[^\d])(?:\+|00|0)\d(?:[\s\/().-]?\d){7,}/,
]

/** Tabu-Stämme für die Ausgabe (Nutzerregel): treffen sie, wird die Antwort ersetzt. */
export const TABU_AUSGABE: readonly RegExp[] = [
  /b(ü|ue)rgergeld/i, /jobcenter/i, /hartz/i, /krankheit/i, /erkrank/i, /elternzeit/i, /schwanger/i,
  /hildastr/i, unicodeWortRegex('karner', 'i'), /happy\s?farm/i, /elternhof/i, /j\.\s?s\.\s?gartzke/i,
]
