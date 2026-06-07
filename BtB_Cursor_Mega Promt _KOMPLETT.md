# Back to Balance – Lovable Mega-Prompt KOMPLETT (Struktur)
**Alle 4 Abschnitte vereint. Reihenfolge einhalten: erst Abschnitt 1 abschließen, dann 2, dann 3, dann 4.**

---

# ABSCHNITT 1 – Universum-Grundstruktur

Ich erweitere die bestehende Back to Balance Office App um ein Genossenschaftsverwaltungssystem (Back to Balance eG). Die App existiert bereits mit einem SaaS-Kern (Kunden, Termine, Rechnungen, DATEV). Jetzt kommt das Universum-Modul hinzu.

---

## Technischer Kontext (unveränderlich)

```
Stack: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
Backend: Supabase (Auth, Postgres, Edge Functions, Storage)
Supabase Project: xcngmshjuqoucdlgikao
Routing: React Router v6 → src/components/AppWrapper.tsx
Auth-Hook: useAuth() aus src/contexts/auth/SupabaseAuthProvider.tsx
Supabase Client: src/integrations/supabase/client.ts
Sidebar: src/components/AppSidebar.tsx
Neue Seiten: src/pages/universum/
Neue Hooks: src/hooks/universum/
Alle neuen Tabellen brauchen RLS-Policies.
```

---

## Design-System (unveränderlich)

**Logo:**
- Das BtB-Logo (PNG mit transparentem Hintergrund) soll beim ersten Setup vom Nutzer angefordert werden
- Frage: "Bitte lade das Back to Balance Logo hoch (PNG mit transparentem Hintergrund)"
- Das Logo erscheint in der Sidebar oben, im Login-Screen, und im App-Header
- Größe: 40×40px in der Sidebar, 80×80px im Login-Screen
- Kein weißer Rahmen, kein Schatten – direkt auf dem Hintergrund #f0e9b6

**Logo:**
- Das BtB-Logo (PNG mit transparentem Hintergrund) muss vom Nutzer als Datei bereitgestellt werden.
- Bitte beim Start fragen: „Bitte lade die BtB-Logo-Datei hoch (PNG, transparenter Hintergrund)."
- Das Logo erscheint in der App-Sidebar oben, auf dem Login-Screen, und in allen Modulköpfen.
- Größe Sidebar: 40×40px. Login-Screen: 120×120px. Modulkopf: 32×32px.
- Das Logo ist nicht durch den Nutzer austauschbar – es ist Teil der Systemidentität.

**Offizielle BtB-Markenfarben (Quelle: btb_color_palette.pdf – nicht überschreibbar):**

```
H1 (Überschrift 1)          #b61818   – Rot
H2 (Überschrift 2)          #8fa942   – Olivgrün
Hintergrund                 #f0e9b6   – Cremeweiß
Elemente (Buttons/Tabellen) #2a7cab   – Blau
```

Diese vier Farben sind die Design-Tokens des Systems. Sie werden als CSS-Variablen definiert und sind im gesamten System nicht überschreibbar:

```css
:root {
  --btb-h1:         #b61818;   /* Rot – Hauptüberschriften */
  --btb-h2:         #8fa942;   /* Olivgrün – Unterüberschriften */
  --btb-bg:         #f0e9b6;   /* Cremeweiß – Hintergrund */
  --btb-element:    #2a7cab;   /* Blau – Buttons, Tabellen, Akzente */
}
```

- **Sidebar:** Hintergrund `#f0e9b6`, Border: `#d4c580`
- **Universum-Akzent:** `#4a9b8f` → alle Universum-Seiten: `border-top: 3px solid #4a9b8f`
- **Wissens-Akzent:** `#c17f3a` → alle Wissens-Seiten: `border-top: 3px solid #c17f3a`
- **Komponenten:** shadcn/ui
- **BtB-Coins:** immer mit `◈` Symbol vorangestellt
- **Kein Farbpicker, keine Themes, keine Abweichungen** – jedes Modul erbt diese Tokens automatisch

---

## Einstellungen-System (universe_settings)

**Alle konfigurierbaren Werte werden in einer zentralen Tabelle gespeichert und sind über die Admin-Einstellungsseite änderbar. Keine Werte dürfen im Code hardcodiert sein.**

```sql
CREATE TABLE universe_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  value_type TEXT DEFAULT 'text'
    CHECK (value_type IN ('text','number','percent','eur','boolean','json')),
  category TEXT NOT NULL,
  is_editable BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES universe_members(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Schlüssel nach Kategorie (Werte werden vom Admin beim ersten Setup eingetragen):**

```
Kategorie: vergütung
  hourly_rate_target_eur        – Ziel-Netto-Stundensatz (€)
  hourly_rate_current_eur       – Aktuell beschlossener Stundensatz (€)
  coin_to_eur_rate              – Aktueller Coin-Umrechnungswert (€)

Kategorie: pool
  pool_share_reinvestment_pct   – Poolanteil Reinvestition (%)
  pool_share_compensation_pct   – Poolanteil Vergütung (%)
  pool_share_social_eco_pct     – Poolanteil Sozial/Öko (%)
  material_cost_deduction_pct   – Materialkosten-Abzug vom Bruttoumsatz (%)

Kategorie: solidarfonds
  solidarity_fund_contribution_pct   – Beitragssatz pro Mitglied (%)
  solidarity_fund_reduced_pct        – Reduzierter Beitragssatz (%)
  solidarity_fund_upper_threshold    – Monatsvielfaches für reduzierten Satz
  solidarity_fund_lower_threshold    – Monatsvielfaches für GV-Entscheidung
  rhythm_days_max_per_month          – Max. Rhythmustage pro Monat
  rhythm_hours_per_day               – Vergütete Stunden pro Rhythmustag
  capacity_days_max_per_month        – Max. Kapazitätstage (chronische Erkrankung)
  regen_days_per_month               – Regenerationstage für alle Mitglieder
  parental_phase1_months             – Elternzeit Phase 1 (Monate)
  parental_phase1_pct                – Vergütungsprozent Phase 1
  parental_phase2_months             – Elternzeit Phase 2 (Monate)
  parental_phase2_pct                – Vergütungsprozent Phase 2
  parental_phase3_months             – Elternzeit Phase 3 (Monate)
  parental_phase3_pct                – Vergütungsprozent Phase 3
  parental_secondary_pct             – Vergütung sekundäre Bezugsperson (%)
  parental_secondary_max_months      – Max. Monate sekundäre Bezugsperson
  pregnancy_phase2_extra_hours       – Zusatzstunden/Monat 2. Trimenon
  pregnancy_phase3_extra_hours       – Zusatzstunden/Monat 3. Trimenon

Kategorie: mitgliedschaft
  supporter_discount_pct             – Rabatt für Unterstützer (%)
  supporter_donation_threshold_eur   – Mindestspende/Jahr für Rabatt (€)
  member_target_count                – Ziel-Mitgliederzahl
  fixed_costs_eur_per_month          – Fixkosten Genossenschaft/Monat (€)

Kategorie: governance
  exclusion_majority_pct             – Mehrheit für Ausschluss (%)
  supermajority_pct                  – Supermehrheit für Beschlüsse (%)
  knowledge_min_entries_for_contribution – Mind. verifizierte Einträge für Wissens-Einlage
