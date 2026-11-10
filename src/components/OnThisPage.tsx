import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlignLeft } from 'lucide-react'
import type { SectionDef } from '../model'
import { useUi } from '../i18n'

const PANEL_WIDTH = 236

// A small tab on the right edge that slides out a list of sections, over the page.
// Numbers match the "No. 03" labels on the cards. Sections that are put away load first.
export function OnThisPage({
  sections,
  resident,
  loading,
  onNavigate,
}: {
  sections: SectionDef[]
  resident: string[]
  loading: string[]
  onNavigate: (id: string) => void
}) {
  const ui = useUi()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const tab = useRef<HTMLButtonElement>(null)

  // Highlight the section the visitor is currently reading.
  const residentKey = resident.join(',')
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const passed = resident
        .map((id) => document.getElementById(`sec-${id}`))
        .filter((el) => el !== null)
        .filter((el) => el.getBoundingClientRect().top <= 160)
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
      setCurrent(passed.at(-1)?.id.slice(4) ?? null)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    // Cards can arrive or leave without a scroll, so re-check after they settle.
    const settle = window.setTimeout(update, 400)
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(settle)
      if (raf) cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residentKey])

  // Click elsewhere or press Escape to tuck the list away.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      tab.current?.focus()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <motion.div
      ref={root}
      className="fixed right-0 top-1/2 z-30 flex items-center"
      style={{ y: '-50%' }}
      initial={false}
      animate={{ x: open ? 0 : PANEL_WIDTH }}
      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
    >
      <button
        ref={tab}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="section-list"
        className="flex items-center gap-2 rounded-l-xl bg-accent px-2.5 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-surface shadow-lg shadow-black/10"
        style={{ writingMode: 'vertical-rl' }}
      >
        <AlignLeft size={13} aria-hidden="true" className="rotate-90" />
        {ui.sectionsTab}
      </button>

      <nav
        id="section-list"
        aria-label={ui.sectionsTab}
        inert={!open}
        className={`max-h-[80vh] overflow-y-auto rounded-l-xl border border-r-0 border-line bg-surface p-3 text-sm ${open ? 'shadow-xl shadow-black/15' : ''}`}
        style={{ width: PANEL_WIDTH }}
      >
        <ol className="flex flex-col gap-0.5">
          {sections.map((s, i) => {
            const isOpen = resident.includes(s.id)
            const busy = loading.includes(s.id)
            const active = isOpen && current === s.id
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onNavigate(s.id)
                  }}
                  aria-current={active ? 'location' : undefined}
                  aria-label={isOpen ? ui.goTo(s.title) : ui.show(s.title)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-accent-soft ${active ? 'font-medium text-ink' : isOpen ? 'text-ink-2 hover:text-ink' : 'text-ink-3 hover:text-ink'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${active ? 'bg-ink text-surface' : ''}`}
                  >
                    {busy ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok motion-reduce:animate-none" /> : i + 1}
                  </span>
                  <span className="truncate">{s.title}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </motion.div>
  )
}
