import { useLang, useUi, type Lang } from '../i18n'

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ko', label: '한국어' },
]

export function LangSwitch() {
  const { lang, setLang } = useLang()
  const ui = useUi()
  return (
    <div role="radiogroup" aria-label={ui.langSwitch} className="inline-flex h-9 items-center rounded-full border border-line bg-surface p-0.5">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={lang === o.value}
          lang={o.value}
          onClick={() => setLang(o.value)}
          className={`h-full rounded-full px-3 text-sm transition-colors ${lang === o.value ? 'bg-accent text-surface' : 'text-ink-2 hover:text-ink'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
