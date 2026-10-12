import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { useLang, useUi } from '../i18n'

const TZ = 'Asia/Seoul'

// Live Seoul time, so visitors in other time zones know what time it is here.
export function SeoulClock() {
  const { lang } = useLang()
  const ui = useUi()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const locale = lang === 'ko' ? 'ko-KR' : 'en-US'
  const time = new Intl.DateTimeFormat(locale, { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(now)
  const day = new Intl.DateTimeFormat(locale, { timeZone: TZ, weekday: 'long', month: 'short', day: 'numeric' }).format(now)

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-track/60 px-4 py-3">
      <Clock size={18} aria-hidden="true" className="text-accent" />
      <div>
        <div className="text-xs text-ink-3">{ui.seoulNow}</div>
        <div className="text-lg font-semibold tabular-nums text-ink">
          <time dateTime={now.toISOString()}>{time}</time> <span className="text-sm font-normal text-ink-3">KST · {day}</span>
        </div>
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-accent/30 px-3 py-1 text-xs text-accent">{ui.openToRelocation}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ok/10 px-3 py-1 text-xs text-ok-ink">
          <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-ok motion-reduce:animate-none" />
          {ui.replyFast}
        </span>
      </div>
    </div>
  )
}
