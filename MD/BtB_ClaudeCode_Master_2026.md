# Back to Balance — Claude Code Master-Prompt
**Alle Agenten, alle Module, vollständig. Stand: April 2026**

> **Verwendung:** Im Terminal `cd ~/btb-app && claude` öffnen.
> Prompt einfügen. Claude Code arbeitet eigenständig.
> Cursor arbeitet parallel in `src/pages/` und `src/components/`.
> NIE gleichzeitig dieselbe Datei mit beiden Tools!

> **Goldene Regel:** `git add -A && git commit -m "checkpoint: [was folgt]"` vor jeder Session.

---

## STACK & KONTEXT (immer mitschicken)

```
Stack:        React 18 + TypeScript + Vite + Tailwind + shadcn/ui
Backend:      Supabase (ID: xcngmshjuqoucdlgikao)
Banking:      FinAPI
Email:        Brevo
Lokal:        ~/btb-app/
Tool-Split:   Claude Code → supabase/functions/, scripts/, Migrationen
              Cursor     → src/pages/, src/components/
              Manuell    → AppSidebar.tsx
Solvenz-Inv:  sum(member_coin_ledger.eur_reserve) = sum(coin_reserve_accounts.balance)
              IMMER wahr. Guardian prüft alle 5min.
```

---

# MODUL 0 — FUNDAMENT (zuerst!)

## 0.1 Temporal Context Module

```
Du bist in ~/btb-app/.
Erstelle das zentrale Zeitgefühl-Modul. Alle anderen Agenten brauchen es.

DATEI: supabase/functions/_shared/temporal.ts
AUCH:  src/lib/temporal.ts (Frontend, gleiches Interface)

TABELLE system_temporal_context (Migration):
  id, agent_name, session_id UUID, started_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'Europe/Berlin',
  fiscal_month TEXT,          -- '2026-03'
  fiscal_day_type TEXT,       -- 'month_end' | 'month_start' | 'mid_month'
  sequence_number INTEGER,    -- wievielter Lauf heute
  previous_run_at TIMESTAMPTZ, previous_run_id UUID,
  context_snapshot JSONB,
  finished_at TIMESTAMPTZ, outcome TEXT  -- 'success'|'error'|'dry_run'|'disabled'

INTERFACE TemporalContext:
  now: Date               -- EINZIGE Zeitquelle (einmal erstellen, durchreichen)
  timezone: string        -- 'Europe/Berlin'
  fiscalMonth: string     -- '2026-03'
  fiscalDayType: 'month_end'|'month_start'|'mid_month'
  isoString: string
  localDateString: string -- '2026-03-31' in Europe/Berlin
  sessionId: string
  agentName: string
  sequenceNumber: number
  previousRunAt: Date | null
  previousRunId: string | null
  contextSnapshot: Record<string, unknown>

HILFSFUNKTIONEN:
  createTemporalContext(agentName): Promise<TemporalContext>
  isLastDayOfMonth(date, tz): boolean
  isFirstDayOfMonth(date, tz): boolean
  isBusinessDay(date, tz): boolean
  nextBusinessDay(date, tz): Date
  toLocalDate(date, tz): string

KRITISCH: Wenn Prozess um 23:58 startet und nach Mitternacht endet →
alles gehört noch zum alten Tag. ctx.now wird EINMAL gesetzt, nie erneut.

TESTS in tests/temporal.test.ts:
  - Monatsübergang 23:58 → Monat korrekt zugeordnet
  - Sequenznummer steigt korrekt
  - Europe/Berlin vs UTC korrekt
  - fiscalDayType für letzten Tag, ersten Tag, Mitte

Nach Fertigstellung: Dry-Run zeigen, dann Confirm.
```

---

## 0.2 Guardian Core

