#!/usr/bin/env python3
"""Screens der Überzeugungstür in Bildschirmhöhe (390x844 und 1440x900, DPR 2), nur lokal.
Je Persona: Tür-Dialog (letzte Frage), Pfad-Übersicht, erste Zielseite. Dazu die neuen Abschnitte.
Nutzung: python3 scripts/personas/screens.py http://127.0.0.1:3101 <ausgabeordner>"""
import json, sys, time, re, os
from playwright.sync_api import sync_playwright

BASIS = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:3101'
AUS = sys.argv[2] if len(sys.argv) > 2 else '.'
assert re.match(r'^http://(127\.0\.0\.1|localhost)(:\d+)?$', BASIS)
alt = json.load(open(f'{AUS}/pfade.json')) if os.path.exists(f'{AUS}/pfade.json') else {}
G = {'mobil': (390, 844), 'desktop': (1440, 900)}
STD = {'herkunft': 'Ein Bekannter hat es empfohlen.', 'ort': 'In der Nähe von Freiburg.', 'zeit': 'Erst mal lesen.'}
P = {
 '01-meister': {'motiv': 'Ich bin Tischlermeister mit eigenem Betrieb und die Verwaltung frisst mich auf.', 'lage': 'Wir haben zwei Kinder.', 'arbeit': 'Ich leite eine Schreinerei mit Werkstatt.', 'zweifel': 'Wer haftet, und bleibt mein Betrieb meiner?'},
 '02-geselle-werkstatt': {'motiv': 'Ich bin Schreinergeselle und habe eine eigene kleine Werkstatt.', 'lage': 'Ich will mich beruflich neu orientieren.', 'arbeit': 'Holz, Möbel, Innenausbau.'},
 '03-tischler': {'motiv': 'Ich bin Tischler und mich interessiert die Zusammenarbeit mit anderen Betrieben.', 'lage': 'Mit Familie muss es sich rechnen.', 'arbeit': 'Tischler im Innenausbau.'},
 '04-gewerke': {'motiv': 'Maler und Lackierer, ich suche Partner.', 'lage': 'Bei mir ändert sich gerade viel im Job.', 'arbeit': 'Maler, eigener Betrieb mit einem Azubi.'},
 '05-unternehmer': {'motiv': 'Ich habe eine kleine Firma in der IT und suche ein anderes Wirtschaftsmodell.', 'lage': 'Mal sehen.', 'arbeit': 'Geschäftsführer einer kleinen Agentur.'},
 '06-solo': {'motiv': 'Ich bin freiberufliche Grafikerin und oft allein mit allem.', 'lage': 'Ich steh am Anfang im Beruf.', 'arbeit': 'Freiberuflich im Webdesign.'},
 '07-kunde': {'motiv': 'Ich suche jemanden für eine neue Küche und will bei fairen Betrieben kaufen, als Kundin.', 'lage': 'Wir haben zwei Kinder.'},
 '08-interessiert': {'motiv': 'Ich will verstehen, worum es geht.', 'lage': 'Ich bin im Ruhestand.', 'sinn': 'Gemeinschaft und faire Arbeit.'},
 '09-skeptiker': {'motiv': 'Ehrlich gesagt bin ich skeptisch, wo ist der Haken?', 'lage': 'Weiß nicht.', 'zweifel': 'Belege, Zahlen und eine echte Satzung.'},
 '10-gruender-sparer': {'motiv': 'Ich will mitgründen und im Alltag Geld sparen.', 'lage': 'Gerade erst eingestiegen, Ausbildung fertig.', 'sparen': 'Miete und Lebensmittel.', 'zeit': 'Ich will mitmachen.'},
 '11-unterstuetzer': {'motiv': 'Ich würde das gern unterstützen, auch mit einer Spende.', 'lage': 'Ich bin Rentner und habe Zeit.', 'sinn': 'Gerechtere Wirtschaft.'},
 '13-ruhestand': {'motiv': 'Ich habe 40 Jahre im Handwerk gearbeitet und will meine Erfahrung weitergeben.', 'lage': 'Ich bin im Ruhestand.', 'arbeit': 'Früher Schreinermeister.'},
 '14-unterstuetzer-geld': {'motiv': 'Ich möchte euch unterstützen, ohne selbst Mitglied zu werden.', 'lage': 'Wir haben zwei Kinder.', 'sinn': 'Gerechtere Wirtschaft.'},
 '12-berufseinstieg': {'motiv': 'Ich will wissen, worum es geht.', 'lage': 'Ich bin gerade mit der Ausbildung fertig.', 'arbeit': 'Ich suche meine erste Stelle.'},
}
NEU = [('n1-berufseinstieg', '/de/fuer-dich/berufseinstieg', None), ('n2-kunden', '/de/fuer-dich/kunden', None),
       ('n3-lebensphasen', '/de/fuer-dich/lebensphasen', None), ('n4-faq-lohn', '/de/faq', '#arbeit-bezahlt'),
       ('n5-konzept-stundensatz', '/de/konzept', 'text=Das erste Ziel sind 20 € brutto'),
       ('n6-ruhestand', '/de/fuer-dich/ruhestand', None), ('n7-unterstuetzen', '/de/fuer-dich/unterstuetzen', None),
       ('n8-ruhestand-notgroschen', '/de/fuer-dich/ruhestand', '.btmm-hinweis'), ('n9-ruhestand-en', '/en/fuer-dich/ruhestand', None)]
