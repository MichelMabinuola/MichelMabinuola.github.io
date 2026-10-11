import { ArrowUpRight } from 'lucide-react'
import { resume } from '../content'
import { useL10n } from '../i18n'

export function SideProjects({ note }: { note?: string }) {
  const l = useL10n()
  return (
    <div>
      {note && <p className="text-xs italic text-ink-3">{note}</p>}
      <ul className="mt-3 flex flex-col divide-y divide-line">
        {resume.sideProjects.map((entry) => {
          const p = l.sideProject(entry)
          return (
            <li key={p.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 text-sm">
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-ink hover:text-accent"
              >
                {p.title}
                <ArrowUpRight size={13} aria-hidden="true" className="text-ink-3" />
              </a>
              <span className="text-ink-2">{p.summary}</span>
              <span className="ml-auto flex gap-1">
                {p.tech.map((t) => (
                  <span key={t} className="rounded bg-track px-1.5 py-0.5 text-[11px] text-ink-3">
                    {t}
                  </span>
                ))}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
