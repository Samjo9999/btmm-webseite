#!/usr/bin/env node
/**
 * BtMM Wissens-MCP (stdio) — Corpus: intern (voll), extractive.
 * Generative / WISSEN_LLM_ENABLED: absichtlich nicht eingebunden.
 */
let Server, StdioServerTransport, CallToolRequestSchema, ListToolsRequestSchema
try {
  ;({ Server } = await import('@modelcontextprotocol/sdk/server/index.js'))
  ;({ StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js'))
  ;({ CallToolRequestSchema, ListToolsRequestSchema } = await import('@modelcontextprotocol/sdk/types.js'))
} catch (err) {
  console.error('MCP-SDK nicht installiert (optional). npm install im Paket packages/wissen-mcp')
  console.error(String(err?.message || err))
  process.exit(1)
}
import { loadDocs } from '../src/corpus.mjs'
import { searchDocs } from '../src/search.mjs'

const { docs } = loadDocs('internal')

const server = new Server(
  { name: 'btmm-wissen', version: '0.2.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_docs',
      description: 'Listet alle indexierten BtMM-Dokumente (interner Corpus).',
      inputSchema: {
        type: 'object',
        properties: {
          tier: { type: 'string', enum: ['public', 'mitmacher', 'internal'] },
        },
      },
    },
    {
      name: 'search',
      description: 'Keyword-Suche im BtMM-Corpus (extractive, kein LLM).',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          tier: { type: 'string', enum: ['public', 'mitmacher', 'internal'] },
          limit: { type: 'number' },
        },
        required: ['query'],
      },
    },
    {
      name: 'read',
      description: 'Liest ein Dokument vollständig anhand id/rel-Pfad.',
      inputSchema: {
        type: 'object',
        properties: { path_or_id: { type: 'string' } },
        required: ['path_or_id'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const name = req.params.name
  const args = req.params.arguments || {}
  if (name === 'list_docs') {
    let list = docs
    if (args.tier === 'public') list = docs.filter((d) => d.tier === 'public')
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            list.map((d) => ({ id: d.id, title: d.title, tier: d.tier, source: d.source, mtime: d.mtime })),
            null,
            2
          ),
        },
      ],
    }
  }
  if (name === 'search') {
    const tier = args.tier === 'public' ? 'public' : 'internal'
    const pool = tier === 'public' ? docs.filter((d) => d.tier === 'public') : docs
    const hits = searchDocs(String(args.query || ''), pool, { limit: Number(args.limit) || 8 })
    return { content: [{ type: 'text', text: JSON.stringify(hits, null, 2) }] }
  }
  if (name === 'read') {
    const key = String(args.path_or_id || '')
    const doc = docs.find((d) => d.id === key || d.rel === key || d.path === key || d.rel.endsWith(key))
    if (!doc) {
      return { content: [{ type: 'text', text: `Nicht gefunden: ${key}` }], isError: true }
    }
    return {
      content: [
        {
          type: 'text',
          text: `# ${doc.title}\n\nPfad: ${doc.rel}\nQuelle: ${doc.source}\nTier: ${doc.tier}\n\n${doc.content}`,
        },
      ],
    }
  }
  return { content: [{ type: 'text', text: `Unbekanntes Tool: ${name}` }], isError: true }
})

const transport = new StdioServerTransport()
await server.connect(transport)
