# Back to Balance — Alle Agenten-Prompts für Claude Code
**Vollständige Sammlung aller Automatisierungs-Agenten als copy-paste Prompts**

> `claude` im Terminal öffnen → Prompt reinkopieren → ausführen
> Vor jeder Session: `git add -A && git commit -m "checkpoint"`
> Stack: React/Vite + TypeScript + Supabase (xcngmshjuqoucdlgikao) + FinAPI

---

## GRUNDREGELN FÜR ALLE AGENTEN

Diese Regeln gelten für jeden Agenten den Claude Code baut.
Wenn du einen Prompt unten verwendest, sind diese Regeln implizit enthalten.

```
GRUNDREGELN — immer gültig:

1. ZEITGEFÜHL: Importiere createTemporalContext aus supabase/functions/_shared/temporal.ts
   Rufe new Date() NUR einmalig im createTemporalContext-Aufruf auf.
   Reiche ctx.now durch alle Subfunktionen durch.

2. ABSCHALTBAR: Prüfe zu Beginn jeder Funktion:
   const enabled = await getSetting('agent_[name]_enabled');
   if (!enabled) return { status: 'disabled', message: 'Agent ist deaktiviert' };

3. DRY-RUN: Jeder Agent akzeptiert ?dry_run=true als Query-Parameter.
   Im Dry-Run: alles berechnen, nichts schreiben, Ergebnis zurückgeben.

4. HEALTH-ENDPUNKT: Jede Edge Function hat GET /health → { status: 'ok', last_run, version }

5. LOGGING: Jeden Lauf in automation_logs schreiben:
   agent_name, session_id, started_at, finished_at, status, records_processed,
   errors (JSONB), dry_run (boolean), triggered_by ('cron'|'manual'|'webhook')

6. GUARDIAN-REGISTRIERUNG: Beim ersten Start in automation_registry eintragen:
   name, description, schedule, enabled=true, last_run, next_run

7. FEHLERBEHANDLUNG: try/catch um jeden externen Aufruf.
   Fehler nie still schlucken — immer in automation_logs schreiben.
   Bei kritischen Fehlern: E-Mail an Admin via Brevo.
```

---

# BLOCK 1 — KERN-WIRTSCHAFT (Pool, Coins, Vergütung)

---

## AGENT: monthly-pool-close

```
Du bist in meinem Supabase-Projekt (xcngmshjuqoucdlgikao). Projekt liegt unter ~/btb-app/.

Erstelle die Edge Function supabase/functions/monthly-pool-close/index.ts

Diese Funktion schließt den monatlichen Pool ab. Sie ist der kritischste Prozess im System.
Befolge alle GRUNDREGELN (Zeitgefühl, Abschaltbar, Dry-Run, Health, Logging, Guardian-Reg.).

ABLAUF (in dieser Reihenfolge, jeder Schritt in eigener Transaktion):

Schritt 1 — Zeitkontext herstellen:
  const ctx = createTemporalContext('monthly-pool-close');
  Prüfen: Wurde dieser Monat (ctx.fiscalMonth) bereits abgeschlossen?
  Wenn ja: { status: 'already_closed', month: ctx.fiscalMonth } zurückgeben, ABBRUCH.
  Idempotenz ist kritisch — dieser Schritt darf nie zweimal laufen.

Schritt 2 — Einnahmen aggregieren:
  Alle invoices der Periode mit status='paid' und period=fiscalMonth summieren.
  Alle universe_time_entries der Periode mit status='billed' nach cell_id aggregieren.
  Materialkosten-Abzug anwenden: Brutto × (1 - material_cost_deduction_pct / 100)
  Ergebnis: net_pool_eur pro Zelle und gesamt.

Schritt 3 — Dritteilung berechnen:
  Werte aus universe_settings lesen (nie hardcodieren):
  pool_share_vergütung_pct, pool_share_reinvestition_pct, pool_share_sozial_pct
  
  Sonderfall Aufbauphase: wenn aufbauphase_active = true in universe_settings:
  Reinvestition und Sozial werden zusammengelegt, erst nach Wendepunkt getrennt.
  
  Solidarfonds-Anteil: 10% des Sozial-Drittels auf solidarity_fund_balance buchen.

Schritt 4 — Coin-Zuteilung pro Mitglied:
  Für jedes Mitglied: abgerechnete Stunden × aktueller Coin-Stundensatz
  = neue Coins für diesen Monat.
  Coin-Rücklage = Coins × coin_to_eur_rate.
  Schreiben in member_coin_ledger: type='vergütung', period=fiscalMonth, amount, eur_reserve.

Schritt 5 — Pool-Periode abschließen:
  Eintrag in pool_periods: alle Zahlen, status='closed', closed_at=ctx.now, session_id.
  
Schritt 6 — Coin-Wert aktualisieren:
  Neuen coin_to_eur_rate berechnen: vergütungspool / gesamt_abgerechnete_stunden.
  In universe_settings und coin_value_history schreiben.

Schritt 7 — Benachrichtigungen:
  E-Mail an alle Vorstandsmitglieder: Pool-Zusammenfassung mit allen Zahlen.
  Chronicle-Eintrag: "Pool [Monat] abgeschlossen — [Betrag] verteilt an [N] Mitglieder."

Richte pg_cron ein: letzter Tag jedes Monats um 23:00 Uhr Europe/Berlin.
Erstelle auch manuelle Trigger-Route: POST /monthly-pool-close/trigger (nur Admin-Rolle).
```

---

## AGENT: coin-payout

```
Du bist in ~/btb-app/. Erstelle supabase/functions/coin-payout/index.ts

Dieser Agent zahlt Coins als Euro aus wenn Mitglieder das beantragen.
Befolge alle GRUNDREGELN.

ABLAUF:

Trigger: Mitglied beantragt Auszahlung (payout_requests Tabelle, status='pending').
Oder: manuelle Auslösung per Admin.

Für jeden pending payout_request:

1. Idempotenz-Check:
   Hat dieser request bereits eine finapi_payment_id? Wenn ja: überspringen.
   Ist status bereits 'processing'? Wenn ja: überspringen (anderer Lauf läuft).
   Status auf 'processing' setzen + processing_started_at = ctx.now.

2. Deckungsprüfung:
   member_coin_ledger: Hat das Mitglied genug EUR-Rücklage für den Auszahlungsbetrag?
   Wenn nicht: status='insufficient_funds', Mitglied per E-Mail informieren, weiter.

3. FinAPI-Zahlung auslösen:
   IBAN aus universe_members lesen.
   FinAPI PIS: SEPA-Überweisung mit Verwendungszweck "BtB Coins [Mitgliedsnummer] [Monat]"
   Bei Erfolg: finapi_payment_id speichern, status='submitted'.
   Bei FinAPI-Fehler: status='finapi_error', error_message speichern.
   → Guardian-bekannte Fehlerklasse 'finapi_unavailable' auslösen wenn 503/timeout.

4. Coin-Rücklage reduzieren:
   Nur nach erfolgreicher FinAPI-Bestätigung (nicht schon bei Einreichung).
   member_coin_ledger: eur_reserve -= ausgezahlter Betrag.

5. Bestätigung:
   E-Mail an Mitglied: Betrag, IBAN, Referenznummer, voraussichtliche Gutschrift.
   Eintrag in coin_transactions: type='auszahlung'.

Cron: täglich 10:00 Uhr (alle pending requests abarbeiten).
Manueller Trigger: POST /coin-payout/trigger?member_id=X (Admin).
```

