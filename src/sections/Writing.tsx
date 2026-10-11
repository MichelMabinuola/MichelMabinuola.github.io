import { ArrowUpRight } from 'lucide-react'
import { resume } from '../content'
import { publishedWriting } from '../model'
import { useL10n, useUi } from '../i18n'

export function Writing({ closing }: { closing?: string }) {
  const ui = useUi()
  const l = useL10n()
  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {publishedWriting(resume).map((entry) => {
          const w = l.writing(entry)
          return (
            <li key={w.id}>
              <a
                href={w.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-2xl border border-line p-4 transition-colors hover:border-accent"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-ink-3">
                  <span>
                    {w.publisher} · {w.year}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 ${w.language === 'KO' ? 'bg-accent-soft text-accent' : 'bg-track text-ink-2'}`}>
                    {w.language === 'KO' ? ui.langTagKO : ui.langTagEN}
                  </span>
                </div>
                <span className="mt-2 flex items-start justify-between gap-2 font-medium text-ink group-hover:text-accent">
                  {w.title}
                  <ArrowUpRight size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3 group-hover:text-accent" />
                </span>
                <p className="mt-1.5 line-clamp-2 text-sm text-ink-2">{w.summary}</p>
              </a>
            </li>
          )
        })}
      </ul>
      {closing && <p className="mt-3 text-xs text-ink-3">{closing}</p>}
    </div>
  )
}
