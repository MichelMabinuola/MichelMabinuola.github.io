import { useEffect, useState } from 'react'
import { AlignLeft } from 'lucide-react'
import type { SectionDef } from '../model'
import { useUi } from '../i18n'

// Docs-style outline on the right, for wide screens. Numbers match the "No. 03" labels on the
// section cards. Sections that are put away load first, then the page scrolls to them.
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
  const [current, setCurrent] = useState<string | null>(null)

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

  return (
    <nav aria-label={ui.onThisPage} className="fixed right-6 top-24 z-20 hidden w-[220px] text-sm xl:block">
      <div className="mb-3 flex items-center gap-2 text-ink-3">
        <AlignLeft size={14} aria-hidden="true" />
        {ui.onThisPage}
      </div>
      <ol className="flex flex-col gap-0.5">
        {sections.map((s, i) => {
          const open = resident.includes(s.id)
          const busy = loading.includes(s.id)
          const active = open && current === s.id
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onNavigate(s.id)}
                aria-current={active ? 'location' : undefined}
                aria-label={open ? ui.goTo(s.title) : ui.show(s.title)}
                className={`flex w-full items-center gap-2.5 rounded-md py-1 text-left transition-colors ${active ? 'font-medium text-ink' : open ? 'text-ink-2 hover:text-ink' : 'text-ink-3 hover:text-ink'}`}
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
  )
}
