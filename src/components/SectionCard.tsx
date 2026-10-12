import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { SectionDef } from '../model'
import { useL10n, useUi } from '../i18n'
import { Icon } from './Icon'
import { SectionBody } from '../sections/SectionBody'

export function SectionCard({ section, number, onTouch }: { section: SectionDef; number: number; onTouch: (id: string) => void }) {
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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onPointerDown={() => onTouch(section.id)}
      onFocusCapture={() => onTouch(section.id)}
      id={`sec-${section.id}`}
      tabIndex={-1}
      aria-labelledby={`h-${section.id}`}
      className={`scroll-mt-6 rounded-3xl border outline-none transition-colors ${
        section.variant === 'light' ? 'border-dashed border-line-strong p-5 sm:p-6' : 'border-line bg-surface p-6 hover:border-accent/40 sm:p-9'
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex shrink-0 items-center justify-center rounded-2xl ${section.variant === 'light' ? 'h-8 w-8 bg-track text-ink-3' : 'h-11 w-11 bg-accent-soft text-accent'}`}
        >
          <Icon name={section.icon} size={20} />
        </span>
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3">No. {String(number).padStart(2, '0')}</div>
          <h2 id={`h-${section.id}`} className={`font-display font-semibold tracking-tight text-ink ${section.variant === 'light' ? 'text-xl' : 'text-3xl'}`}>
            {section.title}
          </h2>
        </div>
      </div>
      {/* About's one-liner already sits in the hero. */}
      {section.id !== 'about' && <p className="mt-3 text-lg text-ink-2">{section.line}</p>}

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
