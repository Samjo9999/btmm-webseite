# Back to Meaning Maximization – Website Cursor Prompt

**Framework: Next.js 14 · Deployment: Vercel · Domain: backtobalance.online**

---

## Architektur

```
backtobalance.online      ← Diese Website. Öffentlich. Für alle. (eigener Ordner)
app.backtobalance.online  ← Die App. Nur für Mitglieder. (fly.io, /btb-app Ordner)

             Supabase xcngmshjuqoucdlgikao
                      ↑              ↑
              App schreibt      Website liest
```

Die App (fly.io) und die Website (Vercel) teilen **dieselbe Supabase-Datenbank**.
Das ist die Brücke — kein direkter API-Aufruf zwischen App und Website.

- Die App schreibt Echtdaten in Supabase (Zellen, Spendenstand, Mitglieder-Statistiken)
- Die Website liest nur öffentliche Tabellen via **Supabase Anon Key** (kein Service Key)
- Die Website hat **keinen eigenen Backend-Server** — nur Next.js API-Routen als dünner Layer

**Nie duplizieren was die App bereits macht.**
Der Login-Button führt zu `app.backtobalance.online` — kein eigenes Auth auf der Website.

---

## Technischer Stack

```
Framework:     Next.js 14 (App Router)
Sprache:       TypeScript
Styling:       Tailwind CSS
Komponenten:   shadcn/ui
Animationen:   Framer Motion
Datenbank:     Supabase (nur lesen, Anon Key)
i18n:          next-intl (11 Sprachen)
Formulare:     React Hook Form + Zod
E-Mail:        Resend (für Kontaktformulare)
Deployment:    Vercel
Fonts:         Google Fonts – Playfair Display (Überschriften) + Inter (Fließtext)
Icons:         Lucide React
Karte:         Leaflet (Zellen-Weltkarte)
```

---

## Design-System (UNVERÄNDERLICH)

```css
:root {
  --btb-rot:    #b61818;   /* H1, Akzente, primäre CTAs */
  --btb-oliv:   #8fa942;   /* H2, Natur, Fortschrittsbalken */
  --btb-creme:  #f0e9b6;   /* Seitenhintergrund, Karten */
  --btb-blau:   #2a7cab;   /* Links, sekundäre Buttons */
  --btb-dunkel: #1a1505;   /* Fließtext */
  --btb-weiss:  #ffffff;
}
```

**Schriften:** Garamond (alle Überschriften) · Garamond (Fließtext)
**Logo:** `/public/logo.png` – Header links, 40×40px (Platzhalter, wird ersetzt)
**Keine anderen Farben. Kein Dark Mode.**
**Alle Farben ausschließlich über CSS-Variablen.**

---

## Umgebungsvariablen (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL       = https://xcngmshjuqoucdlgikao.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = [anon key — kein service key!]
RESEND_API_KEY                 = [für Kontaktformulare]
STRIPE_PUBLIC_KEY              = [optional — nur wenn Spenden per Karte aktiv]
```

---

## Supabase-Tabellen (nur lesen)

Die App befüllt diese Tabellen. Die Website liest sie.

```
public_fundraising    ← Spendenstand (stündlich von App via FinAPI aktualisiert)
universe_cells        ← Zellen der Genossenschaft (Name, Stadt, Status, Koordinaten)
```

### Spendenstand lesen

```typescript
// app/api/fundraising/route.ts
import { createClient } from '@supabase/supabase-js'

