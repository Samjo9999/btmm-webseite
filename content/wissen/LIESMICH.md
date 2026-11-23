# BtMM Wissen (öffentlich)

Compact-Index für `support-agent` und Hobby-Chat. Gebaut aus `packages/wissen-mcp` (public tier, extractive, kein LLM).

Neu bauen (Box):

```bash
BTMM_ROOT=/workspace/projekte/btmm npm run wissen:reindex
```

schreibt `content/wissen/index-public.json` und die Spiegel unter `public/wissen/` sowie die Vorschau-Pfade. Tabuwörter führen zu einem harten Build-Abbruch. `WISSEN_LLM_ENABLED` bleibt unberührt.

Der public-Index darf erst nach Test-OK und Freigabe des Datenschutz-Bots live gehen.
