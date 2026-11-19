# Wissens-LLM-Stufen (Sp.144)

**Live-Default:** extractive, `WISSEN_LLM_ENABLED` unset/`false` → **0 €** laufende Kosten.

| Stufe | Env `WISSEN_LLM_TIER` | Provider | Deckel / Budget | Secrets |
|---|---|---|---:|---|
| aus | `off` (oder leer) | extractive | 0 | — |
| S5 | `s5` | Scaleway Generative APIs | 5 €/Mon | `SCALEWAY_SECRET_KEY` |
| S15 | `s15` | Scaleway | 15 €/Mon | `SCALEWAY_SECRET_KEY` |
| S50 | `s50` | Scaleway | 50 €/Mon | `SCALEWAY_SECRET_KEY` |
| H250 | `h250` | Self-Host OpenAI-kompatibel | ~250 €/Mon (z. B. GEX45) | `SELFHOST_LLM_BASE_URL`, optional `SELFHOST_LLM_API_KEY`, `SELFHOST_LLM_MODEL` |

## Schalter

1. Code + Docs vorbereiten (dieses Repo) — **ohne** Konto/Miete.
2. Live nur nach Dirigent-Karte: `WISSEN_LLM_ENABLED=true` **und** `WISSEN_LLM_TIER=…` setzen, Secrets legen, Scaleway-Billing-Alert / Server erst dann.
3. Ohne `WISSEN_LLM_ENABLED=true` nie API-Calls — auch wenn ein Key schon liegt.

## Self-Host Prep (ohne Mieten)

Siehe `deploy/selfhost-wissen/docker-compose.yml` (Ollama, lokal/Box). Server bei Hetzner erst nach Ja.

## Preview

`/vorschau/wissen-mitmacher/` — Generativ-Haken sendet `generative:true`, Server ignoriert es solange Schalter aus.
