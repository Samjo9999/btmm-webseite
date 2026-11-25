import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = join(process.cwd(), 'public/vorschau/bewertung-chat-feedback')

test('Sp.134 Vorschau-Ordner existiert', () => {
  assert.equal(existsSync(join(root, 'index.html')), true)
  assert.equal(existsSync(join(root, 'bewertungen.html')), true)
  assert.equal(existsSync(join(root, 'feedback-gesperrt.html')), true)
  assert.equal(existsSync(join(root, 'feedback.html')), true)
  assert.equal(existsSync(join(root, 'ki-chat.html')), true)
  assert.equal(existsSync(join(root, 'text-stufen.html')), true)
})

test('01 Bewertungen: Sync-Zeile Autor/Design-Nachtrag', () => {
  const html = readFileSync(join(root, 'bewertungen.html'), 'utf8')
  assert.match(html, /Lesen ist öffentlich\. Schreiben ist kein Self-Service\./)
  assert.match(html, /noindex/)
  assert.match(html, /mailto:office@b-t-m-m\.com/)
  assert.match(html, /PLATZHALTER/)
})

test('Feedback-Gate: gesperrt + Mock-Zustände ohne Auth', () => {
  const gesperrt = readFileSync(join(root, 'feedback-gesperrt.html'), 'utf8')
  const frei = readFileSync(join(root, 'feedback.html'), 'utf8')
  assert.match(gesperrt, /Schreiben nur nach Melde dich/)
  assert.match(gesperrt, /mailto:office@b-t-m-m\.com/)
  assert.match(gesperrt, /Kein .Anmelden. \/ .Konto erstellen. hier/)
  assert.match(frei, /Freigeschaltet/)
  assert.match(frei, /Eingereicht · KI-Prüfung/)
})

test('03c/03d KI-Prüfung Mock: läuft / ok / abgelehnt, keine echte API', () => {
  const html = readFileSync(join(root, 'feedback.html'), 'utf8')
  assert.match(html, /Eingereicht · KI-Prüfung läuft/)
  assert.match(html, /KI-Prüfung: ok/)
  assert.match(html, /KI-Prüfung: nicht freigegeben/)
  assert.match(html, /ki-abgelehnt/)
  assert.match(html, /keine echte API/)
  assert.match(html, /kein Moderator-Dashboard|Kein Moderator-UI|Kein Admin-Dashboard/)
  assert.equal(existsSync(join(root, '_screens/03c-feedback-eingereicht-1440x900.png')), true)
  assert.equal(existsSync(join(root, '_screens/03d-feedback-ki-ok-1440x900.png')), true)
  assert.equal(existsSync(join(root, '_screens/03d-feedback-ki-abgelehnt-1440x900.png')), true)
})

test('KI-Chat Preview: Mock, keine Live-API', () => {
  const html = readFileSync(join(root, 'ki-chat.html'), 'utf8')
  assert.match(html, /keine Live-API|keine echte KI-API|keine API|kein LLM-API/i)
  assert.match(html, /disabled/)
})