```

### Hook: `src/hooks/universum/useSettings.ts`
- `getSetting(key)` → gibt `value` als korrekten Typ zurück
- `updateSetting(key, value)` → nur Admin
- `useSettings(category?)` → alle Einstellungen einer Kategorie (gecacht via TanStack Query)

---

## Datenbank-Tabellen

```sql
CREATE TABLE universe_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  location TEXT,
  description TEXT,
  founded_at DATE,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('forming','active','paused','dissolved')),
  admin_member_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE universe_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  cell_id UUID REFERENCES universe_cells(id),
  display_name TEXT NOT NULL,
  member_type TEXT DEFAULT 'unterstuetzer'
    CHECK (member_type IN ('unterstuetzer','anwaerter','vollmitglied')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  capacity_agreement TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE universe_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES universe_members(id),
  cell_id UUID REFERENCES universe_cells(id),
  contribution_type TEXT NOT NULL
    CHECK (contribution_type IN ('hours','capital','material','knowledge','other')),
  amount NUMERIC(10,2),
  unit TEXT DEFAULT 'hours',
  description TEXT,
  contributed_at TIMESTAMPTZ DEFAULT now(),
  approved_by UUID REFERENCES universe_members(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE universe_time_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#4a9b8f',
  icon TEXT,
  counts_for_coins BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE universe_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES universe_members(id),
  cell_id UUID REFERENCES universe_cells(id),
  category_id UUID REFERENCES universe_time_categories(id),
  description TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  coins_earned NUMERIC(10,2),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('running','pending','approved','rejected')),
  approved_by UUID REFERENCES universe_members(id),
  approved_at TIMESTAMPTZ,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE universe_btb_coin_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES universe_members(id),
  cell_id UUID REFERENCES universe_cells(id),
  transaction_type TEXT NOT NULL
    CHECK (transaction_type IN (
      'earn_hours','spend_internal','period_settlement',
      'solidarity_fund','correction','payout_eur'
    )),
  coins NUMERIC(10,4) NOT NULL,
  eur_rate_at_creation NUMERIC(10,4) NOT NULL,
  -- Historischer Abrechnungswert: der Coin-zu-Euro-Kurs der Periode in der der Coin entstand.
  -- Dieser Wert bleibt unveränderlich. Bei Euro-Auszahlung wird DIESER Wert verwendet,
  -- nicht der aktuelle Kurs. Verhindert Spekulation durch Horten.
  -- Beispiel: Coin verdient in Periode 3 bei 14 €/h → eur_rate_at_creation = 14.00
  -- Auch wenn Stundensatz in Periode 8 bei 20 €/h liegt: Auszahlung = coins × 14.00
  eur_equivalent NUMERIC(10,2) GENERATED ALWAYS AS (coins * eur_rate_at_creation) STORED,
  -- Berechneter Eurowert auf Basis des historischen Kurses
  description TEXT,
  time_entry_id UUID REFERENCES universe_time_entries(id),
  period_id UUID,
  created_by UUID REFERENCES universe_members(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE universe_revenue_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID,
  cell_id UUID REFERENCES universe_cells(id),
  member_id UUID REFERENCES universe_members(id),
  gross_revenue_eur NUMERIC(12,2) DEFAULT 0,
  material_costs_eur NUMERIC(12,2) DEFAULT 0,
  net_pool_eur NUMERIC(12,2) DEFAULT 0,
  reinvestment_eur NUMERIC(12,2) DEFAULT 0,
  compensation_eur NUMERIC(12,2) DEFAULT 0,
  social_eco_eur NUMERIC(12,2) DEFAULT 0,
  total_hours NUMERIC(10,2) DEFAULT 0,
  hourly_rate_eur NUMERIC(10,2) DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE universe_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID REFERENCES universe_cells(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open','calculating','closed','archived')),
  hourly_rate_eur NUMERIC(10,2),
  total_pool_eur NUMERIC(12,2),
  reinvestment_eur NUMERIC(12,2),
  compensation_eur NUMERIC(12,2),
  social_eco_eur NUMERIC(12,2),
  total_hours NUMERIC(10,2),
  member_count INTEGER,
  closed_by UUID REFERENCES universe_members(id),
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE universe_internal_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_member_id UUID REFERENCES universe_members(id),
  to_member_id UUID REFERENCES universe_members(id),
  -- Empfänger: nur bei invoice_type='service' gesetzt (Coins gehen direkt ans Mitglied)
  -- Bei invoice_type='product': NULL – Coins gehen zurück in Reinvestitionsanteil der Zelle
  cell_id UUID REFERENCES universe_cells(id),
  period_id UUID REFERENCES universe_periods(id),
  invoice_type TEXT NOT NULL DEFAULT 'service'
    CHECK (invoice_type IN ('service','product')),
  -- service: Coins → to_member_id (Vergütung für geleistete Arbeit)
  -- product: Coins → Reinvestitionsanteil der Zelle (Rückerstattung Materialkosten)
  --          Bauer wurde bereits durch Pool vergütet – keine Doppelzahlung
  service_description TEXT NOT NULL,
  quantity NUMERIC(10,3),
  unit TEXT,
  unit_price_coins NUMERIC(10,4),
  total_coins NUMERIC(10,4),
  harvest_charge_id UUID REFERENCES universe_harvest_charges(id),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','settled','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);
-- BUCHUNGSLOGIK bei status → 'settled':
-- service: total_coins vom Käufer abziehen, to_member_id gutschreiben
-- product: total_coins vom Käufer abziehen, Reinvestitionskonto der Zelle gutschreiben

-- Abstimmungsebenen im System:
-- cell:        Zelleninterne Angelegenheiten (Ausschlüsse, lokale Projekte, Tagesgeschäft)
-- cell_group:  Zellenzusammenschluss – nur beteiligte Zellen stimmen ab (gemeinsame Projekte)
-- general:     Generalversammlung – alle Zellen, übergeordnete Beschlüsse
--              (Stundensatz, Satzungsänderungen, Auflösung, neue Mitglieder-Policies)

CREATE TABLE universe_cell_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  -- Projektname oder Zusammenschlussname
  cell_ids UUID[] NOT NULL,
  -- Array der beteiligten Zell-IDs
  created_by UUID REFERENCES universe_members(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Ermöglicht Zellenzusammenschlüsse für gemeinsame Projekte
-- Abstimmungen dieses Zusammenschlusses sind nur für Mitglieder der beteiligten Zellen sichtbar

CREATE TABLE universe_voting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL DEFAULT 'cell'
    CHECK (scope IN ('cell','cell_group','general')),
  -- Abstimmungsebene: Zelle / Zellenzusammenschluss / Generalversammlung
  cell_id UUID REFERENCES universe_cells(id),
  -- gesetzt wenn scope = 'cell'
  cell_group_id UUID REFERENCES universe_cell_groups(id),
  -- gesetzt wenn scope = 'cell_group' – nur Mitglieder der beteiligten Zellen dürfen abstimmen
  title TEXT NOT NULL,
  description TEXT,
  voting_type TEXT DEFAULT 'simple_majority'
    CHECK (voting_type IN ('simple_majority','supermajority','unanimous','advisory')),
  required_majority_pct NUMERIC(5,2),
  options JSONB DEFAULT '["Ja","Nein","Enthaltung"]',
  status TEXT DEFAULT 'open'
    CHECK (status IN ('draft','open','closed','cancelled')),
  opens_at TIMESTAMPTZ DEFAULT now(),
  closes_at TIMESTAMPTZ,
  created_by UUID REFERENCES universe_members(id),
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Zuständigkeiten nach scope:
-- cell:        Ausschlüsse, lokale Regeln, Zellenbudget, interne Projekte
-- cell_group:  Gemeinsame Investitionen, geteilte Räume, zellenübergreifende Projekte
-- general:     Stundensatz, Satzung, Auflösung, systemweite Policies, neue Zell-Aufnahmen

CREATE TABLE universe_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voting_id UUID REFERENCES universe_voting(id),
  member_id UUID REFERENCES universe_members(id),
  option_chosen TEXT NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(voting_id, member_id)
);
```

---

## Neue Seiten – src/pages/universum/

### /universum → UniversumDashboard
- **4 Kacheln:** Aktive Mitglieder / Pool diese Periode / ◈ Coins im Umlauf / Offene Abstimmungen
- **Pool-Donut-Chart** (Recharts): Anteile aus `universe_settings` (pool_share_*)
- **Stundensatz-Anzeige:** Wert aus `universe_settings.hourly_rate_current_eur`
- **Fortschrittsbalken:** aktuelle Mitgliederzahl vs. `universe_settings.member_target_count`
- Letzte genehmigte Zeiteinträge, offene Zeiteinträge (Admin)

### /universum/mitglieder → MitgliederPage
- Tabs: Alle / Vollmitglieder / Anwärter / Unterstützer
- Tabelle: Name, Zelle, Typ-Badge, Beitrittsdatum, Coins-Kontostand, Letzte Aktivität
- Detailseite `/universum/mitglieder/:id` → Tabs: Stunden / Coins / Beiträge / Spenden

### /universum/stunden → StundenPage
- **Timer:** Start/Stop mit Kategorie-Auswahl, Live-Anzeige
- **Meine Einträge:** Datum, Kategorie, Dauer, Status, Coins
- **Admin-Tab:** alle offenen Einträge → Genehmigen / Ablehnen

### /universum/wallet → WalletPage
- **Coin-Kontostand** `◈ X.XX` groß – Gesamtsumme aller Coins
- **Euro-Gegenwert** – berechnet aus historischen Kursen: Summe aller (coins × eur_rate_at_creation) aus dem Ledger. NICHT aus aktuellem `coin_to_eur_rate` – das wäre Spekulation.
- **Aufschlüsselung nach Perioden** (ausklappbar):
  - Zeigt wie sich die Coins zusammensetzen: z.B. „◈ 12 aus Periode 3 · 14,00 €/Coin = 168 €"
  - Prinzip: 1 Coin = 1 Stunde (intern immer gleich), aber der Euro-Gegenwert ist historisch fixiert
  - Tooltip/Info: „Coins behalten den Wert der Periode in der du sie verdient hast. Das verhindert Spekulation und ist fair gegenüber allen Mitgliedern."
- **Transaktionsliste** chronologisch – mit Coin-Betrag, Typ, Datum, eur_rate_at_creation
- **Auszahlungsantrag** → Modal zeigt: welche Coins werden ausgezahlt (FIFO – älteste zuerst), zu welchem historischen Kurs, Gesamtbetrag in Euro → Admin-Genehmigung
- **Bürgergeld-Hinweis** (Info-Box, nicht prominent): „Solange du keine Euro-Auszahlung beantragst, entsteht kein anrechenbares Einkommen. Deine Coins sammeln sich intern an und können jederzeit für interne Leistungen genutzt werden."

### /universum/zellen → ZellenPage
- Grid aus Zellen-Karten: Name, Ort, Status, Mitglieder, Gründungsdatum
- Zell-Detailseite
- Admin: Neue Zelle anlegen

### /universum/intern → InternePage (interner Marktplatz)
- Interne Leistungsangebote zum EK-Preis in Coins
- Leistung buchen → `universe_internal_invoice`
- Eigene Angebote verwalten

### /universum/abstimmung → AbstimmungPage

**Drei Tabs nach Abstimmungsebene:**
- **Meine Zelle** (`scope = 'cell'`) – Zelleninterne Abstimmungen. Nur Mitglieder dieser Zelle sehen und stimmen ab. Themen: Ausschlüsse, lokale Projekte, Zellenregeln, Budget.
- **Projekte** (`scope = 'cell_group'`) – Abstimmungen von Zellenzusammenschlüssen. Nur Mitglieder der beteiligten Zellen sehen und stimmen ab. Themen: gemeinsame Investitionen, geteilte Räume, zellenübergreifende Vorhaben.
- **Generalversammlung** (`scope = 'general'`) – Alle Zellen, alle Mitglieder. Themen: Stundensatz, Satzungsänderungen, Auflösung, systemweite Policies.

**Je Tab:**
- Offene Abstimmungen: Titel, Scope-Badge, Typ-Badge, Enddatum, Teilnahme-Fortschritt
- Abstimmen → Zwischenergebnis sichtbar nach eigenem Vote
- Vergangene Abstimmungen mit Ergebnis und Protokoll

**Admin/Zellenleitung:**
- Neue Abstimmung anlegen: Scope wählen → bei cell_group: Zusammenschluss auswählen oder neu anlegen (cell_ids definieren) → Typ wählt `required_majority_pct` automatisch aus Settings
- Abstimmung schließen und Ergebnis protokollieren

### /universum/pool → PoolPage (nur Admin)
- Periodenübersicht-Tabelle
- Aktuelle Periode: Echtzeit-Poolsumme, Dritteilungs-Vorschau (Anteile aus Settings)
- Stundensatz-Simulation
- **Coin-Verbindlichkeiten-Anzeige** (immer sichtbar, prominent):
  - `Gebundene Coin-Rücklage: X.XXX €` – Summe aller ausstehenden Coins × historischer Eurowert
  - `Freies Kapital: X.XXX €` – Pool minus gebundene Rücklage
  - Info: „Nicht abgerufene Coins sind Verbindlichkeiten der Genossenschaft. Nur das freie Kapital darf verteilt oder reinvestiert werden."
- **Periode abschließen** (Schritt-für-Schritt):
  1. Pool bestätigen
  2. Dritteilung berechnen (Anteile aus Settings)
  3. Stundensatz beschließen → in Settings speichern
  4. Coins gutschreiben (bulk-insert Ledger) → Coin-Verbindlichkeiten steigen entsprechend
  5. Periode schließen

### /universum/einstellungen → EinstellungenPage (nur Admin)
Alle `universe_settings` nach Kategorie gruppiert, editierbar:
- **Vergütung:** Stundensatz-Ziel, aktueller Satz, Coin-Kurs
- **Pool:** Dritteilungs-Anteile (müssen zusammen 100 % ergeben – Validierung!), Materialkostenabzug
- **Solidarfonds:** Beitragssatz, reduzierter Satz, Schwellen, Rhythmustage-Regeln, Elternzeit-Staffeln, Schwangerschafts-Zusatzstunden
- **Mitgliedschaft:** Unterstützer-Rabatt und Spende-Schwelle, Ziel-Mitgliederzahl, Fixkosten
- **Governance:** Mehrheitsschwellen

### /universum/steuer → SteuerPage (nur Admin)
- DATEV-Export aller Universum-Transaktionen einer Periode
- Solidarfonds-Übersicht: Monatsstand, laufende Ansprüche, aktueller Beitragssatz
- Fondsstand-Ampel (Schwellen aus Settings)

---

## Hooks – src/hooks/universum/

- `useSettings.ts`
- `useCells.ts`
- `useUniverseMembers.ts`
- `useTimeEntries.ts`
- `useBtbCoinLedger.ts`
- `useRevenuePool.ts`
- `usePeriods.ts`
- `useInternalInvoices.ts`
- `useVoting.ts`

---

## Navigation – AppSidebar.tsx

```
◎ Universum  (Akzent #4a9b8f, border-top 3px)
├── Dashboard           /universum
├── Mitglieder          /universum/mitglieder
├── Stunden & Timer     /universum/stunden
├── Mein Wallet         /universum/wallet
├── Zellen              /universum/zellen
├── Intern              /universum/intern
├── Abstimmung          /universum/abstimmung
└── [Admin:]
    ├── Pool            /universum/pool
    ├── Einstellungen   /universum/einstellungen
    └── Steuer/DATEV    /universum/steuer
```

---

---

# ABSCHNITT 2 – Betriebsmodule, Unterstützer-Rabatt, Lager & Dokumentation

**Erst Abschnitt 1 vollständig abgeschlossen.**

---

## 1. Unterstützer-Rabatt-System

**Alle Werte (Rabattsatz, Spende-Schwelle) kommen aus `universe_settings` – niemals hardcoded.**

```sql
CREATE TABLE universe_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES universe_members(id),
  amount_eur NUMERIC(10,2) NOT NULL,
  donated_at TIMESTAMPTZ DEFAULT now(),
  calendar_year INTEGER NOT NULL,
  payment_reference TEXT,
  confirmed BOOLEAN DEFAULT false,
  confirmed_by UUID REFERENCES universe_members(id),
  note TEXT
);

CREATE TABLE universe_discount_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES universe_members(id),
  calendar_year INTEGER NOT NULL,
  total_donated_eur NUMERIC(10,2) DEFAULT 0,
  discount_active BOOLEAN DEFAULT false,
  discount_pct NUMERIC(5,2),
  threshold_reached_at TIMESTAMPTZ,
  UNIQUE(member_id, calendar_year)
);
```

**Trigger-Logik:**
Wenn Spende bestätigt (`confirmed = true`):
- Summiere confirmed-Spenden des Mitglieds für das Kalenderjahr
- Wenn Summe ≥ `universe_settings.supporter_donation_threshold_eur` → `discount_active = true`, `discount_pct` aus `universe_settings.supporter_discount_pct`

**Seite:** Tab „Spenden" unter `/universum/mitglieder/:id`
- Spendenliste, Datum, Betrag, Status
- Fortschrittsbalken: X € von [Schwelle aus Settings] €
- Admin: Spende bestätigen

**Integration Rechnungssystem:**
- Hinweis bei aktivem Rabatt, „Rabatt anwenden"-Button, eigene Rechnungsposition

**Hook:** `src/hooks/universum/useDiscountStatus.ts`

---

## 2. Betriebsmodul: Körperarbeit / Manufit-Praxis

### Seite: /betrieb/koerperarbeit

Sidebar unter **„Mein Betrieb"** – bedingt sichtbar (nur wenn Mitglied Betrieb Typ `koerperarbeit` zugeordnet).

```sql
CREATE TABLE treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  cell_id UUID REFERENCES universe_cells(id),
  created_by UUID REFERENCES universe_members(id),
  title TEXT NOT NULL,
  diagnosis_notes TEXT,
  goal TEXT,
  sessions_planned INTEGER,
  sessions_done INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','paused','completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE treatment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES treatment_plans(id),
  customer_id UUID REFERENCES customers(id),
  practitioner_id UUID REFERENCES universe_members(id),
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  findings TEXT,
  treatment_done TEXT,
  response TEXT,
  next_steps TEXT,
  photos JSONB DEFAULT '[]',
  time_entry_id UUID REFERENCES universe_time_entries(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Tab „Behandlungspläne":**
- Liste mit Kunde, Status, Fortschrittsbalken (X/Y Sitzungen)
- Plandetail: alle Sitzungen chronologisch
- „Neue Sitzung" → Modal → **automatischer Zeiteintrag** Kategorie `koerperarbeit`
- Fotos: Storage Bucket `treatment-photos` (privat)

**Tab „Klientenkartei":**
- `customers` gefiltert auf diesen Betrieb
- Schnellzugriff: Neuer Plan / Neue Sitzung / Termin buchen

---

## 3. Betriebsmodul: Lebensmittel / Hofladen

### Seite: /betrieb/hofladen

```sql
CREATE TABLE inventory_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID REFERENCES universe_cells(id),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  is_organic_certified BOOLEAN DEFAULT false,
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID REFERENCES universe_cells(id),
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  unit TEXT DEFAULT 'Stück',
  current_stock NUMERIC(10,3) DEFAULT 0,
  min_stock NUMERIC(10,3) DEFAULT 0,
  max_stock NUMERIC(10,3),
  price_purchase_eur NUMERIC(10,2),
  price_sale_eur NUMERIC(10,2),
  price_internal_coins NUMERIC(10,2),
  supplier_id UUID REFERENCES inventory_suppliers(id),
  is_organic BOOLEAN DEFAULT false,
  is_own_production BOOLEAN DEFAULT false,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES inventory_items(id),
  cell_id UUID REFERENCES universe_cells(id),
  movement_type TEXT NOT NULL
    CHECK (movement_type IN (
      'purchase','sale_external','sale_internal',
      'production','waste','correction'
    )),
  quantity NUMERIC(10,3) NOT NULL,
  unit_price_eur NUMERIC(10,2),
  total_eur NUMERIC(10,2),
  reference_id UUID,
  performed_by UUID REFERENCES universe_members(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inventory_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID REFERENCES universe_cells(id),
  supplier_id UUID REFERENCES inventory_suppliers(id),
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','sent','confirmed','delivered','cancelled')),
  order_date DATE,
  expected_delivery DATE,
  delivered_at TIMESTAMPTZ,
  total_eur NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inventory_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES inventory_orders(id),
  item_id UUID REFERENCES inventory_items(id),
  quantity NUMERIC(10,3) NOT NULL,
  unit_price_eur NUMERIC(10,2),
  total_eur NUMERIC(10,2),
  delivered_quantity NUMERIC(10,3)
);
```

**Tab „Lager":** Bestandsampel (Farbe nach Verhältnis `current_stock` / `min_stock`), Meldebestand-Alert
**Tab „Bestellungen":** Status-Badge, Versand via `send-brevo-email`, Lieferung bucht Bestand automatisch
**Tab „Lieferanten":** CRUD, Bestellhistorie
**Tab „Preise":** EK / VK / interner Coin-Preis nebeneinander

---

## 4. Foto-Dokumentation (betriebsübergreifend)

### Seite: /betrieb/dokumentation

```sql
CREATE TABLE documentation_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID REFERENCES universe_cells(id),
  created_by UUID REFERENCES universe_members(id),
  title TEXT NOT NULL,
  project_type TEXT DEFAULT 'general'
    CHECK (project_type IN ('general','construction','handwerk','aufbau','other')),
  description TEXT,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','completed','archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE documentation_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES documentation_projects(id),
  cell_id UUID REFERENCES universe_cells(id),
  created_by UUID REFERENCES universe_members(id),
  entry_date TIMESTAMPTZ DEFAULT now(),
  title TEXT,
  description TEXT,
  photos JSONB DEFAULT '[]',
  location TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);
```

- Grid aus Projekt-Karten mit Foto-Vorschau
- Timeline aller Einträge chronologisch
- Foto-Upload: Drag & Drop, Bildunterschrift, Storage Bucket `documentation` (privat)
- Druckansicht pro Eintrag

---

## 5. Storage Buckets (alle privat)
- `treatment-photos`
- `documentation`
- `inventory-photos`

---

## 6. Hooks
- `src/hooks/betrieb/useTreatmentPlans.ts`
- `src/hooks/betrieb/useInventory.ts`
- `src/hooks/betrieb/useOrders.ts`
- `src/hooks/betrieb/useSuppliers.ts`
- `src/hooks/betrieb/useDocumentation.ts`
- `src/hooks/universum/useDiscountStatus.ts`

---

## 7. Navigation – bedingter Bereich „Mein Betrieb"

```
Mein Betrieb  (nur wenn Mitglied einem Betrieb zugeordnet)
├── Übersicht              /betrieb
├── [wenn koerperarbeit:]
│   └── Behandlungen       /betrieb/koerperarbeit
├── [wenn lebensmittel:]
│   ├── Lager              /betrieb/hofladen
│   ├── Bestellungen       /betrieb/hofladen/bestellungen
│   └── Lieferanten        /betrieb/hofladen/lieferanten
└── Dokumentation          /betrieb/dokumentation
```

---

---

# ABSCHNITT 3 – Partnerverzeichnis & kollektive Beschaffung

**Aufbauend auf Abschnitt 1 + 2.**

---

## Kerngedanke

Das Universum koordiniert seine kollektive Kaufkraft. Bevorzugte Partner werden im System hinterlegt. Mitglieder melden Bedarf an – sobald eine frei konfigurierbare Mindestmenge erreicht ist, wird ein Mengenrabatt ausgelöst.

```sql
CREATE TABLE preferred_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  category TEXT NOT NULL
    CHECK (category IN (
      'elektronik','lebensmittel','textil','energie','mobilitaet',
      'baumaterial','buero','gesundheit','bildung','sonstiges'
    )),
  description TEXT,
  why_preferred TEXT,
  sustainability_notes TEXT,
  contact_email TEXT,
  contact_name TEXT,
  has_volume_discount BOOLEAN DEFAULT false,
  volume_discount_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  added_by UUID REFERENCES universe_members(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE procurement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES preferred_partners(id),
  initiated_by UUID REFERENCES universe_members(id),
  initiating_cell_id UUID REFERENCES universe_cells(id),
  title TEXT NOT NULL,
  description TEXT,
  product_name TEXT,
  unit_price_estimate_eur NUMERIC(10,2),
  status TEXT DEFAULT 'collecting'
    CHECK (status IN (
      'collecting','threshold_reached','ordered','delivered','cancelled'
    )),
  min_quantity_for_discount INTEGER,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE procurement_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES procurement_requests(id),
  cell_id UUID REFERENCES universe_cells(id),
  member_id UUID REFERENCES universe_members(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT DEFAULT 'committed'
    CHECK (status IN ('committed','cancelled','delivered')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Seiten

### /universum/partner → PartnersPage
- Kategorie-Filter, Partner-Grid (Karten mit Mengenrabatt-Badge)
- Button „Gemeinsam bestellen" → Beschaffungsanfragen für diesen Partner
- Admin: „Partner hinzufügen"

### /universum/beschaffung → ProcurementPage
- **Tab „Laufende Sammelbestellungen":** Fortschrittsbalken X von Y (`min_quantity_for_discount`)
- **Tab „Meine Bestellungen"**
- **Tab „Neue Sammelbestellung starten":** Formular (Partner, Produkt, Preis, Mindestmenge, Schließdatum)

### /universum/partner/neu (Admin only)

---

## Hook: `src/hooks/universum/useProcurement.ts`
- `usePreferredPartners(category?)`
- `useProcurementRequests()`
- `useMyCommitments(memberId)`
- `addCommitment(requestId, quantity)`
- `createRequest(data)`
- `checkThreshold(requestId)` → Status-Update wenn Mindestmenge erreicht → Benachrichtigung

---

## Navigation – Ergänzung unter „Universum"

```
├── Partner & Beschaffung   /universum/partner
└── Sammelbestellungen      /universum/beschaffung
```

---

## Geschäftslogik

1. Keine Exklusivpflicht – das System empfiehlt, erzwingt nicht
2. Commitment = Absichtserklärung
3. Verbindlich erst wenn Admin `status = 'ordered'` setzt
4. Schwelle erreicht → Status `threshold_reached` → alle Beteiligten benachrichtigen

---

---

# ABSCHNITT 4 – Wissensdatenbank & Baustein-System

**Aufbauend auf Abschnitt 1–3. Kann parallel gebaut werden.**

---

## Kerngedanke

Jede Rezeptur, Vorlage, Methode die einmal dokumentiert wurde, steht allen Mitgliedern zur Verfügung. Ein **Baustein** ist die kleinste Wissenseinheit. Mehrere Bausteine bilden ein **Modul**.

---

## Datenbank-Tabellen

```sql
CREATE TABLE knowledge_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  color TEXT DEFAULT '#4a9b8f',
  parent_id UUID REFERENCES knowledge_categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE knowledge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES knowledge_categories(id),
  created_by UUID REFERENCES universe_members(id),
  cell_id UUID REFERENCES universe_cells(id),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  difficulty TEXT DEFAULT 'einfach'
    CHECK (difficulty IN ('einfach','mittel','anspruchsvoll')),
  time_minutes INTEGER,
  yield_amount NUMERIC(10,2),
  yield_unit TEXT,
  tags TEXT[],
  cover_photo_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES universe_members(id),
  view_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','review','published','archived')),
  cost_self_eur NUMERIC(10,2),
  cost_market_eur NUMERIC(10,2),
  cost_note TEXT,
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('german',
      coalesce(title,'') || ' ' || coalesce(subtitle,'') || ' ' ||
      coalesce(description,'') || ' ' || coalesce(array_to_string(tags,' '),'')
    )
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX knowledge_search_idx ON knowledge_entries USING GIN(search_vector);

CREATE TABLE knowledge_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(10,3) NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  is_optional BOOLEAN DEFAULT false,
  inventory_item_id UUID REFERENCES inventory_items(id),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE knowledge_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT,
  description TEXT NOT NULL,
  photo_url TEXT,
  duration_minutes INTEGER,
  tip TEXT
);

CREATE TABLE knowledge_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  changes TEXT
);

