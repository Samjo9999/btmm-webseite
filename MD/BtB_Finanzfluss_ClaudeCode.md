# Back to Balance — Umfassende Finanzfluss-Automatisierung
**Vollständige Abbildung aller Geldströme als Claude Code Prompts**

> Stack: React/Vite + TypeScript + Supabase (xcngmshjuqoucdlgikao) + FinAPI
> Vor jeder Session: `git add -A && git commit -m "checkpoint"`
> Alle Grundregeln aus BtB_Agenten_ClaudeCode.md gelten hier implizit.

---

## DER GESAMTE FINANZFLUSS — ÜBERBLICK

```
EXTERN                    SYSTEM                         INTERN
──────                    ──────                         ──────

Kunde zahlt Rechnung      
      ↓
FinAPI erkennt Eingang
      ↓                   
invoice.status = 'paid'   
      ↓                   
Pool-Konto + EUR          
      ↓                   
[Periodenabschluss]       
      ↓                   
Dritteilung               
  ├── Vergütung ⅓  ──────→ Coin-Rücklage (gebundene Verbindlichkeit)
  │                               ↓
  │                        Coins an Mitglieder
  │                               ↓
  │                        Mitglied beantragt Auszahlung
  │                               ↓
  │                        FinAPI SEPA → Mitglied
  │
  ├── Reinvestition ⅓ ───→ Fixkosten: Miete, SW, Versicherung, Steuerberater
  │                         Infrastruktur, neue Zellen
  │                         Equipment-Leasingn
  │
  └── Sozial/Öko ⅓ ──────→ 3% → Solidarfonds
                             Rest → Ökologische + soziale Projekte
                             Kann über Perioden angesammelt werden

COIN-INTERNE FLÜSSE:
  Zeit-Tausch: Mitglied A → Coins + Rücklage → Mitglied B
  Waren-EK:    Coins → Lager (Rücklage sinkt um EK-Preis, nicht Coin-Nennwert)
  Coin-Spende: Euro-Anspruch → Pool (Coins bleiben erhalten)
  Tod:         Coins → Pool (nicht Erben, Satzung §14)

STEUER-FLÜSSE:
  Alle Buchungen → DATEV-Export (monatlich)
  Coin-Rücklage → Bilanzposition "sonstige Verbindlichkeiten"
  Externe Umsätze → USt-Voranmeldung
  Solidarfonds-Ausschüttungen → steuerliche Einordnung nach Steuerberater-Beratung
```

---

# MODUL 1 — EINNAHMEN-ERFASSUNG & RECHNUNGSWESEN

---

## AGENT: invoice-lifecycle-manager

```
Du bist in ~/btb-app/. Erstelle das vollständige Rechnungslebenszyklus-System.
Dieses Modul deckt alles ab von der Rechnungserstellung bis zur Bezahlung.
Befolge alle Grundregeln (Zeitgefühl, abschaltbar, Dry-Run, Health, Logging).

DATENBANK — erweitere die bestehende invoices-Tabelle um:
  xrechnung_xml TEXT,          -- XRechnung-Standard XML (EU-Pflicht für Behörden)
  zugferd_embedded BOOLEAN,    -- ZUGFeRD PDF mit eingebettetem XML
  datev_export_id UUID,        -- Verweis auf DATEV-Exportpaket
  pool_period_id UUID,         -- Welcher Periode gehört diese Einnahme?
  revenue_recognized_at TIMESTAMPTZ, -- Wann in Pool geflossen?
  payment_method TEXT,         -- 'sepa'|'bar'|'coins_intern'|'sonstiges'
  dunning_paused BOOLEAN DEFAULT false,
  disputed BOOLEAN DEFAULT false

NEUE TABELLE: invoice_positions
  id, invoice_id, position_nr, description, quantity, unit, 
  unit_price_net, tax_rate_pct, total_net, total_gross,
  revenue_category TEXT, -- 'externe_leistung'|'material'|'kurs'|'miete'
  datev_konto TEXT        -- DATEV-Buchungskonto (z.B. '4400' Erlöse)

NEUE TABELLE: revenue_recognition_log
  id, invoice_id, cell_id, period_id, amount_eur,
  recognized_at, recognized_by_session_id, notes

ROUTE: POST /invoice-lifecycle-manager/create
  Erstellt vollständige Rechnung inkl. XRechnung-XML und ZUGFeRD-PDF:
  
  1. Rechnungsnummer generieren: ZELLE-YYYY-NNN (fortlaufend pro Zelle pro Jahr)
  2. XRechnung-XML erstellen (EN16931-Standard):
     <Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
     Alle Pflichtfelder: BuyerReference, SellerTaxID, PaymentTerms, etc.
  3. ZUGFeRD: PDF mit eingebettetem XML im /XMP-Metadaten-Bereich
  4. Beide Formate in Supabase Storage speichern (bucket: invoices)
  5. E-Mail via Brevo: Rechnung als PDF-Anhang

ROUTE: POST /invoice-lifecycle-manager/mark-paid
  Wenn Zahlung manuell bestätigt oder via FinAPI-Webhook:
  1. invoice.status = 'paid', paid_at = ctx.now
  2. revenue_recognition_log Eintrag: Betrag fließt in aktive Periode
  3. universe_revenue_pool für diese Zelle aktualisieren (gross_revenue_eur += Betrag)
  4. DATEV-Buchungssatz vorbereiten: Konto 1200 (Bank) an Konto 4400 (Erlöse)
  5. Chronicle-Eintrag wenn Betrag > 500€ (optional, konfigurierbar)

CRON-PRÜFUNGEN (täglich 09:00):
  - Rechnungen > 14 Tage offen ohne Mahnstufe: dunning-system triggern
  - Rechnungen mit is_disputed = true seit > 7 Tagen: Admin-Reminder
  - XRechnung ohne valid_until: Hinweis dass Angebot abläuft (falls Angebote)
```

---

## AGENT: finapi-bridge