---

## AGENT: coin-value-calculator

```
Du bist in ~/btb-app/. Erstelle supabase/functions/coin-value-calculator/index.ts

Dieser Agent berechnet täglich den aktuellen Coin-Wert und speichert die Historie.
Befolge alle GRUNDREGELN.

FORMEL:
coin_eur_value = sum(pool_periods.vergütungsanteil_eur der letzten 3 Monate) 
                 / sum(universe_time_entries.duration_hours der letzten 3 Monate, nur billed=true)
                 
Gleitender 3-Monats-Durchschnitt (nicht nur letzter Monat) für Stabilität.
Wenn weniger als 3 Monate Daten: verfügbare Monate nehmen, Hinweis in Metadaten.

ABLAUF:
1. Daten aggregieren (letzte 3 abgeschlossene pool_periods).
2. Neuen coin_eur_value berechnen.
3. Vergleich mit aktuellem Wert in universe_settings:
   Veränderung > 5%: Alle Mitglieder per E-Mail informieren.
   Veränderung > 15%: Zusätzlich Chronicle-Eintrag.
4. In coin_value_history eintragen: date, coin_eur_value, total_hours, total_pool_eur, member_count.
5. universe_settings: coin_to_eur_rate aktualisieren.

Cron: täglich 01:00 Uhr.
```

---

## AGENT: solidarity-fund-processor

```
Du bist in ~/btb-app/. Erstelle supabase/functions/solidarity-fund-processor/index.ts

Dieser Agent verwaltet den Solidarfonds — Anträge prüfen, bewilligen, auszahlen.
Befolge alle GRUNDREGELN. Dieser Agent hat erhöhte Logging-Anforderungen (jede Entscheidung dokumentieren).

TABELLEN die vorher erstellt werden müssen (Migration schreiben):
solidarity_requests: id, member_id, request_type, amount_requested_eur, reason_text,
  status (eingereicht|auto_approved|vorstand_required|approved|rejected|paid),
  requested_at, reviewed_at, reviewed_by, paid_at, notes
solidarity_fund_balance: id, balance_eur, last_updated, last_transaction_id

AUTOMATISCHE VORPRÜFUNG bei neuem Antrag:
  Mitglied seit >= 6 Monaten dabei? (aus universe_members.joined_at)
  Kein anderer offener Antrag desselben Mitglieds?
  Fonds-Guthaben > angeforderter Betrag?
  Angefordeter Betrag <= solidarity_fund_lower_threshold (aus universe_settings)?

Bei ALLEN Bedingungen erfüllt UND type != 'notfall':
  → status='auto_approved', sofortige FinAPI-Zahlung auslösen.
  → E-Mail an Mitglied: "Antrag bewilligt und überwiesen."
  → Vorstand informieren (nicht um Erlaubnis bitten, nur informieren).

Bei EINER nicht erfüllten Bedingung ODER type='notfall' ODER Betrag > lower_threshold:
  → status='vorstand_required'.
  → E-Mail an alle Vorstandsmitglieder mit Link zum Genehmigungsbutton.
  → Bei type='notfall': zusätzlich Signal-Webhook an Admin.

Nach Vorstand-Genehmigung (Webhook von Frontend):
  → FinAPI-Zahlung auslösen.
  → Chronicle-Eintrag (anonymisiert: "Solidarfonds-Unterstützung gewährt").

Monatliche Einspeisung:
  Beim Pool-Abschluss wird 10% des Sozial-Drittels automatisch eingespeist.
  Diese Route: POST /solidarity-fund-processor/deposit { amount_eur, pool_period_id }
```

---

# BLOCK 2 — MITGLIEDER & ONBOARDING

---

## AGENT: member-onboarding

```
Du bist in ~/btb-app/. Erstelle supabase/functions/member-onboarding/index.ts

Dieser Agent läuft wenn ein neues Mitglied status='anwärter' erhält (DB-Trigger).
Befolge alle GRUNDREGELN.

TRIGGER: Supabase DB-Trigger auf universe_members UPDATE wenn status = 'anwärter'.
Erstelle auch den Trigger in einer Migration.

ABLAUF (alle Schritte fehlertolerant — ein fehlgeschlagener Schritt darf nicht die ganze Kette abbrechen):

Schritt 1 — Supabase Auth Einladung:
  supabase.auth.admin.inviteUserByEmail mit personalisierten Redirect-URL.
  Bei Fehler: in onboarding_steps loggen, weiter.

Schritt 2 — Standard-Einstellungen setzen:
  Alle universe_settings mit scope='default_member' auf das neue Mitglied kopieren.
  Wallet initialisieren: member_coin_ledger Eintrag mit 0 Coins.

Schritt 3 — Aufnahmeantrag PDF generieren:
  python scripts/documents/generate_application.py --member-id [id]
  PDF in Supabase Storage (bucket: member-documents).
  Download-Link per E-Mail an Mitglied.

Schritt 4 — Chronicle-Eintrag:
  "Neues Mitglied in der Gemeinschaft: [Vorname] [Erstes Zeichen Nachname]."
  (Datenschutz: kein voller Nachname öffentlich)

Schritt 5 — Admin-Benachrichtigung:
  E-Mail + Signal-Webhook: "Neues Mitglied [Name] aufgenommen — bitte Zell-Zuordnung prüfen."

Schritt 6 — Willkommens-E-Mail:
  Brevo Template 'member_welcome' mit personalisierten Daten:
  Name, Zell-Zuordnung, Link zur App, Link zum Konzept-PDF.

Schritt 7 — Onboarding-Checklist erstellen:
  In onboarding_checklists: alle Pflichtschritte als offene Tasks anlegen.
  (Profil vervollständigen, IBAN hinterlegen, erstes Zeiterfassungs-Tutorial, etc.)

Jeden Schritt in onboarding_steps loggen: step_name, status, completed_at, error.
```

---

## AGENT: voting-system

```
Du bist in ~/btb-app/. Erstelle supabase/functions/voting-processor/index.ts

Vollständiges Abstimmungssystem — Erstellen, Abschließen, Auswerten.
Befolge alle GRUNDREGELN.

TABELLEN (Migration erstellen):
votes: id, title, description, vote_type (einfach|qualifiziert_70|satzung|budget),
  created_by, starts_at, ends_at, status, result, result_details (JSONB)
vote_responses: id, vote_id, member_id, choice (ja|nein|enthaltung), voted_at
cooperative_resolutions: id, vote_id, resolution_number (Format: YYYY-NNN), 
  resolution_text, passed_at, implementation_deadline, notes

ROUTE: POST /voting-processor/close { vote_id }
  (Cron schaut alle 15 Minuten ob Abstimmungen abgelaufen sind)

AUSWERTUNG:
  Stimmen zählen: ja_count, nein_count, enthaltungen_count, gesamt_stimmberechtigte.
  Quorum-Prüfung: Mindest-Beteiligung aus universe_settings (default: 50% der Mitglieder).
  
  Mehrheits-Logik je vote_type:
  'einfach': ja > nein → bestanden
  'qualifiziert_70': ja >= 70% der abgegebenen Stimmen → bestanden  ← Stundensatz-Absenkung!
  'satzung': ja >= 75% + Quorum 66% → bestanden
  'budget': ja >= 60% → bestanden

  Bei 'bestanden':
  → cooperative_resolutions Eintrag mit fortlaufender Nummer (YYYY-NNN).
  → E-Mail-Zusammenfassung an alle Mitglieder.
  → Chronicle-Eintrag: "Beschluss [Nummer]: [Titel] — angenommen mit X% Ja-Stimmen."
  → Wenn vote_type='satzung': zusätzlich generate_statute_amendment aufrufen.
  
  Bei 'abgelehnt':
  → E-Mail mit Ergebnis.
  → Kein Chronicle-Eintrag (nur Beschlüsse werden öffentlich dokumentiert).
```

