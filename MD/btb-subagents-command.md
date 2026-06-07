# /btb-subagents — Subagent-Muster für alle BtB-Prozesse

Du bist in ~/samjo-projekte/btb-app/.
Arbeite IMMER token-effizient mit parallelen Subagenten.
Niemals sequenziell wenn Aufgaben unabhängig sind.

---

## GRUNDPRINZIP

```
Falsch:   A → warten → B → warten → C → warten → fertig
Richtig:  A + B + C parallel → zusammenführen → fertig
```

Tokeneinsparung: bis zu 60% bei unabhängigen Aufgaben.

---

## SUBAGENT-MUSTER PRO BEREICH

### Guardian (5-Minuten-Zyklus)
```
Hauptagent startet PARALLEL:
  Subagent 1: DB-Verbindung prüfen (SELECT 1)
  Subagent 2: FinAPI-Verbindung prüfen
  Subagent 3: Coin-Solvenz prüfen
  Subagent 4: Backup-Aktualität prüfen
  Subagent 5: Überfällige Cron-Jobs prüfen
  Subagent 6: Stuck Timers prüfen
→ Alle Ergebnisse sammeln → Alarme auslösen wenn nötig

Implementierung:
const checks = await Promise.all([
  checkDatabase(),
  checkFinAPI(),
  checkSolvenz(),
  checkBackup(),
  checkCronJobs(),
  checkStuckTimers()
])
```

### Modul-Generator (Feature-Analyse)
```
Nach Claude API Analyse → PARALLEL:
  Subagent 1: DB-Migration generieren + ausführen
  Subagent 2: Edge Function schreiben + deployen
  Subagent 3: React-Seite generieren
  Subagent 4: automation_registry Eintrag erstellen
→ Zusammenführen → module_definitions updaten

Nur wenn Subagent 1 (DB) fertig: dann member_module erstellen
(Abhängigkeit beachten — Rest parallel)
```

### HP-Lernapp: Lektionen generieren
```
Für ein Modul (z.B. Anatomie) → PARALLEL:
  Subagent 1: Lektion "Herz-Kreislauf" crawlen + JSON erstellen
  Subagent 2: Lektion "Atmungssystem" crawlen + JSON erstellen
  Subagent 3: Lektion "Nervensystem" crawlen + JSON erstellen
  Subagent 4: Quiz-Fragen für alle drei generieren
→ Zusammenführen → in DB importieren

Einsparung: 3 Lektionen in der Zeit einer.
```

### Event-Bus: Automation-Rules auswerten
```
Ein Event trifft ein → PARALLEL alle passenden Rules prüfen:
  Subagent pro Rule: Bedingung prüfen + Aktion ausführen
→ Alle Ergebnisse loggen

const ruleResults = await Promise.all(
  matchingRules.map(rule => executeRule(rule, event))
)
```

### Pool-Monatsabschluss
```
PARALLEL:
  Subagent 1: Einnahmen des Monats summieren
  Subagent 2: Offene Zeiterfassungen prüfen
  Subagent 3: Fixkosten abrufen
  Subagent 4: Vormonat-Vergleich berechnen
→ Zusammenführen → Aufteilung berechnen → Draft erstellen
```

---

## ABHÄNGIGKEITS-REGELN

Nicht alles kann parallel. Diese Reihenfolgen sind Pflicht:

```
temporal.ts         → muss vor ALLEN anderen fertig sein
DB-Migration        → muss vor Edge Function fertig sein
Guardian-Core       → muss vor Guardian-Repair fertig sein
Staging-Freigabe    → muss vor Live-Deploy fertig sein
Coin-Solvenz-Check  → muss nach jeder Coin-Transaktion laufen
```

Alles andere: parallel.

---

## CLAUDE CODE PROMPT-TEMPLATE FÜR SUBAGENTEN

```
Führe folgende Tasks PARALLEL aus (Promise.all oder equivalent):

Task A: [konkrete Aufgabe]
Task B: [konkrete Aufgabe]
Task C: [konkrete Aufgabe]

Abhängigkeiten:
- Task B benötigt Ergebnis von Task A → Task B erst nach Task A starten
- Task A und Task C sind unabhängig → parallel

Nach Abschluss aller Tasks:
- Ergebnisse zusammenführen in [Zieldatei/Tabelle]
- Fehler einzelner Tasks loggen, andere Tasks nicht abbrechen
- Gesamtstatus melden: [X von Y Tasks erfolgreich]

Token-Effizienz:
- Nur die für diesen Task relevanten Dateien lesen
- Keine Dateien doppelt lesen
- Änderungen bündeln wo möglich
```

---

## IN DER APP: SUPABASE EDGE FUNCTIONS ALS SUBAGENTEN

Edge Functions können sich gegenseitig aufrufen — das ist die App-seitige
Subagent-Architektur:

```typescript
// Orchestrator-Function ruft parallel auf:
const [result1, result2, result3] = await Promise.all([
  fetch(`${SUPABASE_URL}/functions/v1/subagent-a`, { method: 'POST', ... }),
  fetch(`${SUPABASE_URL}/functions/v1/subagent-b`, { method: 'POST', ... }),
  fetch(`${SUPABASE_URL}/functions/v1/subagent-c`, { method: 'POST', ... }),
])

// Jeder Subagent ist eine eigene Edge Function
// Timeout: 25s pro Subagent (Supabase Limit beachten)
// Bei Timeout: in guardian_logs + retry durch guardian-repair
```

Jedes Modul das vom Modul-Generator erstellt wird bekommt:
- 1 Orchestrator-Function (koordiniert)
- N Feature-Subagenten (parallel, je 1 pro aktiviertem Feature)
- 1 Guardian-Erweiterung (überwacht alle Subagenten des Moduls)