```
Du bist in ~/btb-app/.
Erstelle den Guardian — permanenten Überwachungs-Agenten.
Lies zuerst bestehende Edge Functions und DB-Struktur.

DATEIEN:
  supabase/functions/guardian-core/index.ts
  supabase/functions/_shared/guardian-types.ts
  src/pages/admin/GuardianDashboard.tsx

TABELLEN (Migrationen):
  guardian_logs:              id, agent_name, session_id, check_type,
                              status (ok|warning|critical|error),
                              message, details JSONB, checked_at, resolved_at
  guardian_repairs:           id, error_class, before_state JSONB, after_state JSONB,
                              success, repair_started_at, repair_finished_at, session_id
  guardian_workarounds:       id, element_name, bypass_type, activated_at, activated_by,
                              deactivated_at, deactivated_by, reconciliation_done, notes
  guardian_root_cause_reports:id, error_class, occurrence_count, period_days,
                              hypothesis, recommendations JSONB, created_at, admin_notified
  active_bypasses:            id, element_name, bypass_type, activated_at, status

CRON: alle 5 Minuten (oder manuell triggern).

PRÜFUNGEN (in Reihenfolge):

1. DB-Verbindung: SELECT 1 → Timeout = EXISTENTIAL
2. Edge Functions: GET /health auf alle in automation_registry → != 200 = critical
3. FinAPI: GET /api/v2/users (minimal) → 401 = finapi_auth, 503 = finapi_unavailable
4. Coin-Solvenz:
   sum(member_coin_ledger.eur_reserve) vs sum(coin_reserve_accounts.balance)
   Abweichung > 0.01€ → EXISTENTIAL → sofort alle Vorstandsmitglieder benachrichtigen
5. Backup-Aktualität: max(backup_logs.created_at) älter als 26h → critical
6. Überfällige Cron-Jobs: last_run > 1.5×interval = warning, > 2×interval = critical
7. Stuck Timers: member_time_entries.status = 'running' älter als 12h → warning

ALARM-MATRIX:
  warning:     In guardian_logs eintragen
  critical:    Log + Admin-Email via Brevo
  existential: Log + Email an ALLE Vorstandsmitglieder + SMS wenn konfiguriert

GUARDIAN-PRINZIPIEN (NIEMALS brechen):
  - Nie automatisch reparieren ohne error_class zu kennen
  - Unbekannte Fehler: nur eskalieren
  - Bypässe NIE automatisch deaktivieren — immer manuell
  - Jede Aktion in guardian_logs

DASHBOARD (src/pages/admin/GuardianDashboard.tsx):
  - Live-Status aller Prüfungen (Realtime-Subscription)
  - Letzte 50 Logs
  - Aktive Bypässe mit Deaktivierungs-Button
  - Root-Cause Reports
  - Manual-Trigger Button für einzelne Prüfungen

Zeige Dry-Run mit Dateistruktur bevor du schreibst.
```

---

## 0.3 Guardian Repair & Bypass

```
Du bist in ~/btb-app/.
Erstelle guardian-repair und guardian-bypass als Edge Functions.

GUARDIAN-REPAIR (supabase/functions/guardian-repair/index.ts):
  Input: { error_class, context }
  
  Fehlerklassen:
    stuck_cron:       Function Dry-Run → echten Lauf starten
    finapi_auth:      Token aus Vault erneuern, testen
    abandoned_timer:  Status → 'abandoned', Mitglied informieren
    negative_stock:   current_stock = 0, Korrektur-Bewegung eintragen
    db_lock_timeout:  pg_stat_activity → idle-in-transaction nach 30min beenden
                      NIE aktive Writes abbrechen!
  
  Nach Reparatur: Root-Cause-Check (30 Tage Wiederholung?)
  Bei Wiederholung: guardian_root_cause_reports + Admin-Email

GUARDIAN-BYPASS (supabase/functions/guardian-bypass/index.ts):
  Zwei parallele Threads bei Aktivierung:
    Thread 1: Betrieb läuft durch Bypass (Mitglieder merken nichts)
    Thread 2: guardian-repair versucht weiter zu reparieren

  Bypass 'finapi_payment':
    1. Pending Zahlungen identifizieren
    2. PDF-Zahlungsaufträge generieren (scripts/bypass/generate_payment_orders.py)
       Inhalt: Empfänger, IBAN, Betrag, Verwendungszweck, Referenz-ID
    3. Email an Admin + Vorstand mit PDFs + Anleitung
    4. active_bypasses Eintrag, betroffene Requests: status='bypass_pending'
    5. FinAPI-Verbindungstest alle 2min (erhöhte Frequenz)

  Bypass 'edge_function_unavailable':
    1. Python-Bypass-Script generieren (gleiche Logik, Service-Role-Key direkt)
    2. README mit Ausführungsanleitung
    3. In scripts/bypass/[function_name].py ablegen

  Bypass 'email_service_down':
    Zeitkritisch (payment|emergency|gv): Fallback-SMTP oder Signal-Webhook
    Rest: email_queue → nachsenden wenn Brevo verfügbar

  DEAKTIVIERUNG (immer manuell!):
    1. Reconciliation-Report (was wurde während Bypass manuell getan?)
    2. Admin bestätigt jeden Punkt
    3. active_bypasses.deactivated_at setzen

GUARDIAN-CLI (scripts/btb-guardian-cli.js):
  Commands: status | repair --class X | bypass list | bypass activate/deactivate |
            queue list | queue flush --type payment | logs --last 24h | unlock --entry-id X
  Auth: ~/.btb/credentials.json (service_role_key, verschlüsselt)
  Alle CLI-Aktionen in guardian_logs mit source='cli'
```

