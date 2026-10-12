import { useL10n } from '../i18n'

// Endless ticker of core skills. The list is rendered twice so the loop is seamless;
// it pauses on hover and stays still for people who prefer reduced motion.
export function Marquee() {
  const skills = useL10n().coreSkills()
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden || undefined}>
      {skills.map((s) => (
        <li key={s} className="flex items-center gap-8 whitespace-nowrap font-display text-2xl italic text-ink-2 sm:text-3xl">
          {s}
          <span aria-hidden="true" className="text-accent-gradient text-xl not-italic">✦</span>
        </li>
      ))}
    </ul>
  )
  return (
    <div className="marquee group relative overflow-hidden border-y border-line py-5">
      <div className="marquee-track flex w-max group-hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
