# Tür-Bilder (Foto einer dunklen Holztür, Logo als eigene Ebene)

Stand 27.11.2026: Echtes Foto statt der früheren KI-Grafik. Das Logo ist nicht im Foto, sondern liegt in `public/tuer/index.html` als `.tuer-logo` über der Tür (siehe `tuer.css`) und blendet beim Öffnen aus.

- Foto: Isabelle Farinelli Silva, Unsplash, https://unsplash.com/photos/a-close-up-of-a-wooden-door-with-a-handle-bIG0v7GnQVM (Unsplash-Lizenz). Nachweis in `content/bildnachweise.md`.
- Zuschnitt aus dem Hochformat-Foto, in der Mitte geteilt (Doppeltür): Dateinamen, Formate und Maße wie vorher, damit die HTML-Pfade unverändert bleiben.
- mobil: 1182×2560, Flügel 591×2560
- desktop: 2560×1600, Flügel 1280×1600
- Nur die zum Viewport passende Flügel-Datei links und rechts wird geladen (WebP, JPG als Fallback im `<picture>`).
