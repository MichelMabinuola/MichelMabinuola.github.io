// Shared frame for every demo: one control, one changing number, one plain sentence.
export function Demo({
  metricLabel,
  metric,
  control,
  sentence,
  children,
  badge,
}: {
  metricLabel: string
  metric: React.ReactNode
  control: React.ReactNode
  sentence: React.ReactNode
  children?: React.ReactNode
  badge?: string
}) {
  return (
    <div className="rounded-lg bg-track/60 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div aria-live="polite">
          <div className="text-xs text-ink-3">
            {metricLabel}
            {badge && <span className="ml-2 rounded border border-line-strong px-1.5 py-px text-[10px] text-ink-2">{badge}</span>}
          </div>
          <div className="text-2xl font-semibold tabular-nums text-ink">{metric}</div>
        </div>
        <div className="flex gap-2">{control}</div>
      </div>
      {children && <div className="mt-3">{children}</div>}
      <p className="mt-3 text-sm text-ink-2">{sentence}</p>
    </div>
  )
}

export const demoBtn =
  'rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink disabled:opacity-50'
