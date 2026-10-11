import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { trace, type TraceStep } from '../content'
import { Demo, demoBtn } from './Demo'

const STEP_MS = 1600
const KIND_LABEL: Record<TraceStep['kind'], string> = {
  goal: 'goal',
  plan: 'plan',
  tool_call: 'tool call',
  tool_result: 'tool result',
  answer: 'answer',
}

export function AgentReplay() {
  const n = trace.steps.length
  const [shown, setShown] = useState(1)
  const [playing, setPlaying] = useState(false)
  const done = shown >= n

  useEffect(() => {
    if (!playing) return
    if (done) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(() => setShown((s) => s + 1), STEP_MS)
    return () => window.clearTimeout(t)
  }, [playing, shown, done])

  const play = () => {
    if (done) setShown(1)
    setPlaying(true)
  }
  const current = trace.steps[shown - 1]

  return (
    <Demo
      badge={trace.placeholder ? `${trace.label} · placeholder` : trace.label}
      metricLabel={trace.project}
      metric={`step ${shown} of ${n}`}
      control={
        <>
          <button type="button" className={demoBtn} onClick={play} disabled={playing}>
            {done ? 'replay' : playing ? 'playing…' : 'play'}
          </button>
          <button
            type="button"
            className={demoBtn}
            onClick={() => {
              setPlaying(false)
              setShown((s) => Math.min(n, s + 1))
            }}
            disabled={done}
          >
            step
          </button>
        </>
      }
      sentence={current.caption}
    >
      <ol className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {trace.steps.slice(0, shown).map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-md border bg-surface px-3 py-2 text-sm ${i === shown - 1 ? 'border-accent' : 'border-line'}`}
            >
              <div className="font-mono text-[10px] text-ink-3">{KIND_LABEL[s.kind]}</div>
              {s.kind === 'tool_call' ? (
                <div className="mt-0.5 font-mono text-xs text-ink">
                  <span className="text-accent">{s.tool}</span>(<span className="break-all text-ink-2">{s.input}</span>)
                </div>
              ) : (
                <div className={s.kind === 'tool_result' ? 'mt-0.5 font-mono text-xs text-ink-2' : 'mt-0.5 text-ink'}>{s.text}</div>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </Demo>
  )
}
