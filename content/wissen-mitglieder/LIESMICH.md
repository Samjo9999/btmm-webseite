# Wissen Mitmacher (Prompt 117)

Serverseitiger Index — **nicht** unter `public/`.
Auth: BtMM-App-Supabase-JWT. Extractive. Generativ separat (pausiert bis Hosting-Karte).

## Neu-Indizierung (mitwachsen)

```bash
# aus Repo-Root btmm-webseite, BTMM_ROOT = projekte/btmm
BTMM_ROOT=/workspace/projekte/btmm node scripts/build-wissen-mitglieder.mjs
# optional: Edge-Corpus mitschreiben
BTMM_ROOT=/workspace/projekte/btmm node scripts/build-wissen-mitglieder.mjs --sync-edge
```

Allowlist: `ALLOWLIST.json` (nur freigegebene Docs). Blacklist: 06-intern, INTERN_, `_ersetzt`, …  
Satzung/08a: Pflicht-Label „Entwurf, noch nicht beschlossen“.  
Quellen liegen unter `projekte/btmm/DOKUMENTE` (Drive-Spiegel) + `pruefung/NORMEN-…`.
