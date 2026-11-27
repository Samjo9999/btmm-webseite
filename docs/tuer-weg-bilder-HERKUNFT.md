# Tür-Weg-Bilder: Herkunft

Stand 27.11.2026. Die früheren KI-Bilder sind durch echte Stockfotos ersetzt (Nutzerwunsch 27.11.2026: realistische, passende Stockfotos statt KI-Optik).

- Quelle: nur Unsplash (Unsplash-Lizenz). Kein Konto, kein API-Key, kein Geld, keine KI-Bilder, kein Unsplash+.
- Nachweis je Bild (Fotograf, Quelle-URL, Lizenz, Abrufdatum): `data/bildnachweise.json` (einzige Quelle), daraus erzeugt `content/bildnachweise.md` (`node scripts/bildnachweise-md.mjs`). Die Liste steht auch im Impressum unter „Bildnachweise“.
- Dateien: `public/tuer/bilder/weg/<motiv>.jpg|webp` (12 Motive, 1280×720), `public/tuer/bilder/holz/*` (Holztür, Logo als CSS-Ebene), `public/images/kosten-feld.jpg` (1920×1080).
- Auf der Weg-Seite steht je Bild „Foto: <Name> / Unsplash“ (`fotoLabel` in `texte.js`, Name aus `FOTO` in `pfad.js`).
- Alt-Texte: deutsch beschreibend (SEO), in allen 11 Sprachen übersetzt (`alt` in `texte.js`), ohne „KI“-Präfix.
- Neues Bild einbauen: Foto auf Unsplash wählen (keine Unsplash+-Fotos, keine Fotos mit Hinweis auf KI-Erzeugung, möglichst mit Kameradaten), zuschneiden, komprimieren, Eintrag in `data/bildnachweise.json` und `FOTO` in `pfad.js` ergänzen, Markdown neu erzeugen. Der Test `test/bildnachweise.test.mjs` prüft, dass jedes Bild einen Eintrag hat.
