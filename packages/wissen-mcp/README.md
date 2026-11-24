# BtMM Wissens-MCP / Indexer

Extractive Retrieval für BtMM-Dokumente. Oberflächen: Index-Build (Web), CLI-Suche, optional MCP (stdio). **Kein LLM.** `WISSEN_LLM_ENABLED` bleibt unberührt.

Lebt in `Samjo9999/btmm-webseite` unter `packages/wissen-mcp` (kein eigenes Repo).

## Stufen

| Stufe | Ausgabe | Inhalt |
|---|---|---|
| **public** | `content/wissen/index-public.json` (Quelle) und einmal `public/wissen/index-public.json` (ausgeliefert; Vorschau per Rewrite/Fetch) | neueste öffentliche Fassungen (Drive MDs 01–04 + Website `content/dokumente`), ohne Dok 15, Förderung, Annahmen, 3-Jahres-Plan |
| **mitmacher** | `content/wissen-mitglieder/index.json` (**nicht** unter `public/`) | Allowlist, geltende Versionen (Satzung v9.1.3, 07 v22.69.0, …) |
| **internal** | `content/wissen-internal/index.json` (gitignored, nie Client) | alles öffentliche plus intern, App-README, Werkzeugkasten, Branchen-Software, Finanzplan v3.9, Dok 15 / Förderung / Annahmen |

## Ausschluss

Im public- und Mitmacher-Build werden Chunks mit den Wörtern aus der Ausschlussliste verworfen. Verbleibende Treffer in der Ausgabedatei beenden den Build mit Exit-Code ≠ 0.

## Neu bauen

```bash
# im Repo-Root btmm-webseite
export BTMM_ROOT=/workspace/projekte/btmm
npm run wissen:reindex
```

Quellen liegen außerhalb des Repos (`BTMM_ROOT`, optional `BTMM_APP_ROOT`, `WERKZEUGKASTEN_ROOT`, `BRANCHEN_SOFTWARE_ROOT`). Der public-Index darf erst nach Freigabe des Datenschutz-Bots veröffentlicht / gemergt werden.

## Tests

```bash
npm test --prefix packages/wissen-mcp   # Vitest
```

## Suche (CLI)

```bash
TIER=public npm run search --prefix packages/wissen-mcp -- "Was ist der Keim?"
TIER=internal npm run search --prefix packages/wissen-mcp -- "Finanzplan Gründung"
```