```
Du bist in ~/btb-app/. Erstelle die vollständige FinAPI-Integration.
FinAPI ist die Bankanbindung — alle echten Geldbewegungen laufen hier durch.
Dies ist das kritischste Modul. Maximale Fehlertoleranz, vollständiges Logging.

DATENBANK:
finapi_accounts: id, cell_id, account_type ('pool'|'solidarfonds'|'reinvestition'|'betrieb'),
  iban, bank_name, finapi_account_id, last_synced_at, balance_eur, balance_at

finapi_transactions: id, account_id, finapi_transaction_id, amount_eur,
  counterparty_iban, counterparty_name, reference_text, booked_at,
  transaction_type ('eingang'|'ausgang'), matched_to_type, matched_to_id,
  matching_confidence ('exact'|'high'|'medium'|'unmatched'), created_at

payment_queue: id, payment_type ('payout'|'solidarity'|'supplier'|'tax'),
  recipient_name, recipient_iban, amount_eur, reference_text,
  source_id, source_type, status ('pending'|'processing'|'submitted'|'confirmed'|'failed'|'bypass'),
  finapi_payment_id, submitted_at, confirmed_at, error_message,
  retry_count DEFAULT 0, max_retries DEFAULT 3

ROUTE: GET /finapi-bridge/sync-accounts
  FinAPI-Konten für alle Zellen synchronisieren.
  Neue Transaktionen importieren.
  invoice-payment-matcher für neue Eingänge aufrufen.
  Cron: alle 4 Stunden + sofort nach Webhook.

ROUTE: POST /finapi-bridge/initiate-payment
  Zahlung in payment_queue aufnehmen und sofort ausführen:
  
  1. Idempotenz: Hat dieser source_id bereits eine payment_queue-Zeile? Wenn ja: zurückgeben.
  2. Solvenz-Check: Nach dieser Zahlung noch genug Rücklage?
     Wenn nein: status='blocked_insufficient_funds', Admin alarmieren.
  3. FinAPI PIS (Payment Initiation Service):
     - Access-Token holen (OAuth2, cached wenn noch gültig)
     - SEPA-Zahlung initiieren mit paymentPurpose, creditorIban, amount
     - Bei Erfolg: finapi_payment_id speichern, status='submitted'
     - Bei Fehler: Guardian-Fehlerklasse 'finapi_payment_failed' auslösen
  
  FEHLERBEHANDLUNG (Guardian-bekannte Klassen):
  'finapi_auth_expired' → Token erneuern, retry
  'finapi_rate_limit' → 60s warten, retry
  'finapi_bank_reject' → status='failed', Admin-E-Mail mit Ablehnungsgrund
  'finapi_timeout' → status='processing', Guardian-Retry nach 30min
  'finapi_unavailable' → Bypass-Modus: PDF-Zahlungsauftrag generieren

ROUTE: POST /finapi-bridge/webhook
  FinAPI sendet Webhook bei jedem Transaktionseintrag:
  1. Signature verifizieren (HMAC)
  2. Transaktion in finapi_transactions speichern
  3. Wenn Eingang: invoice-payment-matcher aufrufen
  4. Wenn Ausgang + payment_queue.finapi_payment_id matcht: status='confirmed'
  5. Coin-Rücklage nach Auszahlungs-Bestätigung reduzieren (ERST JETZT)

MONITORING (Guardian-Erweiterung):
  Offene Zahlungen in payment_queue mit status='submitted' seit > 2h ohne Bestätigung → Warning
  Offene Zahlungen seit > 24h → Critical
  payment_queue.retry_count > 2 → Admin-Alarm
  Bank-Kontostand < solidarity_fund_minimum (aus universe_settings) → Existential-Alarm
```

---

## AGENT: revenue-attribution

```
Du bist in ~/btb-app/. Erstelle den Revenue-Attribution-Agenten.
Jeder eingehende Euro muss einer Zelle, einer Periode und einem Buchungskonto zugeordnet werden.

KERNAUFGABE:
Jeder Umsatz in invoices.revenue_category bestimmt wohin er in der Dritteilung fließt.

KATEGORIEN und ihre buchhalterische Behandlung:
'externe_leistung'  → voller Pool-Beitrag, normaler Stundensatz-Beitrag
'material_verkauf'  → nach Materialkosten-Abzug (material_cost_deduction_pct) in Pool
'kurs_extern'       → wie externe_leistung, zusätzlich Kurs-Aufwände abziehen
'raumvermietung'    → Reinvestitions-Anteil erhöht (da Immobilie genossenschaftlich)
'foerderung'        → Sozial/Öko-Anteil, kein Stundensatz-Beitrag
'spende'            → direkt in Solidarfonds oder Sozial/Öko (je nach Spenden-Zweck)
'interner_ausgleich'→ null Außenwirkung, nur Umbuchung zwischen Zellen

ROUTE: POST /revenue-attribution/attribute { invoice_id }
  Liest invoice.revenue_category und invoice.total_net_eur.
  Berechnet Anteil für jede Pool-Sparte dieser Periode.
  Schreibt in universe_revenue_pool (aufaddierend, nicht überschreibend).
  
  Sonderfall 'foerderung':
    Förderbescheid prüfen: gibt es Bedingungen? (funding_conditions JSONB)
    Wenn Zweckbindung: in earmarked_funds separiert, nicht freier Pool.
    Reminder bei Verwendungsnachweis-Frist.

MONATLICHE ABSTIMMUNG (cron: 1. des Monats, 06:00):
  Alle revenue_recognition_logs des Vormonats summieren.
  Vergleich mit pool_periods.total_pool_eur — stimmt es überein?
  Differenz > 0.01€: Abstimmungsfehler-Alarm an Buchhaltung.
  "Penny difference" Report: alle Rundungsdifferenzen dokumentieren.
```

---

# MODUL 2 — PERIODEN-ABSCHLUSS & DRITTEILUNG

---

## AGENT: period-close-orchestrator