export const revalidate = 300 // Vercel cached 5 Minuten

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from('public_fundraising')
    .select('aktuell_eur, ziel_eur, letzte_aktualisierung, sync_status')
    .single()

  if (error) return Response.json({ error: 'Nicht verfügbar' }, { status: 500 })
  return Response.json(data)
}
```

### Zellen lesen

```typescript
// app/api/public/cells/route.ts
export const revalidate = 3600 // 1 Stunde

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('universe_cells')
    .select('name, city, country, lat, lng, status')
    .eq('status', 'active')

  return Response.json(data ?? [])
}
```

---

## Seitenstruktur

```
backtobalance.online/
│
├── /                              ← Haupt-Landing Page
│
├── /konzept                       ← Konzept-Überblick
├── /konzept/wirtschaft            ← Pool, Dreiteilung, BtB-Coin
├── /konzept/gemeinschaft          ← Zellen, Solidar, Gleichwürdigkeit
├── /konzept/international         ← Vision: weltweite Zellen
│
├── /koerperarbeit                 ← Landing Page Körperarbeit
├── /koerperarbeit/methode         ← Was ist BtB-Körperarbeit?
├── /koerperarbeit/ablauf          ← Was dich erwartet
├── /koerperarbeit/fuer-wen        ← Indikationen, Zielgruppe
├── /koerperarbeit/preise          ← Preise (aus /data/prices.json)
├── /koerperarbeit/termine         ← Buchung (Calendly-Embed)
├── /koerperarbeit/ueber           ← Über den Behandler (Samjo)
├── /koerperarbeit/kontakt         ← Kontakt + Anfahrt
│
├── /mitmachen                     ← Fördermitglied / Unterstützer werden
├── /gruendung                     ← Einladung Gründungsmitglieder
├── /spenden                       ← Spendenaufruf + Live-Fortschrittsbalken
│
├── /app                           ← App-Feature-Übersicht (kein Duplikat)
├── /zellen                        ← Weltkarte aller Zellen (aus Supabase)
├── /faq                           ← Häufige Fragen
├── /dokumente                     ← Konzept, Satzung als Leseansicht + Download
│
└── /impressum                     ← Impressum + Datenschutz
```

---

## Landing Page ( / )

**1. Hero**
- Großes ruhiges Bild (Natur / Freiburg / Gemeinschaft)
- Tagline: "Wirtschaft, die trägt." (oder ähnlich — Platzhalter, Samjo ersetzt)
- Zwei CTAs: "Konzept kennenlernen" → /konzept · "Jetzt mitmachen" → /mitmachen

**2. Was ist BtB**
- 3 Spalten: Wirtschaft · Gemeinschaft · Nachhaltigkeit
- Je Icon + 2 Sätze Fließtext

**3. Live-Stats (Framer Motion, zählen hoch)**
- Gründungsmitglieder: X / 7 (Platzhalter)
- Aktive Zellen: 1
- Gespendete Euro: aus Supabase `public_fundraising.aktuell_eur`

**4. Körperarbeit-Teaser**
- Bild + 2 Sätze + Button "Termin buchen" → /koerperarbeit/termine

**5. App-Teaser**
- Feature-Kacheln (Pool, Coins, Workspace) + Button "App entdecken" → /app

**6. Spendenaufruf-Teaser**
- `<SpendenFortschritt />` Komponente (siehe unten) + CTA "Jetzt spenden" → /spenden

**7. Zellen-Karte**
- Leaflet, Daten aus `/api/public/cells` (Supabase)

---

## Komponente: SpendenFortschritt

Einsetzen auf: Landing Page (Teaser) · /spenden (vollständig)

```typescript
// components/SpendenFortschritt.tsx
'use client'
import { useEffect, useState } from 'react'

type Data = {
  aktuell_eur: number
  ziel_eur: number
  letzte_aktualisierung: string
  sync_status: 'ok' | 'error' | 'pending'
}