CREATE TABLE knowledge_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES knowledge_entries(id),
  member_id UUID REFERENCES universe_members(id),
  cell_id UUID REFERENCES universe_cells(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  photos JSONB DEFAULT '[]',
  tip TEXT,
  made_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE knowledge_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_business_type TEXT,
  cover_photo_url TEXT,
  created_by UUID REFERENCES universe_members(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE knowledge_module_entries (
  module_id UUID REFERENCES knowledge_modules(id),
  entry_id UUID REFERENCES knowledge_entries(id),
  sort_order INTEGER DEFAULT 0,
  why_included TEXT,
  PRIMARY KEY (module_id, entry_id)
);

CREATE TABLE knowledge_savings_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES knowledge_entries(id),
  member_id UUID REFERENCES universe_members(id),
  cell_id UUID REFERENCES universe_cells(id),
  quantity_made NUMERIC(10,3),
  unit TEXT,
  saved_eur NUMERIC(10,2),
  logged_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);
```

---

## Seiten – src/pages/wissen/

### /wissen → WissenDashboard
- Suchleiste (Volltextsuche: Titel, Tags, Zutaten)
- Kategorie-Grid: Icon, Farbe, Name, Anzahl Einträge (dynamisch)
- Letzte Ergänzungen: horizontales Karussell
- Meistgenutzt: Karten mit kumulierter Ersparnis aus `knowledge_savings_log`
- Meine Sammlung (Lesezeichen)
- Admin: „Neuen Baustein erstellen"

### /wissen/kategorie/:slug → KategoriePage
- Filter: Schwierigkeit / Unterkategorien / Sortierung
- Eintrags-Grid: Cover, Titel, Schwierigkeit-Badge, Zeit-Chip, Ersparnis-Chip (`cost_market - cost_self`), Sterne

### /wissen/baustein/:id → BausteinDetailPage

**Linke Spalte:**
- Cover, Titel, Meta-Chips, Verifiziert-Badge
- **Kosten-Vergleichs-Box:** Felder `cost_self_eur` / `cost_market_eur` / Differenz – alle aus DB
- **Zutaten mit Mengen-Multiplikator** (Skalierung nur Frontend, DB speichert Basismenge):
  - „Ins Lager"-Button pro Zutat (falls `inventory_item_id` verknüpft)
  - „Alle Zutaten übernehmen" → Modal: Lagerbestand vs. Bedarf, fehlende → Sammelbestellung
- Schritt-für-Schritt: Foto + Tipp pro Schritt
- Variationen: Akkordeon
- Community-Erfahrungen: Sterne-Verteilung, Erfahrungen pseudonym (nur Zelle sichtbar)

**Rechte Sidebar:**
- Lesezeichen-Toggle
- „Ich habe das gemacht" → Spar-Log Modal (Menge → Ersparnis aus `cost_market - cost_self` berechnet)
- Drucken / PDF
- Ähnliche Bausteine

### /wissen/neu → BausteinErstellenPage (mehrstufig)
1. Grundinfos
2. Zutaten + optionale Lager-Verknüpfung
3. Anleitung (Drag & Drop sortierbar)
4. Kosten & Variationen (frei befüllbar)
5. Vorschau → „Zur Prüfung einreichen" (`status = 'review'`)

### /wissen/module → ModulePage
- Modul-Karten: Titel, Betriebstyp-Badge, Anzahl Bausteine
- Admin: Neues Modul, Bausteine zuordnen

### /wissen/ersparnisse → ErsparnisDashboard
- Gesamtersparnis Universum aus `knowledge_savings_log` (Recharts Balken nach Kategorie)
- Meine Ersparnisse: Gesamtbetrag + Verlauf (Linienchart)
- Bestenliste Zellen

### /wissen/admin → WissenAdminPage (nur Admin)
- Queue „Zur Prüfung": `status = 'review'`
- Aktionen: Veröffentlichen / Ablehnen / Bearbeiten
- Statistiken: meistgenutzte Bausteine, Einträge/Monat, Gesamtersparnis

---

## Volltextsuche

```sql
-- Bereits im CREATE TABLE als GENERATED ALWAYS AS search_vector STORED
-- Suche via:
SELECT * FROM knowledge_entries
WHERE search_vector @@ plainto_tsquery('german', :query)
ORDER BY ts_rank(search_vector, plainto_tsquery('german', :query)) DESC;
```

---

## Hooks – src/hooks/wissen/

- `useKnowledgeCategories.ts`
- `useKnowledgeEntries.ts` (Filter, Suche, Pagination)
- `useKnowledgeEntry.ts`
- `useKnowledgeIngredients.ts` (Frontend-Skalierung)
- `useKnowledgeExperiences.ts`
- `useKnowledgeSavings.ts`
- `useKnowledgeModules.ts`
- `useKnowledgeSearch.ts`

---

## Navigation – neuer Hauptbereich „Wissen"

```
📚 Wissen  (Akzent #c17f3a, border-top 3px)
├── Übersicht          /wissen
├── Kategorien         /wissen/kategorie/...
├── Module             /wissen/module
├── Meine Ersparnisse  /wissen/ersparnisse
└── [Admin:]
    └── Prüfung        /wissen/admin
```

---

## Geschäftslogik Wissen (unveränderlich)

1. Kein Löschen wenn andere genutzt haben – nur archivieren
2. Erfahrungen pseudonym: andere sehen nur „Mitglied aus Zelle X"
3. Ab konfigurierter Anzahl verifizierter Einträge (`knowledge_min_entries_for_contribution` aus Settings) → als `universe_contribution` Typ `knowledge` hinterlegen
4. Erstellen ist Gemeinschaftsdienst – zählt optional als Zeitkategorie `bildung`
5. Mengen-Skalierung nur im Frontend – DB speichert immer Basismenge
6. Verifikation vor Veröffentlichung (besonders Heilkräuter, Chemie)

---

---

# VOLLSTÄNDIGE TABELLEN-ÜBERSICHT (in dieser Reihenfolge erstellen)

```
Abschnitt 1:
  universe_settings           ← zuerst! Alle konfigurierbaren Werte
  universe_cells
  universe_members
  universe_contributions
  universe_time_categories
  universe_time_entries
  universe_btb_coin_ledger
  universe_revenue_pool
  universe_periods
  universe_internal_invoices
  universe_voting
  universe_votes

Abschnitt 2:
  universe_donations
  universe_discount_status
  treatment_plans
  treatment_sessions
  documentation_projects
  documentation_entries
  inventory_suppliers
  inventory_items
  inventory_movements
  inventory_orders
  inventory_order_items

Abschnitt 3:
  preferred_partners
  procurement_requests
  procurement_commitments

Abschnitt 4:
  knowledge_categories
  knowledge_entries
  knowledge_ingredients
  knowledge_steps
  knowledge_variations
  knowledge_experiences
  knowledge_modules
  knowledge_module_entries
  knowledge_savings_log
```

**Alle Tabellen brauchen RLS-Policies.**
**Alle Timestamps: TIMESTAMPTZ DEFAULT now().**
**Alle IDs: UUID DEFAULT gen_random_uuid().**
**Keine Werte im Code hardcoden – immer aus `universe_settings` lesen.**

---

# MODUL-EDITOR & MITGLIEDER-ARBEITSBEREICH

## 1. Persönlicher Arbeitsbereich (MemberWorkspace)

### Route: /workspace → WorkspacePage

Jedes Mitglied hat einen persönlichen Arbeitsbereich. Er ist die Startseite nach dem Login – nicht ein allgemeines Dashboard, sondern ein individuell konfigurierter Raum mit genau den Programmen und Funktionen die dieses Mitglied braucht.

**UI-Struktur:**
```
┌─────────────────────────────────────────────────────┐
│  Guten Morgen, [Name]  ·  ◈ 37 Coins                │
├──────────────┬──────────────────────────────────────┤
│  MEINE       │  ARBEITSBEREICH                      │
│  PROGRAMME   │                                      │
│  ──────────  │  [Modul-Kacheln 3×3 Grid]            │
│  Körperarbeit│                                      │
│  Zeiterfassung  Jede Kachel:                        │
│  Lager       │  - Icon + Name                       │
│  Termine     │  - Letzter Zugriff                   │
│  ...         │  - Aktive Kollaborateure (Avatare)   │
│              │  - Ungelesene Aktivitäten (Badge)    │
│  + Programm  │                                      │
│  hinzufügen  │  [+ Neues Programm hinzufügen]       │
└──────────────┴──────────────────────────────────────┘
```

**Kapazitäts-Schnellansicht** (oben rechts):
- Was steht heute an (Top 3 offene Tasks aus universe_tasks)
- Eigene offene Zeiteinträge
- Solidarfonds-Stand (wenn relevant)

**State:**
```typescript
interface WorkspaceState {
  member: Member
  activeModules: MemberModule[]       // Module dieses Mitglieds
  recentPrograms: Program[]           // Zuletzt geöffnet
  todaysTasks: Task[]                 // Kapazitätsmanagement
  collaborators: ActiveCollaborator[] // Wer ist gerade online
}
```

**Supabase-Query:**
```sql
-- Aktive Module des Mitglieds
SELECT mm.*, mt.display_name, mt.icon, mt.profession_tags,
       mt.intern_features, mt.extern_features
FROM universe_member_modules mm
JOIN universe_module_templates mt ON mt.id = mm.template_id
WHERE mm.member_id = $member_id AND mm.active = true
ORDER BY mm.last_accessed DESC;
```

---

## 2. Modul-Editor

### Route: /workspace/editor → ModuleEditorPage
### Route: /workspace/editor/:module_id → EditExistingModule

Der Modul-Editor ist ein geteiltes Split-Screen-Interface:
- **Links:** Konfigurationsseite (editierbar)
- **Rechts:** Live-Vorschau (read-only, Echtzeit-Update)

```
┌──────────────────────────┬──────────────────────────┐
│  KONFIGURATION           │  VORSCHAU                │
│  ────────────────────    │  ────────────────────    │
│  [KI-Eingabe]            │  [Modul so wie es        │
│  "Ich bin Arzt"          │   später aussieht]       │
│                          │                          │
│  Erkannte Kategorie:     │  ┌──────────────────┐   │
│  ✓ Allgemeinmedizin      │  │ Behandlung        │   │
│                          │  │ [Feld: Patient]   │   │
│  Funktionsblöcke:        │  │ [Feld: Datum]     │   │
│  ✓ Behandlungsdoku       │  │ [Feld: ICD-10]    │   │
│  ✓ Terminbuchung         │  │ [Feld: Notiz]     │   │
│  ✓ KV-Abrechnung         │  └──────────────────┘   │
│  ○ Rezepte                │                          │
│  ○ Überweisungen          │  [Intern-Ansicht]        │
│                          │  [Extern-Ansicht]         │
│  Modus: Intern / Extern  │                          │
│  [Toggle]                │  ← Vorschau wechselt     │
│                          │     live mit             │
│  Felder:                 │                          │
│  [+ Feld hinzufügen]     │  [Modul testen]          │
│                          │   ↓ Felder befüllbar     │
│  Integrationen:          │   Flows durchspielbar    │
│  ✓ DATEV                 │                          │
│  ○ Doctolib              │                          │
│                          │                          │
│  [Entwurf speichern]     │                          │
│  [Finalisieren]          │                          │
└──────────────────────────┴──────────────────────────┘
```

**KI-Generierungsschritt (API-Call):**
```typescript
// POST /api/module/generate
interface GenerateModuleRequest {
  description: string        // "Ich bin Allgemeinmediziner"
  cell_id: string
  member_id: string
}

interface GenerateModuleResponse {
  profession_tags: string[]
  display_name: string
  suggested_features: {
    intern: FeatureBlock[]
    extern: FeatureBlock[]
  }
  compliance_requirements: string[]
  suggested_integrations: Integration[]
  field_schema: FieldDefinition[]
  document_templates: DocumentTemplate[]
}

// FeatureBlock
interface FeatureBlock {
  id: string
  name: string               // "Behandlungsdokumentation"
  description: string
  fields: FieldDefinition[]
  enabled: boolean           // default true für Kernfelder
  required: boolean
}

// FieldDefinition
interface FieldDefinition {
  id: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'toggle' | 'icd10' | 'coins'
  required: boolean
  intern_only: boolean       // nur im internen Modus sichtbar
  extern_only: boolean       // nur im externen Modus sichtbar
  options?: string[]         // für select
  placeholder?: string
}
```

**Live-Vorschau State:**
```typescript
// Vorschau reagiert auf jeden onChange in der Konfiguration
const [config, setConfig] = useState<ModuleConfig>()
const preview = useMemo(() => renderModulePreview(config), [config])

// Vorschau-Modus Toggle: intern / extern
const [previewMode, setPreviewMode] = useState<'intern' | 'extern'>('intern')
```

**Farben – Design-Tokens (nicht überschreibbar):**
```css
:root {
  --btb-h1:      #b61818;   /* Rot – Hauptüberschriften */
  --btb-h2:      #8fa942;   /* Olivgrün – Unterüberschriften */
  --btb-bg:      #f0e9b6;   /* Cremeweiß – Hintergrund */
  --btb-element: #2a7cab;   /* Blau – Buttons, Tabellen */
}
/* Kein Farbpicker im Editor – diese Tokens sind die einzige Quelle */
```

**Re-Edit bestehender Module:**
```typescript
// Modul in Bearbeitungsmodus versetzen
async function setModuleEditMode(moduleId: string) {
  await supabase
    .from('universe_member_modules')
    .update({ in_edit_mode: true })
    .eq('id', moduleId)
  // Öffnet Editor mit aktuellem Stand
  // Änderungen → neue Version (version + 1)
  // Bestehende Daten bleiben erhalten
}

// Bei Commons-Modulen: Fork statt direktes Überschreiben
async function forkCommonModule(templateId: string, memberId: string) {
  const { data: original } = await supabase
    .from('universe_module_templates')
    .select('*').eq('id', templateId).single()
  
  return await supabase.from('universe_module_templates').insert({
    ...original,
    id: undefined,
    parent_template_id: templateId,
    status: 'entwurf',
    version: 1,
    contributed_by: memberId
  })
}
```

---

## 3. Kollaboration im Arbeitsbereich

Mehrere Mitglieder können gleichzeitig im selben Programm/Modul arbeiten – sichtbar und synchronisiert.

**Technologie:** Supabase Realtime (Presence + Broadcast)

**Aktive Kollaborateure anzeigen:**
```typescript
// Presence-Channel pro Modul/Programm
const channel = supabase.channel(`module:${moduleId}`)

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    setActiveCollaborators(Object.values(state).flat())
  })
  .on('presence', { event: 'join' }, ({ newPresences }) => {
    // Neuer Kollaborateur betritt das Programm
    showNotification(`${newPresences[0].name} arbeitet jetzt hier`)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        member_id: currentMember.id,
        name: currentMember.name,
        avatar: currentMember.avatar,
        current_view: 'behandlung'   // welchen Teil sie gerade sehen
      })
    }
  })