```
Du bist in ~/btb-app/. Erstelle den vollständigen Perioden-Abschluss-Orchestrator.
Dies ist der komplexeste Prozess im System — maximal sorgfältig implementieren.

VORBEDINGUNGEN-CHECK (vor jedem Abschluss):
  Alle offenen Zeiteinträge genehmigt? (universe_time_entries, status='pending' → Fehler)
  Alle Rechnungen verarbeitet? (invoices ohne period_id → Warning, nicht Fehler)
  Vorperiode abgeschlossen? (keine offene pool_periods davor → Fehler)
  Coin-Rücklage solvent? (gebundene Rücklage ≥ ausstehende Verbindlichkeiten → Fehler)
  Guardian-Status: keine kritischen offenen Fehler → Warning (nicht Fehler, Admin kann override)

SCHRITT 1 — POOL ZUSAMMENRECHNEN:
  Pro Zelle:
    gross_revenue = SUM(invoices.total_net_eur WHERE period_id = this AND status='paid')
    material_deduction = gross_revenue × material_cost_deduction_pct / 100
    net_pool = gross_revenue - material_deduction
  
  Gesamt:
    total_net_pool = SUM(net_pool über alle Zellen)
  
  SONDERFALL: Fördermittel mit Zweckbindung (earmarked_funds):
    Diese werden VOR der Dritteilung abgezogen.
    Sie fließen direkt in den jeweiligen Verwendungszweck.
    Nur der freie Pool wird geteilt.

SCHRITT 2 — DRITTEILUNG:
  Alle Prozentsätze aus universe_settings (nie hardcodiert):
  
  vergütung_eur    = total_net_pool × pool_share_vergütung_pct / 100
  reinvestition_eur = total_net_pool × pool_share_reinvestition_pct / 100
  sozial_eur       = total_net_pool × pool_share_sozial_pct / 100
  
  Validierung: vergütung + reinvestition + sozial = total_net_pool ± 0.01€ (Rundung)
  
  AUFBAUPHASE (wenn universe_settings.aufbauphase_active = true):
    Reinvestition und Sozial werden zusammengelegt.
    Erst nach Wendepunkt (20€/h Stundensatz erreicht) getrennt.
    GV kann mit einfacher Mehrheit Reinvestition temporär erhöhen.

SCHRITT 3 — STUNDENSATZ BERECHNEN:
  total_billed_hours = SUM(universe_time_entries.duration_hours 
                          WHERE period_id = this AND billable = true AND status = 'approved')
  
  Wenn total_billed_hours = 0: Fehler — keine abgerechneten Stunden.
  
  raw_hourly_rate = vergütung_eur / total_billed_hours
  
  Untergrenze: nie unter universe_settings.hourly_rate_minimum_eur
  Wenn raw_hourly_rate < minimum: Guardian-Alert, GV-Entscheidung erforderlich.
  Wenn raw_hourly_rate < 20€ UND aufbauphase_active = false: GV-Alert (Zielwert nicht erreicht).
  
  BESONDERHEIT: 70%-Mehrheit für Absenkung unter Zielwert:
    Wenn vorgeschlagener Satz < universe_settings.hourly_rate_target_eur:
    Automatisch Abstimmung erstellen (vote_type='qualifiziert_70').
    Periode bleibt 'calculating' bis Abstimmung abgeschlossen.

SCHRITT 4 — COINS GUTSCHREIBEN:
  Für jedes aktive Mitglied:
    member_hours = SUM(time_entries.duration_hours WHERE member_id = M AND period = this AND billable = true)
    new_coins = member_hours (1 Coin = 1 Stunde, immer)
    eur_rate_at_creation = raw_hourly_rate (HISTORISCH FIXIERT — nie änderbar)
    eur_reserve = new_coins × eur_rate_at_creation
    
  INSERT INTO btb_coin_ledger:
    type='verdient', coins=new_coins, eur_rate_at_creation=raw_hourly_rate,
    eur_equivalent=eur_reserve, period_id, member_id, time_entry_ids (JSONB-Array)
  
  KRITISCH: eur_rate_at_creation wird genau einmal gesetzt und nie wieder geändert.
  Spätere Stundensatzerhöhungen gelten nur für neue Coins.
  
  Buchhaltung: Coin-Rücklage steigt um SUM(eur_reserve aller neuen Coins)
  DATEV: Buchung "Vergütungsrücklage" (Konto noch mit Steuerberater abstimmen)

SCHRITT 5 — SOLIDARFONDS-EINSPEISUNG:
  solidar_einspeisung = sozial_eur × solidarity_fund_contribution_pct / 100
  solidarity_fund_balance += solidar_einspeisung
  solidarity_fund_transactions Eintrag: type='periodeneinspeisung', amount=solidar_einspeisung
  Restbetrag: sozial_eur - solidar_einspeisung → verbleibt in sozial_öko_reserve

SCHRITT 6 — REINVESTITIONS-VERRECHNUNG:
  Alle im Monat angefallenen Fixkosten aus reinvestment_expenses laden:
  Miete, Versicherungen, Software-Lizenzen, Steuerberater-Honorar.
  
  Wenn reinvestition_eur >= sum(fixkosten): Differenz in reinvestitions_reserve (Rücklage)
  Wenn reinvestition_eur < sum(fixkosten): Fehlbetrag aus reinvestitions_reserve nehmen.
  Wenn reinvestitions_reserve < 0: KRITISCHER ALARM — Existenzproblem.

SCHRITT 7 — ZELL-VERTEILUNG:
  Reinvestition und Sozial werden gleichmäßig auf alle aktiven Zellen verteilt
  — unabhängig von Größe oder Umsatz. (Satzung §11 Abs. 3: "jede Zelle wird gleich gedüngt")
  zell_reinvestition = reinvestition_eur / count(active_cells)
  zell_sozial = (sozial_eur - solidar_einspeisung) / count(active_cells)

SCHRITT 8 — PERIODE SCHLIESSEN:
  pool_periods.status = 'closed', closed_at = ctx.now
  Alle Werte in pool_periods eintragen (audit-fähig, nie änderbar nach Close).
  Chronicle: "Periode [Monat] abgeschlossen — [Betrag]€ verteilt, [N] Mitglieder, [Stundensatz]€/h"
  E-Mail an alle Vorstandsmitglieder: vollständige Zusammenfassung.
  
SCHRITT 9 — NACHGELAGERTE PROZESSE (async nach Close):
  coin-value-calculator: neuen Coin-Wert berechnen und publishen.
  datev-exporter: DATEV-Paket für diese Periode erstellen.
  period-report-generator: PDF-Bericht für Vorstand.
  tax-advance-preparer: USt-Voranmeldungs-Daten vorbereiten.

DRY-RUN-MODUS:
  Alle Berechnungen ausführen, nichts schreiben.
  Gibt zurück: {
    expected_hourly_rate, expected_vergütung, expected_reinvestition, expected_sozial,
    coins_to_issue: [{member_id, hours, coins, eur_value}],
    warnings: [...], errors: [...],
    would_trigger_gv_vote: boolean
  }
```

