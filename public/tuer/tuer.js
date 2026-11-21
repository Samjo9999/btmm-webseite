/* BtMM Tür-Eintritt als offener Dialog (Nutzer 20.11.2026 23:50) mit persönlichem Kennenlern-Pfad
 * (Nutzer 21.11.2026 00:21: „Das ankommen soll mich gezielt abholen und einen individuellen kennenlernt Pfad erzeugen“).
 * Regelbasiert, ohne LLM (KI-Kostenregel 0 €, nur extraktiv). Antworten nur in sessionStorage.
 * Ablauf: offene Fragen → Profil aus Schlagworten → Pfad mit Schritten → geführt über die echten Seiten (PfadLeiste).
 * Sprache über ?lang=<locale> (Rückfall de), alle Texte aus texte.js. */
(function () {
  'use strict';
  var KEY = 'btmm-eintritt-v1', PFAD_KEY = 'btmm-eintritt-pfad', DURCH_KEY = 'btmm-tuer-durch';
  var $ = function (id) { return document.getElementById(id); };
  var ALLE = window.BTMM_TUER_TEXTE || {};
  var LOCALES = ['de', 'en', 'zh', 'es', 'hi', 'ar', 'bn', 'pt', 'ru', 'ja', 'fr'];
  var params = new URLSearchParams(location.search);
  var LANG = params.get('lang');
  /* Rückfall: Texte oder Pfad-Logik nicht geladen (Netzfehler, Blocker) → Tür führt ohne Fragen auf die Webseite */
  if (!ALLE.de || !window.BTMM_TUER_PFAD) {
    var notLang = LOCALES.indexOf(LANG) !== -1 ? LANG : 'de', notZiel = '/' + notLang + '?ohne-tuer=1';
    var notKnopf = $('eintreten'); if (notKnopf) notKnopf.addEventListener('click', function () { location.href = notZiel; });
    [].forEach.call(document.querySelectorAll('a.ohne'), function (a) { a.href = notZiel; });
    return;
  }
  if (!LANG || LOCALES.indexOf(LANG) === -1 || !ALLE[LANG]) LANG = 'de';
  var T = ALLE[LANG], DE = ALLE.de;
  var BASIS = '/' + LANG;

  /* ---------- Sprache auf die Seite anwenden ---------- */
  document.documentElement.lang = LANG;
  document.documentElement.dir = T.dir || 'ltr';
  document.title = T.titel;
  [].forEach.call(document.querySelectorAll('[data-t]'), function (el) { var k = el.getAttribute('data-t'); if (T[k]) el.textContent = T[k]; });
  [].forEach.call(document.querySelectorAll('[data-t-ph]'), function (el) { el.setAttribute('placeholder', T[el.getAttribute('data-t-ph')]); });
  [].forEach.call(document.querySelectorAll('[data-t-aria]'), function (el) { el.setAttribute('aria-label', T[el.getAttribute('data-t-aria')]); });
  [].forEach.call(document.querySelectorAll('[data-ort]'), function (el) { var o = el.getAttribute('data-ort'); el.setAttribute('href', o === 'start' ? BASIS : BASIS + o); });

  /* ---------- Schlagworte → Merkmale (Logik in pfad.js) ---------- */
  var PF = window.BTMM_TUER_PFAD;
  var MERKMALE = PF.merkmaleFuer(T, DE, LANG);
  function auswerten(text) { return PF.auswerten(MERKMALE, text); }

  /* ---------- Fragen (offen, Auswahl nach Profil) ---------- */
  var FRAGEN = [
    { id: 'herkunft', immer: true }, { id: 'motiv', immer: true },
    { id: 'sparen', wenn: 'sparen' }, { id: 'arbeit', wenn: 'arbeiten' }, { id: 'wohnen', wenn: 'wohnen' },
    { id: 'zweifel', wenn: 'skeptisch' }, { id: 'sinn', wenn: 'sinn' },
    { id: 'ort', immer: true }, { id: 'zeit', immer: true }
  ];
  FRAGEN.forEach(function (f) { f.text = T.fragen[f.id]; });
  var MAX_FRAGEN = 6;

  var SCHRITTE = PF.SCHRITTE, BILDER = PF.BILDER;
  function bildUrl(src) { return '/_next/image?url=' + encodeURIComponent(src) + '&w=256&q=70'; }

  /* ---------- Zustand ---------- */
  var st = laden(KEY) || { antworten: [], profil: {}, gestellt: [] };
  function laden(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } }
  function speichern() { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  /* Speicher prüfen (privater Modus / gesperrt): Dialog läuft trotzdem, mit Hinweis; Links bekommen ?ohne-tuer=1 gegen Umleitungsschleife */
  var SPEICHER = (function () { try { var k = '__btmm_t'; sessionStorage.setItem(k, k); sessionStorage.removeItem(k); return true; } catch (e) { return false; } })();
  var RUHIG = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fehler(text) { var f = $('fehler'); if (!f) return; f.textContent = text || ''; f.hidden = !text; }
  if (params.has('neu')) { try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(PFAD_KEY); } catch (e) {} st = { antworten: [], profil: {}, gestellt: [] }; }
  if (st.lang && st.lang !== LANG && !st.fertig) st = { antworten: [], profil: {}, gestellt: [] };
  st.lang = LANG;

  function naechsteFrage() {
    if (st.gestellt.length >= MAX_FRAGEN) return null;
    var p = st.profil;
    var kandidaten = FRAGEN.filter(function (f) { return st.gestellt.indexOf(f.id) === -1; });
    var vertiefung = kandidaten.filter(function (f) { return f.wenn && p[f.wenn]; })
      .sort(function (a, b) { return (p[b.wenn] || 0) - (p[a.wenn] || 0); })[0];
    var fest = kandidaten.filter(function (f) { return f.immer; });
    if (st.gestellt.length < 2) return fest[0];
    var rest = MAX_FRAGEN - st.gestellt.length;
    if (vertiefung && rest > fest.length) return vertiefung;
    return fest[0] || vertiefung || null;
  }

  function echo(treffer) {
    var keys = Object.keys(treffer).sort(function (a, b) { return treffer[b] - treffer[a]; });
    st.echos = st.echos || [];
    for (var i = 0; i < keys.length; i++) if (T.echo[keys[i]] && st.echos.indexOf(keys[i]) === -1) { st.echos.push(keys[i]); return T.echo[keys[i]]; }
    return T.danke;
  }

  /* ---------- Dialog-Ansicht ---------- */
  var verlauf = $('verlauf'), feld = $('antwort');
  function eingabeFrei(an) { feld.disabled = !an; $('senden').disabled = !an; $('mik').disabled = !an; }
  function blase(text, wer) {
    var li = document.createElement('li');
    li.className = 'blase ' + wer;
    li.textContent = text;
    verlauf.appendChild(li);
    li.scrollIntoView({ block: 'end', behavior: RUHIG ? 'auto' : 'smooth' });
    return li;
  }
  function frageStellen() {
    var f = naechsteFrage();
    if (!f) return pfadZeigen();
    st.gestellt.push(f.id); st.offen = f.id; speichern();
    blase(f.text, 'frage');
    eingabeFrei(true);
    feld.focus({ preventScroll: true });
  }
  function antworten(text) {
    text = (text || '').trim().slice(0, 600);
    if (!st.offen) return;            // ohne offene Frage wird nichts gespeichert
    if (!text) { feld.focus(); return; }
    stopMik();
    blase(text, 'antwort');
    var t = auswerten(text);
    Object.keys(t).forEach(function (k) { st.profil[k] = (st.profil[k] || 0) + t[k]; });
    st.antworten.push({ frage: st.offen, text: text });
    st.offen = null;
    speichern();
    feld.value = '';
    eingabeFrei(false);
    setTimeout(function () {
      blase(echo(t), 'echo');
      setTimeout(frageStellen, 650);
    }, 450);
  }
  $('eingabe').addEventListener('submit', function (e) { e.preventDefault(); antworten(feld.value); });
  feld.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); antworten(feld.value); } });
  $('loeschen').addEventListener('click', function () { try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(PFAD_KEY); } catch (e) {} location.replace(location.pathname + '?lang=' + LANG); });

  /* ---------- Spracheingabe (Web Speech, nur nach Tippen, mit Hinweis) ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null, hinweisGesehen = false;
  if (!SR) $('mik').hidden = true;
  function stopMik() { if (rec) { try { rec.stop(); } catch (e) {} } }
  function startMik() {
    rec = new SR(); rec.lang = T.sr; rec.interimResults = true; rec.continuous = true;
    var basis = feld.value ? feld.value + ' ' : '';
    rec.onresult = function (e) {
      var s = ''; for (var i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
      feld.value = basis + s;
    };
    rec.onend = function () { $('mik').setAttribute('aria-pressed', 'false'); document.body.classList.remove('hoert'); rec = null; };
    rec.onerror = function (e) { if (e && (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture')) { fehler(T.mikFehler); feld.focus(); } };
    try { rec.start(); } catch (e) { rec = null; fehler(T.mikFehler); return; }
    fehler(SPEICHER ? '' : T.ohneSpeicher);
    $('mik').setAttribute('aria-pressed', 'true'); document.body.classList.add('hoert');
  }
  $('mik').addEventListener('click', function () {
    if (rec) return stopMik();
    if (!hinweisGesehen) { $('mik-hinweis').hidden = false; $('mik-start').focus(); return; }
    startMik();
  });
  $('mik-start').addEventListener('click', function () { hinweisGesehen = true; $('mik-hinweis').hidden = true; startMik(); });
  $('mik-tippen').addEventListener('click', function () { $('mik-hinweis').hidden = true; feld.focus(); });
  // Hinweis-Blatt per Tastatur: Escape schließt, Tab bleibt im Blatt
  $('mik-hinweis').addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); $('mik-hinweis').hidden = true; $('mik').focus(); }
    else if (e.key === 'Tab') { var a = $('mik-start'), b = $('mik-tippen'); if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); } else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); } }
  });

  /* ---------- Profil → Pfad (individuell, siehe pfad.js) ---------- */
  function pfadBauen(p) { return PF.pfadBauen(p); }
  function bezugKey(k, p) { var b = PF.bezugKey(k, p); return T.bezug[b] ? b : 'start'; }
  function profilSatz(p) { return PF.profilSatz(T.profil, p); }
  function pfadSpeichern(keys) {
    var alt = laden(PFAD_KEY), bilder = PF.bilderWaehlen(keys, st.profil);
    var pf = {
      lang: LANG,
      index: alt && alt.lang === LANG && alt.schritte && alt.schritte.length === keys.length ? (alt.index || 0) : 0,
      schritte: keys.map(function (k, i) { return { key: k, bild: bilder[i], href: BASIS + SCHRITTE[k].href, titel: T.schritte[k][0], bezug: T.bezug[bezugKey(k, st.profil)] }; })
    };
    try { sessionStorage.setItem(PFAD_KEY, JSON.stringify(pf)); } catch (e) {}
    return pf;
  }
  function pfadIndex(i) {
    var pf = laden(PFAD_KEY); if (!pf) return;
    pf.index = i; try { sessionStorage.setItem(PFAD_KEY, JSON.stringify(pf)); } catch (e) {}
  }
  function pfadZeigen() {
    st.fertig = true; st.offen = null; speichern();
    eingabeFrei(false);
    var keys = pfadBauen(st.profil);
    var pf = pfadSpeichern(keys);
    $('profil-satz').textContent = profilSatz(st.profil);
    var ol = $('schritte'); ol.innerHTML = '';
    pf.schritte.forEach(function (d, i) {
      var k = d.key, bildId = d.bild || SCHRITTE[k].bild, bild = BILDER[bildId], li = document.createElement('li');
      li.className = 'schritt' + (i === 0 ? ' jetzt' : '');
      li.innerHTML = '<span class="nr">' + (i + 1) + '</span><div><span class="bild-rahmen"><img class="schritt-bild" loading="lazy" decoding="async"></span><p class="bezug"></p><h2></h2><p class="text"></p><a class="knopf"></a></div>';
      var rahmen = li.querySelector('.bild-rahmen');
      if (bild.dunkel) rahmen.classList.add('dunkel');
      if (bild.foto) rahmen.classList.add('foto');
      var img = li.querySelector('img');
      img.alt = T.alt[bildId];
      img.onerror = function () { img.onerror = null; img.src = bild.src; };
      img.src = bildUrl(bild.src);
      li.querySelector('.bezug').textContent = d.bezug + T.dp;
      li.querySelector('h2').textContent = d.titel;
      li.querySelector('.text').textContent = T.schritte[k][1];
      var a = li.querySelector('a'); a.href = d.href; a.textContent = i === 0 ? T.hier : T.ansehen;
      a.addEventListener('click', function () { pfadIndex(i); });
      ol.appendChild(li);
    });
    var los = $('kennenlernen');
    los.href = pf.schritte[0].href;
    los.onclick = function () { pfadIndex(0); };
    $('tuer').hidden = true; $('dialog').hidden = true; $('pfad').hidden = false; document.body.className = 'phase-pfad';
    window.scrollTo(0, 0);
    $('pfad-titel').focus({ preventScroll: true });
  }

  /* Wer aus der Tür auf die Webseite geht (alle Locales), wird in dieser Sitzung nicht erneut umgeleitet. */
  var LOCALE_RE = new RegExp('^/(' + LOCALES.join('|') + ')(?:[/?#]|$)');
  function durch() { try { sessionStorage.setItem(DURCH_KEY, '1'); } catch (e) {} }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || !LOCALE_RE.test(a.getAttribute('href'))) return;
    durch();
    if (!SPEICHER) { try { var u = new URL(a.href); u.searchParams.set('ohne-tuer', '1'); a.href = u.href; } catch (x) {} }
  }, true);

  /* ---------- Tür ---------- */
  function dialogStarten() {
    $('tuer').hidden = true; $('dialog').hidden = false; document.body.className = 'phase-dialog';
    verlauf.innerHTML = '';
    eingabeFrei(false);
    fehler(SPEICHER ? '' : T.ohneSpeicher);
    if (st.fertig) return pfadZeigen();
    st.offen = null;
    if (st.antworten.length) {
      st.antworten.forEach(function (a) { var f = FRAGEN.filter(function (x) { return x.id === a.frage; })[0]; if (f) blase(f.text, 'frage'); blase(a.text, 'antwort'); });
      st.gestellt = st.antworten.map(function (a) { return a.frage; });
    }
    blase(T.willkommen, 'echo');
    setTimeout(frageStellen, 600);
  }
  $('eintreten').addEventListener('click', function () {
    document.body.classList.add('oeffnet');
    setTimeout(dialogStarten, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1100);
  });
  // „Zurück zum Weg“ aus der Pfad-Leiste: direkt die Pfad-Übersicht zeigen
  if (params.has('pfad') && st.fertig) pfadZeigen();
})();
