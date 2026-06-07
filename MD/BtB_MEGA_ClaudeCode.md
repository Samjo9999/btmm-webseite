# Back to Balance — Mega-Prompt Sammlung
## Alle Agenten, Tätigkeitsmodule & BtB-eigene KI

> **Verwendung:** `claude` im Terminal → Prompt einfügen → ausführen
> **Vor jeder Session:** `git add -A && git commit -m "checkpoint: [was kommt]"`
> **Stack:** React/Vite + TypeScript + Supabase (xcngmshjuqoucdlgikao) + FinAPI
> **Grundregel für alle Agenten:** Abschaltbar · Dry-Run · Health-Endpunkt · Zeitgefühl · Guardian-registriert

---

# GRUNDREGELN — implizit in JEDEM Prompt

```
Jeder Agent den du baust muss folgendes enthalten:

1. ZEITGEFÜHL
   import { createTemporalContext } from '../_shared/temporal.ts'
   const ctx = await createTemporalContext('agent-name', supabase)
   → Danach NIE mehr new Date() aufrufen. Immer ctx.now verwenden.

2. ABSCHALTBAR
   const enabled = await getSetting('agent_[name]_enabled')
   if (!enabled) return { status: 'disabled' }
   Manueller Fallback: POST /[agent]/trigger löst denselben Ablauf aus.

3. DRY-RUN
   if (req.query.dry_run === 'true') {
     // alles berechnen, nichts schreiben
     return { would_do: [...], dry_run: true }
   }

4. HEALTH-ENDPUNKT
   GET /[agent]/health → { status: 'ok', last_run, version, next_scheduled }

5. LOGGING
   automation_logs: agent_name, session_id, started_at, finished_at,
   status, records_processed, errors (JSONB), dry_run, triggered_by

6. GUARDIAN-REGISTRIERUNG
   Beim ersten Start: INSERT INTO automation_registry (name, description, schedule, enabled)
   ON CONFLICT DO UPDATE SET last_run = ctx.now

7. FEHLERBEHANDLUNG
   try/catch um jeden externen Call.
   Fehler → automation_logs schreiben → bei kritisch: E-Mail an Admin via Brevo.
   Niemals silent fail.
```

---

# MODUL 0 — FUNDAMENT (zuerst implementieren)

---

## 0.1 Temporal Context Module

```
Du bist in ~/btb-app/. Erstelle das zentrale Zeitgefühl-Modul.
MUSS als erstes implementiert werden — alle anderen Agenten brauchen es.

ERSTELLE: supabase/functions/_shared/temporal.ts

Das Modul stellt sicher:
- Jeder Agenten-Lauf hat genau EINEN Zeitstempel (new Date() einmal, am Anfang)
- Dieser Zeitstempel wird als ctx.now durch den gesamten Lauf gereicht
- Jeder Lauf kennt seine Sequenznummer (bin ich Lauf #3 heute?)
- Jeder Lauf kennt seinen Vorgänger-Lauf (seit wann laufe ich nicht?)
- Wenn ein Prozess um 23:58 startet und nach Mitternacht endet:
  alles gehört noch zum alten Tag/Monat

TABELLE system_temporal_context (Migration erstellen):
  id, agent_name, session_id UUID, started_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Europe/Berlin',
  fiscal_month TEXT,        -- '2026-03'
  fiscal_day_type TEXT,     -- 'month_end' | 'month_start' | 'mid_month'
  sequence_number INTEGER,  -- wievielter Lauf heute
  previous_run_at TIMESTAMPTZ,
  previous_run_id UUID,
  context_snapshot JSONB,   -- Systemzustand bei Start
  finished_at TIMESTAMPTZ,
  outcome TEXT              -- 'success' | 'error' | 'dry_run' | 'disabled'

INTERFACE TemporalContext:
  now: Date               -- EINZIGE Zeitquelle
  timezone: string
  fiscalMonth: string     -- '2026-03'
  fiscalDayType: FiscalDayType
  isoString: string
  localDateString: string -- '2026-03-31' in Europe/Berlin
  sessionId: string
  agentName: string
  sequenceNumber: number
  previousRunAt: Date | null
  previousRunId: string | null
  contextSnapshot: Record<string, unknown>

HILFSFUNKTIONEN:
  toFiscalMonth(date): string
  classifyDay(date): FiscalDayType   -- 'month_end' wenn letzter Tag des Monats
  isLastDayOfMonth(date): boolean
  isFirstDayOfMonth(date): boolean
  isBusinessDay(date): boolean
  nextBusinessDay(date): Date
  toLocalDate(date, tz): string      -- YYYY-MM-DD

AUCH ERSTELLEN: src/lib/temporal.ts (Frontend, identisches Interface)

TESTS in tests/temporal.test.ts:
  - Monatsübergang 23:58 → Monat wird korrekt zugeordnet
  - Sequenznummer steigt korrekt
  - Timezone-Korrektheit UTC vs Europe/Berlin
  - fiscalDayType korrekt für letzten Tag, ersten Tag, Mitte
```

---

## 0.2 Guardian Core

```
Du bist in ~/btb-app/. Erstelle den Guardian — den permanenten Überwachungs-Agenten.
Lese zuerst die bestehenden Supabase Edge Functions und die Datenbankstruktur.
Befolge alle Grundregeln.

TABELLEN (Migrationen erstellen):
guardian_logs: id, agent_name, session_id, check_type, status (ok|warning|critical|existential),
  message, details JSONB, checked_at, resolved_at, auto_resolved BOOLEAN
guardian_repairs: id, error_class, before_state JSONB, after_state JSONB,
  success BOOLEAN, repair_started_at, repair_finished_at, session_id
guardian_known_errors: id, error_class TEXT UNIQUE, severity, auto_repairable BOOLEAN,
  repair_function TEXT, bypass_available BOOLEAN, description
active_bypasses: id, element_name, bypass_type, activated_at, activated_by,
  deactivated_at, deactivated_by, reconciliation_done BOOLEAN DEFAULT false
guardian_root_cause_reports: id, error_class, occurrence_count, period_days,
  pattern_detected TEXT, ai_hypothesis TEXT, recommendations JSONB,
  created_at, admin_notified BOOLEAN DEFAULT false

PRÜFUNGEN (alle 5 Minuten, via pg_cron):
  1. Datenbankverbindung: SELECT 1 — timeout → EXISTENTIAL
  2. Alle Edge Functions in automation_registry: GET /health — nicht 200 → CRITICAL
  3. FinAPI: minimaler API-Call — 401 → error_class 'finapi_auth', 503 → 'finapi_unavailable'
  4. Brevo: API-Status — Fehlerquote > 5% → CRITICAL
  5. Coin-Solvenz: sum(member_coin_ledger.eur_reserve) <= coin_reserve_balance — EXISTENTIAL
  6. Backups: letzter Backup-Eintrag < 26h → CRITICAL
  7. Überfällige Cron-Jobs: last_run > 1.5× expected_interval → WARNING, > 2× → CRITICAL
  8. Offene Zahlungen > 4h ohne Bestätigung → WARNING, > 24h → CRITICAL

ZEITBASIERTE ESKALATION:
  Gleicher Fehler seit < 5min → warten
  5–30min → Reparatur versuchen (guardian-repair aufrufen)
  30–120min → Bypass aktivieren + Admin-E-Mail
  > 2h → alle Vorstandsmitglieder alarmieren
  > 24h → Supabase-Support-Ticket via Management API erstellen

ALARM-ROUTING:
  WARNING → nur guardian_logs
  CRITICAL → E-Mail an Admin
  EXISTENTIAL → E-Mail + Signal-Webhook an ALLE Vorstandsmitglieder

BEKANNTE FEHLERKLASSEN (initialer INSERT):
  ('stuck_cron', 'critical', true, 'guardian-repair', false)
  ('finapi_unavailable', 'critical', false, 'guardian-repair', true)
  ('finapi_auth', 'critical', true, 'guardian-repair', false)
  ('negative_stock', 'warning', true, 'guardian-repair', false)
  ('abandoned_timer', 'warning', true, 'guardian-repair', false)
  ('coin_solvency_breach', 'existential', false, null, false)
  ('backup_overdue', 'critical', false, null, false)
  ('email_service_down', 'critical', false, 'guardian-bypass', true)
  ('db_lock_timeout', 'critical', true, 'guardian-repair', false)
```