---

# MODUL 3 — COIN-SYSTEM (vollständige interne Ökonomie)

---

## AGENT: coin-transaction-engine

```
Du bist in ~/btb-app/. Erstelle die vollständige Coin-Transaktions-Engine.
Jede Coin-Bewegung muss atomar, idempotent und auditierbar sein.

TRANSAKTION-TYPEN und ihre genaue Buchungslogik:

TYP: 'zeit_tausch' (Mitglied A erbringt Leistung für Mitglied B)
  Input: from_member_id, to_member_id, coins, leistungsbeschreibung
  
  Prüfungen:
    from_member.coin_balance >= coins?
    to_member.status IN ('vollmitglied', 'anwärter')?
    Coins nicht negativ?
  
  Buchung (in einer Transaktion):
    btb_coin_ledger INSERT: type='abgang_zeittausch', member=from, coins=-coins,
      eur_equivalent = coins × from_member.gewichteter_historischer_kurs (FIFO)
    btb_coin_ledger INSERT: type='zugang_zeittausch', member=to, coins=+coins,
      eur_rate_at_creation = GLEICHER historischer Kurs wie from (Coin behält seinen Ursprungswert!)
    
    WICHTIG: Der eur_rate_at_creation wandert MIT dem Coin.
    Die Rücklage wandert mit: from_member.eur_reserve -= eur_equivalent
                              to_member.eur_reserve += eur_equivalent
    
    coin_transactions INSERT: type='zeit_tausch', from_member, to_member, coins, eur_equivalent
    Push-Benachrichtigung an beide Mitglieder.
    
  Rollback bei jedem Fehler: vollständig, keine Teilbuchungen.

TYP: 'waren_ek' (Coin gegen interne Ware einlösen)
  Input: member_id, item_id, quantity, coins_to_spend
  
  Prüfungen:
    member.coin_balance >= coins_to_spend?
    inventory_items.current_stock >= quantity?
    coins_to_spend = quantity × item.price_internal_coins? (Preisvalidierung)
  
  Buchung:
    COINS: btb_coin_ledger: type='abgang_warenkauf', -coins_to_spend
    RÜCKLAGE: sinkt um item.price_purchase_eur × quantity (EK-PREIS, nicht Coin-Nennwert!)
      Differenz Coin-Nennwert - EK-Preis: verbleibt in Pool (Handelsgewinn intern)
    LAGER: inventory_movements: type='sale_internal', quantity, unit_price=EK-Preis
    DATEV: Buchung "Interner Warenverkauf" (steuerliche Behandlung: Innenumsatz, kein USt)

TYP: 'coin_spende' (Mitglied gibt Euro-Anspruch zurück)
  Input: member_id, eur_amount_to_donate, reason_text
  
  Prüfungen:
    member.eur_reserve >= eur_amount_to_donate?
    member hat Bestätigung gegeben (confirmation_token aus Frontend)?
    
  Buchung:
    member.eur_reserve -= eur_amount_to_donate
    COINS BLEIBEN ERHALTEN (nur Euro-Anspruch erlischt!)
    solidarity_fund_balance += eur_amount_to_donate (oder frei in Pool — konfigurierbar)
    
    FORMALER AKT (Pflicht):
    chronicle_entries: type='coin_spende', is_public=member.chronicle_consent,
      content="[Name] hat [Betrag]€ Euro-Anspruch zurückgegeben"
    Spendenbestätigung PDF generieren (steuerlich relevant, python-docx)
    coin_donations INSERT: member_id, eur_amount, coins_retained, donated_at, receipt_url

TYP: 'austritt' (Mitglied verlässt Genossenschaft)
  Input: member_id, exit_reason
  
  Buchung (in Reihenfolge):
    Alle offenen Zeit-Tausch-Anfragen stornieren.
    Geschäftsanteil berechnen: gezeichnete Anteile × Nennwert (aus Satzung §8)
    Coin-Rücklage auszahlen: alle eur_reserves summieren
    payment_queue: type='austritt_auszahlung', amount=anteil + coin_rücklage
    
    member.status = 'ausgetreten', exit_date = ctx.now
    DSGVO: anonymization_scheduled_at = ctx.now + 3 Jahre
    
    Wenn member.coin_balance > 0 und keine Auszahlung gewünscht:
    → Coin-Spende anbieten (separate Transaktion nach expliziter Bestätigung)

TYP: 'tod' (Satzung §14: Coins → Pool, nicht Erben)
  Input: member_id (durch Admin mit Bestätigung ausgelöst)
  
  Buchung:
    ALLE Coins des Mitglieds: btb_coin_ledger: type='abgang_tod', alle Coins
    RÜCKLAGE: gesamte eur_reserve → zurück in vergütungs_pool (nächste Periode)
    member.status = 'verstorben' (NICHT 'gelöscht')
    
    E-Mail an Vorstand: "Bitte Chronicle-Eintrag mit Würde verfassen" — KEIN automatischer Text
    
    Alle offenen Anträge (solidarity, payout) stornieren.
    Alle laufenden Zeit-Tausch-Anfragen stornieren.
    DSGVO: Personendaten bleiben — Mitglied wird nicht gelöscht (historische Kohärenz).

HILFSFUNKTION: getWeightedHistoricalRate(member_id, coins_to_use)
  Berechnet nach FIFO: älteste Coins zuerst verwenden.
  Gibt gewichteten Durchschnitt der eur_rate_at_creation zurück.
  Wird bei Auszahlungen und Zeit-Tausch verwendet.
```

