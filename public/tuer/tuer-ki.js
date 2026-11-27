/* BtMM Tür-KI: Gesprächsmodus (Plan Tür-KI 25.11.2026, DS-Leitplanken 25.11.2026, Recht-Bot 25.11.2026).
 * Aktiv nur, wenn window.BTMM_TUER_KI_AN (ki-schalter.js, aus TUER_KI_ENABLED beim Build) true ist.
 * Sonst bleibt die Tür exakt wie bisher (regelbasierter Dialog aus tuer.js, bisherige Texte).
 * - Beim ersten Laden (KI an): feste Begrüßung, erste Frage und Eingabefeld, ohne Zwischenklick. Kein LLM und kein Netzaufruf vor dem ersten Senden; danach nur POST /api/tuer-ki. Die erste Frage geht als assistant-Nachricht mit in den Verlauf an das Modell.
 * - Verlauf nur in sessionStorage (endet mit dem Tab), „Gespräch löschen“ leert ihn.
 * - KI-Kennzeichnung (Art. 50 KI-VO) sichtbar über dem Eingabefeld, aria-describedby am Feld.
 * - KI-Antworten im HTML mit data-ai-generated="true".
 * - Schalter serverseitig aus, Limit, Deckel oder Fehler: nur Hinweis „gerade nicht verfügbar“ und Links, kein Übergang zum alten Dialog.
 * - Solange TUER_KI_ENABLED im Build aus ist, bleibt die heutige Tür unverändert; der alte Dialog wird nach Go-Live in einem eigenen PR gelöscht. */
