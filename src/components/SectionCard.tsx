import { Fragment, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { resume } from '../content'
import { resolveWork, type SectionDef } from '../model'
import { Icon } from './Icon'
import { SectionBody } from '../sections/SectionBody'

export function SectionCard({ section, onTouch }: { section: SectionDef; onTouch: (id: string) => void }) {
  const ref = useRef<HTMLElement>(null)

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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      onPointerDown={() => onTouch(section.id)}
      onFocusCapture={() => onTouch(section.id)}
      aria-labelledby={`h-${section.id}`}
      className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-ink-2">
          <Icon name={section.icon} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`h-${section.id}`} className="text-base font-semibold text-ink">
            {section.title}
          </h2>
          <p className="mt-0.5 text-sm text-ink-2">{section.line}</p>
        </div>
      </div>

      <div className="mt-4">
        <SectionBody section={section} />
      </div>

      {section.realWork && <RealWork refs={section.realWork} />}

      {section.detail && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer select-none text-xs text-ink-3 hover:text-ink-2">How it works</summary>
          <p className="mt-2 text-ink-2">{section.detail}</p>
        </details>
      )}
    </motion.section>
  )
}

function RealWork({ refs }: { refs: NonNullable<SectionDef['realWork']> }) {
  const items = refs.map((r) => resolveWork(r, resume)).filter((x) => x !== null)
  if (!items.length) return null
  return (
    <p className="mt-4 border-t border-line pt-3 text-sm text-ink-2">
      <span className="mr-1.5 text-xs font-medium text-ink-3">Real work</span>
      {items.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="mx-1.5 text-ink-3">·</span>}
          {w.kind === 'link' && (
            <a href={w.url} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:no-underline">
              {w.title}
            </a>
          )}
          {w.kind === 'note' && (
            <span>
              <span className="text-ink">{w.title}</span> <span className="text-ink-3">({w.note})</span>
            </span>
          )}
          {w.kind === 'text' && <span>{w.text}</span>}
        </Fragment>
      ))}
    </p>
  )
}