---

## AGENT: coin-solvency-monitor

```
Du bist in ~/btb-app/. Erstelle den Coin-Solvenz-Monitor.
Das ist die wichtigste Sicherheitsfunktion im Finanzsystem.

DEFINITION SOLVENZ:
  SUM(btb_coin_ledger.eur_equivalent WHERE status='active') 
  ≤ 
  coin_reserve_accounts.total_balance_eur

  Gebundene Coin-Rücklage ≥ ausstehende Coin-Verbindlichkeiten.
  Unterschreitung ist existenzbedrohend und nie akzeptabel.

KONTINUIERLICHE ÜBERWACHUNG (bei jeder Coin-Transaktion, via DB-Trigger):
  Nach jeder Schreiboperation in btb_coin_ledger:
  Sofort-Check: aktuelle Verbindlichkeiten vs. Rücklage.
  Bei Unterschreitung: Transaktion ROLLBACK + Guardian-Alarm 'EXISTENTIAL'.

TÄGLICHER TIEFENCHECK (cron 02:00):
  Vollständige Neuberechnung aus allen Ledger-Einträgen.
  Vergleich mit gestrigem Stand.
  Wenn Differenz > 0.01€ ohne erklärende Buchung: Abstimmungsfehler-Alarm.
  
  REPORT-STRUKTUR:
  {
    total_coin_verbindlichkeiten_eur: X,  // was wir schulden
    coin_rücklage_eur: Y,                 // was wir haben
    solvenz_quote: Y/X,                   // sollte ≥ 1.0 sein
    puffer_eur: Y - X,                    // positiv = Puffer, negativ = Problem
    coins_outstanding: N,                 // Anzahl ausstehender Coins
    mitglieder_mit_coins: M,              // Wie viele haben Guthaben
    älteste_coin_periode: 'YYYY-MM',      // ältester noch nicht ausgezahlter Coin
    hochster_einzelanspruch: { member: ..., eur: ... }
  }

SOLVENZ-FORECAST (monatlich):
  Wenn alle Mitglieder gleichzeitig auszahlen würden: können wir zahlen?
  Stress-Test: Berechne worst-case Auszahlung.
  Vorstandsbericht: "Im Worst-Case benötigen wir X€. Wir haben Y€. Puffer: Z€."
```

---

# MODUL 4 — STEUER & BUCHFÜHRUNG

---

## AGENT: datev-exporter

```
Du bist in ~/btb-app/. Erstelle den vollständigen DATEV-Export-Agenten.
DATEV ist der Standard für deutsche Buchführung — jeder Buchungssatz muss stimmen.

DATEV-FORMAT (DATEV ASCII-Schnittstelle, Format 510):
  Header: Versionsnummer, Buchungstyp, Zeitraum, Beraternummer, Mandantennummer
  Jeder Buchungssatz: Betrag; Soll/Haben; Konto; Gegenkonto; Datum; Buchungstext

KONTENPLAN (BtB-spezifisch, mit Steuerberater abzustimmen):
  1200 Bank (Pool-Konto)
  1201 Bank (Solidarfonds-Konto)
  1202 Coin-Rücklage-Konto (interne Verrechnungseinheit)
  4400 Erlöse externe Leistungen (19% USt)
  4300 Erlöse steuerfreie Leistungen (Heilpraktiker, §4 UStG)
  4800 Erlöse interne Leistungen (kein USt — Innenumsatz)
  6000 Wareneinsatz
  6300 Miete
  6400 Versicherungen
  6500 Software/IT
  6600 Steuerberater/Rechtsanwalt
  7000 Coin-Vergütung (Verrechnungskonto)
  7100 Solidarfonds-Zuweisung
  7200 Reinvestition
  9000 Eigenkapital Genossenschaft

ROUTE: POST /datev-exporter/export-period { period_id }
  Erstellt vollständiges DATEV-Exportpaket:
  
  Buchungssätze aus:
    1. Alle bezahlten invoices dieser Periode → Erlöse-Buchungen
    2. Alle Ausgaben (reinvestment_expenses) → Aufwands-Buchungen
    3. Pool-Dritteilung → interne Umbuchungen
    4. Coin-Gutschriften → Rückstellungs-Buchungen
    5. Solidarfonds-Einspeisung → Umbuchung
    6. Zahlungsein- und -ausgänge (aus finapi_transactions)
  
  BESONDERHEIT Coin-Rücklage:
    Buchung: 7000 Coin-Vergütung an 1202 Coin-Rücklage
    Steuerberater hat zu entscheiden ob 1202 als "sonstige Verbindlichkeiten"
    oder "Rückstellungen" geführt wird.
    Bis zur Klärung: separates Verrechnungskonto, klar gekennzeichnet.
  
  Output:
    DTVF_[Periode]_BtB.csv (DATEV ASCII)
    DTVF_[Periode]_BtB_Buchungsprotokoll.pdf (lesbare Zusammenfassung)
    ZIP beides zusammen in Storage (bucket: datev-exports)
  
  E-Mail an Steuerberater + Vorstand: ZIP als Anhang.

ROUTE: GET /datev-exporter/ust-advance { year, month }
  Umsatzsteuer-Voranmeldungs-Daten:
    Steuerpflichtige Umsätze nach Steuersatz (7%, 19%, 0%)
    Steuerbeträge
    Vorsteuer aus Eingangsrechnungen
    Zahllast (Umsatzsteuer - Vorsteuer)
  
  Format: ELSTER-kompatibles XML oder strukturiertes PDF für manuelle Eingabe.
  Cron: 5. des Folgemonats (damit Steuerberater bis zum 10. einreichen kann).
```

---