---

## AGENT: time-entry-validator

```
Du bist in ~/btb-app/. Erstelle supabase/functions/time-entry-validator/index.ts

Prüft täglich alle Zeiteinträge auf Vollständigkeit und Plausibilität.
Befolge alle GRUNDREGELN. Cron: täglich 20:00 Uhr.

PRÜFUNGEN:

Prüfung 1 — Fehlende Notizen bei nachträglichen Einträgen:
  universe_time_entries wo: entry_type='nachträglich' AND notes IS NULL AND 
  created_at < ctx.now - 24h AND reminder_sent_count < 3.
  Erinnerungs-E-Mail: "Bitte ergänze die Notiz für deinen Zeiteintrag vom [Datum]."
  reminder_sent_count++. Nach 3 Erinnerungen: status='review_required'.

Prüfung 2 — Überlappende Zeiteinträge (selbe Person):
  Für jedes Mitglied: Zeiteinträge des heutigen Tages nach start_time sortieren.
  Wenn end_time[n] > start_time[n+1]: Überlappung gefunden.
  E-Mail an Mitglied: "Überlappende Zeiteinträge gefunden — bitte korrigieren."
  Flag setzen: overlap_flagged = true.

Prüfung 3 — Vergessene laufende Timer:
  universe_time_entries wo: status='running' AND started_at < ctx.now - 12h.
  Status auf 'abandoned' setzen.
  E-Mail: "Timer von vor 12+ Stunden automatisch gestoppt. Bitte manuell prüfen."
  Guardian-Fehlerklasse 'abandoned_timer' loggen.

Prüfung 4 — Unrealistisch lange Einträge (> 12h ohne Pause):
  duration_hours > 12 AND pause_minutes < 30.
  Soft-Flag: review_recommended = true.
  Kein automatisches Ändern — nur Hinweis an Mitglied.

Wöchentlicher Admin-Report (montags):
  Alle Mitglieder mit offenen review_required oder overlap_flagged Einträgen.
  Gesamtbild: wie vollständig ist die Zeiterfassung?
```

---

# BLOCK 3 — LAGER, BESTELLUNGEN, LOGISTIK

---

## AGENT: inventory-monitor

```
Du bist in ~/btb-app/. Erstelle supabase/functions/inventory-monitor/index.ts

Überwacht Lagerbestände und löst automatisch Nachbestellungen aus.
Befolge alle GRUNDREGELN. Cron: stündlich.

ABLAUF:

Schritt 1 — Meldebestand prüfen:
  inventory_items wo: current_stock <= min_stock AND is_active = true.
  Für jedes betroffene Item:
    Bereits offene Bestellung vorhanden (inventory_orders mit status IN ('draft','sent','confirmed'))?
    Wenn ja: überspringen.
    Wenn nein: Draft-Bestellung erstellen.

Schritt 2 — Bestellungen bündeln:
  Alle neuen Draft-Bestellungen nach supplier_id gruppieren.
  Pro Lieferant: eine Sammelbestellung aus allen Items erstellen.
  E-Mail an Zell-Admin: "Neue Sammelbestellung vorbereitet: [N] Artikel bei [Lieferant]. Bitte freigeben."

Schritt 3 — MHD-Prüfung:
  inventory_items wo: expiry_date IS NOT NULL AND expiry_date < ctx.now + 3 Tage.
  Warnung: "Achtung: [Artikel] läuft in [N] Tagen ab."
  Bei expiry_date < heute: status auf 'abgelaufen' setzen, current_stock auf 0.

Schritt 4 — Zellübergreifende Sammelbestellungen:
  Prüfen ob 3+ Zellen beim selben Lieferanten unabhängige Bestellungen haben.
  Wenn ja: E-Mail an alle beteiligten Zell-Admins: "Sammelbestellung möglich — spart ca. X%."
  Einsparungsschätzung aus historischen Rabatten (supplier.bulk_discount_pct).

Schritt 5 — Eigenproduktionen:
  inventory_items wo: is_own_production = true AND current_stock <= min_stock.
  Statt Bestellung: production_orders Eintrag erstellen.
  Benachrichtigung an zuständiges Mitglied.
```

---

## AGENT: group-order-coordinator

```
Du bist in ~/btb-app/. Erstelle supabase/functions/group-order-coordinator/index.ts

Koordiniert zellübergreifende Sammelbestellungen von Erkennung bis Lieferung.
Befolge alle GRUNDREGELN. Cron: täglich 08:00 Uhr.

PHASEN:

Phase 1 — Erkennung (täglich):
  Alle inventory_orders mit status='draft' der letzten 48h nach supplier_id gruppieren.
  Wenn supplier_id in 3+ verschiedenen cell_ids vorkommt:
  → group_order_proposals Eintrag erstellen.
  → E-Mail an alle Zell-Admins: "Sammelbestellung möglich bei [Lieferant]: [Liste der Artikel]"
  → Einsparung berechnen (Volumenrabatt aus supplier.discount_tiers JSONB).

Phase 2 — Bestätigung (nach 48h):
  Alle group_order_proposals mit status='pending' und proposal_created_at > 48h.
  Zellen die bestätigt haben: in Sammelbestellung aufnehmen.
  Zellen ohne Antwort: nochmal erinnern. Nach 72h ohne Antwort: aus Sammelbestellung raus.

Phase 3 — Bestellung aufgeben:
  Sammel-Order an Lieferant senden (E-Mail via Brevo mit Bestellliste).
  Status aller beteiligten Einzel-Orders: 'merged_into_group'.
  Alle Zell-Admins informieren: Bestellung aufgegeben, erwartete Lieferung.

Phase 4 — Lieferung und Aufteilung:
  Webhook oder manuelle Bestätigung: Lieferung eingegangen.
  Automatisch current_stock für alle beteiligten Items in allen Zellen erhöhen
  (proportional zu bestellter Menge).
  Kosten aufteilen und in Buchhaltung buchen.
```

---

# BLOCK 4 — BUCHHALTUNG & DOKUMENTE

---

## AGENT: invoice-payment-matcher

