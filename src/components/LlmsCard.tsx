import { Fragment } from 'react'
import { ArrowUpRight } from 'lucide-react'
import llms from '../../public/llms.txt?raw'

// Same text as /llms.txt, shown as-is. It's addressed to AI agents, so it stays in English.
const LINK = /(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+\.[\w.]+)/g

export const LLMS_TEXT = llms.trimEnd()

export function linkify(line: string) {
  return line.split(LINK).map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>
    const href = part.includes('@') && !part.startsWith('http') ? `mailto:${part}` : part
    return (
      <a key={i} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" className="break-all text-accent underline underline-offset-2">
        {part}
      </a>
    )
  })
}

export function LlmsCard() {
  return (
    <section lang="en" aria-label="Note for AI agents" className="mt-6 overflow-hidden rounded-3xl border border-line bg-track/50">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-2.5 font-mono text-xs text-ink-3 sm:px-6">
        <span>$ cat /llms.txt</span>
        <a href="llms.txt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ink-2 hover:text-accent">
          Open as text
          <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      </div>
      <pre className="whitespace-pre-wrap break-words px-5 py-5 font-mono text-[13px] leading-relaxed text-ink-2 sm:px-6 sm:text-sm">
        {LLMS_TEXT.split('\n').map((line, i, all) => (
          <Fragment key={i}>
            {linkify(line)}
            {i < all.length - 1 && '\n'}
          </Fragment>
        ))}
      </pre>
    </section>
  )
}
