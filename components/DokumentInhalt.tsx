import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Serverkomponente: der Markdown-Text wird nicht an den Browser geschickt, nur das fertige HTML.
// Bilder mit relativem Pfad (z. B. ../explain/fig/*.png) liegen nicht im Repo und werden nicht gezeigt.
export function DokumentInhalt({ content }: { content: string }) {
  return (
    <div className="prose-btb dokument-text" style={{ maxWidth: 'none' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 style={{ fontFamily: 'var(--font-garamond)', color: 'var(--btb-rot)', fontSize: '1.9rem', margin: '2rem 0 1rem', lineHeight: 1.2 }}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontFamily: 'var(--font-garamond)', color: 'var(--btb-oliv)', fontSize: '1.45rem', margin: '2rem 0 0.75rem', lineHeight: 1.25 }}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontFamily: 'var(--font-garamond)', color: 'var(--btb-dunkel)', fontSize: '1.15rem', margin: '1.5rem 0 0.5rem' }}>{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 style={{ fontFamily: 'var(--font-garamond)', color: 'var(--btb-dunkel)', fontSize: '1rem', margin: '1.25rem 0 0.4rem' }}>{children}</h4>
          ),
          p: ({ children }) => <p style={{ marginBottom: '1rem', lineHeight: 1.75, color: 'var(--btb-dunkel)' }}>{children}</p>,
          ul: ({ children }) => <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyle: 'disc' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyle: 'decimal' }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: '0.4rem', lineHeight: 1.7 }}>{children}</li>,
          strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: '3px solid var(--btb-oliv)', background: 'rgba(0,0,0,0.04)', padding: '0.5rem 1rem', margin: '1rem 0', borderRadius: 4 }}>{children}</blockquote>
          ),
          a: ({ href, children }) => {
            const extern = !!href && /^https?:\/\//.test(href)
            return (
              <a href={href} style={{ color: 'var(--btb-oliv)', textDecoration: 'underline', overflowWrap: 'anywhere' }} {...(extern ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {children}
              </a>
            )
          },
          img: ({ src, alt }) =>
            typeof src === 'string' && /^(https?:)?\/\/|^\//.test(src) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ''} style={{ maxWidth: '100%', height: 'auto' }} />
            ) : null,
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '1rem 0', WebkitOverflowScrolling: 'touch' }} tabIndex={0} role="region" aria-label="Tabelle">
              <table style={{ borderCollapse: 'collapse', fontSize: '0.92rem', minWidth: '100%' }}>{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', borderBottom: '2px solid var(--btb-oliv)', verticalAlign: 'bottom' }}>{children}</th>
          ),
          td: ({ children }) => (
            <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(0,0,0,0.12)', verticalAlign: 'top', minWidth: 80 }}>{children}</td>
          ),
          code: ({ children }) => <code style={{ background: 'rgba(0,0,0,0.06)', padding: '0 0.25rem', borderRadius: 3, fontSize: '0.9em' }}>{children}</code>,
          pre: ({ children }) => (
            <pre style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.06)', padding: '0.75rem 1rem', borderRadius: 6, margin: '1rem 0', fontSize: '0.88rem' }}>{children}</pre>
          ),
          hr: () => <hr className="divider-btb" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