(function () {
  'use strict';
  var KI_KEY = 'btmm-tuer-ki-v1';
  var ALT = window.BTMM_TUER_ALT;
  var ALLE = window.BTMM_TUER_KI_TEXTE || {};
  if (!ALT || !window.BTMM_TUER_KI_AN || !ALLE.de) return;
  var LANG = ALT.lang, BASIS = ALT.basis;
  var K = ALLE[LANG] || ALLE.de;
  var SEITEN = ['/faq','/dokumente','/mitmachen','/wissen','/so-funktionierts','/was-du-sparst','/konzept/wirtschaft','/konzept','/gruendung','/chronik','/offene-fragen','/fuer-dich/kunden','/fuer-dich/berufseinstieg','/fuer-dich/lebensphasen','/fuer-dich/ruhestand','/fuer-dich/unterstuetzen','/fuer-dich'];
  var $ = function (id) { return document.getElementById(id); };
  var feld = $('antwort'), verlaufEl = $('verlauf');
  var st = laden() || { gestartet: false, nachrichten: [], schritte: [] };
  var beschaeftigt = false;

  function laden() { try { return JSON.parse(sessionStorage.getItem(KI_KEY)); } catch (e) { return null; } }
  function speichern() { try { sessionStorage.setItem(KI_KEY, JSON.stringify(st)); } catch (e) {} }
  if (st.lang && st.lang !== LANG) st = { gestartet: false, nachrichten: [], schritte: [] };
  st.lang = LANG;

  function setzeText(sel, text) { var el = document.querySelector(sel); if (el) el.textContent = text; }
  function kiTexte() {
    setzeText('[data-t="tuerP"]', K.tuerP);
    setzeText('[data-t="kopfSub"]', K.kopfSub);
    setzeText('#ds-hinweis [data-t="ds"]', K.ds);
    setzeText('#loeschen', K.loeschen);
    setzeText('[data-t="antwortLabel"]', K.antwortLabel);
    feld.setAttribute('placeholder', K.placeholder);
    $('senden').setAttribute('aria-label', K.sendenAria);
    $('ki-hinweis').textContent = K.kiHinweis;
    $('ki-starten').textContent = K.starten;
  }
  kiTexte();

  function eingabeFrei(an) { feld.disabled = !an; $('senden').disabled = !an; $('mik').disabled = !an; }
  function nachUnten() { requestAnimationFrame(function () { window.scrollTo({ top: document.documentElement.scrollHeight }); }); }
  var SEITEN_TITEL = {'/faq':'Häufige Fragen','/dokumente':'Dokumente','/mitmachen':'Mitmachen','/wissen':'Wissen','/so-funktionierts':'So funktioniert es','/was-du-sparst':'Was Sie sparen','/konzept':'Konzept','/konzept/wirtschaft':'Wirtschaft','/gruendung':'Gründung','/chronik':'Chronik','/offene-fragen':'Offene Fragen','/fuer-dich':'Für Sie','/fuer-dich/kunden':'Für Kundinnen und Kunden','/fuer-dich/berufseinstieg':'Berufseinstieg','/fuer-dich/lebensphasen':'Lebensphasen','/fuer-dich/ruhestand':'Ruhestand','/fuer-dich/unterstuetzen':'Unterstützen'};
  var DOK_TITEL = {'00-einfach-erklaert':'BtMM einfach erklärt','01-einfuehrung':'Einführung','02-aufruf-beteiligung':'Aufruf zur Beteiligung','03-einladung-gruendung':'Einladung zur Gründung','04-wirtschaften-anleitung':'Wirtschaften im System','05-gemeinschaftskultur':'Leben im System','06-gute-gruende':'Gute Gründe','07-konzept':'Vollkonzept','08-satzung':'Satzung (Entwurf)','08a-ordnungen':'Ordnungen (Entwurf)','11-handwerk-ergaenzung':'Handwerk und Zulassungen','12-handwerk-zulassungen':'Handwerk, Zulassungen und Meisterpflicht','13-ideen-horizonte':'Ideen und Horizonte','15-geschaeftsmodell':'Geschäftsmodell (Entwurf)','16-schnelle-einnahmen':'Schnelle Einnahmen','17-grosser-fahrplan':'Der große Fahrplan','18-demokratie-schluessel':'Der Demokratie-Schlüssel','19-soziale-zahlen':'Soziale Zahlen','20-berufe-ohne-abschluss':'Berufe ohne Abschluss','21-bildung-finanzieren':'Bildung finanzieren','22-heilen-schuetzen-vorbeugen':'Heilen, Schützen, Vorbeugen','23-ausfall-versorgung':'Wenn jemand ausfällt','24-partner-werden':'Partner werden','25-ehrliche-bilanz':'Ehrliche Bilanz','26-fairer-handel':'Fairer Handel','27-kreislauf':'BtMM-Kreislauf','28-aufnahme-kurz-erklaert':'Aufnahme kurz erklärt','29-der-keim':'Der Keim','30-gewerbe-katalog':'Gewerbe-Katalog','31-coin-ordnung':'Coin-Ordnung (Entwurf)'};
  var LOCALES = ['de','en','zh','es','hi','ar','bn','pt','ru','ja','fr'];
  function dokSlug(kurz) {
    kurz = String(kurz || '').toLowerCase();
    if (DOK_TITEL[kurz]) return kurz;
    var n = /^\d{1,2}[a-z]?$/.exec(kurz);
    if (!n) return null;
    var num = n[0].length === 1 ? '0' + n[0] : n[0];
    var k;
    for (k in DOK_TITEL) { if (k === num || k.indexOf(num + '-') === 0) return k; }
    return null;
  }
  function zerlegeErlaubtenPfad(raw) {
    var s = String(raw || '').trim();
    if (!s || /^(javascript|data|vbscript|file|blob):/i.test(s)) return null;
    s = s.replace(/[),.;!?]+$/g, '');
    if (/^www\./i.test(s)) s = 'https://' + s;
    var host = s.match(/^https?:\/\/([^/]+)/i);
    if (host) {
      var h = host[1].toLowerCase().replace(/:\d+$/, '');
      if (h !== 'b-t-m-m.com' && h !== 'www.b-t-m-m.com') return null;
      s = s.replace(/^https?:\/\/[^/]+/i, '') || '/';
    } else if (/^\/\//.test(s) || /^[a-z][a-z0-9+.-]*:/i.test(s)) return null;
    if (s.charAt(0) !== '/' || s.indexOf('//') === 0) return null;
    s = s.split(/[?#]/)[0];
    try { s = decodeURIComponent(s); } catch (e) { return null; }
    if (s.indexOf('..') >= 0 || s.indexOf('//') >= 0 || s.indexOf('\\') >= 0) return null;
    if (!/^\/[a-z0-9/_-]*$/i.test(s)) return null;
    var locale = null, i;
    for (i = 0; i < LOCALES.length; i++) {
      if (s === '/' + LOCALES[i]) { locale = LOCALES[i]; s = '/'; break; }
      if (s.indexOf('/' + LOCALES[i] + '/') === 0) { locale = LOCALES[i]; s = s.slice(LOCALES[i].length + 1); break; }
    }
    if (s.length > 1) s = s.replace(/\/+$/, '');
    for (i = 0; i < SEITEN.length; i++) if (SEITEN[i] === s) return { pfad: s, locale: locale };
    var dok = /^\/dokumente\/([a-z0-9-]+)$/i.exec(s);
    if (dok) { var slug = dokSlug(dok[1]); if (slug) return { pfad: '/dokumente/' + slug, locale: locale }; }
    return null;
  }
  function erlaubterPfad(raw) {
    var z = zerlegeErlaubtenPfad(raw);
    return z ? z.pfad : null;
  }
  function findeMarkdownLinks(roh) {
    var aus = [], i = 0;
    while (i < roh.length) {
      if (roh.charAt(i) !== '[') { i++; continue; }
      var auf = roh.indexOf('](', i);
      if (auf < 0) break;
      var titel = roh.slice(i + 1, auf);
      if (titel.indexOf('[') >= 0 || titel.indexOf('\n') >= 0) { i++; continue; }
      var k = auf + 2, tiefe = 1, c;
      while (k < roh.length && tiefe > 0) {
        c = roh.charAt(k);
        if (c === '(') tiefe++;
        else if (c === ')') tiefe--;
        k++;
      }
      if (tiefe !== 0) { i++; continue; }
      aus.push({ start: i, ende: k, titel: titel, ziel: roh.slice(auf + 2, k - 1) });
      i = k;
    }
    return aus;
  }
  function linkTeilAus(raw, titel) {
    var z = zerlegeErlaubtenPfad(raw);
    if (!z) return null;
    var teil = { typ: 'link', pfad: z.pfad, titel: linkTitel(z.pfad, titel) };
    if (z.locale) teil.locale = z.locale;
    return teil;
  }
  function linkTitel(pfad, vorgabe) {
    var p = erlaubterPfad(pfad) || pfad, v = String(vorgabe || '').trim();
    if (v && !/https?:|www\.|javascript:/i.test(v) && v.length <= 80 && !/\beG\b/.test(v)) return v.replace(/\s+/g, ' ');
    if (K.links && p === '/faq') return K.links.faq;
    if (K.links && p === '/dokumente') return K.links.dokumente;
    if (K.links && p === '/mitmachen') return K.links.mitmachen;
    if (SEITEN_TITEL[p]) return SEITEN_TITEL[p];
    var dok = /^\/dokumente\/([a-z0-9-]+)$/i.exec(p);
    if (dok && DOK_TITEL[dok[1]]) return DOK_TITEL[dok[1]];
    return p;
  }
  function parseAntwortMitLinks(text) {
    var roh = String(text || ''), belegt = [], teile = [], i, m, re, md, teil;
    function frei(a, b) { var j; for (j = 0; j < belegt.length; j++) if (a < belegt[j].ende && b > belegt[j].start) return false; return true; }
    function merke(start, ende, teil) { if (!frei(start, ende)) return; belegt.push({ start: start, ende: ende, teil: teil }); }
    md = findeMarkdownLinks(roh);
    for (i = 0; i < md.length; i++) {
      teil = linkTeilAus(md[i].ziel, md[i].titel);
      merke(md[i].start, md[i].ende, teil || { typ: 'text', text: (md[i].titel || '').trim() });
    }
    re = /\bhttps?:\/\/[^\s<>[\]()]+|\bwww\.[^\s<>[\]()]+/gi;
    while ((m = re.exec(roh))) {
      teil = linkTeilAus(m[0]);
      merke(m.index, m.index + m[0].length, teil || { typ: 'text', text: '' });
    }
    var alt = SEITEN.slice().sort(function (a, b) { return b.length - a.length; }).map(function (x) { return x.replace(/\//g, '\\/'); });
    var loc = '(?:\\/(?:' + LOCALES.join('|') + '))?';
    re = new RegExp('(' + loc + '(?:\\/dokumente(?:\\/[A-Za-z0-9-]+)?|' + alt.filter(function (x) { return x !== '\\/dokumente'; }).join('|') + '))(?![A-Za-z0-9/_-])', 'g');
    while ((m = re.exec(roh))) {
      teil = linkTeilAus(m[1]);
      if (teil) merke(m.index, m.index + m[0].length, teil);
    }
    belegt.sort(function (a, b) { return a.start - b.start; });
    i = 0;
    for (var b = 0; b < belegt.length; b++) {
      if (belegt[b].start > i) teile.push({ typ: 'text', text: roh.slice(i, belegt[b].start) });
      teile.push(belegt[b].teil);
      i = belegt[b].ende;
    }
    if (i < roh.length) teile.push({ typ: 'text', text: roh.slice(i) });
    return teile.filter(function (t) { return t.typ === 'link' || t.text !== ''; });
  }
  function setzeMitLinks(el, text) {
    var teile = parseAntwortMitLinks(text), t, a;
    for (t = 0; t < teile.length; t++) {
      if (teile[t].typ === 'link') {
        a = document.createElement('a');
        a.className = 'ki-inlink';
        a.href = (teile[t].locale && LOCALES.indexOf(teile[t].locale) >= 0 ? '/' + teile[t].locale : BASIS) + teile[t].pfad;
        a.textContent = teile[t].titel;
        el.appendChild(a);
      } else {
        el.appendChild(document.createTextNode(teile[t].text));
      }
    }
  }
  function blase(text, wer, ki) {
    var li = document.createElement('li');
    li.className = 'blase ' + wer;
    if (ki) li.setAttribute('data-ai-generated', 'true');
    if (wer === 'antwort' || (wer.indexOf('antwort') === 0 && !ki)) li.textContent = text;
    else setzeMitLinks(li, text);
    verlaufEl.appendChild(li);
    nachUnten();
    return li;
  }

  function wegLeiste(mitLinks, weiter) {
    var box = $('ki-weg');
    box.innerHTML = '';
    if (weiter) {
      var a = document.createElement('a');
      a.className = 'knopf'; a.href = BASIS + weiter; a.textContent = linkTitel(weiter);
      box.appendChild(a);
    }
    if (st.schritte && st.schritte.length) {
      var w = document.createElement('button');
      w.type = 'button'; w.className = 'knopf'; w.textContent = K.weg;
      w.addEventListener('click', function () { ALT.pfad(st.schritte); });
      box.appendChild(w);
    }
    if (mitLinks) {
      var nav = document.createElement('nav'); nav.className = 'ki-links';
      [['start', ''], ['faq', '/faq'], ['dokumente', '/dokumente'], ['mitmachen', '/mitmachen']].forEach(function (l) {
        var a = document.createElement('a'); a.href = BASIS + l[1]; a.textContent = K.links[l[0]]; nav.appendChild(a);
      });
      box.appendChild(nav);
    }
    box.hidden = !box.children.length;
    nachUnten();
  }

  function gespraechAn() {
    $('ki-start').hidden = true;
    eingabeFrei(true);
    feld.focus({ preventScroll: true });
  }

  function zeigeEinstieg() {
    blase(K.begruessung, 'echo');
    function frage() { blase(K.ersteFrage, 'frage'); gespraechAn(); }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) frage();
    else setTimeout(frage, 600);
  }

  var offen = false;
  function start() {
    document.body.classList.add('modus-ki');
    $('tuer').hidden = true; $('dialog').hidden = false; document.body.className = 'phase-dialog modus-ki';
    $('wahl').hidden = true;
    $('ki-hinweis').hidden = false;
    $('ki-start').hidden = true;
    feld.setAttribute('aria-describedby', 'ki-hinweis ds-hinweis');
    if (offen) return;
    offen = true;
    verlaufEl.innerHTML = '';
    eingabeFrei(false);
    if (st.gestartet) {
      blase(K.begruessung, 'echo');
      if (!st.nachrichten.length) blase(K.ersteFrage, 'frage');
      st.nachrichten.forEach(function (n) { blase(n.text, n.rolle === 'user' ? 'antwort' : 'frage', n.rolle === 'assistant'); });
      wegLeiste(false);
      gespraechAn();
    } else {
      st.gestartet = true;
      speichern();
      zeigeEinstieg();
    }
  }

  $('ki-starten').addEventListener('click', start);

  function senden(text) {
    text = (text || '').trim();
    if (!text || beschaeftigt || !st.gestartet) return;
    beschaeftigt = true;
    if (ALT.mikStop) ALT.mikStop();
    var eigene = blase(text, 'antwort');
    feld.value = '';
    eingabeFrei(false);
    var warte = blase(K.schreibt, 'echo warte');
    var anfrage = st.nachrichten.concat([{ rolle: 'user', text: text }]);
    if (!anfrage.some(function (n) { return n.rolle === 'assistant' && n.text === K.ersteFrage; })) {
      anfrage = [{ rolle: 'assistant', text: K.ersteFrage }].concat(anfrage);
    }
    fetch('/api/tuer-ki', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nachrichten: anfrage, sprache: LANG, website: $('tuer-website').value })
    }).then(function (r) { return r.json().catch(function () { return { status: 'fehler' }; }); })
      .catch(function () { return { status: 'netz' }; })
      .then(function (d) {
        warte.remove();
        beschaeftigt = false;
        var s = d && d.status;
        if (s === 'ok' && d.antwort) {
          st.nachrichten = anfrage.concat([{ rolle: 'assistant', text: d.antwort }]);
          if (d.schritte && d.schritte.length) st.schritte = d.schritte;
          speichern();
          blase(d.antwort, 'frage', d.generative !== false);
          wegLeiste(false, d.weiterleitung);
          eingabeFrei(true);
          return;
        }
        if (s === 'sensibel') {
          // Nachricht nicht in den Verlauf; markierte frühere Nachrichten ebenfalls entfernen
          eigene.remove();
          // Indizes beziehen sich auf die gesendete Anfrage (mit evtl. vorangestellter erster Frage), nicht auf st.nachrichten
          var wegObj = (d.entfernen || []).map(function (i) { return anfrage[i]; }).filter(Boolean);
          if (wegObj.length) { st.nachrichten = st.nachrichten.filter(function (n) { return wegObj.indexOf(n) === -1; }); speichern(); }
          blase(d.text, 'echo');
          eingabeFrei(true);
          return;
        }
        if (s === 'zu_lang') { eigene.remove(); feld.value = text; blase(d.text, 'echo'); eingabeFrei(true); return; }
        if (s === 'ende') { blase(d.text, 'echo'); if (!st.schritte.length) st.schritte = ['grundlagen', 'dokumente', 'vorbei']; speichern(); ALT.pfad(st.schritte); return; }
        // aus, limit, deckel, fehler, netz, ungueltig: nur Hinweis und Links, kein alter Dialog
        eigene.remove();
        blase((d && d.text) || K.netz, 'echo');
        if (s === 'limit' || s === 'fehler' || s === 'netz') eingabeFrei(true);
        wegLeiste(true);
      });
  }

  $('eingabe').addEventListener('submit', function (e) { if (document.body.classList.contains('modus-ki')) { e.preventDefault(); senden(feld.value); } });
  feld.addEventListener('keydown', function (e) { if (document.body.classList.contains('modus-ki') && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); senden(feld.value); } });

  window.BTMM_TUER_KI = { aktiv: function () { return true; }, start: start };
  // „Zurück zum Weg“ aus der Pfad-Leiste: Weg aus dem Gespräch zeigen
  if (new URLSearchParams(location.search).has('pfad') && st.schritte && st.schritte.length) ALT.pfad(st.schritte);
  else start();
})();