## AGENT: tax-compliance-monitor

```
Du bist in ~/btb-app/. Erstelle den Steuer-Compliance-Monitor.
Dieser Agent überwacht alle steuerlichen Fristen und bereitet Unterlagen vor.

STEUERLICHE FRIST-KALENDER:
  Monatlich:
    10. des Monats: USt-Voranmeldung (oder mit Dauerfristverlängerung: 10. des Folgemonats)
    10. des Monats: Lohnsteueranmeldung (wenn Arbeitnehmer — bei BtB: Sonderfall)
  
  Quartalsweise:
    25. nach Quartalsende: Körperschaftsteuer-Vorauszahlung
    Steuerberater-Export: 5. des Folgemonats
  
  Jährlich:
    31.05. Folgejahr (mit Steuerberater: 28.02. übernächstes Jahr): Steuererklärungen
    30.06.: Genossenschaftsprüfung (Prüfverband)
    31.12.: Jahresabschluss vorbereiten

FRÜHWARNSYSTEM (cron täglich 07:00):
  Alle Fristen der nächsten 30 Tage prüfen.
  < 30 Tage: in täglicher Admin-Übersicht
  < 14 Tage: E-Mail-Warnung
  < 5 Tage: tägliche E-Mail + Guardian-Critical
  Überschritten: Guardian-Existential + sofortiger Alarm

SACHBEZUGS-ÜBERWACHUNG (monatlich, kritisch für Bürgergeld-Mitglieder):
  Für jedes Mitglied mit bürgergeld_relevant = true:
  Summiere alle internen Leistungen des Monats:
    Waren-EK zu internen Preisen
    Mahlzeiten aus Gemeinschaftsküche (wenn bewertet)
    Wohnen (wenn im Gemeinschaftsgebäude)
  
  Monatlicher Sachbezugswert > sachbezugs_freigrenze (aus universe_settings)?
  → Warnung an Mitglied UND Admin.
  
  Wichtig: Bis zur Klärung durch Steuerberater (offene Frage im Steuer-Briefing)
  konservativ behandeln. Im Zweifel Freigrenze früh melden.

KLEINUNTERNEHMER-SCHWELLEN-MONITORING:
  Wenn Zelle oder Mitglied Kleinunternehmer:
  Außenumsätze des laufenden Jahres summieren.
  Bei 80% der Schwelle (aktuell 22.000€/Jahr): Warnung.
  Bei Überschreitung: sofortiger Alarm, USt-Pflicht ab nächstem Jahr.
```

---

## AGENT: annual-closing-assistant

```
Du bist in ~/btb-app/. Erstelle den Jahresabschluss-Assistenten.
Koordiniert die Vorbereitung des Jahresabschlusses für Steuerberater und Prüfverband.

ABLAUF (startet automatisch am 2. Januar für das Vorjahr):

Phase 1 — Daten-Vollständigkeits-Check:
  Alle 12 Perioden abgeschlossen?
  Alle Rechnungen verarbeitet und DATEV-exportiert?
  Kein ungematchter Zahlungseingang > 30 Tage alt?
  Coin-Solvenz-Jahresabschluss-Check: Stichtag 31.12. rekonstruieren.
  
  Report: Was ist vollständig? Was fehlt noch? Mit Links zur Nachbearbeitung.

Phase 2 — Jahres-Kennzahlen berechnen:
  Gesamtumsatz extern (alle bezahlten Rechnungen)
  Gesamtpool (alle Perioden summiert)
  Durchschnittlicher Stundensatz (gewichtet über alle Perioden)
  Coin-Verbindlichkeiten per 31.12.
  Solidarfonds-Stand per 31.12.
  Mitglieder-Entwicklung: Eintritte, Austritte, Stichtag-Bestand
  Zell-Entwicklung: neue Zellen, Schließungen

Phase 3 — Steuerberater-Paket erstellen:
  DATEV-Jahresexport (alle 12 Monate in einem Paket)
  Coin-Rücklage-Nachweis: vollständige Aufstellung aller ausstehenden Verbindlichkeiten
  Solidarfonds-Nachweis: Ein- und Ausgaben, Stichtags-Bestand
  Sachbezugs-Übersicht: monatliche Werte je betroffenes Mitglied
  Offene steuerliche Fragen aus BtB_Steuer_Briefing mit aktuellem Status:
    - Coin-Bilanzierung: Entschieden? Noch offen?
    - USt-Innenumsätze: Entschieden?
    - Sachbezugsfreigrenze: Angewendet?
  Alles als ZIP mit strukturiertem Inhaltsverzeichnis.

Phase 4 — Prüfverband-Vorbereitung (BWGV):
  Genossenschaftsrechtliche Kennzahlen: Mitgliederanzahl, Gezeichnete Anteile, Eigenkapital
  Geschäftsberichte-Entwurf für Vorstand zur Ergänzung
  Checkliste §53 GenG Pflichtprüfung: Was liegt vor, was fehlt?
  Terminvorschlag für Prüfungstermin.

Phase 5 — Mitglieder-Jahresabrechnung (individual):
  Für jedes Mitglied: persönliche Jahresübersicht
  Abgerechnete Stunden / Verdiente Coins / Euro-Gegenwert / Interne Ausgaben (Coins) /
  Aktueller Coin-Saldo / Aktueller EUR-Rücklage-Wert
  Optional: Steuerlich relevante Informationen (Sachbezüge, Auszahlungen)
  Per E-Mail an jedes Mitglied, Januar.
```

---

# MODUL 5 — SOLIDARFONDS (vollständige Logik)

---

## AGENT: solidarity-fund-complete

