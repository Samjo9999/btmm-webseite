# BtMM Text-Editor (Decap CMS, OSS, 0 €)

## Öffnen
- Preview: `https://<vorschau-host>/admin/`
- Nur GitHub-Collaborators am Repo `Samjo9999/btmm-webseite`

## GitHub-OAuth-App (einmalig, du legst an)
1. GitHub → Settings → Developer settings → OAuth Apps → New
2. Application name: z. B. `BtMM Decap Preview`
3. Homepage URL: `https://vorschau.b-t-m-m.com`
4. Authorization callback URL: `https://vorschau.b-t-m-m.com/api/callback`
   (weitere Preview-Hosts als weitere Callback-URLs nur wenn GitHub das erlaubt — sonst Alias nutzen)
5. Client-ID + Client-Secret **nur** in Vercel → Projekt der Vorschau → Environment Variables **Preview** (nicht Production Live):
   - `GITHUB_OAUTH_CLIENT_ID`
   - `GITHUB_OAUTH_CLIENT_SECRET`
6. Passwort/Secret tippst du selbst; nichts ins Repo.

## Branch
Decap speichert auf Branch `content/cms` (nicht direkt Live-`master`). Merge nach Review + Test-Bot + Dirigent-OK.

## Andere Sprachen
Zuerst nur **de** editierbar. Andere Locales später oder über Autor-Bot.

## Kosten
Decap Free/OSS: 0 €. Kein Tina Cloud, kein Decap Pro ohne neues Ja.