```
Du bist in ~/btb-app/. Erstelle supabase/functions/invoice-payment-matcher/index.ts

Gleicht eingehende Bankzahlungen mit offenen Rechnungen ab.
Befolge alle GRUNDREGELN. Läuft via FinAPI-Webhook bei jedem Zahlungseingang.

ABLAUF:

Trigger: POST /invoice-payment-matcher/webhook von FinAPI (neuer Kontoeingang).
Body: { amount_eur, iban_sender, reference_text, transaction_id, booked_at }

Matching-Logik (in dieser Reihenfolge probieren):

1. Exakt-Match: reference_text enthält invoice.invoice_number → sofortige Zuordnung.

2. Betrag+IBAN-Match: amount == invoice.total_gross_eur (±0.01€) AND sender_iban == customer.iban
   → Zuordnung mit confidence='high'.

3. Betrag-Match: amount == invoice.total_gross_eur (±0.01€) AND mehrere Kandidaten.
   → confidence='medium', Admin-Review erforderlich.

4. Teilzahlung: amount < offene_summe eines Kunden → Teilzahlung verbuchen.

5. Kein Match: unmatched_payments Eintrag, Admin-E-Mail: "Zahlung X konnte nicht zugeordnet werden."

Bei erfolgreichem Match:
  invoices.status = 'paid', paid_at = ctx.now, payment_reference = transaction_id.
  DATEV-Buchung vorbereiten (buchungs_journal Eintrag).
  Bestätigungs-E-Mail an Kunden optional (wenn customer.send_payment_confirmation = true).

Cron-Fallback: täglich 09:00 Uhr alle Zahlungen der letzten 24h nochmal prüfen
falls Webhook gefailed ist.
```

---

## AGENT: dunning-system

```
Du bist in ~/btb-app/. Erstelle supabase/functions/dunning-system/index.ts

Automatisches Mahnwesen für überfällige Rechnungen.
Befolge alle GRUNDREGELN. Cron: täglich 09:30 Uhr.

MAHNSTUFEN (alle Fristen aus universe_settings, nicht hardcodiert):
  Stufe 0: Fällig + 0 Tage → nichts (Wartezeit)
  Stufe 1: Fällig + dunning_days_1 (default 7) → freundliche Erinnerung
  Stufe 2: Fällig + dunning_days_2 (default 14) → zweite Mahnung
  Stufe 3: Fällig + dunning_days_3 (default 21) → offizielle Mahnung + Mahngebühr
  Stufe 4: Fällig + dunning_days_4 (default 30) → Admin-Entscheidung

Ausnahmen (diese Rechnungen NICHT mahnen):
  customer.payment_plan = true (Ratenzahlung vereinbart)
  invoice.type = 'spende' oder 'intern'
  customer.dunning_paused = true (manuell gesetzt)
  invoice.disputed = true (Kunde hat Widerspruch eingelegt)

Für jede mahnbare Rechnung:
  Letzten dunning_log Eintrag prüfen — welche Stufe wurde zuletzt erreicht?
  Nächste Stufe fällig? Wenn ja: Mahnung versenden.
  
  Stufe 3: Mahngebühr (dunning_fee_eur aus settings) zur Rechnung addieren.
  Neuer invoice_item: type='mahngebühr', amount=dunning_fee_eur.
  
  Stufe 4: Kein automatischer Brief — E-Mail an Zell-Admin:
  "Rechnung [Nr.] für [Kunde] ist [N] Tage überfällig. Bitte manuell entscheiden."

Alle Mahnungen via Brevo Template 'dunning_level_[1-3]'.
Jede Mahnung in dunning_logs: invoice_id, level, sent_at, amount_at_time.
```

---

# BLOCK 5 — HEALTH & WELLNESS (Praxis, Heilzentrum)

---

## AGENT: treatment-followup

```
Du bist in ~/btb-app/. Erstelle supabase/functions/treatment-followup/index.ts

Verwaltet Nachverfolgung von Behandlungsplänen und Klienten-Kontakt.
Befolge alle GRUNDREGELN. Cron: täglich 08:30 Uhr.

AUFGABEN:

Task 1 — Termin-Erinnerungen:
  treatment_sessions mit session_date = morgen (ctx.now + 1 Tag).
  E-Mail an Klient: "Morgen um [Uhrzeit] Termin bei [Therapeut]."
  SMS wenn customer.sms_reminders = true (via Brevo SMS).

Task 2 — Verpasste Termine:
  treatment_sessions mit session_date < heute AND status NOT IN ('completed','cancelled').
  Nach 2h nach Terminzeit: status = 'no_show'.
  Nach 3 no_shows in Folge: E-Mail an Therapeut: "Klient [Name] hat 3 Termine verpasst."
  Therapeut entscheidet ob Klient kontaktiert wird.

Task 3 — Abgeschlossene Behandlungspläne:
  treatment_plans wo: sessions_done >= sessions_planned AND status='active'.
  Status auf 'completed' setzen.
  Feedback-E-Mail an Klient: "Wie war Ihre Erfahrung?" (Brevo Template 'treatment_feedback').
  KI-Zusammenfassung generieren (Anthropic API):
    System-Prompt: "Du bist ein Assistent für Therapeuten. Fasse diesen Behandlungsverlauf
    sachlich und professionell zusammen. Keine Diagnosen, nur Beobachtungen."
    Input: alle session_notes des Plans.
    Output: plan.ai_summary.

Task 4 — Lange inaktive Klienten:
  customers mit letzter session_date > 60 Tage UND had_active_plan = true.
  Optionaler Kontakt-Vorschlag an Therapeut (nicht automatisch an Klient).
```

---

## AGENT: room-booking-optimizer

```
Du bist in ~/btb-app/. Erstelle supabase/functions/room-booking-optimizer/index.ts

Verwaltet Raumbuchungen im Heilzentrum mit automatischer Auslastungsoptimierung.
Befolge alle GRUNDREGELN.

TABELLEN (Migration):
treatment_rooms: id, cell_id, name, capacity, equipment (JSONB), cleaning_time_minutes, coins_per_hour
room_bookings: id, room_id, booked_by, purpose, client_id, starts_at, ends_at, 
  booking_type (behandlung|reinigung|wartung|reservierung), status, coins_charged

BEI NEUER BUCHUNG (Webhook von Frontend):
  Verfügbarkeitscheck: keine Überlappungen (including cleaning_time nach vorheriger Buchung).
  Equipment-Check: Hat Therapeut spezielle Anforderungen? Sind die im Raum vorhanden?
  Automatisch Reinigungsblock einplanen: ends_at bis ends_at + cleaning_time_minutes.
  Coins-Verrechnung: duration_hours × room.coins_per_hour vom Therapeuten-Wallet abziehen.

TÄGLICHE OPTIMIERUNG (cron 07:00):
  Leerlaufzeiten berechnen: Zeiten wo Raum ungebucht aber Therapeuten verfügbar.
  Wenn Leerlauf > 2h an einem Tag: E-Mail an Therapeuten: "Raum X hat heute 14-16 Uhr noch frei."
  Auslastungs-Report: Wochenübersicht pro Raum als Prozentsatz.
  Räume unter 30% Auslastung: Vorschlag an Admin ob Raumnutzung angepasst werden soll.
```

---

# BLOCK 6 — COMMUNITY & KOMMUNIKATION

---

## AGENT: newsletter-generator

