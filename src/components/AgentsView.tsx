import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { LLMS_TEXT, linkify } from './LlmsCard'

// The text is hard-wrapped for /llms.txt; at this size, re-flow it into paragraphs and bullets.
const PARAGRAPHS = LLMS_TEXT.split(/\n\s*\n/).map((block) => {
  const lines = block.split('\n')
  if (!lines[0].startsWith('- ')) return { bullets: false, lines: lines.map((l) => l.trim()) }
  const items: string[] = []
  for (const l of lines) {
    if (l.startsWith('- ')) items.push(l.slice(2).trim())
    else items[items.length - 1] += ' ' + l.trim()
  }
  return { bullets: true, lines: items }
})

// Full-screen view of the note for AI agents, opened from the hero (or ?view=agents).
export function AgentsView({ open, onClose }: { open: boolean; onClose: () => void }) {
  const backRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    backRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      opener?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Note for AI agents" lang="en" className="fixed inset-0 z-50 overflow-y-auto bg-surface">
      <div className="mx-auto max-w-4xl px-5 py-6 sm:px-8 sm:py-10">
        <div className="flex justify-center">
          <button ref={backRef} type="button" onClick={onClose} className="text-sm text-ink-2 underline underline-offset-4 hover:text-ink">
            back
          </button>
        </div>
        <div className="mt-8 flex flex-col gap-6 text-lg font-semibold leading-relaxed text-ink sm:text-2xl sm:leading-relaxed">
          {PARAGRAPHS.map((p, i) =>
            p.bullets ? (
              <ul key={i} className="flex list-disc flex-col gap-2 pl-6 marker:text-accent">
                {p.lines.map((line, j) => (
                  <li key={j} className="break-words">
                    {linkify(line)}
                  </li>
                ))}
              </ul>
            ) : (
              <p key={i} className="break-words">
                {linkify(p.lines.join(' '))}
              </p>
            ),
          )}
        </div>
        <p className="mt-10 font-mono text-xs text-ink-3">
          Also at{' '}
          <a href="llms.txt" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-accent">
            /llms.txt
          </a>
        </p>
      </div>
    </div>,
    document.body,
  )
}
