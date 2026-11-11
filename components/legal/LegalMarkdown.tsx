import React from "react";

// Minimaler Markdown-Renderer für Rechtstexte (Überschriften, Listen, Tabellen,
// Absätze, **fett**, `code`, [Links](url)). Kein HTML aus dem Text wird ausgeführt.
function inline(text: string, key: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const k = `${key}-${i++}`;
    if (t.startsWith("**")) out.push(<strong key={k}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("`")) out.push(<code key={k}>{t.slice(1, -1)}</code>);
    else {
      const lm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(t)!;
      const href = /^(https?:|mailto:|\/|#)/.test(lm[2]) ? lm[2] : "#";
      out.push(<a key={k} href={href} className="underline">{lm[1]}</a>);
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Entfernt den internen Abschnitt "Kontext für Claude" bis zur ersten Trennlinie. */
export function stripInternal(md: string): string {
  return md.replace(/^## Kontext für Claude[\s\S]*?^---\s*$/m, "");
}

export function LegalMarkdown({ source }: { source: string }) {
  const lines = stripInternal(source).replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let b = 0;
  while (i < lines.length) {
    const line = lines[i];
    const k = `b${b++}`;
    if (!line.trim() || /^---+$/.test(line.trim())) { i++; continue; }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const lvl = h[1].length;
      const cls = lvl === 1 ? "text-3xl font-bold mb-6" : lvl === 2 ? "text-xl font-semibold mt-8 mb-3" : "text-lg font-semibold mt-6 mb-2";
      blocks.push(React.createElement(`h${lvl}`, { key: k, className: cls }, inline(h[2], k)));
      i++; continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ""));
      blocks.push(<ul key={k} className="list-disc pl-6 space-y-1 my-3">{items.map((t, j) => <li key={j}>{inline(t, `${k}-${j}`)}</li>)}</ul>);
      continue;
    }
    if (/^\s*\|/.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        const cells = lines[i++].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
      }
      const [head, ...body] = rows;
      blocks.push(
        <div key={k} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <thead><tr>{head.map((c, j) => <th key={j} className="border p-2 text-left">{inline(c, `${k}h${j}`)}</th>)}</tr></thead>
            <tbody>{body.map((r, ri) => <tr key={ri}>{r.map((c, j) => <td key={j} className="border p-2 align-top">{inline(c, `${k}${ri}-${j}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\s*[-*]\s|\s*\||---+$)/.test(lines[i])) para.push(lines[i++]);
    blocks.push(<p key={k} className="my-3">{inline(para.join(" "), k)}</p>);
  }
  return <div className="legal-markdown">{blocks}</div>;
}
