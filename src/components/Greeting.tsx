import { useEffect, useState } from 'react'
import { useUi } from '../i18n'

type Part = 'morning' | 'afternoon' | 'evening' | 'night'

// Uses the visitor's own clock, not Seoul time: it greets them for their part of the day.
function partOfDay(d: Date): Part {
  const h = d.getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 22) return 'evening'
  return 'night'
}

export function Greeting() {
  const ui = useUi()
  const [part, setPart] = useState<Part>(() => partOfDay(new Date()))

  useEffect(() => {
    const t = window.setInterval(() => setPart(partOfDay(new Date())), 60_000)
    return () => window.clearInterval(t)
  }, [])

  return (
    <p className="mt-6 text-lg font-medium text-ink-2 sm:text-xl">
      {ui.greeting[part]}{' '}
      <span aria-hidden="true" className="wave inline-block origin-[70%_70%]">
        👋
      </span>
    </p>
  )
}