---

## 0.4 Staging Release Manager

```
Du bist in ~/btb-app/.
Erstelle den Staging-Freigabe-Agenten. Kein Agent geht live ohne diese Freigabe.

DATEI: supabase/functions/staging-manager/index.ts
TABELLEN:
  staging_releases: id, agent_name, version, staged_at, tests_passed JSONB,
                    approved_at, approved_by, deployed_at, rollback_at
  staging_tests:    id, release_id, test_name, status, output, executed_at

STAGING-PIPELINE für jeden neuen Agenten:
  1. Deploy in Staging-Supabase-Branch
  2. Dry-Run ausführen (kein echter DB-Write)
  3. Smoke-Tests: kann sich die Function starten? Gibt sie valides JSON zurück?
  4. Integration-Test: schreibt sie in richtige Tabellen?
  5. Solvenz-Check: bleibt Invariante erhalten nach Test-Transaktion?
  6. Guardian-Registrierung: ist sie in automation_registry?
  7. Rollback-Test: kann sie sauber disabled werden?

Nur wenn alle 7 Checks grün: Admin-Email "Freigabe bereit für [agent]"
Admin klickt Approve → Deploy in Produktion.
Bei einem roten Check: automatisch zu guardian-repair eskalieren.
```

---

# MODUL 1 — KERN-WIRTSCHAFT

## 1.1 Pool-Monatsabschluss

```
Du bist in ~/btb-app/.
Erstelle den monatlichen Pool-Abschluss-Agenten.

DATEI: supabase/functions/monthly-pool-close/index.ts
CRON: Letzter Bankarbeitstag des Monats, 22:00 Europe/Berlin
NUTZE: TemporalContext (temporal.ts)

ABLAUF:
  1. Alle offenen Zeiterfassungen prüfen (status='running') → warnen wenn vorhanden
  2. Gesamte Pool-Einnahmen des Monats summieren
  3. Aufteilung berechnen:
     - 1/3 Mitglieder-Auszahlung (nach BtB-Coin-Anteilen)
     - 1/3 Reinvestition (Fixkosten, Equipment, Software)
     - 1/3 Reserve/Rücklage
  4. Fixkosten der eG abziehen (~700€/Monat in Gründungsphase)
  5. pool_monthly_closes Eintrag erstellen
  6. Coin-Payout-Agenten triggern (nach Bestätigung)
  7. Email an Vorstand: Abschluss-Report

TABELLEN:
  pool_monthly_closes: id, fiscal_month, total_income, member_share,
                       reinvestment_share, reserve_share, fixed_costs,
                       status (draft|confirmed|paid), created_at, confirmed_at

SICHERHEIT:
  - Nur draft erstellen, nie auto-bestätigen
  - Admin bestätigt → dann Coin-Payout triggern
  - Solvenz-Check vor UND nach Abschluss

FEHLER: Wenn Pool-Daten unvollständig → guardian-core eskalieren, nicht raten.
```

## 1.2 Coin-Auszahlung