```

**Kollaborations-Indikatoren in der UI:**
```typescript
// Zeigt Avatare aktiver Kollaborateure oben rechts im Programm
<CollaboratorAvatars collaborators={activeCollaborators} max={5} />

// Zeigt wer gerade welches Feld bearbeitet (Cursor-Indikator)
<FieldWithCollaborator
  fieldId="patient_name"
  collaboratorEditing={getCollaboratorForField('patient_name', collaborators)}
/>

// Live-Updates: wenn Kollaborateur einen Eintrag erstellt
channel.on('broadcast', { event: 'new_entry' }, ({ payload }) => {
  refetchEntries()  // Tabelle aktualisiert sich sofort
})
```

**Geteilte Dokumente (z.B. Behandlungsakte):**
```typescript
// Ein Mitglied öffnet eine Behandlung – andere sehen es
// Kein gleichzeitiges Schreiben auf dasselbe Feld (Lock-Mechanismus)
async function lockField(fieldId: string, memberId: string) {
  await channel.send({
    type: 'broadcast',
    event: 'field_lock',
    payload: { field_id: fieldId, locked_by: memberId }
  })
}
```

**Neue Supabase-Tabellen:**
```sql
-- Workspace-Konfiguration pro Mitglied
CREATE TABLE member_workspace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES universe_members NOT NULL,
  layout JSONB DEFAULT '{}',           -- Kachel-Anordnung
  pinned_programs UUID[],              -- Fixierte Programme
  quick_actions JSONB DEFAULT '[]',    -- Schnellzugriffe
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Programm-Aktivitätslog (für "zuletzt geöffnet" + Badges)
CREATE TABLE program_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES universe_members NOT NULL,
  module_id UUID REFERENCES universe_member_modules NOT NULL,
  action TEXT,                         -- 'opened', 'edited', 'created_entry'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kapazitäts-Tasks