---

## 0.3 Guardian Repair + Bypass

```
Du bist in ~/btb-app/. Erstelle guardian-repair und guardian-bypass als Edge Functions.
Beide werden vom guardian-core aufgerufen, können aber auch manuell getriggert werden.

GUARDIAN-REPAIR (supabase/functions/guardian-repair/index.ts):
  Empfängt: { error_class, context }
  Führt klassenspezifische Reparatur durch.

  Klasse 'stuck_cron': Function per Dry-Run testen, dann echten Lauf starten.
  Klasse 'finapi_auth': Token erneuern aus Supabase Vault, testen.
  Klasse 'abandoned_timer': Status auf 'abandoned', Mitglied informieren.
  Klasse 'negative_stock': current_stock = 0, correction-Bewegung eintragen.
  Klasse 'db_lock_timeout': pg_stat_activity prüfen, idle-in-transaction nach 30min beenden.
    NUR idle in transaction — niemals aktive Writes abbrechen.

  Parallelität: Wenn Reparatur aktiv, guardian-core läuft mit 2min statt 5min Frequenz.
  Nach Reparatur: Root-Cause-Check (hat sich dieser Fehler in 30 Tagen wiederholt?).
  Bei Wiederholung: guardian-root-cause-report erstellen + Admin informieren.

GUARDIAN-BYPASS (supabase/functions/guardian-bypass/index.ts):
  Zwei parallele Threads wenn Bypass aktiviert:
  Thread 1 — Betrieb läuft durch Bypass weiter (Mitglieder merken nichts)
  Thread 2 — guardian-repair versucht weiter das defekte Element zu reparieren

  Bypass 'finapi_payment':
    1. Alle pending/processing Zahlungen identifizieren
    2. PDF-Zahlungsaufträge generieren (python scripts/bypass/generate_payment_orders.py)
       Inhalt: Empfänger, IBAN, Betrag, Verwendungszweck, Referenz-ID
    3. E-Mail an Admin + Vorstand mit PDFs und Anleitung
    4. active_bypasses Eintrag, alle betroffenen Requests: status='bypass_pending'
    5. Parallel: FinAPI-Verbindungstest alle 2min (erhöhte Frequenz)

  Bypass 'edge_function_unavailable' { function_name }:
    1. Python-Bypass-Skript generieren (gleiche Logik, direkt via Service-Role-Key)
    2. README mit Ausführungsanleitung
    3. In scripts/bypass/[function_name].py ablegen

  Bypass 'email_service_down':
    Zeitkritische E-Mails (payment|emergency|gv): Fallback-SMTP oder Signal-Webhook
    Alle anderen: email_queue, werden nachgesendet wenn Brevo verfügbar

  DEAKTIVIERUNG — immer manuell, nie automatisch:
    Reconciliation-Report erstellen (was wurde während Bypass manuell getan?)
    Admin bestätigt jeden Punkt
    Erst dann: active_bypasses.deactivated_at setzen

GUARDIAN-CLI (scripts/btb-guardian-cli.js):
  Notfall-Zugang wenn Web-Interface nicht erreichbar.
  Commands: status | repair --class X | bypass list | bypass activate/deactivate |
            queue list | queue flush --type payment | logs --last 24h | unlock --entry-id X
  Auth via ~/.btb/credentials.json (service_role_key, verschlüsselt)
  Alle CLI-Aktionen in guardian_logs mit source='cli'
```

---

## 0.4 Staging Release Manager

```
Du bist in ~/btb-app/. Erstelle den Staging-Freigabe-Agenten.
Kein Agent geht live ohne diese Freigabe.

TABELLEN:
staging_automations: id, function_name, version, status
  (pending_test|testing|approved|blocked|live|auto_disabled),
  test_report JSONB, approved_by, went_live_at
staging_test_runs: id, automation_id, test_type, passed BOOLEAN, details JSONB

WEBHOOK: POST /staging-release-manager/deployment-hook { function_name, version }
  → staging_automations anlegen, Test-Suite starten

TEST-SUITE (5 Tests):
  1. Health-Check: GET /[function]/health → { status: 'ok' }?
  2. Dry-Run leer: function mit dry_run=true, leere Payload → kein crash
  3. Dry-Run Staging-Daten: anonymisierte Produktionskopie → plausibles Ergebnis?
  4. Coin-Solvenz: Würde Dry-Run Solvenz verletzen? → wenn ja: BLOCKED
  5. Edge Cases: NULL-Werte, leere Tabellen, 1000+ Einträge → graceful degradation

Alle Tests bestanden → status='approved', Admin-E-Mail
Mindestens ein Test failed → status='blocked', Fehlerreport

Go-Live: manuell via Admin-Button (PATCH /go-live { automation_id })

POST-LIVE-MONITORING (48h):
  Alle 30min: Fehlerrate in automation_logs prüfen
  > 3 Fehler in 48h → status='auto_disabled' + E-Mail: "Deaktiviert nach 3 Fehlern"
  Rollback: PATCH /rollback { automation_id }
```

---

# MODUL 1 — FINANZFLUSS (Kern-Ökonomie)

---

## 1.1 Invoice Lifecycle Manager

```
Du bist in ~/btb-app/. Erstelle das vollständige Rechnungslebens-System.
Lese zuerst die bestehende invoices-Tabelle und ihre Felder.

ERWEITERE invoices um:
  xrechnung_xml TEXT, zugferd_embedded BOOLEAN, datev_export_id UUID,
  pool_period_id UUID, revenue_recognized_at TIMESTAMPTZ,
  payment_method TEXT CHECK (payment_method IN ('sepa','bar','coins_intern','sonstiges')),
  dunning_paused BOOLEAN DEFAULT false, disputed BOOLEAN DEFAULT false

NEUE TABELLE invoice_positions:
  id, invoice_id, position_nr, description, quantity, unit,
  unit_price_net, tax_rate_pct, total_net, total_gross,
  revenue_category TEXT, datev_konto TEXT

NEUE TABELLE revenue_recognition_log:
  id, invoice_id, cell_id, period_id, amount_eur, recognized_at, session_id

ROUTE POST /invoice-lifecycle-manager/create:
  1. Rechnungsnummer: ZELLE-YYYY-NNN (fortlaufend pro Zelle pro Jahr)
  2. XRechnung-XML (EN16931): alle Pflichtfelder inkl. BuyerReference, SellerTaxID
  3. ZUGFeRD-PDF: PDF mit eingebettetem XML
  4. Storage: bucket 'invoices'
  5. Brevo: PDF als Anhang an Kunden

ROUTE POST /invoice-lifecycle-manager/mark-paid:
  1. invoice.status = 'paid', paid_at = ctx.now
  2. revenue_recognition_log Eintrag
  3. universe_revenue_pool für Zelle aktualisieren
  4. DATEV-Buchungssatz: Konto 1200 (Bank) an 4400 (Erlöse)

CRON täglich 09:00:
  Rechnungen > 14 Tage offen ohne Mahnstufe → dunning-system triggern
  Rechnungen mit disputed=true seit > 7 Tagen → Admin-Reminder
```

