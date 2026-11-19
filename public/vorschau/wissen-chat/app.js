(function () {
  const STOP = new Set('und oder der die das ein eine ist sind was wie wer kann man bei für von mit den dem des sich nicht auch hat ich mich mir wir uns auf im in zu zur zum als ob wenn dann noch nur sehr mehr weniger alle alles einen einem einer'.split(' '))
  function tokenize(q) {
    return q.toLowerCase().replace(/[?!.,;:„"“”()[\]{}]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))
  }
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  }
  function searchChunks(query, chunks, limit) {
    const words = tokenize(query)
    if (!words.length) return []
    const hits = []
    for (const ch of chunks) {
      const lower = (ch.text || '').toLowerCase()
      const head = (ch.abschnitt || '').toLowerCase()
      const title = (ch.title || '').toLowerCase()
      let score = 0
      for (const w of words) {
        try {
          const re = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
          const m = lower.match(re)
          if (m) score += m.length * 2
        } catch (_) {}
        if (lower.includes(w)) score += 1
        if (head.includes(w)) score += 5
        if (title.includes(w)) score += 3
      }
      if (score > 0) hits.push(Object.assign({ score: score }, ch))
    }
    hits.sort(function (a, b) { return b.score - a.score })
    const out = [], seen = {}
    for (let i = 0; i < hits.length; i++) {
      const h = hits[i]
      const k = h.rel + '::' + h.abschnitt
      if (seen[k]) continue
      seen[k] = 1
      out.push(h)
      if (out.length >= limit) break
    }
    return out
  }

  let chunks = []
  let docCount = 0
  const verlauf = document.getElementById('chat-verlauf')
  const form = document.getElementById('chat-form')
  const input = document.getElementById('chat-in')
  const meta = document.getElementById('index-meta')
  const btn = document.getElementById('chat-send')

  function addBlase(role, html, quellen) {
    const div = document.createElement('div')
    div.className = 'blase ' + role
    const metaEl = document.createElement('span')
    metaEl.className = 'meta'
    metaEl.textContent = role === 'bot' ? 'BtMM-Wissen · extractive' : 'Du'
    div.appendChild(metaEl)
    const body = document.createElement('div')
    body.innerHTML = html
    div.appendChild(body)
    if (quellen && quellen.length) {
      const q = document.createElement('p')
      q.className = 'quellen'
      q.textContent = 'Quellen: ' + quellen.map(function (x) {
        return x.dokument + (x.abschnitt ? ' · ' + x.abschnitt : '') + (x.pfad ? ' (' + x.pfad + ')' : '')
      }).join(' · ')
      div.appendChild(q)
    }
    verlauf.appendChild(div)
    verlauf.scrollTop = verlauf.scrollHeight
  }

  function answer(hits) {
    if (!hits.length) {
      return { html: '<p>Dazu nichts Passendes in den freigegebenen Texten. Wissensbasis kann Lücken haben.</p>', quellen: [] }
    }
    const top = hits.slice(0, 3)
    let html
    if (top.length === 1 || top[0].score > (top[1] ? top[1].score : 0) * 1.8) {
      html = '<p>Aus „<strong>' + esc(top[0].title) + '</strong>“ (' + esc(top[0].abschnitt) + '):</p><p>' + esc(top[0].text) + '</p>'
    } else {
      html = '<p>Dazu finden sich mehrere Stellen:</p><ol>' + top.map(function (h) {
        return '<li><strong>' + esc(h.title) + '</strong> — ' + esc(h.abschnitt) + '<br>' + esc(h.text.slice(0, 360)) + (h.text.length > 360 ? '…' : '') + '</li>'
      }).join('') + '</ol>'
    }
    html += '<p style="font-size:.9rem;opacity:.75;margin-top:.6em">Entwurf/Vorschau · kann lückenhaft sein · keine Rechtsberatung. Kein LLM.</p>'
    return {
      html: html,
      quellen: top.map(function (h) { return { dokument: h.title, abschnitt: h.abschnitt, pfad: h.rel } })
    }
  }

  fetch('index-public.json')
    .then(function (r) { return r.json() })
    .then(function (data) {
      chunks = data.chunks || []
      docCount = data.docCount || 0
      if (meta) meta.textContent = docCount + ' Docs · ' + chunks.length + ' Abschnitte · gebaut ' + (data.builtAt || '').slice(0, 16).replace('T', ' ') + ' UTC'
      if (btn) { btn.disabled = false; btn.classList.remove('is-disabled') }
      if (input) input.disabled = false
    })
    .catch(function (e) {
      if (meta) meta.textContent = 'Index konnte nicht geladen werden.'
      addBlase('bot', '<p>Index-Fehler: ' + esc(String(e)) + '</p>')
    })

  form.addEventListener('submit', function (ev) {
    ev.preventDefault()
    const q = (input.value || '').trim()
    if (q.length < 2) return
    addBlase('user', '<p>' + esc(q) + '</p>')
    input.value = ''
    const hits = searchChunks(q, chunks, 6)
    const a = answer(hits)
    addBlase('bot', a.html, a.quellen)
  })
})()
