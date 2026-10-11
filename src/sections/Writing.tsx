import { resume } from '../content'
import { publishedWriting } from '../model'

export function Writing({ closing }: { closing?: string }) {
  return (
    <div className="text-sm">
      <ul className="flex flex-col divide-y divide-line">
        {publishedWriting(resume).map((w) => (
          <li key={w.id} className="py-3 first:pt-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <a
                href={w.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink underline decoration-line-strong underline-offset-2 hover:text-accent hover:decoration-accent"
              >
                {w.title}
              </a>
              <span
                className="rounded border border-line-strong px-1 font-mono text-[10px] text-ink-3"
                title={w.language === 'KO' ? 'Written in Korean' : 'Written in English'}
              >
                {w.language === 'KO' ? 'KO · Korean' : 'EN'}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-ink-3">
              {w.publisher} · {w.year}
            </div>
            <p className="mt-1 text-ink-2">{w.summary}</p>
          </li>
        ))}
      </ul>
      {closing && <p className="mt-2 text-xs text-ink-3">{closing}</p>}
    </div>
  )
}
