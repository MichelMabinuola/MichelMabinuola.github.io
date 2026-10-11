import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link2, Plus, Sparkles } from 'lucide-react'
import type { SectionDef } from '../model'
import type { CgroupState, MaxSetting } from '../sim/cgroup'
import { stats } from '../sim/cgroup'
import { copyText, shareUrl } from '../share/url'
import { useUi } from '../i18n'
import { Icon } from './Icon'
import { CountUp } from './CountUp'

export function MemoryPanel({
  state,
  visible,
  hidden,
  total,
  onLoad,
  onSetMax,
}: {
  state: CgroupState
  visible: SectionDef[]
  hidden: SectionDef[]
  total: number
  onLoad: (id: string) => void
  onSetMax: (m: MaxSetting) => void
}) {
  const ui = useUi()
  const s = stats(state)
  const full = state.max === '1G'
  const [copied, setCopied] = useState(false)

  const note = state.loading.length
    ? ui.noteLoading
    : full
      ? ui.noteFull
      : state.refaults === 0
        ? ui.noteStart(state.resident.length, total)
        : ui.noteAfter

  const share = async () => {
    setCopied(await copyText(shareUrl(state.max, state.resident)))
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section aria-label={ui.limitedMemory} className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <div className="mb-5 flex gap-3 rounded-2xl bg-accent-soft px-4 py-3 text-sm">
        <Sparkles size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
        <p className="text-ink-2">
          <span className="font-medium text-accent">{ui.funTag}.</span> {ui.funNote}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div>
          <h2 className="font-medium text-ink">{ui.limitedMemory}</h2>
          <p className="mt-0.5 text-sm text-ink-3" aria-live="polite">
            {note}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={share}
            aria-label={copied ? ui.linkCopied : ui.copyLink}
            title={copied ? ui.linkCopied : ui.copyLink}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-ink-2 transition-colors hover:bg-track hover:text-ink"
          >
            <Link2 size={15} aria-hidden="true" />
            <span className="hidden sm:inline">{copied ? ui.linkCopied : ui.copyLink}</span>
          </button>
          <button
            type="button"
            onClick={() => onSetMax(full ? '256M' : '1G')}
            className="h-9 rounded-full bg-ink px-4 text-sm font-medium text-surface transition-opacity hover:opacity-85"
          >
            {full ? ui.goBack : ui.showEverything}
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-track"
          role="meter"
          aria-label={ui.limitedMemory}
          aria-valuemin={0}
          aria-valuemax={s.maxMb}
          aria-valuenow={s.currentMb}
        >
          <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${s.pct * 100}%` }} />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-ink-3">{ui.used(<CountUp value={s.currentMb} />, s.maxMb)}</span>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <Row label={ui.inMemory}>
          <ul className="flex flex-wrap gap-2">
            {visible.map((sec) => (
              <li key={sec.id}>
                <button
                  type="button"
                  onClick={() => goTo(sec.id)}
                  aria-label={ui.goTo(sec.title)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-sm text-accent transition-opacity hover:opacity-80"
                >
                  <Icon name={sec.icon} size={14} />
                  {sec.title}
                  <span className="text-xs tabular-nums opacity-70">{sec.sizeMb} MB</span>
                </button>
              </li>
            ))}
          </ul>
        </Row>
        {hidden.length > 0 && (
          <Row label={ui.putAway}>
            <ul className="flex flex-wrap gap-2">
              <AnimatePresence initial={false}>
                {hidden.map((sec) => {
                  const busy = state.loading.includes(sec.id)
                  return (
                    <motion.li key={sec.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <button
                        type="button"
                        onClick={() => onLoad(sec.id)}
                        disabled={busy}
                        aria-label={busy ? ui.loading(sec.title) : ui.show(sec.title)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent disabled:cursor-progress disabled:text-accent"
                      >
                        {busy ? <Icon name={sec.icon} size={14} /> : <Plus size={14} aria-hidden="true" />}
                        {busy ? ui.loading(sec.title) : sec.title}
                        {!busy && <span className="text-xs tabular-nums text-ink-3">{sec.sizeMb} MB</span>}
                      </button>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
          </Row>
        )}
      </div>
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-28 shrink-0 text-xs text-ink-3">{label}</span>
      {children}
    </div>
  )
}

// Scroll to a section card and move keyboard focus there.
function goTo(id: string) {
  const el = document.getElementById(`sec-${id}`)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
}
