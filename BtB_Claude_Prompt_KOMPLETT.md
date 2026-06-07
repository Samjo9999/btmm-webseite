# Back to Balance – Cursor Prompt (Vollständig)

**Dieses Dokument ist für Cursor AI geschrieben.**
**Kein Abschnitt ist optional. Das System ist ein Ganzes.**

---

## WICHTIGSTE ANWEISUNG: Erst prüfen, dann bauen

**Bevor du irgendetwas implementierst:**

1. Lies den gesamten Prompt durch
2. Untersuche den bestehenden Codebase vollständig:
   - Welche Tabellen existieren bereits in Supabase?
   - Welche Seiten und Komponenten sind bereits gebaut?
   - Welche API-Routen existieren bereits?
3. Erstelle eine kurze Übersicht:
   ```
   BEREITS UMGESETZT: [Liste]
   FEHLT NOCH:        [Liste]
   KONFLIKTE:         [Was im Code anders ist als im Prompt]
   ```
4. Warte auf Bestätigung bevor du baust
5. Baue nur was wirklich fehlt – überschreibe nichts das bereits funktioniert

**Ziel: Den bestehenden Stand ergänzen, nicht neu aufbauen.**

---

**Arbeitsweise:**
- Implementiere Feature für Feature, nicht Datei für Datei
- Teste nach jedem Feature bevor du weitermachst
- Wenn etwas unklar ist: fragen, nicht raten

## Inhaltsverzeichnis

```
ABSCHNITT 1 – Universum-Grundstruktur (Pool, Coins, Zellen, Abstimmung)
ABSCHNITT 2 – Betriebsmodule, Unterstützer, Lager & Dokumentation
ABSCHNITT 3 – Partnerverzeichnis & kollektive Beschaffung
ABSCHNITT 4 – Wissensdatenbank & Baustein-System
ABSCHNITT 5 – Modul-Editor, KI-Generator & Persönlicher Arbeitsbereich
              ↳ Persönlicher Workspace (WorkspacePage)
              ↳ Split-Screen Modul-Editor mit Live-Vorschau
              ↳ Onboarding-Modal (erscheint beim ersten Start)
              ↳ KI-Backend: Berufs-Modul-Generator (vollständig implementieren)
              ↳ Automatische Bedienungsanleitung
              ↳ Integrations-Assistent (einmalige Kalibrierung, dann automatisch)
ABSCHNITT 6 – Internationalisierung (11 Sprachen, gesamte App)
ABSCHNITT 7 – Work-Feed (öffentliches Arbeitsportfolio)
ABSCHNITT 8 – Integration bestehender Software (API-Schicht)
```

---

## ⚡ SCHNELLREFERENZ: Die wichtigsten Features auf einen Blick

Diese Features müssen gebaut werden. Details stehen weiter unten im Dokument.

### 1. Modul-Editor (`/workspace/editor`)
Split-Screen: links Konfiguration, rechts Live-Vorschau in Echtzeit.
Dateien: `src/pages/WorkspacePage.tsx`, `src/pages/ModuleEditorPage.tsx`

**Ablauf in 4 Phasen:**
```
Phase 1: Beruf eingeben → POST /api/module/generate → KI generiert vollständiges Modul
Phase 2: Nutzer deaktiviert was er nicht braucht (Toggle, Pflichtblöcke geschützt)
Phase 3: POST /api/module/generate-guide → KI schreibt Bedienungsanleitung
Phase 4: POST /api/module/generate-integration → KI richtet externe Software ein
```

**Beim ersten Öffnen:** Onboarding-Modal erklärt die 4 Phasen (einmalig, localStorage).

---

### 2. KI-Modul-Generator (`supabase/functions/generate-module/index.ts`)

```typescript
// DIESE DATEI MUSS ERSTELLT WERDEN
// Supabase Edge Function die Anthropic Claude aufruft

import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic() // API Key aus Umgebungsvariable ANTHROPIC_API_KEY

export default async function handler(req: Request) {
  const { description, exclusions = [], language = 'de', country = 'DE' } = await req.json()

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 6000,
    system: PROFESSION_SYSTEM_PROMPT,  // → vollständiger Prompt weiter unten im Dokument
    messages: [{
      role: 'user',
      content: exclusions.length > 0
        ? `Beruf: "${description}"\nNicht benötigt: ${exclusions.join(', ')}\nSprache: ${language}\nLand: ${country}`
        : `Beruf: "${description}"\nSprache: ${language}\nLand: ${country}`
    }]
  })

  const text = response.content[0].text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return new Response(text, { headers: { 'Content-Type': 'application/json' } })
}
```

**Gibt zurück:** JSON mit `profession_tags`, `display_name`, `feature_blocks.intern[]`,
`feature_blocks.extern[]`, `compliance_requirements[]`, `suggested_integrations[]`,
`document_templates[]`

---

### 3. Anleitung-Generator (`supabase/functions/generate-guide/index.ts`)

```typescript
// DIESE DATEI MUSS ERSTELLT WERDEN
// Generiert nach Modul-Finalisierung automatisch eine Bedienungsanleitung

export default async function handler(req: Request) {
  const { module_config, language = 'de' } = await req.json()

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    system: `Schreibe eine Bedienungsanleitung. Klar, freundlich, ohne Fachsprache.
Erkläre nur die Funktionen die im Modul aktiv sind.
Antworte NUR mit validem JSON mit diesen Keys:
title, kurzbeschreibung, erster_start[], interner_modus[], externer_modus[],
pflichtfelder[], integrationen[], haeufige_fragen[], tipps[]`,
    messages: [{
      role: 'user',
      content: `Modul: ${JSON.stringify(module_config)}\nSprache: ${language}`
    }]
  })

  const text = response.content[0].text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return new Response(text, { headers: { 'Content-Type': 'application/json' } })
}
```

---

### 4. Integrations-Assistent (`supabase/functions/generate-integration/index.ts`)

```typescript
// DIESE DATEI MUSS ERSTELLT WERDEN
// Einmalige Kalibrierung – danach läuft alles automatisch ohne Nutzereingriff

export default async function handler(req: Request) {
  const { integration_type, user_description, module_config, language = 'de' } = await req.json()

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    system: `Du bist Experte für Software-Integrationen (DATEV, SAP, Doctolib, beA, etc.).
Nutzer beschreibt seine Software-Umgebung in natürlicher Sprache.
Generiere: vollständige Konfiguration + Adapter-Code + Einrichtungsanleitung.
API-Keys NIEMALS in der DB – nur Supabase Vault oder .env.
Antworte NUR mit validem JSON mit diesen Keys:
integration, konfiguration{}, adapter_code, env_variables[], einrichtung[], was_passiert, hinweise[]`,
    messages: [{
      role: 'user',
      content: `Integration: ${integration_type}\nSituation: "${user_description}"\nModul: ${module_config?.display_name}\nSprache: ${language}`
    }]
  })

  const text = response.content[0].text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return new Response(text, { headers: { 'Content-Type': 'application/json' } })
}
```

---

### 5. Benötigte Dateien (Cursor muss diese alle anlegen)

```
src/
  pages/
    WorkspacePage.tsx          ← Persönlicher Arbeitsbereich mit Modul-Kacheln
    ModuleEditorPage.tsx       ← Split-Screen Editor + Live-Vorschau
  components/
    ModuleEditorOnboarding.tsx ← Einmaliges Erklärungs-Modal (4 Schritte)
    ModulePreview.tsx          ← Rechte Seite: Live-Vorschau
    ModuleConfig.tsx           ← Linke Seite: Konfiguration + Toggles
    FeatureBlockToggle.tsx     ← Ein Funktionsblock mit Toggle
    ModuleGuide.tsx            ← Tab "Anleitung" im Editor
    IntegrationAssistant.tsx   ← Phase 4: Software anschließen
  hooks/
    useModuleGenerator.ts      ← API-Call zu generate-module
    useGuideGenerator.ts       ← API-Call zu generate-guide
    useIntegrationAssistant.ts ← API-Call zu generate-integration

supabase/functions/
  generate-module/index.ts     ← KI-Modul-Generator
  generate-guide/index.ts      ← Anleitung-Generator
  generate-integration/index.ts ← Integrations-Assistent
```

---

### 6. Datenbank-Tabellen für den Editor

```sql
-- Modul-Templates (generiert + gespeichert)
CREATE TABLE universe_module_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profession_tags TEXT[],
  display_name TEXT NOT NULL,
  description TEXT,
  intern_features JSONB,        -- feature_blocks.intern[]
  extern_features JSONB,        -- feature_blocks.extern[]
  compliance_requirements TEXT[],
  integrations TEXT[],
  document_templates JSONB,
  status TEXT DEFAULT 'entwurf'
    CHECK (status IN ('entwurf','aktiv','archiviert','commons')),
  version INTEGER DEFAULT 1,
  parent_template_id UUID REFERENCES universe_module_templates,
  contributed_by UUID REFERENCES universe_members,
  verified BOOLEAN DEFAULT false,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mitglieds-Module (welches Mitglied nutzt welches Template)
CREATE TABLE universe_member_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES universe_members NOT NULL,
  template_id UUID REFERENCES universe_module_templates NOT NULL,
  custom_config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  in_edit_mode BOOLEAN DEFAULT false,
  template_version INTEGER DEFAULT 1,
  last_accessed TIMESTAMPTZ DEFAULT now(),
  activated_at TIMESTAMPTZ DEFAULT now()
);

-- Bedienungsanleitungen
CREATE TABLE module_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES universe_module_templates NOT NULL,
  language_code TEXT NOT NULL DEFAULT 'de',
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, language_code)
);

-- Integrations-Konfigurationen
CREATE TABLE module_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_module_id UUID REFERENCES universe_member_modules NOT NULL,
  integration_type TEXT NOT NULL,
  config JSONB NOT NULL,        -- Konfiguration (KEINE Secrets)
  status TEXT DEFAULT 'configured',
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
  -- API-Keys → Supabase Vault, nicht hier
);

-- RLS auf alle Tabellen
ALTER TABLE universe_module_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE universe_member_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eigene Module" ON universe_member_modules
  FOR ALL USING (member_id = auth.uid());
CREATE POLICY "Templates lesbar" ON universe_module_templates
  FOR SELECT USING (true);
CREATE POLICY "Eigene Integrationen" ON module_integrations
  FOR ALL USING (
    member_module_id IN (
      SELECT id FROM universe_member_modules WHERE member_id = auth.uid()
    )
  );
```

---


- Implementiere Feature für Feature, nicht Datei für Datei
- Teste nach jedem Abschnitt bevor du weitermachst
- Wenn etwas unklar ist: frage nach, implementiere nicht auf Verdacht

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
  solidarity_fund_pool_pct           – Anteil vom Sozial-Drittel der in den
                                       Solidarfonds fließt (%) · DEFAULT 10
                                       (entspricht ~3,3% des Gesamtpools)
                                       GV beschließt pro Periode – max. 50%
                                       Hintergrund: dt. Sozialabgaben ~42%
                                       gesamt, Arbeitnehmer-Anteil ~21%.
                                       10% ist ein substanzieller Puffer ohne
                                       das operative Wirtschaften zu schwächen.
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

Kategorie: banking
  banking_provider                   – 'finapi' | 'gocardless'
  banking_auto_sync                  – true | false
  banking_sync_interval_hours        – Sync-Intervall in Stunden (default: 24)
  banking_kassenwart_role            – Wer Buchungsdetails sieht
  pool_settlement_interval           – Wie oft Pool-Fluss stattfindet:
                                       'monthly' (default) | 'quarterly'
                                       GV beschließt Änderung
  order_approval_threshold_single    – Einzelbestellung Freigabe-Schwelle (€) · DEFAULT 500
  order_approval_threshold_double    – Vier-Augen-Schwelle (€) · DEFAULT 2000

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
  country_code TEXT DEFAULT 'DE',      -- ISO 3166-1 alpha-2
  language_code TEXT DEFAULT 'de',     -- Primärsprache der Zelle
  local_currency TEXT DEFAULT 'EUR',   -- Heimatwährung (ISO 4217)
  description TEXT,
  founded_at DATE,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('forming','active','paused','dissolved')),
  pool_mode TEXT DEFAULT 'full'
    CHECK (pool_mode IN (
      'observer',   -- Beobachter-Zelle: lokaler Pool, noch kein globaler Beitritt
      'full'        -- Vollmitglied im gemeinsamen Pool
    )),
  -- Beobachter-Zellen werden zu 'full' wenn:
  -- 1. Kernzelle selbsttragend, 2. Rechtlicher Rahmen geklärt,
  -- 3. Internationale Zelle 3 stabile Perioden nachgewiesen hat
  pool_join_date DATE,                 -- Datum des Beitritts zum globalen Pool
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
      'earn_hours',          -- Normal verdient durch Arbeitsstunden
      'spend_internal',      -- Intern ausgegeben (Lebensmittel, Dienstleistungen)
      'period_settlement',   -- Periodenabschluss
      'solidarity_fund',     -- Soli-Leistung: Coin vom Dach-Konto Solidarfonds
      'correction',          -- Korrektur durch Admin
      'payout_eur'           -- Euro-Auszahlung beantragt
    )),
  coin_type TEXT NOT NULL DEFAULT 'arbeit'
    CHECK (coin_type IN (
      'arbeit',    -- Normal verdient: Arbeitsleistung. Historischer Eurowert fixiert.
      'soli'       -- Solidarleistung: aus Solidarfonds des Dach-Kontos.
                   -- Eurowert = aktueller Gegenwert zum Zeitpunkt der Ausschüttung.
                   -- Kann intern ausgegeben ODER auf Antrag in Euro ausgezahlt werden
                   -- (Euro kommt aus Solidarfonds auf Dach-Konto, nicht aus Zell-Konto).
    )),
  coins NUMERIC(10,4) NOT NULL,
  eur_rate_at_creation NUMERIC(10,4) NOT NULL,
  -- Historischer Abrechnungswert:
  -- Für 'arbeit'-Coins: der Stundensatz der Entstehungsperiode – unveränderlich.
  -- Für 'soli'-Coins:   der aktuelle Gegenwert zum Zeitpunkt der Soli-Ausschüttung.
  -- Verhindert in beiden Fällen Spekulation.
  eur_equivalent NUMERIC(10,2) GENERATED ALWAYS AS (coins * eur_rate_at_creation) STORED,
  description TEXT,
  time_entry_id UUID REFERENCES universe_time_entries(id),
  period_id UUID,
  soli_request_id UUID,    -- Referenz auf Soli-Antrag wenn coin_type='soli'
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

