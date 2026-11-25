#!/usr/bin/env python3
"""Runde 4: Beleg, dass die Antwort-Chips (motiv, lage, zeit) ohne manuelles Scrollen sichtbar sind, nur lokal.
Prüft in allen 11 Sprachen auf 390x844 (hochkant) und 844x390 (quer), zusätzlich 1440x900: jeder Chip, die letzte Frage und das
Eingabefeld liegen vollständig im Viewport. Screens (DPR 2, Bildschirmhöhe) nur für Deutsch.
Nutzung: python3 scripts/personas/screens-r4.py http://127.0.0.1:3127 <ausgabeordner>"""
import json, sys, re, os, time
from playwright.sync_api import sync_playwright

BASIS = sys.argv[1]; AUS = sys.argv[2]; os.makedirs(AUS, exist_ok=True)
assert re.match(r'^http://(127\.0\.0\.1|localhost)(:\d+)?$', BASIS)
G = {'hochkant': (390, 844), 'quer': (844, 390), 'desktop': (1440, 900)}
LANGS = [x for x in os.environ.get('LANGS', 'de,en,zh,es,hi,ar,bn,pt,ru,ja,fr').split(',') if x]
if os.environ.get('NUR_GERAET'): G = {k: v for k, v in G.items() if k == os.environ['NUR_GERAET']}
PRUEF = """() => { const H = innerHeight, W = innerWidth, sicht = (el) => { const r = el.getBoundingClientRect(); return r.top >= -0.5 && r.bottom <= H + 0.5 && r.left >= -0.5 && r.right <= W + 0.5 && r.height > 0 };
  const chips = [...document.querySelectorAll('.wahl-knopf')], fragen = document.querySelectorAll('.blase.frage'), frage = fragen[fragen.length - 1];
  return { chips: chips.length, chipsSichtbar: chips.filter(sicht).length, frageSichtbar: !!frage && sicht(frage), feldSichtbar: sicht(document.getElementById('antwort')),
           scrollY: Math.round(scrollY), seiteHoehe: document.documentElement.scrollHeight, viewport: [W, H] } }"""
def warte_frage(pg):
    pg.wait_for_function("() => !document.getElementById('antwort').disabled || !document.getElementById('pfad').hidden", timeout=10000)
    time.sleep(0.9)  # sanftes Scrollen abwarten
def offen(pg): return pg.evaluate("() => JSON.parse(sessionStorage.getItem('btmm-eintritt-v1')||'{}').offen")
ergebnis = {}
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True)
    for gname, (w, h) in G.items():
        for lang in LANGS if gname != 'desktop' else ['de']:
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, is_mobile=gname != 'desktop', has_touch=gname != 'desktop')
            pg = ctx.new_page(); pg.goto(f'{BASIS}/tuer/index.html?lang={lang}&neu=1'); pg.wait_for_selector('#eintreten'); pg.click('#eintreten')
            for _ in range(10):
                try: warte_frage(pg)
                except Exception: break
                if not pg.is_hidden('#pfad'): break
                f = offen(pg)
                if f in ('motiv', 'lage', 'zeit'):
                    r = pg.evaluate(PRUEF); r['ok'] = r['chips'] > 0 and r['chipsSichtbar'] == r['chips'] and r['frageSichtbar'] and r['feldSichtbar']
                    ergebnis[f'{lang}|{gname}|{f}'] = r
                    if lang == 'de': pg.screenshot(path=f'{AUS}/r4-{f}-chips-{gname}.png')
                    idx = {'motiv': 0, 'lage': 3, 'zeit': 1}[f]
                    pg.locator('.wahl-knopf').nth(idx).click()
                else:
                    pg.fill('#antwort', 'Freiburg' if f == 'ort' else 'Google'); pg.press('#antwort', 'Enter')
            ctx.close()
    for gname, (w, h) in ({} if os.environ.get('NUR_GERAET') else {'hochkant': (390, 844), 'desktop': (1440, 900)}).items():
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2); pg = ctx.new_page()
        pg.goto(f'{BASIS}/de/fuer-dich/ruhestand'); pg.wait_for_load_state('networkidle')
        pg.locator('#ruhestand').scroll_into_view_if_needed(); time.sleep(0.4); pg.screenshot(path=f'{AUS}/r4-ruhestand-{gname}.png')
        pg.goto(f'{BASIS}/de/faq'); pg.wait_for_load_state('networkidle'); pg.locator('#arbeit-bezahlt').scroll_into_view_if_needed(); time.sleep(0.4)
        pg.screenshot(path=f'{AUS}/r4-faq-lohn-{gname}.png'); ctx.close()
    b.close()
json.dump(ergebnis, open(f'{AUS}/chips-sichtbar.json', 'w'), indent=1, ensure_ascii=False)
fehl = {k: v for k, v in ergebnis.items() if not v['ok']}
print(f'Prüfungen: {len(ergebnis)}, ohne Scrollen sichtbar: {len(ergebnis) - len(fehl)}, nicht: {len(fehl)}')
for k, v in fehl.items(): print('  NICHT OK', k, v)
