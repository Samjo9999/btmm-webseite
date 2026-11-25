# HERKUNFT – BtMM Kennenlern-Weg, Fotos v3 (Reportage-Look)

Stand 21.11.2026, Europe/Berlin. **Nichts live.** Einbau nur in der Vorschau (PR #33), live erst nach dem Ja des Nutzers.

## Quelle

- Design-Lieferung: `/workspace/projekte/btmm/design/kennenlern-weg-bilder-foto-v3-2026-11-21/` (`LIESMICH.md`, `HERKUNFT.md`, `bilder/`).
- Im Repo liegen nur die Querformate 1280×720 unter `public/tuer/bilder/weg/<schritt>.jpg` und `.webp` (Dateiname = Schritt-Schlüssel). Die `-hoch`-Varianten und `_originale/` bleiben in der Design-Lieferung. Nichts aus `_v1-rueckansicht/` oder aus Generator B (`_b-flux/`).
- Die Dateien sind bitgleich zu `bilder/<langname>.jpg` / `.webp` der Lieferung, ohne Neukodierung und ohne Metadaten-Strip.

### Zuordnung

| Schritt | Datei im Repo | Datei in der Lieferung |
|---|---|---|
| grundlagen | grundlagen.jpg/.webp | 01-grundlagen-worum-es-geht |
| sparen | sparen.jpg/.webp | 02-sparen-was-du-sparst |
| arbeiten | arbeiten.jpg/.webp | 03-arbeiten-in-zellen |
| wohnen | wohnen.jpg/.webp | 04-wohnen-und-boden |
| skeptisch | skeptisch.jpg/.webp | 05-belege-und-fragen |
| dokumente | dokumente.jpg/.webp | 06-dokumente |
| sinn | sinn.jpg/.webp | 07-gemeinschaft |
| gruenden | gruenden.jpg/.webp | 08-die-gruendung |
| freiburg | freiburg.jpg/.webp | 09-keim-in-freiburg |
| vorbei | vorbei.jpg/.webp | 10-offener-abend |
| anpacken | anpacken.jpg/.webp | 11-mitmachen |
| folgen | folgen.jpg/.webp | 12-dranbleiben |

## Generator und Nachbearbeitung (Angabe Design-Bot)

- **A (verwendet für alle 12 in `bilder/`):** GenerateImage (cursor.studio), KI-generiert. Originale mit C2PA unverändert in `_originale/` (1280×720).
- **B (nur Vergleich, nicht verwendet):** FLUX.1-schnell, nicht eingebaut.
- Nachbearbeitung der Web-Dateien (Angabe Design-Bot): Sättigung ×0,86, Kontrast ×0,96, Filmkorn; JPEG Q90. Dadurch tragen die ausgelieferten `bilder/*` **kein C2PA**. Die Herkunft belegen `_originale/` und diese Datei. C2PA wurde bewusst nicht zurückkopiert.

## Metadaten in den ausgelieferten Dateien

- jpg und webp tragen IPTC/XMP: `DigitalSourceType` = `trainedAlgorithmicMedia`, Credit „Bilder erstellt mit Grok (KI)“, Description „KI-generiertes Bild – Personen fiktiv“.
- Auslieferung unverändert aus `public/tuer/`: die Tür nutzt `<picture>`/`<img>` auf diese Dateien, **kein** `next/image`, keine Bildoptimierung, kein Strip.

## Kennzeichnung

- Label je Bild (exakt): „KI-generiertes Bild – Personen fiktiv“ (in 11 Sprachen in `texte.js` → `kiLabel`).
- Alt-Text beginnt mit „KI-generiertes Bild: …“ (Deutsch wörtlich aus LIESMICH.md v3, übrige Sprachen übersetzt).
- Credit im Impressum / auf der Weg-Seite: „Bilder erstellt mit Grok (KI)“.
- Alle Personen sind fiktiv und erwachsen. Keine Referenzfotos echter Menschen, kein Text, keine Logos, keine Namensschilder. Freiburg nur allgemein. Keine Fotos des Nutzers, keine Silhouetten.

## Recht-Auflage zu Bild 07 und 10

Bilder 07 (sinn / Gemeinschaft) und 10 (vorbei) können wie echte BtMM-Treffen wirken. Caption und Text daneben sprechen daher nicht von „unserem Treffen“, einem „letzten Abend“ oder ähnlichem. Die Schritttexte wurden in allen 11 Sprachen neutral umformuliert (Titel 10: nicht mehr „Offener Abend“, sondern „Kennenlernen vor Ort“).

## Prompts

Vollständige Prompts, SHA-256 der Originale und die Sichtprüfung stehen in der Design-Lieferung: `kennenlern-weg-bilder-foto-v3-2026-11-21/HERKUNFT.md`.