---

## 1.2 FinAPI Bridge

```
Du bist in ~/btb-app/. Erstelle die vollständige FinAPI-Bankanbindung.
Dies ist das kritischste Modul — maximale Fehlertoleranz erforderlich.

TABELLEN:
finapi_accounts: id, cell_id, account_type, iban, finapi_account_id, balance_eur, last_synced_at
finapi_transactions: id, account_id, finapi_transaction_id, amount_eur,
  counterparty_iban, reference_text, booked_at, transaction_type,
  matched_to_type, matched_to_id, matching_confidence
payment_queue: id, payment_type, recipient_name, recipient_iban, amount_eur,
  reference_text, source_id, source_type,
  status CHECK (status IN ('pending','processing','submitted','confirmed','failed','bypass')),
  finapi_payment_id, submitted_at, confirmed_at, error_message, retry_count DEFAULT 0

ROUTE POST /finapi-bridge/initiate-payment:
  1. Idempotenz: selbe source_id schon in Queue? → zurückgeben
  2. Solvenz-Check: reicht die Rücklage nach dieser Zahlung?
  3. FinAPI OAuth2-Token (cached): Payment initiieren
  4. Erfolg: finapi_payment_id speichern, status='submitted'
  5. Fehler nach Guardian-Klasse:
     'finapi_auth_expired' → Token erneuern, retry
     'finapi_rate_limit' → 60s warten, retry
     'finapi_bank_reject' → status='failed', Admin-E-Mail mit Ablehnungsgrund
     'finapi_timeout' → status='processing', Guardian-Retry nach 30min
     'finapi_unavailable' → Bypass-Modus aktivieren

ROUTE POST /finapi-bridge/webhook (von FinAPI):
  1. HMAC-Signature verifizieren
  2. Transaktion in finapi_transactions speichern
  3. Eingang → invoice-payment-matcher aufrufen
  4. Ausgang + payment_queue-Match → status='confirmed'
  5. Coin-Rücklage reduzieren ERST nach Bestätigung (nicht bei Einreichung)

MONITORING (Guardian-Erweiterung):
  payment_queue status='submitted' seit > 2h → WARNING
  payment_queue status='submitted' seit > 24h → CRITICAL
  retry_count > 2 → Admin-Alarm
  Kontostand < solidarity_fund_minimum → EXISTENTIAL
```

---

## 1.3 Period Close Orchestrator

```
Du bist in ~/btb-app/. Erstelle den Perioden-Abschluss-Orchestrator.
Das ist der komplexeste Kern-Prozess. Maximal sorgfältig.

VORBEDINGUNGEN (alle müssen erfüllt sein):
  Alle universe_time_entries genehmigt? (status='pending' → Fehler)
  Vorperiode abgeschlossen? → Fehler
  Coin-Rücklage solvent? → Fehler
  Guardian: keine EXISTENTIAL-Fehler offen? → Warning (Admin kann override)

SCHRITT 1 — Pool berechnen:
  Pro Zelle: gross_revenue aus paid invoices der Periode
  material_deduction = gross_revenue × material_cost_deduction_pct / 100
  net_pool = gross_revenue - material_deduction
  Fördermittel mit Zweckbindung VOR Dritteilung abziehen → earmarked_funds

SCHRITT 2 — Dritteilung (NUR aus universe_settings — NIE hardcodiert):
  vergütung_eur = total_net_pool × pool_share_vergütung_pct / 100
  reinvestition_eur = total_net_pool × pool_share_reinvestition_pct / 100
  sozial_eur = total_net_pool × pool_share_sozial_pct / 100
  Validierung: Summe = total_net_pool ± 0.01€

  AUFBAUPHASE: wenn aufbauphase_active=true → Reinvestition + Sozial zusammenlegen

SCHRITT 3 — Stundensatz:
  total_billed_hours = SUM(time_entries.duration_hours WHERE billable=true AND approved)
  raw_rate = vergütung_eur / total_billed_hours
  Wenn raw_rate < hourly_rate_minimum_eur → Guardian-Alert, GV-Entscheidung
  Wenn raw_rate < hourly_rate_target_eur (20€) → Abstimmung type='qualifiziert_70' erstellen
    Periode bleibt 'calculating' bis Abstimmung abgeschlossen (70% Mehrheit erforderlich!)

SCHRITT 4 — Coins gutschreiben (PRO MITGLIED):
  new_coins = member_billed_hours (1 Coin = 1 Stunde, unveränderlich)
  eur_rate_at_creation = raw_rate (HISTORISCH FIXIERT — nie wieder änderbar)
  eur_reserve = new_coins × eur_rate_at_creation
  → INSERT btb_coin_ledger (type='verdient', coins, eur_rate_at_creation, eur_reserve, period_id)
  KRITISCH: Coins aus früheren Perioden behalten ihren ursprünglichen eur_rate_at_creation!
  Bei Zeit-Tausch wandert eur_rate_at_creation MIT dem Coin.

SCHRITT 5 — Solidarfonds-Einspeisung:
  solidar = sozial_eur × solidarity_fund_contribution_pct / 100
  solidarity_fund_balance += solidar
  Eintrag: solidarity_fund_transactions (type='periodeneinspeisung')

SCHRITT 6 — Reinvestitions-Verrechnung:
  Alle Fixkosten aus reinvestment_expenses des Monats summieren
  Wenn reinvestition_eur >= fixkosten: Differenz → reinvestitions_reserve
  Wenn reinvestition_eur < fixkosten: Fehlbetrag aus reinvestitions_reserve nehmen
  Wenn reserve < 0: KRITISCHER ALARM

SCHRITT 7 — Zell-Verteilung (GLEICHMÄSSIG — unabhängig von Größe/Umsatz):
  zell_reinvestition = reinvestition_eur / count(active_cells)
  zell_sozial = (sozial_eur - solidar) / count(active_cells)

SCHRITT 8 — Abschluss:
  pool_periods.status = 'closed', closed_at = ctx.now
  Chronicle: "Periode [Monat] abgeschlossen — [N] Mitglieder, [Stundensatz]€/h"
  E-Mail an Vorstand: vollständige Zusammenfassung

SCHRITT 9 — Async nachgelagert:
  coin-value-calculator, datev-exporter, period-report-generator, tax-advance-preparer

DRY-RUN gibt zurück:
  { expected_hourly_rate, coins_to_issue: [{member, hours, coins, eur}],
    warnings, errors, would_trigger_gv_vote }

Cron: letzter Tag des Monats, 23:00 Uhr Europe/Berlin
Manueller Trigger: POST /period-close-orchestrator/trigger (nur Admin-Rolle)
```

---

## 1.4 Coin Transaction Engine

