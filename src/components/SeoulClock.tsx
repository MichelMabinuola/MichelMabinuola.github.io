import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { useLang, useUi } from '../i18n'

const TZ = 'Asia/Seoul'

// Live Seoul time, plus whether it is currently Korean working hours (Mon–Fri, 9:00–18:00).
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
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23', weekday: 'short' }).formatToParts(now)
  const hour = Number(parts.find((p) => p.type === 'hour')?.value)
  const weekday = parts.find((p) => p.type === 'weekday')?.value
  const working = weekday !== 'Sat' && weekday !== 'Sun' && hour >= 9 && hour < 18

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-track/60 px-4 py-3">
      <Clock size={18} aria-hidden="true" className="text-accent" />
      <div>
        <div className="text-xs text-ink-3">{ui.seoulNow}</div>
        <div className="text-lg font-semibold tabular-nums text-ink">
          <time dateTime={now.toISOString()}>{time}</time> <span className="text-sm font-normal text-ink-3">KST · {day}</span>
        </div>
      </div>
      <span
        className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${working ? 'bg-accent-soft text-accent' : 'bg-surface text-ink-2'}`}
      >
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${working ? 'bg-accent' : 'bg-line-strong'}`} />
        {working ? ui.workingNow : ui.offHours}
      </span>
    </div>
  )
}
