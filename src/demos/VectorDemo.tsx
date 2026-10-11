import { useState } from 'react'
import { resume } from '../content'
import { dimsOf } from '../model'
import { useUi } from '../i18n'

// Every number here comes from resume.json → projects → matryoshka-vector-search.
const project = resume.projects.find((p) => p.id === 'matryoshka-vector-search')!
const results = project.metrics!.results
const maxMem = Math.max(...results.map((r) => r.indexMemoryGB))
const maxQps = Math.max(...results.map((r) => r.qps))
const RECALL_WARN = 0.9
// Keep the source precision: 38.0, 5.0, 2.52.
const fmtGB = (v: number) => (Number.isInteger(v * 10) ? v.toFixed(1) : v.toFixed(2))

function Bar({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-3 text-sm">
      <span className="text-ink-2">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-track" aria-hidden="true">
        <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${Math.max(2, pct * 100)}%` }} />
      </div>
      <span className="text-right font-mono tabular-nums text-ink">{value}</span>
    </div>
  )
}

export function VectorDemo() {
  const [i, setI] = useState(0)
  const ui = useUi()
  const r = results[i]
  const low = r.recallAt5 < RECALL_WARN

  return (
    <div className="rounded-2xl bg-track/50 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-ink-3">{ui.vecSizeFirst}</span>
        <div role="radiogroup" aria-label={ui.vecSizeFirst} className="inline-flex rounded-lg border border-line-strong bg-surface p-0.5">
          {results.map((x, idx) => {
            const on = idx === i
            return (
              <button
                key={x.config}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setI(idx)}
                className={`rounded-md px-3 py-1 font-mono text-xs transition-colors ${on ? 'bg-accent text-surface' : 'text-ink-2 hover:text-ink'}`}
              >
                {dimsOf(x)}
                {idx === 0 && <span className="font-sans">{ui.vecFull}</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5" aria-live="polite">
        <Bar label={ui.vecMemory} value={`${fmtGB(r.indexMemoryGB)} GB`} pct={r.indexMemoryGB / maxMem} />
        <Bar label={ui.vecQps} value={`${r.qps.toFixed(1)}`} pct={r.qps / maxQps} />
        <div className="grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-3 text-sm">
          <span className="text-ink-2" title="recall@5">{ui.vecAccuracy}</span>
          <span className={`text-xs ${low ? 'text-warn' : 'text-ink-3'}`}>{low ? ui.vecLow : ui.vecHigh}</span>
          <span className={`text-right font-mono tabular-nums ${low ? 'text-warn' : 'text-ink'}`}>{(r.recallAt5 * 100).toFixed(1)}%</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-ink-2">{ui.vecCaption}</p>
      <p className="mt-2 text-xs text-ink-3">
        {ui.vecDataset} ·{' '}
        <a href={project.url!} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:no-underline">
          {ui.vecPublished}
        </a>
      </p>
    </div>
  )
}
