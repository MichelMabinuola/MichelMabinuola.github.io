import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { SectionDef } from '../model'
import { useL10n, useUi } from '../i18n'
import { Icon } from './Icon'
import { SectionBody } from '../sections/SectionBody'

export function SectionCard({ section, onTouch }: { section: SectionDef; onTouch: (id: string) => void }) {
  const ref = useRef<HTMLElement>(null)
  const ui = useUi()

  // Reading a section (scrolling it into view) counts as an access for LRU.
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && onTouch(section.id), { threshold: 0.6 })
    io.observe(el)
    return () => io.disconnect()
  }, [section.id, onTouch])

  return (
    <motion.section
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35 }}
      onPointerDown={() => onTouch(section.id)}
      onFocusCapture={() => onTouch(section.id)}
      aria-labelledby={`h-${section.id}`}
      className="rounded-3xl border border-line bg-surface p-6 transition-colors hover:border-line-strong sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Icon name={section.icon} size={18} />
        </span>
        <h2 id={`h-${section.id}`} className="text-xl font-semibold tracking-tight text-ink">
          {section.title}
        </h2>
      </div>
      {/* About's one-liner already sits in the hero. */}
      {section.id !== 'about' && <p className="mt-3 text-ink-2">{section.line}</p>}

      <div className="mt-5">
        <SectionBody section={section} />
      </div>

      {section.realWork && <RealWork section={section} />}

      {section.detail && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer select-none text-ink-3 hover:text-ink-2">{ui.howItWorks}</summary>
          <p className="mt-2 text-ink-2">{section.detail}</p>
        </details>
      )}
    </motion.section>
  )
}

function RealWork({ section }: { section: SectionDef }) {
  const ui = useUi()
  const l = useL10n()
  const items = (section.realWork ?? []).map((r) => l.work(r, section.id)).filter((x) => x !== null)
  if (!items.length) return null
  return (
    <div className="mt-5">
      <h3 className="text-xs font-medium text-ink-3">{ui.realWork}</h3>
      <ul className="mt-2 flex flex-wrap gap-2 text-sm">
        {items.map((w, i) => (
          <li key={i}>
            {w.kind === 'link' && (
              <a
                href={w.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {w.title}
                <ArrowUpRight size={14} aria-hidden="true" className="text-ink-3" />
              </a>
            )}
            {w.kind === 'note' && (
              <span className="inline-block rounded-full border border-line px-3 py-1 text-ink-2" title={w.note}>
                {w.title} <span className="text-ink-3">· {w.note.length > 24 ? w.note.split(/[:：]/)[0] : w.note}</span>
              </span>
            )}
            {w.kind === 'text' && <span className="inline-block py-1 text-ink-2">{w.text}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