```
Du bist in ~/btb-app/. Erstelle supabase/functions/newsletter-generator/index.ts

Erstellt monatlich automatisch den BtB-Newsletter und versendet ihn.
Befolge alle GRUNDREGELN. Cron: 1. jeden Monats, 10:00 Uhr.

DATENAGGREGATION:
  Pool-Ergebnis des Vormonats aus pool_periods.
  Neue Mitglieder des Vormonats (mit Einwilligung newsletter_visible=true).
  Beschlüsse des Vormonats aus cooperative_resolutions (öffentliche).
  Top 3 neue Wissensbank-Artikel (nach created_at).
  Kommende Kurse der nächsten 4 Wochen aus courses.
  Offene Abstimmungen (votes mit status='active').

KI-FORMULIERUNG (Anthropic claude-sonnet-4-20250514):
  System-Prompt: "Du schreibst den monatlichen Newsletter für die Back to Balance Genossenschaft.
  Stil: ehrlich, warm, direkt. Kein Marketing-Sprech. Keine Ausrufezeichen-Enthusiasmus.
  Schreibe wie jemand der wirklich glaubt was er schreibt.
  Maximal 400 Wörter Gesamt-Fließtext."
  
  Input: strukturierte JSON-Daten aus der Aggregation.
  Output: fertiger Newsletter-Text in Deutsch.

PERSONALISIERUNG:
  Jedes Mitglied bekommt zuerst News seiner eigenen Zelle.
  Dann erst genossenschaftsweite News.

VERSAND via Brevo:
  Template 'monthly_newsletter' mit KI-generiertem Content.
  Unsubscribe-Link automatisch eingefügt (DSGVO-konform).
  Öffnungsrate und Klickrate in newsletter_stats speichern.
```

---

## AGENT: chronicle-recorder

```
Du bist in ~/btb-app/. Erstelle die Chronicle-Infrastruktur:

TABELLE chronicle_entries:
  id, entry_type (auto|manual), category, title, content,
  is_public (boolean), author_member_id, linked_entity_type, linked_entity_id,
  created_at, approved_by, approved_at

AUTOMATISCHE TRIGGER (DB-Trigger + Edge Function chronicle-recorder):

Trigger auf universe_members INSERT/UPDATE:
  Neues Mitglied → "Neue Mitgliedschaft: [Vorname]" (öffentlich, kein Nachname)
  Mitglied verlässt → "Ein Mitglied hat die Gemeinschaft verlassen" (anonym)

Trigger auf universe_cells INSERT:
  "Neue Zelle gegründet: [Zellname] in [Ort]" (öffentlich)

Trigger auf cooperative_resolutions INSERT:
  "Beschluss [Nummer]: [Titel]" (öffentlich wenn vote.is_public=true)

Trigger auf solidarity_grants INSERT (nach Auszahlung):
  "Solidarfonds: Unterstützung gewährt" (anonym, nur Betrag wenn Empfänger zustimmt)

Trigger auf coin_donations INSERT:
  Nur wenn member.chronicle_consent=true:
  "[Vorname] hat einen Euro-Anspruch zurückgegeben — Danke."

MANUELLE EINTRÄGE:
  Route: POST /chronicle-recorder/submit { title, content, is_public, category }
  Manuelle Einträge brauchen Freigabe durch Admin (approved_by IS NULL → pending).
  Admin-Benachrichtigung bei neuen pending Einträgen.

FRONTEND-SEITE:
  src/pages/community/Chronicle.tsx
  Zeitstrahl-Ansicht, filterbar nach category und is_public.
  Für öffentliche Einträge: auch ohne Login sichtbar (öffentliche Route).
```

---

# BLOCK 7 — GUARDIAN-AGENTEN (das kritischste Block)

---

## AGENT: guardian-core (Haupt-Überwachungsdienst)

```
Du bist in ~/btb-app/. Erstelle das vollständige Guardian-System.
Das ist das komplexeste und kritischste Modul im BtB-System.
Beginne mit einem Dry-Run und zeige mir die Dateistruktur bevor du schreibst.

DATEI-STRUKTUR:
supabase/functions/guardian-core/index.ts          ← Haupt-Orchestrator
supabase/functions/guardian-repair/index.ts        ← Selbstreparatur-Engine
supabase/functions/guardian-bypass/index.ts        ← Bypass-Manager
supabase/functions/_shared/temporal.ts             ← Zeitkontext-Modul (falls nicht vorhanden)
supabase/functions/_shared/guardian-types.ts       ← Typen und Fehlerklassen
src/pages/admin/GuardianDashboard.tsx              ← Admin-Dashboard

TABELLEN (Migration):
guardian_logs: id, agent_name, session_id, check_type, status (ok|warning|critical|error),
  message, details (JSONB), checked_at, resolved_at
guardian_repairs: id, error_class, before_state (JSONB), after_state (JSONB),
  success, repair_started_at, repair_finished_at, session_id
guardian_workarounds: id, element_name, bypass_type, activated_at, activated_by,
  deactivated_at, deactivated_by, reconciliation_done, notes
guardian_root_cause_reports: id, error_class, occurrence_count, period_days,
  hypothesis, recommendations (JSONB), created_at, admin_notified
active_bypasses: id, element_name, bypass_type, activated_at, status

GUARDIAN-CORE (cron: alle 5 Minuten):

Jede Prüfung hat: name, timeout_seconds, severity (warning|critical|existential)

Prüfung 1 — Datenbankverbindung:
  Simple SELECT 1 — wenn Timeout: existential alarm.

Prüfung 2 — Edge Functions Health:
  Jede registrierte Function in automation_registry per HTTP GET /health prüfen.
  Wenn status != 200 oder Timeout: critical.

Prüfung 3 — FinAPI-Verbindung:
  GET FinAPI /api/v2/users (minimal call mit API-Key).
  Wenn 401: API-Key Problem → repair_class 'finapi_auth'.
  Wenn 503/Timeout: Ausfall → bypass_class 'finapi_unavailable'.

Prüfung 4 — Coin-Solvenz:
  SELECT sum(eur_reserve) FROM member_coin_ledger
  vs. SELECT balance FROM coin_reserve_accounts.
  Wenn Rücklage < Verbindlichkeiten: EXISTENTIAL alarm. Sofort alle Vorstandsmitglieder.

Prüfung 5 — Backup-Aktualität:
  SELECT max(created_at) FROM backup_logs.
  Wenn älter als 26h: critical.

Prüfung 6 — Überfällige Cron-Jobs:
  Für jeden Eintrag in automation_registry mit schedule != null:
  Ist last_run älter als 1.5 × expected_interval? → warning.
  Älter als 2 × expected_interval? → critical, Reparatur auslösen.

ALARMIERUNG je Schweregrad:
  warning: nur guardian_logs Eintrag.
  critical: E-Mail an Admin.
  existential: E-Mail + Signal an ALLE Vorstandsmitglieder, guardian_logs, sofortiger Bypass-Check.

ZEITBASIERTE ESKALATION:
  Derselbe critical-Fehler besteht seit:
  < 5min: warten
  5-30min: Reparatur versuchen
  30-120min: Bypass aktivieren + Admin warnen
  > 2h: alle Vorstandsmitglieder alarmieren
  > 24h: externer Support-Ticket (Supabase Management API)
```

---

## AGENT: guardian-repair (Selbstreparatur)

