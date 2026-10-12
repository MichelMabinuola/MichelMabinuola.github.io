import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link2, Maximize2, Minimize2, Plus, Sparkles, TriangleAlert } from 'lucide-react'
import type { SectionDef } from '../model'
import type { CgroupState, MaxSetting } from '../sim/cgroup'
import { REFAULT_MS, stats } from '../sim/cgroup'
import { copyText, shareUrl } from '../share/url'
import { useL10n, useUi } from '../i18n'
import { Icon } from './Icon'
import { CountUp } from './CountUp'

// High usage is normal (the kernel fills spare room with cache); thrashing shows up as memory pressure.
const THRASHING_PSI = 10

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
  const thrashing = state.psi > THRASHING_PSI
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
          <span className="font-medium text-accent">{ui.funTag}</span> {ui.funNote}
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
          <motion.button
            type="button"
            onClick={() => onSetMax(full ? '256M' : '1G')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="group relative h-9 overflow-hidden rounded-full bg-ink px-4 text-sm font-medium text-surface"
          >
            {/* A light sweep crosses the button on hover. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[300%] motion-reduce:hidden"
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={full ? 'back' : 'all'}
                className="relative inline-flex items-center gap-1.5"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                {full ? <Minimize2 size={14} aria-hidden="true" /> : <Maximize2 size={14} aria-hidden="true" />}
                {full ? ui.goBack : ui.showEverything}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-track"
          role="meter"
          aria-label={ui.limitedMemory}
          aria-valuemin={0}
          aria-valuemax={s.maxMb}
          aria-valuenow={s.currentMb}
        >
          <div className="flex h-full gap-[2px]">
            {/* Fixed anon memory (the skills strip below), then reclaimable file cache. */}
            <div className="h-full rounded-l-full bg-ink-3 transition-[width] duration-500" style={{ width: `${(s.anonMb / s.maxMb) * 100}%` }} />
            <div
              className={`h-full rounded-r-full transition-[width,background-color] duration-500 ${thrashing ? 'bg-warn' : 'bg-accent-gradient'}`}
              style={{ width: `${(s.fileMb / s.maxMb) * 100}%` }}
            />
          </div>
        </div>
        {thrashing && (
          <span
            title={ui.thrashingHint}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warn/10 px-2 py-0.5 text-xs font-medium text-warn"
          >
            <TriangleAlert size={12} aria-hidden="true" />
            {ui.thrashing}
          </span>
        )}
        <span className="shrink-0 text-xs tabular-nums text-ink-3">{ui.used(<CountUp value={s.currentMb} />, s.maxMb)}</span>
      </div>

      <p className="mt-2 truncate font-mono text-xs text-ink-3" title={state.lastCmd}>
        $ {state.lastCmd}
      </p>

      <SkillsStrip />

      <div className="mt-4 flex flex-col gap-2.5">
        <Row label={ui.inMemory}>
          <ul className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
            {visible.map((sec) => (
              <motion.li
                key={sec.id}
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 500, damping: 26 }}
              >
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => goTo(sec.id)}
                  aria-label={ui.goTo(sec.title)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-sm text-accent"
                >
                  <Icon name={sec.icon} size={14} />
                  {sec.title}
                  <span className="text-xs tabular-nums opacity-70">{sec.sizeMb} MB</span>
                </motion.button>
              </motion.li>
            ))}
            </AnimatePresence>
          </ul>
        </Row>
        {hidden.length > 0 && (
          <Row label={ui.putAway}>
            <ul className="flex flex-wrap gap-2">
              <AnimatePresence initial={false}>
                {hidden.map((sec) => {
                  const busy = state.loading.includes(sec.id)
                  return (
                    <motion.li
                      key={sec.id}
                      layout
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.18 } }}
                      transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                    >
                      <motion.button
                        whileHover={busy ? undefined : { y: -2 }}
                        whileTap={busy ? undefined : { scale: 0.94 }}
                        type="button"
                        onClick={() => onLoad(sec.id)}
                        disabled={busy}
                        aria-label={busy ? ui.loading(sec.title) : ui.show(sec.title)}
                        className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-dashed border-line-strong px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-solid hover:border-accent hover:bg-accent-soft hover:text-accent disabled:cursor-progress disabled:border-solid disabled:border-accent disabled:text-accent"
                      >
                        {/* While "reading from disk", a fill runs across the chip for exactly the refault time. */}
                        {busy && (
                          <motion.span
                            aria-hidden="true"
                            className="absolute inset-0 origin-left bg-accent/15"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: REFAULT_MS / 1000, ease: 'linear' }}
                          />
                        )}
                        <span className="relative inline-flex items-center gap-1.5">
                          {busy ? (
                            <Icon name={sec.icon} size={14} />
                          ) : (
                            <Plus size={14} aria-hidden="true" className="transition-transform duration-300 group-hover:rotate-90" />
                          )}
                          {busy ? ui.loading(sec.title) : sec.title}
                          {!busy && <span className="text-xs tabular-nums text-ink-3">{sec.sizeMb} MB</span>}
                        </span>
                      </motion.button>
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

// Skills are the fixed anon memory: always resident, never reclaimed, not a section.
function SkillsStrip() {
  const ui = useUi()
  const skills = useL10n().coreSkills()
  return (
    <div className="mt-3 rounded-2xl border border-ink-3/25 bg-ink-3/5 px-3 py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-ink-3">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ink-3" />
          {ui.anonLabel}
        </span>
        <span className="text-xs text-ink-3">{ui.anonCaption}</span>
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <li key={skill} className="rounded-md bg-ink-3/10 px-2 py-0.5 text-xs text-ink-2">
            {skill}
          </li>
        ))}
      </ul>
    </div>
  )
}
