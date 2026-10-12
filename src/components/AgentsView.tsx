import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { LLMS_TEXT } from '../llms'
import { ArrowUpRight } from 'lucide-react'
import { MiniMarkdown } from './MiniMarkdown'

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
        <MiniMarkdown
          md={LLMS_TEXT}
          className="mt-8 flex flex-col gap-5 text-lg leading-relaxed text-ink-2 sm:text-xl sm:leading-relaxed [&_strong]:text-ink"
          h2Class="text-3xl font-bold tracking-tight text-ink sm:text-5xl"
          h3Class="mt-4 text-xl font-semibold text-ink sm:text-2xl"
          linkClass="text-accent underline underline-offset-4 hover:no-underline"
        />
        <p className="mt-10 font-mono text-xs text-ink-3">
          Also at{' '}
          <a href="llms.txt" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-accent">
            /llms.txt
            <ArrowUpRight size={12} aria-hidden="true" className="ml-0.5 inline-block" />
          </a>
        </p>
      </div>
    </div>,
    document.body,
  )
}