```
Du bist in ~/btb-app/. Erstelle supabase/functions/guardian-repair/index.ts

Dieser Agent wird vom guardian-core aufgerufen wenn ein repair_class identifiziert wurde.
Befolge alle GRUNDREGELN. Zusätzlich: jede Reparatur atomar (Transaktion oder vollständiges Rollback).

BEKANNTE REPARATUR-KLASSEN:

Klasse 'stuck_cron' — { agent_name: string }:
  Prüfe: Kann die Function manuell aufgerufen werden? (HTTP health-check)
  Wenn ja: invoke via supabase.functions.invoke(agent_name, { dry_run: true })
  Wenn Dry-Run erfolgreich: echten Lauf starten.
  Wenn Dry-Run fehlschlägt: error_class eskalieren zu 'function_broken'.

Klasse 'stale_coin_value' — {}:
  Rufe coin-value-calculator auf.
  Prüfe danach ob coin_value_history heute einen Eintrag hat.

Klasse 'abandoned_timer' — { time_entry_id: string }:
  Setze status='abandoned', add_note='guardian: automatisch gestoppt nach 12h'.
  E-Mail an Mitglied: "Dein Timer wurde automatisch gestoppt."

Klasse 'negative_stock' — { item_id: string }:
  Setze current_stock = 0.
  Erstelle inventory_movement: type='correction', quantity=abs(negativer_wert), notes='guardian correction'.
  Admin informieren.

Klasse 'finapi_auth' — {}:
  Prüfe ob API-Key in Supabase Vault noch gültig ist.
  Versuche Key-Rotation wenn rotation_credentials in Vault hinterlegt.
  Teste neuen Key.
  Wenn Rotation erfolgreich: universe_settings aktualisieren.
  Wenn nicht: eskaliere zu 'finapi_unavailable', bypass aktivieren.

Klasse 'orphaned_payment' — { payout_request_id: string }:
  Zahlung ist seit > 4h im status='processing' ohne finapi_payment_id.
  Setze zurück auf 'pending'.
  In payment_queue eintragen für nächsten Lauf.
  Mitglied informieren: "Auszahlung wird erneut versucht."

Klasse 'db_lock_timeout' — { table_name: string, blocking_pid: number }:
  Prüfe pg_stat_activity: Ist blocking_pid idle in transaction seit > 30min?
  Wenn ja: pg_terminate_backend(blocking_pid).
  Niemals aktive Writes abbrechen — nur idle in transaction.
  Danach: prüfe ob ursprünglicher Prozess jetzt laufen kann.

FÜR JEDE REPARATUR:
  guardian_repairs Eintrag: before_state, action_taken, success, after_state.
  Bei Misserfolg: Fehlerklasse eskalieren (severity erhöhen).
  Root-Cause-Check: Tritt dieser error_class zum 2.+ Mal in 30 Tagen auf?
  Wenn ja: guardian-root-cause aufrufen.
```

---

## AGENT: guardian-bypass (Dynamische Alternativ-Architektur)

```
Du bist in ~/btb-app/. Erstelle supabase/functions/guardian-bypass/index.ts

Dieser Agent baut temporäre Umgehungspfade wenn Elemente defekt sind UND die Reparatur
nicht unmittelbar möglich ist. Parallel läuft guardian-repair weiter.
Befolge alle GRUNDREGELN.

BYPASS-TYPEN und ihre Implementierung:

Bypass 'finapi_payment':
  Aktivierung: wenn finapi_unavailable seit > 30min.
  
  Aktion 1 — Betroffene Zahlungen identifizieren:
    Alle payout_requests mit status IN ('pending','processing').
    Alle pending solidarity_grants.
  
  Aktion 2 — PDF-Zahlungsaufträge generieren:
    Für jede Zahlung: python scripts/generate_payment_order.py aufrufen.
    Inhalt: Empfänger, IBAN, Betrag, Verwendungszweck, Referenz-ID, Datum.
    PDFs in Storage bucket 'payment-bypasses/[datum]/'.
  
  Aktion 3 — Admin benachrichtigen:
    E-Mail an Admin + alle Vorstandsmitglieder:
    "FinAPI nicht erreichbar seit [Uhrzeit]. [N] Zahlungen stehen aus.
    Hier sind die Zahlungsaufträge als PDFs — bitte manuell im Online-Banking ausführen.
    Nach Ausführung: in der App die Transaktions-IDs eintragen."
  
  Aktion 4 — Status-Flag setzen:
    active_bypasses: element='finapi', bypass_type='pdf_payment_orders', activated_at=ctx.now.
    Alle betroffenen payout_requests: status='bypass_pending'.
  
  Deaktivierung (nur manuell über Admin-UI oder CLI):
    Reconciliation-Report erstellen: welche Zahlungen manuell ausgeführt?
    Abgleich mit Bankeingang via FinAPI (nach Wiederherstellung).
    Niemals: automatic reactivation ohne Admin-Bestätigung.

Bypass 'edge_function_unavailable' — { function_name: string }:
  Aktion 1 — Lokales Bypass-Skript generieren:
    Analysiere die Edge Function und erstelle scripts/bypass/[function_name].py.
    Das Python-Skript macht exakt dasselbe wie die Edge Function,
    aber direkt via Supabase Service Role Key (nicht über HTTP).
    Erstelle README mit Ausführungsanleitung.
  
  Aktion 2 — Admin benachrichtigen mit Ausführungsanweisung:
    "Edge Function [Name] nicht erreichbar.
    Bypass-Skript verfügbar unter scripts/bypass/[name].py.
    Ausführung: python scripts/bypass/[name].py --dry-run
    Nach Prüfung: python scripts/bypass/[name].py"

Bypass 'email_service_unavailable':
  Zeitkritische E-Mails (types: payment, emergency, gv_invitation, solidarity):
    Versuche Fallback-SMTP aus universe_settings (backup_smtp_host, etc.).
    Wenn kein Fallback: Inhalt als Signal-Nachricht an Admin-Kanal.
  Alle anderen E-Mails: in email_queue belassen, werden nachgesendet.
  Beim Nachversand: Zeitstempel-Hinweis anhängen.

Bypass 'auth_service_unavailable':
  Emergency-Tokens für Admin + Vorstand generieren (UUID, bcrypt-gehasht, 4h gültig).
  In emergency_access_tokens speichern.
  Tokens sicher übermitteln (Signal, nicht E-Mail — E-Mail-Auth auch betroffen).
  Minimale Emergency-Seite aktivieren: /emergency (nur read-only, Coin-Stände, offene Zahlungen).

PARALLEL ZUM BYPASS — immer:
  guardian-repair läuft mit erhöhter Frequenz (alle 2min statt 5min) für dieses Element.
  Wenn Reparatur erfolgreich: Admin benachrichtigen. Bypass noch NICHT automatisch deaktivieren.
  Erst nach Admin-Bestätigung + Reconciliation → Bypass deaktivieren.
```

---

## AGENT: guardian-root-cause (Root-Cause-Prävention)