CREATE TABLE universe_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID REFERENCES universe_cells NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 3,          -- 1=kritisch 2=hoch 3=normal 4=niedrig
  status TEXT DEFAULT 'offen',         -- offen|in_arbeit|erledigt|blockiert
  assigned_to UUID REFERENCES universe_members,
  due_date DATE,
  source_type TEXT,                    -- 'intern'|'extern_auftrag'|'solidar'
  estimated_hours NUMERIC(6,2),
  created_by UUID REFERENCES universe_members NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS für alle drei Tabellen
ALTER TABLE member_workspace ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE universe_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eigener Workspace" ON member_workspace
  FOR ALL USING (member_id = auth.uid());

CREATE POLICY "Zellenaufgaben sichtbar" ON universe_tasks
  FOR SELECT USING (
    cell_id IN (
      SELECT cell_id FROM universe_members WHERE id = auth.uid()
    )
  );
```

---

## 4. Integration bestehender Software (API-Schicht)

Jedes generierte Modul enthält automatisch Integrations-Hooks. Das Modul kommuniziert mit bestehender Software – es ersetzt sie nicht.

```typescript
// Integrations-Interface das jedes Modul implementieren kann
interface ModuleIntegration {
  id: string                 // 'datev' | 'sap' | 'doctolib' | 'bea' | ...
  name: string
  syncDirection: 'push' | 'pull' | 'bidirectional'
  
