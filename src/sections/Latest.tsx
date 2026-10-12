import { ArrowUpRight, BookOpen, Network } from 'lucide-react'
import { resume } from '../content'
import { useL10n, useUi } from '../i18n'

export function Latest() {
  const ui = useUi()
  const l = useL10n()
  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {resume.latest.items.map((entry) => {
          const item = l.latestItem(entry)
          const Icon = item.kind === 'reading' ? BookOpen : Network
          return (
            <li key={item.id} className="flex gap-3 rounded-2xl border border-line p-4">
              <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-ink-3">
                  {item.kind === 'reading' ? ui.reading : ui.learning}
                  <span className="inline-flex items-center gap-1 rounded-full bg-ok/10 px-2 py-0.5 text-ok-ink">
                    <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok motion-reduce:animate-none" />
                    {ui.inProgress}
                  </span>
                </div>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-start gap-1 font-medium text-ink hover:text-accent"
                  >
                    {item.title}
                    <ArrowUpRight size={14} aria-hidden="true" className="mt-1 shrink-0 text-ink-3" />
                  </a>
                ) : (
                  <div className="mt-1 font-medium text-ink">{item.title}</div>
                )}
                {item.author && <div className="text-sm text-ink-2">{ui.by(item.author)}</div>}
                {item.note && <p className="mt-1 text-sm text-ink-2">{item.note}</p>}
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-xs text-ink-3">{ui.updated(l.month(resume.latest.updated))}</p>
    </div>
  )
}
