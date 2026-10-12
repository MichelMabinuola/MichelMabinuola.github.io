import { useEffect, useState } from 'react'
import { useLang, useUi } from '../i18n'
import { LangSwitch } from './LangSwitch'
import { ThemeToggle } from './ThemeToggle'

// Newspaper-style strip across the top: where, this year, today's date (Seoul time).

export function Masthead() {
  const ui = useUi()
  const { lang } = useLang()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(t)
  }, [])
  const date = new Intl.DateTimeFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
    timeZone: 'Asia/Seoul',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now)
  const year = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric' }).format(now)

  return (
    <div className="border-b-4 border-double border-line-strong pb-2">
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
        <span className="shrink-0">{ui.mastheadPlace(year)}</span>
        <span className="ml-auto hidden shrink-0 sm:block">{date}</span>
        <span className="flex shrink-0 items-center gap-2 normal-case tracking-normal">
          <LangSwitch />
          <ThemeToggle />
        </span>
      </div>
    </div>
  )
}