```
Du bist in ~/btb-app/. Erstelle die vollständige Coin-Transaktions-Engine.
Jede Coin-Bewegung: atomar, idempotent, auditierbar.

TRANSAKTION 'zeit_tausch' (Mitglied A → B):
  Input: from_member_id, to_member_id, coins, leistungsbeschreibung
  Prüfung: from.coin_balance >= coins, to.status aktiv
  Buchung (eine Transaktion):
    from: -coins, eur_reserve -= (coins × gewichteter_historischer_kurs via FIFO)
    to:   +coins, eur_rate_at_creation = GLEICH wie von from (Coin behält Ursprungswert!)
    coin_transactions Eintrag, Push-Benachrichtigung beide Mitglieder
  Rollback bei jedem Fehler: vollständig, keine Teilbuchungen

TRANSAKTION 'waren_ek' (Coins gegen interne Ware):
  Input: member_id, item_id, quantity, coins_to_spend
  Prüfung: coin_balance >= coins, current_stock >= quantity
  Buchung:
    COINS: -coins_to_spend
    RÜCKLAGE: -item.price_purchase_eur × quantity (EK-Preis! nicht Coin-Nennwert)
    Differenz (Nennwert - EK) verbleibt in Pool
    LAGER: inventory_movements type='sale_internal'
    DATEV: Innenumsatz (kein USt)

TRANSAKTION 'coin_spende' (Euro-Anspruch zurückgeben):
  COINS BLEIBEN ERHALTEN — nur Euro-Anspruch erlischt!
  eur_reserve -= spendenbetrag → solidarity_fund_balance += spendenbetrag
  chronicle_entries (Pflicht): öffentlich wenn member.chronicle_consent=true
  Spendenbestätigung PDF generieren (python-docx, steuerrelevant)

TRANSAKTION 'austritt':
  Alle offenen Zeit-Tausch-Anfragen stornieren
  Geschäftsanteil berechnen (Satzung §8)
  payment_queue: type='austritt_auszahlung'
  member.status = 'ausgetreten', anonymization_scheduled_at = ctx.now + 3 Jahre

TRANSAKTION 'tod' (Satzung §14 — Coins → Pool, nicht Erben):
  ALLE Coins: type='abgang_tod', gesamte eur_reserve → vergütungs_pool
  member.status = 'verstorben' (NICHT 'gelöscht')
  E-Mail an Vorstand: "Bitte Chronicle-Eintrag würdevoll verfassen" — KEIN auto-Text
  Alle offenen Anträge stornieren

HILFSFUNKTION getWeightedHistoricalRate(member_id, coins_to_use):
  FIFO: älteste Coins zuerst
  Gewichteter Durchschnitt der eur_rate_at_creation
  Wird bei Auszahlung und Zeit-Tausch verwendet
```

---

## 1.5 DATEV Exporter + Tax Compliance

```
Du bist in ~/btb-app/. Erstelle DATEV-Export und Steuer-Compliance-Monitor.

KONTENPLAN (BtB-spezifisch, mit Steuerberater abzustimmen):
  1200 Bank Pool-Konto | 1201 Bank Solidarfonds | 1202 Coin-Rücklage-Verrechnungskonto
  4400 Erlöse extern (19% USt) | 4300 Erlöse steuerfrei (§4 UStG Heilberufe)
  4800 Erlöse intern (Innenumsatz, kein USt)
  6000 Wareneinsatz | 6300 Miete | 6400 Versicherungen | 6500 Software | 6600 Steuerberater
  7000 Coin-Vergütung (Verrechnungskonto) | 7100 Solidarfonds | 7200 Reinvestition

ROUTE POST /datev-exporter/export-period { period_id }:
  Buchungssätze aus: paid invoices, reinvestment_expenses, Dritteilung,
    Coin-Gutschriften (→ Konto 7000/1202), Solidarfonds-Einspeisung, finapi_transactions
  
  BESONDERHEIT Coin-Rücklage: Konto 7000 an 1202
    Steuerberater entscheidet: "sonstige Verbindlichkeiten" oder "Rückstellungen"
    Bis Klärung: separates Verrechnungskonto, klar kennzeichnen
  
  Output: DTVF_[Periode]_BtB.csv (DATEV ASCII Format 510)
           + Buchungsprotokoll.pdf (lesbar)
           → ZIP in Storage + E-Mail an Steuerberater + Vorstand

STEUER-FRISTKALENDER (cron täglich 07:00):
  10. des Monats: USt-Voranmeldung
  25. nach Quartalsende: Körperschaftsteuer-Vorauszahlung
  < 30 Tage: tägliche Übersicht | < 14 Tage: E-Mail | < 5 Tage: Guardian-CRITICAL

SACHBEZUGS-ÜBERWACHUNG (monatlich, kritisch für Bürgergeld-Mitglieder):
  Für Mitglieder mit bürgergeld_relevant=true:
  Interne Leistungen summieren: Waren-EK + Mahlzeiten + Wohnen
  > sachbezugs_freigrenze (aus universe_settings) → Warnung an Mitglied + Admin
  Bis Klärung durch Steuerberater: konservativ behandeln

KLEINUNTERNEHMER-SCHWELLE:
  Jahres-Außenumsatz bei 80% der Grenze → Warnung
  Bei Überschreitung → sofortiger Alarm + Hinweis auf USt-Pflicht ab nächstem Jahr

RECONCILIATION (täglich 03:00):
  financial_journal: Summen nach Konto berechnen
  Vergleich mit tatsächlichen Salden
  Differenz > 0.01€ → Alert 'financial_reconciliation_mismatch'
  Audit-Trail: financial_audit_log (append-only, niemals löschen/ändern)
```

---

## 1.6 Solidarity Fund Complete

```
Du bist in ~/btb-app/. Erstelle das vollständige Solidarfonds-System.

ANSPRUCHSTYPEN:
'schlechter_monat': auto-approved wenn Mitglied >= 6 Monate,
  Betrag <= solidarity_fund_lower_threshold, Fonds solvent, kein offener Antrag
'krankheit': Attest-Upload erforderlich, bis 4 Wochen automatisch, danach GV
'elternzeit': Staffeln aus universe_settings,
  Zusatz-Stunden für Schwangerschaft aus universe_settings.schwangerschafts_zusatzstunden
'notfall': 4h-Ziel, 2 Vorstandsmitglieder via Link-Klick, dann automatische Überweisung
'investition': GV-Entscheidung immer erforderlich, Rückzahlungsplan pflicht

RÜCKZAHLUNGS-TRACKING:
  solidarity_repayment_plans: id, grant_id, total_eur, monthly_installment, remaining_eur
  Monatliche Abbuchung in Coins (nicht Euro) → Pool bekommt eur_reserve zurück

FONDS-GESUNDHEITS-AMPEL:
  Grün: > 3 × durchschnittliche Monatszahlung
  Gelb: 1–3 × Durchschnitt
  Rot: < 1 × Durchschnitt → neue Anträge nur noch nach GV-Beschluss

PROGNOSE:
  Bei aktuellem Trend: wann ist Fonds leer?
  < 6 Monate Reichweite → Vorstand informieren

CHRONICLE (nach Auszahlung):
  Mit Einwilligung: "[Vorname] wurde unterstützt."
  Ohne Einwilligung: "Solidarfonds-Unterstützung gewährt." (kein Name)
```

---

# MODUL 2 — MITGLIEDER & GOVERNANCE

---

## 2.1 Member Onboarding Chain

```
Du bist in ~/btb-app/. Erstelle den vollständigen Onboarding-Prozess.
DB-Trigger auf universe_members UPDATE wenn status → 'anwärter'.

Alle Schritte fehlertolerant: ein fehlgeschlagener Schritt bricht nicht die gesamte Kette.
Jeden Schritt in onboarding_steps loggen (step_name, status, completed_at, error).

SCHRITT 1: Supabase Auth Einladung (supabase.auth.admin.inviteUserByEmail)
SCHRITT 2: Wallet initialisieren (member_coin_ledger, 0 Coins)
SCHRITT 3: Aufnahmeantrag PDF (python scripts/documents/generate_application.py)
  → Supabase Storage bucket 'member-documents'
  → Download-Link per E-Mail
SCHRITT 4: Chronicle-Eintrag "Neues Mitglied: [Vorname] [Nachname-Initial]."
SCHRITT 5: Admin-Benachrichtigung (E-Mail + Signal-Webhook)
SCHRITT 6: Willkommens-E-Mail via Brevo Template 'member_welcome'
SCHRITT 7: Onboarding-Checklist erstellen in onboarding_checklists
  (Profil vervollständigen, IBAN hinterlegen, Tutorial, etc.)
```

---

## 2.2 Voting System