# ABSCHNITT 5 – Modul-Editor, KI-Generator & Persönlicher Arbeitsbereich

**Dieser Abschnitt ist vollständig zu implementieren – kein optionaler Zusatz.**
Er enthält: persönlicher Workspace, Split-Screen-Editor, KI-Berufs-Generator,
automatische Bedienungsanleitung, Integrations-Assistent, Onboarding-Modal.

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

## 4. KI-Backend: Berufs-Modul-Generator

**Grundprinzip:** Die KI kennt jeden Beruf vollständig. Sie generiert immer das
komplette Standard-Modul – mit allem was 80% der Betriebe dieses Berufs brauchen.
Der Nutzer schränkt danach ein: was er nicht hat, nicht braucht, anders macht.

Nicht: "Was brauchst du?" → Nutzer tippt alles ein
Sondern: "Hier ist alles was ein Zimmermann braucht. Was nicht?" → Nutzer streicht ab

Ein Zimmermann ohne CNC-Maschine deaktiviert den CNC-Block.
Einer der nur Privatkunden hat, wechselt den Extern-Modus auf Privatkundenrechnung.
Einer ohne Subunternehmer deaktiviert das Subunternehmer-Modul.

---

### Phase 1: Beruf erkennen + vollständiges Standard-Modul generieren

**API-Route:** `POST /api/module/generate`

```typescript
// supabase/functions/generate-module/index.ts
import Anthropic from '@anthropic-ai/sdk'
const client = new Anthropic()

const SYSTEM_PROMPT = `
Du bist ein Experte für Berufssoftware, deutsches Berufsrecht und Genossenschaftswirtschaft.
Du kennst für jeden Beruf alle typischen Arbeitsabläufe, Dokumente, gesetzlichen
Pflichtangaben und branchenüblichen Software-Funktionen.

ARBEITSPRINZIP:
1. Generiere immer das VOLLSTÄNDIGE Standard-Modul für den genannten Beruf.
2. Optionale Funktionen: optional:true, enabled:true (aktiv aber abwählbar)
3. Gesetzliche Pflichtfunktionen: required:true (nicht deaktivierbar, mit Rechtsgrundlage)
4. Wenn Nutzer Einschränkungen nennt ("keine CNC", "nur Privatkunden"):
   setze entsprechende Blöcke auf enabled:false

JEDES MODUL hat IMMER zwei Modi:
- INTERN: BtB-Coins, Einkaufspreis, Genossenschaftsmitglieder als Kunden
- EXTERN: Euro-Rechnung, volle gesetzliche Compliance, externe Kunden

VOLLSTÄNDIGES BERUFSWISSEN:

HANDWERK & BAU:
Zimmermann/Schreiner:
  Pflicht: VOB/B-Vertragsgrundlage, Aufmaßblatt (qm/lm/m³),
           Leistungsverzeichnis, GAEB D81/D84/D86,
           Abschlagsrechnung §16 VOB/B, Schlussrechnung mit Aufmaß,
           Bautagesbericht, Mängelprotokoll, Gewährleistung §13 VOB/B,
           Materialnachweis
  Optional: CNC-Maschinenprotokoll, Subunternehmer-Vergabe/-Abrechnung,
            DATEV-Export, Wartungsprotokoll Maschinen, DGUV-Nachweis

Elektriker:
  Pflicht: VDE-Norm-Prüfprotokoll, E-Check-Bericht, Messprotokoll,
           DGUV V3 Prüfnachweis, Anlagendokumentation
  Optional: Smart-Home-Inbetriebnahme, PV-Dokumentation,
            Zähleranmeldung, Netzanschlussprotokoll

Sanitär/Heizung:
  Pflicht: VOB, Druckprüfprotokoll, Abnahmeprotokoll
  Optional: Energieausweis, Hydraulischer Abgleich, BAFA-Förderantrag,
            Wartungsvertrag

Architekt:
  Pflicht: HOAI Leistungsphasen 1-9, Honorar-Rechner HOAI 2021,
           Baugenehmigungsunterlagen, Baubeschreibung, Bauleiter-Tagebuch
  Optional: BIM-Verwaltung, DGNB/LEED-Zertifikat, KfW-Förderantrag,
            Brandschutznachweis

MEDIZIN & GESUNDHEIT:
Arzt (Kassenpatient):
  Pflicht: EBM-Ziffern, ICD-10-GM, Überweisung Muster 6,
           AU-Bescheinigung Muster 1, Rezept Muster 16,
           ePA-Anbindung, KV-Connect, DSGVO Patientenakte
  Optional: GOÄ Privatpatienten, IGeL-Dokumentation,
            Hausbesuche, Videosprechstunde, Selektivverträge

Heilpraktiker:
  Pflicht: Privatrechnung, Heil- und Kostenplan, Anamnesebogen,
           Behandlungsnachweis (beschreibend, keine Diagnosen §1 HeilprG),
           DSGVO Patientenakte
  Optional: Online-Terminbuchung, Phytotherapie-Datenbank

Physiotherapeut:
  Pflicht: Heilmittelverordnung, Abrechnungsziffern KG/KGG/MT/KMT/MLD,
           Behandlungsbericht, Krankenkassen-Direktabrechnung
  Optional: Sporttherapie privat, BGU-Abrechnung, §20 SGB V Prävention

RECHT & BERATUNG:
Anwalt:
  Pflicht: RVG-Gebührenrechner (Streitwert → Gebühren),
           beA-Integration, Fristenkontrolle (Klagefrist/Verjährung),
           Handakte-Führung, Vertrauenskonto §43a BRAO,
           Vollmacht-Verwaltung, Mandantenakte DSGVO
  Optional: Insolvenzrecht-Formulare, Strafrecht-Akten,
            Grundbuchsache-Tracking

Steuerberater:
  Pflicht: DATEV-Schnittstelle (EXTF), ELSTER, GoBD-Buchführung,
           E-Bilanz XBRL, Jahresabschluss HGB,
           Fristenkalender (USt-VA/KSt/ESt/GewSt),
           Vollmachtsdatenbank FinanzOnline
  Optional: Internationales Steuerrecht, Erbschaftsteuer,
            Lohnbuchhaltung LODAS, Unternehmensbewertung

LANDWIRTSCHAFT:
Landwirt (Bio):
  Pflicht: Bio-Kontrollstellen-Nachweis (DE-ÖKO-xxx),
           EU-Öko-VO 2018/848, Chargen-Rückverfolgbarkeit,
           Betriebsmittel-Nachweis
  Optional: InVeKoS-Flächenantrag, Direktvermarktung,
            Tierhaltungsnachweis, Biogasanlage

GASTRONOMIE:
Koch/Restaurant:
  Pflicht: HACCP-Konzept + Protokoll, Allergen-Kennzeichnung
           EU-VO 1169/2011 (14 Hauptallergene),
           TSE-Kasse KassenSichV, Kassenbuch, Reinigungsplan
  Optional: Lieferservice-Integration, Warenwirtschaft,
            Reservierungssystem, Eventcatering-Kalkulation

FÜR JEDEN WEITEREN BERUF: Generiere das vollständige Standard-Modul
mit allen bekannten Branchenanforderungen und korrekter
Pflicht/Optional-Kennzeichnung nach deutschem Recht.

AUSGABE: Ausschließlich valides JSON ohne Markdown.
`

export default async function handler(req: Request) {
  const {
    description,        // "Ich bin Zimmermann"
    exclusions = [],    // ["CNC-Maschine", "Subunternehmer"] – vom Nutzer deaktiviert
    language = 'de',
    country = 'DE'
  } = await req.json()

  const userMessage = exclusions.length > 0
    ? `Beruf: "${description}"\nNicht benötigt: ${exclusions.join(', ')}\nSprache: ${language}\nLand: ${country}`
    : `Beruf: "${description}"\nSprache: ${language}\nLand: ${country}`

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 6000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  })

  const text = response.content[0].text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  return new Response(text, { headers: { 'Content-Type': 'application/json' } })
}
```

---

### Onboarding-Modal: Erklärung beim ersten Start

Beim ersten Öffnen des Modul-Editors erscheint ein Modal das den gesamten Ablauf erklärt.
Wird in localStorage gespeichert – erscheint nur einmal (außer der Nutzer klickt "Nochmal zeigen").

