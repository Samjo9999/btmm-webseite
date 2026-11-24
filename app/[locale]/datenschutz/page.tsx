import type { Metadata } from 'next'
import { readFile } from 'fs/promises'
import path from 'path'
import { LegalMarkdown } from '@/components/legal/LegalMarkdown'

// ENTWURF vom Datenschutz-Bot – [OFFEN]/[VERANTWORTLICHER]-Platzhalter vor Livegang füllen.
export const metadata: Metadata = {
  title: 'Datenschutzerklärung – Back to Meaning Maximization',
  robots: { index: false },
}

export default async function DatenschutzPage() {
  const source = await readFile(path.join(process.cwd(), 'content', 'legal', 'datenschutz.md'), 'utf8')
  return (
    <section className="section" style={{ background: 'var(--btb-weiss)' }}>
      <div className="container-btb" style={{ maxWidth: 800 }}>
        <LegalMarkdown source={source} />
      </div>
    </section>
  )
}
