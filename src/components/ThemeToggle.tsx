import { useState } from 'react'
import { flushSync } from 'react-dom'
import { Moon, Sun } from 'lucide-react'
import { useUi } from '../i18n'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  const set = document.documentElement.getAttribute('data-theme')
  if (set === 'light' || set === 'dark') return set
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

type DocWithTransitions = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme)
  const ui = useUi()

  const apply = (next: Theme) => {
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Storage can be blocked; the switch still works for this visit.
    }
    flushSync(() => setTheme(next))
  }

  // The new theme grows out of the button as a circle (View Transitions API).
  // Browsers without it cross-fade colours instead; reduced motion switches instantly.
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const doc = document as DocWithTransitions
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return apply(next)
    if (!doc.startViewTransition) {
      const root = document.documentElement
      root.classList.add('theme-fade')
      apply(next)
      window.setTimeout(() => root.classList.remove('theme-fade'), 600)
      return
    }
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    doc.startViewTransition(() => apply(next)).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }

  const label = theme === 'dark' ? ui.themeToLight : ui.themeToDark
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
    >
      <span key={theme} className="theme-icon inline-flex">
        {theme === 'dark' ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
      </span>
    </button>
  )
}
