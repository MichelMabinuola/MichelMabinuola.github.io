import { useCallback, useState } from 'react'
import { PanelRight } from 'lucide-react'
import { resume } from '../content'
import { publishedWriting, type WritingEntry } from '../model'
import { useL10n, useUi } from '../i18n'
import { Reader } from '../components/Reader'

export function Writing({ closing }: { closing?: string }) {
  const ui = useUi()
  const l = useL10n()
  const [openId, setOpenId] = useState<string | null>(null)
  const close = useCallback(() => setOpenId(null), [])
  const entries = publishedWriting(resume).map((e) => l.writing(e) as WritingEntry)

  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {entries.map((w) => (
          <li key={w.id}>
            <button
              type="button"
              onClick={() => setOpenId(w.id)}
              aria-label={ui.readPreview(w.title)}
              aria-haspopup="dialog"
              className="group flex h-full w-full flex-col rounded-2xl border border-line p-4 text-left transition-colors hover:border-accent"
            >
              <div className="flex w-full items-center justify-between gap-2 text-xs text-ink-3">
                <span>
                  {w.publisher} · {w.year}
                </span>
                <span className={`rounded-full px-2 py-0.5 ${w.language === 'KO' ? 'bg-accent-soft text-accent' : 'bg-track text-ink-2'}`}>
                  {w.language === 'KO' ? ui.langTagKO : ui.langTagEN}
                </span>
              </div>
              <span className="mt-2 flex w-full items-start justify-between gap-2 font-medium text-ink group-hover:text-accent">
                {w.title}
                <PanelRight size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3 group-hover:text-accent" />
              </span>
              <p className="mt-1.5 line-clamp-3 text-sm text-ink-2">{w.summary}</p>
            </button>
          </li>
        ))}
      </ul>
      {closing && <p className="mt-3 text-xs font-medium text-alert">{closing}</p>}
      <Reader entry={entries.find((e) => e.id === openId) ?? null} onClose={close} />
    </div>
  )
}
