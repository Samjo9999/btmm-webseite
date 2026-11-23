/* BtMM Tür: Profil → individueller Kennenlern-Pfad (reine Logik, ohne DOM; auch im Unit-Test genutzt).
 * Nutzer 21.11.2026 00:35: „Der bot soll den Pfad nicht für mich anlegen sondern der Pfad passt sich individuell an den Nutzer an“.
 * Auswahl, Reihenfolge, Bezugssätze und Bilder der Schritte ergeben sich aus dem Profil (Schlagwort-Treffer), es gibt keine Standardroute.
 * Regelbasiert, kein LLM. */
(function (wurzel) {
  'use strict';
  // Deutsche Wörter, die in anderen Sprachen oft etwas anderes bedeuten, nicht als Rückfall nutzen.
  var RUECKFALL_AUS = ['region', 'firma', 'social', 'auto', 'chor', 'stelle', 'haus', 'abend', 'lesen'];
  var MOTIVE = ['neugierig', 'skeptisch', 'sparen', 'arbeiten', 'wohnen', 'sinn', 'gruenden', 'kunde', 'einstieg', 'lebensphase'];

  /* Schritte: Pfad ohne Locale, Standardbild */
  var SCHRITTE = {
    grundlagen: { href: '/so-funktionierts', bild: 'unendlichGold' },
    sparen:     { href: '/was-du-sparst', bild: 'kreis' },
    arbeiten:   { href: '/konzept/wirtschaft', bild: 'baumDunkel' },
    wohnen:     { href: '/konzept', bild: 'baumHell' },
    skeptisch:  { href: '/faq', bild: 'unendlichDunkel' },
    dokumente:  { href: '/dokumente', bild: 'logo' },
    sinn:       { href: '/wissen', bild: 'baumHell' },
    gruenden:   { href: '/gruendung', bild: 'baumHell' },
    freiburg:   { href: '/gruendung', bild: 'baumDunkel' },
    vorbei:     { href: '/mitmachen', bild: 'kreis' },
    anpacken:   { href: '/mitmachen', bild: 'kreis' },
    folgen:     { href: '/chronik', bild: 'logo' },
    /* PR #38: Gruppen ohne eigenen Pfad, Inhalte unter /fuer-dich/* */
    kunde:      { href: '/fuer-dich/kunden', bild: 'kreis' },
    einstieg:   { href: '/fuer-dich/berufseinstieg', bild: 'baumHell' },
    lebensphase:{ href: '/fuer-dich/lebensphasen', bild: 'unendlichGold' }
  };
  /* Nur Bilder, die schon im Repo (public/) liegen */
  var BILDER = {
    unendlichGold: { src: '/infinity-gold.png' }, unendlichDunkel: { src: '/infinity-dark.png' },
    kreis: { src: '/logo-hero-white.png', dunkel: true }, baumDunkel: { src: '/logo-tree-dark.png' },
    baumHell: { src: '/logo-tree-light.png', dunkel: true }, logo: { src: '/logo.png' }
  };
  /* Bild nach dem Merkmal, das den Schritt begründet */
  var BILD_NACH_MERKMAL = {
    start: 'unendlichGold', neugierig: 'unendlichGold', freund: 'baumHell', online: 'logo', skeptisch: 'unendlichDunkel',
    sparen: 'kreis', arbeiten: 'baumDunkel', wohnen: 'baumHell', sinn: 'baumHell', gruenden: 'baumHell',
    freiburg: 'baumDunkel', weit: 'logo', vorbei: 'kreis', anpacken: 'kreis', nurlesen: 'logo', dranbleiben: 'unendlichDunkel',
    kunde: 'kreis', einstieg: 'baumHell', lebensphase: 'unendlichGold'
  };

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
    return M;
  }
  function auswerten(M, text) {
    var t = norm(text), treffer = {};
    Object.keys(M).forEach(function (k) {
      M[k].forEach(function (w) { if (t.indexOf(w) !== -1) treffer[k] = (treffer[k] || 0) + 1; });
    });
    return treffer;
  }

  /* Profil → Schrittfolge. Jeder Kandidat bekommt eine Gewichtung aus dem Profil; sortiert wird absteigend.
   * Bindung (anpacken / vorbei / folgen) steht immer am Ende. */
  var REIHE = ['skeptisch', 'grundlagen', 'kunde', 'sparen', 'arbeiten', 'einstieg', 'wohnen', 'sinn', 'lebensphase', 'dokumente', 'freiburg', 'gruenden'];
  function pfadBauen(p) {
    p = p || {};
    var w = {};
    var nurGruenden = p.gruenden && !p.neugierig && !p.skeptisch;
    if (!nurGruenden) w.grundlagen = 2 + 2 * (p.neugierig || 0) + (p.freund ? 1 : 0);
    ['sparen', 'arbeiten', 'wohnen', 'sinn', 'kunde', 'einstieg'].forEach(function (m) { if (p[m]) w[m] = 3 * p[m]; });
    if (p.lebensphase) w.lebensphase = 2 * p.lebensphase;
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
  /* Bild je Schritt nach Merkmal; doppelte Bilder im selben Weg vermeiden */
  function bilderWaehlen(keys, p) {
    var benutzt = {};
    return keys.map(function (k) {
      var wahl = [BILD_NACH_MERKMAL[bezugKey(k, p)], SCHRITTE[k].bild].concat(Object.keys(BILDER));
      for (var i = 0; i < wahl.length; i++) if (wahl[i] && !benutzt[wahl[i]]) { benutzt[wahl[i]] = 1; return wahl[i]; }
      return SCHRITTE[k].bild;
    });
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

  var API = { FRAGEN: FRAGEN, MAX_FRAGEN: MAX_FRAGEN, naechsteFrage: naechsteFrage, SCHRITTE: SCHRITTE, BILDER: BILDER, MOTIVE: MOTIVE, grund: grund, norm: norm, merkmaleFuer: merkmaleFuer, auswerten: auswerten, pfadBauen: pfadBauen, bezugKey: bezugKey, bilderWaehlen: bilderWaehlen, profilSatz: profilSatz };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  wurzel.BTMM_TUER_PFAD = API;
})(typeof window !== 'undefined' ? window : globalThis);