**UI: Onboarding-Modal**

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   🔧  So funktioniert der Modul-Editor                       │
│                                                              │
│   Der Editor baut in 4 Schritten dein Arbeitsmodul –        │
│   vollständig auf deinen Beruf zugeschnitten.               │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │    1     │  │    2     │  │    3     │  │    4     │    │
│  │  Beruf   │→ │ Anpassen │→ │Anleitung │→ │Anschließ-│    │
│  │  nennen  │  │          │  │          │  │   en     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  1 · Beruf nennen                                           │
│      Du sagst was du tust – "Ich bin Zimmermann",           │
│      "Ich betreibe eine Arztpraxis". Die KI kennt           │
│      deinen Beruf und baut das vollständige Modul.          │
│                                                              │
│  2 · Anpassen                                               │
│      Du siehst alle Funktionen die dein Beruf mitbringt.    │
│      Schalte ab was du nicht brauchst – z.B. keine          │
│      CNC-Maschine, keine Subunternehmer.                    │
│      Was gesetzlich Pflicht ist, bleibt immer aktiv.        │
│                                                              │
│  3 · Anleitung                                              │
│      Das fertige Modul erklärt sich selbst. Die KI          │
│      schreibt eine Bedienungsanleitung – Schritt für         │
│      Schritt, in deiner Sprache, druckbar.                  │
│                                                              │
│  4 · Anschließen (optional)                                 │
│      Nutzt du DATEV, SAP oder eine andere Software?         │
│      Beschreibe deine Situation – der Integrations-         │
│      Assistent richtet die Verbindung für dich ein.         │
│                                                              │
│  ────────────────────────────────────────────────────────   │
│  Du kannst jederzeit zurück. Nichts ist endgültig bis       │
│  du auf "Finalisieren" klickst.                             │
│                                                              │
│         [Nochmal zeigen]    [Los geht's →]                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Implementation:**
```typescript
// src/components/ModuleEditorOnboarding.tsx
const ONBOARDING_KEY = 'btb_module_editor_onboarding_seen'

export function ModuleEditorOnboarding() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARDING_KEY)
    if (!seen) setOpen(true)
  }, [])

  function dismiss() {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setOpen(false)
  }

  const steps = [
    {
      nr: 1,
      titel: t('editor.onboarding.step1.title'),    // "Beruf nennen"
      text: t('editor.onboarding.step1.text'),
      icon: '💬'
    },
    {
      nr: 2,
      titel: t('editor.onboarding.step2.title'),    // "Anpassen"
      text: t('editor.onboarding.step2.text'),
      icon: '🎛'
    },
    {
      nr: 3,
      titel: t('editor.onboarding.step3.title'),    // "Anleitung"
      text: t('editor.onboarding.step3.text'),
      icon: '📖'
    },
    {
      nr: 4,
      titel: t('editor.onboarding.step4.title'),    // "Anschließen"
      text: t('editor.onboarding.step4.text'),
      icon: '🔌'
    },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl bg-[#f0e9b6]">
        <DialogHeader>
          <DialogTitle className="text-[#b61818] font-playfair text-2xl">
            🔧 {t('editor.onboarding.title')}
          </DialogTitle>
          <DialogDescription className="text-[#1a1505]">
            {t('editor.onboarding.subtitle')}
          </DialogDescription>
        </DialogHeader>

        {/* Fortschritts-Leiste */}
        <div className="flex gap-2 my-4">
          {steps.map((s, i) => (
            <div key={s.nr} className="flex items-center gap-1 flex-1">
              <div className="w-8 h-8 rounded-full bg-[#2a7cab] text-white
                              flex items-center justify-center text-sm font-bold shrink-0">
                {s.nr}
              </div>
              {i < steps.length - 1 && (
                <div className="h-0.5 flex-1 bg-[#2a7cab] opacity-30" />
              )}
            </div>
          ))}
        </div>

        {/* Schritt-Erklärungen */}
        <div className="space-y-3">
          {steps.map(s => (
            <div key={s.nr} className="flex gap-3 p-3 bg-white rounded-lg">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="font-semibold text-[#1a1505] text-sm">
                  {s.nr} · {s.titel}
                </p>
                <p className="text-sm text-[#4a4030] mt-0.5">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#4a4030] mt-2 italic">
          {t('editor.onboarding.no_commitment')}
          {/* "Du kannst jederzeit zurück. Nichts ist endgültig bis du auf Finalisieren klickst." */}
        </p>

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm"
            onClick={() => localStorage.removeItem(ONBOARDING_KEY)}>
            {t('editor.onboarding.show_again')}
          </Button>
          <Button onClick={dismiss}
            className="bg-[#b61818] hover:bg-[#8b1010] text-white">
            {t('editor.onboarding.start')} →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**i18n-Keys (in workspace.json aller 11 Sprachen):**
```json
{
  "editor": {
    "onboarding": {
      "title": "So funktioniert der Modul-Editor",
      "subtitle": "Der Editor baut in 4 Schritten dein Arbeitsmodul – vollständig auf deinen Beruf zugeschnitten.",
      "step1": { "title": "Beruf nennen", "text": "Du sagst was du tust. Die KI kennt deinen Beruf und baut das vollständige Modul." },
      "step2": { "title": "Anpassen", "text": "Schalte ab was du nicht brauchst. Was gesetzlich Pflicht ist, bleibt immer aktiv." },
      "step3": { "title": "Anleitung", "text": "Die KI schreibt eine Bedienungsanleitung – Schritt für Schritt, in deiner Sprache." },
      "step4": { "title": "Anschließen (optional)", "text": "Beschreibe deine bestehende Software. Der Assistent richtet die Verbindung ein." },
      "no_commitment": "Du kannst jederzeit zurück. Nichts ist endgültig bis du auf 'Finalisieren' klickst.",
      "show_again": "Nochmal zeigen",
      "start": "Los geht's"
    }
  }
}
```

---

### Phase 2: Anpassung im Editor


Nach der Generierung sieht der Nutzer alle Funktionsblöcke mit Toggle:

```typescript
interface FeatureBlock {
  id: string
  name: string
  required: boolean         // gesetzlich notwendig – Toggle disabled
  reason_required?: string  // "Pflicht nach §16 VOB/B" – sichtbar im UI
  optional: boolean         // kann abgewählt werden
  enabled: boolean          // aktueller Status
  fields: FieldDefinition[]
}

// UI: jeder Block zeigt:
// [✓ Toggle] Aufmaßblatt          [Pflicht nach VOB/B §14]
// [✓ Toggle] CNC-Maschinenprotokoll  [Optional – deaktivierbar]
// [○ Toggle] Subunternehmer-Vergabe  [Optional – deaktivierbar]
```

---

### Phase 3: Automatische Bedienungsanleitung

Nach Finalisierung generiert ein zweiter API-Call die Anleitung für das Modul.

**API-Route:** `POST /api/module/generate-guide`

```typescript
// Die Anleitung erklärt das fertig konfigurierte Modul –
// also genau die Blöcke die aktiv sind, mit den Feldern die vorhanden sind.

const GUIDE_PROMPT = `
Schreibe eine Bedienungsanleitung. Klar, freundlich, ohne Fachsprache.
So dass jemand ohne Software-Erfahrung sofort loslegen kann.
Erkläre nur die Funktionen die im übergebenen Modul aktiv sind.
Antworte NUR mit validem JSON.

Struktur:
{
  "title": "Anleitung: [Modulname]",
  "kurzbeschreibung": "...",
  "erster_start": [{ "schritt": 1, "titel": "...", "text": "..." }],
  "interner_modus": [{ "schritt": 1, "titel": "...", "text": "..." }],
  "externer_modus": [{ "schritt": 1, "titel": "...", "text": "..." }],
  "pflichtfelder": [{ "feld": "...", "erklaerung": "...", "rechtsgrundlage": "..." }],
  "integrationen": [{ "name": "...", "wie_verbinden": "...", "wozu": "..." }],
  "haeufige_fragen": [{ "frage": "...", "antwort": "..." }],
  "tipps": ["...", "..."]
}
`
```

**Datenmodell:**
```sql
CREATE TABLE module_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES universe_module_templates NOT NULL,
  language_code TEXT NOT NULL DEFAULT 'de',
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(template_id, language_code)
);
```

**UI: Tab "Anleitung" im Modul-Editor**
- Wird nach Finalisierung automatisch generiert
- Druckbar als PDF
- In 11 Sprachen – beim Commons-Export automatisch übersetzt

---

### Feedback-Loop: Modul verbessern

```typescript
// Mitglieder melden Probleme direkt aus dem Modul heraus
interface ModuleFeedback {
  template_id: string
  type: 'missing_field' | 'broken_integration' | 'guide_error' | 'suggestion'
  description: string
  reported_by: string
}
// → Fließt in Commons-Bibliothek → verbessert Modul für alle Zellen weltweit
```

---

### Phase 4: Integrations-Assistent

Nach der Modul-Finalisierung gibt es einen optionalen letzten Schritt:
**Bestehende Software wirklich anschließen.**

Das Modul weiß bereits welche Integrationen es unterstützt (z.B. DATEV, Doctolib, SAP).
Der Integrations-Assistent fragt jetzt nach den konkreten Begebenheiten des Nutzers
und generiert daraus den fertigen Adapter-Code und die Konfiguration.

**UI: Integrations-Assistent Dialog**

```
┌─────────────────────────────────────────────────────────┐
│  Integration einrichten: DATEV                          │
│                                                         │
│  Beschreibe deine aktuelle Situation:                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Ich nutze DATEV Kanzlei-Rechnungswesen,         │    │
│  │ Mandant-Nr. 1234, Kontenrahmen SKR03,           │    │
│  │ Buchungskreis 01, Geschäftsjahr läuft           │    │
│  │ Januar bis Dezember                             │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  [→ Konfiguration generieren]                           │
└─────────────────────────────────────────────────────────┘
```

**API-Route:** `POST /api/module/generate-integration`

**Wichtiges Architektur-Prinzip:**
```
Die Kalibrierung passiert EINMAL.
Danach läuft alles automatisch – kein Nutzer gibt je wieder etwas manuell ein.

Einmalig:  Nutzer beschreibt seine Software-Umgebung → KI generiert Adapter
Danach:    Jede Transaktion fließt automatisch in die externe Software
           Jede Rechnung geht automatisch an DATEV
           Jeder Termin synchronisiert automatisch mit Doctolib
           Kein manueller Export, kein CSV, kein Copy-Paste

Das System merkt sich die Konfiguration dauerhaft.
Änderungen nur wenn die Software-Umgebung sich ändert.
```

**Zukunftssichere Adapter-Architektur:**

Das Integrations-System ist so gebaut dass es sich anpassen kann
ohne das Modul neu zu bauen – wenn sich eine API ändert, wenn neue
Software auf den Markt kommt, wenn ein Beruf neue gesetzliche
Anforderungen bekommt.

```typescript
// Adapter-Interface: jede Integration implementiert dieses Schema
// Neue Integrationen können hinzugefügt werden ohne bestehende zu berühren

interface IntegrationAdapter {
  id: string                    // 'datev_v2' | 'sap_s4hana' | 'doctolib_v3' | ...
  display_name: string
  version: string               // Versions-Tracking – wenn API sich ändert
  deprecated_at?: Date          // Alte Version läuft weiter bis Nutzer migriert
  
  // Einmalige Kalibrierung
  setup: (config: Record<string, string>) => Promise<SetupResult>
  test_connection: () => Promise<boolean>
  
  // Automatischer Betrieb – läuft ohne Nutzereingriff
  on_invoice_created: (invoice: Invoice) => Promise<void>
  on_appointment_booked: (appointment: Appointment) => Promise<void>
  on_period_closed: (period: Period) => Promise<void>
  sync: () => Promise<SyncResult>
  
  // Migrations-Hook – wenn API-Version sich ändert
  migrate_from?: (old_version: string, old_config: Record<string, string>) => Promise<Record<string, string>>
}

// Adapter-Registry: neue Adapter registrieren sich hier
// Cursor-freundlich: neue Datei in /integrations/ anlegen, importieren, fertig
const ADAPTER_REGISTRY: Record<string, IntegrationAdapter> = {
  datev:    datevAdapter,
  sap:      sapAdapter,
  doctolib: doclibAdapter,
  bea:      beaAdapter,
  // Zukunft: einfach neue Zeile hinzufügen
}
```

**Versionierung und Migration:**
```typescript
// Wenn DATEV eine neue API-Version veröffentlicht:
// 1. Neuer Adapter 'datev_v3' wird in Commons-Bibliothek veröffentlicht
// 2. Nutzer bekommen eine Benachrichtigung: "DATEV hat sich aktualisiert"
// 3. Ein-Klick-Migration: alter Config → neuer Adapter via migrate_from()
// 4. Alter Adapter läuft als deprecated weiter bis alle migriert haben

interface AdapterUpdate {
  adapter_id: string
  from_version: string
  to_version: string
  change_description: string    // "DATEV hat EXTF-Format auf Version 700 aktualisiert"
  migration_automatic: boolean  // true = kein Nutzereingriff nötig
  breaking_changes: string[]    // Was der Nutzer wissen muss
}
```

**KI hilft bei API-Änderungen:**
```typescript
// POST /api/integration/update-adapter
// Wenn eine externe API sich ändert, kann der KI-Generator helfen:
// Nutzer beschreibt was sich geändert hat →
// KI analysiert alten Adapter + neue API-Dokumentation →
// KI generiert aktualisierten Adapter-Code

const UPDATE_PROMPT = `
Du kennst den bestehenden Adapter und die neue API-Version.
Generiere den aktualisierten Adapter-Code der rückwärtskompatibel ist
und alle bestehenden Konfigurationen weiter unterstützt.
`
```

**Commons-Erweiterbarkeit:**
```sql
-- Adapter können von der Community beigetragen werden
-- wie Module – gleiche Commons-Bibliothek-Logik
ALTER TABLE universe_module_templates
  ADD COLUMN integration_adapters JSONB DEFAULT '[]';
  -- ['datev_v2', 'doctolib_v3'] – Adapter die dieses Modul unterstützt

