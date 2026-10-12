import { ArrowUpRight } from 'lucide-react'
import llms from '../../public/llms.txt?raw'
import { MiniMarkdown } from './MiniMarkdown'

// Same text as /llms.txt. It's addressed to AI agents, so it stays in English.
export const LLMS_TEXT = llms.trim()

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
      <MiniMarkdown
        md={LLMS_TEXT}
        className="flex flex-col gap-3 px-5 py-5 font-mono text-[13px] leading-relaxed text-ink-2 sm:px-6 sm:text-sm [&_strong]:text-ink"
        h2Class="text-base font-semibold text-ink"
        h3Class="mt-2 font-semibold text-ink"
        linkClass="break-all text-accent underline underline-offset-2"
      />
    </section>
  )
}
