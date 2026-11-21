/* BtMM Tür: Profil → individueller Kennenlern-Pfad (reine Logik, ohne DOM; auch im Unit-Test genutzt).
 * Nutzer 21.11.2026 00:35: „Der bot soll den Pfad nicht für mich anlegen sondern der Pfad passt sich individuell an den Nutzer an“.
 * Auswahl, Reihenfolge, Bezugssätze und Bilder der Schritte ergeben sich aus dem Profil (Schlagwort-Treffer), es gibt keine Standardroute.
 * Regelbasiert, kein LLM. */
(function (wurzel) {
  'use strict';
  // Deutsche Wörter, die in anderen Sprachen oft etwas anderes bedeuten, nicht als Rückfall nutzen.
  var RUECKFALL_AUS = ['region', 'firma', 'social', 'auto', 'chor', 'stelle', 'haus', 'abend', 'lesen'];
  var MOTIVE = ['neugierig', 'skeptisch', 'sparen', 'arbeiten', 'wohnen', 'sinn', 'gruenden'];

  /* Schritte: Pfad ohne Locale. Jeder Schritt hat seine eigene gemalte Grafik (Nutzer 21.11.2026 01:20:
   * „Liebe nicht die silhouetten neben. Lieber eigene Grafiken“; Herkunft: Design-Bot, HERKUNFT.md). */
  var SCHRITTE = {
    grundlagen: { href: '/so-funktionierts', bild: 'grundlagen' },
    sparen:     { href: '/was-du-sparst', bild: 'sparen' },
    arbeiten:   { href: '/zellen', bild: 'arbeiten' },
    wohnen:     { href: '/konzept', bild: 'wohnen' },
    skeptisch:  { href: '/faq', bild: 'skeptisch' },
    dokumente:  { href: '/dokumente', bild: 'dokumente' },
    sinn:       { href: '/wissen', bild: 'sinn' },
    gruenden:   { href: '/gruendung', bild: 'gruenden' },
    freiburg:   { href: '/gruendung', bild: 'freiburg' },
    vorbei:     { href: '/mitmachen', bild: 'vorbei' },
    anpacken:   { href: '/mitmachen', bild: 'anpacken' },
    folgen:     { href: '/chronik', bild: 'folgen' }
  };
  /* Grafiken 16:9 als webp in zwei Breiten (720 für Handy, 1280 für Desktop/DPR 2) */
  var BILDER = {};
  Object.keys(SCHRITTE).forEach(function (k) {
    BILDER[k] = { src: '/tuer/bilder/weg/' + k + '-720.webp', gross: '/tuer/bilder/weg/' + k + '-1280.webp' };
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
  var REIHE = ['skeptisch', 'grundlagen', 'sparen', 'arbeiten', 'wohnen', 'sinn', 'dokumente', 'freiburg', 'gruenden'];
  function pfadBauen(p) {
    p = p || {};
    var w = {};
    var nurGruenden = p.gruenden && !p.neugierig && !p.skeptisch;
    if (!nurGruenden) w.grundlagen = 2 + 2 * (p.neugierig || 0) + (p.freund ? 1 : 0);
    ['sparen', 'arbeiten', 'wohnen', 'sinn'].forEach(function (m) { if (p[m]) w[m] = 3 * p[m]; });
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
  /* Bild je Schritt: die eigene Grafik des Schritts (Schritte sind im Weg eindeutig, also keine Doppelung) */
  function bilderWaehlen(keys) {
    return keys.map(function (k) { return SCHRITTE[k].bild; });
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

  var API = { SCHRITTE: SCHRITTE, BILDER: BILDER, MOTIVE: MOTIVE, grund: grund, norm: norm, merkmaleFuer: merkmaleFuer, auswerten: auswerten, pfadBauen: pfadBauen, bezugKey: bezugKey, bilderWaehlen: bilderWaehlen, profilSatz: profilSatz };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  wurzel.BTMM_TUER_PFAD = API;
})(typeof window !== 'undefined' ? window : globalThis);
