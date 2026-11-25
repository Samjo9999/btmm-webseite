/* BtMM Tür-KI: Gesprächsmodus (Plan Tür-KI 25.11.2026, DS-Leitplanken 25.11.2026, Recht-Bot 25.11.2026).
 * Aktiv nur, wenn window.BTMM_TUER_KI_AN (ki-schalter.js, aus TUER_KI_ENABLED beim Build) true ist.
 * Sonst bleibt die Tür exakt wie bisher (regelbasierter Dialog aus tuer.js, bisherige Texte).
 * - Kein Netzaufruf vor dem Klick auf „Mit KI sprechen“; danach nur POST /api/tuer-ki beim Senden.
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
  function blase(text, wer, ki) {
    var li = document.createElement('li');
    li.className = 'blase ' + wer;
    if (ki) li.setAttribute('data-ai-generated', 'true');
    li.textContent = text;
    verlaufEl.appendChild(li);
    nachUnten();
    return li;
  }

  function wegLeiste(mitLinks) {
    var box = $('ki-weg');
    box.innerHTML = '';
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

  function start() {
    document.body.classList.add('modus-ki');
    $('tuer').hidden = true; $('dialog').hidden = false; document.body.className = 'phase-dialog modus-ki';
    verlaufEl.innerHTML = '';
    $('wahl').hidden = true;
    $('ki-hinweis').hidden = false;
    feld.setAttribute('aria-describedby', 'ki-hinweis ds-hinweis');
    eingabeFrei(false);
    if (st.gestartet) {
      blase(K.begruessung, 'echo');
      st.nachrichten.forEach(function (n) { blase(n.text, n.rolle === 'user' ? 'antwort' : 'frage', n.rolle === 'assistant'); });
      wegLeiste(false);
      gespraechAn();
    } else {
      $('ki-start').hidden = false;
    }
  }

  $('ki-starten').addEventListener('click', function () {
    st.gestartet = true; speichern();
    blase(K.begruessung, 'echo');
    gespraechAn();
  });

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
          wegLeiste(false);
          eingabeFrei(true);
          return;
        }
        if (s === 'sensibel') {
          // Nachricht nicht in den Verlauf; markierte frühere Nachrichten ebenfalls entfernen
          eigene.remove();
          var weg = (d.entfernen || []).filter(function (i) { return i < st.nachrichten.length; });
          if (weg.length) { st.nachrichten = st.nachrichten.filter(function (_n, i) { return weg.indexOf(i) === -1; }); speichern(); }
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
})();
