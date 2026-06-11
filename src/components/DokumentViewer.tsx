
import ReactMarkdown from 'react-markdown'

export function DokumentViewer({ content }: { content: string }) {
  return (
    <div className="prose-btb" style={{ maxWidth: 'none' }}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 style={{
              fontFamily: 'var(--font-garamond)',
              color: 'var(--btb-rot)',
              fontSize: '1.75rem',
              marginBottom: '1rem',
              marginTop: '0',
            }}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 style={{
              fontFamily: 'var(--font-garamond)',
              color: 'var(--btb-oliv)',
              fontSize: '1.35rem',
              marginBottom: '0.75rem',
              marginTop: '2rem',
            }}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 style={{
              fontFamily: 'var(--font-garamond)',
              color: 'var(--btb-dunkel)',
              fontSize: '1.1rem',
              marginBottom: '0.5rem',
              marginTop: '1.5rem',
            }}>{children}</h3>
          ),
          p: ({ children }) => (
            <p style={{
              marginBottom: '1rem',
              lineHeight: 1.8,
              color: 'var(--btb-dunkel)',
            }}>{children}</p>
          ),
          ul: ({ children }) => (
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>{children}</ol>
          ),
          li: ({ children }) => (
            <li style={{ marginBottom: '0.4rem', lineHeight: 1.7 }}>{children}</li>
          ),
          strong: ({ children }) => (
            <strong style={{ fontWeight: 700, color: 'var(--btb-dunkel)' }}>{children}</strong>
          ),
          hr: () => <hr className="divider-btb" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