  // Wird aufgerufen wenn ein Eintrag im Modul erstellt wird
  onEntryCreate?: (entry: ModuleEntry) => Promise<void>
  
  // Wird aufgerufen zum manuellen/geplanten Sync
  sync?: () => Promise<SyncResult>
  
  // Authentifizierung
  auth: {
    type: 'api_key' | 'oauth2' | 'credentials'
    config: Record<string, string>
  }
}

// Beispiel: DATEV-Integration
const datevIntegration: ModuleIntegration = {
  id: 'datev',
  name: 'DATEV',
  syncDirection: 'push',
  onEntryCreate: async (entry) => {
    // Buchungssatz an DATEV übermitteln
    await datevClient.postBooking({
      konto: entry.konto,
      betrag: entry.betrag,
      datum: entry.datum,
      text: entry.beschreibung
    })
  }
}
```

**Integration-Settings pro Modul (in universe_settings):**
```
module_{module_id}_datev_enabled        true/false
module_{module_id}_datev_api_key        [verschlüsselt]
module_{module_id}_datev_kanzlei_id     [ID]
module_{module_id}_sap_endpoint         [URL]
module_{module_id}_doctolib_token       [verschlüsselt]
```

**Hinweis für Lovable/Cursor:**
Das Logo (PNG mit transparentem Hintergrund) wird beim ersten Setup
vom Nutzer erfragt:
"Bitte lade das Back to Balance Logo hoch (PNG, transparenter Hintergrund)"
Es erscheint in Sidebar (40×40px), Login-Screen (80×80px), App-Header.
Auf Hintergrund #f0e9b6 – kein weißer Rahmen, kein Schatten.



Der KI-Modul-Generator ist die wichtigste langfristige Erweiterung der App. Er ist ein eingebautes Lovable/Cursor das Berufe kennt: Ein Mitglied nennt sein Vorhaben – "Ich bin Allgemeinmediziner", "Wir betreiben eine Schreinerei", "Wir sind ein Maschinenbaubetrieb mit 80 Mitarbeitern" – und das System generiert automatisch ein vollständiges Berufsmodul.

## Architektur

```
┌──────────────────────────────────────────────────────────────┐
│  BtB KERN  (immer vorhanden)                                 │
│  Pool · Coins · Rücklage · Zellen · Abstimmung · Solidar     │
├──────────────────────────────────────────────────────────────┤
│  KAPAZITÄTS-MANAGEMENT                                       │
│  Was steht an · Prioritäten heute · Wer macht was            │
│  Kollektiver Aufgabenraum – kein Chef, gemeinsames Bild      │
├──────────────────────────────────────────────────────────────┤
│  KI-MODUL-GENERATOR                                          │
│  Mitglied nennt Beruf/Branche → KI rekonstruiert Modul       │
│  Jedes Modul: Intern-Modus (Coins/EK) + Extern-Modus (€)    │
│  Validierung durch Mitglied → Modul landet in Commons        │
├──────────────────────────────────────────────────────────────┤
│  INTEGRATIONS-SCHICHT  (API-first, alles kommuniziert)       │
│  DATEV · SAP · Doctolib · beA · KIS · Tomedo · GAEB          │
│  Bestehende Software bleibt – BtB dockt an, ersetzt nicht    │
├──────────────────────────────────────────────────────────────┤
│  MODUL-BIBLIOTHEK  (Commons, weltweit beisteuerbar)          │
│  Jede Zelle weltweit kann Module beitragen                   │
│  Alle Berufe · Alle Branchen · Alle Unternehmensgrößen       │
└──────────────────────────────────────────────────────────────┘
```

## Generierungs-Dialog (UX-Konzept)

```
Schritt 1 – Vorhaben nennen:
  "Beschreibe dein Vorhaben oder deinen Beruf"
  → Freitext, KI analysiert

