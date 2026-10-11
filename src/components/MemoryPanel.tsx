import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { SectionDef } from '../model'
import type { CgroupState, MaxSetting } from '../sim/cgroup'
import { stats } from '../sim/cgroup'
import { copyText, shareUrl } from '../share/url'

export function MemoryPanel({
  state,
  hidden,
  total,
  onLoad,
  onSetMax,
}: {
  state: CgroupState
  hidden: SectionDef[]
  total: number
  onLoad: (id: string) => void
  onSetMax: (m: MaxSetting) => void
}) {
  const s = stats(state)
  const full = state.max === '1G'
  const [copied, setCopied] = useState(false)

  let note: string
  if (state.loading.length) note = 'Loading it back… it was put away earlier to free up space.'
  else if (full) note = 'Plenty of memory now, so every section fits.'
  else if (state.refaults === 0)
    note = `Only ${state.resident.length} of ${total} sections fit, so the rest were put away. Click one to bring it back, or show everything.`
  else note = 'To make room, the section you looked at longest ago was put away.'

  const share = async () => {
    setCopied(await copyText(shareUrl(state.max, state.resident, state.lastAccess)))
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section aria-label="Page memory" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-ink">This page has limited memory</h2>
        <span className="text-sm tabular-nums text-ink-2">
          {s.currentMb} MB of {s.maxMb} MB used
        </span>
      </div>

      <div
        className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-track"
        role="meter"
        aria-label="Memory used"
        aria-valuemin={0}
        aria-valuemax={s.maxMb}
        aria-valuenow={s.currentMb}
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${s.pct * 100}%` }} />
      </div>

      <p className="mt-3 text-sm text-ink-2" aria-live="polite">
        {note}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <AnimatePresence initial={false}>
          {hidden.map((sec) => {
            const busy = state.loading.includes(sec.id)
            return (
              <motion.button
                key={sec.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                type="button"
                onClick={() => onLoad(sec.id)}
                disabled={busy}
                aria-label={busy ? `${sec.title}: loading` : `Show ${sec.title}`}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-line-strong px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-accent hover:text-ink disabled:cursor-progress disabled:text-accent"
              >
                {!busy && <Plus size={14} aria-hidden="true" />}
                {busy ? `Loading ${sec.title}…` : sec.title}
              </motion.button>
            )
          })}
        </AnimatePresence>

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => onSetMax(full ? '256M' : '1G')}
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-surface transition-opacity hover:opacity-85"
          >
            {full ? 'Go back to limited memory' : 'Show everything'}
          </button>
          <button
            type="button"
            onClick={share}
            className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-2 hover:border-line-strong hover:text-ink"
          >
            {copied ? 'Link copied' : 'Copy link'}
          </button>
        </div>
      </div>
    </section>
  )
}
