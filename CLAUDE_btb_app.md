# BtB App — Projekt-Kontext für Claude Code

## Herzstück: Funktions-Bibliothek + Modul-System

### Die korrekte Architektur (3 Ebenen):

**Ebene 1: btb_functions (Funktions-Bibliothek, global)**
- Sammlung ALLER jemals erkannten oder entwickelten Funktionen
- Eine Funktion gehört zu mehreren Tätigkeits-Kategorien (many-to-many)
- Wächst kontinuierlich wenn neue Tätigkeiten analysiert werden
- Neue Funktionen werden vom Agenten erklärt und begründet
- Nie löschen — höchstens deprecated

**Ebene 2: module_definitions (Module = Zusammenstellung aus Bibliothek)**
- Ein Modul = eine benannte Tätigkeit + Auswahl von btb_functions
- Verweist auf btb_functions via Junction-Tabelle
- Enthält IMMER alle passenden Funktionen (nie getrimmt)
- Automatische Deduplizierung ähnlicher Module

**Ebene 3: member_modules (persönliche Einstellungen)**
- Mitglied kopiert Modul → speichert NUR opt-out Präferenzen
- `functions_hidden: string[]` — IDs der ausgeblendeten Funktionen
- Entfernen aus Sidebar = member_module löschen, nie module_definition

### DB-Schema (vollständig):

```sql
-- Funktions-Bibliothek
btb_functions:
  id UUID PK, slug TEXT UNIQUE, name TEXT, description TEXT,
  explanation TEXT,        -- warum diese Funktion praktisch ist (für neue Fkt.)
  categories TEXT[],       -- ['handwerk','gesundheit',...] — mehrere möglich
  group_name TEXT,         -- 'kern'|'dokumentation'|'kommunikation'|'finanzen'|'lager'|'reporting'
  icon TEXT,               -- 'calendar'|'users'|'clock'|'file'|'package'|'chart'
  db_table_template TEXT,  -- SQL-Template für diese Funktion
  is_new BOOLEAN DEFAULT false,  -- true wenn vom Agenten NEU entwickelt
  created_at TIMESTAMPTZ, deprecated BOOLEAN DEFAULT false

-- Tätigkeits-Module
module_definitions:
  id UUID PK, slug TEXT UNIQUE, name TEXT, description TEXT,
  category TEXT,           -- Haupt-Kategorie der Tätigkeit
  created_by UUID, created_at, version INT, is_deprecated BOOLEAN,
  similar_to UUID[]

-- Verknüpfung Module ↔ Funktionen
module_functions:
  module_id UUID → module_definitions, function_id UUID → btb_functions
  UNIQUE(module_id, function_id)

-- Persönliche Kopien
member_modules:
  id UUID PK, member_id UUID, module_id UUID,
  functions_hidden TEXT[],  -- btb_functions.slug Liste
  sidebar_position INT, added_at TIMESTAMPTZ, last_used_at TIMESTAMPTZ
  UNIQUE(member_id, module_id)
```

### Modul-Generator Flow:
1. Name + Beschreibung eingeben
2. DB-Check: existierende btb_functions die passen → kartieren
3. Lücken-Analyse: was fehlt noch für diese Tätigkeit?
4. Neue Funktionen entwickeln + erklären → btb_functions hinzufügen
5. Ähnliche module_definitions vorschlagen wenn vorhanden
6. Opt-Out Auswahl für member_module
7. module_definition erstellen (alle passenden Funktionen)

### Sidebar-Struktur:
```
Sidebar
├── [Normale App-Navigation]
├── "Meine Module" — nur aktive member_modules
└── "Universum" — alle module_definitions, filterbar nach Kategorie
    + "Alle Funktionen" — durchsuchbare btb_functions Bibliothek
```

---

## Technischer Kontext
Supabase-ID: xcngmshjuqoucdlgikao · Lokal: ~/BtMM-App/btb-app/

## Agenten-Reihenfolge
0.1 temporal → 0.2 guardian-core → 0.3 repair/bypass → 0.4 staging
→ 1.x Pool/Coin → 2.x Mitglieder → 3.x Zeit → 4.x Lager → 5.x Community
→ 6.x Modul-Generator (nach Kern-System)

## Solvenz-Invariante
sum(member_coin_ledger.eur_reserve) = sum(coin_reserve_accounts.balance) — NIE brechen

## BtB-Farben
--btb-primary: #b61818 · --btb-secondary: #8fa942 · --btb-bg: #f0e9b6 · --btb-element: #2a7cab

## Platform & Automatisierung

### Android Launcher
Capacitor-Wrapper um die React-App.
Eintrag im AndroidManifest als HOME-Intent → App wird Launcher.
Background Runner: alle 15min → offline Queue abspielen + Notifications prüfen.

### Event-Bus (Inter-Modul)
Alle Modul-Aktionen emittieren Events via src/lib/events.ts.
Edge Function event-bus (Cron 2min) verarbeitet Events → führt automation_rules aus.
Offline-Puffer: Events landen in Preferences → Background Runner spielt nach.

### Automatisierungs-Regeln (automation_rules)
System-Regeln (created_by = NULL): unveränderlich.
Mitglieder können eigene Regeln erstellen (member_specific = true).
Guardian überwacht event-bus — Fehler bei Coin-Events → EXISTENTIAL.