```
Du bist in ~/btb-app/.
Erstelle den Coin-Auszahlungs-Agenten.

DATEI: supabase/functions/coin-payout/index.ts
TRIGGER: Nach Admin-Bestätigung des Pool-Abschlusses

COIN-TYPEN:
  Zeit-Tausch: Rücklage (EUR) wandert mit Coins. Anspruch erhalten.
  Waren-EK:    Rücklage sinkt um tatsächliche €-Kosten. Kein Anspruch mehr.

AUSZAHLUNG-ABLAUF:
  1. Monatlichen Beitrag jedes Mitglieds berechnen (Zeit × BtB-Stundensatz)
  2. Coin-Anteil am Pool-Mitglieder-Drittel berechnen
  3. member_coin_ledger updaten (TRANSAKTION!)
  4. coin_reserve_accounts updaten (Solvenz-Invariante sicherstellen!)
  5. Jedes Update in universe_btb_coin_ledger loggen
  6. Nach allen Updates: Solvenz-Check
  7. Bei Abweichung > 0.01€: ROLLBACK + EXISTENTIAL-Alarm

SOLVENZ-INVARIANTE (in jeder Transaktion):
  BEGIN TRANSACTION;
  UPDATE member_coin_ledger...;
  UPDATE coin_reserve_accounts...;
  -- Prüfung:
  SELECT sum(eur_reserve) FROM member_coin_ledger;
  SELECT sum(balance) FROM coin_reserve_accounts;
  -- Wenn nicht gleich: ROLLBACK + ALARM
  COMMIT;

COIN-SPENDE (separater Endpoint):
  POST /coin-payout/donate { member_id, coin_amount }
  Mitglied gibt €-Anspruch freiwillig zurück → Pool-Rücklage steigt
  Coins bleiben beim Mitglied (nur Anspruch weg)
  Formeller Akt: requires double-confirm
```

## 1.3 Solidarfonds-Manager

```
Du bist in ~/btb-app/.
Erstelle den Solidarfonds-Agenten.

ZWECK: Absicherung bei Elternzeit, Krankheit, Kapazitätsreduzierung.

ELTERNZEIT-STAFFEL:
  Phase 1 (erste 3 Monate):  60% des normalen Coin-Anteils
  Phase 2 (Monate 4-6):      40%
  Phase 3 (Monate 7-12):     20%
  Sekundäre Bezugsperson:    max. 50%, max. 3 Monate

CHRONISCHE ERKRANKUNG:
  Kapazitätstage: bis 5 Tage/Monat ohne Coin-Abzug

DATEI: supabase/functions/solidarity-manager/index.ts
TABELLEN:
  solidarity_cases: id, member_id, case_type (elternzeit|erkrankung|kapazitaet),
                    phase, reduction_factor, start_date, end_date,
                    approved_by, approved_at, notes
  solidarity_payments: id, case_id, fiscal_month, calculated_amount,
                       actual_amount, difference_from_solidarity_fund

ABLAUF:
  Monatlich (nach pool-close): Aktive Fälle prüfen
  Differenz zwischen Normal-Anteil und Solidar-Anteil aus Solidarfonds decken
  Bei Fonds-Erschöpfung: GV informieren (kein automatisches Handeln)
```

---

# MODUL 2 — MITGLIEDER

## 2.1 Mitglieder-Onboarding

```
Du bist in ~/btb-app/.
Erstelle die vollständige Onboarding-Kette für neue Mitglieder.

DATEI: supabase/functions/member-onboarding/index.ts

ONBOARDING-SCHRITTE (in Reihenfolge, mit Timeouts):
  1. Willkommens-Email (Brevo, Template 'btb-welcome') → sofort
  2. Satzung-Übersendung + Bestätigung-Request → Tag 1
  3. Erstes Gespräch mit Paten-Mitglied planen → Tag 2 (Kalender-Integration)
  4. App-Zugang aktivieren (role='member') → nach Satzung-Bestätigung
  5. Berufsmodul-Auswahl anfragen → Tag 3
  6. Erstes Zeiterfassungs-Tutorial → Tag 5
  7. Erste Coin-Wallet-Erklärung → Tag 7
  8. 30-Tage-Check-in → Tag 30

MEMBER-STATUS-ENUM: invited|satzung_pending|active|inactive|ausgetreten

MEMBER-TYPEN:
  Vollmitglied (eG):      Stimmrecht, Coin-Wallet, Poolbeteiligung
  Fördermitglied (e.V.):  kein Stimmrecht, 10% Rabatt ab 50€/Jahr Beitrag
  Gastmitglied:           begrenzte App-Features

TABELLEN:
  onboarding_sequences: id, member_id, step_name, scheduled_at,
                        completed_at, reminder_count, status
  member_profiles:      id, member_id, berufsmodul, skills[], availability,
                        pate_member_id, onboarding_completed_at

FEHLER: Wenn Schritt 7 Tage überfällig → Paten-Mitglied + Admin benachrichtigen.
Nicht eskalieren — sanft erinnern.
```

## 2.2 Abstimmungssystem