```
Du bist in ~/btb-app/. Erstelle das vollständige Solidarfonds-System.
Dies baut auf dem solidarity-fund-processor aus BtB_Agenten_ClaudeCode.md auf
und ergänzt alle fehlenden Aspekte.

VOLLSTÄNDIGE ANSPRUCHS-LOGIK (aus Satzung):

Anspruchstypen und ihre Bedingungen:
'schlechter_monat':
  Bedingung: Monatsumsatz < solidarity_fund_lower_threshold × Durchschnittsmonat
  Max-Betrag: 1 × Durchschnitts-Monatsvergütung (letzten 3 Monate)
  Automatisch wenn: Mitglied >= 6 Monate dabei, Fonds solvent, kein offener Antrag
  
'krankheit':
  Bedingung: Krankmeldung (Attest erforderlich, upload in System)
  Dauer: bis zu 4 Wochen überbrückt, danach GV-Entscheidung
  Max-Betrag: Mitglieds-Durchschnittsvergütung × Kranktage / 30
  
'elternzeit':
  Sonderregelung: Elternzeit-Staffeln aus universe_settings
  Zusatz-Stunden für Schwangerschaft (universe_settings.schwangerschafts_zusatzstunden)
  
'notfall':
  Sofortverfahren: 4h-Ziel
  Max-Betrag: 3 × Durchschnitts-Monatsvergütung
  Vorstand-Genehmigung: 2 von N Vorstandsmitgliedern (N aus universe_settings)
  
'investition':
  Für betriebliche Investitionen die Reinvestitionsanteil übersteigen
  GV-Entscheidung immer erforderlich (kein Automatismus)
  Rückzahlungsplan erforderlich (in solidarity_repayment_plans)

REPAYMENT-TRACKING (wenn Rückzahlung vereinbart):
  solidarity_repayment_plans: id, grant_id, total_eur, 
    monthly_installment, start_date, paid_installments, remaining_eur
  Monatliche Abbuchung via Coin-Abbuchung (nicht Euro-Überweisung):
  Mitglied zahlt in Coins zurück → Pool bekommt Euro-Rücklage zurück.

FONDS-GESUNDHEITS-MONITORING:
  Fonds-Stand-Ampel (für Dashboard):
    Grün:  > 3 × durchschnittliche_monatliche_auszahlung
    Gelb:  1-3 × Durchschnitt
    Rot:   < 1 × Durchschnitt → Neue Anträge nur noch nach GV-Beschluss
  
  Prognose: Bei aktuellem Einzahlungs- und Auszahlungstrend — wann ist Fonds leer?
  Wenn Prognose < 6 Monate: Vorstand informieren.
  
  Jahres-Report: Wie oft wurde der Fonds genutzt? Für welche Typen? Rückzahlungsquote?

ANONYMISIERTER CHRONICLE-EINTRAG (nach Auszahlung):
  Wenn member.chronicle_consent = true:
    "Solidarfonds hat heute [Vorname] unterstützt."
  Wenn false:
    "Solidarfonds-Unterstützung gewährt." (kein Name)
  Betrag nur mit expliziter Einwilligung.
```

---

# MODUL 6 — FINANZFLUSS-DASHBOARD & REPORTING

---

## AGENT: financial-dashboard-data

```
Du bist in ~/btb-app/. Erstelle alle Backend-Routes für das Finanz-Dashboard.
Das Dashboard soll dem Vorstand jederzeit den vollständigen Geldfluss zeigen.

ROUTE: GET /financial-dashboard/overview
  Gibt Echtzeit-Übersicht zurück:
  {
    pool_status: {
      current_period: 'YYYY-MM',
      gross_revenue_mtd: X,      // month-to-date
      net_pool_mtd: X,
      projected_hourly_rate: X,  // wenn Monat so weiterläuft
    },
    coin_status: {
      total_coins_outstanding: N,
      total_eur_obligation: X,   // was wir schulden
      coin_reserve_balance: X,   // was wir haben
      solvency_ratio: X,         // ≥ 1.0 = solvent
      oldest_unredeemed_coin_period: 'YYYY-MM'
    },
    solidarity_fund: {
      balance_eur: X,
      health_status: 'grün'|'gelb'|'rot',
      open_requests: N,
      ytd_disbursed: X
    },
    reinvestition: {
      balance_eur: X,           // Rücklage
      monthly_fixed_costs: X,   // Fixkosten
      months_covered: N         // wie viele Monate können wir Fixkosten decken
    },
    tax_status: {
      next_deadline: { type, date, days_remaining },
      open_items: N
    },
    bank_accounts: [
      { name, iban_last4, balance_eur, last_synced }
    ]
  }

ROUTE: GET /financial-dashboard/cash-flow { period_id }
  Vollständiger Cashflow einer Periode:
  Einnahmen nach Kategorie (Balkendiagramm-Daten)
  Ausgaben nach Kategorie
  Pool-Dritteilung (Donut-Daten)
  Coin-Ausgaben dieser Periode (was wurde eingelöst)
  Netto-Cashflow

ROUTE: GET /financial-dashboard/member-economics { member_id }
  Individuelles Wirtschaftsbild eines Mitglieds:
  Stunden × Stundensatz = verdiente Coins (historisch)
  Coins eingelöst (Zeit-Tausch + Waren-EK)
  Coins ausgezahlt (in Euro)
  Coin-Saldo + EUR-Gegenwert
  Anteil am Gesamtpool (%)

FRONTEND: src/pages/admin/FinancialDashboard.tsx
  Nutzt alle obigen Routes.
  Primärfarbe #2a7cab. shadcn/ui Cards und Charts (recharts).
  Echtzeit-Aktualisierung via Supabase Realtime auf pool_periods und btb_coin_ledger.
  Mobile-responsive (Vorstand schaut oft vom Handy).
  Ampel-Widgets für: Solvenz, Solidarfonds, Steuerfrist, Guardian-Status.
```

---

## AGENT: financial-flow-report-generator