-- Neue Adapter aus der Community
CREATE TABLE integration_adapters (
  id TEXT PRIMARY KEY,           -- 'datev_v3' | 'neue_software_v1'
  display_name TEXT,
  version TEXT,
  code TEXT,                     -- Der Adapter-Code (serverseitig ausgeführt)
  config_schema JSONB,           -- Welche Felder braucht die Kalibrierung?
  contributed_by TEXT,           -- Zelle die ihn beigesteuert hat
  verified BOOLEAN DEFAULT false,
  downloads INTEGER DEFAULT 0,
  deprecated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```



```typescript
const INTEGRATION_SYSTEM_PROMPT = `
Du bist ein Experte für Software-Integrationen und APIs.
Du kennst die technischen Details aller gängigen Business-Software-Systeme:
DATEV, SAP, Doctolib, Tomedo, beA, KV-Connect, ELSTER, Lexware, Sage,
Procore, PlanRadar, GAEB-Online, und alle weiteren.

AUFGABE: Der Nutzer beschreibt seine konkrete Software-Umgebung in natürlicher Sprache.
Du generierst daraus:
1. Die vollständige Konfiguration für die Integration
2. Den Adapter-Code der die BtB-App mit der Software verbindet
3. Eine Schritt-für-Schritt Einrichtungsanleitung

WICHTIG:
- Frage nach was fehlt wenn die Angaben unvollständig sind
- Erkläre was jeder Konfigurationswert bedeutet
- Weise auf Sicherheitsrisiken hin (API-Keys niemals im Frontend)
- Generiere Code der direkt in die Supabase Edge Function eingefügt werden kann

Antworte mit validem JSON.
`

export default async function handler(req: Request) {
  const {
    integration_type,    // 'datev' | 'sap' | 'doctolib' | ...
    user_description,    // "Ich nutze DATEV Kanzlei-Rechnungswesen, Mandant 1234..."
    module_config,       // Das fertige Modul als Kontext
    language = 'de'
  } = await req.json()

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    system: INTEGRATION_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `
Integration: ${integration_type}
Meine Situation: "${user_description}"
Mein Modul: ${JSON.stringify(module_config.display_name)} (${module_config.profession_tags.join(', ')})
Sprache: ${language}

Generiere die vollständige Integrationskonfiguration und den Adapter-Code.
`
    }]
  })

  const text = response.content[0].text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  return new Response(text, { headers: { 'Content-Type': 'application/json' } })
}
```

**Erwartete Ausgabe (Beispiel DATEV):**
```json
{
  "integration": "datev",
  "konfiguration": {
    "mandant_nr": "1234",
    "kontenrahmen": "SKR03",
    "buchungskreis": "01",
    "geschaeftsjahr_start": "01",
    "buchungsstapel_format": "EXTF"
  },
  "adapter_code": "// Supabase Edge Function\n// datev-export/index.ts\n...",
  "env_variables": [
    { "key": "DATEV_API_KEY", "beschreibung": "API-Schlüssel aus DATEV Mein Rechenzentrum", "sicherheit": "Niemals im Frontend verwenden" },
    { "key": "DATEV_MANDANT_NR", "beschreibung": "Deine Mandantennummer: 1234" }
  ],
  "einrichtung": [
    { "schritt": 1, "titel": "API-Key in DATEV beantragen", "text": "..." },
    { "schritt": 2, "titel": "Umgebungsvariablen setzen", "text": "..." },
    { "schritt": 3, "titel": "Verbindung testen", "text": "..." }
  ],
  "was_passiert": "Bei jedem externen Rechnungsabschluss wird ein EXTF-Buchungsstapel an DATEV übermittelt. Der Kontorahmen SKR03 wird automatisch zugeordnet.",
  "hinweise": [
    "DATEV-API erfordert aktiven Wartungsvertrag",
    "Testmodus empfohlen vor Produktivbetrieb"
  ]
}
```

**Datenmodell:**
```sql
CREATE TABLE module_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_module_id UUID REFERENCES universe_member_modules NOT NULL,
  integration_type TEXT NOT NULL,      -- 'datev' | 'sap' | 'doctolib' | ...
  config JSONB NOT NULL,               -- Konfigurationswerte (keine Secrets)
  status TEXT DEFAULT 'configured',    -- configured | active | error
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
  -- API-Keys werden NICHT hier gespeichert – nur in Supabase Vault
);
```

**Sicherheits-Regel im Prompt für Cursor:**
```
API-Keys und Zugangsdaten NIEMALS in der Datenbank speichern.
Ausschließlich in Supabase Vault (supabase.vault.secrets) oder .env Variablen.
Der Integrations-Assistent erklärt dem Nutzer wo er seine Keys einträgt –
er speichert sie niemals selbst.
```

---

# ABSCHNITT 6 – Internationalisierung (i18n)

Die gesamte App – jede Seite, jede Komponente, jede Fehlermeldung, jeder Button, jede Tabelle, jede Notification – ist in 11 Sprachen verfügbar. Das gilt für den SaaS-Kern genauso wie für das Universum-Modul, den Modul-Editor, den Workspace, die Abstimmungsseite, den Solidarfonds und alle zukünftigen Features.

**Keine Ausnahmen:** Wenn etwas gebaut wird, wird es sofort mit i18n-Keys gebaut – nie als Hardcoded-String.

**Sprachen:**
```typescript
export const SUPPORTED_LANGUAGES = [
  { code: 'de', name: 'Deutsch',       nativeName: 'Deutsch',    flag: '🇩🇪', rtl: false },
  { code: 'en', name: 'English',       nativeName: 'English',    flag: '🇬🇧', rtl: false },
  { code: 'zh', name: 'Chinesisch',    nativeName: '中文',        flag: '🇨🇳', rtl: false },
  { code: 'es', name: 'Spanisch',      nativeName: 'Español',    flag: '🇪🇸', rtl: false },
  { code: 'hi', name: 'Hindi',         nativeName: 'हिन्दी',      flag: '🇮🇳', rtl: false },
  { code: 'ar', name: 'Arabisch',      nativeName: 'العربية',    flag: '🇸🇦', rtl: true  },
  { code: 'bn', name: 'Bengalisch',    nativeName: 'বাংলা',       flag: '🇧🇩', rtl: false },
  { code: 'pt', name: 'Portugiesisch', nativeName: 'Português',  flag: '🇧🇷', rtl: false },
  { code: 'ru', name: 'Russisch',      nativeName: 'Русский',    flag: '🇷🇺', rtl: false },
  { code: 'ja', name: 'Japanisch',     nativeName: '日本語',       flag: '🇯🇵', rtl: false },
  { code: 'fr', name: 'Französisch',   nativeName: 'Français',   flag: '🇫🇷', rtl: false },
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']
```

**Setup mit i18next:**
```bash
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector
```

```typescript
// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'de',
    supportedLngs: ['de','en','zh','es','hi','ar','bn','pt','ru','ja','fr'],
    ns: [
      'common',        // Buttons, Navigation, allgemeine UI
      'universe',      // Universum-Modul: Pool, Coins, Zellen
      'workspace',     // Arbeitsbereich, Module, Editor
      'documents',     // Konzept, Satzung, Wirtschaftsanleitung (in-app)
      'errors',        // Fehlermeldungen
      'notifications', // Push/Toast-Meldungen
    ],
    defaultNS: 'common',
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
    interpolation: { escapeValue: false },
  })

export default i18n
```

**RTL-Unterstützung (Arabisch):**
```typescript
// src/App.tsx – direkt in der Root-Komponente
const { i18n } = useTranslation()
const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language)

useEffect(() => {
  document.documentElement.dir = currentLang?.rtl ? 'rtl' : 'ltr'
  document.documentElement.lang = i18n.language
}, [i18n.language])
```

**Namespaces-Struktur:**
```
public/locales/
  de/
    common.json        ← Navigation, Buttons, Datum, Währung
    universe.json      ← Pool, Coins, Zellen, Abstimmung, Solidarfonds
    workspace.json     ← Arbeitsbereich, Module, Editor, Kollaboration
    documents.json     ← Alle BtB-Dokumente (Konzept, Satzung, etc.)
    errors.json        ← Fehlermeldungen
    notifications.json ← Toast/Push-Texte
  en/ [gleiche Struktur]
  zh/ [gleiche Struktur]
  ... [alle 11 Sprachen]
```

**Pflicht-Pattern – jede neue Komponente:**
```typescript
// ✅ IMMER SO
const { t } = useTranslation('universe')
<button>{t('pool.period_close')}</button>
<p>{t('coins.balance', { count: coinBalance })}</p>

// ❌ NIEMALS SO
<button>Periode abschließen</button>
<p>Kontostand: {coinBalance} Coins</p>
```

**Zahlen, Währungen, Datum – lokalisiert:**
```typescript
// Coins immer mit ◈ Symbol
const formatCoins = (amount: number) => `◈ ${amount.toLocaleString(i18n.language)}`

// Euro je nach Sprache formatieren
const formatEuro = (amount: number) =>
  new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(amount)

// Datum lokalisiert
const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(date)
```

**Sprachauswahl-Komponente (in Sidebar und Einstellungen):**
```typescript
export function LanguageSelector() {
  const { i18n } = useTranslation()
  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="bg-[#f0e9b6] border border-[#2a7cab] rounded px-2 py-1 text-sm"
    >
      {SUPPORTED_LANGUAGES.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.nativeName}
        </option>
      ))}
    </select>
  )
}
```

**BtB-Dokumente in der App (Namespace `documents`):**
```typescript
// Konzept, Satzung, Wirtschaftsanleitung etc. werden als
// übersetzte Markdown-Inhalte in der App angezeigt.
// Jedes Dokument ist ein eigener Key im documents-Namespace.
// Mitglieder lesen direkt in der App – kein PDF-Versand nötig.
// Übersetzung der Dokumente erfolgt in einem separaten Schritt
// per KI-Übersetzung und manueller Prüfung.
```

**KI-Generator spricht Nutzersprache:**
```typescript
const { data } = await generateModule({
  description: userInput,
  language: i18n.language  // KI generiert alle Labels in der Sprache des Nutzers
})
```



**Sprachen:**
```typescript
export const SUPPORTED_LANGUAGES = [
  { code: 'de', name: 'Deutsch',    nativeName: 'Deutsch',    flag: '🇩🇪' },
  { code: 'en', name: 'English',    nativeName: 'English',    flag: '🇬🇧' },
  { code: 'zh', name: 'Chinesisch', nativeName: '中文',        flag: '🇨🇳' },
  { code: 'es', name: 'Spanisch',   nativeName: 'Español',    flag: '🇪🇸' },
  { code: 'hi', name: 'Hindi',      nativeName: 'हिन्दी',      flag: '🇮🇳' },
  { code: 'ar', name: 'Arabisch',   nativeName: 'العربية',    flag: '🇸🇦' },
  { code: 'bn', name: 'Bengalisch', nativeName: 'বাংলা',       flag: '🇧🇩' },
  { code: 'pt', name: 'Portugiesisch', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Russisch',   nativeName: 'Русский',    flag: '🇷🇺' },
  { code: 'ja', name: 'Japanisch',  nativeName: '日本語',       flag: '🇯🇵' },
  { code: 'fr', name: 'Französisch', nativeName: 'Français',  flag: '🇫🇷' },
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']
```

**Setup mit i18next:**
```bash
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector
```

```typescript
// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'de',
    supportedLngs: ['de','en','zh','es','hi','ar','bn','pt','ru','ja','fr'],
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
    interpolation: { escapeValue: false },
    // RTL-Unterstützung für Arabisch
    react: { useSuspense: true }
  })

export default i18n
```

**RTL-Unterstützung (Arabisch):**
```typescript
// src/App.tsx
const RTL_LANGUAGES = ['ar']

function App() {
  const { i18n } = useTranslation()
  const isRTL = RTL_LANGUAGES.includes(i18n.language)

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language, isRTL])
  // ...
}
```

**Dateistruktur:**
```
public/locales/
  de/common.json       ← Deutsch (Hauptsprache, vollständig)
  en/common.json
  zh/common.json
  es/common.json
  hi/common.json
  ar/common.json       ← RTL
  bn/common.json
  pt/common.json
  ru/common.json
  ja/common.json
  fr/common.json
```

**Sprachauswahl-Komponente:**
```typescript
// src/components/LanguageSelector.tsx
export function LanguageSelector() {
  const { i18n } = useTranslation()

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="bg-[#f0e9b6] border border-[#2a7cab] rounded px-2 py-1 text-sm"
    >
      {SUPPORTED_LANGUAGES.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.nativeName}
        </option>
      ))}
    </select>
  )
}
```

**KI-Generator spricht die Sprache des Nutzers:**
```typescript
// Beim Modul generieren: aktuelle Sprache mitgeben
const { data } = await generateModule({
  description: userInput,
  language: i18n.language   // KI generiert Labels in der Nutzersprache
})
```

**Modul-Felder sind mehrsprachig:**
```typescript
// Feldbezeichnungen im Modul-Template als i18n-Keys gespeichert
interface FieldDefinition {
  id: string
  label_key: string          // z.B. "module.behandlung.patient"
  label_fallback: string     // Fallback wenn Key nicht übersetzt
  // ...
}
```

**Übersetzungs-Workflow für neue Sprachen:**
```typescript
// Neue Übersetzungen können per KI generiert werden
// POST /api/translations/generate
// { source_lang: 'de', target_lang: 'sw', namespace: 'common' }
// → KI übersetzt den deutschen Namespace in die Zielsprache
// → Ermöglicht spätere Erweiterung auf weitere Sprachen
```

---

## 6. Integration bestehender Software (API-Schicht)

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

**Hinweis für Cursor:**
Das Logo (PNG mit transparentem Hintergrund) wird beim ersten Setup
vom Nutzer erfragt:
"Bitte lade das Back to Balance Logo hoch (PNG, transparenter Hintergrund)"
Es erscheint in Sidebar (40×40px), Login-Screen (80×80px), App-Header.
Auf Hintergrund #f0e9b6 – kein weißer Rahmen, kein Schatten.



Der KI-Modul-Generator ist die wichtigste langfristige Erweiterung der App. Er ist ein eingebautes Cursor das Berufe kennt: Ein Mitglied nennt sein Vorhaben – "Ich bin Allgemeinmediziner", "Wir betreiben eine Schreinerei", "Wir sind ein Maschinenbaubetrieb mit 80 Mitarbeitern" – und das System generiert automatisch ein vollständiges Berufsmodul.

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
  - UI-Komponenten (Cursor-kompatibel)
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
  ui_components JSONB,           -- Cursor-generierbare Komponenten-Specs
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

---

---

# ABSCHNITT 7 – Work-Feed (Öffentliches Arbeitsportfolio)

## Konzept

Kein Social Media. Ein öffentliches Schaufenster der gemeinschaftlichen Arbeit.
Mitglieder zeigen Projekte, Ernte, Handwerk, Körperarbeit, Aufbau.
Ausschließlich über die App befüllbar. Auf der Website public lesbar.

## Route: /universum/feed → WorkFeedPage (in App)

### Post erstellen
```typescript
// Foto hochladen + Caption + automatische Zellenzuweisung
interface CreatePostForm {
  image: File            // Pflicht
  caption: string        // Optional, max 280 Zeichen
  is_public: boolean     // Default: true
  // cell_id: automatisch aus Mitgliedsprofil
}
```

### Feed-Ansicht (in App)
- Masonry-Grid, eigene Posts oben
- Filterbar: Alle Zellen / Eigene Zelle / Land
- Eigene Posts: Bearbeiten / Löschen möglich
- Andere Posts: Reagieren / Kommentieren / Kommentar highlighten

### Reaktionen
- Emoji-Auswahl: 🌱 🙌 💚 ◈ 🏗 🌿
- Kein Zähler-Wettbewerb – nur wer reagiert hat (Avatare)

### Kommentare
- Mitglieder können kommentieren
- **Highlighted Comment:** Ein Mitglied das einen Fehler bemerkt oder
  etwas Wichtiges ergänzen will, kann einen Kommentar highlighten
  → Oliv-Rahmen, erscheint oben in der Kommentarliste
  → Zeigt der Gemeinschaft: "Das ist wichtig zu wissen"
- Nur Mitglieder können highlighten (nicht der Post-Autor selbst)

## Supabase-Tabellen

```sql
CREATE TABLE feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES universe_members NOT NULL,
  cell_id UUID REFERENCES universe_cells NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT CHECK (char_length(caption) <= 280),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE feed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES feed_posts ON DELETE CASCADE,
  member_id UUID REFERENCES universe_members NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, member_id, emoji)
);

