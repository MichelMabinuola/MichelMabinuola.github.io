import { Fragment } from 'react'

// Just enough Markdown for /llms.txt: ## and ### headings, "- " lists, paragraphs,
// **bold**, *italic*, `code` and [links](url). No HTML is ever passed through.
type Block = { kind: 'h2' | 'h3' | 'p'; text: string } | { kind: 'ul'; items: string[] }

export function parseBlocks(md: string): Block[] {
  const blocks: Block[] = []
  for (const chunk of md.trim().split(/\n\s*\n/)) {
    const lines = chunk.split('\n')
    if (lines[0].startsWith('### ')) blocks.push({ kind: 'h3', text: lines[0].slice(4) })
    else if (lines[0].startsWith('## ')) blocks.push({ kind: 'h2', text: lines[0].slice(3) })
    else if (lines[0].startsWith('- ')) {
      const items: string[] = []
      for (const l of lines) {
        if (l.startsWith('- ')) items.push(l.slice(2).trim())
        else items[items.length - 1] += ' ' + l.trim()
      }
      blocks.push({ kind: 'ul', items })
    } else blocks.push({ kind: 'p', text: lines.map((l) => l.trim()).join(' ') })
  }
  return blocks
}

const TOKEN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g

export function Inline({ text, linkClass }: { text: string; linkClass: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>
        if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>
        if (part.startsWith('`')) return <code key={i} className="rounded bg-track px-1 font-mono text-[0.9em]">{part.slice(1, -1)}</code>
        const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)!
        const href = m[2]
        const external = /^https?:/.test(href)
        return (
          <a key={i} href={href} className={linkClass} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {m[1]}
          </a>
        )
      })}
    </>
  )
}

export function MiniMarkdown({
  md,
  className,
  h2Class,
  h3Class,
  linkClass,
}: {
  md: string
  className: string
  h2Class: string
  h3Class: string
  linkClass: string
}) {
  return (
    <div className={className}>
      {parseBlocks(md).map((b, i) => {
        if (b.kind === 'h2') return <h2 key={i} className={h2Class}><Inline text={b.text} linkClass={linkClass} /></h2>
        if (b.kind === 'h3') return <h3 key={i} className={h3Class}><Inline text={b.text} linkClass={linkClass} /></h3>
        if (b.kind === 'ul')
          return (
            <ul key={i} className="flex list-disc flex-col gap-2 pl-5 marker:text-accent">
              {b.items.map((it, j) => (
                <li key={j} className="break-words">
                  <Inline text={it} linkClass={linkClass} />
                </li>
              ))}
            </ul>
          )
        return (
          <p key={i} className="break-words">
            <Inline text={b.text} linkClass={linkClass} />
          </p>
        )
      })}
    </div>
  )
}