```
Du bist in ~/btb-app/. Erstelle den automatischen Finanzfluss-Bericht.
Monatlich nach Periodenabschluss: vollständiger Bericht für Vorstand und Mitglieder.

SCRIPT: scripts/documents/generate_financial_flow_report.py

DATEN-ABRUF:
  Via Supabase REST API (Service Role Key):
  - Pool-Periode des abgeschlossenen Monats
  - Alle Einnahmen nach Kategorie
  - Dritteilungs-Beträge
  - Coin-Bewegungen (neue Gutschriften, Einlösungen, Auszahlungen)
  - Solidarfonds-Bewegungen
  - Reinvestitions-Ausgaben
  - Aktuelle Solvenz-Kennzahlen

DOKUMENT-AUFBAU (python-docx, BtB-Design, #2a7cab Header):

Seite 1 — Zusammenfassung:
  BtB Logo + "Monatsbericht [Monat Jahr]"
  4 KPI-Kacheln (Tabelle 2×2):
    Gesamtpool | Stundensatz | Coins im Umlauf | Solidarfonds-Stand
  Ampel: Solvenz-Status, Nächste Steuerfrist

Seite 2 — Einnahmen:
  Tabelle: Zelle | Bruttoumsatz | Materialabzug | Nettobeitrag
  Summenzeile fett
  Balkendiagramm als eingebettetes PNG (matplotlib)

Seite 3 — Dritteilung:
  Donut-Chart: Vergütung / Reinvestition / Sozial (matplotlib, BtB-Farben)
  Tabelle: Anteil | Betrag | Verwendung
  Hinweis Aufbauphase wenn aktiv

Seite 4 — Coin-Übersicht:
  Neue Coins ausgegeben: N Coins = X€ Rücklage
  Coins eingelöst (Zeit-Tausch + Waren): M Coins
  Coins ausgezahlt (Euro): K Coins = Y€
  Netto-Veränderung Coin-Umlauf
  Solvenz-Nachweis: Rücklage X€ ≥ Verbindlichkeiten Y€ ✓

Seite 5 — Ausblick:
  Wenn Periode N fortschreibt: projizierter Stundensatz in 3/6/12 Monaten
  Wendepunkt-Prognose (wann erreichen wir 20€/h?)
  Offene Punkte für nächste GV

Bericht in Supabase Storage + E-Mail an Vorstand (PDF-Anhang).
Vereinfachte 1-Seiten-Version für alle Mitglieder (ohne Detail-Zahlen).
```

---

# SUPER-PROMPT: Finanzfluss komplett integrieren

```
Du bist in ~/btb-app/. Alle Finanzfluss-Module wurden einzeln erstellt.
Integriere sie jetzt zu einem kohärenten Gesamtsystem.

1. BUCHFÜHRUNGS-KONSISTENZ-CHECK:
   Prüfe ob alle Schreiboperationen auf btb_coin_ledger, pool_periods,
   solidarity_fund_balance und finapi_transactions atomar sind.
   Gibt es Stellen wo zwei Tabellen geändert werden ohne gemeinsame Transaktion?
   Wenn ja: in Supabase-Transaktionen (rpc-Funktionen) zusammenfassen.

2. DOPPELT-BUCHUNGS-PRINZIP:
   Jeder Finanzvorgang hat zwei Seiten.
   Erstelle eine financial_journal-Tabelle (Grundbuch):
     id, journal_date, description, debit_account, credit_account,
     amount_eur, source_type, source_id, period_id, session_id
   Jede Finanzfunktion schreibt zusätzlich ins Journal.
   Das Journal ist das Sicherheitsnetz: aus ihm kann alles rekonstruiert werden.

3. RECONCILIATION-CRON (täglich 03:00):
   Summiere financial_journal nach Konto.
   Vergleiche mit tatsächlichen Salden in den Haupttabellen.
   Differenz > 0.01€: Alert 'financial_reconciliation_mismatch'.
   Das ist der ultimative Konsistenz-Check.

4. GUARDIAN-FINANZ-ERWEITERUNG:
   Neue Fehlerklasse: 'finanz_inkonsistenz'
   Trigger: reconciliation_mismatch
   Reparatur: Journal vs. Haupttabellen abgleichen, Differenz isolieren
   Bypass: manuelles Abstimmungsprotokoll generieren für Steuerberater

5. AUDIT-TRAIL:
   Jede Änderung an finanziell relevanten Tabellen wird in financial_audit_log geschrieben:
   table_name, record_id, operation (INSERT/UPDATE), old_values, new_values,
   changed_by, changed_at, agent_session_id
   NIEMALS löschen. NIEMALS ändern. Append-only.

6. ABSCHLUSS-TEST:
   Simuliere einen kompletten Monatszyklus im Dry-Run:
   → 3 Rechnungen erstellen und bezahlen
   → Pool berechnen (Dry-Run)
   → Coins gutschreiben (Dry-Run)
   → Zeit-Tausch durchführen (Dry-Run)
   → Waren-EK (Dry-Run)
   → Auszahlung (Dry-Run)
   → DATEV-Export (Dry-Run)
   → Solvenz-Check
   Zeige mir das Ergebnis jedes Schritts.
```

---

## REIHENFOLGE DER IMPLEMENTIERUNG

```bash
# FINANZFLUSS — EMPFOHLENE REIHENFOLGE:

# 1. Fundament
claude  # → temporal-context-module (falls nicht vorhanden)
claude  # → coin-solvency-monitor (Sicherheitsnetz zuerst)

# 2. Einnahmen
claude  # → invoice-lifecycle-manager
claude  # → finapi-bridge
claude  # → revenue-attribution

# 3. Kern-Prozess
claude  # → period-close-orchestrator
claude  # → coin-transaction-engine

# 4. Buchhaltung
claude  # → datev-exporter
claude  # → tax-compliance-monitor

# 5. Solidarfonds
claude  # → solidarity-fund-complete

# 6. Reporting
claude  # → financial-dashboard-data
claude  # → financial-flow-report-generator

# 7. Integration
claude  # → Super-Prompt Finanzfluss

# VOR JEDEM SCHRITT:
git add -A && git commit -m "finanzfluss: checkpoint vor [modul]"

# NACH JEDEM SCHRITT:
# Dry-Run testen
# Solvenz-Check ausführen
# Erst dann weiter
```

---

*Back to Balance eG — Jeder Cent hat einen Namen. Jeder Coin hat eine Geschichte.*
*Finanzfluss-Automatisierung v1.0 | Stand: 2026*