CREATE TABLE feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES feed_posts ON DELETE CASCADE,
  member_id UUID REFERENCES universe_members NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  is_highlighted BOOLEAN DEFAULT false,
  highlighted_by UUID REFERENCES universe_members,
  highlighted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_comments ENABLE ROW LEVEL SECURITY;

-- Öffentliche Posts lesbar für alle (auch anonym)
CREATE POLICY "Public posts readable" ON feed_posts
  FOR SELECT USING (is_public = true);

-- Nur Mitglieder können posten
CREATE POLICY "Members can post" ON feed_posts
  FOR INSERT WITH CHECK (member_id = auth.uid());

-- Eigene Posts bearbeiten/löschen
CREATE POLICY "Own posts editable" ON feed_posts
  FOR ALL USING (member_id = auth.uid());
```

## Storage Bucket: feed-images
```
bucket: feed-images (public read, authenticated write)
Pfad: {cell_id}/{member_id}/{timestamp}.jpg
Max Dateigröße: 5 MB
Erlaubte Typen: image/jpeg, image/png, image/webp
```

## API: Öffentlicher Endpunkt für Website

```typescript
// GET /api/public/feed?cell=&country=&limit=20&offset=0
// Gibt zurück: is_public=true Posts mit Zelle, Reaktionszahlen, Kommentaranzahl
// KEIN Auth-Token nötig. Read-only. Keine Mitgliedsdaten außer Zellenname.

interface PublicPost {
  id: string
  cell_name: string
  country: string
  image_url: string
  caption: string
  reaction_counts: Record<string, number>  // { '🌱': 3, '🙌': 2 }
  comment_count: number
  created_at: string
}
```

---

# ZELL-SETUP: Neue Zelle anlegen

Wenn eine neue Zelle angelegt wird, führt die App einen Setup-Wizard durch.
Bankverbindung ist Teil des Setups – jede Zelle verbindet ihr eigenes Konto.

```
Schritt 1: Grunddaten
  Name, Ort, Land, Sprache, Kassenwart zuweisen

Schritt 2: Bankverbindung
  "Verbinde das Konto dieser Zelle"
  → Banking-Provider wählen (FinAPI / GoCardless)
  → IBAN eingeben
  → OAuth-Verbindung zur Bank herstellen
  → Verbindung testen (Kontostand abrufen)
  → Konto in Supabase Vault speichern (verschlüsselt)

Schritt 3: Wirtschaftspositionen definieren
  "Welche Tätigkeiten übt diese Zelle aus?"
  → Mehrfachauswahl + eigene hinzufügen
  Beispiele: Körperarbeit · Lebensmittel · Handwerk · Bildung · IT · Landwirtschaft
  → Jede Position bekommt eine Kategorie für Buchungen und Ausgaben

Schritt 4: Erste Mitglieder einladen
  → Email-Einladungen versenden

Schritt 5: Fertig
  → Zelle ist aktiv, Bankverbindung läuft, Pool-Tracking beginnt
```

```typescript
// Jede Zelle hat ihre eigene Bankverbindung – unbegrenzt viele Zellen
// Dach-Konto ist das Genossenschaftskonto (account_type = 'dach')
// Jedes Zell-Konto ist account_type = 'zelle'

// Beim Zell-Setup: bank_accounts Eintrag anlegen
async function setupCellBankAccount(cellId: string, iban: string, provider: string) {
  // IBAN verschlüsselt in Supabase Vault speichern
  const { data: secret } = await supabase.rpc('vault_create_secret', {
    secret: iban,
    name: `cell_iban_${cellId}`
  })

  await supabase.from('bank_accounts').insert({
    cell_id: cellId,
    account_type: 'zelle',
    iban: `vault:${secret.id}`,   // Referenz auf Vault-Eintrag
    banking_provider: provider,
    active: true
  })
}
```

---

# GEWINN- & VERLUSTRECHNUNG PRO ZELLE

## Konzept

Jede Zelle führt eine einfache interne GuV – damit alle wissen:
Was kommt rein? Was geht raus? Was ist der Netto-Gewinn der an den Pool fließt?

Wenn mehrere Mitglieder verschiedene Tätigkeiten haben (Körperarbeit, Lebensmittel,
Handwerk), werden Ausgaben den jeweiligen Wirtschaftspositionen zugeordnet.
So sieht jeder ob eine Tätigkeit profitabel ist oder andere subventioniert.

```
Wirtschaftsposition: Körperarbeit
  Einnahmen:  1.200 € (externe Behandlungen)
  Ausgaben:     180 € (Öl, Tücher, Raummiete anteilig)
  Rohgewinn:  1.020 €

Wirtschaftsposition: Lebensmittel
  Einnahmen:    800 € (externe Verkäufe)
  Ausgaben:     650 € (Einkauf Bio-Ware, Verpackung)
  Rohgewinn:    150 €

Zelle gesamt:
  Einnahmen:  2.000 €
  Ausgaben:     830 €
  Netto-Pool: 1.170 € → Dreiteilung → Pool-Überweisung
```

## Datenmodell

```sql
-- Wirtschaftspositionen einer Zelle
CREATE TABLE cell_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID REFERENCES universe_cells NOT NULL,
  name TEXT NOT NULL,               -- "Körperarbeit" | "Lebensmittel" | ...
  description TEXT,
  color TEXT,                       -- Farbe für Charts
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cell_id, name)
);

-- Ausgaben einer Zelle – zugeordnet zu Wirtschaftsposition
CREATE TABLE cell_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID REFERENCES universe_cells NOT NULL,
  activity_id UUID REFERENCES cell_activities,   -- welche Wirtschaftsposition
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL,
  supplier_name TEXT,
  receipt_url TEXT,                  -- Foto des Belegs (Supabase Storage)
  bank_transaction_id UUID REFERENCES bank_transactions,  -- wenn per Überweisung
  pool_source TEXT
    CHECK (pool_source IN ('reinvestition','sozial','solidarfonds','extern')),
  created_by UUID REFERENCES universe_members NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Einnahmen einer Zelle – zugeordnet zu Wirtschaftsposition
-- (werden meist automatisch aus bank_transactions gezogen)
CREATE TABLE cell_revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID REFERENCES universe_cells NOT NULL,
  activity_id UUID REFERENCES cell_activities,   -- welche Wirtschaftsposition
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL,
  counterpart_name TEXT,
  bank_transaction_id UUID REFERENCES bank_transactions,  -- Bankbuchung verknüpft
  period_id UUID REFERENCES universe_periods,
  created_by UUID REFERENCES universe_members NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GuV View pro Zelle und Wirtschaftsposition
CREATE VIEW cell_guv AS
SELECT
  ca.cell_id,
  ca.id AS activity_id,
  ca.name AS activity_name,
  COALESCE(SUM(cr.amount), 0) AS einnahmen,
  COALESCE(SUM(ce.amount), 0) AS ausgaben,
  COALESCE(SUM(cr.amount), 0) - COALESCE(SUM(ce.amount), 0) AS rohgewinn
FROM cell_activities ca
LEFT JOIN cell_revenues cr ON cr.activity_id = ca.id
LEFT JOIN cell_expenses ce ON ce.activity_id = ca.id
GROUP BY ca.cell_id, ca.id, ca.name;

-- Pool-Pflicht-Berechnung
CREATE VIEW cell_pool_obligation AS
SELECT
  cell_id,
  SUM(einnahmen) AS einnahmen_gesamt,
  SUM(ausgaben)  AS ausgaben_gesamt,
  SUM(rohgewinn) AS netto_pool,
  SUM(rohgewinn) / 3 AS verguetung_soll,
  SUM(rohgewinn) / 3 AS reinvestition_soll,
  SUM(rohgewinn) / 3 AS sozial_soll
FROM cell_guv
GROUP BY cell_id;

-- RLS
ALTER TABLE cell_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Zellen-Mitglieder sehen GuV" ON cell_expenses
  FOR ALL USING (
    cell_id IN (SELECT cell_id FROM universe_members WHERE id = auth.uid())
  );
CREATE POLICY "Zellen-Mitglieder sehen Einnahmen" ON cell_revenues
  FOR ALL USING (
    cell_id IN (SELECT cell_id FROM universe_members WHERE id = auth.uid())
  );
```

## UI: GuV-Übersicht

```
/universum/guv → CellGuvPage

┌─────────────────────────────────────────────────────┐
│  Gewinn & Verlust  ·  Zelle Freiburg  ·  Q1 2026    │
│                                                     │
│  Körperarbeit                                       │
│    Einnahmen:   1.200 €   Ausgaben:   180 €         │
│    Rohgewinn:   1.020 €   ████████████░░            │
│                                                     │
│  Lebensmittel                                       │
│    Einnahmen:     800 €   Ausgaben:   650 €         │
│    Rohgewinn:     150 €   ██░░░░░░░░░░░░            │
│                                                     │
│  ─────────────────────────────────────────          │
│  Gesamt-Einnahmen:   2.000 €                        │
│  Gesamt-Ausgaben:      830 €                        │
│  Netto-Pool:         1.170 €                        │
│                                                     │
│  Pool-Pflicht diese Periode:    390 € / Drittel     │
│  Bereits überwiesen:            390 €  ✓            │
│  Differenz:                       0 €               │
│                                                     │
│  [Ausgabe erfassen +]  [Einnahme erfassen +]        │
└─────────────────────────────────────────────────────┘
```

## Ausgabe erfassen (einfacher Flow)

```typescript
// Schnelles Erfassen einer Ausgabe mit Belegfoto
interface ExpenseInput {
  title: string
  amount: number
  activity_id: string          // welche Wirtschaftsposition
  date: string
  receipt_photo?: File         // Foto des Kassenbons
  pool_source: string          // aus welchem Topf
}
// → Belegfoto → Supabase Storage
// → Ausgabe gespeichert → GuV aktualisiert sofort
// → Wenn Bankbuchung vorhanden: automatisch verknüpft per Betrag + Datum
```

---

# BANKANBINDUNG & KONTO-ARCHITEKTUR


## Übersicht: Konto-Architektur & Pool-Fluss

```
DACH-KONTO  (Genossenschaft gesamt)
  Alle Zellen überweisen ihren Gesamtgewinn hierher.
  Der Gesamtpool wird gedrittet.
  Der Solidarfonds (10% des Sozial-Drittels) verbleibt hier.
  Der Rest fließt anteilig kategorisiert zurück auf die Zell-Konten.

ZELL-KONTO  (pro Zelle, eigene IBAN)
  Operatives Wirtschaften der Zelle.
  Empfängt aus Dach-Konto:
  ├── Vergütungs-Topf   (Coin-Rücklage – gebunden)
  ├── Reinvestitions-Topf
  └── Sozial-Topf       (ohne Solidarfonds-Anteil)

POOL-FLUSS (monatlich, konfigurierbar):

  Zell-Einnahmen
    - Zell-Ausgaben
    = Zell-Gewinn → Überweisung auf Dach-Konto

  Dach-Konto sammelt Gewinne ALLER Zellen
    = Gesamtpool

  Gesamtpool ÷ 3:
    Vergütung ⅓       → bleibt auf Dach-Konto (Coin-Rücklage, gebunden)
                        Coins werden den Mitgliedern gutgeschrieben
                        Euro-Auszahlung nur auf Antrag aus Dach-Konto
    Reinvestition ⅓   → anteilig zurück auf Zell-Konto (Reinvestitions-Topf)
    Sozial ⅓          → davon 10% → bleibt auf Dach-Konto (Solidarfonds)
                      → Rest anteilig zurück auf Zell-Konto (Sozial-Topf)

HÄUFIGKEIT:
  pool_settlement_interval = 'monthly' (default)
  Konfigurierbar via universe_settings: 'monthly' | 'quarterly'
  GV beschließt Änderung.
  Monatlich empfohlen: Fixkosten laufen monatlich,
  Mitglieder brauchen regelmäßige Liquidität aus Vergütungs-Topf.
```

---

## Bankanbindung: FinAPI (PSD2, alle deutschen Banken)

**KRITISCH: Jede Buchung muss mit Verwendungszweck übertragen werden.**
Der Verwendungszweck ist das einzige Feld das eine automatische Zuordnung
zu Pool-Anteilen, Bestellungen und Mitgliedern ermöglicht.

```typescript
// supabase/functions/banking-sync/index.ts
import Anthropic from '@anthropic-ai/sdk'

// FinAPI liefert pro Transaktion:
interface FinAPITransaction {
  id: string
  accountId: string
  valueDate: string              // Buchungsdatum
  bankBookingDate: string        // Wertstellungsdatum
  amount: number                 // positiv = Eingang, negativ = Ausgang
  purpose: string                // VERWENDUNGSZWECK ← kritisch
  counterpartName: string        // Absender/Empfänger Name
  counterpartIban: string        // Absender/Empfänger IBAN
  counterpartBic: string
  type: string                   // 'Transfer' | 'DirectDebit' | 'StandingOrder' ...
  isNew: boolean
  isPotentialDuplicate: boolean
}

