import { useL10n } from '../i18n'

export const MEASURED_ID = 'measured-for-real'

// Opens the note and brings it into view; used by links in About and the footer.
export function openMeasured(e?: React.MouseEvent) {
  e?.preventDefault()
  const el = document.getElementById(MEASURED_ID) as HTMLDetailsElement | null
  if (!el) return
  el.open = true
  el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
  el.querySelector('summary')?.focus({ preventScroll: true })
}

export function MeasuredLink({ children }: { children: React.ReactNode }) {
  return (
    <a href={`#${MEASURED_ID}`} onClick={openMeasured} className="text-accent underline underline-offset-2 hover:no-underline">
      {children}
    </a>
  )
}

export function MeasuredNote() {
  const m = useL10n().measured()
  return (
    <details id={MEASURED_ID} className="mt-3 rounded-2xl border border-line bg-surface px-5 py-4 text-sm">
      <summary className="cursor-pointer select-none font-medium text-ink">{m.title}</summary>
      <p className="mt-3 text-ink">{m.caption}</p>
      <p className="mt-2 text-ink-2">{m.setup}</p>
      <ul className="mt-2 flex flex-col gap-1.5 text-ink-2">
        {m.runs.map((r) => (
          <li key={r.sql}>
            <code className="rounded bg-track px-1.5 py-0.5 font-mono text-xs text-ink">{r.sql}</code> {r.result}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-ink-2">{m.conclusion}</p>
    </details>
  )
}
