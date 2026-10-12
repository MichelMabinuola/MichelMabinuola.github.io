import { flushSync } from 'react-dom'
import { motion } from 'framer-motion'
import { useLang, useUi, type Lang } from '../i18n'

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ko', label: '한국어' },
]

type DocWithTransitions = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }

export function LangSwitch() {
  const { lang, setLang } = useLang()
  const ui = useUi()

  // The new language wipes across the page like turning a page: left→right into Korean,
  // right→left back to English (View Transitions API). Without it, the content just
  // fades in; reduced motion switches instantly.
  const choose = (next: Lang) => {
    if (next === lang) return
    const doc = document as DocWithTransitions
    const root = document.documentElement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setLang(next)
    if (!doc.startViewTransition) {
      setLang(next)
      root.classList.remove('lang-fade')
      void root.offsetWidth
      root.classList.add('lang-fade')
      window.setTimeout(() => root.classList.remove('lang-fade'), 500)
      return
    }
    root.dataset.vt = next === 'ko' ? 'lang-ko' : 'lang-en'
    doc
      .startViewTransition(() => flushSync(() => setLang(next)))
      .finished.finally(() => delete root.dataset.vt)
  }

  return (
    <div role="radiogroup" aria-label={ui.langSwitch} className="relative inline-flex h-9 items-center rounded-full border border-line bg-surface p-0.5">
      {OPTIONS.map((o) => {
        const on = lang === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            lang={o.value}
            onClick={() => choose(o.value)}
            className={`relative h-full rounded-full px-3 text-sm transition-colors duration-300 ${on ? 'text-surface' : 'text-ink-2 hover:text-ink'}`}
          >
            {/* The highlight slides between the two options. */}
            {on && <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