ergebnis = dict(alt)
NUR = [x for x in os.environ.get('NUR', '').split(',') if x]
if NUR: P = {k: v for k, v in P.items() if k in NUR}; NEU = [n for n in NEU if n[0] in NUR]
def geh(pg, url):
    for i in range(8):
        try:
            return pg.goto(url)
        except Exception:
            time.sleep(4)
    raise RuntimeError('nicht erreichbar: ' + url)
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True)
    for gname, (w, h) in G.items():
        for name, ans in P.items():
            if not NUR and os.path.exists(f'{AUS}/{name}-{gname}-3-erste-zielseite.png') and f'{name}-{gname}' in alt: ergebnis[f'{name}-{gname}'] = alt[f'{name}-{gname}']; continue
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, locale='de-DE')
            pg = ctx.new_page()
            geh(pg, f'{BASIS}/tuer/index.html?lang=de&neu=1'); pg.wait_for_selector('#eintreten')
            pg.click('#eintreten')
            gestellt = []
            for _ in range(10):
                try:
                    pg.wait_for_function("() => !document.getElementById('antwort').disabled || !document.getElementById('pfad').hidden", timeout=8000)
                except Exception:
                    break
                if not pg.is_hidden('#pfad'): break
                st = json.loads(pg.evaluate("sessionStorage.getItem('btmm-eintritt-v1')") or '{}')
                fid = st.get('offen'); gestellt.append(fid)
                if len(gestellt) == 3 or fid == 'lage':
                    pass
                txt = ans.get(fid) or STD.get(fid) or ans.get('motiv')
                if fid == 'lage' and name in ('07-kunde', '13-ruhestand'):
                    pg.wait_for_selector('.blase.wahl', timeout=5000); time.sleep(0.6)
                    pg.screenshot(path=f'{AUS}/{name}-{gname}-0-lage-wahl.png')
                if len([g for g in gestellt if g]) >= 6 or fid == 'zeit':
                    pg.fill('#antwort', txt); pg.screenshot(path=f'{AUS}/{name}-{gname}-1-tuer-frage.png'); pg.keyboard.press('Enter')
                else:
                    pg.fill('#antwort', txt); pg.keyboard.press('Enter')
            pg.wait_for_selector('#pfad:not([hidden])', timeout=15000); time.sleep(0.6)
            pg.screenshot(path=f'{AUS}/{name}-{gname}-2-pfad.png')
            schritte = pg.eval_on_selector_all('#schritte li h2', 'els => els.map(e => e.textContent)')
            ziel = pg.get_attribute('#kennenlernen', 'href')
            pg.click('#kennenlernen'); pg.wait_for_load_state('networkidle'); time.sleep(1.2)
            pg.screenshot(path=f'{AUS}/{name}-{gname}-3-erste-zielseite.png')
            ergebnis[f'{name}-{gname}'] = {'fragen': gestellt, 'schritte': schritte, 'ersteZielseite': ziel}
            ctx.close()
            json.dump(ergebnis, open(f'{AUS}/pfade.json', 'w'), ensure_ascii=False, indent=1)
        for name, url, anker in NEU:
            if os.path.exists(f'{AUS}/{name}-{gname}.png'): continue
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, locale='de-DE')
            pg = ctx.new_page(); geh(pg, f'{BASIS}{url}?ohne-tuer=1'); pg.wait_for_load_state('networkidle'); time.sleep(1.2)
            if anker:
                loc = pg.locator(anker).first if anker.startswith('text=') else pg.locator(anker)
                loc.scroll_into_view_if_needed(); pg.evaluate('window.scrollBy(0, -90)'); time.sleep(0.8)
            pg.screenshot(path=f'{AUS}/{name}-{gname}.png'); ctx.close()
    b.close()
json.dump(ergebnis, open(f'{AUS}/pfade.json', 'w'), ensure_ascii=False, indent=1)
for k, v in ergebnis.items(): print(k, '|', ' > '.join(v['schritte']), '|', v['ersteZielseite'])
