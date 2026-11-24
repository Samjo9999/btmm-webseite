/**
 * Schwebender „Mehr erfahren“-Knopf für statische Seiten unter public/.
 * Logik identisch mit lib/mehr-erfahren.mjs (ScrollHint aus beb1d8e / #39, erweitert).
 */
(function () {
  var ENDE = 80
  var KOPF = 96
  var LABELS = {
    de: 'Mehr erfahren', en: 'Learn more', zh: '了解更多', es: 'Más información',
    hi: 'और जानें', ar: 'اعرف المزيد', bn: 'আরও জানুন', pt: 'Saiba mais',
    ru: 'Узнать больше', ja: '詳しく見る', fr: 'En savoir plus'
  }
  var ARIA = {
    de: 'Mehr erfahren, weiter nach unten scrollen', en: 'Learn more, scroll down',
    zh: '了解更多，向下滚动', es: 'Más información, bajar en la página',
    hi: 'और जानें, नीचे स्क्रॉल करें', ar: 'اعرف المزيد، مرّر إلى الأسفل',
    bn: 'আরও জানুন, নিচে স্ক্রোল করুন', pt: 'Saiba mais, rolar para baixo',
    ru: 'Узнать больше, прокрутить вниз', ja: '詳しく見る、下にスクロール',
    fr: 'En savoir plus, défiler vers le bas'
  }
  function lang() {
    var l = (document.documentElement.lang || 'de').slice(0, 2).toLowerCase()
    return l
  }
  function label() { return LABELS[lang()] || LABELS.de }
  function aria() { return ARIA[lang()] || ARIA.de }
  function sollSichtbar(s) {
    if (s.gesperrt) return false
    if (!(s.scrollHeight > s.innerHeight + 1)) return false
    return !(s.innerHeight + s.scrollY >= s.scrollHeight - ENDE)
  }
  function reduced() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch (e) { return false }
  }
  function tops() {
    var y = window.scrollY
    var list = document.querySelectorAll('main h2, main section, main .btmm-abschnitt, main .btmm-kopf, [data-mehr-erfahren-abschnitt], footer')
    var out = []
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect()
      if (r.height >= 24) out.push(r.top + y)
    }
    return out
  }
  function naechster(s) {
    var max = Math.max(0, s.scrollHeight - s.innerHeight)
    var list = (s.abschnittTops || []).slice().sort(function (a, b) { return a - b })
    for (var i = 0; i < list.length; i++) {
      if (list[i] - KOPF > s.scrollY + 48) return Math.min(max, Math.max(0, list[i] - KOPF))
    }
    return Math.min(max, s.scrollY + Math.round(s.innerHeight * 0.8))
  }
  function liftFuer(knopf) {
    var iw = window.innerWidth, ih = window.innerHeight
    var all = document.querySelectorAll('body *')
    var lift = 0
    for (var i = 0; i < all.length; i++) {
      var el = all[i]
      if (el === knopf || (knopf && knopf.contains(el))) continue
      if (el.closest && el.closest('[data-scroll-hint]')) continue
      var st = window.getComputedStyle(el)
      if (st.position !== 'fixed' && st.position !== 'sticky') continue
      if (st.display === 'none' || st.visibility === 'hidden') continue
      var r = el.getBoundingClientRect()
      if (!(r.height > 0) || r.top > ih - 8) continue
      if (r.top + r.height < ih - 8) continue
      if (r.left > iw * 0.5) continue
      if (r.width > iw * 0.35) lift = Math.max(lift, ih - r.top)
    }
    return lift
  }
  function einbinden() {
    if (document.querySelector('[data-scroll-hint]')) return
    var link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/mehr-erfahren.css'
    document.head.appendChild(link)
    var knopf = document.createElement('button')
    knopf.type = 'button'
    knopf.setAttribute('data-scroll-hint', '')
    knopf.hidden = true
    knopf.innerHTML = '<span></span><svg class="mehr-erfahren-pfeil" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>'
    knopf.querySelector('span').textContent = label()
    knopf.setAttribute('aria-label', aria())
    document.body.appendChild(knopf)
    function pruefen() {
      var gesperrt = document.body.classList.contains('pfad-leiste-an')
      var an = sollSichtbar({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
        scrollY: window.scrollY,
        gesperrt: gesperrt
      })
      knopf.hidden = !an
      knopf.setAttribute('aria-hidden', an ? 'false' : 'true')
      knopf.tabIndex = an ? 0 : -1
      if (an) {
        var lift = liftFuer(knopf)
        knopf.style.visibility = 'hidden'
        var br = knopf.getBoundingClientRect()
        var treffer = document.elementFromPoint(br.left + br.width / 2, window.innerHeight - 8)
        var fuss = treffer && treffer.closest ? treffer.closest('footer') : null
        if (fuss) {
          var top = fuss.getBoundingClientRect().top
          if (top < window.innerHeight) lift = Math.max(lift, window.innerHeight - top + 8)
        }
        knopf.style.visibility = 'visible'
        knopf.style.setProperty('--mehr-erfahren-lift', lift > 0 ? lift + 'px' : '0px')
      }
    }
    knopf.addEventListener('click', function () {
      var y = naechster({
        scrollY: window.scrollY,
        innerHeight: window.innerHeight,
        scrollHeight: document.documentElement.scrollHeight,
        abschnittTops: tops()
      })
      window.scrollTo({ top: y, behavior: reduced() ? 'auto' : 'smooth' })
    })
    pruefen()
    window.addEventListener('scroll', pruefen, { passive: true })
    window.addEventListener('resize', pruefen, { passive: true })
    window.addEventListener('load', pruefen)
    var to
    function spaet() { clearTimeout(to); to = setTimeout(pruefen, 80) }
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(spaet).observe(document.documentElement)
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var t = muts[i].target
          if (!(t && t.closest && t.closest('[data-scroll-hint]'))) { spaet(); return }
        }
      }).observe(document.body, {
        childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden']
      })
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', einbinden)
  else einbinden()
})()