```
Du bist in ~/btb-app/. Erstelle das vollständige Abstimmungssystem.

TABELLEN:
votes: id, title, description,
  vote_type CHECK (vote_type IN ('einfach','qualifiziert_70','satzung','budget')),
  created_by, starts_at, ends_at, status, result, result_details JSONB
vote_responses: id, vote_id, member_id, choice (ja|nein|enthaltung), voted_at
cooperative_resolutions: id, vote_id, resolution_number TEXT (Format YYYY-NNN),
  resolution_text, passed_at, implementation_deadline

CRON alle 15min: Abgelaufene Abstimmungen schließen

AUSWERTUNG:
  'einfach': ja > nein → bestanden
  'qualifiziert_70': ja >= 70% der abgegebenen → bestanden (STUNDENSATZ-ABSENKUNG!)
  'satzung': ja >= 75% + Quorum 66% → bestanden
  
  Bei bestanden:
  → cooperative_resolutions (fortlaufende Nummer YYYY-NNN)
  → E-Mail-Zusammenfassung an alle
  → Chronicle: "Beschluss [Nr]: [Titel] — angenommen mit X% Ja-Stimmen"
  → Wenn vote_type='satzung': generate_statute_amendment aufrufen
  
  Bei abgelehnt: E-Mail mit Ergebnis. Kein Chronicle-Eintrag.
```

---

## 2.3 Time Entry Validator

```
Du bist in ~/btb-app/. Erstelle den Zeiterfassungs-Validator.
Cron: täglich 20:00 Uhr.

Prüfung 1 — Fehlende Notizen (nachträgliche Einträge):
  entry_type='nachträglich' AND notes IS NULL AND created_at < ctx.now - 24h AND reminders_sent < 3
  → E-Mail-Erinnerung, reminders_sent++
  → Nach 3 Erinnerungen: status='review_required'

Prüfung 2 — Überlappende Zeiteinträge (selbe Person, selber Tag):
  Zeiteinträge sortiert nach start_time, wenn end_time[n] > start_time[n+1]
  → E-Mail: "Überlappende Einträge gefunden"
  → overlap_flagged = true

Prüfung 3 — Vergessene Timer (status='running' AND started_at < ctx.now - 12h):
  → status='abandoned'
  → E-Mail: "Timer automatisch gestoppt nach 12h"
  → Guardian-Klasse 'abandoned_timer' loggen

Prüfung 4 — Unrealistisch lang (> 12h ohne 30min Pause):
  → review_recommended = true
  → Soft-Hinweis an Mitglied (kein automatisches Ändern!)

Wöchentlicher Admin-Report (montags):
  Alle Mitglieder mit offenen review_required oder overlap_flagged Einträgen
```

---

# MODUL 3 — BETRIEB & LAGER

---

## 3.1 Inventory Monitor + Group Order Coordinator

```
Du bist in ~/btb-app/. Erstelle Lagerüberwachung und Sammelbestellungskoordinator.

INVENTORY-MONITOR (cron stündlich):
  Prüfung 1 — Meldebestand:
    current_stock <= min_stock AND is_active=true AND keine offene Bestellung vorhanden
    → Draft-Bestellung erstellen, E-Mail an Zell-Admin
    → is_own_production=true: production_orders statt Bestellung

  Prüfung 2 — MHD-Alarm:
    expiry_date < ctx.now + 3 Tage → Warnung
    expiry_date < ctx.now → status='abgelaufen', current_stock=0

  Prüfung 3 — Sammelbestellungs-Erkennung:
    Draft-Bestellungen gruppiert nach supplier_id
    Wenn supplier_id in 3+ verschiedenen cell_ids → group_order_proposals erstellen
    E-Mail an alle Zell-Admins: "Sammelbestellung möglich, spart ~X%"

GROUP-ORDER-COORDINATOR (cron täglich 08:00):
  Phase 1: proposals mit status='pending' nach 48h → bestätigende Zellen sammeln
  Phase 2: nach 72h ohne Antwort → Zelle aus Sammelbestellung raus
  Phase 3: Bestellung aufgeben (Brevo E-Mail mit Bestellliste), alle informieren
  Phase 4: Bei Lieferung → Bestand auf alle Zellen proportional aufteilen, Kosten aufteilen
```

---

## 3.2 Invoice Payment Matcher + Dunning System

```
Du bist in ~/btb-app/. Erstelle Zahlungsmatching und Mahnwesen.

PAYMENT-MATCHER (Webhook von FinAPI bei neuem Kontoeingang):
  Input: { amount_eur, iban_sender, reference_text, transaction_id, booked_at }
  
  Matching-Logik (in dieser Reihenfolge):
  1. Exakt: reference_text enthält invoice_number → confidence='exact'
  2. Betrag+IBAN: amount ≈ invoice.total_gross (±0.01€) AND sender_iban=customer.iban → 'high'
  3. Nur Betrag: amount ≈ total_gross, mehrere Kandidaten → 'medium', Admin-Review
  4. Teilzahlung: amount < offene Kundensumme → Teilbuchung
  5. Kein Match → unmatched_payments, Admin-E-Mail

  Bei Match: invoice.status='paid', DATEV-Buchung vorbereiten

DUNNING-SYSTEM (cron täglich 09:30):
  Alle Fristen aus universe_settings (dunning_days_1/2/3/4):
  Stufe 1 (+7 Tage): freundliche Erinnerung
  Stufe 2 (+14 Tage): zweite Mahnung
  Stufe 3 (+21 Tage): offizielle Mahnung + Mahngebühr (dunning_fee_eur aus Settings)
  Stufe 4 (+30 Tage): Admin-Entscheidung erforderlich

  Ausnahmen (NICHT mahnen):
  payment_plan=true | invoice.type='spende'|'intern' | dunning_paused=true | disputed=true

  Jede Mahnung in dunning_logs: invoice_id, level, sent_at, amount_at_time
```

---

# MODUL 4 — COMMUNITY & KOMMUNIKATION

---

## 4.1 Chronicle Recorder + Newsletter Generator

```
Du bist in ~/btb-app/. Erstelle Chronicle und Newsletter-System.

CHRONICLE-TABELLE:
  id, entry_type (auto|manual), category, title, content,
  is_public BOOLEAN, author_member_id, linked_entity_type, linked_entity_id,
  created_at, approved_by, approved_at

AUTOMATISCHE TRIGGER (DB-Trigger + Edge Function):
  universe_members INSERT → "Neues Mitglied: [Vorname] [Nachname-Initial]"
  universe_cells INSERT → "Neue Zelle gegründet: [Name] in [Ort]"
  cooperative_resolutions INSERT (wenn public) → "Beschluss [Nr]: [Titel]"
  solidarity_grants INSERT → Anonymisiert oder mit Name (je nach consent)
  coin_donations INSERT → "[Vorname] hat Euro-Anspruch zurückgegeben" (nur mit consent)

Manuelle Einträge: brauchen Admin-Freigabe (approved_by IS NULL → pending)
Frontend: Zeitstrahl-Ansicht, öffentliche Einträge ohne Login sichtbar

NEWSLETTER-GENERATOR (cron: 1. des Monats 10:00 Uhr):
  Daten aggregieren: Pool-Ergebnis, neue Mitglieder (mit consent), öffentliche Beschlüsse,
    Top-3 Wissensbank-Artikel, kommende Kurse, offene Abstimmungen

  Anthropic API claude-sonnet-4-20250514:
    System: "Du schreibst den monatlichen BtB-Newsletter. Stil: ehrlich, warm, direkt.
    Kein Marketing-Sprech. Schreibe wie jemand der wirklich glaubt was er schreibt.
    Max 400 Wörter Gesamtfließtext."
    Input: strukturierte JSON-Daten
  
  Personalisierung: zuerst News der eigenen Zelle, dann genossenschaftsweit
  Unsubscribe-Link: DSGVO-konform automatisch eingefügt
  newsletter_stats: Öffnungsrate, Klickrate speichern
```