// In DB speichern – alle Felder, besonders reference/purpose
interface BankTransaction {
  id: string
  cell_id: string
  account_type: 'dach' | 'zelle'   // welches Konto
  external_id: string               // FinAPI-ID, UNIQUE
  date: string
  amount: number
  counterpart_name: string
  counterpart_iban: string
  reference: string                 // VERWENDUNGSZWECK – darf NIE leer sein
  transaction_type: string
  balance_after: number
  category: string                  // auto-kategorisiert (s.u.)
  pool_allocated: boolean
  raw_data: Record<string, unknown> // vollständiger FinAPI-Response
}
```

**Auto-Kategorisierung per Verwendungszweck:**
```typescript
// KI-gestützte Kategorisierung – Verwendungszweck wird analysiert
const AUTO_CATEGORIES: Array<{
  pattern: RegExp
  category: string
  pool_target: 'verguetung' | 'reinvestition' | 'sozial' | 'solidarfonds' | 'extern' | 'coin_auszahlung'
}> = [
  // Interne Transfers
  { pattern: /btb.coin.auszahl|coin.auszahlung/i,  category: 'coin_auszahlung',      pool_target: 'verguetung' },
  { pattern: /btb.soli|solidarfonds/i,             category: 'solidarfonds',          pool_target: 'solidarfonds' },
  { pattern: /btb.reinvest/i,                      category: 'reinvestition_transfer', pool_target: 'reinvestition' },
  { pattern: /btb.sozial/i,                        category: 'sozial_transfer',        pool_target: 'sozial' },
  // Fixkosten (Ausgaben)
  { pattern: /steuerberater|stb\.|datev/i,         category: 'fixkosten_steuer',      pool_target: 'reinvestition' },
  { pattern: /versicherung/i,                      category: 'fixkosten_versicherung', pool_target: 'reinvestition' },
  { pattern: /miete|pacht|raummiete/i,             category: 'fixkosten_miete',        pool_target: 'reinvestition' },
  { pattern: /software|supabase|github|hosting/i,  category: 'fixkosten_software',    pool_target: 'reinvestition' },
  // Bestellungen (Ausgaben)
  { pattern: /bestellung|order|lieferung/i,        category: 'bestellung',             pool_target: 'reinvestition' },
  // Einnahmen → Dreiteilung auslösen
  // Alle nicht erkannten Eingänge gelten als externe Einnahmen
]

async function categorize(transaction: BankTransaction): Promise<string> {
  // 1. Regelbasiert prüfen
  for (const rule of AUTO_CATEGORIES) {
    if (rule.pattern.test(transaction.reference)) {
      return rule.category
    }
  }

  // 2. Wenn unklar: KI-Analyse des Verwendungszwecks
  if (transaction.amount > 0) {
    // Eingang ohne klare Kategorie → KI fragen
    const result = await classifyWithAI(transaction.reference, transaction.counterpart_name)
    return result.category
  }

  return 'unbekannt' // Manuell zuordnen in der App
}

// KI-Klassifikation als Fallback
async function classifyWithAI(reference: string, counterpart: string): Promise<{ category: string }> {
  const client = new Anthropic()
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `Kategorisiere diese Bankbuchung für eine Genossenschaft.
Verwendungszweck: "${reference}"
Absender: "${counterpart}"
Kategorien: externe_einnahme | coin_auszahlung | fixkosten | bestellung | soli | unbekannt
Antworte NUR mit dem Kategorienamen.`
    }]
  })
  return { category: response.content[0].text.trim() }
}
```

**Pool-Aufteilung bei Einnahmen:**
```typescript
// Wenn eine externe Einnahme erkannt wird → automatisch aufteilen
async function allocateToPool(transaction: BankTransaction, settings: Settings) {
  const net = transaction.amount * (1 - settings.material_cost_deduction_pct / 100)
  const third = net / 3
  const solidarfonds_share = third * (settings.solidarity_fund_pool_pct / 100)  // default 10%

  await supabase.from('pool_allocations').insert({
    transaction_id: transaction.id,
    verguetung_anteil:    third,
    reinvestition_anteil: third,
    sozial_anteil:        third - solidarfonds_share,
    solidarfonds_anteil:  solidarfonds_share,
    coin_ruecklage:       third,     // Vergütungsanteil = Coin-Rücklage
    allocated_at: new Date(),
    allocated_by: 'auto'
  })

  // Mitglieder benachrichtigen
  await notify('new_pool_income', { amount: transaction.amount, net })
}
```

---

## Datenmodell: Bankkonten & Töpfe

```sql
-- Bankkonten (Dach + alle Zellen)
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID REFERENCES universe_cells,      -- NULL = Dach-Konto
  account_type TEXT NOT NULL
    CHECK (account_type IN ('dach', 'zelle')),
  iban TEXT NOT NULL,                           -- verschlüsselt in Supabase Vault
  bank_name TEXT,
  banking_provider TEXT DEFAULT 'finapi',
  finapi_account_id TEXT,                       -- FinAPI interne ID
  last_sync TIMESTAMPTZ,
  kassenwart_id UUID REFERENCES universe_members,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Alle Bankbuchungen – MIT Verwendungszweck
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES bank_accounts NOT NULL,
  external_id TEXT UNIQUE NOT NULL,             -- FinAPI-ID
  date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,                -- positiv=Eingang, negativ=Ausgang
  counterpart_name TEXT,
  counterpart_iban TEXT,
  reference TEXT,                               -- VERWENDUNGSZWECK
  transaction_type TEXT,
  balance_after NUMERIC(12,2),
  category TEXT DEFAULT 'unbekannt',
  pool_allocated BOOLEAN DEFAULT false,
  manually_reviewed BOOLEAN DEFAULT false,
  raw_data JSONB,                               -- vollständiger API-Response
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pool-Aufteilung pro Buchung
CREATE TABLE pool_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES bank_transactions NOT NULL,
  period_id UUID REFERENCES universe_periods,
  verguetung_anteil    NUMERIC(12,2) DEFAULT 0,
  reinvestition_anteil NUMERIC(12,2) DEFAULT 0,
  sozial_anteil        NUMERIC(12,2) DEFAULT 0,
  solidarfonds_anteil  NUMERIC(12,2) DEFAULT 0,
  coin_ruecklage       NUMERIC(12,2) DEFAULT 0,  -- gebunden
  allocated_at TIMESTAMPTZ DEFAULT now(),
  allocated_by TEXT DEFAULT 'auto'               -- 'auto' | member_id
);

-- Aktueller Pool-Stand als View
CREATE VIEW pool_current_state AS
SELECT
  ba.cell_id,
  ba.account_type,
  SUM(pa.verguetung_anteil)    AS verguetung_gesamt,
  SUM(pa.reinvestition_anteil) AS reinvestition_gesamt,
  SUM(pa.sozial_anteil)        AS sozial_gesamt,
  SUM(pa.solidarfonds_anteil)  AS solidarfonds_gesamt,
  SUM(pa.coin_ruecklage)       AS coin_ruecklage_gesamt
FROM pool_allocations pa
JOIN bank_transactions bt ON bt.id = pa.transaction_id
JOIN bank_accounts ba ON ba.id = bt.account_id
GROUP BY ba.cell_id, ba.account_type;

-- RLS
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_allocations ENABLE ROW LEVEL SECURITY;

-- Buchungsdetails: nur Kassenwart/Vorstand
CREATE POLICY "Kassenwart sieht Buchungen" ON bank_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM universe_members m
      JOIN bank_accounts ba ON ba.id = bank_transactions.account_id
      WHERE m.id = auth.uid()
      AND (ba.cell_id = m.cell_id OR ba.account_type = 'dach')
      AND m.role IN ('kassenwart', 'vorstand', 'admin')
    )
  );

-- Pool-Stände: alle Mitglieder (Transparenz-Prinzip)
CREATE POLICY "Mitglieder sehen Pool-Stände" ON pool_allocations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM universe_members WHERE id = auth.uid())
  );
```

---

## Betrugsprävention: Soll-Ist-Vergleich

```typescript
// Die App berechnet automatisch was eine Zelle basierend auf
// ihren Buchungseingängen an den Pool überweisen müsste.
// Weicht die tatsächliche Überweisung ab → sichtbare Differenz.

interface PoolCompliance {
  cell_id: string
  period_id: string
  income_recognized: number      // Eingänge laut Bankanbindung
  pool_transfer_required: number // Was überwiesen werden müsste
  pool_transfer_actual: number   // Was tatsächlich überwiesen wurde
  difference: number             // Differenz – sichtbar für alle Mitglieder
  status: 'ok' | 'ausstehend' | 'differenz'
}

// Sichtbar für: alle Mitglieder der Zelle + Genossenschafts-Admin
// Soziale Kontrolle: Betrug geht nicht ohne Mitwissen aller Zell-Mitglieder
// Technische Kontrolle: Buchungen sind durch Bankanbindung objektiv verifiziert
```

---

## UI: Pool-Übersicht (alle Mitglieder)

```
Dach-Konto Genossenschaft:
┌─────────────────────────────────────────────────────┐
│  ◈ Coin-Rücklage:         1.460 €  [gebunden]       │
│  ❤ Solidarfonds:           584 €  [reserviert]      │
└─────────────────────────────────────────────────────┘

Zell-Konto Freiburg:
┌─────────────────────────────────────────────────────┐
│  🏗 Reinvestition:         1.460 €  [frei]           │
│  💚 Sozial & Öko:            876 €  [frei]           │
│  ─────────────────────────────────────────          │
│  Kontostand gesamt:        2.336 €                  │
│  Letzte Buchung: heute · +250 € · Körperarbeit      │
│  [Alle Buchungen →]   [Bestellung anlegen →]        │
└─────────────────────────────────────────────────────┘
```

---

## Bestellwesen (Zell-autonom)

```sql
CREATE TABLE cell_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID REFERENCES universe_cells NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  supplier_name TEXT,
  total_amount NUMERIC(12,2) NOT NULL,
  pool_source TEXT NOT NULL
    CHECK (pool_source IN ('reinvestition', 'sozial', 'solidarfonds')),
  status TEXT DEFAULT 'entwurf'
    CHECK (status IN ('entwurf','beantragt','freigegeben',
                      'bestellt','geliefert','abgeschlossen','abgelehnt')),
  created_by UUID REFERENCES universe_members NOT NULL,
  approved_by UUID[],
  suggested_reference TEXT,  -- vorgeschlagener Verwendungszweck für Überweisung
                             -- z.B. "BTB-REINVEST Saatgut Bio 2026-03"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Freigaben
CREATE TABLE cell_order_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES cell_orders ON DELETE CASCADE,
  member_id UUID REFERENCES universe_members NOT NULL,
  decision TEXT CHECK (decision IN ('freigegeben','abgelehnt')),
  comment TEXT,
  decided_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cell_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Zelle sieht eigene Bestellungen" ON cell_orders
  FOR ALL USING (
    cell_id IN (SELECT cell_id FROM universe_members WHERE id = auth.uid())
  );
```

**Freigabe-Logik (aus universe_settings):**
```typescript
// order_approval_threshold_single = 500 € → 1 Freigabe nötig
// order_approval_threshold_double = 2000 € → 2 Freigaben nötig (Vier-Augen)
// Darüber → GV-Beschluss
```

**Wichtig: Bestellungen schlagen automatisch einen Verwendungszweck vor:**
```
"BTB-REINVEST [Kurzbeschreibung] [Datum]"
"BTB-SOZIAL [Kurzbeschreibung] [Datum]"
```
So werden ausgehende Überweisungen automatisch der richtigen Buchungskategorie zugeordnet.

---

## Pool-Fluss zwischen Zellen (inter_cell_transfers)

```sql
CREATE TABLE inter_cell_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_cell_id UUID REFERENCES universe_cells,   -- NULL = Dach-Konto
  to_cell_id UUID REFERENCES universe_cells NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  pool_source TEXT NOT NULL CHECK (pool_source IN ('reinvestition','sozial')),
  period_id UUID REFERENCES universe_periods,
  gv_beschluss_id UUID,
  status TEXT DEFAULT 'geplant'
    CHECK (status IN ('geplant','ausgeloest','bestaetigt')),
  suggested_reference TEXT,   -- "BTB-REINVEST Periode Q1-2026 Zelle Freiburg"
  transfer_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

```
Ablauf Periodenabschluss:
1. GV beschließt Verteilung → Abstimmung in App
2. App berechnet Anteil jeder Zelle + generiert Überweisungsliste
3. Kassenwart sieht: [Zelle] [Betrag] [Verwendungszweck] [Status]
4. Kassenwart löst Überweisungen manuell im Online-Banking aus
   (mit vorgeschlagenem Verwendungszweck → automatische Zuordnung)
5. FinAPI erkennt Eingang → App bestätigt Transfer automatisch
```


---

# COIN-AUSZAHLUNG & SOZIALANTEIL-MECHANIK

## Konzept: Auszahlung vollautomatisch – kein Kassenwart nötig

Kein Antragsprozess. Kein menschlicher Bestätigungs-Schritt. Kein Flaschenhals.

Ein Kassenwart der jede Auszahlung bestätigt generiert selbst Stunden, muss
vertreten werden und widerspricht dem Dezentralitätsprinzip. Die App prüft
Deckung und löst die Überweisung selbstständig über FinAPI PIS aus.

```
Mitglied:  Tippt "200 €" im Wallet → bestätigt mit PIN/Biometrie
           → App prüft: IBAN verifiziert? ✓
           → App prüft: Coin-Deckung ausreichend? ✓
           → App prüft: Coin-Rücklage deckt Betrag? ✓
           → Überweisung direkt per FinAPI PIS ausgelöst
           → Status: 'ausgeloest' – sofort für alle sichtbar
Bank:      Überweisung landet beim Mitglied (1–2 Werktage)
App:       Bank-Sync erkennt Abgang per Verwendungszweck
           → Coins ausgebucht → Wallet in Realtime aktualisiert
```

