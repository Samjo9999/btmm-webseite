/* BtMM-Universum Prototyp (universum-tuer-v2.2). Spinnennetz = INTERNES Navigationsmodell (nicht sichtbar).
   UI: ein abgestimmter Schritt + Wahl nächster Schritt. KI regelbasiert; Antworten nur RAM; Cookie nur Flag. */
(function () {
  'use strict';
  var B = window.BTMM;
  var LS = 'btmm-universum-v2'; // Alt-Schlüssel; Antworten werden nicht mehr gespeichert (Datenschutz)
  /* Funktionaler Session-Cookie: nur Boolean „Tür erledigt“, kein Tracking, keine ID, keine Antworten. */
  var CK = 'btmm_tuer', CK_WERT = 'durchlaufen';
  function cookieDa() { return document.cookie.split(/;\s*/).indexOf(CK + '=' + CK_WERT) > -1; }
  function hatDurchlauf() {
    if (cookieDa()) return true;
    try { return location.protocol === 'file:' && sessionStorage.getItem(CK) === CK_WERT; } catch (e) { return false; }
  }
  function setzeDurchlauf() {
    /* Session-Cookie: kein Max-Age / kein Expires. Path=/, SameSite=Lax, unter https Secure. */
    document.cookie = CK + '=' + CK_WERT + '; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    if (!cookieDa() && location.protocol === 'file:') { try { sessionStorage.setItem(CK, CK_WERT); } catch (e) {} }
  }
  function loescheDurchlauf() {
    document.cookie = CK + '=; Max-Age=0; Path=/; SameSite=Lax';
    try { sessionStorage.removeItem(CK); localStorage.removeItem(CK); localStorage.removeItem(LS); } catch (e) {}
  }
  var body = document.body;
  var basis = body.dataset.basis || '';
  var q = new URLSearchParams(location.search);
  var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SCH = B.SCHALEN.map(function (s) { return s.id; });
  var TON = ['#c9a3cd', '#904b97', '#8a0d4a'];          // Sättigung/Wärme steigt nach innen
  var TON_TEXT = ['#2b0628', '#ffffff', '#ffffff'];
  var HELL = ['#e4cfe6', '#dcc0df', '#ecc4d5'];
  var HELL_TEXT = '#5c1757';

  function laden() { return {}; } // Antworten nur im RAM dieser Seite, nie local-/sessionStorage
  function speichern() { /* absichtlich leer: keine Antwort-Persistenz (Datenschutz-Bot) */ }
  try { localStorage.removeItem(LS); localStorage.removeItem(CK); } catch (e) {} // Altlasten weg
  var st = laden();
  if (q.has('neu')) { st = {}; loescheDurchlauf(); }            // kompletter Reset (auch Cookie)
  if (q.has('tuer')) { st = { modus: 'tuer' }; }                 // „Tür erneut öffnen“: Antworten weg, Cookie bleibt
  /* ?ueberspringen=1: absichtlich ohne Wirkung – Tür ist nicht überspringbar (Nutzer 17.11. 22:06) */
  if (q.has('n')) st.n = q.get('n');
  if (q.has('a')) { st.a = {}; q.get('a').split(',').filter(Boolean).forEach(function (p) { var kv = p.split(':'); st.a[kv[0]] = +kv[1]; }); }
  if (q.has('k')) st.stufe = +q.get('k');
  st.v = 'netz'; /* Nutzer 17.11. 22:18: Spinnennetz, keine Wabe */
  st.a = st.a || {};
  st.stufe = st.stufe || 0;
  var erzwungen = q.get('s'); // Screens: tuer|anzahl|frage|schritt|wahl|normal|ki|dynamik|intern|…
  if (erzwungen === 'schale') erzwungen = 'schritt';
  if (erzwungen === 'abschluss') erzwungen = 'wahl';
  if (erzwungen === 'ki') st.modus = 'ki-konzept';
  if (erzwungen === 'dynamik') st.modus = 'dynamik';
  if (erzwungen === 'intern' || erzwungen === 'intern-schema') st.modus = 'intern';
  var neueSitzung = true; try { neueSitzung = !sessionStorage.getItem('btmm_sitzung'); sessionStorage.setItem('btmm_sitzung', '1'); } catch (e) {}
  var wiederkehr = !erzwungen && neueSitzung && !q.has('tuer') && st.modus !== 'fragen' && hatDurchlauf();

  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function flyerHtml(C, opt) {
    opt = opt || {};
    if (!C) return '';
    var html = '';
    if (C.eckdaten && C.eckdaten.length && !opt.ohneEckdaten) {
      html += '<div class="eckdaten"><p class="eckdaten-label">Eckdaten</p><ul>' +
        C.eckdaten.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    }
    if (C.schluss && !opt.ohneSchluss) html += '<p class="schluss">' + esc(C.schluss) + '</p>';
    if (C.hinweis && !opt.ohneHinweis) html += '<aside class="hinweis-kasten" role="note"><p><strong>Hinweis.</strong> ' + esc(C.hinweis) + '</p></aside>';
    return html;
  }
  function bereich(id) { return B.BEREICHE.filter(function (b) { return b.id === id; })[0]; }
  function url(id) { return '/de/' + id; } // Next-Vorschau: Unterseiten der echten Webseite
  function hier(params) { var p = new URLSearchParams(location.search); Object.keys(params).forEach(function (k) { if (params[k] === null) p.delete(k); else p.set(k, params[k]); }); return '?' + p.toString(); }

  /* ---------- Simulation / KI-Schnittstelle ---------- */
  function uebersprungen(f, antworten) {
    antworten = antworten || st.a || {};
    /* Sp.141: a2 erst nach Kontext ({a4,a5,a9,a10} oder ≥3 Antworten). */
    if (f && f.id === 'a2') {
      var hatKontext = ['a4', 'a5', 'a9', 'a10'].some(function (id) { return antworten[id] !== undefined; });
      if (!hatKontext && Object.keys(antworten).length < 3) return true;
    }
    var u = f.ueberspringenWenn; if (!u) return false; return Object.keys(u).some(function (k) { return st.a[k] === u[k]; });
  }
  /**
   * waehleNaechsteFrage(antworten, pool, zielAnzahl) — jetzt regelbasiert.
   * Später: API-Aufruf mit { antworten, standpunkt, schale, restBudget } → { frageId | vertiefungText }.
   * Inputs: Antworten nur Session-RAM; Outputs: nächste Frage-ID oder KI-Vertiefung.
   * Keine Persistenz der Antworten; Flag btmm_tuer Session-Cookie unverändert.
   */
  function waehleNaechsteFrage(antworten, pool, zielAnzahl) {
    antworten = antworten || st.a;
    pool = pool || B.FRAGEN;
    var sp = standpunkt();
    var offen = pool.filter(function (f) {
      return antworten[f.id] === undefined && !uebersprungen(f, antworten);
    });
    if (!offen.length) return { art: 'ende', standpunkt: sp };
    // Beste Frage über alle Schalen (Sprünge innere→äußere erlaubt). Leichter Bias außen nur am Anfang.
    var beantwortet = Object.keys(antworten).length;
    offen.sort(function (a, b) {
      var sa = scoreFrage(a, antworten, sp) + (beantwortet < 3 ? (2 - SCH.indexOf(a.schale)) * 0.3 : 0);
      var sb = scoreFrage(b, antworten, sp) + (beantwortet < 3 ? (2 - SCH.indexOf(b.schale)) * 0.3 : 0);
      // Wenn letzte Schale innen war und Besucher skeptisch: äußere FAQ/offene-Fragen anheben
      if (st.letzteSchale === 'innen' && sp === 'skeptisch') {
        if (a.schale === 'aussen') sa += 1.2;
        if (b.schale === 'aussen') sb += 1.2;
      }
      return sb - sa || a.prio - b.prio;
    });
    return { art: 'pool', frage: offen[0], standpunkt: sp };
  }
  function scoreFrage(f, antworten, sp) {
    var s = 0;
    // leichte Präferenz: Fragen, deren Antworten zum aktuellen Standpunkt passen würden
    f.antworten.forEach(function (an) {
      if (an.p && an.p[sp]) s += an.p[sp];
    });
    return s - f.prio * 0.01;
  }
  function verteilungKey() {
    var n = st.n || '10';
    if (n === '100+' || n === '100plus') return '100plus';
    if (n === 'alle') return 'alle';
    // Schieberegler: jede reine Zahl (inkl. 5 und 10) → custom, limGes = parseInt — kein Schalen-Zuschnitt
    if (/^\d+$/.test(String(n))) return 'custom';
    return n;
  }
  function fragenFuer(sid) {
    var n = verteilungKey();
    var lim = (B.VERTEILUNG[n] && B.VERTEILUNG[n][sid]) || 99;
    return B.FRAGEN.filter(function (f) { return f.schale === sid && (!uebersprungen(f) || st.a[f.id] !== undefined); })
      .sort(function (x, y) { return x.prio - y.prio; }).slice(0, lim);
  }
  function alleFragen() {
    // limGes aus st.n (Zahl als String, oder Legacy-Keys alle/100plus)
    var vk = verteilungKey();
    var limMap = { '5': 5, '10': 10, 'alle': 9999, '100plus': 9999, '100+': 9999, 'custom': parseInt(st.n, 10) || 10 };
    var limGes = limMap[vk] || (parseInt(st.n, 10) || 10);
    var simA = Object.assign({}, st.a);
    var ordered = [], gesehen = {};
    (st.verlauf || []).forEach(function (id) {
      var f = B.FRAGEN.filter(function (x) { return x.id === id; })[0];
      if (f && !gesehen[id]) { gesehen[id] = 1; ordered.push(f); }
    });
    while (ordered.length < limGes) {
      var w = waehleNaechsteFrage(simA, B.FRAGEN, limGes);
      if (w.art !== 'pool' || !w.frage) break;
      if (gesehen[w.frage.id]) { simA[w.frage.id] = 0; continue; }
      gesehen[w.frage.id] = 1;
      ordered.push(w.frage);
      if (simA[w.frage.id] === undefined) simA[w.frage.id] = 0;
    }
    if (nLimitProSchale()) {
      var counts = { aussen: 0, mitte: 0, innen: 0 }, out = [];
      var lim = B.VERTEILUNG[verteilungKey()];
      ordered.forEach(function (f) {
        if (counts[f.schale] < lim[f.schale]) { out.push(f); counts[f.schale]++; }
      });
      return out;
    }
    return ordered;
  }
  function nLimitProSchale() { return false; } // Regler: nie Schalen-Zuschnitt; limGes allein steuert die Länge
  function kiVertiefungenOffen() {
    if (verteilungKey() !== '100plus') return [];
    var sp = standpunkt();
    var done = st.kiA || {};
    var list = (B.KI_VERTIEFUNGEN || []).filter(function (v) {
      if (done[v.id] !== undefined) return false;
      if (v.wennStandpunkt && v.wennStandpunkt !== sp) return false;
      return true;
    });
    // immer auch Meta-Karte am Ende erlauben
    var meta = (B.KI_VERTIEFUNGEN || []).filter(function (v) { return !v.wennStandpunkt && done[v.id] === undefined; });
    var out = list.slice(0, 1);
    if (!out.length) out = meta.slice(0, 1);
    return out;
  }
  function gewichte() {
    var w = {}; B.BEREICHE.forEach(function (b) { w[b.id] = 1; });
    B.FRAGEN.forEach(function (f) { var i = st.a[f.id]; if (i === undefined) return; var an = f.antworten[i].w; Object.keys(an).forEach(function (k) { w[k] += an[k]; }); });
    if (st._kiW) Object.keys(st._kiW).forEach(function (k) { w[k] = (w[k] || 0) + st._kiW[k]; });
    return w;
  }
  function standpunktPunkte() {
    var p = {}; Object.keys(B.STANDPUNKTE).forEach(function (k) { p[k] = 0; });
    B.FRAGEN.forEach(function (f) { var i = st.a[f.id]; if (i === undefined) return; var an = f.antworten[i].p; Object.keys(an).forEach(function (k) { p[k] += an[k]; }); });
    return p;
  }
  var VORRANG = ['skeptisch', 'gruenden', 'anbieter', 'kunde', 'sparen', 'sinn', 'neugierig'];
  function standpunkt() {
    var p = standpunktPunkte(), best = 'neugierig', bw = 0;
    VORRANG.forEach(function (k) { if (p[k] > bw) { bw = p[k]; best = k; } });
    return best;
  }
  function effSchale(b, w, sp) { if (b.vorziehbar && sp === 'skeptisch' && w[b.id] >= 4) return { s: 'aussen', vor: b.schale !== 'aussen' }; return { s: b.schale, vor: false }; }
  function reihenfolge(sid) {
    var w = gewichte(), sp = standpunkt();
    var liste = B.BEREICHE.map(function (b, i) { var e = effSchale(b, w, sp); return { b: b, i: i, w: w[b.id], s: e.s, vor: e.vor }; })
      .filter(function (x) { return x.s === sid; });
    var sichtbar = liste.filter(function (x) { return x.w >= 0.5; }).sort(function (x, y) { return y.w - x.w || x.i - y.i; });
    var aus = liste.filter(function (x) { return x.w < 0.5; });
    return { sichtbar: sichtbar, aus: aus };
  }
  function argument(sid) { return B.ARGUMENTE[standpunkt()][sid]; }
  function topBereich() {
    var w = gewichte(), liste = B.BEREICHE.slice();
    liste.sort(function (a, b) { return (w[b.id] || 0) - (w[a.id] || 0); });
    return liste[0];
  }
  function schrittInhalt() {
    var sp = standpunkt();
    var sid = st.schrittSchale || st.letzteSchale || SCH[Math.min(st.stufe || 0, 2)];
    if (st.hauptGesehen === false && !alleFragen().filter(function (f) { return st.a[f.id] === undefined; }).length) {
      sid = 'innen'; // Hauptargument innen zum Schluss möglich
    }
    var arg = B.ARGUMENTE[sp][sid];
    var b = topBereich();
    return {
      schale: sid,
      schaleName: B.SCHALEN[SCH.indexOf(sid)].name,
      kern: arg.kern,
      punkte: arg.punkte.slice(0, 2),
      quelle: arg.quelle,
      bereich: b,
      standpunkt: sp,
      steigerung: SCH.indexOf(sid)
    };
  }

  function zielN() {
    var vk = verteilungKey();
    if (vk === 'alle' || vk === '100plus') return alleFragen().length || 10;
    var n = parseInt(st.n, 10);
    return n > 0 ? n : 10;
  }
  function schritteErledigt() { return Object.keys(st.a || {}).length; }
  function hatMitteInnen() {
    if (st.letzteSchale === 'mitte' || st.letzteSchale === 'innen') return true;
    if (st.schrittSchale === 'mitte' || st.schrittSchale === 'innen') return true;
    if (st.beruehrtMitteInnen) return true;
    var ids = Object.keys(st.a || {});
    for (var i = 0; i < ids.length; i++) {
      var f = B.FRAGEN.filter(function (x) { return x.id === ids[i]; })[0];
      if (f && (f.schale === 'mitte' || f.schale === 'innen')) return true;
    }
    return false;
  }
  function schwellwertErreicht() {
    var n = zielN();
    var half = Math.ceil(n / 2);
    return schritteErledigt() >= half || hatMitteInnen();
  }
  function zahlErreicht() {
    return schritteErledigt() >= zielN() || !!st.hauptGesehen;
  }
  function sp134Url() { return '/de/erfahrungen'; }
  function fortschrittHinweisHtml() {
    if (!zahlErreicht()) return '';
    return '<div class="fortschritt-hinweis" role="status"><p><strong>Du hast deine Zahl erreicht</strong> — du kannst weitergehen oder zur Startseite.</p></div>';
  }
  function dichteHtml(inh) {
    var kurz = (inh.punkte && inh.punkte[0]) ? inh.punkte[0] : (inh.bereich ? inh.bereich.kurz : '');
    var tiefTeile = [];
    if (inh.punkte && inh.punkte.length) tiefTeile.push(inh.punkte.join(' '));
    if (inh.bereich && inh.bereich.kurz) tiefTeile.push(inh.bereich.kurz);
    if (inh.bereich && inh.bereich.titel) tiefTeile.push('Zum Nachlesen: Bereich „' + inh.bereich.titel + '“, Konzept, Dokumente und Chronik.');
    var tief = tiefTeile.join(' ') || kurz;
    var ctaKonz = url('konzept');
    var ctaDok = url('dokumente');
    var ctaChronik = url('chronik');
    return '<div class="dichte-karte" data-dichte>' +
      '<div class="dichte-tabs" role="tablist" aria-label="Textdichte">' +
      '<button type="button" role="tab" aria-selected="true" aria-controls="pane-kurz" id="tab-kurz">Kurz erklärt</button>' +
      '<button type="button" role="tab" aria-selected="false" aria-controls="pane-tief" id="tab-tief">Tiefer lesen</button>' +
      '</div>' +
      '<div class="dichte-panes">' +
      '<div class="dichte-pane" id="pane-kurz" role="tabpanel" aria-labelledby="tab-kurz">' +
      '<p>' + esc(kurz) + '</p>' +
      '<p class="dichte-ctas"><a class="dichte-cta" href="' + ctaKonz + '">Tiefer lesen (Konzept/Dokumente)</a> ' +
      '<a class="dichte-cta" href="' + ctaChronik + '">Chronik (was bisher entschieden wurde)</a></p>' +
      (inh.quelle ? '<p class="quelle">Quelle: ' + esc(quelleLang(inh.quelle)) + '</p>' : '') +
      '</div>' +
      '<div class="dichte-pane" id="pane-tief" role="tabpanel" aria-labelledby="tab-tief" hidden>' +
      '<p>' + esc(tief) + '</p>' +
      '<p><a href="' + ctaKonz + '">Konzept</a> · <a href="' + ctaDok + '">Dokumente</a> · <a href="' + ctaChronik + '">Chronik (was bisher entschieden wurde)</a></p>' +
      (inh.quelle ? '<p class="quelle">Quelle: ' + esc(quelleLang(inh.quelle)) + '</p>' : '') +
      '</div></div></div>';
  }
  function bindDichte() {
    var tabs = app.querySelectorAll('.dichte-tabs [role="tab"]');
    if (!tabs.length) return;
    var panes = { kurz: app.querySelector('#pane-kurz'), tief: app.querySelector('#pane-tief') };
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var id = t.getAttribute('aria-controls').replace('pane-', '');
        tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        if (panes.kurz) panes.kurz.hidden = id !== 'kurz';
        if (panes.tief) panes.tief.hidden = id !== 'tief';
      });
    });
  }
  function renderNaechsteWahl(opts) {
    var lernen = opts.filter(function (o) { return o.gruppe !== 'handeln'; });
    var handeln = opts.filter(function (o) { return o.gruppe === 'handeln'; });
    function karte(o, klass) {
      return '<button type="button" class="wahl-karte' + (klass ? ' ' + klass : '') + '" data-aktion="' + o.aktion + '" data-id="' + esc(o.id) + '"' +
        (o.bereichId ? ' data-bereich="' + o.bereichId + '"' : '') +
        (o.schale ? ' data-schale="' + o.schale + '"' : '') +
        (o.href ? ' data-href="' + o.href + '"' : '') +
        '><strong>' + esc(o.label) + '</strong><span>' + esc(o.text) + '</span></button>';
    }
    var html = '';
    if (!schwellwertErreicht()) {
      html += '<p class="hinweis-handeln">Handeln ab Schritt ' + Math.ceil(zielN() / 2) + ' von ' + zielN() + ' · oder sobald du Mitte oder Innen berührst. Bis dahin bleibt der Lernpfad frei von Mitmachen.</p>';
    }
    html += '<h2 class="naechste-h">Was als Nächstes?</h2>';
    html += '<div class="gruppe lernen"><span class="gruppen-label">Lernen</span><div class="naechste-wahl" role="group" aria-label="Lernen">';
    lernen.forEach(function (o, i) { html += karte(o, i === 0 && o.id === 'frage' ? 'primaer' : (o.id === 'start' ? 'sekundaer' : '')); });
    html += '</div></div>';
    if (handeln.length) {
      html += '<div class="gruppe handeln"><span class="gruppen-label">Handeln</span><div class="naechste-wahl" role="group" aria-label="Handeln">';
      handeln.forEach(function (o) { html += karte(o, 'sekundaer'); });
      html += '</div></div>';
    }
    return html;
  }
  function naechsteSchrittOptionen() {
    var opts = [];
    var wahl = waehleNaechsteFrage(st.a, B.FRAGEN, 999);
    var nZiel = zielN();
    var erledigt = schritteErledigt();
    var schwelle = schwellwertErreicht();
    if (wahl.art === 'pool' && wahl.frage) {
      var vertText = (erledigt >= nZiel)
        ? 'Weitere Frage, über deine Zahl hinaus'
        : 'Nächste Frage zu deinem Standpunkt';
      opts.push({ id: 'frage', label: 'Weiter vertiefen', text: vertText, aktion: 'frage', gruppe: 'lernen' });
    }
    // Label-Fix: Anderer Aspekt nie Mitmachen/Unterstützen, solange Mitmachen-Karte existieren kann
    var skipAspekt = { mitmachen: 1, unterstuetzen: 1, gruendung: 1 };
    var w = gewichte();
    var alt = B.BEREICHE.slice().sort(function (a, b) { return (w[b.id] || 0) - (w[a.id] || 0); });
    var cur = topBereich();
    var other = alt.filter(function (b) { return b.id !== cur.id && !skipAspekt[b.id]; })[0];
    if (other) {
      opts.push({ id: 'aspekt', label: 'Anderer Aspekt', text: other.titel + ' — kurz ansehen', aktion: 'aspekt', bereichId: other.id, schale: other.schale, gruppe: 'lernen' });
    }
    opts.push({ id: 'chronik', label: 'Chronik', text: 'Was bisher entschieden wurde', aktion: 'link', href: url('chronik'), gruppe: 'lernen' });
    if (st.letzteSchale === 'innen' || st.letzteSchale === 'mitte') {
      opts.push({ id: 'aussen', label: 'Noch Grundlagen', text: 'Kurz zurück zu „Worum es geht“', aktion: 'aspekt', bereichId: 'so-funktionierts', schale: 'aussen', gruppe: 'lernen' });
    }
    opts.push({ id: 'start', label: 'Zur Startseite', text: 'Normalmodus — Tür später erneut öffnen', aktion: 'start', gruppe: 'lernen' });
    // Variante A: Mitmachen erst ab Schwellwert (≥ N/2 oder Mitte/Innen)
    if (schwelle) {
      opts.push({ id: 'mitmachen', label: 'Mitmachen', text: 'Nächster Schritt: dabei sein', aktion: 'link', href: url('mitmachen'), gruppe: 'handeln' });
      opts.push({ id: 'sp134', label: 'Bewertungen & Feedback', text: 'Preview: Stimmen, Fragen, Feedback', aktion: 'link', href: sp134Url(), gruppe: 'handeln' });
    }
    var seen = {};
    var lernen = [];
    var handeln = [];
    opts.forEach(function (o) {
      if (seen[o.id]) return;
      seen[o.id] = 1;
      if (o.gruppe === 'handeln') handeln.push(o); else lernen.push(o);
    });
    // Lernen max 4 (inkl. Chronik-CTA), Handeln max 2 → übersichtlich
    return lernen.slice(0, 4).concat(handeln.slice(0, 2));
  }

  function phase() {
    if (erzwungen) return erzwungen;
    if (st.modus === 'tuer') return 'tuer';
    if (st.modus === 'ki-konzept') return 'ki';
    if (st.modus === 'dynamik') return 'dynamik';
    if (st.modus === 'intern') return 'intern';
    if (st.modus !== 'fragen') return hatDurchlauf() ? 'normal' : 'tuer';
    if (!st.n) return 'anzahl';
    if (st.warteAufWahl) return 'wahl';
    if (st.warteAufSchritt) return 'schritt';
    var alle = alleFragen();
    var offenPool = alle.filter(function (f) { return st.a[f.id] === undefined; });
    if (offenPool.length) return 'frage';
    if (verteilungKey() === '100plus' && kiVertiefungenOffen().length && !st.kiFertig) return 'ki-vertief';
    if (!st.hauptGesehen) return 'schritt'; // Hauptargument zum Schluss
    return 'wahl'; // letzte Wahl inkl. Startseite
  }

  /* ---------- Bausteine ---------- */
  function leiste(mitte, mitUmschalter) {
    return '<header class="leiste"><a class="marke" href="' + basis + 'index.html"><img src="' + basis + 'bilder/logo.png" alt=""><span>BtMM-Universum</span><span class="nur-sr">, zur Startseite</span></a>' +
      '<div class="mitte">' + (mitte || '') + '</div></header>';
  }
  var TUER_ICON = '<svg class="tuer-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 21V5.5A2.5 2.5 0 0 1 8.5 3h7A2.5 2.5 0 0 1 18 5.5V21" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 21h17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="14.6" cy="12.5" r="1.3" fill="currentColor"/></svg>';
  function quelleLang(t) { return String(t).replace(/\b(D00|D01|D02|D28|BP|KA|S|O)\b(?=[,;\s]|$)/g, function (k) { return B.QKURZ[k] || k; }); }
  var KI = '<span class="ki-marke" title="Im Prototyp gibt es keine echte KI: feste Regeln ordnen deine Antworten zu.">KI-Führung · im Prototyp regelbasiert simuliert</span>';
  function steigerung(k) {
    var h = '<div class="steigerung" role="img" aria-label="Überzeugungskraft: Stufe ' + (k + 1) + ' von 3, nach innen stärker">';
    for (var i = 0; i < 3; i++) h += '<span class="stufe' + (i <= k ? ' an' : '') + '" style="--t:' + TON[i] + ';height:' + (10 + i * 7) + 'px"></span>';
    return h + '<em>nach innen stärker</em></div>';
  }

  /* ---------- INTERN: Spinnennetz-Graph (nur ?s=intern / Team), nicht Besuchersicht ---------- */
  function zustand(i, stufe) { return i < stufe ? 'erledigt' : (i === stufe ? 'aktiv' : 'zu'); }
  function farben(i, z) {
    if (z === 'aktiv') return { bg: TON[i], fg: TON_TEXT[i] };
    if (z === 'erledigt') return { bg: HELL[i], fg: HELL_TEXT };
    return { bg: '#f6f1f6', fg: '#6a4f6d' };
  }
  function label(t) { return esc(t).replace("So funktioniert&#39;s", 'So funktioniert’s').replace('Körperarbeit', 'Körper&shy;arbeit').replace('Dokumente', 'Doku&shy;mente').replace('funktioniert', 'funk&shy;tioniert').replace('Mitmachen', 'Mit&shy;machen').replace('Gründung', 'Grün&shy;dung').replace('Geldfluss', 'Geld&shy;fluss').replace('Angebote', 'An&shy;gebote').replace('Unterstützen', 'Unter&shy;stützen'); }
  function kurzTitel(t) {
    var m = { "So funktioniert's": 'Ablauf', 'Was du sparst': 'Sparen', 'Körperarbeit': 'Körper', 'Offene Fragen': 'Fragen', 'Unterstützen': 'Hilfe', 'Dokumente': 'Docs', 'Geldfluss': 'Geld', 'Gründung': 'Gründ.' };
    return m[t] || t;
  }
  function topBereiche(max) {
    var w = gewichte(), alle = B.BEREICHE.slice();
    alle.sort(function (a, b) { return (w[b.id] || 0) - (w[a.id] || 0) || a.titel.localeCompare(b.titel); });
    return alle.slice(0, max);
  }
  function sichtbareKnoten(stufe, maxN) {
    maxN = maxN || 10;
    var out = [], gesehen = {};
    SCH.forEach(function (s, si) {
      reihenfolge(s).sichtbar.forEach(function (x) {
        if (gesehen[x.b.id]) return;
        gesehen[x.b.id] = 1;
        out.push({ b: x.b, si: si, vor: x.vor, z: zustand(si, stufe) });
      });
    });
    var w = gewichte();
    out.sort(function (a, b) {
      var pa = (a.si === stufe ? 1000 : 0) + (w[a.b.id] || 0) + (a.vor ? 50 : 0);
      var pb = (b.si === stufe ? 1000 : 0) + (w[b.b.id] || 0) + (b.vor ? 50 : 0);
      return pb - pa;
    });
    return out.slice(0, maxN);
  }
  function einstiegKnoten() {
    var skip = { mitmachen: 1, unterstuetzen: 1 };
    var top = topBereiche(8).filter(function (b) { return !skip[b.id]; });
    top = top.filter(function (b) { return (gewichte()[b.id] || 0) > 0 || Object.keys(st.a).length === 0; });
    if (!top.length) top = topBereiche(8).filter(function (b) { return !skip[b.id]; });
    top = top.slice(0, 3);
    var aktionen = [
      { id: 'mitmachen', titel: 'Mitmachen', art: 'aktion' },
      { id: 'unterstuetzen', titel: 'Unterstützen', art: 'aktion' },
      { id: 'lesen', titel: 'Lesen', art: 'aktion', ziel: top[0] ? top[0].id : 'konzept' }
    ];
    return { tops: top, aktionen: aktionen };
  }
  /* Deterministische, organische Unruhe für Spirale (kein Math.random → stabile Screens) */
  function wob(i, j) { return Math.sin(i * 1.7 + j * 2.3) * 0.045 + Math.cos(i * 0.9 - j * 1.1) * 0.03; }

  function karte(el, stufe, mini, opt) {
    opt = opt || {};
    var W = el.clientWidth, H = el.clientHeight; if (!W || !H) return;
    var html = '', svg = '';
    var cx = W / 2, cy = H * 0.52;
    el.classList.remove('wabe', 'netz', 'einstieg');
    el.classList.add('netz', 'spinne');
    if (opt.einstieg) el.classList.add('einstieg');

    var SPEICHEN = mini ? 8 : 10;
    var Rmax = Math.min(W, H) * (mini ? 0.42 : 0.44);
    var NW = mini ? 14 : Math.max(72, Math.min(96, Math.floor(Math.min(W, H) / 6.5)));
    var NH = mini ? 14 : 48; // ≥44 px Tipziel

    // --- Speichen (von der Mitte nach außen) ---
    for (var s = 0; s < SPEICHEN; s++) {
      var ang0 = -Math.PI / 2 + s * 2 * Math.PI / SPEICHEN;
      var x2 = cx + Rmax * Math.cos(ang0);
      var y2 = cy + Rmax * Math.sin(ang0);
      svg += '<line x1="' + cx.toFixed(1) + '" y1="' + cy.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#8a0d4a" stroke-opacity=".28" stroke-width="' + (mini ? 1 : 1.6) + '" stroke-linecap="round"/>';
    }

    // --- Spiralfäden (Archimedes, leicht unregelmäßig) — 3 Schalen-Windungen ---
    // Windungen: innen (0.15–0.38), mitte (0.38–0.68), aussen (0.68–1.0) der Rmax
    var turns = 3.15;
    var steps = mini ? 90 : 180;
    var spiral = '';
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var ang = -Math.PI / 2 + t * turns * 2 * Math.PI;
      var rBase = (0.12 + t * 0.88) * Rmax;
      var r = rBase * (1 + wob(i, 0));
      var x = cx + r * Math.cos(ang + wob(i, 1));
      var y = cy + r * Math.sin(ang + wob(i, 2));
      spiral += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
    }
    svg += '<path d="' + spiral + '" fill="none" stroke="#904b97" stroke-opacity=".55" stroke-width="' + (mini ? 1.2 : 2) + '" stroke-linecap="round" stroke-linejoin="round"/>';
    // zweite, leicht versetzte Spirale für organische Dichte (kein Kreisring)
    var spiral2 = '';
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var ang = -Math.PI / 2 + 0.35 + t * turns * 2 * Math.PI;
      var rBase = (0.18 + t * 0.82) * Rmax;
      var r = rBase * (1 + wob(i, 3) * 0.8);
      var x = cx + r * Math.cos(ang + wob(i, 4));
      var y = cy + r * Math.sin(ang + wob(i, 5));
      spiral2 += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
    }
    svg += '<path d="' + spiral2 + '" fill="none" stroke="#c9a3cd" stroke-opacity=".45" stroke-width="' + (mini ? 0.9 : 1.4) + '" stroke-linecap="round"/>';

    // kleiner Hub (kein Label) — nur Fadenkreuz der Speichen
    svg += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + (mini ? 2.5 : 4) + '" fill="#8a0d4a" fill-opacity=".55"/>';

    // --- Knoten auf Schnittpunkten Speiche × Schalen-Radius ---
    // Schalenradien (Spiralwindungen): aussen außen, innen innen
    var radSchale = [0.88, 0.58, 0.32]; // aussen, mitte, innen
    var knoten = [];
    if (opt.einstieg) {
      var ek = einstiegKnoten();
      ek.tops.forEach(function (b, i) {
        var si = SCH.indexOf(b.schale); if (si < 0) si = 0;
        knoten.push({ id: b.id, titel: b.titel, si: si, art: 'top', mark: true, slot: i });
      });
      ek.aktionen.forEach(function (a, i) {
        knoten.push({ id: a.id === 'lesen' ? a.ziel : a.id, titel: a.titel, si: 2, art: 'aktion', mark: false, slot: i + 3 });
      });
      topBereiche(12).forEach(function (b) {
        if (b.id === 'mitmachen' || b.id === 'unterstuetzen') return;
        if (knoten.some(function (k) { return k.id === b.id; })) return;
        if (knoten.length >= 10) return;
        var si = SCH.indexOf(b.schale); if (si < 0) si = 1;
        knoten.push({ id: b.id, titel: b.titel, si: si, art: 'kontext', mark: false });
      });
    } else {
      sichtbareKnoten(stufe, mini ? 8 : 10).forEach(function (x, j) {
        knoten.push({ id: x.b.id, titel: x.b.titel, si: x.si, art: x.z, mark: x.si === stufe, vor: x.vor, j: j });
      });
    }

    // Platzierung: je Knoten auf Speiche + Schalenradius, versetzt damit keine Überlappung
    var belegt = {};
    function slotKey(sp, sh) { return sp + ':' + sh; }
    knoten.forEach(function (k, idx) {
      var sh = k.si;
      var sp = (idx * 3 + (k.mark ? 0 : 1) + sh) % SPEICHEN;
      // freie Speiche suchen
      var tries = 0;
      while (belegt[slotKey(sp, sh)] && tries < SPEICHEN) { sp = (sp + 1) % SPEICHEN; tries++; }
      belegt[slotKey(sp, sh)] = 1;
      var ang = -Math.PI / 2 + sp * 2 * Math.PI / SPEICHEN + wob(sp, sh) * 0.35;
      var r = radSchale[sh] * Rmax * (1 + wob(sp, sh + 2) * 0.5);
      // Einstieg: markierte Tops etwas betont auf aktiver Windung
      if (opt.einstieg && k.art === 'top') r = radSchale[Math.min(sh, 2)] * Rmax * 0.95;
      if (opt.einstieg && k.art === 'aktion') { sh = 2; r = radSchale[2] * Rmax * 1.05; ang = -Math.PI / 2 + (sp + 0.5) * 2 * Math.PI / SPEICHEN; }
      k.x = cx + r * Math.cos(ang);
      k.y = cy + r * Math.sin(ang);
      k.sp = sp; k.r = r; k.ang = ang;
    });

    // leichte Abstoßung
    var padX = mini ? 8 : NW / 2 + 4, padY = mini ? 8 : NH / 2 + 4;
    for (var it = 0; it < (mini ? 0 : 28); it++) {
      for (var i = 0; i < knoten.length; i++) for (var j = i + 1; j < knoten.length; j++) {
        var a = knoten[i], b = knoten[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var minx = NW + 6, miny = NH + 6;
        if (Math.abs(dx) < minx && Math.abs(dy) < miny) {
          var sx = (minx - Math.abs(dx)) / 2 * (dx < 0 ? -1 : 1) || 1;
          var sy = (miny - Math.abs(dy)) / 2 * (dy < 0 ? -1 : 1) || 1;
          a.x = Math.min(W - padX, Math.max(padX, a.x + sx * 0.45));
          a.y = Math.min(H - padY, Math.max(padY, a.y + sy * 0.45));
          b.x = Math.min(W - padX, Math.max(padX, b.x - sx * 0.45));
          b.y = Math.min(H - padY, Math.max(padY, b.y - sy * 0.45));
        }
      }
    }

    // kurze Fäden vom Knoten zur nächsten Speiche (Andocken am Netz) — keine Zackengitter
    knoten.forEach(function (k) {
      var hx = cx + Math.cos(k.ang || 0) * 6;
      var hy = cy + Math.sin(k.ang || 0) * 6;
      // radialer Rest zur Mitte hin andeuten
      var inward = 0.82;
      var ix = cx + (k.x - cx) * inward, iy = cy + (k.y - cy) * inward;
      svg += '<line x1="' + ix.toFixed(1) + '" y1="' + iy.toFixed(1) + '" x2="' + k.x.toFixed(1) + '" y2="' + k.y.toFixed(1) + '" stroke="' + TON[k.si] + '" stroke-opacity=".4" stroke-width="1.2"/>';
    });

    knoten.forEach(function (k) {
      var z = k.art === 'top' || k.mark ? 'aktiv' : (k.art === 'aktion' ? 'erledigt' : (k.art === 'kontext' ? 'zu' : k.art));
      if (typeof z !== 'string' || (z !== 'aktiv' && z !== 'erledigt' && z !== 'zu')) z = zustand(k.si, stufe);
      var f = farben(k.si, z);
      if (k.art === 'aktion') { f = { bg: '#fff', fg: '#780268' }; }
      if (mini) {
        svg += '<circle cx="' + k.x.toFixed(1) + '" cy="' + k.y.toFixed(1) + '" r="5" fill="' + (z === 'zu' ? '#f6f1f6' : f.bg) + '" stroke="' + TON[k.si] + '" stroke-width="1.5"/>';
        return;
      }
      var href = url(k.id);
      // Innerhalb einer Schale frei: alle Knoten der aktuellen Schale klickbar (und andere auch, SEO)
      var cls = 'zelle knoten-gleich ' + z + (k.mark || k.art === 'top' ? ' mark' : '') + (k.art === 'aktion' ? ' aktion' : '') + (k.si === stufe ? ' schale-frei' : '');
      html += '<a class="' + cls + '" href="' + href + '" style="left:' + k.x.toFixed(1) + 'px;top:' + k.y.toFixed(1) + 'px;width:' + NW + 'px;height:' + NH + 'px;background:' + f.bg + ';color:' + f.fg + ';border-color:' + (k.art === 'aktion' ? '#780268' : TON[k.si]) + '"' +
        (k.mark || k.art === 'top' ? ' aria-current="true"' : '') +
        ' title="' + esc(k.titel) + '"><span class="kt">' + esc(kurzTitel(k.titel)) + '</span>' + (k.vor ? '<span class="vor">↑</span>' : '') + '</a>';
    });

    el.innerHTML = '<svg class="grund" aria-hidden="true" viewBox="0 0 ' + W + ' ' + H + '">' + svg + '</svg>' + html;
  }

  function ansichtHinweis() {
    return '<span class="karte-hinweis">Internes Modell · nicht für Besucher</span>';
  }

  /* ---------- Ansichten ---------- */
  var app = document.getElementById('app');
  function zeigeTuer() {
    body.className = 'tuer';
    var C = B.COPY && B.COPY.tuer ? B.COPY.tuer : {};
    app.innerHTML = '<main class="tuer-seite" id="tuer">' +
      '<div class="tuer-buehne" aria-hidden="true"><div class="tuer-rahmen"><div class="tuer-innen"><img class="tuer-licht" src="bilder/logo.png" alt="">' +
      fluegel('links') + fluegel('rechts') + '</div></div></div>' +
      '<div class="tuer-text"><img src="bilder/logo.png" alt="BtMM – Back to Meaning Maximization"><p class="zeile">Back to Meaning Maximization</p>' +
      '<h1>' + esc(C.h1 || 'Tritt ein – in deinem Tempo') + '</h1>' +
      '<p class="tuer-lead">' + esc(C.lead || '') + '</p>' +
      '<p>' + esc(C.body || '') + '</p>' +
      flyerHtml(C) +
      '<div class="tuer-knoepfe"><button class="knopf hell" id="eintreten">' + esc(C.cta || 'Eintreten') + '</button></div></div></main>';
    if (erzwungen === 'oeffnen') document.getElementById('tuer').classList.add('offen');
    document.getElementById('eintreten').addEventListener('click', function () {
      st = { modus: 'fragen', a: {}, stufe: 0, v: 'netz' }; speichern();
      if (erzwungen) { erzwungen = null; history.replaceState(null, '', hier({ s: null, tuer: null })); }
      else if (q.has('tuer')) history.replaceState(null, '', hier({ tuer: null }));
      if (ruhig) return weiter();
      document.getElementById('tuer').classList.add('offen');
      setTimeout(weiter, 1150);
    });
  }
  function fluegel(seite) {
    return '<div class="tuer-fluegel ' + seite + '"><svg viewBox="0 0 100 400" preserveAspectRatio="none"><g fill="none" stroke="#ddcddf" stroke-opacity=".55" stroke-width="1.6">' +
      '<rect x="18" y="150" width="64" height="100" rx="4"/><rect x="18" y="270" width="64" height="100" rx="4"/>' +
      (seite === 'links' ? '<path d="M18 130 V70 Q18 30 82 22 V130 Z"/>' : '<path d="M82 130 V70 Q82 30 18 22 V130 Z"/>') + '</g>' +
      '<circle cx="' + (seite === 'links' ? 90 : 10) + '" cy="250" r="5" fill="#ddcddf"/></svg></div>';
  }
  function zeigeAnzahl() {
    body.className = 'fragen';
    var nMin = B.FRAGEN_MIN || 5;
    var nMax = B.FRAGEN_MAX || 24;
    var nDef = B.FRAGEN_DEFAULT || 10;
    var start = parseInt(st.n, 10);
    if (!start || start < nMin || start > nMax) start = nDef;
    var C = (B.COPY && B.COPY.anzahl) || {};
    app.innerHTML = '<div class="uni">' + leiste('', false) + '<main class="schritt-seite anzahl-seite">' +
      '<div class="anzahl-flow">' +
      '<p class="schalen-marke" style="background:' + TON[0] + ';color:' + TON_TEXT[0] + '">Abgestimmter Schritt · Fragenzahl</p>' +
      '<h1>' + esc(C.h1 || 'Wie tief willst du heute gehen?') + '</h1>' +
      '<p class="unter">' + esc(C.lead || 'Du wählst mit dem Regler, wie tief du heute gehst. 10 ist empfohlen und voreingestellt.') + '</p>' +
      '<p class="fein">' + esc(C.warum || '') + '</p>' +
      (C.warumRegler ? ('<p class="fein">' + esc(C.warumRegler) + '</p>') : '') +
      '<div class="regler-box" role="group" aria-labelledby="regler-zahl-label">' +
      '<div class="regler-zahl-zeile">' +
      '<span id="regler-zahl-label" class="regler-zahl" aria-live="polite">' + start + '</span>' +
      '<span class="regler-empfohlen' + (start === nDef ? ' aktiv' : '') + '" id="regler-empfohlen-badge">' + esc(C.labelEmpfohlen || '10 empfohlen') + '</span>' +
      '</div>' +
      '<label class="visually-hidden" for="fragen-regler">Fragenzahl von ' + nMin + ' bis ' + nMax + '</label>' +
      '<div class="regler-wrap">' +
      '<input id="fragen-regler" type="range" min="' + nMin + '" max="' + nMax + '" step="1" value="' + start + '" aria-valuemin="' + nMin + '" aria-valuemax="' + nMax + '" aria-valuenow="' + start + '" aria-valuetext="' + start + ' Fragen' + (start === nDef ? ', empfohlen' : '') + '">' +
      '<div class="regler-skala" aria-hidden="true">' +
      '<span>' + nMin + '</span>' +
      '<span class="tick-empfohlen" style="left:' + (((nDef - nMin) / (nMax - nMin)) * 100).toFixed(2) + '%"><i></i><b>empfohlen</b></span>' +
      '<span class="tick-max">' + nMax + '</span>' +
      '</div></div></div>' +
      flyerHtml(C) +
      '</div>' +
      '<div class="anzahl-cta-bar">' +
      '<button type="button" class="knopf" id="anzahl-weiter">' + esc((C.cta || 'Weiter mit 10').replace(/\d+/, String(start))) + '</button>' +
      '</div>' +
      '<div class="hinweise">' + KI +
      '<span>Antworten nur in diesem Besuch im Speicher. Kein Speichern, kein Senden.</span>' +
      '</div></main></div>';
    var reg = document.getElementById('fragen-regler');
    var zahlEl = document.getElementById('regler-zahl-label');
    var badge = document.getElementById('regler-empfohlen-badge');
    var cta = document.getElementById('anzahl-weiter');
    function sync(v) {
      v = parseInt(v, 10);
      if (!v || v < nMin) v = nMin;
      if (v > nMax) v = nMax;
      zahlEl.textContent = String(v);
      reg.setAttribute('aria-valuenow', String(v));
      reg.setAttribute('aria-valuetext', v + ' Fragen' + (v === nDef ? ', empfohlen' : ''));
      if (badge) badge.classList.toggle('aktiv', v === nDef);
      cta.textContent = 'Weiter mit ' + v;
      return v;
    }
    reg.addEventListener('input', function () { sync(reg.value); });
    reg.addEventListener('change', function () { sync(reg.value); });
    function starteMit(n) {
      st.n = String(n); st.modus = 'fragen'; st.stufe = 0; st.kiA = {}; st.kiFertig = false; st.dynamikGesehen = false; speichern();
      history.replaceState(null, '', hier({ s: null, n: st.n })); weiter();
    }
    cta.addEventListener('click', function () { starteMit(sync(reg.value)); });
  }
  function zeigeFrage() {
    body.className = 'fragen';
    var alle = alleFragen();
    var f = alle.filter(function (x) { return st.a[x.id] === undefined; })[0];
    if (!f) {
      var wahl = waehleNaechsteFrage(st.a, B.FRAGEN, alle.length);
      f = wahl.art === 'pool' ? wahl.frage : null;
    }
    if (!f) { st.warteAufSchritt = true; return weiter(); }
    st.stufe = SCH.indexOf(f.schale); if (st.stufe < 0) st.stufe = 0;
    st.letzteSchale = f.schale;
    var nr = alle.indexOf(f) + 1, ges = alle.length;
    if (nr < 1) nr = Object.keys(st.a).length + 1;
    var anteil = Math.round(100 * Math.max(0, nr - 1) / Math.max(1, ges));
    var sch = B.SCHALEN[st.stufe];
    var mitte = '<span class="zaehler">Für dich jetzt</span>' + steigerung(st.stufe) +
      '<span class="fortschritt" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + anteil + '" aria-label="Fortschritt"><span style="width:' + anteil + '%"></span></span>';
    app.innerHTML = '<div class="uni">' + leiste(mitte, false) + '<main class="schritt-seite">' +
      '<p class="schalen-marke" style="background:' + TON[st.stufe] + ';color:' + TON_TEXT[st.stufe] + '">Abgestimmter Schritt · Frage · ' + esc(sch.name) + '</p>' +
      '<p class="fein">Schritt ' + nr + (ges ? ' von ' + ges : '') + ' · ' + KI + '</p>' +
      ((!st.metaGesehen && B.COPY && B.COPY.meta) ? ('<details class="meta-box"><summary>' + esc(B.COPY.meta.h1 || 'So funktioniert dieser Weg') + '</summary><p>' + esc(B.COPY.meta.kurz) + '</p><p>' + esc(B.COPY.meta.info) + '</p>' + flyerHtml(B.COPY.meta) + '</details>') : '') +
      (f.info ? '<p class="schritt-info">' + esc(f.info) + '</p>' : '') +
      '<h1 id="frage">' + esc(f.text) + '</h1>' +
      '<div class="antworten" role="group" aria-labelledby="frage">' +
      f.antworten.map(function (an, i) { return '<button type="button" data-i="' + i + '">' + esc(an.t) + '</button>'; }).join('') + '</div>' +
      '<p class="quelle">Abgeleitet aus: ' + esc(f.q) + '</p>' +
      '<div class="frage-fuss">' + (Object.keys(st.a).length ? '<button class="knopf zweit klein" id="zurueck">Zurück</button>' : '') +
      '<a class="knopf zweit klein" href="#" id="fertig">Genug — zur Startseite</a></div></main></div>';
    var md = app.querySelector('details.meta-box'); if (md) md.addEventListener('toggle', function () { if (md.open) st.metaGesehen = true; });
    app.querySelectorAll('.antworten button').forEach(function (b) { b.addEventListener('click', function () {
      st.a[f.id] = +b.dataset.i; st.metaGesehen = true; st.verlauf = (st.verlauf || []).concat([f.id]);
      st.warteAufSchritt = true; st.schrittSchale = f.schale; if (f.schale === 'mitte' || f.schale === 'innen') st.beruehrtMitteInnen = true; speichern();
      if (erzwungen) { erzwungen = null; history.replaceState(null, '', hier({ s: null, a: null, k: null })); }
      setTimeout(weiter, ruhig ? 0 : 160);
    }); });
    var z = document.getElementById('zurueck'); if (z) z.addEventListener('click', function () {
      var v = st.verlauf || []; var last = v.pop();
      if (last) { delete st.a[last]; var lf = B.FRAGEN.filter(function (x) { return x.id === last; })[0]; if (lf) { st.stufe = SCH.indexOf(lf.schale); st.letzteSchale = lf.schale; } }
      st.verlauf = v; st.warteAufSchritt = false; st.warteAufWahl = false; speichern(); weiter();
    });
    document.getElementById('fertig').addEventListener('click', function (e) {
      e.preventDefault();
      st.fruehEnde = true; st.warteAufWahl = false; st.warteAufSchritt = false; st.hauptGesehen = true;
      st.fertig = true; st.modus = 'normal';
      setzeDurchlauf(); speichern();
      erzwungen = 'normal';
      history.replaceState(null, '', hier({ s: null, tuer: null }));
      weiter();
    });
  }

  function zeigeSchritt() {
    body.className = 'fragen';
    st.warteAufSchritt = false;
    var inh = schrittInhalt();
    var offen = alleFragen().filter(function (f) { return st.a[f.id] === undefined; });
    if (!offen.length) st.hauptGesehen = true;
    if (inh.schale === 'mitte' || inh.schale === 'innen') st.beruehrtMitteInnen = true;
    var erledigt = schritteErledigt();
    var nZiel = zielN();
    var anteil = Math.min(100, Math.round(100 * erledigt / Math.max(1, nZiel)));
    var mitte = '<span class="zaehler">Für dich jetzt</span>' + steigerung(inh.steigerung) +
      '<span class="fortschritt" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + anteil + '" aria-label="Fortschritt"><span style="width:' + anteil + '%"></span></span>';
    app.innerHTML = '<div class="uni">' + leiste(mitte, false) + '<main class="schritt-seite">' +
      '<p class="schalen-marke" style="background:' + TON[inh.steigerung] + ';color:' + TON_TEXT[inh.steigerung] + '">Abgestimmter Schritt · ' + esc(inh.schaleName) + '</p>' +
      '<p class="fein">Schritt ' + Math.min(erledigt, nZiel) + ' von ' + nZiel + ' · Blickwinkel: <b>' + esc(B.STANDPUNKTE[inh.standpunkt]) + '</b></p>' +
      '<h1>' + esc(inh.kern) + '</h1>' +
      dichteHtml(inh) +
      (inh.bereich ? '<p class="unter">Passend dazu: <a href="' + url(inh.bereich.id) + '">' + esc(inh.bereich.titel) + '</a></p>' : '') +
      fortschrittHinweisHtml() +
      renderNaechsteWahl(naechsteSchrittOptionen()) +
      '</main></div>';
    bindDichte();
    bindNaechsteWahl();
  }

  function zeigeWahl() {
    body.className = 'fragen';
    st.warteAufWahl = false;
    st.beruehrtMitteInnen = true; // Ende/Wahl: Innenschale berührt
    var arg = argument('innen');
    var erledigt = schritteErledigt();
    var nZiel = zielN();
    var anteil = Math.min(100, Math.round(100 * erledigt / Math.max(1, nZiel)));
    var mitte = '<span class="zaehler">Für dich jetzt</span>' + steigerung(2) +
      '<span class="fortschritt" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + anteil + '" aria-label="Fortschritt"><span style="width:' + anteil + '%"></span></span>';
    var opts = naechsteSchrittOptionen();
    var inhWahl = { punkte: arg.punkte.slice(0, 2), bereich: topBereich(), quelle: arg.quelle, kern: arg.kern };
    app.innerHTML = '<div class="uni">' + leiste(mitte, false) + '<main class="schritt-seite">' +
      '<p class="schalen-marke" style="background:' + TON[2] + ';color:' + TON_TEXT[2] + '">Abgestimmter Schritt · Nächste Wahl</p>' +
      '<p class="fein">Schritt ' + Math.min(Math.max(erledigt, nZiel), nZiel) + ' von ' + nZiel + ' · Blickwinkel: <b>' + esc(B.STANDPUNKTE[standpunkt()]) + '</b></p>' +
      (st.hauptGesehen
        ? ('<h1>' + esc(arg.kern) + '</h1>' + dichteHtml(inhWahl))
        : ('<h1>' + esc((B.COPY && B.COPY.wahl && B.COPY.wahl.h1) || 'Du behältst die Wahl') + '</h1><p class="unter">' + esc((B.COPY && B.COPY.wahl && B.COPY.wahl.lead) || 'Wähle den nächsten Schritt — auf dich abgestimmt.') + '</p>' + flyerHtml(B.COPY && B.COPY.wahl))) +
      fortschrittHinweisHtml() +
      renderNaechsteWahl(opts) +
      '</main></div>';
    bindDichte();
    bindNaechsteWahl();
  }
  function bindNaechsteWahl() {
    app.querySelectorAll('.wahl-karte').forEach(function (b) {
      b.addEventListener('click', function () {
        var akt = b.dataset.aktion;
        if (akt === 'frage') {
          st.warteAufWahl = false; st.warteAufSchritt = false; erzwungen = null;
          history.replaceState(null, '', hier({ s: null })); speichern(); weiter();
        } else if (akt === 'aspekt') {
          st.schrittSchale = b.dataset.schale || 'aussen';
          st.letzteSchale = st.schrittSchale;
          if (st.schrittSchale === 'mitte' || st.schrittSchale === 'innen') st.beruehrtMitteInnen = true;
          st.warteAufSchritt = true; st.warteAufWahl = false;
          // soft weight bump
          st._kiW = st._kiW || {};
          if (b.dataset.bereich) st._kiW[b.dataset.bereich] = (st._kiW[b.dataset.bereich] || 0) + 2;
          erzwungen = 'schritt'; speichern(); weiter();
        } else if (akt === 'link') {
          setzeDurchlauf(); st.modus = 'normal'; speichern();
          location.href = b.dataset.href;
        } else if (akt === 'start') {
          setzeDurchlauf(); st.modus = 'normal'; st.fertig = true; st.warteAufWahl = false; erzwungen = 'normal'; speichern();
          history.replaceState(null, '', hier({ s: null, tuer: null })); weiter();
        }
      });
    });
  }

  function zeigeKiKonzept() {
    body.className = 'fragen';
    var mitte = '<span class="zaehler">Für dich jetzt</span>' + steigerung(1);
    app.innerHTML = '<div class="uni">' + leiste(mitte, false) + '<main class="schritt-seite">' +
      '<p class="schalen-marke" style="background:' + TON[1] + ';color:' + TON_TEXT[1] + '">Abgestimmter Schritt · Konzept</p>' +
      '<p class="fein">Simulation · noch keine echte KI · Blickwinkel: <b>' + esc(B.STANDPUNKTE[standpunkt()]) + '</b></p>' +
      '<h1>' + esc((B.COPY && B.COPY.ki && B.COPY.ki.h1) || 'Klar und ohne Magie') + '</h1>' +
      '<p class="unter">' + esc((B.COPY && B.COPY.ki && B.COPY.ki.lead) || '') + '</p>' +
      '<p class="unter">' + esc((B.COPY && B.COPY.ki && B.COPY.ki.netz) || '') + '</p>' +
      '<p class="unter">' + esc((B.COPY && B.COPY.ki && B.COPY.ki.spaeter) || '') + '</p>' +
      flyerHtml(B.COPY && B.COPY.ki) +
      '<p class="quelle">Funktion: waehleNaechsteFrage(…) · später API</p>' +
      '<h2 class="naechste-h">Was als Nächstes?</h2>' +
      '<div class="naechste-wahl">' +
      '<button type="button" class="wahl-karte" id="ki-weiter"><strong>Verstanden</strong><span>Weiter im Ablauf</span></button>' +
      '<a class="wahl-karte" href="' + hier({ s: 'dynamik' }) + '"><strong>Einzelschritt-Vorschau</strong><span>So sähe der nächste Inhalt aus</span></a>' +
      '</div></main></div>';
    document.getElementById('ki-weiter').addEventListener('click', function () {
      st.modus = 'fragen'; erzwungen = null; history.replaceState(null, '', hier({ s: null })); weiter();
    });
  }
  function zeigeKiVertief() {
    body.className = 'fragen';
    var v = kiVertiefungenOffen()[0];
    if (!v) { st.kiFertig = true; return weiter(); }
    var mitte = '<span class="zaehler">KI-Vertiefung · Simulation</span>';
    app.innerHTML = '<div class="uni">' + leiste(mitte, false) + '<main class="frage-raster"><section>' +
      '<div class="frage-kopf"><span class="schalen-marke">Konzept · nicht echt</span>' + KI + '</div>' +
      '<p class="offen-hinweis">' + esc(v.hinweis || 'Simulierte Folgefrage nach Pool-Ende') + '</p>' +
      '<h1 id="frage">' + esc(v.text) + '</h1><div class="antworten" role="group">' +
      v.antworten.map(function (an, i) { return '<button type="button" data-i="' + i + '">' + esc(an.t) + '</button>'; }).join('') + '</div>' +
      '<div class="frage-fuss"><button class="knopf zweit klein" id="ki-skip">Vertiefungen überspringen</button><span class="quelle">' + esc(v.q) + '</span></div></section>' +
      '<aside class="seitenbau"><h2>Nach dem Pool</h2><p class="standpunkt">Blickwinkel: <b>' + esc(B.STANDPUNKTE[standpunkt()]) + '</b></p>' +
      '<p class="fein">Echte KI würde hier Folgefragen aus deinen Antworten erzeugen. Hier nur Platzhalter-Karten.</p></aside></main></div>';
    app.querySelectorAll('.antworten button').forEach(function (b) {
      b.addEventListener('click', function () {
        st.kiA = st.kiA || {}; st.kiA[v.id] = +b.dataset.i;
        var an = v.antworten[+b.dataset.i];
        if (an && an.w) Object.keys(an.w).forEach(function () { /* Gewichte nur über Pool-Fragen in gewichte(); Vertiefung bleibt konzeptionell */ });
        // apply weights into a synthetic answer bag via st.a shadow? keep simple: bump via temp on BEREICHE through st._kiW
        st._kiW = st._kiW || {};
        if (an && an.w) Object.keys(an.w).forEach(function (k) { st._kiW[k] = (st._kiW[k] || 0) + an.w[k]; });
        if (an && an.p) { /* standpunkt bleibt pool-basiert */ }
        if (!kiVertiefungenOffen().length) st.kiFertig = true;
        weiter();
      });
    });
    document.getElementById('ki-skip').addEventListener('click', function () { st.kiFertig = true; weiter(); });
  }
  function zeigeDynamik() {
    body.className = 'fragen';
    st.dynamikGesehen = true;
    var inh = schrittInhalt();
    var opts = naechsteSchrittOptionen();
    var mitte = '<span class="zaehler">Für dich jetzt</span>' + steigerung(inh.steigerung);
    app.innerHTML = '<div class="uni">' + leiste(mitte, false) + '<main class="schritt-seite">' +
      '<p class="schalen-marke" style="background:' + TON[inh.steigerung] + ';color:' + TON_TEXT[inh.steigerung] + '">Abgestimmter Schritt · Vorschau</p>' +
      '<p class="fein">Blickwinkel: <b>' + esc(B.STANDPUNKTE[inh.standpunkt]) + '</b> · ' + esc(inh.schaleName) + '</p>' +
      '<h1>' + esc(inh.kern) + '</h1>' +
      '<ul class="punkte">' + inh.punkte.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
      '<p class="unter">' + esc((B.COPY && B.COPY.meta && B.COPY.meta.kurz) || 'So würde der nächste Inhalt aussehen — ohne Netz, nur dieser Schritt.') + '</p>' +
      '<p class="quelle">Quelle: ' + esc(quelleLang(inh.quelle)) + '</p>' +
      '<h2 class="naechste-h">Was als Nächstes?</h2>' +
      '<div class="naechste-wahl">' + opts.map(function (o) {
        return '<div class="wahl-karte demo"><strong>' + esc(o.label) + '</strong><span>' + esc(o.text) + '</span></div>';
      }).join('') +
      '<button type="button" class="wahl-karte" id="dyn-weiter"><strong>Weiter</strong><span>Zur nächsten Wahl</span></button>' +
      '<a class="wahl-karte" href="' + hier({ s: 'ki' }) + '"><strong>Wie die KI wählt</strong><span>Konzept kurz erklären</span></a>' +
      '</div></main></div>';
    document.getElementById('dyn-weiter').addEventListener('click', function () {
      erzwungen = 'wahl'; st.hauptGesehen = true; history.replaceState(null, '', hier({ s: null })); weiter();
    });
  }
  function zeigeInternSchema() {
    body.className = 'fragen';
    app.innerHTML = '<div class="uni">' + leiste('<span class="zaehler">Intern · Team</span>', false) +
      '<main class="inhalt"><p class="offen-hinweis">INTERN — nicht Besuchersicht. Spinnennetz = Navigationsgraph im Hintergrund.</p>' +
      '<h1>Sprungschema (intern)</h1>' +
      '<p class="unter">Knoten = Bereiche/Fragen. Kanten = mögliche nächste Schritte inkl. Sprung innere→äußere Schale.</p>' +
      '<div class="karte" id="karte" style="min-height:320px" role="img" aria-label="Internes Spinnennetz"></div>' +
      '<p class="fein">Besucher sehen davon nichts — nur Einzelschritt + Wahl.</p></main></div>';
    var k = document.getElementById('karte');
    if (k) { st.stufe = 1; karte(k, 1, false, {}); }
  }
  function zeigeNormal() {
    // Next-Vorschau: nach der Tür geht es auf die Startseite der Webseite
    st.modus = 'normal'; speichern(); location.replace('/de'); return;
    body.className = 'normal';
    if (!erzwungen) { st.modus = 'normal'; speichern(); }
    var hatAntworten = Object.keys(st.a).length > 0;
    var Cn = (B.COPY && B.COPY.normal) || {};
    app.innerHTML = kopf('start') + '<main><section class="held"><div><p class="zeile-oben">Back to Meaning Maximization · Genossenschaft im Aufbau</p><h1>' + esc(Cn.h1 || 'Angekommen — und jederzeit wieder') + '</h1>' +
      '<p class="slogan">BtMM – wirtschaften auf Augenhöhe</p>' +
      '<p>' + esc(Cn.lead || 'Wir teilen, was einzeln teuer ist. Wir arbeiten zum gleichen Lohn für jede Stunde. Und wir besitzen gemeinsam, was nie verkauft wird. Gegründet wird so bald wie möglich, sobald drei Mitglieder da sind.') + '</p>' +
      '<p class="fein">' + esc(Cn.tuer || '') + '</p>' +
      flyerHtml(Cn) +
      '<div class="knoepfe"><a class="knopf" href="' + basis + 'index.html#alle">' + esc(Cn.cta1 || 'Bereiche entdecken') + '</a><a class="knopf zweit" href="' + url('mitmachen') + '">Mitmachen</a>' +
      '<a class="knopf zweit" href="' + sp134Url() + '">Bewertungen & Feedback</a>' +
      '<a class="knopf tuer-knopf" href="' + basis + 'index.html?tuer=1">' + TUER_ICON + '<span>' + esc(Cn.cta2 || 'Tür erneut öffnen') + '</span></a></div>' +
      '<p class="quelle">Quelle: Dok. 00 „In fünf Sätzen“; Businessplan-Entwurf v0.1.11, Weg A</p>' +
      (wiederkehr ? '<p class="willkommen" role="status">Willkommen zurück. Die Tür kennst du schon, deshalb startest du hier.</p>' : '') + '</div>' +
      '<img src="bilder/logo.png" alt="Logo Back to Meaning Maximization"></section>' +
      nachlesenHtml() +
      '<section class="sortiert" aria-labelledby="alle"><div class="sortiert-kopf"><h2 id="alle">' + (hatAntworten ? 'Für dich sortiert' : 'Alle Seiten') + '</h2>' +
      steigerung(2) + (hatAntworten ? '<span class="quelle">Reihenfolge nach deinen Antworten (regelbasiert) · Blickwinkel: ' + esc(B.STANDPUNKTE[standpunkt()]) + '</span>' : '') + '</div><div class="spalten">' +
      B.SCHALEN.map(function (s, i) { var rf = reihenfolge(s.id); var liste = rf.sichtbar.concat(rf.aus);
        return '<div class="spalte"><h3><i style="background:' + TON[i] + '"></i>' + esc(s.name) + ' <span>' + esc(s.kurz) + '</span></h3>' +
          liste.map(function (x) { return '<a class="kachel" href="' + url(x.b.id) + '"><strong>' + esc(x.b.titel) + '</strong><span>' + esc(x.b.kurz) + '</span></a>'; }).join('') + '</div>'; }).join('') +
      '</div></section>' + vorschauKartenHtml() + '</main>' + fuss();
    app.querySelector('.kopf').insertAdjacentHTML('beforeend', '');
  }
  function kopf(aktiv) {
    if (typeof window.btmmKopf === 'function') return window.btmmKopf(basis, aktiv);
    var nav = ['so-funktionierts', 'was-du-sparst', 'koerperarbeit', 'faq', 'mitmachen'];
    return '<header class="kopf" id="kopf"><a class="marke" href="' + basis + 'index.html"><img src="' + basis + 'bilder/logo.png" alt=""><span>BtMM</span><span class="nur-sr">, Startseite</span></a>' +
      '<nav aria-label="Hauptnavigation">' + nav.map(function (id) { var b = bereich(id); return '<a href="' + url(id) + '"' + (aktiv === id ? ' aria-current="page"' : '') + '>' + esc(b.titel) + '</a>'; }).join('') + '<a href="' + basis + 'index.html#alle">Alle Seiten</a></nav>' +
      '<a class="knopf zweit klein tuer-klein" href="' + basis + 'index.html?tuer=1" aria-label="Tür öffnen" title="Willkommensfragen starten">' + TUER_ICON + '<span>Tür öffnen</span></a></header>';
  }
  function fuss() {
    if (typeof window.btmmFuss === 'function') return window.btmmFuss(basis);
    return '<footer class="fuss" id="fuss"><p class="fuss-slogan">BtMM – wirtschaften auf Augenhöhe</p><p>Alle Seiten: ' + B.BEREICHE.map(function (b) { return '<a href="' + url(b.id) + '">' + esc(b.titel) + '</a>'; }).join('') + '</p><p class="fein">Vorschau 18. November 2026 · noindex · kein Live auf b-t-m-m.com</p></footer>';
  }

  function nachlesenHtml() {
    function s(id, hash) { return basis + 'seiten/' + id + '.html' + (hash || ''); }
    var items = [
      { t: 'Einfach erklärt', k: 'Der kürzeste Einstieg: was BtMM will und wie die drei Säulen greifen.', href: s('dokumente', '#dok-00') },
      { t: 'Konzept', k: 'Drei Säulen, Keim-Phase und wo du tiefer nachlesen kannst.', href: s('konzept') },
      { t: 'Dokumente', k: 'Zusammenfassungen und Entwürfe zum Lesen in deinem Tempo.', href: s('dokumente') },
      { t: "So funktioniert's", k: 'Teilen, gleiche Stunde, besitzen — klar und nah.', href: s('so-funktionierts') }
    ];
    return '<section class="nachlesen" aria-labelledby="nachlesen-titel"><div class="sortiert-kopf"><h2 id="nachlesen-titel">Was nachlesen?</h2></div>' +
      '<p class="nachlesen-zeile"><strong>Nachlesen:</strong> ' + items.map(function (x) {
        return '<a href="' + x.href + '">' + esc(x.t) + '</a>';
      }).join(' · ') + '</p>' +
      '<div class="spalten">' + items.map(function (x) {
        return '<a class="kachel" href="' + x.href + '"><strong>' + esc(x.t) + '</strong><span>' + esc(x.k) + '</span></a>';
      }).join('') + '</div></section>';
  }

  function vorschauKartenHtml() {
    var karten = [
      { href: basis + 'vorschau/bewertung-chat-feedback/', t: 'Bewertungen & Feedback', k: 'Stimmen, Fragen, Feedback und Texte in Stufen.' },
      { href: basis + 'vorschau/leichte-sprache/', t: 'Leichte Sprache', k: 'Kurzfassung parallel zum normalen Text — freiwillig.' },
      { href: basis + 'vorschau/weitersagen/', t: 'Weitersagen', k: 'Teilen und einladen, ohne Marketing-Druck.' },
      { href: basis + 'vorschau/barrierefreiheit/', t: 'Barrierefreiheit', k: 'Zugang, Hinweise und was noch fehlt.' },
      { href: basis + 'vorschau/sprach-formular/', t: 'Sprach-Eingabe', k: 'Formularfelder per Sprache — Preview, nichts wird gespeichert.' }
    ];
    return '<section class="sortiert vorschau-karten" aria-labelledby="vorschau-mehr"><div class="sortiert-kopf"><h2 id="vorschau-mehr">Auch in dieser Vorschau</h2></div><div class="spalten">' +
      karten.map(function (x) { return '<a class="kachel" href="' + x.href + '"><strong>' + esc(x.t) + '</strong><span>' + esc(x.k) + '</span></a>'; }).join('') +
      '</div></section>';
  }
  /* Unterseite: Kopf/Fuß + „Weiter für dich“ */
  function unterseite() {
    var id = body.dataset.id;
    document.getElementById('kopf').outerHTML = kopf(id);
    document.getElementById('fuss').outerHTML = fuss();
    var box = document.getElementById('weiter'); if (!box || !Object.keys(st.a).length || !bereich(id)) return;
    var b = bereich(id), w = gewichte(), e = effSchale(b, w, standpunkt()), rf = reihenfolge(e.s).sichtbar, i = rf.map(function (x) { return x.b.id; }).indexOf(id);
    var n = rf[i + 1];
    box.innerHTML = '<p><b>Weiter in deiner Schale „' + esc(B.SCHALEN[SCH.indexOf(e.s)].name) + '“:</b> ' + (n ? '<a href="' + url(n.b.id) + '">' + esc(n.b.titel) + '</a>' : 'alles gesehen. <a href="../index.html">Zur nächsten Schale</a>') + '</p>';
    box.hidden = false;
  }

  function weiter() {
    var p = phase();
    if (p === 'tuer' || p === 'oeffnen') zeigeTuer();
    else if (p === 'anzahl') zeigeAnzahl();
    else if (p === 'frage') zeigeFrage();
    else if (p === 'schritt') zeigeSchritt();
    else if (p === 'wahl') zeigeWahl();
    else if (p === 'ki' || p === 'ki-konzept') zeigeKiKonzept();
    else if (p === 'ki-vertief') zeigeKiVertief();
    else if (p === 'dynamik') zeigeDynamik();
    else if (p === 'intern' || p === 'intern-schema') zeigeInternSchema();
    else if (p === 'abschluss') { st.hauptGesehen = true; zeigeWahl(); }
    else if (p === 'schale') zeigeSchritt(); // Alt-Parameter → Einzelschritt
    else zeigeNormal();
    var h1 = app.querySelector('h1'); if (h1 && document.activeElement && document.activeElement !== document.body) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-aktion]');
    if (!a || a.dataset.aktion !== 'normal') return;
    st.modus = 'normal'; st.fertig = true; setzeDurchlauf();
  });
  window.addEventListener('resize', function () { if (phase() !== 'intern' && phase() !== 'intern-schema') return; var k = document.getElementById('karte'); if (k) karte(k, st.stufe || 1, false, {}); });

  if (body.dataset.seite === 'unter') { unterseite(); return; }
  speichern();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(weiter); else weiter();
})();
