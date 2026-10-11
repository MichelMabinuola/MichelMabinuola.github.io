import { resume } from '../content'
import { useUi } from '../i18n'
import { CountUp } from './CountUp'

// Three headline numbers, all derived from resume.json (nothing typed in by hand).
const firstStart = resume.experience.map((e) => e.start).sort()[0]
const results = resume.projects.find((p) => p.id === 'matryoshka-vector-search')?.metrics?.results ?? []
const [baseline, best] = [results[0], results[1]]
const memorySaved = baseline && best ? Math.round((1 - best.indexMemoryGB / baseline.indexMemoryGB) * 100) : null
const speedup = baseline && best ? (best.qps / baseline.qps).toFixed(1) : null

function yearsSince(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const now = new Date()
  return Math.floor((now.getFullYear() * 12 + now.getMonth() - (y * 12 + m - 1)) / 12)
}

export function HeroStats() {
  const ui = useUi()
  const stats = [
    { value: <><CountUp value={yearsSince(firstStart)} ms={900} />+</>, label: ui.statYears },
    ...(memorySaved !== null ? [{ value: <><CountUp value={memorySaved} ms={900} />%</>, label: ui.statMemory }] : []),
    ...(speedup !== null ? [{ value: <>{speedup}×</>, label: ui.statSpeed }] : []),
  ]
  return (
    <dl className="mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
      {stats.map((s) => (
        <div key={s.label} className="border-l-2 border-accent pl-4">
          <dt className="sr-only">{s.label}</dt>
          <dd className="text-4xl font-semibold tracking-tight text-ink tabular-nums">{s.value}</dd>
          <dd className="mt-1 text-sm text-ink-2">{s.label}</dd>
        </div>
      ))}
    </dl>
  )
}
