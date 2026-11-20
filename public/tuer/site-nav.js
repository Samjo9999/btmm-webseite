/* Gemeinsame Kopf-/Fußzeile der BtMM-Gesamtvorschau (Sp.139 / Prompt 113, Sp.140 Handy-Nav). */
(function (w) {
  var TUER_ICON = '<svg class="tuer-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 21V5.5A2.5 2.5 0 0 1 8.5 3h7A2.5 2.5 0 0 1 18 5.5V21" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 21h17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="14.6" cy="12.5" r="1.3" fill="currentColor"/></svg>';
  var BURGER_ICON = '<svg class="nav-burger-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="nav-burger-bars" d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path class="nav-burger-x" d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function links(basis) {
    var b = basis || '';
    return {
      start: b + 'index.html',
      tuer: b + 'index.html?tuer=1',
      alle: b + 'index.html#alle',
      seite: function (id) { return '/de/' + id; },
      bewertungen: '/de',
      leichte: '/de',
      weitersagen: '/de',
      barriere: '/de',
      sprache: '/de'
    };
  }

  function kopf(basis, aktiv) {
    var L = links(basis);
    var haupt = [
      { id: 'so-funktionierts', t: "So funktioniert's", href: L.seite('so-funktionierts') },
      { id: 'was-du-sparst', t: 'Was du sparst', href: L.seite('was-du-sparst') },
      { id: 'koerperarbeit', t: 'Körperarbeit', href: L.seite('koerperarbeit') },
      { id: 'faq', t: 'FAQ', href: L.seite('faq') },
      { id: 'mitmachen', t: 'Mitmachen', href: L.seite('mitmachen') },
      { id: 'bewertungen', t: 'Bewertungen', href: L.bewertungen }
    ];
    var lesen = [
      { id: 'einfach-erklaert', t: 'Einfach erklärt', href: L.seite('dokumente') + '#dok-00' },
      { id: 'konzept', t: 'Konzept', href: L.seite('konzept') },
      { id: 'dokumente', t: 'Dokumente', href: L.seite('dokumente') },
      { id: 'so-funktionierts', t: "So funktioniert's", href: L.seite('so-funktionierts') },
      { id: 'keim', t: 'Mitmachen im Keim', href: L.seite('dokumente') + '#dok-28' },
      { id: 'chronik', t: 'Chronik', href: L.seite('chronik') }
    ];
    var mehr = [
      { id: 'leichte-sprache', t: 'Leichte Sprache', href: L.leichte },
      { id: 'weitersagen', t: 'Weitersagen', href: L.weitersagen },
      { id: 'barrierefreiheit', t: 'Barrierefreiheit', href: L.barriere },
      { id: 'sprach-formular', t: 'Sprach-Eingabe', href: L.sprache },
      { id: 'alle', t: 'Alle Seiten', href: L.alle }
    ];
    function a(item) {
      return '<a href="' + esc(item.href) + '"' + (aktiv === item.id ? ' aria-current="page"' : '') + '>' + esc(item.t) + '</a>';
    }
    var lesenOpen = ['konzept', 'dokumente', 'chronik'].indexOf(aktiv) !== -1;
    var mehrOpen = mehr.some(function (x) { return x.id === aktiv; });
    return '<header class="kopf" id="kopf"><a class="marke" href="' + esc(L.start) + '"><img src="' + esc((basis || '') + 'bilder/logo.png') + '" alt=""><span>BtMM</span><span class="nur-sr">, Startseite</span></a>' +
      '<button type="button" class="nav-burger" id="nav-burger" aria-expanded="false" aria-controls="hauptnav">' + BURGER_ICON + '<span>Menü</span></button>' +
      '<nav id="hauptnav" aria-label="Hauptnavigation">' + haupt.map(a).join('') +
      '<details class="nav-mehr nav-lesen"' + (lesenOpen ? ' open' : '') + '><summary>Nachlesen</summary><div class="nav-mehr-liste">' + lesen.map(a).join('') + '</div></details>' +
      '<details class="nav-mehr"' + (mehrOpen ? ' open' : '') + '><summary>Mehr</summary><div class="nav-mehr-liste">' + mehr.map(a).join('') + '</div></details></nav>' +
      '<a class="knopf zweit klein tuer-klein" href="' + esc(L.tuer) + '" aria-label="Tür öffnen" title="Willkommensfragen starten">' + TUER_ICON + '<span>Tür öffnen</span></a></header>';
  }

  function fuss(basis) {
    var L = links(basis);
    function g(title, items) {
      return '<div class="fuss-gruppe"><p class="fuss-label">' + esc(title) + '</p><p>' + items.map(function (x) {
        return '<a href="' + esc(x.href) + '">' + esc(x.t) + '</a>';
      }).join('') + '</p></div>';
    }
    return '<footer class="fuss" id="fuss">' +
      '<p class="fuss-slogan">BtMM – wirtschaften auf Augenhöhe</p>' +
      '<div class="fuss-raster">' +
      g('Verstehen', [
        { t: "So funktioniert's", href: L.seite('so-funktionierts') },
        { t: 'Konzept', href: L.seite('konzept') },
        { t: 'FAQ', href: L.seite('faq') },
        { t: 'Leichte Sprache', href: L.leichte },
        { t: 'Barrierefreiheit', href: L.barriere },
        { t: 'Dokumente', href: L.seite('dokumente') },
        { t: 'Chronik', href: L.seite('chronik') },
        { t: 'Offene Fragen', href: L.seite('offene-fragen') }
      ]) +
      g('Alltag', [
        { t: 'Was du sparst', href: L.seite('was-du-sparst') },
        { t: 'Kosten', href: L.seite('kosten') },
        { t: 'Körperarbeit', href: L.seite('koerperarbeit') },
        { t: 'Zellen', href: L.seite('zellen') },
        { t: 'Geldfluss', href: L.seite('geldfluss') }
      ]) +
      g('Mitwirken', [
        { t: 'Mitmachen', href: L.seite('mitmachen') },
        { t: 'Unterstützen', href: L.seite('unterstuetzen') },
        { t: 'Gründung', href: L.seite('gruendung') },
        { t: 'Weitersagen', href: L.weitersagen },
        { t: 'Bewertungen & Feedback', href: L.bewertungen },
        { t: 'Sprach-Eingabe', href: L.sprache },
        { t: 'Ankommen (Tür)', href: L.tuer }
      ]) +
      '</div>' +
      '<p>Back to Meaning Maximization (BtMM) · Freiburg · Keim, noch nicht eingetragen · <a href="mailto:office@b-t-m-m.com">office@b-t-m-m.com</a></p>' +
      '<p class="fein">Vorschau 18. November 2026 · noindex · kein Live auf b-t-m-m.com</p></footer>';
  }

  function setNavOpen(header, open) {
    if (!header) return;
    header.classList.toggle('nav-offen', !!open);
    var btn = header.querySelector('.nav-burger');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function bindNav() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.nav-burger');
      if (btn) {
        var header = btn.closest('header.kopf');
        setNavOpen(header, btn.getAttribute('aria-expanded') !== 'true');
        return;
      }
      var header = e.target.closest && e.target.closest('header.kopf');
      if (!header) {
        document.querySelectorAll('header.kopf.nav-offen').forEach(function (h) { setNavOpen(h, false); });
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' && e.key !== 'Esc') return;
      document.querySelectorAll('header.kopf.nav-offen').forEach(function (h) {
        setNavOpen(h, false);
        var btn = h.querySelector('.nav-burger');
        if (btn) btn.focus();
      });
    });
    w.addEventListener('resize', function () {
      if (w.matchMedia && w.matchMedia('(min-width: 768px)').matches) {
        document.querySelectorAll('header.kopf.nav-offen').forEach(function (h) { setNavOpen(h, false); });
      }
    });
  }

  function mount() {
    var body = document.body;
    if (!body) return;
    var basis = body.getAttribute('data-basis') || '';
    var aktiv = body.getAttribute('data-id') || '';
    var hk = document.getElementById('site-kopf') || document.getElementById('kopf');
    var ff = document.getElementById('site-fuss') || document.getElementById('fuss');
    if (hk) hk.outerHTML = kopf(basis, aktiv);
    if (ff) ff.outerHTML = fuss(basis);
  }

  w.btmmKopf = kopf;
  w.btmmFuss = fuss;
  w.btmmNavMount = mount;
  w.btmmNavLinks = links;

  function maybeMount() {
    if (document.body && document.body.getAttribute('data-nav') === 'site') mount();
  }
  bindNav();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', maybeMount);
  else maybeMount();
})(window);