```
Du bist in ~/btb-app/.
Erstelle das Abstimmungssystem für die Generalversammlung.

ENTSCHEIDUNGSTYPEN:
  Standard:                 einfache Mehrheit (>50%)
  Satzungsänderung:         75% Mehrheit
  Aufbauphase-Ausnahmen:    70% Mehrheit (§13 — Stundensatz < 20€)
  Konsequenzsystem Stufe 7: 70% Mehrheit GV
  Ausschluss eines Mitglieds: 75% Mehrheit

DATEI: supabase/functions/abstimmung-manager/index.ts
SEITE: src/pages/community/Abstimmung.tsx

TABELLEN:
  votes: id, title, description, vote_type, required_majority,
         voting_period_start, voting_period_end, status,
         created_by, cell_id (NULL = alle Zellen)
  vote_ballots: id, vote_id, member_id, choice (yes|no|abstain),
                voted_at, is_anonymous
  vote_results: id, vote_id, yes_count, no_count, abstain_count,
                total_eligible, majority_required, result (passed|failed|invalid)

SICHERHEIT:
  - Jedes Mitglied nur eine Stimme
  - Anonyme Abstimmung möglich (ballot.member_id = NULL, nur count zählen)
  - Ergebnis erst nach Ablauf sichtbar (nicht während laufender Abstimmung)
  - Manipulations-Log: jede Änderung nach Stimmabgabe als CRITICAL

FRONTEND:
  Aktive Abstimmungen prominent anzeigen
  Ergebnis-Chart nach Ablauf
  Historische Abstimmungen archivieren
```

---

# MODUL 3 — ZEITERFASSUNG & BERUFE

## 3.1 Zeiterfassungs-Validator

```
Du bist in ~/btb-app/.
Erstelle den Zeiterfassungs-Validator.

DATEI: supabase/functions/time-validator/index.ts
CRON: Täglich 02:00 Europe/Berlin

PRÜFUNGEN:
  1. Offene Einträge (status='running') älter als 12h → Mitglied warnen
  2. Offene Einträge älter als 24h → status='abandoned', Guardian informieren
  3. Tagesgesamtstunden > 16h pro Mitglied → Warning-Flag
  4. Rückwirkende Einträge > 7 Tage alt → Admin-Genehmigung required
  5. Überschneidungen: zwei running-Einträge gleichzeitig → Fehler

TABELLEN:
  member_time_entries: id, member_id, berufsmodul, activity_type,
                       started_at, stopped_at, duration_minutes,
                       status (running|completed|abandoned|corrected),
                       coins_earned, eur_value, notes, correction_of

TIMER-WIDGET (src/components/TimerWidget.tsx):
  Start/Stop Button prominent
  Laufende Zeit anzeigen (live)
  Aktivitäts-Kategorien wählbar (nach Berufsmodul)
  Mobile-first (Touch-friendly, min. 48px)
  Offline-Support: LocalStorage-Fallback wenn kein Netz

COIN-BERECHNUNG nach Stop:
  duration_minutes ÷ 60 × aktueller_btb_stundensatz = coins_earned
  eur_value = coins_earned × historischer_eur_wert
```

---

# MODUL 4 — LAGER & LOGISTIK

## 4.1 Inventory Monitor

```
Du bist in ~/btb-app/.
Erstelle den Lager-Überwachungs-Agenten.

DATEI: supabase/functions/inventory-monitor/index.ts
CRON: Täglich 07:00 Europe/Berlin

PRÜFUNGEN:
  1. Artikel unter Mindestbestand → Nachbestell-Vorschlag erstellen
  2. Artikel abgelaufen (MHD) → Hofladen-Admin benachrichtigen
  3. Negative Bestände → guardian-repair 'negative_stock' triggern
  4. Monatsvergleich: Verbrauch vs Vormonat > 50% Abweichung → Admin

TABELLEN:
  inventory_items: id, name, category, unit, current_stock,
                   min_stock, max_stock, mhd, location, supplier_id,
                   last_reorder_at, cost_per_unit, coin_price
  inventory_movements: id, item_id, movement_type (in|out|correction|waste),
                       quantity, before_stock, after_stock,
                       reference_type, reference_id, notes, created_by, created_at
  reorder_suggestions: id, item_id, suggested_quantity, urgency,
                       status (pending|ordered|cancelled), created_at

WAREN-EK-INTEGRATION:
  Wenn Mitglied Lagerartikel nimmt: automatisch Waren-EK-Transaktion erstellen
  Coin-Abzug = coin_price des Artikels
  EUR-Rücklage sinkt um cost_per_unit (tatsächliche Kosten)
```

