# Self-Host Wissens-LLM (H250) — nur Vorbereitung

1. `docker compose up -d`
2. Modell ziehen z. B. `docker compose exec ollama ollama pull mistral-small` (Name nach Wahl)
3. Env (Vercel/Edge **nicht** setzen bis Dirigent-Karte):
   - `WISSEN_LLM_ENABLED=true`
   - `WISSEN_LLM_TIER=h250`
   - `SELFHOST_LLM_BASE_URL=http://127.0.0.1:11434/v1`
   - `SELFHOST_LLM_MODEL=mistral-small`
4. GPU-Server (Hetzner GEX45 o. ä.) erst nach neuer Karte + Haggle mieten.
