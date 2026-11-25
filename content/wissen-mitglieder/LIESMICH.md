# Wissen Mitmacher (Prompt 117)

Serverseitiger Index — **nicht** unter `public/`.
Auth: BtMM-App-Supabase-JWT. Extractive. Generativ separat (pausiert bis Hosting-Karte). `WISSEN_LLM_ENABLED` bleibt aus, bis ein Nutzer-Ja vorliegt.

## Neu-Indizierung

```bash
BTMM_ROOT=/workspace/projekte/btmm npm run wissen:reindex
# optional: Edge-Corpus mitschreiben
BTMM_ROOT=/workspace/projekte/btmm npm run wissen:reindex:edge
```

Allowlist: `ALLOWLIST.json` (geltende Fassungen, z. B. Satzung außen v9.1.3, 07 v22.69.0, 08a v2.0.3).  
Blacklist: 06-intern, INTERN_, `_ersetzt`, Dok 15, Förderung, Annahmen.  
Satzung/08a: Pflicht-Label „Entwurf, noch nicht beschlossen“.  
Tabuwörter im Index beenden den Build.
