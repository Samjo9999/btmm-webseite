
import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, Send, X, Minus, User, Bot } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Message {
  role: 'user' | 'assistant'
  text: string
  timestamp: number
}

const STORAGE_KEY = 'btb-chat-messages'
const NAME_KEY = 'btb-chat-visitor-name'

const EDGE_URL =
  'https://xcngmshjuqoucdlgikao.supabase.co/functions/v1/website-agent'

const QUICK_ACTIONS = [
  'Was ist BtMM?',
  'Mitglied werden',
  'Kontakt',
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function loadMessages(): Message[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveMessages(msgs: Message[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs))
  } catch { /* quota exceeded – ignore */ }
}

function loadName(): string {
  try {
    return sessionStorage.getItem(NAME_KEY) ?? ''
  } catch {
    return ''
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [visitorName, setVisitorName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [greeted, setGreeted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* --- Hydrate from sessionStorage -------------------------------- */
  useEffect(() => {
    const stored = loadMessages()
    if (stored.length > 0) {
      setMessages(stored)
      setGreeted(true)
    }
    setVisitorName(loadName())
  }, [])

  /* --- Persist messages ------------------------------------------- */
  useEffect(() => {
    if (messages.length > 0) saveMessages(messages)
  }, [messages])

  /* --- Auto-scroll ------------------------------------------------ */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  /* --- Auto-greeting after 2 s ------------------------------------ */
  useEffect(() => {
    if (!open || greeted) return
    const timer = setTimeout(() => {
      const greeting: Message = {
        role: 'assistant',
        text: 'Hallo! Ich bin der BtMM Assistent. Wie kann ich dir helfen?',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, greeting])
      setGreeted(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [open, greeted])

  /* --- Focus input when opening ----------------------------------- */
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open, minimized])

  /* --- Send message ----------------------------------------------- */
  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return
    if (!text) setInput('')

    const userMsg: Message = { role: 'user', text: content, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frage: content,
          visitor_name: visitorName || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const reply: Message = {
          role: 'assistant',
          text: data.antwort ?? data.reply ?? data.message ?? 'Ich konnte leider keine Antwort finden.',
          timestamp: Date.now(),
        }
        setMessages(prev => [...prev, reply])
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: 'Entschuldigung, es gab ein technisches Problem. Bitte versuche es erneut.',
            timestamp: Date.now(),
          },
        ])
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Verbindungsproblem. Bitte versuche es erneut.',
          timestamp: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, visitorName])

  const hasUserMessage = messages.some(m => m.role === 'user')

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <>
      {/* ---- Floating bubble ---- */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Chat öffnen"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 50,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#2a7cab',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.08)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)'
          }}
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* ---- Chat window ---- */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 50,
            width: 'min(400px, calc(100vw - 32px))',
            height: minimized ? 'auto' : 'min(500px, calc(100vh - 48px))',
            borderRadius: 16,
            background: '#fff',
            boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* --- Header --- */}
          <div
            style={{
              background: '#2a7cab',
              color: '#fff',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexShrink: 0,
            }}
          >
            <Bot size={20} />
            <span
              style={{
                fontFamily: 'var(--font-garamond), "EB Garamond", Georgia, serif',
                fontWeight: 600,
                fontSize: '1.05rem',
                flex: 1,
              }}
            >
              BtMM Assistent
            </span>
            {/* Online dot */}
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#4ade80',
                display: 'inline-block',
                marginRight: 4,
              }}
            />
            <button
              onClick={() => setMinimized(!minimized)}
              aria-label="Minimieren"
              style={headerBtnStyle}
            >
              <Minus size={16} />
            </button>
            <button
              onClick={() => { setOpen(false); setMinimized(false) }}
              aria-label="Schließen"
              style={headerBtnStyle}
            >
              <X size={16} />
            </button>
          </div>

          {!minimized && (
            <>
              {/* --- Messages area --- */}
              <div
                ref={scrollRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  background: '#fafafa',
                }}
              >
                {/* Optional name input */}
                {!visitorName && !showNameInput && messages.length > 0 && !hasUserMessage && (
                  <button
                    onClick={() => setShowNameInput(true)}
                    style={{
                      alignSelf: 'center',
                      fontSize: '0.78rem',
                      color: '#2a7cab',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      opacity: 0.7,
                    }}
                  >
                    Deinen Namen eingeben (optional)
                  </button>
                )}

                {showNameInput && !visitorName && (
                  <div style={{ display: 'flex', gap: 6, alignSelf: 'center', marginBottom: 4 }}>
                    <input
                      type="text"
                      placeholder="Dein Name"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const name = e.currentTarget.value.trim()
                          setVisitorName(name)
                          sessionStorage.setItem(NAME_KEY, name)
                          setShowNameInput(false)
                        }
                      }}
                      style={{
                        padding: '0.35rem 0.6rem',
                        borderRadius: 6,
                        border: '1px solid #ddd',
                        fontSize: '0.82rem',
                        outline: 'none',
                        width: 140,
                      }}
                    />
                    <button
                      onClick={e => {
                        const inp = (e.currentTarget.previousElementSibling as HTMLInputElement)
                        if (inp?.value.trim()) {
                          setVisitorName(inp.value.trim())
                          sessionStorage.setItem(NAME_KEY, inp.value.trim())
                          setShowNameInput(false)
                        }
                      }}
                      style={{
                        padding: '0.35rem 0.6rem',
                        borderRadius: 6,
                        background: '#2a7cab',
                        color: '#fff',
                        border: 'none',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                      }}
                    >
                      OK
                    </button>
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '0.4rem',
                      alignItems: 'flex-start',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: msg.role === 'assistant' ? '#2a7cab' : '#b61818',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {msg.role === 'assistant' ? (
                        <Bot size={14} style={{ color: '#fff' }} />
                      ) : (
                        <User size={14} style={{ color: '#fff' }} />
                      )}
                    </div>
                    <div
                      style={{
                        background:
                          msg.role === 'assistant' ? '#f0e9b6' : 'rgba(42,124,171,0.15)',
                        borderRadius:
                          msg.role === 'assistant'
                            ? '4px 12px 12px 12px'
                            : '12px 4px 12px 12px',
                        padding: '0.55rem 0.8rem',
                        maxWidth: '80%',
                        fontSize: '0.88rem',
                        lineHeight: 1.6,
                        color: '#1a1a1a',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Quick actions (before first user message) */}
                {!hasUserMessage && greeted && !loading && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    {QUICK_ACTIONS.map(label => (
                      <button
                        key={label}
                        onClick={() => send(label)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: 20,
                          border: '1.5px solid #2a7cab',
                          background: '#fff',
                          color: '#2a7cab',
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          fontWeight: 500,
                          transition: 'background 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#2a7cab'
                          e.currentTarget.style.color = '#fff'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#fff'
                          e.currentTarget.style.color = '#2a7cab'
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Typing indicator */}
                {loading && (
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#2a7cab',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Bot size={14} style={{ color: '#fff' }} />
                    </div>
                    <div
                      style={{
                        background: '#f0e9b6',
                        borderRadius: '4px 12px 12px 12px',
                        padding: '0.55rem 0.8rem',
                        display: 'flex',
                        gap: 4,
                        alignItems: 'center',
                      }}
                    >
                      <span style={dotStyle(0)} />
                      <span style={dotStyle(1)} />
                      <span style={dotStyle(2)} />
                    </div>
                  </div>
                )}
              </div>

              {/* --- Input --- */}
              <div
                style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '0.6rem',
                  display: 'flex',
                  gap: '0.4rem',
                  background: '#fff',
                  flexShrink: 0,
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder={
                    visitorName
                      ? `Schreibe eine Nachricht, ${visitorName} …`
                      : 'Schreibe eine Nachricht …'
                  }
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    borderRadius: 8,
                    border: '1.5px solid #e0e0e0',
                    fontSize: '0.88rem',
                    outline: 'none',
                    color: '#1a1a1a',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  aria-label="Senden"
                  style={{
                    background: '#2a7cab',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.5rem 0.75rem',
                    cursor: loading || !input.trim() ? 'default' : 'pointer',
                    opacity: loading || !input.trim() ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.15s',
                  }}
                >
                  <Send size={16} />
                </button>
              </div>

              {/* --- Footer --- */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.3rem 0',
                  fontSize: '0.7rem',
                  color: '#999',
                  background: '#fff',
                  flexShrink: 0,
                }}
              >
                Powered by <strong style={{ color: '#2a7cab' }}>BtMM</strong>
              </div>
            </>
          )}
        </div>
      )}

      {/* --- Keyframe animation for typing dots --- */}
      <style>{`
        @keyframes btb-chat-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Inline style helpers                                               */
/* ------------------------------------------------------------------ */

const headerBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.15)',
  border: 'none',
  borderRadius: 6,
  color: '#fff',
  padding: 4,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

function dotStyle(index: number): React.CSSProperties {
  return {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#2a7cab',
    display: 'inline-block',
    animation: 'btb-chat-dot 1.4s infinite ease-in-out',
    animationDelay: `${index * 0.16}s`,
  }
}