Schritt 2 – KI schlägt Modul-Konfiguration vor:
  - Erkannte Berufsgruppe / Branche
  - Benötigte Funktionsblöcke (intern + extern)
  - Compliance-Anforderungen (z.B. DSGVO, KV-Abrechnung, VOB)
  - Schnittstellen zu bestehender Software (DATEV, SAP, etc.)
  - Geschätzte Datenfelder und Dokumentenvorlagen

Schritt 3 – Mitglied validiert und ergänzt:
  - Felder bestätigen / anpassen
  - Branchenspezifische Besonderheiten ergänzen
  - Intern/Extern-Konfiguration prüfen

Schritt 4 – Live-Vorschau im Editor:
  → Geteilte Ansicht: linke Seite Konfiguration, rechte Seite Live-Vorschau
  → Vorschau zeigt das Modul exakt so wie es später erscheint
  → Jede Änderung links aktualisiert die Vorschau rechts in Echtzeit
  → "Teste das Modul" – Mitglied kann Felder befüllen, Flows durchspielen
  → Vorschau ist nicht editierbar – nur die Konfigurationsseite ist die Quelle

Schritt 5 – Modul wird finalisiert:
  - Vollständige DB-Tabellen
  - UI-Komponenten (Lovable-kompatibel)
  - API-Endpoints
  - Integrations-Hooks zu bestehender Software
  - Status wechselt zu 'aktiv'