```
Du bist in ~/btb-app/. Erstelle supabase/functions/guardian-root-cause/index.ts

Analysiert wiederkehrende Fehler und erstellt Präventions-Empfehlungen.
Wird von guardian-repair aufgerufen wenn ein Fehler zum 2.+ Mal auftritt.
Befolge alle GRUNDREGELN.

ABLAUF:

Schritt 1 — Häufigkeitsanalyse:
  SELECT * FROM guardian_logs 
  WHERE agent_name = [error_class] AND created_at > ctx.now - 30 Tage
  ORDER BY created_at.
  Wie oft? In welchen Abständen? Zu welchen Zeiten? Nach welchen Events?

Schritt 2 — Muster-Erkennung:
  Tritt der Fehler auf:
  - Immer am Monatsletzten? → Zusammenhang mit pool-close wahrscheinlich
  - Immer zwischen 02-04 Uhr? → Konflikt mit nächtlichen Batch-Jobs
  - Immer nach Deployments? → Code-Regression wahrscheinlich
  - Immer wenn > N Mitglieder gleichzeitig aktiv? → Last-Problem
  
  Muster automatisch aus Zeitstempeln und context_snapshot der guardian_logs extrahieren.

Schritt 3 — KI-Analyse (Anthropic claude-sonnet-4-20250514):
  System-Prompt: "Du bist ein erfahrener Backend-Entwickler der Fehlerprotokolle analysiert.
  Antworte strukturiert: 1) Wahrscheinlichste Ursache 2) Empfohlene Code-Änderungen
  3) Empfohlene Konfigurationsänderungen 4) Monitoring-Verbesserungen.
  Sei konkret und technisch präzise. Keine Floskeln."
  
  Input: letzte 10 guardian_logs Einträge dieses error_class + context_snapshots.
  Output: strukturierter Report als JSONB.

Schritt 4 — Report speichern:
  guardian_root_cause_reports: error_class, occurrence_count, pattern_detected, 
  ai_analysis, recommendations, created_at.

Schritt 5 — Admin benachrichtigen:
  E-Mail: "Wiederkehrender Fehler [error_class] — Root-Cause-Analyse verfügbar.
  [N] Vorkommen in [X] Tagen. Empfehlung: [erste Empfehlung aus Report]."
  Link zum Guardian-Dashboard.

WÖCHENTLICHER PRÄVENTIONS-DIGEST (cron: montags 07:00):
  Alle Fehler der letzten Woche nach Häufigkeit sortiert.
  Trend: mehr oder weniger Fehler als Vorwoche?
  Top 3 offene Root-Cause-Reports.
  E-Mail an Admin.

MONATLICHES REIFEGRADMODELL:
  Fehleranzahl vs. Vormonat (%).
  Automatisch reparierte vs. manuelle Eingriffe.
  Durchschnittliche Zeit bis Lösung.
  Ziel: -20% Fehler pro Quartal. Auf Kurs? Wenn nein: Empfehlung.
```

---

## AGENT: temporal-context-module (Zeitgefühl für alle Agenten)

```
Du bist in ~/btb-app/. Erstelle das zentrale Zeitkontext-System.
Dieses Modul muss ZUERST erstellt werden, bevor andere Agenten implementiert werden.

ERSTELLE: supabase/functions/_shared/temporal.ts

Inhalt des Moduls:

export interface TemporalContext {
  now: Date;                    // einzige Zeitquelle — nie new Date() danach
  timezone: string;             // 'Europe/Berlin'
  fiscalMonth: string;          // '2026-03'
  fiscalDayType: 'month_start' | 'month_end' | 'mid_month';
  isoString: string;            // now.toISOString()
  localDateString: string;      // '2026-03-31' in Europe/Berlin
  sessionId: string;            // crypto.randomUUID()
  agentName: string;
  sequenceNumber: number;       // wievielter Lauf heute
  previousRunAt: Date | null;   // letzter Lauf desselben Agenten
  previousRunId: string | null;
  contextSnapshot: Record<string, unknown>; // Systemzustand bei Start
}

export async function createTemporalContext(
  agentName: string,
  supabase: SupabaseClient,
  contextData?: Record<string, unknown>
): Promise<TemporalContext>

IMPLEMENTIERUNG:
  1. const now = new Date(); // DAS IST DER EINZIGE new Date() AUFRUF
  2. Sequenznummer aus system_temporal_context berechnen (SELECTs heute)
  3. Letzten Lauf aus system_temporal_context lesen
  4. Context-Snapshot aufnehmen (contextData + Standard-Systemwerte)
  5. Eigenen Lauf in system_temporal_context registrieren (INSERT)
  6. TemporalContext zurückgeben

HILFSFUNKTIONEN:
  toFiscalMonth(date: Date): string         // '2026-03'
  classifyDay(date: Date): FiscalDayType    // 'month_end' wenn letzter Tag
  toLocalDate(date: Date, tz: string): string // YYYY-MM-DD in Zeitzone
  isBusinessDay(date: Date): boolean
  nextBusinessDay(date: Date): Date

TABELLE system_temporal_context (Migration):
  id, agent_name, session_id, started_at, timezone, fiscal_month,
  fiscal_day_type, sequence_number, previous_run_at, previous_run_id,
  context_snapshot (JSONB), finished_at, outcome ('success'|'error'|'dry_run')

AUCH ERSTELLEN: src/lib/temporal.ts (identisches Interface für Frontend)
  Für Client-seitige Zeitberechnungen (Anzeige, Formulare, Berechnungsvorschauen).

TESTE das Modul:
  Schreibe tests/temporal.test.ts mit folgenden Fällen:
  - Monatsübergang um Mitternacht: Agent der um 23:58 startet gehört zum alten Monat
  - Sequenznummer: 3. Lauf heute hat sequenceNumber=3
  - Gleicher Monat: fiscalMonth bleibt '2026-03' auch wenn now nach Mitternacht
  - Timezone-Korrektheit: 23:30 UTC = 00:30 Europe/Berlin (nächster Tag)
```

---

## AGENT: staging-release-manager

```
Du bist in ~/btb-app/. Erstelle den Staging-Freigabe-Agenten.

Dieser Agent verhindert dass ungetestete Automatisierungen in Produktion gehen.
Befolge alle GRUNDREGELN.

TABELLEN (Migration):
staging_automations: id, function_name, version, status
  (pending_test|testing|approved|blocked|live|auto_disabled),
  test_started_at, test_finished_at, test_report (JSONB), approved_by, went_live_at

staging_test_runs: id, automation_id, test_type, test_date, passed, details (JSONB)

DEPLOYMENT-WEBHOOK: POST /staging-release-manager/deployment-hook
  { function_name, version, commit_hash }
  
  → staging_automations Eintrag anlegen mit status='pending_test'.
  → Automatisch Test-Suite starten (Route /run-tests).

TEST-SUITE (/staging-release-manager/run-tests { automation_id }):
  
  Test 1 — Health-Check:
    Neue Function per GET /health ansprechen.
    Erwartet: { status: 'ok' }. Bei Fehler: Test failed.
  
  Test 2 — Dry-Run mit leeren Daten:
    Function mit ?dry_run=true und leerer Payload aufrufen.
    Darf keinen unhandled Error werfen.
  
  Test 3 — Dry-Run mit Staging-Daten:
    Anonymisierte Kopie von Produktionsdaten (staging_data_snapshots).
    Ergebnis auf Plausibilität prüfen:
    Keine negativen Geldbeträge. Keine Zukunftsdaten in der Vergangenheit. etc.
  
  Test 4 — Coin-Solvenz-Check:
    Wenn Function Coin-Transaktionen durchführt:
    Würde der Dry-Run die Solvenz verletzen? Wenn ja: Test failed + critical alert.
  
  Test 5 — Edge Cases:
    Leere Tabellen. Sehr große Datensätze (1000+ Einträge). Null-Werte in Feldern.
    Function muss graceful degradieren, nicht crashen.
  
  NACH TESTS:
  Alle Tests bestanden → status='approved'. E-Mail an Admin: "Bereit für Live-Aktivierung."
  Mindestens ein Test fehlgeschlagen → status='blocked'. Detaillierter Fehlerreport.
  Admin aktiviert manuell: PATCH /staging-release-manager/go-live { automation_id }.

POST-LIVE-MONITORING (48h nach Live-Gang):
  Cron alle 30min: Fehlerrate der neuen Function in automation_logs prüfen.
  Wenn > 3 Fehler in 48h: status='auto_disabled'.
  E-Mail: "Automatisierung [Name] nach 3 Fehlern automatisch deaktiviert."
  Rollback-Option: PATCH /staging-release-manager/rollback { automation_id }.
```

