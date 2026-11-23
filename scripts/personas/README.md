# Persona-Harness Überzeugungstür

Deterministische Simulation der Tür (`public/tuer/`) mit 1.000 bis 1 Mio. Personas. Kein LLM, keine API, 0 €.
Die Simulation nutzt die echte Pfadlogik (`public/tuer/pfad.js`) und die echten Tür-Texte (`public/tuer/texte.js`).
Bewertet werden die gerenderten Zielseiten eines lokalen Builds.

## Ablauf (Test-Bot)

```bash
npm ci && npx next build
npx next start -p 3101 -H 127.0.0.1 &
L=/workspace/prr/logs/btmm-ueberzeugungstuer/<lauf>
node scripts/personas/seiten.mjs --basis http://127.0.0.1:3101 --aus $L/seiten.json      # Status und Text aller Pfadziele, 11 Locales
node scripts/personas/sim.mjs --seiten $L/seiten.json --n 10000 --seeds 11,12,13 --aus $L/schnell   # Schnelltest
node scripts/personas/sim.mjs --seiten $L/seiten.json --n 1000000 --seeds 11 --gegen $L/schnell/ergebnis.json --aus $L/voll   # Volllauf, ca. 50 s
node scripts/personas/tabu.mjs --seiten $L/seiten.json --repo-weit --json $L/tabu.json   # Tabu-Scan allein
```

`seiten.mjs` akzeptiert nur 127.0.0.1 oder localhost. Es wird nichts deployt.

## Modell

- **Personas** (`personas.mjs`) bestehen aus Archetyp, Alter, Lebenslage (abhängig vom Alter), Gerät und Vertiefer ja/nein.
  - Die Gewichte kommen vom Nutzer über den Dirigenten (24.11.2026).
  - Antworten sind Freitext-Varianten je Tür-Frage, darunter auch leere oder ausweichende Antworten.
- **Tür:** Die Fragefolge kommt direkt aus `PF.naechsteFrage` (pfad.js, dieselbe Logik wie tuer.js, max. 7 Fragen inklusive Lebensphase). Das Profil entsteht über `PF.auswerten`, der Pfad über `PF.pfadBauen`.
- **Abbruch:** Pro Frage gibt es eine Abbruchwahrscheinlichkeit, auf dem Handy hochkant höher. Ein Teil der Besucher geht „ohne Fragen“ auf die Startseite.
- **Lesen:** Wie viele Schritte gelesen werden, hängt von Gerät, Alter und Vertiefer ab. Gelesen wird nur der obere Teil jeder Seite: hochkant 45 %, quer 60 %, Desktop 80 %, Vertiefer 100 %.
- **Überzeugt:** Die gewichtete Abdeckung der Persona-Bedürfnisse durch die gelesenen Seitenteile muss mindestens die persönliche Schwelle erreichen. Die Schwelle ist je Archetyp gesetzt und streut normalverteilt. Ein eigener Pfad gibt +0,05.
  - Themen werden per Schlagworte im gerenderten Text erkannt (`themen.mjs`).
- **Pfad-Treffer:** Einer der ersten zwei Motiv-Schritte gehört zum Archetyp (`eigen`). Bei Lebenslagen muss zusätzlich Lage-Inhalt im Pfad stehen. Gezählt wird unter allen, die einen Pfad bekommen haben. Abbruch im Dialog und „ohne Fragen“ werden getrennt ausgewiesen (`abbruch`, `pfadTrefferAlle`).
- **Tabu:** `tabu.mjs` umfasst Bürgergeld, Jobcenter, Krankheit, Erkrankung, Elternzeit, Schwangerschaft und Eltern/Elternhof in allen 11 Sprachen. Gescannt werden:
  - Tür-HTML/JS/CSS, PfadLeiste und TuerWeiche
  - das vollständige HTML aller Pfadziele, inklusive Meta, data-Attributen und Next-Payload
  - zusätzlich „ausgeliefert“: messages/**, public/**, app/**, components/**, lib/**, content/** (Sprachdateien, Quelltext, alt, Meta, data-Attribute)
  - „Mutter“/„Vater“ im Herkunfts-Schlagwort zählen nur als Hinweis.

## Stopp-Kriterium (in `sim.mjs` geprüft)

- In jeder Gruppe (Archetyp, Alter, Lebenslage, Gerät, Vertiefer) sind mindestens 70 % überzeugt und mindestens 80 % haben einen Pfad-Treffer.
- Die Spanne über 3 Seeds liegt je Archetyp bei höchstens 3 Prozentpunkten. Der Volllauf weicht vom Schnelltest um höchstens 2 Prozentpunkte ab.
- Tabu-Treffer im Pfad: 0. Alle Pfadziele liefern in allen 11 Locales HTTP 200.

Hinweis: Mit 1.000 Personas sind kleine Gruppen (5 % ≈ 50 Personen) zu klein für eine Spanne von höchstens 3 Prozentpunkten. Der Schnelltest läuft deshalb mit 10.000.

## Grenzen

- Schlagworte der Tür und die Antwort-Bank stammen vom selben Autor. Für eine unabhängige Prüfung sollte der Test-Bot eine eigene Antwort-Bank nutzen (`personas.mjs` kopieren und Texte ersetzen).

- Das Modell ist ein Proxy, keine echte Conversion: Schwellen, Lesetiefe und Abbruchraten sind Annahmen (oben im Code).
- Die Personas antworten auf Deutsch. Andere Locales werden nur auf Tabu und HTTP 200 geprüft.
- Die Themenerkennung arbeitet nur mit Schlagworten. Fehlt ein Thema auf allen Seiten, wird es als **Konzept-Lücke** gemeldet und nicht erfunden.