## 4.2 Sammelbestellungs-Koordinator

```
Du bist in ~/btb-app/.
Erstelle den Sammelbestellungs-Koordinator.

KONZEPT: Mitglieder bündeln Einkäufe → Mengenrabatt → Ergebnis geteilt.
Partner mit Seed-Daten: Shiftphone, Fairphone.

DATEI: supabase/functions/group-order-coordinator/index.ts
SEITE: src/pages/community/Sammelbestellungen.tsx

MENGENRABATT-SCHWELLEN (konfigurierbar pro Partner):
  z.B. Shiftphone: 5 Einheiten = 5%, 10 = 10%, 20 = 15%

TABELLEN:
  group_orders: id, title, partner_id, deadline, status,
                min_quantity, current_quantity, discount_percentage,
                coordinator_member_id
  group_order_items: id, order_id, member_id, quantity, unit_price,
                     total_price, coin_payment, eur_payment, status
  partners: id, name, category, discount_tiers JSONB, contact, website,
            is_verified, seed_data (true für Shiftphone/Fairphone)

ABLAUF:
  1. Mitglied erstellt Sammelbestellung mit Deadline
  2. Andere Mitglieder treten bei (Coin oder EUR Zahlung)
  3. Wenn Schwelle erreicht: Koordinator benachrichtigen, Bestellung bestätigen
  4. Nach Lieferung: inventory_movements eintragen, Coins/EUR abbuchen
  5. Bei Nicht-Erreichen der Mindestschwelle: stornieren, refunden
```

---

# MODUL 5 — BUCHHALTUNG

## 5.1 Zahlungseingangs-Matcher

```
Du bist in ~/btb-app/.
Erstelle den Zahlungseingangs-Matcher (FinAPI-Integration).

DATEI: supabase/functions/payment-matcher/index.ts
CRON: Täglich 08:00 und 18:00

ABLAUF:
  1. FinAPI: neue Kontobewegungen abrufen
  2. Für jede Zahlung: Matching-Algorithmus
     a. Exakter Betrag + Verwendungszweck → automatisch zuordnen
     b. Exakter Betrag, ähnlicher Verwendungszweck → Vorschlag (Admin bestätigt)
     c. Kein Match → unmatched_payments, Admin informieren
  3. Nach Zuordnung: Coin-/Pool-Logik aktualisieren
  4. Monatliche Differenz-Prüfung: FinAPI-Kontostand vs interne Buchhaltung

TABELLEN:
  bank_transactions: id, finapi_id, amount, currency, booking_date,
                     purpose, iban, matched_to_type, matched_to_id,
                     match_confidence, status (unmatched|matched|manual)
  unmatched_payments: id, transaction_id, admin_notified_at, resolved_at, notes

BYPASS bei FinAPI-Ausfall:
  CSV-Export-Format bereitstellen für manuelle Buchung
  PDF-Zahlungsaufträge generieren
  Guardian-Bypass 'finapi_payment' aktivieren
```

## 5.2 Mahnwesen

```
Du bist in ~/btb-app/.
Erstelle das automatische Mahnwesen für offene Fördermitglied-Beiträge.

DATEI: supabase/functions/dunning-manager/index.ts
CRON: Jeden 1. des Monats

STUFEN:
  Stufe 1 (7 Tage überfällig):  freundliche Erinnerung (Email)
  Stufe 2 (21 Tage):            zweite Erinnerung + Hinweis
  Stufe 3 (42 Tage):            formelle Mahnung (Brevo Template 'btb-mahnung')
  Stufe 4 (90 Tage):            Weiterleitung an Vorstand (kein Auto-Ausschluss!)

Ton: immer freundlich, nicht drohend. BtB-Werte.
Kein automatischer Ausschluss — immer Vorstand.

TABELLEN:
  member_dues: id, member_id, fiscal_year, amount_due, amount_paid,
               due_date, paid_at, status
  dunning_log: id, due_id, level, sent_at, template_id, response
```

---

# MODUL 6 — WISSEN & COMMUNITY

## 6.1 Wissensdatenbank

