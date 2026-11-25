/* BtMM Tür: Profil → individueller Kennenlern-Pfad (reine Logik, ohne DOM; auch im Unit-Test genutzt).
 * Nutzer 21.11.2026 00:35: „Der bot soll den Pfad nicht für mich anlegen sondern der Pfad passt sich individuell an den Nutzer an“.
 * Auswahl, Reihenfolge, Bezugssätze und Bilder der Schritte ergeben sich aus dem Profil (Schlagwort-Treffer), es gibt keine Standardroute.
 * Regelbasiert, kein LLM. */
(function (wurzel) {
  'use strict';
  // Deutsche Wörter, die in anderen Sprachen oft etwas anderes bedeuten, nicht als Rückfall nutzen.
  var RUECKFALL_AUS = ['region', 'firma', 'social', 'auto', 'chor', 'stelle', 'haus', 'abend', 'lesen'];
  var MOTIVE = ['neugierig', 'skeptisch', 'sparen', 'arbeiten', 'wohnen', 'sinn', 'gruenden', 'kunde', 'einstieg', 'lebensphase', 'ruhestand', 'unterstuetzen'];

  /* Schritte: Pfad ohne Locale. Jeder Schritt hat sein eigenes Bild im Fotostil (Nutzer 21.11.2026 10:07:
   * realistischer Fotostil statt comichaft; Herkunft: Design-Bot, docs/tuer-weg-bilder-HERKUNFT.md). */
  var SCHRITTE = {
    grundlagen: { href: '/so-funktionierts', bild: 'grundlagen' },
    sparen:     { href: '/was-du-sparst', bild: 'sparen' },
    arbeiten:   { href: '/konzept/wirtschaft', bild: 'arbeiten' },
    wohnen:     { href: '/konzept', bild: 'wohnen' },
    skeptisch:  { href: '/faq', bild: 'skeptisch' },
    dokumente:  { href: '/dokumente', bild: 'dokumente' },
    sinn:       { href: '/wissen', bild: 'sinn' },
    gruenden:   { href: '/gruendung', bild: 'gruenden' },
    freiburg:   { href: '/gruendung', bild: 'freiburg' },
    vorbei:     { href: '/mitmachen', bild: 'vorbei' },
    anpacken:   { href: '/mitmachen', bild: 'anpacken' },
    folgen:     { href: '/chronik', bild: 'folgen' },
    /* PR #38: Gruppen ohne eigenen Pfad, Inhalte unter /fuer-dich/* */
    kunde:      { href: '/fuer-dich/kunden', bild: 'kunde' },
    einstieg:   { href: '/fuer-dich/berufseinstieg', bild: 'einstieg' },
    lebensphase:{ href: '/fuer-dich/lebensphasen', bild: 'lebensphase' },
    /* PR #38 Runde 3 */
    ruhestand:  { href: '/fuer-dich/ruhestand', bild: 'ruhestand' },
    unterstuetzen: { href: '/fuer-dich/unterstuetzen', bild: 'unterstuetzen' }
  };
  /* Bilder 16:9: eigene Grafik je ursprünglichem Schritt. Neue Schritte (#38)
   * teilen die Datei eines thematisch nahen Schritts und behalten eine eigene Bild-ID (Alt-Text).
   * Kommen beide im selben Weg vor, weicht der #38-Schritt aus (bilderWaehlen, AUSWEICH). */
  var BILD_DATEI = {
    kunde: 'arbeiten', einstieg: 'grundlagen', lebensphase: 'wohnen',
    ruhestand: 'sinn', unterstuetzen: 'anpacken'
  };
  var BILDER = {};
  Object.keys(SCHRITTE).forEach(function (k) {
    var id = SCHRITTE[k].bild;
    var datei = BILD_DATEI[id] || id;
    if (!BILDER[id]) BILDER[id] = { src: '/tuer/bilder/weg/' + datei + '.jpg', webp: '/tuer/bilder/weg/' + datei + '.webp' };
  });

  function grund(t) {
    return (t || '').toLowerCase().replace(/[’`´]/g, "'").normalize('NFD')
      .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, '')
      .replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/[.,!?;:()"„“”«»¿¡…،؟؛।。、！？，：；（）「」]/g, ' ').replace(/\s+/g, ' ');
  }
  function norm(t) { return ' ' + grund(t).trim() + ' '; }

  function merkmaleFuer(T, DE, lang) {
    var M = {};
    Object.keys(DE.merkmale).forEach(function (k) {
      var liste = (T.merkmale[k] || []).slice();
      if (lang !== 'de') liste = liste.concat(DE.merkmale[k].filter(function (w) { return RUECKFALL_AUS.indexOf(w) === -1; }));
      M[k] = liste.map(grund).filter(Boolean);
    });
    /* Runde 4: Kunden-Verben schlagen „Betrieb“, wenn kein eigener Betrieb genannt ist (nicht aufzählbar, damit auswerten nur Merkmale sieht) */
    var V = T.vorrang || DE.vorrang || {};
    Object.defineProperty(M, '_vorrang', { value: { kv: (V.kundeVerben || []).map(grund).filter(Boolean), eb: (V.eigenerBetrieb || []).map(grund).filter(Boolean) }, enumerable: false });
    return M;
  }
  function auswerten(M, text) {
    var t = norm(text), treffer = {};
    Object.keys(M).forEach(function (k) {
      M[k].forEach(function (w) { if (t.indexOf(w) !== -1) treffer[k] = (treffer[k] || 0) + 1; });
    });
    var V = M._vorrang;
    if (V && treffer.arbeiten) {
      var hat = function (l) { return l.some(function (w) { return t.indexOf(w) !== -1; }); };
      if (hat(V.kv) && !hat(V.eb)) { delete treffer.arbeiten; treffer.kunde = (treffer.kunde || 0) + 1; }
    }
    return treffer;
  }
  /* Runde 4: Antwort-Chips. Jeder Chip trägt seine Merkmale selbst (Index = Reihenfolge in texte-r4.js / lageWahl),
   * damit die Zuordnung nicht von der Wortwahl abhängt. Freitext läuft weiter über auswerten(). */
  var WAHL = {
    motiv: [{ arbeiten: 2 }, { arbeiten: 2 }, { kunde: 2, sparen: 1 }, { skeptisch: 2 }, { gruenden: 2 }, { unterstuetzen: 2 }, { neugierig: 2 }],
    lage: [{ einstieg: 2 }, { lebensphase: 2 }, { lebensphase: 2 }, { ruhestand: 2 }, {}],
    zeit: [{ nurlesen: 1 }, {}, { neugierig: 1 }, { vorbei: 1 }, { anpacken: 1 }]
  };
  var WAHL_TEXT = { motiv: 'motivWahl', lage: 'lageWahl', zeit: 'zeitWahl' };
  function wahlProfil(frageId, i) {
    var m = (WAHL[frageId] || [])[i] || {}, out = {};
    Object.keys(m).forEach(function (k) { out[k] = m[k]; });
    return out;
  }

  /* Profil → Schrittfolge. Jeder Kandidat bekommt eine Gewichtung aus dem Profil; sortiert wird absteigend.
   * Bindung (anpacken / vorbei / folgen) steht immer am Ende. */
  var REIHE = ['skeptisch', 'unterstuetzen', 'kunde', 'arbeiten', 'sparen', 'grundlagen', 'gruenden', 'freiburg', 'einstieg', 'wohnen', 'sinn', 'ruhestand', 'lebensphase', 'dokumente'];
  function pfadBauen(p) {
    p = p || {};
    var w = {};
    var nurGruenden = p.gruenden && !p.neugierig && !p.skeptisch;
    if (!nurGruenden) w.grundlagen = 2 + 2 * (p.neugierig || 0) + (p.freund ? 1 : 0);
    ['sparen', 'arbeiten', 'wohnen', 'sinn', 'kunde', 'unterstuetzen'].forEach(function (m) { if (p[m]) w[m] = 3 * p[m]; });
    /* Wer ausdrücklich als Kundin/Kunde oder Unterstützer:in kommt, sieht das zuerst (Runde 3) */
    if (w.kunde) w.kunde += 1;
    if (w.unterstuetzen) w.unterstuetzen += 1;
    /* Lebenslagen (Runde 3): nach dem Hauptmotiv, aber im Weg; mehrere Treffer heben sie an */
    if (p.einstieg) w.einstieg = 2 + p.einstieg;
    if (p.ruhestand) w.ruhestand = 2 + p.ruhestand;
    if (p.lebensphase) w.lebensphase = 1.5 + 0.5 * p.lebensphase;
    if (p.skeptisch) { w.skeptisch = 3 * p.skeptisch + 1; w.dokumente = 2 * p.skeptisch + (p.online ? 1 : 0); }
    if (p.freiburg && !p.weit) w.freiburg = 1 + (p.vorbei || 0) + (p.vorort || 0) + (p.gruenden || 0);
    else if (p.gruenden) w.gruenden = 2 * p.gruenden;
    var s = Object.keys(w).sort(function (a, b) { return (w[b] - w[a]) || (REIHE.indexOf(a) - REIHE.indexOf(b)); });
    // Motiv-Schritte begrenzen, damit der Weg kurz bleibt (max. 5 vor der Bindung)
    s = s.slice(0, 5);
    var bindung = (p.anpacken || p.gruenden) ? 'anpacken' : (p.vorbei && !p.weit) ? 'vorbei' : 'folgen';
    s.push(bindung);
    var gesehen = {};
    return s.filter(function (k) { var h = SCHRITTE[k].href; if (gesehen[k] || (gesehen[h] && k !== 'freiburg')) return false; gesehen[k] = gesehen[h] = 1; return true; });
  }
  function bezugKey(k, p) {
    p = p || {};
    switch (k) {
      case 'grundlagen': return p.neugierig ? 'neugierig' : p.freund ? 'freund' : p.online ? 'online' : 'start';
      case 'dokumente': return 'skeptisch';
      case 'vorbei': return p.vorbei ? 'vorbei' : p.freiburg ? 'freiburg' : 'start';
      case 'anpacken': return p.anpacken ? 'anpacken' : 'gruenden';
      case 'folgen': return p.weit ? 'weit' : p.nurlesen ? 'nurlesen' : 'dranbleiben';
      default: return k;
    }
  }
  /* Ausweichfotos für die #38-Schritte, deren eigene Datei mit einem anderen Schritt geteilt wird (BILD_DATEI).
   * Reihenfolge = thematische Nähe; es zählen nur Bild-IDs mit eigener Datei. */
  var AUSWEICH = {
    kunde:         ['grundlagen', 'sparen', 'wohnen', 'sinn', 'folgen', 'freiburg'],
    einstieg:      ['arbeiten', 'anpacken', 'gruenden', 'freiburg', 'folgen', 'vorbei'],
    lebensphase:   ['sinn', 'sparen', 'folgen', 'freiburg', 'vorbei', 'gruenden'],
    ruhestand:     ['folgen', 'wohnen', 'vorbei', 'sparen', 'freiburg', 'grundlagen'],
    unterstuetzen: ['gruenden', 'folgen', 'vorbei', 'freiburg', 'grundlagen', 'sinn']
  };
  function dateiVon(id) { return BILDER[id] && BILDER[id].src; }
  /* Bild je Schritt: eindeutig nach Datei. Schritte mit eigener Datei behalten ihr Motiv; ein #38-Schritt, dessen Datei
   * im Weg schon vorkommt, nimmt das nächste freie Ausweichfoto (Alt-Text folgt der Bild-ID). Ist keins frei, ist die
   * Stelle null und der Schritt erscheint ohne Bild, statt dasselbe Foto zweimal zu zeigen. */
  function bilderWaehlen(keys) {
    var benutzt = {}, out = new Array(keys.length);
    keys.forEach(function (k, i) {
      var id = SCHRITTE[k].bild;
      if (BILD_DATEI[id]) return;
      var f = dateiVon(id);
      if (!benutzt[f]) { benutzt[f] = 1; out[i] = id; } else out[i] = null;
    });
    keys.forEach(function (k, i) {
      var id = SCHRITTE[k].bild;
      if (!BILD_DATEI[id]) return;
      var kandidaten = [id].concat(AUSWEICH[id] || []), gewaehlt = null;
      for (var j = 0; j < kandidaten.length && gewaehlt === null; j++) {
        var f = dateiVon(kandidaten[j]);
        if (f && !benutzt[f]) { benutzt[f] = 1; gewaehlt = kandidaten[j]; }
      }
      out[i] = gewaehlt;
    });
    return out;
  }
  function profilSatz(P, p) {
    var teile = [];
    if (p.freund) teile.push(P.herkunft.freund);
    else if (p.online) teile.push(P.herkunft.online);
    else if (p.vorort) teile.push(P.herkunft.vorort);
    var m = MOTIVE.filter(function (k) { return p[k]; }).sort(function (a, b) { return p[b] - p[a]; }).slice(0, 2).map(function (k) { return P.motive[k]; });
    teile = teile.concat(m);
    if (!teile.length) return P.leer;
    var satz = teile.length > 1 ? teile.slice(0, -1).join(P.komma) + P.und + teile[teile.length - 1] : teile[0];
    return P.vor + satz + P.nach;
  }

  /* Fragen (offen, Auswahl nach Profil). Hier statt in tuer.js, damit Tür und Persona-Harness dieselbe Logik nutzen.
   * PR #38: feste Frage „lage“ (Lebensphase, tabufrei) nach dem Motiv; dafür eine Frage mehr (7). */
  var FRAGEN = [
    { id: 'herkunft', immer: true }, { id: 'motiv', immer: true }, { id: 'lage', immer: true },
    { id: 'sparen', wenn: 'sparen' }, { id: 'arbeit', wenn: 'arbeiten' }, { id: 'wohnen', wenn: 'wohnen' },
    { id: 'zweifel', wenn: 'skeptisch' }, { id: 'sinn', wenn: 'sinn' },
    { id: 'ort', immer: true }, { id: 'zeit', immer: true }
  ];
  var MAX_FRAGEN = 7;
  function naechsteFrage(st, fragen) {
    fragen = fragen || FRAGEN;
    if (st.gestellt.length >= MAX_FRAGEN) return null;
    var p = st.profil;
    var kandidaten = fragen.filter(function (f) { return st.gestellt.indexOf(f.id) === -1; });
    var vertiefung = kandidaten.filter(function (f) { return f.wenn && p[f.wenn]; })
      .sort(function (a, b) { return (p[b.wenn] || 0) - (p[a.wenn] || 0); })[0];
    var fest = kandidaten.filter(function (f) { return f.immer; });
    if (st.gestellt.length < 3) return fest[0];
    var rest = MAX_FRAGEN - st.gestellt.length;
    if (vertiefung && rest > fest.length) return vertiefung;
    return fest[0] || vertiefung || null;
  }

  var API = { WAHL: WAHL, WAHL_TEXT: WAHL_TEXT, wahlProfil: wahlProfil, FRAGEN: FRAGEN, MAX_FRAGEN: MAX_FRAGEN, naechsteFrage: naechsteFrage, SCHRITTE: SCHRITTE, BILDER: BILDER, MOTIVE: MOTIVE, grund: grund, norm: norm, merkmaleFuer: merkmaleFuer, auswerten: auswerten, pfadBauen: pfadBauen, bezugKey: bezugKey, bilderWaehlen: bilderWaehlen, profilSatz: profilSatz };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  wurzel.BTMM_TUER_PFAD = API;
})(typeof window !== 'undefined' ? window : globalThis);