---

## AGENT: guardian-cli (Notfall-Kommandozeile)

```
Du bist in ~/btb-app/. Erstelle das Guardian CLI-Tool: scripts/btb-guardian-cli.js

Ausführbar via: node scripts/btb-guardian-cli.js [command] [options]
Authentifizierung: liest .btb-credentials (JSON mit service_role_key) aus $HOME/.btb/

COMMANDS:

btb-guardian status
  Zeigt aktuellen Systemstatus ohne Web-Interface.
  Direkte DB-Abfrage via Service Role Key.
  Output: farbige Tabelle (grün/gelb/rot) aller überwachter Dienste.
  Exit-Code: 0 = alles grün, 1 = warnings, 2 = critical.

btb-guardian repair --class [error_class]
  Ruft guardian-repair Edge Function auf.
  Zeigt Reparatur-Protokoll live im Terminal.

btb-guardian bypass list
  Zeigt alle active_bypasses mit Aktivierungszeit und Typ.

btb-guardian bypass activate --element [element] --reason "[grund]"
  Aktiviert Bypass manuell. Schreibt in active_bypasses.

btb-guardian bypass deactivate --id [bypass_id] --confirmed-reconciled
  Deaktiviert Bypass. Erstellt automatisch Reconciliation-Report.
  --confirmed-reconciled Flag ist Pflicht (verhindert versehentliche Deaktivierung).

btb-guardian queue list --type [payment|email|all]
  Zeigt alle Einträge in Warteschlangen.

btb-guardian queue flush --type payment
  Verarbeitet payment_queue nach FinAPI-Wiederherstellung.
  Fragt vorher: "Bist du sicher? [N] Zahlungen werden ausgeführt. (ja/nein)"

btb-guardian logs --last [24h|7d|30d] --level [warning|critical|all]
  Zeigt gefilterte Guardian-Logs direkt im Terminal.
  Paginiert (50 Einträge pro Seite).

btb-guardian unlock --entry-id [id]
  Hebt guardian_hold eines Datensatzes auf nach manueller Prüfung.
  Schreibt Begründung in audit_log: wer, wann, warum.

btb-guardian snapshot --agent pool-close --month 2026-03
  Erstellt manuell Pool-Snapshot ohne Schreibvorgang. Nur für Analyse.

Alle CLI-Aktionen in guardian_logs mit source='cli', cli_user (aus Credentials).
```

---

# BLOCK 8 — ABSCHLUSS-INTEGRATION

---

## SUPER-PROMPT: Alle Agenten ins System integrieren

```
Du bist in ~/btb-app/. Alle einzelnen Agenten-Funktionen wurden bereits erstellt.
Jetzt integriere sie vollständig ins bestehende System.

1. AUTOMATION_REGISTRY befüllen:
   Erstelle eine Migration die alle bekannten Agenten registriert:
   INSERT INTO automation_registry (name, description, schedule, enabled, created_at)
   VALUES
   ('monthly-pool-close', 'Monatlicher Pool-Abschluss', 'last day of month 23:00', true, now()),
   ('coin-payout', 'Coin-Auszahlungen via FinAPI', 'daily 10:00', true, now()),
   ... (alle weiteren Agenten)

2. GUARDIAN BEKANNTE FEHLERKLASSEN:
   INSERT INTO guardian_known_errors (error_class, severity, auto_repairable, repair_function, bypass_available)
   VALUES
   ('stuck_cron', 'critical', true, 'guardian-repair', false),
   ('finapi_unavailable', 'critical', false, 'guardian-repair', true),
   ('finapi_auth', 'critical', true, 'guardian-repair', false),
   ('negative_stock', 'warning', true, 'guardian-repair', false),
   ... (alle bekannten Klassen)

3. TEMPORAL CONTEXT überall einbinden:
   Prüfe jede bestehende Edge Function in supabase/functions/:
   Gibt es noch raw new Date() Aufrufe außerhalb von temporal.ts?
   Wenn ja: refactore zu createTemporalContext.

4. ADMIN-DASHBOARD verlinken:
   In src/components/AppSidebar.tsx: Guardian-Dashboard unter Admin-Sektion hinzufügen.
   Nur sichtbar für Rolle 'admin' oder 'vorstand'.

5. GUARDIAN-STATUS WIDGET:
   In src/components/layout/TopBar.tsx:
   Status-Dot (grün/gelb/rot) der den aktuellen Guardian-Status anzeigt.
   Klick öffnet Guardian-Dashboard.
   Polling: alle 60 Sekunden aktuellen Status aus guardian_logs.

6. CRON-JOBS verifizieren:
   Zeige mir alle pg_cron Jobs die nach dieser Integration aktiv sind.
   Sind Zeitzonen korrekt (Europe/Berlin)?
   Gibt es Überschneidungen (zwei kritische Jobs zur selben Zeit)?

7. ABSCHLUSS-TEST:
   Führe einen Dry-Run des monatlichen Pool-Abschlusses durch.
   Dann einen Dry-Run des Guardian-Core.
   Zeige mir die Ausgabe beider Dry-Runs.
```

---

## VERWENDUNG & REIHENFOLGE

```bash
# EMPFOHLENE REIHENFOLGE beim ersten Setup:

# 1. Zeitmodul zuerst (alle anderen brauchen es)
claude  # → temporal-context-module Prompt

# 2. Guardian Infrastruktur
claude  # → guardian-core Prompt
claude  # → guardian-repair Prompt  
claude  # → guardian-bypass Prompt

# 3. Kern-Wirtschaft
claude  # → monthly-pool-close Prompt
claude  # → coin-payout Prompt

# 4. Rest nach Priorität
claude  # → je nach Bedarf

# 5. Abschluss
claude  # → Super-Prompt Integration

# VOR JEDEM SCHRITT:
git add -A && git commit -m "checkpoint: [was als nächstes kommt]"

# NACH JEDEM SCHRITT:
# Dry-Run ausführen
# Logs prüfen
# Erst dann nächsten Schritt

# PARALLEL MIT CURSOR:
# Claude Code arbeitet in: supabase/functions/ und scripts/
# Cursor arbeitet in:      src/pages/ und src/components/
# Nie gleichzeitig in derselben Datei!
```

---

*Back to Balance eG — Alle Agenten. Vollständig. Getestet. Überwacht.*
*Stand: 2026 | Agenten v1.0*
