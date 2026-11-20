/* BtMM Tür-Eintritt als offener Dialog (Vorschau, Nutzer 20.11.2026 23:50).
 * Regelbasiert, ohne LLM (KI-Kostenregel 0 €, nur extraktiv). Antworten nur in sessionStorage.
 * Ablauf: offene Fragen → Profil aus Schlagworten → persönlicher Pfad mit Schritten. */
(function () {
  'use strict';
  var KEY = 'btmm-eintritt-v1';
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Schlagworte → Merkmale ---------- */
  var MERKMALE = {
    freund:     ['freund', 'freundin', 'bekannt', 'kollege', 'kollegin', 'familie', 'mutter', 'vater', 'bruder', 'schwester', 'erzählt', 'empfohlen', 'empfehlung', 'mitbewohn', 'wg', 'chor'],
    online:     ['instagram', 'internet', 'google', 'gesucht', 'online', 'social', 'facebook', 'tiktok', 'youtube', 'webseite', 'website', 'artikel', 'zeitung', 'podcast'],
    vorort:     ['flyer', 'plakat', 'aushang', 'veranstaltung', 'abend', 'markt', 'vortrag', 'getroffen', 'treffen'],
    neugierig:  ['informier', 'wissen', 'verstehen', 'neugierig', 'mehr erfahren', 'mehr dazu', 'worum', 'genauer', 'kennenlernen', 'interessiert', 'interesse', 'lesen'],
    skeptisch:  ['skeptisch', 'zweifel', 'funktioniert', 'haken', 'trägt', 'belege', 'beweis', 'unsicher', 'realistisch', 'utopie', 'misstrau', 'kritisch', 'ehrlich'],
    sparen:     ['sparen', 'geld', 'teuer', 'kosten', 'miete', 'einkauf', 'preis', 'günstig', 'lebensmittel', 'rechnung', 'knapp', 'finanz', 'auto', 'mobilität', 'strom', 'energie'],
    arbeiten:   ['arbeit', 'job', 'betrieb', 'handwerk', 'beruf', 'lohn', 'selbstständig', 'selbständig', 'firma', 'werkstatt', 'stelle', 'verdienen', 'ausbildung', 'gewerbe'],
    wohnen:     ['wohnen', 'wohnung', 'haus', 'häuser', 'boden', 'grundstück', 'eigentum', 'bauen'],
    sinn:       ['sinn', 'gemeinschaft', 'zusammen', 'werte', 'gerecht', 'fair', 'augenhöhe', 'menschen', 'einsam', 'verbunden', 'solidar', 'nachhaltig', 'zukunft', 'anders wirtschaften'],
    gruenden:   ['gründ', 'mitglied', 'aufbauen', 'anpacken', 'mitmachen', 'mithelfen', 'engagier', 'beitragen', 'dabei sein', 'einbringen'],
    freiburg:   ['freiburg', 'breisgau', 'südbaden', 'in der nähe', 'hier vor ort', 'region'],
    weit:       ['weit weg', 'andere stadt', 'woanders', 'nicht in freiburg', 'berlin', 'hamburg', 'münchen', 'köln', 'ausland'],
    nurlesen:   ['nur lesen', 'erstmal lesen', 'erst mal lesen', 'informieren', 'wenig zeit', 'keine zeit', 'anschauen', 'reinschauen', 'beobachten'],
    vorbei:     ['vorbeikommen', 'vorbei kommen', 'besuchen', 'kennenlernen', 'treffen', 'abend', 'reden', 'gespräch'],
    anpacken:   ['anpacken', 'mitmachen', 'mithelfen', 'viel zeit', 'aktiv', 'einbringen', 'mitarbeiten', 'gründen', 'mitglied']
  };
  var MOTIVE = ['neugierig', 'skeptisch', 'sparen', 'arbeiten', 'wohnen', 'sinn', 'gruenden'];

  function norm(t) { return (t || '').toLowerCase().replace(/\s+/g, ' '); }
  function auswerten(text) {
    var t = norm(text), treffer = {};
    Object.keys(MERKMALE).forEach(function (k) {
      MERKMALE[k].forEach(function (w) { if (t.indexOf(w) !== -1) treffer[k] = (treffer[k] || 0) + 1; });
    });
    return treffer;
  }

  /* ---------- Fragen (offen, Auswahl nach Profil) ---------- */
  var FRAGEN = [
    { id: 'herkunft', text: 'Wie bist du auf BtMM gekommen?', immer: true },
    { id: 'motiv', text: 'Was hat dich daran neugierig gemacht?', immer: true },
    { id: 'sparen', text: 'Wo im Alltag merkst du am meisten, dass vieles allein teuer ist?', wenn: 'sparen' },
    { id: 'arbeit', text: 'Was arbeitest du, oder was würdest du gern arbeiten?', wenn: 'arbeiten' },
    { id: 'wohnen', text: 'Was wünschst du dir beim Wohnen, das heute schwer zu bekommen ist?', wenn: 'wohnen' },
    { id: 'zweifel', text: 'Was müsste BtMM dir zeigen, damit du es ernst nimmst?', wenn: 'skeptisch' },
    { id: 'sinn', text: 'Was erhoffst du dir von einer Gemeinschaft wie BtMM?', wenn: 'sinn' },
    { id: 'ort', text: 'Wohnst du in der Nähe von Freiburg oder eher woanders?', immer: true },
    { id: 'zeit', text: 'Wie viel möchtest du gerade mit BtMM zu tun haben: erst mal lesen, mal vorbeikommen oder mit anpacken?', immer: true }
  ];
  var MAX_FRAGEN = 6;

  /* Kurze Rückmeldung auf die letzte Antwort (aus Schlagworten, keine Textgenerierung) */
  var ECHO = {
    freund: 'Schön, dass dir jemand davon erzählt hat.',
    online: 'Gut, dass du uns gefunden hast.',
    vorort: 'Schön, dass wir uns schon begegnet sind.',
    skeptisch: 'Gut, dass du genau hinschaust.',
    sparen: 'Da setzt BtMM an: teilen, was allein teuer ist.',
    arbeiten: 'Arbeit hat bei BtMM einen festen Platz.',
    wohnen: 'Wohnen ist eine der großen Fragen bei BtMM.',
    sinn: 'Darum geht es im Kern: wirtschaften auf Augenhöhe.',
    gruenden: 'Wir suchen gerade die ersten Mitglieder.',
    freiburg: 'Der erste Keim entsteht in Freiburg.',
    weit: 'BtMM ist auch aus der Ferne zu verfolgen.',
    neugierig: 'Dann zeigen wir dir gleich, wo du anfangen kannst.'
  };

  /* ---------- Schritte des Pfads ---------- */
  var SCHRITTE = {
    grundlagen: { titel: 'Worum es geht', text: 'Die Idee in wenigen Minuten: teilen, gleich bezahlte Arbeit und Häuser, die nie verkauft werden.', href: '/de/so-funktionierts' },
    sparen:     { titel: 'Was du sparst', text: 'Wie gemeinsames Einkaufen und Teilen die Kosten im Alltag senkt.', href: '/de/konzept' },
    arbeiten:   { titel: 'Arbeiten in Zellen', text: 'Wie Betriebe in BtMM arbeiten und warum jede Stunde gleich viel wert ist.', href: '/de/zellen' },
    wohnen:     { titel: 'Wohnen und Boden', text: 'Warum Häuser bei BtMM gemeinsam gehalten und nicht verkauft werden.', href: '/de/konzept' },
    skeptisch:  { titel: 'Belege und offene Fragen', text: 'Antworten auf kritische Fragen und die Dokumente zum Nachlesen.', href: '/de/faq' },
    dokumente:  { titel: 'Dokumente', text: 'Satzung, Konzept und Einführung zum Herunterladen.', href: '/de/dokumente' },
    sinn:       { titel: 'Gemeinschaft', text: 'Wie Entscheidungen fallen und wie Menschen in BtMM zusammenkommen.', href: '/de/wissen' },
    gruenden:   { titel: 'Die Gründung', text: 'Wo BtMM gerade steht und was bis zur Genossenschaft fehlt.', href: '/de/gruendung' },
    freiburg:   { titel: 'Der Keim in Freiburg', text: 'Wie der erste Ort entsteht und wie du dazukommst.', href: '/de/gruendung' },
    vorbei:     { titel: 'Offener Abend', text: 'Komm vorbei und lern die Menschen hinter BtMM kennen.', href: '/de/mitmachen' },
    anpacken:   { titel: 'Mitmachen', text: 'Werde eins der ersten Mitglieder oder hilf beim Aufbau.', href: '/de/mitmachen' },
    folgen:     { titel: 'Dranbleiben', text: 'Lies in Ruhe weiter und schau, was als Nächstes entschieden wird.', href: '/de/chronik' }
  };

  /* ---------- Zustand ---------- */
  var st = laden() || { antworten: [], profil: {}, gestellt: [] };
  function laden() { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; } }
  function speichern() { try { sessionStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  function naechsteFrage() {
    if (st.gestellt.length >= MAX_FRAGEN) return null;
    var p = st.profil;
    // zuerst feste Einstiegsfragen in Reihenfolge, dazwischen passende Vertiefung
    var kandidaten = FRAGEN.filter(function (f) { return st.gestellt.indexOf(f.id) === -1; });
    var vertiefung = kandidaten.filter(function (f) { return f.wenn && p[f.wenn]; })
      .sort(function (a, b) { return (p[b.wenn] || 0) - (p[a.wenn] || 0); })[0];
    var fest = kandidaten.filter(function (f) { return f.immer; });
    if (st.gestellt.length < 2) return fest[0];
    var rest = MAX_FRAGEN - st.gestellt.length;
    // Platz für Ort + Zeit am Ende freihalten
    if (vertiefung && rest > fest.length) return vertiefung;
    return fest[0] || vertiefung || null;
  }

  function echo(treffer) {
    var keys = Object.keys(treffer).sort(function (a, b) { return treffer[b] - treffer[a]; });
    st.echos = st.echos || [];
    for (var i = 0; i < keys.length; i++) if (ECHO[keys[i]] && st.echos.indexOf(keys[i]) === -1) { st.echos.push(keys[i]); return ECHO[keys[i]]; }
    return 'Danke, das hilft mir weiter.';
  }

  /* ---------- Dialog-Ansicht ---------- */
  var verlauf = $('verlauf'), feld = $('antwort');
  function blase(text, wer) {
    var li = document.createElement('li');
    li.className = 'blase ' + wer;
    li.textContent = text;
    verlauf.appendChild(li);
    li.scrollIntoView({ block: 'end', behavior: 'smooth' });
    return li;
  }
  function frageStellen() {
    var f = naechsteFrage();
    if (!f) return pfadZeigen();
    st.gestellt.push(f.id); st.offen = f.id; speichern();
    blase(f.text, 'frage');
    feld.focus({ preventScroll: true });
  }
  function antworten(text) {
    text = (text || '').trim();
    if (!text) { feld.focus(); return; }
    stopMik();
    blase(text, 'antwort');
    var t = auswerten(text);
    Object.keys(t).forEach(function (k) { st.profil[k] = (st.profil[k] || 0) + t[k]; });
    st.antworten.push({ frage: st.offen, text: text });
    speichern();
    feld.value = '';
    setTimeout(function () {
      blase(echo(t), 'echo');
      setTimeout(frageStellen, 650);
    }, 450);
  }
  $('eingabe').addEventListener('submit', function (e) { e.preventDefault(); antworten(feld.value); });
  feld.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); antworten(feld.value); } });
  $('loeschen').addEventListener('click', function () { sessionStorage.removeItem(KEY); location.reload(); });

  /* ---------- Spracheingabe (Web Speech, nur nach Tippen, mit Hinweis) ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null, hinweisGesehen = false;
  if (!SR) $('mik').hidden = true;
  function stopMik() { if (rec) { try { rec.stop(); } catch (e) {} } }
  function startMik() {
    rec = new SR(); rec.lang = 'de-DE'; rec.interimResults = true; rec.continuous = true;
    var basis = feld.value ? feld.value + ' ' : '';
    rec.onresult = function (e) {
      var s = ''; for (var i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
      feld.value = basis + s;
    };
    rec.onend = function () { $('mik').setAttribute('aria-pressed', 'false'); document.body.classList.remove('hoert'); rec = null; };
    rec.start(); $('mik').setAttribute('aria-pressed', 'true'); document.body.classList.add('hoert');
  }
  $('mik').addEventListener('click', function () {
    if (rec) return stopMik();
    if (!hinweisGesehen) { $('mik-hinweis').hidden = false; return; }
    startMik();
  });
  $('mik-start').addEventListener('click', function () { hinweisGesehen = true; $('mik-hinweis').hidden = true; startMik(); });
  $('mik-tippen').addEventListener('click', function () { $('mik-hinweis').hidden = true; feld.focus(); });

  /* ---------- Profil → Pfad ---------- */
  function pfadBauen(p) {
    var s = [];
    var stark = MOTIVE.filter(function (m) { return p[m]; }).sort(function (a, b) { return p[b] - p[a]; });
    if (!(p.gruenden && !p.neugierig && !p.skeptisch)) s.push('grundlagen');
    stark.forEach(function (m) {
      if (m === 'neugierig') return;
      if (m === 'gruenden') return;
      if (s.length < 4) s.push(m);
    });
    if (p.skeptisch) s.push('dokumente');
    if (p.freiburg && !p.weit) s.push('freiburg');
    else if (p.gruenden) s.push('gruenden');
    var bindung = (p.anpacken || p.gruenden) ? 'anpacken' : (p.vorbei && !p.weit) ? 'vorbei' : 'folgen';
    s.push(bindung);
    var gesehen = {};
    return s.filter(function (k) { var h = SCHRITTE[k].href + SCHRITTE[k].titel; if (gesehen[k] || gesehen[h]) return false; gesehen[k] = gesehen[h] = 1; return true; });
  }
  function profilSatz(p) {
    var teile = [];
    if (p.freund) teile.push('jemand hat dir von BtMM erzählt');
    else if (p.online) teile.push('du hast BtMM im Netz gefunden');
    else if (p.vorort) teile.push('du bist BtMM vor Ort begegnet');
    var namen = { neugierig: 'willst verstehen, worum es geht', skeptisch: 'schaust kritisch hin', sparen: 'willst im Alltag sparen', arbeiten: 'interessierst dich fürs Arbeiten', wohnen: 'denkst ans Wohnen', sinn: 'suchst Sinn und Gemeinschaft', gruenden: 'willst mit aufbauen' };
    var m = MOTIVE.filter(function (k) { return p[k]; }).sort(function (a, b) { return p[b] - p[a]; }).slice(0, 2).map(function (k) { return 'du ' + namen[k]; });
    teile = teile.concat(m);
    if (!teile.length) return 'Hier ist ein Weg, der für den Anfang passt.';
    var satz = teile.length > 1 ? teile.slice(0, -1).join(', ') + ' und ' + teile[teile.length - 1] : teile[0];
    return 'So wie wir dich verstanden haben: ' + satz + '. Daraus ist dieser Weg entstanden.';
  }
  function pfadZeigen() {
    st.fertig = true; speichern();
    var keys = pfadBauen(st.profil);
    $('profil-satz').textContent = profilSatz(st.profil);
    var ol = $('schritte'); ol.innerHTML = '';
    keys.forEach(function (k, i) {
      var d = SCHRITTE[k], li = document.createElement('li');
      li.className = 'schritt' + (i === 0 ? ' jetzt' : '');
      li.innerHTML = '<span class="nr">' + (i + 1) + '</span><div><h2></h2><p></p><a class="knopf"></a></div>';
      li.querySelector('h2').textContent = d.titel;
      li.querySelector('p').textContent = d.text;
      var a = li.querySelector('a'); a.href = d.href; a.textContent = i === 0 ? 'Hier anfangen' : 'Ansehen';
      ol.appendChild(li);
    });
    $('dialog').hidden = true; $('pfad').hidden = false; document.body.className = 'phase-pfad';
    window.scrollTo(0, 0);
  }

  /* ---------- Tür ---------- */
  function dialogStarten() {
    $('tuer').hidden = true; $('dialog').hidden = false; document.body.className = 'phase-dialog';
    verlauf.innerHTML = '';
    if (st.fertig) return pfadZeigen();
    if (st.antworten.length) {
      // Verlauf aus der Sitzung wiederherstellen
      st.antworten.forEach(function (a) { var f = FRAGEN.filter(function (x) { return x.id === a.frage; })[0]; if (f) blase(f.text, 'frage'); blase(a.text, 'antwort'); });
      st.gestellt = st.antworten.map(function (a) { return a.frage; });
    }
    blase('Schön, dass du da bist. Antworte so, wie es dir gerade einfällt, mit Text oder Sprache.', 'echo');
    setTimeout(frageStellen, 600);
  }
  $('eintreten').addEventListener('click', function () {
    document.body.classList.add('oeffnet');
    setTimeout(dialogStarten, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1100);
  });
  if (new URLSearchParams(location.search).has('neu')) sessionStorage.removeItem(KEY), st = { antworten: [], profil: {}, gestellt: [] };
})();