```
Du bist in ~/btb-app/.
Erstelle die Wissensdatenbank (Rezeptur-Karten, Anleitungen, Community-Erfahrungen).

DATEI: supabase/functions/knowledge-base/index.ts
SEITE: src/pages/community/Wissen.tsx

INHALT:
  - Rezeptur-Karten (mit Zutaten-Skalierung auf Personenanzahl)
  - Handwerk-Anleitungen
  - Spar-Tracking (was haben wir durch eigene Produktion gespart?)
  - Community-Erfahrungen (Erfahrungsberichte von Mitgliedern)
  - Modul-Dokumentation (je Berufsmodul)

TABELLEN:
  knowledge_articles: id, title, category, content (Markdown),
                      author_id, tags[], is_public, language DEFAULT 'de',
                      view_count, helpful_count, created_at, updated_at
  recipes: id, article_id, base_servings, ingredients JSONB, steps JSONB
  savings_tracking: id, item_name, bought_externally_eur, produced_internally_coins,
                    cost_internally_eur, savings_eur, fiscal_month

VOLLTEXTSUCHE auf Deutsch:
  PostgreSQL full-text search mit 'german' dictionary
  to_tsvector('german', title || ' ' || content)
  Suchindex auf knowledge_articles

ÖFFENTLICHE ROUTE:
  /wissen/[article-id] ohne Login erreichbar (für Interessenten)
```

## 6.2 Chronicle Recorder

```
Du bist in ~/btb-app/.
Erstelle den automatischen Chronik-Recorder.

DATEI: supabase/functions/chronicle-recorder/index.ts
SEITE: src/pages/community/Chronicle.tsx (öffentliche Route)

AUTO-EINTRÄGE (automatisch ohne Admin-Freigabe):
  - Neues Mitglied aufgenommen
  - Monatlicher Pool-Abschluss (Zusammenfassung, keine Beträge)
  - Neue Zelle gegründet
  - Wichtige Abstimmung abgeschlossen
  - Jahrestag der Gründung

MANUELLE EINTRÄGE:
  POST /chronicle-recorder/submit { title, content, is_public, category }
  Manuelle Einträge: Admin-Freigabe required
  Admin-Email bei neuen pending Einträgen

TABELLEN:
  chronicle_entries: id, title, content (Markdown), category,
                     is_public, is_auto, approved_by, approved_at,
                     entry_date, created_at

FRONTEND:
  Zeitstrahl-Ansicht (CSS timeline)
  Filter: category, is_public
  Ohne Login: nur is_public sichtbar
  Für Website einbettbar (öffentliche API: GET /chronicle-recorder/public)
```

---

# MODUL 7 — BERUFSMODULE

## META-PROMPT: Berufsmodul-Generator

```
Du bist in ~/btb-app/.
Erstelle ein vollständiges Berufsmodul für [BERUFSNAME].

Das Berufsmodul besteht aus:
1. Supabase-Tabellen (berufsspezifische Daten)
2. Edge Functions (Agenten für diesen Beruf)
3. React-Seiten in src/pages/berufe/[beruf]/
4. Guardian-Erweiterung (neue Prüfungen für diesen Beruf)
5. Automations-Agenten (berufsspezifisch)

GRUNDSTRUKTUR (für jeden Beruf):
  Tabellen:
    [beruf]_clients:     id, member_id (Behandler), client_name, notes, created_at
    [beruf]_sessions:    id, client_id, date, duration_min, notes, coin_charged
    [beruf]_documents:   id, session_id, doc_type, file_url, created_at
  
  Seiten:
    src/pages/berufe/[beruf]/Dashboard.tsx   -- Übersicht
    src/pages/berufe/[beruf]/Klienten.tsx    -- Klientenverwaltung
    src/pages/berufe/[beruf]/Sessions.tsx    -- Sitzungen/Termine
  
  Automatisierung:
    supabase/functions/[beruf]-reminder/     -- Termin-Erinnerungen
    supabase/functions/[beruf]-report/       -- Monatsbericht

MODULSPEZIFISCHES für [BERUFSNAME]:
[hier werden berufsspezifische Anforderungen eingefügt]
```

### Bekannte Berufsmodule (15 geplant)

