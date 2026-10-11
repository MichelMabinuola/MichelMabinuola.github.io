import { useState } from 'react'
import { Demo, demoBtn } from './Demo'

const SLOW = [
  { label: 'scanning everything', ms: 3600 },
  { label: 'joining', ms: 400 },
  { label: 'sending results', ms: 200 },
]
const FAST = [
  { label: 'reading matching rows only', ms: 120 },
  { label: 'joining', ms: 120 },
  { label: 'sending results', ms: 60 },
]
const SCALE = 4200
const COLORS = ['bg-accent', 'bg-ink-3', 'bg-line-strong']

const PROFILE_SLOW = `Project            rows 1.2K      0.2s
└─ HashJoin         rows 1.2K      0.4s
   ├─ ColumnScan orders   rows 48M → 1.2K   3.6s   ← reads every segment
   └─ Scan customers      rows 20K`
const PROFILE_FAST = `Project            rows 1.2K      0.06s
└─ HashJoin         rows 1.2K      0.12s
   ├─ ColumnScan orders   rows 1.3K → 1.2K  0.12s  ← 3 of 900 segments read
   │    segments skipped by sort key (order_date)
   └─ Scan customers      rows 20K`

export function DbDemo() {
  const [fixed, setFixed] = useState(false)
  const parts = fixed ? FAST : SLOW
  const total = parts.reduce((a, p) => a + p.ms, 0)

  return (
    <Demo
      badge="Illustrative example"
      metricLabel="query time"
      metric={`${(total / 1000).toFixed(1)}s`}
      control={
        <button type="button" className={demoBtn} onClick={() => setFixed((f) => !f)} aria-pressed={fixed}>
          {fixed ? 'undo the fix' : 'add an index'}
        </button>
      }
      sentence={
        fixed
          ? 'Like a book’s index: jump straight to the right pages instead of reading the whole book.'
          : 'Almost all the time goes to reading every row just to find the few it needs.'
      }
    >
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-track" aria-hidden="true">
        {parts.map((p, i) => (
          <div
            key={i}
            className={`h-full ${COLORS[i]} transition-[width] duration-700 first:rounded-l-full last:rounded-r-full`}
            style={{ width: `${(p.ms / SCALE) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        {parts.map((p, i) => (
          <li key={p.label} className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${COLORS[i]}`} aria-hidden="true" />
            {p.label} <span className="font-mono tabular-nums text-ink-3">{(p.ms / 1000).toFixed(2)}s</span>
          </li>
        ))}
      </ul>
      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-ink-3 hover:text-ink-2">see the details</summary>
        <pre className="mt-2 overflow-x-auto rounded-md border border-line bg-surface p-3 font-mono text-[11px] leading-relaxed text-ink-2">
          {fixed ? PROFILE_FAST : PROFILE_SLOW}
        </pre>
      </details>
    </Demo>
  )
}
