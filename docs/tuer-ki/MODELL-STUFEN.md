# Tür-KI: stärkeres Modell (Vorbereitung, Stand 27.11.2026)

Auftrag des Nutzers (27.11.2026): ein deutlich schlaueres Modell, teurer ist in Ordnung.
Dieser PR schaltet nichts live. Ohne die Env `TUER_KI_MODEL` läuft die Tür-KI unverändert
mit `mistral-small-3.2-24b-instruct-2506` und dem Deckel 0,50 EUR/Tag, 10 EUR/Monat.

## Heute

| | |
|---|---|
| Modell | `mistral-small-3.2-24b-instruct-2506` (24B, Juni 2025) bei Scaleway Generative APIs |
| Preis | 0,15 EUR Eingabe, 0,35 EUR Ausgabe je 1 Mio. Tokens |
| Rechnung | `lib/tuerKi/kosten.ts`: (Eingabe * Preis_ein + Ausgabe * Preis_aus) / 1 Mio.; vor dem Aufruf Worst-Case (geschätzte Eingabe + volle Ausgabe) gegen Tages- und Monatsdeckel, danach Korrektur mit den echten Tokens aus der Antwort (Supabase `tuer_ki_kosten`) |
| Grenzen | max. 6000 geschätzte Eingabe-Tokens, 400 Ausgabe-Tokens (200 ab 80 % des Deckels), Timeout 12 s |

## Token je Gespräch (Annahme)

- Systemprompt: rund 1.980 Tokens (6.930 Zeichen / 3,5, gemessen mit `schaetzeTokens`).
- Wissenskontext: bis 5 Treffer, im öffentlichen Index im Mittel rund 460 Zeichen (gekappt auf 1.200), also rund 750 Tokens im Mittel (Maximum rund 1.800).
- Je Anfrage ohne Verlauf: rund 2.750 Tokens Eingabe. Der Verlauf geht jedes Mal komplett mit (Antworten bis 1.200 Zeichen, im Mittel angenommen 300 Tokens).
- Annahme: 4 Nutzerfragen je Gespräch (Maximum im Code: 10), 250 Tokens Antwort je Frage.
- Eingabe je Gespräch: 4 * 2.750 + 300 * (0+1+2+3) + 150 = rund 13.000 Tokens. Ausgabe: rund 1.000 Tokens.
- Der Systemprompt wird gerade umgebaut (anderer PR); jede Verlängerung erhöht die Eingabe. Rechnen Sie mit plus/minus 30 %.

## Optionen

Preise bei Scaleway: https://www.scaleway.com/en/pricing/model-as-a-service/ (Abruf 27.11.2026).
Modellliste und Eigenschaften: https://www.scaleway.com/en/docs/generative-apis/reference-content/supported-models/ (Abruf 27.11.2026).

Kosten je Gespräch = (13.000 * Preis_ein + 1.000 * Preis_aus) / 1 Mio.

| | Heute | A: Qwen3.5-397B | B: Qwen3-235B | C: Mistral Medium 3.5 |
|---|---|---|---|---|
| Modell-ID (Scaleway) | `mistral-small-3.2-24b-instruct-2506` | `qwen3.5-397b-a17b` | `qwen3-235b-a22b-instruct-2507` | `mistral-medium-3.5-128b` |
| EUR je 1 Mio. ein / aus | 0,15 / 0,35 | 0,60 / 3,60 | 0,75 / 2,25 | 1,50 / 7,50 |
| Kosten je Gespräch | 0,0023 | 0,0114 | 0,0120 | 0,0270 |
| 300 Gespräche/Monat | 0,69 | 3,42 | 3,60 | 8,10 |
| 1.000 Gespräche/Monat | 2,30 | 11,40 | 12,00 | 27,00 |
| 3.000 Gespräche/Monat | 6,90 | 34,20 | 36,00 | 81,00 |
| Env TUER_KI_MODEL | (leer) | `qwen3.5-397b-a17b` | `qwen3-235b-a22b-instruct-2507` | `mistral-medium-3.5-128b` |
| Reasoning | nein | ja, wird mit `reasoning_effort: none` aus geschaltet | nein (Instruct) | ja, wird mit `none` aus geschaltet |