| # | Beruf | Status | Besonderheit |
|---|---|---|---|
| 1 | Körperarbeit | geplant | Behandlungspläne, Klientenkartei |
| 2 | Handwerk | geplant | Zulassungen, Meisterpflicht |
| 3 | Hofladen | geplant | Lager, Lieferanten, MHD |
| 4 | IT/Software | geplant | Repo-Tracking, Deployment |
| 5 | Ernährungsberatung | geplant | Ernährungspläne, Rezepte |
| 6 | Coaching | geplant | Ziele, Fortschrittstracking |
| 7 | Musik | geplant | Unterrichtsstunden, Notenmaterial |
| 8 | Kunst | geplant | Werkverzeichnis, Ausstellungen |
| 9 | Pädagogik | geplant | Schülerdaten, Lernfortschritt |
| 10 | Rechtsberatung | geplant | Mandaten, Fristen |
| 11 | Steuern | geplant | Jahresabschluss-Unterstützung |
| 12 | Reinigung | geplant | Objekte, Turnus-Planung |
| 13 | Transport | geplant | Fahrzeuge, Routen, Logbuch |
| 14 | Garten/Landwirtschaft | geplant | Aussaat-Kalender, Ernte |
| 15 | Medizin/Heilpraktik | geplant | Patientendaten (DSGVO!) |

---

# MODUL 8 — WEBSITE & ÖFFENTLICHKEIT

## 8.1 Website-Status-Widget

```
Du bist in ~/btb-app/.
Erstelle das öffentliche Status-Widget für die BtB-Website.

ZWECK: Transparenz nach außen. Interessenten sehen aktuellen Stand.

DATEI: supabase/functions/public-status/index.ts (PUBLIC, kein Auth)
SEITE: src/pages/public/Status.tsx (einbettbar als Widget)

ANZUZEIGENDE FELDER:
  - Gründungsstatus (Förderverein: [Datum|ausstehend], eG: [Datum|ausstehend])
  - Mitgliederanzahl (nur Vollmitglieder, anonymisiert)
  - Spendenstand (aktuell € von Ziel €, nur wenn Förderverein eingetragen)
  - Erste Zelle: operational? (ja/nein + seit wann)
  - App-Status: Beta | MVP | Produktiv

DESIGN: BtB-Farben, minimalistisch, mobile-first.
Einbettbar via <iframe> oder Web Component.

SICHERHEIT:
  Nur aggregierte, nicht-personenbezogene Daten
  Rate-Limiting: 100 Requests/Minute pro IP
  Kein Cache-Bypass möglich
```

---

# SUPER-PROMPT — ALLES AUF EINMAL

```
Du bist in ~/btb-app/. Lies zuerst die gesamte bestehende Codebase.
Dann implementiere in dieser Reihenfolge:

PHASE 1 — FUNDAMENT (nichts anderes ohne diese Basis):
  1. temporal.ts + Tests
  2. guardian-core + Dashboard
  3. guardian-repair + bypass
  4. staging-manager

PHASE 2 — WIRTSCHAFT:
  5. monthly-pool-close
  6. coin-payout (mit Solvenz-Invariante!)
  7. solidarity-manager

PHASE 3 — MITGLIEDER:
  8. member-onboarding
  9. abstimmung-manager
  10. time-validator + TimerWidget

PHASE 4 — OPERATIONS:
  11. inventory-monitor
  12. group-order-coordinator
  13. payment-matcher
  14. dunning-manager

PHASE 5 — COMMUNITY:
  15. knowledge-base + Volltextsuche
  16. chronicle-recorder (öffentliche Route!)

PHASE 6 — ÖFFENTLICHKEIT:
  17. public-status Widget

REGELN:
  - Vor jeder Phase: git commit
  - Kein Agent live ohne staging-manager-Freigabe
  - Solvenz-Invariante in jeder Coin-Transaktion
  - Guardian-Bypass NIE automatisch deaktivieren
  - Zeige Dry-Run-Struktur bevor du schreibst
  - Frage nach wenn unklar — implementiere nie auf Verdacht
```

---

## VERWENDUNGS-REIHENFOLGE

```bash
# SESSION STARTEN:
cd ~/btb-app
git add -A && git commit -m "checkpoint: Session [Datum]"
claude

# PHASE 1 (immer zuerst):
# → Prompt 0.1 (temporal.ts) einfügen

# DANACH IN REIHENFOLGE:
# → Prompt 0.2 (guardian-core)
# → Prompt 0.3 (guardian-repair/bypass)
# → usw.

# PARALLEL MIT CURSOR:
# Claude Code → supabase/functions/, scripts/
# Cursor     → src/pages/, src/components/
# NIE gleichzeitig AppSidebar.tsx!

# NACH JEDEM AGENTEN:
# Dry-Run prüfen → Logs checken → staging-manager → live
```

---

*Back to Balance eG — Genossenschaftlich. Ökologisch. Sinnmaximiert.*
*Stand: April 2026 | Stack: React/Vite + TypeScript + Supabase + FinAPI*
