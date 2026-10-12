import { resume } from '../content'

// Every skill from resume.json, in resume order. Linux performance is one entry:
// its items (CPU, memory, ...) only make sense together.
const SKILLS = resume.skills.flatMap((g) =>
  /linux performance/i.test(g.group) ? [`Linux performance: ${g.items.join(' · ')}`] : g.items,
)

// Endless ticker of skills in small spaced monospace capitals. The list is rendered twice
// so the loop is seamless; it pauses on hover and stays still for reduced motion.
export function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {SKILLS.map((s) => (
        <li key={s} className="flex items-center whitespace-nowrap font-mono text-xs uppercase tracking-[0.25em] text-accent/70">
          <span className="px-6">{s}</span>
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent/60" />
        </li>
      ))}
    </ul>
  )
  return (
    <div className="marquee group relative overflow-hidden border-y border-line py-3.5" aria-label="Skills">
      <div className="marquee-track flex w-max group-hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