Reasoning-Tokens würden als Ausgabe abgerechnet und die 400 Tokens aufbrauchen. Deshalb sendet der Code bei A und C `reasoning_effort: none` (laut Scaleway-Doku "How to query reasoning models" für diese Modelle unterstützt: https://www.scaleway.com/en/docs/generative-apis/how-to/query-reasoning-models/).

### Eignung

- A, Qwen3.5-397B-A17B (Februar 2026, 397B gesamt, 17B aktiv): Scaleway nennt Deutsch ausdrücklich unter den unterstützten Sprachen. Artificial Analysis misst gegenüber Qwen3-235B (Reasoning) +16 Punkte im Intelligence Index (45 zu 29) und +28 Prozentpunkte bei IFBench (Anweisungstreue), jeweils im Reasoning-Modus: https://artificialanalysis.ai/articles/qwen3-5-397b-a17b-everything-you-need-to-know . Ohne Reasoning sind die Werte nicht veröffentlicht, die Verbesserung ist dort also wahrscheinlich kleiner. Gleiche Quelle: hohe Halluzinationsrate, ohne Beleg im Kontext erfindet das Modell eher. Gegenmaßnahme bleibt der Prompt "nur aus dem Kontext" plus Ausgabefilter.
- B, Qwen3-235B-A22B-Instruct-2507 (Juli 2025): reines Instruct-Modell ohne Reasoning-Schalter, solide, aber ein Jahrgang älter als A und im Preis nicht günstiger. Nur sinnvoll, falls A im Test mit `reasoning_effort: none` Probleme macht.
- C, Mistral Medium 3.5 (128B, April 2026): Mistral ist bei Deutsch stark, aber teuer (rund 2,4-mal A). Mistral selbst führt das Modell seit 31.10.2026 als "Deprecated", Abschaltung 30.04.2027, Nachfolger Mistral Large 4: https://docs.mistral.ai/models/mistral-medium-3-5-26-04.md . Ob Scaleway es früher entfernt, ist offen. Artificial Analysis nennt im Reasoning-Modus 24 s bis zur ersten Antwort: für die Tür zu langsam, Nicht-Reasoning-Wert unbekannt.
- Nicht geeignet: `gpt-oss-120b` (nur Englisch, Reasoning nicht abschaltbar), `glm-5.3` (Scaleway nennt nur Englisch und Chinesisch), `llama-3.3-70b-instruct` (Jahrgang 2024, nicht schlauer als A), `mistral-large-3-675b-instruct-2512` (bei Scaleway nicht serverless).

### Vergleich mit neuem Anbieter (nicht empfohlen, nur zur Einordnung)

Mistral AI direkt, Modell Mistral Large 4 (`mistral-large-latest`), EU-Endpunkt `api.eu.mistral.ai`:
- Preis 0,70 USD Eingabe, 2,10 USD Ausgabe je 1 Mio. Tokens; EU-Endpunkt plus 10 %, also 0,77 / 2,31 USD. Quellen: https://docs.mistral.ai/inference/pricing und https://docs.mistral.ai/inference/regional-inference (Abruf 27.11.2026). Umrechnung mit 0,91116 EUR je USD (Frankfurter/EZB, 26.11.2026): 0,70 / 2,10 EUR.
- Das Modell denkt immer ("always reasons"), `reasoning_effort: none` liefert HTTP 400, `low` ist das Minimum (Mistral-Changelog 29.10.): https://docs.mistral.ai/resources/changelogs . Reasoning-Tokens kommen zur Ausgabe dazu, nicht abschätzbar, und die Antwortzeit steigt. Preis für 13.000 ein / 1.000 aus ohne Reasoning-Tokens: rund 0,0112 EUR je Gespräch (3,37 / 11,23 / 33,70 EUR bei 300 / 1.000 / 3.000 Gesprächen), mit Reasoning mehr.
- Neuer Key und neuer Anbieter nötig. Der EU-Endpunkt verarbeitet nur die Inferenz in der EU, Konto, Abrechnung und Metadaten können außerhalb liegen (Quelle: Regional inference). Datenschutzerklärung (Impressum, Tür-Hinweis in `public/tuer/texte-ki.js`), Auftragsverarbeitung und Verzeichnis müssten angepasst werden, außerdem neue Code-Anbindung. Aus diesen Gründen nur Vergleich.

### Datenschutz Scaleway (gilt für A, B, C unverändert)

Gleicher Anbieter, gleicher Key, gleicher Vertrag, keine Änderung an der Datenschutzerklärung nötig. Laut Scaleway Rechenzentrum in Paris, Frankreich, keine Speicherung von Prompts und Antworten (Zero Data Retention, Ausnahme: kurzfristige Ablage bei Fehlern oder Missbrauch), keine Nutzung zum Training, kein Zugriff der Modellhersteller; Auftragsverarbeitungsvertrag (DPA) auf https://www.scaleway.com/en/contracts/ . Quellen: https://www.scaleway.com/en/docs/generative-apis/reference-content/data-privacy/ und https://www.scaleway.com/en/docs/generative-apis/faq.md (Abruf 27.11.2026). Die Modelle von Alibaba (Qwen) laufen bei Scaleway, nicht bei Alibaba.

## Empfehlung

Option A, `qwen3.5-397b-a17b` mit `reasoning_effort: none`.
Gründe: gleicher Anbieter und Key, jüngstes und größtes bei Scaleway serverless gelistetes Modell mit ausdrücklichem Deutsch, beim Preis unter B und mehr als die Hälfte günstiger als C je Gespräch, kein Lifecycle-Risiko wie bei C.

Vorschlag Deckel: 1,50 EUR/Tag und 30 EUR/Monat.
- Entspricht bei A rund 130 Gesprächen am Tag und rund 2.600 im Monat (30 / 0,0114).
- Der Scaleway-Gesamtdeckel liegt bei 50 EUR im Monat (S50); 30 EUR lassen 20 EUR für die Wissens-KI.
- Feste Obergrenze im Code für stärkere Modelle: 3 EUR/Tag, 50 EUR/Monat (kein Anheben per Env darüber).
- Worst-Case je Anfrage (6.000 Eingabe, 400 Ausgabe) bei A: 0,0050 EUR.

## Live schalten (nach Ja des Nutzers zum neuen Deckel)

In Vercel (Projekt btmm-webseite, Production) setzen, danach neu deployen:
1. `TUER_KI_MODEL=qwen3.5-397b-a17b`
2. `TUER_KI_TAG_EUR=1.5`
3. `TUER_KI_MONAT_EUR=30`

Zurück auf heute: `TUER_KI_MODEL` löschen (oder leer), und die beiden Deckel-Variablen wieder auf 0.5 und 10 setzen oder löschen. Ein Tippfehler im Modellnamen fällt auf das Standardmodell und dessen Deckel 0,50 / 10 zurück. Der Key `SCALEWAY_SECRET_KEY` bleibt derselbe. `WISSEN_LLM_TIER`, `WISSEN_LLM_ENABLED` und `TUER_KI_ENABLED` bleiben unverändert; die Wissens-KI (Mitmacher) läuft weiter mit dem Standardmodell, `TUER_KI_MODEL` gilt nur für die Tür.

## Offene Punkte

- Antwortzeit: Artificial Analysis misst für Qwen3.5-397B (Nicht-Reasoning, Alibaba-API) 2,5 s bis zur ersten Antwort und 48 Tokens/s: https://artificialanalysis.ai/models/qwen3-5-397b-a17b . Bei Scaleway kann das abweichen. Timeout für A daher 16 s (heute 12 s), unter `maxDuration` 20 s der Route. Vor dem Live-Schalten einmal real messen (Test-Bot).
- Serverless bei Scaleway unterliegt Rate-Limits; für die Tür-Last (Rate-Limit je IP, Deckel) unkritisch, aber bei Last-Tests beachten.
- Die Eingabe-Schätzung im Deckel (Zeichen / 3,5) kann bei anderer Tokenisierung leicht abweichen. Die Korrektur nach dem Aufruf bucht die echten Tokens aus der Antwort, die Reservierung ist nur der Worst-Case vorab.