---

# MODUL 5 — TÄTIGKEITSMODUL-SYSTEM (Meta-Agent)

---

## 5.1 Meta-Agent: Tätigkeitsmodul-Architekt

```
Du bist in ~/btb-app/. Erstelle den Meta-Agenten der neue Tätigkeitsmodule entwickelt.
Dieser Agent wird aufgerufen wenn eine neue Tätigkeit ins System aufgenommen wird.
Er entwickelt automatisch passende Agenten für die Prozessautomatisierung dieser Tätigkeit.

ARCHITEKTUR: Der Meta-Agent ist selbst ein Agent der andere Agenten entwickelt.
Er ist vom restlichen System entkoppelt — er baut neue Bausteine, nicht den Kern.

TABELLEN:
profession_modules: id, name TEXT, slug TEXT UNIQUE, icon TEXT, color_hex TEXT,
  description TEXT, is_active BOOLEAN DEFAULT false,
  automation_count INTEGER DEFAULT 0, created_at
profession_agents: id, module_id UUID REFERENCES profession_modules,
  agent_name TEXT, agent_type TEXT, schedule TEXT,
  edge_function_path TEXT, enabled BOOLEAN DEFAULT true,
  auto_generated BOOLEAN DEFAULT true, created_at
profession_agent_logs: id, agent_id, run_at, status, records_processed, errors JSONB

ROUTE POST /profession-module-architect/create-module:
  Input: {
    name: "Physiotherapeut",       -- Tätigkeitsname
    description: "...",            -- Kurzbeschreibung
    key_documents: ["Verordnung", "Rezept", "Befundbericht"],
    external_parties: ["Krankenkasse", "Arzt", "Patient"],
    billing_types: ["gkv", "pkv", "coins_intern"],
    time_critical_deadlines: true, -- gibt es Fristen?
    requires_qualifications: true, -- Zertifikate/Lizenzen nötig?
    has_inventory: false,          -- Lagerverwaltung?
    has_external_clients: true     -- externe Kunden (nicht nur intern)?
  }

PHASE 1 — Datenbank-Struktur generieren:
  Aus den Input-Parametern eine Datenbankschema-Vorlage ableiten.
  Immer enthalten: [tätigkeit]_jobs/cases/clients, [tätigkeit]_time_logs,
    [tätigkeit]_documents, [tätigkeit]_billing
  Konditional:
    has_inventory → [tätigkeit]_materials
    requires_qualifications → [tätigkeit]_certificates
    time_critical_deadlines → [tätigkeit]_deadlines
  
  Migration-Datei generieren: supabase/migrations/[timestamp]_[slug]_module.sql
  Alle Tabellen: cell_id, member_id, created_at, updated_at als Pflichtfelder
  Alle Tabellen: RLS-Policies (Mitglied sieht nur eigene Daten, Zell-Admin sieht Zell-Daten)

PHASE 2 — App-Seiten generieren:
  src/pages/betrieb/[slug]/[Slug]Dashboard.tsx
  Haupt-Dashboard mit: aktive Fälle/Jobs, Zeiterfassung, offene Aufgaben, Coin-Verdienst
  
  Sidebar-Eintrag in AppSidebar.tsx (bedingt sichtbar):
  Nur wenn: user.cell.active_modules enthält slug

PHASE 3 — AGENTEN AUTOMATISCH ENTWICKELN:
  Analysiere die Input-Parameter und entscheide welche Agenten diese Tätigkeit braucht.
  
  IMMER erstellen:
  Agent A — [slug]-reminder: tägliche Erinnerungen für offene Aufgaben/Termine
    Cron: täglich 08:00. Prüft: überfällige Einträge, fehlende Dokumentation.
  
  Agent B — [slug]-billing-prepare: monatliche Abrechnungsvorbereitung
    Cron: 25. des Monats. Sammelt abgeschlossene Leistungen, erstellt Abrechnungsübersicht.
    Wenn billing_types enthält 'coins_intern': automatisch Zeit-Tausch vorschlagen.
  
  Agent C — [slug]-document-generator: Automatische Dokumenten-Erstellung
    Trigger: bei Abschluss eines Falls/Jobs.
    Generiert das tätigkeits-spezifische Abschlussdokument (python-docx, BtB-Design).
  
  KONDITIONAL erstellen:
  Wenn time_critical_deadlines=true:
    Agent D — [slug]-deadline-guardian: Fristen-Überwachung mit gestuften Alarmen
    < 30 Tage: weekly digest | < 14 Tage: täglich | < 5 Tage: mehrfach täglich + Signal
  
  Wenn requires_qualifications=true:
    Agent E — [slug]-certificate-monitor: Zertifikat-Ablauf-Überwachung
    90/60/30 Tage vor Ablauf: eskalierte Erinnerungen
  
  Wenn has_inventory=true:
    Agent F — [slug]-material-tracker: Material-Verbrauch und Nachbestellung
    (integriert mit inventory-monitor)
  
  Wenn external_parties enthält 'Krankenkasse':
    Agent G — [slug]-insurance-billing: Krankenkassen-Abrechnungs-Automatik
    (tätigkeits-spezifische Leistungsziffern aus universe_settings)

PHASE 4 — GUARDIAN-ERWEITERUNG:
  Neue Fehlerklassen für diese Tätigkeit in guardian_known_errors eintragen.
  Bypass-Pfad für den kritischsten Prozess der Tätigkeit:
    Was ist der Prozess der KEINESFALLS ausfallen darf? (z.B. Fristenwahrung)
    Guardian überwacht diesen Prozess mit erhöhter Frequenz.

PHASE 5 — SELBST-REGISTRIERUNG:
  profession_modules Eintrag anlegen (is_active=false, muss manuell aktiviert werden)
  Alle generierten Agenten in profession_agents eintragen
  Admin-E-Mail: "Neues Tätigkeitsmodul '[Name]' erstellt:
    [N] Agenten generiert. Zum Aktivieren: Admin → Module → [Name] → Aktivieren."

PHASE 6 — DOKUMENTATION:
  docs/modules/[slug].md erstellen mit:
  Was macht dieses Modul? | Welche Agenten? | Wie aktivieren? | Bekannte Einschränkungen
```

---

## 5.2 Vorgefertigte Tätigkeitsmodule (direkt verwendbar)

```
Du bist in ~/btb-app/. Erstelle das Tätigkeitsmodul für [TÄTIGKEIT HIER EINSETZEN].
Nutze den Meta-Agenten aus 5.1 als Grundlage und erstelle das komplette Modul.

Input für den Meta-Agenten:
{
  name: "[Tätigkeitsname]",
  slug: "[slug]",
  description: "[Kurzbeschreibung]",
  key_documents: ["Dokument1", "Dokument2"],
  external_parties: ["Partei1"],
  billing_types: ["coins_intern"],  // oder ["eur_extern", "gkv", "pkv"]
  time_critical_deadlines: false,   // true oder false
  requires_qualifications: false,   // true oder false
  has_inventory: false,             // true oder false
  has_external_clients: false       // true oder false
}

// BEISPIELE FÜR TÄTIGKEITEN:
// Körperarbeit/Massage:    time_critical=false, qualifications=true, external=true
// Handwerk/Tischler:       time_critical=false, inventory=true, external=true
// Heilpraktiker:           time_critical=true, qualifications=true, external=true, billing=[pkv]
// Koch/Catering:           inventory=true, external=true
// Gärtner:                 time_critical=true (Saison), inventory=true
// Elektriker:              time_critical=true (Prüfpflichten), qualifications=true
// Sozialarbeiter:          time_critical=false, external=false
// Bäcker:                  inventory=true, time_critical=false (MHD)
// Rechtsanwalt:            time_critical=true (Fristen!), qualifications=true
// Steuerberater:           time_critical=true (Steuerfristn), qualifications=true
// Fotograf:                qualifications=false, external=true
// Musiker/Lehrer:          external=true, qualifications=false
// IT-Dienstleister:        time_critical=true, qualifications=false
// Hebamme:                 time_critical=true, qualifications=true, billing=[gkv]
// Psychologischer Coach:   external=true, qualifications=true
// Fahrer/Logistik:         inventory=false, has_external_clients=true
```