export function SpendenFortschritt() {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    fetch('/api/fundraising').then(r => r.json()).then(setData)
  }, [])

  if (!data) return <div style={{ height: 56, background: 'var(--btb-creme)', borderRadius: 8 }} />

  const prozent = Math.min((data.aktuell_eur / data.ziel_eur) * 100, 100)
  const pending = data.sync_status === 'pending'

  return (
    <div>
      <div style={{ background: 'var(--btb-creme)', borderRadius: 8, height: 24, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{
          width: `${prozent}%`, height: '100%',
          background: 'var(--btb-oliv)', borderRadius: 8, transition: 'width 1s ease'
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong style={{ color: 'var(--btb-rot)', fontSize: '1.4rem' }}>
          {pending ? '—' : data.aktuell_eur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </strong>
        <span style={{ color: 'var(--btb-dunkel)', opacity: 0.6 }}>
          von {data.ziel_eur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </span>
      </div>
      {pending && <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: 8 }}>Automatische Aktualisierung wird eingerichtet.</p>}
      {data.sync_status === 'ok' && (
        <p style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: 8 }}>
          Zuletzt: {new Date(data.letzte_aktualisierung).toLocaleString('de-DE')}
        </p>
      )}
    </div>
  )
}
```

---

## Körperarbeit-Seiten (/koerperarbeit/*)

- Ton: einladend, klar, nicht klinisch
- Nie: "Behandlung", "Patient", "Therapie"
- Stattdessen: "Sitzung", "Begleitung", "Prozess"
- SEO-Keywords: "Körperarbeit Freiburg", "somatische Arbeit", "Körpertherapie Freiburg"

### /koerperarbeit/preise — aus `/data/prices.json` lesen

```json
{
  "erstsitzung":    { "extern": 90,  "dauer_min": 90 },
  "einzelsitzung":  { "extern": 70,  "dauer_min": 60 },
  "paket5":         { "extern": 320, "dauer_min": 60 },
  "intern_hinweis": "BtB-Mitglieder tauschen Sitzungen über BtB-Coins"
}
```

---

## Mitmachen / Gründung / Spenden

### /mitmachen
- Fördermitglied (e.V.): ab 50€/Jahr, Einblick + Mitsprache
- Aktivmitglied (eG): Gründungsphase, Vollmitglied
- Kontaktformular → `/api/contact` → Resend

### /gruendung
- Offener Brief an die Gründungsmitglieder
- Zeitplan + Kontaktformular

### /spenden
- Prosa-Spendenaufruf (kein Marketing-Hochglanz)
- `<SpendenFortschritt />` (vollständige Ansicht)
- Zahlungsoptionen: Stripe-Button wenn `STRIPE_PUBLIC_KEY` gesetzt, sonst IBAN

---

## App-Übersicht (/app)

Feature-Kacheln — erklärt, zeigt nicht nach:
- Pool · BtB-Coins · Workspace · Abstimmung · Berufsmodule
- Je: Icon + Titel + 2 Sätze
- Abschluss: "Nur für Mitglieder — Login →" `app.backtobalance.online`

---

## Dokumente (/dokumente)

- Dokumente als Web-Leseansicht (Markdown aus `/content/dokumente/`)
- Download-Button (.pdf)
- Sprachauswahl sobald Übersetzungen vorhanden

---

## Statische Konfigurations-Dateien (/data/)

```
contact.json    ← E-Mail, Telefon, Adresse, Calendly-URL
prices.json     ← Körperarbeit-Preise
```

Zellen und Spendenstand kommen aus Supabase — nicht aus JSON.

---

## i18n (next-intl)

```
11 Sprachen: de · en · zh · es · hi · ar · bn · pt · ru · ja · fr
Standard: de · Fallback: en · RTL für ar

/messages/de/common.json · home.json · konzept.json · koerperarbeit.json · faq.json
/messages/en/ [gleiche Struktur]
```

Keine hardcodierten deutschen Strings im JSX — immer i18n-Keys.

---

## Animationen (Framer Motion)

- Scroll-Reveal: jeder Abschnitt faded rein
- Zahlen-Counter: Stats zählen hoch wenn sichtbar
- Fortschrittsbalken: smooth transition beim Laden

---

## API-Routen (Übersicht)

```
/api/contact           ← Kontaktformular → Resend
/api/fundraising       ← liest public_fundraising aus Supabase (cached 5min)
/api/public/cells      ← liest universe_cells aus Supabase (cached 1h)
```

---

## Regeln für Cursor

1. Logo ist Platzhalter — Nutzer lädt echtes hoch
2. Preise und Kontakt aus `/data/*.json` — nie hardcoden
3. Spendenstand und Zellen immer aus Supabase — nie aus JSON
4. Stripe nur wenn `STRIPE_PUBLIC_KEY` in env — sonst IBAN
5. Kein Service Key auf der Website — nur Anon Key
6. `next/image` mit blur placeholder überall
7. `metadata` export auf jeder Seite (title, description, og:image)
8. Kein Dark Mode. Kein eigenes Auth. Kein Duplikat der App.

---

## Build-Reihenfolge

```
1.  Projektstruktur · package.json · tsconfig · Tailwind · CSS-Variablen
2.  Supabase-Client einrichten (Anon Key, nur lesen)
3.  Header + Footer (Sprachauswahl · Login → app.backtobalance.online)
4.  Landing Page (/)
5.  Konzept-Seiten (/konzept/*)
6.  Körperarbeit-Seiten (/koerperarbeit/*)
7.  /mitmachen · /gruendung · /spenden (mit SpendenFortschritt)
8.  /app · /zellen · /faq · /dokumente
9.  i18n-Keys für alle Seiten
10. API-Routen · Formulare · Resend-Integration
11. SEO · Performance · Vercel-Config

Nach jedem Schritt: testen, Fehler beheben, dann weiter.
```