**FinAPI PIS (Payment Initiation Service):**
```typescript
// supabase/functions/payout-execute/index.ts
export default async function handler(req: Request) {
  const { member_id, amount_eur, coin_ids } = await req.json()

  // Nur das Mitglied selbst darf ausführen
  if (req.auth.uid !== member_id) return error({
    code: 'UNAUTHORIZED',
    title: 'Keine Berechtigung',
    message: 'Du kannst nur deine eigenen Coins auszahlen.'
  })

  // 1. IBAN verifiziert?
  const member = await getMember(member_id)
  if (!member.iban_verified) return error({
    code: 'IBAN_NOT_VERIFIED',
    title: 'IBAN nicht verifiziert',
    message: 'Bitte bestätige einmalig deine IBAN in den Profileinstellungen.',
    action: 'Zu den Einstellungen →'
  })

  // 2. Coin-Gegenwert deckt Betrag?
  const coins = await getCoins(coin_ids)
  const total_eur = coins.reduce((s,c) => s + c.eur_equivalent, 0)
  if (total_eur < amount_eur) return error({
    code: 'INSUFFICIENT_COINS',
    title: 'Coin-Gegenwert zu niedrig',
    message: `Deine gewählten Coins haben einen Gegenwert von ${total_eur} €. Du hast ${amount_eur} € angefragt.`,
    detail: `Coins werden mit ihrem historischen Wert berechnet – dem Stundensatz der Periode in der sie verdient wurden.`,
    action: 'Weniger Betrag eingeben oder weitere Coins auswählen'
  })

  // 3. Pool-Rücklage ausreichend?
  const coin_type = coins[0].coin_type
  const coverage = await checkPoolCoverage(coin_type, amount_eur)
  if (!coverage.sufficient) return error({
    code: 'POOL_COVERAGE_INSUFFICIENT',
    title: coin_type === 'soli' ? 'Sozialanteil-Rücklage nicht ausreichend' : 'Coin-Rücklage nicht ausreichend',
    message: `Aktuell verfügbar: ${coverage.available} €. Angefragt: ${amount_eur} €.`,
    detail: coin_type === 'soli'
      ? 'Die Sozialanteil-Rücklage wird durch eingehende Pool-Zahlungen aufgefüllt. Sie steht nach dem nächsten Pool-Settlement zur Verfügung.'
      : 'Die Coin-Rücklage entspricht dem Vergütungsanteil des Pools. Sie wächst mit jeder neuen Einnahme der Zelle.',
    available: coverage.available,
    next_settlement: coverage.next_settlement_date
  })

  // 4. Entfällt: Kein Tageslimit – Coin-Rücklage deckt jederzeit alle Verbindlichkeiten
  const settings = await getSettings()
  // Kein Tageslimit: Deckung durch Coin-Rücklage ist die einzige Schranke

  // Kein Monatslimit: Mitglied kann jederzeit den vollen Gegenwert seiner Coins auszahlen

  // 5. Verwendungszweck
  const reference = coin_type === 'soli'
    ? `BTB-SOLI-AZ-${member_id.slice(0,8)}-${date()}`
    : `BTB-COIN-AZ-${member_id.slice(0,8)}-${date()}`

  // 6. Überweisung per FinAPI PIS – vollautomatisch
  const transfer = await finapi.initiatePayment({
    sourceAccountId: DACH_KONTO_ID,
    recipientIban:   member.iban,
    amount:          amount_eur,
    purpose:         reference,
    recipientName:   member.full_name
  })

  // 7. Coins sperren + Log erstellen
  await lockCoins(coin_ids)
  await logPayout({ member_id, amount_eur, coin_type, reference,
    bank_transfer_id: transfer.id, executed_by: 'system' })

  return ok({ reference })
}
```

**Sicherheit ohne Kassenwart:**
```
1. Biometrie/PIN beim Auslösen         – nur das Mitglied selbst
2. IBAN-Verifikation (einmalig)        – kein Fremdziel möglich
3. Coin-Deckungsprüfung                – kein Überziehen möglich
4. Pool-Rücklage-Prüfung              – kein Überziehen des Dach-Kontos
5. Vollständige Coin-Rücklage          – strukturell sichergestellt, keine Limits nötig
6. Vollständiges Audit-Log             – alle Auszahlungen transparent
7. IBAN-Änderung: GV-Beschluss nötig  – verhindert Umleitung

Kein Flaschenhals. Kein Single Point of Failure.
```

**UI: Ablehnungsmeldung in der App**

Jede Ablehnung zeigt ein Modal mit drei Ebenen – Titel, verständliche Erklärung,
und wenn möglich eine konkrete Handlungsempfehlung:

```
┌─────────────────────────────────────────────────────┐
│  ⚠  Coin-Rücklage nicht ausreichend                 │
│                                                     │
│  Aktuell verfügbar: 143 €                           │
│  Angefragt:         200 €                           │
│                                                     │
│  Die Coin-Rücklage wächst mit jeder neuen           │
│  Einnahme der Zelle. Nächstes Pool-Settlement:      │
│  01. April 2026                                     │
│                                                     │
│  [Betrag anpassen]   [Schließen]                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ⚠  IBAN nicht verifiziert                          │
│                                                     │
│  Deine IBAN muss einmalig bestätigt werden          │
│  bevor Auszahlungen möglich sind.                   │
│                                                     │
│  Das schützt vor Fehlüberweisungen und ist          │
│  einmalig in den Profileinstellungen nötig.         │
│                                                     │
│  [Jetzt verifizieren →]                             │
└─────────────────────────────────────────────────────┘
```

Die App schlägt immer den maximal möglichen Betrag vor wenn das
ursprünglich gewünschte nicht geht.

**Settings:**
```
payout_iban_change_requires 'gv'   – IBAN-Änderung braucht GV-Beschluss
                                     (einzige operative Schranke neben Deckung)
```

**Kassenwart-Rolle neu:** Keine operativen Auszahlungen mehr.
Verantwortlich für: FinAPI-Einrichtung, Jahresabschluss, Steuerberater, Reporting.

---

## Wallet: Vollständige Aufschlüsselung

```
Mein Wallet  ·  Johannes

Gesamt:  ◈ 47 Coins  (= 658 € historischer Gegenwert)

Aufschlüsselung:
  Periode 3  (14 €/h)   ◈ 12 Coins  = 168 €   [arbeit]
  Periode 6  (16 €/h)   ◈ 15 Coins  = 240 €   [arbeit]
  Periode 9  (18 €/h)   ◈ 10 Coins  = 180 €   [arbeit]
  Sozialleistung         ◈ 10 Coins  = 180 €   [soli]  ← eigene Farbe

Interne Kaufkraft:
  47 Coins bei aktuellem Stundensatz 18 €/h
  = 47 × 0,25 kg Kartoffeln (EK 4,50 €/kg)
  = 195 Minuten Körperarbeit intern

[Auszahlung beantragen]   [Intern ausgeben]
```

---

## Soli-Coins: Begleitung in die Gemeinschaft

Wer aus dem Sozialanteil vergütet wird – Begleitung obdachloser Menschen,
Pflegearbeit, Krisenunterstützung – bekommt Soli-Coins.

Diese funktionieren genauso wie normale Coins:
- Intern ausgeben: zum EK-Preis, wie alle anderen Coins
- Euro-Auszahlung beantragen: möglich, Euro kommt aus Sozialanteil-Rücklage

Der Unterschied ist buchhalterisch, nicht praktisch:
`coin_type = 'soli'` → Euro-Deckung aus Sozialanteil-Rücklage auf Dach-Konto
`coin_type = 'arbeit'` → Euro-Deckung aus Vergütungs-Coin-Rücklage

```sql
-- Sozialanteil-Rücklage (auf Dach-Konto, getrennt von Solidarfonds)
-- Finanziert: Soli-Coin-Auszahlungen, Begleitungsleistungen, Krisenarbeit
-- Sichtbar in der App für alle Mitglieder (Transparenzprinzip)

ALTER TABLE pool_allocations
  ADD COLUMN IF NOT EXISTS sozial_ruecklage NUMERIC(12,2) DEFAULT 0;
  -- Teil des Sozialdrittels der auf Dach-Konto verbleibt
  -- (nicht der Solidarfonds, sondern der freie Sozialanteil als Rücklage)
```

---

## UI: Kassenwart-Queue

```
/universum/kassenwart → KassenwartPage

┌─────────────────────────────────────────────────────┐
│  Offene Auszahlungsanfragen                         │
│                                                     │
│  ● Johannes S.  200 €  Coin-Auszahlung  [arbeit]   │
│    IBAN: DE89... · Verwendungszweck: BTB-COIN-AZ-.. │
│    [Ausführen]  [Zurückstellen]                     │
│                                                     │
│  ● Maria K.     150 €  Soli-Auszahlung  [soli]     │
│    IBAN: DE42... · Verwendungszweck: BTB-SOLI-AZ-.. │
│    [Ausführen]  [Zurückstellen]                     │
│                                                     │
│  Verfügbare Rücklagen (Dach-Konto):                 │
│  ◈ Coin-Rücklage:      1.460 €  [für arbeit-Coins] │
│  💚 Sozialanteil:        584 €  [für soli-Coins]   │
│  ❤ Solidarfonds:        438 €  [für Soli-Leistung] │
└─────────────────────────────────────────────────────┘
```

---

## API-Route: Auszahlung auslösen

```typescript
// POST /api/payout/request  (Mitglied)
interface PayoutRequest {
  member_id: string
  amount_eur: number
  coin_ids: string[]       // welche Coins werden eingelöst
  iban: string             // aus Mitgliedsprofil vorbelegt
}

// POST /api/payout/execute  (nur Kassenwart/Vorstand)
interface PayoutExecute {
  payout_request_id: string
  // App generiert:
  // - Betrag
  // - Ziel-IBAN
  // - Verwendungszweck: "BTB-COIN-AZ-{member_id}-{period}-{date}"
  //   oder:             "BTB-SOLI-AZ-{member_id}-{date}"
  // Kassenwart überträgt ins Online-Banking
  // Markiert als 'ausgeloest'
}

// Wenn Bank-Sync die Buchung erkennt:
// → status = 'bestaetigt'
// → Coins werden aus Ledger ausgebucht
// → Wallet aktualisiert sich in Realtime (Supabase Realtime)

CREATE TABLE payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES universe_members NOT NULL,
  amount_eur NUMERIC(12,2) NOT NULL,
  coin_type TEXT NOT NULL CHECK (coin_type IN ('arbeit', 'soli')),
  coin_ids UUID[],                    -- welche Ledger-Einträge
  iban TEXT NOT NULL,
  status TEXT DEFAULT 'offen'
    CHECK (status IN ('offen', 'ausgeloest', 'bestaetigt', 'zurueckgestellt')),
  suggested_reference TEXT,           -- Verwendungszweck für Kassenwart
  executed_by UUID REFERENCES universe_members,  -- Kassenwart
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: nur Kassenwart/Vorstand sieht alle Anfragen
-- Mitglied sieht nur eigene
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mitglied sieht eigene Anfragen" ON payout_requests
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY "Kassenwart sieht alle" ON payout_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM universe_members
      WHERE id = auth.uid()
      AND role IN ('kassenwart', 'vorstand', 'admin')
    )
  );
```

---

## Transparenz: Sozialanteil-Stand für alle sichtbar

```typescript
// Alle Mitglieder sehen in der App:
// - Sozialanteil-Rücklage aktuell (€)
// - Solidarfonds aktuell (€)
// - Letzte Soli-Auszahlungen (Betrag + Zweck, kein Name)
// - Wofür der Sozialanteil verwendet wurde (kategorisiert)

// Kategorien für Sozialanteil-Verwendung:
type SocialUseCategory =
  | 'begleitung_obdachlos'    // Begleitung in die Gemeinschaft
  | 'krisenunterstuetzung'    // akute Notlage
  | 'pflege_fuersorge'        // Pflegearbeit intern
  | 'solidarleistung'         // allg. Solidarfonds-Auszahlung
  | 'gemeinschaftsprojekt'    // Zell-Gemeinschaftsprojekt
  | 'oekologisch'             // Öko-Investition
```


---

# PROTOKOLL-SYSTEM: Vollständige Nachvollziehbarkeit

## Konzept

Jede Transaktion, jede Ablehnung, jede Pool-Bewegung, jede Coin-Gutschrift
hinterlässt einen Protokolleintrag. Fehler sind immer rückverfolgbar –
wann, warum, wer, welcher Betrag, welcher Zustand des Systems zum Zeitpunkt.

Vier getrennte Protokolle, je nach Kontext:

```
1. COIN-PROTOKOLL       – jede Coin-Bewegung eines Mitglieds
2. POOL-PROTOKOLL       – jede Pool-Bewegung der Zelle / Genossenschaft
3. ZAHLUNGS-PROTOKOLL   – jede Überweisung (rein + raus)
4. SYSTEM-PROTOKOLL     – technische Fehler, API-Probleme, abgelehnte Aktionen
```

---

## 1. Coin-Protokoll (pro Mitglied)