---

# MODUL 6 — BtB-EIGENE KI (Unabhängigkeit von externen APIs)

---

## 6.1 Lokales LLM Setup (Ollama)

```
Du bist in ~/btb-app/. Erstelle das Setup für eine lokale KI-Infrastruktur.
Ziel: 80% der KI-Anfragen laufen lokal — keine Abhängigkeit von Anthropic für Routine-Tasks.

ARCHITEKTUR (Drei-Schichten-Modell):

Schicht 1 — Lokales LLM (80% der Anfragen):
  Ollama auf einem Mini-Server (Mac Mini M2 oder Raspberry Pi 5 mit 8GB RAM)
  Modelle: llama3.1:8b (gut für Deutsch) oder mistral:7b (schneller, etwas schlechter)
  Kosten: ~8€/Monat Strom statt 300-800€/Monat Anthropic-API
  Gut für: Zusammenfassungen, Kategorisierungen, einfache Texte, interne Abfragen,
           Newsletter-Drafts, Zeiteintrags-Kategorisierungen, Beschluss-Zusammenfassungen

Schicht 2 — Anthropic API (15% — komplexe Aufgaben):
  Medizinische Dokumentation, Root-Cause-Analysen, Konzeptarbeit,
  Visions-Dokument-Assistent, komplexe Rechtsformulierungen
  → Nur verwenden wenn Schicht 1 explizit nicht ausreicht (konfigurierbar)

Schicht 3 — Fine-tuned BtB-Modell (mittelfristig, 6-12 Monate):
  Llama-Basis, trainiert auf: BTB_Konzept_v14.docx, Satzung, Steuer-Briefing,
  Beschlüsse, Wissensdatenbank, Chronicle-Einträge
  → "Kennt" BtB ohne jeden Kontext neu erklären zu müssen
  → Trainingskosten: einmalig ~50€ GPU-Stunden (Runpod o.ä.)

ERSTELLE: supabase/functions/_shared/ai-router.ts

Die AI-Router-Klasse:
  async function callAI(prompt, options):
    options.complexity: 'low' | 'medium' | 'high'
    options.requiresBtbKnowledge: boolean (nutzt fine-tuned wenn verfügbar)
    
    if (options.complexity === 'low' && local_llm_available):
      → Ollama API (localhost:11434 oder Server-IP)
    elif (options.complexity === 'medium' && btb_model_available):
      → Fine-tuned BtB-Modell
    else:
      → Anthropic claude-sonnet-4-20250514

  Fallback-Kette: lokal → fine-tuned → Anthropic → Error-Handler

ERSTELLE: scripts/setup_local_ai.sh
  Installiert Ollama auf dem BtB-Server
  Lädt llama3.1:8b herunter
  Erstellt systemd-Service für Auto-Start
  Konfiguriert Nginx-Reverse-Proxy mit Basic-Auth
  Testet die Verbindung

ERSTELLE: src/pages/admin/AISettings.tsx
  Admin-Seite für KI-Konfiguration:
  - Welche Modelle sind verfügbar? (Ampel für jeden Schicht)
  - Welche Agenten nutzen welche Schicht? (konfigurierbar pro Agent)
  - Monatliche API-Kosten-Übersicht (aus api_usage_log)
  - Kosten-Prognose wenn aktueller Trend anhält
  - Umschalt-Button: Schicht 1 als Pflicht / nur wenn verfügbar / nie

MIGRATION api_usage_log:
  id, agent_name, model_used ('local'|'btb_fine_tuned'|'anthropic'),
  prompt_tokens, completion_tokens, cost_eur_estimated, used_at
  → Monatlicher Report: was hat welche KI-Schicht gekostet?
```

---

## 6.2 BtB Fine-Tuned Model (mittelfristig)

```
Du bist in ~/btb-app/. Erstelle die Infrastruktur für ein BtB-eigenes Fine-Tuning.
Dieses Skript läuft einmalig zur Modell-Erstellung, dann jährlich zur Aktualisierung.

ERSTELLE: scripts/fine_tuning/prepare_training_data.py

Datenquellen für Training:
  1. /mnt/project/BTB_Konzept_v14.docx → Text extrahieren, in Q&A-Paare umwandeln
  2. /mnt/project/BackToBalance_Satzung_2026.docx → Satzungs-Fragen und Antworten
  3. /mnt/project/BtB_Steuer_Briefing.docx → Steuerliche Q&A-Paare
  4. Supabase: cooperative_resolutions → Beschluss-Zusammenfassungen
  5. Supabase: knowledge_base → alle Artikel als Kontext
  6. Supabase: chronicle_entries → Stil-Beispiele für BtB-Tonalität

Format: JSONL für Llama-Fine-Tuning:
  {"messages": [
    {"role": "system", "content": "Du bist der BtB-Assistent..."},
    {"role": "user", "content": "Wie funktioniert die Coin-Rücklage?"},
    {"role": "assistant", "content": "Die Coin-Rücklage..."}
  ]}

Mindestens 500 Q&A-Paare generieren.
KI-unterstützte Augmentierung: Anthropic API generiert Variationen der Fragen.

ERSTELLE: scripts/fine_tuning/run_fine_tuning.sh
  Runpod oder Modal.com als GPU-Anbieter (~ 2h Training auf A100 = ~20€)
  Basis: meta-llama/Meta-Llama-3.1-8B-Instruct
  Fine-Tuning via LoRA (Parameter-efficient, kleinere Modellgröße)
  Output: btb-model-v1.gguf → auf BtB-Server laden → Ollama registrieren

ERSTELLE: scripts/fine_tuning/evaluate_model.py
  Test-Fragen aus allen Konzeptbereichen
  Vergleich: lokales Modell vs. fine-tuned vs. Anthropic
  Qualitätsscore (manuell zu bewerten: Korrektheit, Stil, BtB-Konsistenz)
  Freigabe-Schwelle: > 85% Qualitätsscore → Modell geht live

UPDATE-ZYKLUS:
  Jährlich oder wenn sich Konzept/Satzung ändert neu trainieren.
  Training-Daten werden versioniert und in Supabase Storage gespeichert.
```

---

# MODUL 7 — REPORTING & TRANSPARENZ

---

## 7.1 Financial Dashboard + Period Report

