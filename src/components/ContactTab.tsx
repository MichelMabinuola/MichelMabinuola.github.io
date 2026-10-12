import { ArrowUpRight } from 'lucide-react'
import { resume } from '../content'
import { useUi } from '../i18n'

// A vertical "Contact" tab pinned to the right edge on large screens.
export function ContactTab() {
  const ui = useUi()
  return (
    <a
      href={`mailto:${resume.basics.email}`}
      className="bg-accent-gradient fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-2 rounded-l-xl px-2.5 py-5 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-surface shadow-lg shadow-black/10 transition-[padding] hover:pr-4 lg:flex"
      style={{ writingMode: 'vertical-rl' }}
    >
      {ui.contactTab}
      <ArrowUpRight size={13} aria-hidden="true" className="rotate-90" />
    </a>
  )
}