Schritt 6 – Optional: Commons-Freigabe:
  - Modul in Bibliothek veröffentlichen
  - Andere Zellen weltweit können es nutzen und verbessern
```

## Modul-Editor: Design-Grundsätze

**Farben – nicht veränderbar:**
- Alle Module verwenden ausschließlich die offiziellen BtB-Markenfarben (Quelle: btb_color_palette)
- H1 (Überschrift 1):            #b61818  – Rot
- H2 (Überschrift 2):            #8fa942  – Olivgrün
- Hintergrund:                   #f0e9b6  – Cremeweiß
- Elemente (Buttons/Tabellen):   #2a7cab  – Blau
- Kein Farbpicker, keine Themes, keine Abweichungen
- Begründung: Das System hat eine Identität. Jedes Modul ist Teil derselben Welt.
- Technisch: Farben werden aus einem zentralen Design-Token-File importiert,
  das im Modul-Generator nicht überschreibbar ist

**Layout-Freiheiten (was anpassbar ist):**
- Reihenfolge der Felder und Abschnitte
- Welche Felder pflichtfelder sind
- Welche Felder intern vs. extern sichtbar sind
- Beschriftungen und Hilfstexte
- Ob ein Feld als Text, Zahl, Datum, Dropdown oder Toggle erscheint

## Re-Edit-Modus: Finalisierte Module bearbeiten

Jedes finalisierte Modul kann jederzeit wieder in den Bearbeitungsmodus
versetzt werden – auch wenn es bereits aktiv genutzt wird.

```
Re-Edit-Regeln:

1. Modul → "Bearbeiten" öffnet den Editor mit aktuellem Stand
2. Geteilte Vorschau ist sofort wieder aktiv
3. Änderungen werden als neue Version gespeichert (Versionierung)
   → version INTEGER DEFAULT 1, inkrementell
4. Bestehende Daten bleiben erhalten – Migration bei strukturellen Änderungen
5. Bei Commons-Modulen (öffentlich): Änderung erzeugt Fork, kein
   direktes Überschreiben des Originals
6. Nach Re-Edit: Modul kann erneut als neue Version in Commons veröffentlicht werden
```

```sql
-- Versionierung im Datenmodell
ALTER TABLE universe_module_templates ADD COLUMN
  version INTEGER DEFAULT 1;
ALTER TABLE universe_module_templates ADD COLUMN
  parent_template_id UUID REFERENCES universe_module_templates; -- für Forks
ALTER TABLE universe_module_templates ADD COLUMN
  status TEXT DEFAULT 'entwurf'; -- entwurf | aktiv | archiviert | commons

-- Mitglieds-Modul trackt welche Version aktiv ist
ALTER TABLE universe_member_modules ADD COLUMN
  template_version INTEGER DEFAULT 1;
ALTER TABLE universe_member_modules ADD COLUMN
  in_edit_mode BOOLEAN DEFAULT false;
```

## Berufsbeispiele mit Kernfunktionen

| Beruf | Intern (Coins) | Extern (€ + Compliance) |
|---|---|---|
| Arzt (Allgemein) | Behandlungsdoku, Fallnotizen | KV-Abrechnung, ICD-10, Rezepte, ePA, Überweisungen |
| Anwalt | Beratung intern, Fallakte | Mandantenakte, Fristen, RVG, beA, Vertrauenskonto |
| Steuerberater | Mitglieder-Buchführung | DATEV, ELSTER, E-Bilanz, Jahresabschluss, Fristen |
| Heilpraktiker | Behandlung, Einwilligung | Privatrechnung, Heil-/Kostenpläne |
| Zimmermann | Intern-Auftrag, Materialentnahme | VOB, GAEB, Leistungsverzeichnis, Aufmaß, Abschlags-RE |
| Maschinenbau (Betrieb) | Interne Aufträge, Lager | ERP-Integration, Stücklisten, Arbeitspläne, ISO 9001 |
| Krankenhaus | Interne Behandlung | KIS, Belegungsplanung, DRG-Abrechnung, MDK |
| Architekt | Planungszeit | HOAI-Phasen, Baugenehmigung, Ausschreibung |
| Landwirt | Ernte-Charge, EK-Kalkulation | Bio-Zertifikat, Lieferschein, Rückverfolgbarkeit |
| Koch/Gastro | Rezeptdatenbank, internes Buffet | Allergenkennzeichnung, HACCP, Kassenbuch |

## Integrations-Schicht (API-first)

**Prinzip: Bestehende Software bleibt. BtB dockt an.**

Jedes generierte Modul enthält automatisch Integrations-Hooks für:
- **DATEV** – Buchungssätze, Kontenrahmen SKR03/SKR04
- **SAP** – FI (Finanzen), MM (Material), SD (Vertrieb), PP (Produktion)
- **ELSTER** – Steueranmeldungen, E-Bilanz
- **Doctolib / Jameda** – Terminbuchung, Patientenverwaltung
- **beA** – Anwaltspostfach, Fristenkontrolle
- **GAEB** – Ausschreibungen, Leistungsverzeichnisse
- **GoBD-konforme** Archivierung für alle generierten Dokumente
- **E-Rechnung** (XRechnung/ZUGFeRD) – automatisch in jedem Extern-Modul

**Neue Integrationen können per API-Beschreibung ergänzt werden** – die KI generiert den Adapter.

## Commons-Bibliothek (Datenmodell)

```sql
-- Neue Tabellen für Modul-Generator
universe_module_templates (
  id UUID PRIMARY KEY,
  profession_tags TEXT[],        -- ['arzt', 'allgemeinmedizin', 'kassenarzt']
  display_name TEXT,
  description TEXT,
  intern_features JSONB,         -- Welche Coin-Funktionen
  extern_features JSONB,         -- Welche Euro-Funktionen
  compliance_requirements TEXT[], -- ['DSGVO', 'KV-Abrechnung', 'ICD-10']
  integrations TEXT[],           -- ['DATEV', 'Doctolib', 'KV-Connect']
  schema_additions JSONB,        -- Zusätzliche DB-Tabellen die dieses Modul braucht
  ui_components JSONB,           -- Lovable-kompatible Komponenten-Specs
  contributed_by TEXT,           -- Zelle oder Mitglied das es beigesteuert hat
  downloads INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
)

universe_member_modules (
  id UUID PRIMARY KEY,
  member_id UUID REFERENCES universe_members,
  template_id UUID REFERENCES universe_module_templates,
  custom_config JSONB,           -- Mitgliedsspezifische Anpassungen
  active BOOLEAN DEFAULT true,
  activated_at TIMESTAMPTZ DEFAULT now()
)
```

## Kapazitätsmanagement (Datenmodell)

```sql
universe_tasks (
  id UUID PRIMARY KEY,
  cell_id UUID REFERENCES universe_cells,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 3,    -- 1=kritisch, 2=hoch, 3=normal, 4=niedrig
  status TEXT DEFAULT 'offen',   -- offen, in_arbeit, erledigt, blockiert
  assigned_to UUID REFERENCES universe_members,
  due_date DATE,
  source_type TEXT,              -- 'intern', 'extern_auftrag', 'solidar', 'projekt'
  source_id UUID,                -- Referenz auf Ursprungsobjekt
  estimated_hours NUMERIC(6,2),
  created_by UUID REFERENCES universe_members,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

## Hinweis zur Implementierung

Der KI-Modul-Generator ist eine **langfristige Vision**, nicht Teil der aktuellen MVP-Entwicklung. Der aktuelle Fokus liegt auf dem BtB-Kern (Pool, Coins, Zellen, Abstimmung, Solidarfonds). Der Generator ist der nächste große Entwicklungsschritt sobald der Kern stabil läuft.

