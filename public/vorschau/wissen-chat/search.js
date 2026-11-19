/* Extractive BtMM-Suche — kein LLM */
const STOP = new Set('und oder der die das ein eine ist sind was wie wer kann man bei für von mit den dem des sich nicht auch hat ich mich mir wir uns auf im in zu zur zum als ob wenn dann noch nur sehr mehr weniger alle alles einen einem einer'.split(' '))

function tokenize(q) {
  return q.toLowerCase().replace(/[?!.,;:„"“”()[\]{}]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))
}

export function searchChunks(query, chunks, limit = 6) {
  const words = tokenize(query)
  if (!words.length || !chunks?.length) return []
  const hits = []
  for (const ch of chunks) {
    const lower = (ch.text || '').toLowerCase()
    const head = (ch.abschnitt || '').toLowerCase()
    const title = (ch.title || '').toLowerCase()
    let score = 0
    for (const w of words) {
      const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}`, 'gi')
      const m = lower.match(re)
      if (m) score += m.length * 2
      if (lower.includes(w)) score += 1
      if (head.includes(w)) score += 5
      if (title.includes(w)) score += 3
    }
    if (score > 0) hits.push({ score, ...ch })
  }
  hits.sort((a, b) => b.score - a.score)
  const out = []
  const seen = new Set()
  for (const h of hits) {
    const k = `${h.rel}::${h.abschnitt}`
    if (seen.has(k)) continue
    seen.add(k)
    out.push(h)
    if (out.length >= limit) break
  }
  return out
}

export function formatAnswer(hits) {
  if (!hits.length) {
    return {
      html: '<p>Dazu habe ich in den freigegebenen BtMM-Texten nichts Passendes gefunden. Die Wissensbasis kann Lücken haben.</p>',
      quellen: [],
    }
  }
  const top = hits.slice(0, 3)
  let html
  if (top.length === 1 || top[0].score > (top[1]?.score || 0) * 1.8) {
    html = `<p>Aus „<strong>${esc(top[0].title)}</strong>“ (${esc(top[0].abschnitt)}):</p><p>${esc(top[0].text)}</p>`
  } else {
    html =
      '<p>Dazu finden sich mehrere Stellen:</p><ol>' +
      top
        .map(
          (h) =>
            `<li><strong>${esc(h.title)}</strong> — ${esc(h.abschnitt)}<br>${esc(h.text.slice(0, 360))}${h.text.length > 360 ? '…' : ''}</li>`
        )
        .join('') +
      '</ol>'
  }
  html += '<p class="klein leise">Entwurf/Vorschau · kann lückenhaft sein · keine Rechtsberatung. Kein LLM.</p>'
  return {
    html,
    quellen: top.map((h) => ({ dokument: h.title, abschnitt: h.abschnitt, pfad: h.rel })),
  }
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