```
Du bist in ~/btb-app/. Erstelle das vollständige Finanz-Dashboard.

ROUTE GET /financial-dashboard/overview:
  {
    pool_status: { current_period, gross_revenue_mtd, net_pool_mtd, projected_hourly_rate },
    coin_status: { total_outstanding, total_eur_obligation, reserve_balance, solvency_ratio },
    solidarity_fund: { balance_eur, health_status, open_requests, ytd_disbursed },
    reinvestition: { balance_eur, monthly_fixed_costs, months_covered },
    tax_status: { next_deadline: { type, date, days_remaining } },
    bank_accounts: [{ name, iban_last4, balance_eur, last_synced }]
  }

ROUTE GET /financial-dashboard/member-economics { member_id }:
  Individuelles Wirtschaftsbild: Stunden × Stundensatz, Coins eingelöst,
  Coins ausgezahlt, aktueller Saldo + EUR-Gegenwert, Anteil am Gesamtpool

FRONTEND src/pages/admin/FinancialDashboard.tsx:
  recharts für Diagramme | shadcn/ui Cards | #2a7cab Primary
  Echtzeit via Supabase Realtime auf pool_periods + btb_coin_ledger
  Mobile-responsive (Vorstand schaut oft vom Handy)
  Ampel-Widgets: Solvenz | Solidarfonds | Steuerfrist | Guardian-Status

PERIODEN-BERICHT GENERATOR (nach Abschluss, cron oder manuell):
  scripts/documents/generate_period_report.py
  python-docx, BtB-Design
  Seite 1: KPI-Kacheln (Gesamtpool | Stundensatz | Coins im Umlauf | Solidarfonds)
  Seite 2: Einnahmen-Tabelle nach Zelle + Balkendiagramm (matplotlib eingebettet)
  Seite 3: Dritteilungs-Donut-Chart
  Seite 4: Coin-Übersicht + Solvenz-Nachweis
  Seite 5: Wendepunkt-Prognose
  → Storage + E-Mail an Vorstand (vollständig) + alle Mitglieder (vereinfacht, 1 Seite)
```

---

## 7.2 Annual Closing + Transparency Dashboard

```
Du bist in ~/btb-app/. Erstelle Jahresabschluss-Assistenten und öffentliches Transparenz-Dashboard.

JAHRESABSCHLUSS (startet 2. Januar automatisch für Vorjahr):
  Phase 1: Vollständigkeits-Check (alle 12 Perioden, alle Rechnungen, Solvenz 31.12.)
  Phase 2: Jahres-Kennzahlen (Gesamtumsatz, Durchschnittsstundensatz, Coin-Verbindlichkeiten 31.12.)
  Phase 3: Steuerberater-Paket (DATEV-Jahresexport, Coin-Rücklage-Nachweis,
            Solidarfonds-Nachweis, Sachbezugs-Übersicht, offene Steuer-Fragen mit Status)
  Phase 4: BWGV-Prüfungs-Vorbereitung (Checkliste §53 GenG, Terminvorschlag)
  Phase 5: Individuelle Mitglieder-Jahresabrechnung (E-Mail an jedes Mitglied Januar)

ÖFFENTLICHES TRANSPARENZ-DASHBOARD (src/pages/public/Transparency.tsx, kein Login):
  Was öffentlich gezeigt wird (keine Finanzzahlen, keine Personendaten):
  - Mitgliederanzahl (Entwicklung über Zeit)
  - Aktive Zellen nach Typ
  - Solidarfonds-Nutzung (anonymisiert: "X€ in diesem Jahr ausgeschüttet")
  - Abstimmungsquote (wie demokratisch sind wir wirklich?)
  - Letzte öffentliche Beschlüsse
  - Jahresbericht-Download
  Supabase Realtime für Live-Aktualisierungen.
```

---

# SUPER-PROMPT: Alles integrieren

```
Du bist in ~/btb-app/. Alle Module wurden einzeln erstellt.
Integriere jetzt alles zu einem kohärenten System.

1. AUTOMATION_REGISTRY befüllen (alle bekannten Agenten):
   Erstelle Migration mit INSERT für alle Agent-Einträge:
   name, description, schedule, enabled=true, module (welchem Modul zugehörig)

2. GUARDIAN BEKANNTE FEHLERKLASSEN:
   Alle Fehlerklassen aus allen Modulen in guardian_known_errors eintragen.

3. TEMPORAL CONTEXT überall:
   Prüfe JEDE Edge Function in supabase/functions/ auf raw new Date() Aufrufe.
   Wenn gefunden: zu createTemporalContext refactoren.

4. ADMIN-SIDEBAR:
   In AppSidebar.tsx: Guardian-Dashboard und Financial-Dashboard unter Admin-Sektion.
   Nur sichtbar für Rolle 'admin' oder 'vorstand'.

5. GUARDIAN-STATUS-WIDGET:
   In TopBar.tsx: farbiger Status-Dot (grün/gelb/rot).
   Klick → Guardian-Dashboard. Polling alle 60s.

6. CRON-JOBS verifizieren:
   Zeige mir alle pg_cron Jobs. Zeitzonen korrekt (Europe/Berlin)?
   Überschneidungen (zwei kritische Jobs zur selben Zeit)?

7. AI-ROUTER aktivieren:
   Prüfe alle bestehenden Anthropic-API-Aufrufe im Code.
   Ersetze durch ai-router.ts Aufrufe mit korrekter complexity-Einstellung.
   Lokales LLM für: Newsletter-Draft, Zusammenfassungen, Kategorisierungen
   Anthropic für: Arztbriefe, Root-Cause, Konzeptarbeit

8. ABSCHLUSS-TEST (Dry-Run Gesamtzyklus):
   → 3 Rechnungen erstellen + bezahlen (Dry-Run)
   → Pool-Abschluss (Dry-Run)
   → Coins gutschreiben (Dry-Run)
   → Zeit-Tausch (Dry-Run)
   → Waren-EK (Dry-Run)
   → Auszahlung (Dry-Run)
   → DATEV-Export (Dry-Run)
   → Solvenz-Check
   Zeige mir das Ergebnis jedes Schritts.

9. DOKUMENTATION:
   docs/SYSTEM_OVERVIEW.md erstellen:
   Alle Module, alle Agenten, alle Abhängigkeiten als Übersicht.
   Für neue Entwickler/Mitglieder die am System mitarbeiten.
```

---

## IMPLEMENTIERUNGS-REIHENFOLGE

```bash
# PHASE 1 — FUNDAMENT (Woche 1)
claude  # → 0.1 temporal-context-module
claude  # → 0.2 guardian-core
claude  # → 0.3 guardian-repair + bypass
claude  # → 0.4 staging-release-manager

# PHASE 2 — GELD (Woche 2-3)
claude  # → 1.1 invoice-lifecycle-manager
claude  # → 1.2 finapi-bridge
claude  # → 1.3 period-close-orchestrator (WICHTIG: Dry-Run zuerst testen!)
claude  # → 1.4 coin-transaction-engine
claude  # → 1.5 datev-exporter + tax-compliance
claude  # → 1.6 solidarity-fund-complete

# PHASE 3 — MITGLIEDER (Woche 4)
claude  # → 2.1 member-onboarding-chain
claude  # → 2.2 voting-system
claude  # → 2.3 time-entry-validator

# PHASE 4 — BETRIEB (nach Gründung, bei Bedarf)
claude  # → 3.1 inventory-monitor + group-order
claude  # → 3.2 payment-matcher + dunning
claude  # → 5.1 meta-agent tätigkeitsmodul
         #    dann für jede Tätigkeit: 5.2 mit konkreten Parametern

# PHASE 5 — KI-UNABHÄNGIGKEIT (Monat 2-3)
claude  # → 6.1 lokales LLM setup
claude  # → 6.2 fine-tuning infrastruktur (nach 3 Monaten Datenlage)

# PHASE 6 — INTEGRATION (laufend)
claude  # → super-prompt integration

# PARALLEL MIT CURSOR (nie dieselbe Datei!):
# Claude Code: supabase/functions/ + scripts/ + migrations/
# Cursor:      src/pages/ + src/components/
# Git-Checkpoint VOR JEDEM SCHRITT:
git add -A && git commit -m "checkpoint: [was als nächstes kommt]"
```

---

*Back to Balance eG — Das System gehört der Gemeinschaft. Die KI auch.*
*Mega-Prompt Sammlung v1.0 | Stand: 2026*