```sql
CREATE TABLE coin_protocol (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES universe_members NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),

  -- Was passiert ist
  event_type TEXT NOT NULL CHECK (event_type IN (
    'earned',           -- Stunden abgerechnet → Coins gutgeschrieben
    'spent_internal',   -- Intern ausgegeben (Lebensmittel, Dienstleistung)
    'payout_requested', -- Auszahlung angefragt
    'payout_executed',  -- Überweisung ausgelöst
    'payout_confirmed', -- Bank-Eingang bestätigt
    'payout_rejected',  -- Ablehnung mit Grund
    'soli_received',    -- Soli-Coin erhalten
    'correction'        -- manuelle Korrektur mit Begründung
  )),

  -- Coin-Details
  coins_delta   NUMERIC(10,4),          -- positiv = gutgeschrieben, negativ = abgebucht
  coin_type     TEXT,                   -- 'arbeit' | 'soli'
  eur_rate      NUMERIC(10,4),          -- historischer €-Wert zum Zeitpunkt
  eur_amount    NUMERIC(12,2),          -- coins_delta × eur_rate
  period_id     UUID REFERENCES universe_periods,

  -- Kontext
  balance_before NUMERIC(10,4),        -- Coin-Stand vorher
  balance_after  NUMERIC(10,4),        -- Coin-Stand nachher
  pool_coverage_at_time NUMERIC(12,2), -- Rücklage zum Zeitpunkt (für Nachvollziehbarkeit)

  -- Bei Ablehnungen
  rejection_code    TEXT,              -- 'INSUFFICIENT_COINS' | 'POOL_COVERAGE' | 'IBAN_NOT_VERIFIED'
  rejection_reason  TEXT,              -- menschlich lesbare Begründung
  rejection_detail  JSONB,             -- alle Zahlen zum Zeitpunkt

  -- Referenzen
  bank_transaction_id UUID REFERENCES bank_transactions,
  payout_request_id   UUID REFERENCES payout_requests,
  time_entry_id       UUID REFERENCES universe_time_entries,
  created_by          TEXT DEFAULT 'system'  -- 'system' | member_id
);
```

**UI: Mein Coin-Protokoll**
```
/wallet/protokoll → MemberCoinProtocol

Datum        Ereignis                    Coins      €-Wert   Stand
─────────────────────────────────────────────────────────────────
26.03.2026   Stunden abgerechnet        +22 ◈      +352 €   47 ◈
24.03.2026   Körperarbeit intern         −2 ◈       −32 €   25 ◈
20.03.2026   Auszahlung bestätigt       −14 ◈      −196 €   27 ◈
18.03.2026   Auszahlung ausgelöst       [ausstehend]         41 ◈
15.03.2026   ✗ Ablehnung: IBAN nicht verifiziert    0    0 €   41 ◈
             → Bitte IBAN einmalig in Profileinstellungen bestätigen

[Filter: Alle · Einnahmen · Ausgaben · Ablehnungen]
[Export als CSV]
```

---

## 2. Pool-Protokoll (pro Zelle + Genossenschaft)

```sql
CREATE TABLE pool_protocol (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cell_id UUID REFERENCES universe_cells,   -- NULL = Dach-Konto
  account_type TEXT,                         -- 'dach' | 'zelle'
  timestamp TIMESTAMPTZ DEFAULT now(),

  event_type TEXT NOT NULL CHECK (event_type IN (
    'income_received',        -- Externe Einnahme eingegangen
    'pool_allocated',         -- Dreiteilung berechnet
    'settlement_executed',    -- Pool-Settlement (monatlich)
    'reinvest_transferred',   -- Reinvestition an Zelle überwiesen
    'sozial_transferred',     -- Sozialanteil an Zelle überwiesen
    'solidarfonds_allocated', -- Solidarfonds-Anteil gebucht
    'coin_ruecklage_updated', -- Coin-Rücklage angepasst
    'fixkosten_paid',         -- Fixkosten-Ausgabe
    'order_paid',             -- Bestellung bezahlt
    'correction'
  )),

  -- Beträge vorher / nachher pro Topf
  verguetung_before   NUMERIC(12,2),  verguetung_after   NUMERIC(12,2),
  reinvest_before     NUMERIC(12,2),  reinvest_after     NUMERIC(12,2),
  sozial_before       NUMERIC(12,2),  sozial_after       NUMERIC(12,2),
  solidarfonds_before NUMERIC(12,2),  solidarfonds_after NUMERIC(12,2),

  -- Was ausgelöst hat
  amount              NUMERIC(12,2),
  description         TEXT,
  bank_transaction_id UUID REFERENCES bank_transactions,
  period_id           UUID REFERENCES universe_periods,
  triggered_by        TEXT DEFAULT 'system'
);
```

**UI: Pool-Protokoll (alle Mitglieder sichtbar)**
```
/universum/pool/protokoll → PoolProtocol

Datum        Ereignis                     Vergütung  Reinvest   Sozial   Soli
──────────────────────────────────────────────────────────────────────────────
01.03.2026   Settlement März              +2.508 €   +2.508 €  +2.258 € +251 €
26.02.2026   Einnahme: Körperarbeit 700 €   +233 €     +233 €    +210 €  +23 €
20.02.2026   Fixkosten Steuerberater          —        −350 €       —      —
15.02.2026   Coin-Auszahlung Johannes       −196 €        —         —      —
01.02.2026   Settlement Februar           +1.672 €   +1.672 €  +1.505 € +167 €

[Filter: Alle · Einnahmen · Ausgaben · Settlements · Nach Topf]
[Zeitraum: März 2026 ▾]
```

---

## 3. Zahlungs-Protokoll (Bankbuchungen + Status)

```sql
CREATE TABLE payment_protocol (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),

  direction TEXT CHECK (direction IN ('eingang', 'ausgang')),
  amount    NUMERIC(12,2) NOT NULL,
  reference TEXT NOT NULL,           -- Verwendungszweck
  counterpart_name TEXT,
  counterpart_iban TEXT,

  -- Zuordnung
  category  TEXT,                    -- auto-kategorisiert
  pool_topf TEXT,                    -- welchem Topf zugeordnet
  member_id UUID REFERENCES universe_members,  -- wenn Coin-Auszahlung

  -- Status-Verlauf
  status TEXT DEFAULT 'erkannt' CHECK (status IN (
    'erkannt',      -- FinAPI hat Buchung geliefert
    'kategorisiert',-- Auto-Kategorisierung erfolgt
    'zugeordnet',   -- Pool-Topf zugeordnet
    'abgeschlossen',-- vollständig verarbeitet
    'ungeklaert'    -- manuelle Prüfung nötig
  )),
  status_history JSONB,              -- [{status, timestamp, note}]

  bank_transaction_id UUID REFERENCES bank_transactions,
  finapi_transaction_id TEXT
);
```

**UI: Zahlungs-Protokoll (nur Kassenwart/Vorstand)**
```
/universum/zahlungen → PaymentProtocol

Datum        Richtung  Betrag    Verwendungszweck           Status
──────────────────────────────────────────────────────────────────
26.03.2026   ← Eingang  700 €   Körperarbeit März          ✓ zugeordnet → Vergütung/Reinvest/Sozial
25.03.2026   → Ausgang  196 €   BTB-COIN-AZ-a3f7-2603      ✓ abgeschlossen → Johannes
20.03.2026   → Ausgang  350 €   Steuerberater März         ✓ zugeordnet → Reinvestition
18.03.2026   ← Eingang  300 €   Handwerk Auftrag           ⚠ ungeklärt → manuell prüfen
```

---

## 4. System-Protokoll (technische Ereignisse + Fehler)

```sql
CREATE TABLE system_protocol (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT now(),

  level TEXT CHECK (level IN ('info', 'warning', 'error', 'critical')),
  category TEXT CHECK (category IN (
    'payout',         -- Auszahlungsversuch
    'banking_sync',   -- FinAPI-Sync
    'pool_settlement',-- Monatliches Settlement
    'coin_allocation',-- Coin-Gutschrift
    'auth',           -- Authentifizierung
    'api',            -- Externe API-Fehler
    'system'          -- Allgemeine Systemereignisse
  )),

  message   TEXT NOT NULL,           -- Was passiert ist
  detail    JSONB,                   -- Alle relevanten Werte zum Zeitpunkt
  member_id UUID REFERENCES universe_members,  -- wer betroffen
  cell_id   UUID REFERENCES universe_cells,

  -- Bei Fehlern: was der Systemzustand war
  snapshot  JSONB  -- {pool_state, coin_balances, limits} zum Fehlerzeitpunkt

  resolved  BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_note TEXT
);
```

**Beispiel-Einträge:**
```json
{
  "level": "warning",
  "category": "payout",
  "message": "Auszahlung abgelehnt: Coin-Rücklage unzureichend",
  "detail": {
    "member_id": "abc123",
    "requested_eur": 200,
    "available_eur": 143,
    "coin_ids": ["..."],
    "coin_type": "arbeit"
  },
  "snapshot": {
    "coin_ruecklage": 143.00,
    "timestamp": "2026-03-26T14:32:00Z"
  }
}
```

---

## UI: Admin-Protokoll-Dashboard

```
/universum/protokolle → ProtocolDashboard  (Admin/Kassenwart)

Tabs: [Coin-Bewegungen] [Pool-Fluss] [Zahlungen] [System]

Filterbar nach:
  · Mitglied
  · Zeitraum
  · Ereignistyp
  · Nur Fehler/Ablehnungen
  · Nur ungeklärte Buchungen

Oben: Zusammenfassung
  ⚠ 1 ungeklärte Buchung
  ✗ 3 abgelehnte Auszahlungen diese Woche
  ✓ Letzter Sync: heute 08:14

Jeder Eintrag aufklappbar → vollständiger Systemzustand zum Zeitpunkt
→ so kann jeder Fehler exakt nachvollzogen werden
```


---

# BACKUP-SYSTEM: Tägliche Datensicherung

## Konzept

Die App ist das Herzstück des Systems. Ein Ausfall darf keine Daten vernichten.
Tägliches automatisches Backup des Pool-Stands und aller kritischen Daten
auf einen externen Speicher (Google Drive oder alternativer Server).

Zusätzlich: ein leichtgewichtiges Standalone-Programm das den Pool-Stand
manuell berechnen und eintragen kann – für den Fall dass die App komplett ausfällt.

## Automatisches Tages-Backup

```typescript
// supabase/functions/daily-backup/index.ts
// Läuft täglich um 02:00 Uhr via pg_cron

export default async function handler() {
  const snapshot = {
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],

    // Pool-Stände
    pool: await getPoolCurrentState(),

    // Alle Coin-Guthaben pro Mitglied
    coin_balances: await getCoinBalances(),

    // Offene Auszahlungsanfragen
    pending_payouts: await getPendingPayouts(),

    // Letzte 30 Bankbuchungen
    recent_transactions: await getRecentTransactions(30),

    // Mitglieder-Übersicht
    members: await getMembersSummary(),

    // System-Einstellungen
    settings: await getSettings(),
  }

  // Als JSON auf Google Drive speichern
  await uploadToGoogleDrive({
    filename: `btb-backup-${snapshot.date}.json`,
    content: JSON.stringify(snapshot, null, 2),
    folder: 'BtB-Backups'
  })

  // Backup-Bestätigung in System-Protokoll
  await logSystemEvent({
    level: 'info',
    category: 'system',
    message: `Tages-Backup erfolgreich: ${snapshot.date}`,
    detail: { file_size: JSON.stringify(snapshot).length }
  })
}
```

## Standalone Notfall-Rechner

Ein einfaches lokales Programm (Node.js CLI oder kleines Web-Interface)
das ohne Internetverbindung und ohne Supabase läuft.
Kassenwart kann es auf seinem Laptop haben.

```
btb-backup-tool

Funktionen:
1. Letztes Backup laden (JSON-Datei)
2. Pool-Stand anzeigen
3. Neue Buchung manuell eintragen
4. Coin-Auszahlung berechnen
5. Bericht als PDF exportieren

Damit kann die Genossenschaft bei App-Ausfall:
- Den aktuellen Pool-Stand einsehen
- Manuelle Buchungen protokollieren
- Auszahlungen berechnen und manuell überweisen
- Später alles in die wiederhergestellte App übertragen
```

```typescript
// btb-backup-tool/index.ts  (lokales CLI-Tool)
import { readFileSync } from 'fs'
import inquirer from 'inquirer'

async function main() {
  const backup = JSON.parse(readFileSync('latest-backup.json', 'utf8'))

  console.log(`\n=== BtB Notfall-Tool ===`)
  console.log(`Stand: ${backup.date}\n`)
  console.log(`Pool-Stände:`)
  console.log(`  Vergütung (Coin-Rücklage): ${backup.pool.verguetung_gesamt} €`)
  console.log(`  Reinvestition:             ${backup.pool.reinvestition_gesamt} €`)
  console.log(`  Sozial:                    ${backup.pool.sozial_gesamt} €`)
  console.log(`  Solidarfonds:              ${backup.pool.solidarfonds_gesamt} €`)
  console.log(`\nOffene Auszahlungen: ${backup.pending_payouts.length}`)

  // Interaktives Menü...
}
```

## Settings

```
backup_enabled            true
backup_time               '02:00'        – täglich
backup_destination        'google_drive' – 'google_drive' | 'custom_url'
backup_retention_days     90             – wie lange aufbewahren
backup_notify_on_failure  true           – Benachrichtigung wenn Backup fehlschlägt
```

