import { AnimatePresence } from 'framer-motion'
import { resume, SECTIONS } from './content'
import { titleLine } from './model'
import { useCgroup } from './sim/useCgroup'
import { MemoryPanel } from './components/MemoryPanel'
import { SectionCard } from './components/SectionCard'
import { ThemeToggle } from './components/ThemeToggle'
import { MeasuredLink, MeasuredNote } from './components/Measured'

export default function App() {
  const { state, refault, setMax, touch } = useCgroup()
  const visible = SECTIONS.filter((s) => state.resident.includes(s.id))
  const hidden = SECTIONS.filter((s) => !state.resident.includes(s.id))
  const { linkedin } = resume.basics.links

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8 sm:py-14">
      <main className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{resume.basics.name}</h1>
            <p className="mt-2 text-lg text-ink-2">{titleLine(resume)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong hover:text-ink"
              >
                LinkedIn
              </a>
            )}
            <ThemeToggle />
          </div>
        </header>

        <MemoryPanel state={state} hidden={hidden} total={SECTIONS.length} onLoad={refault} onSetMax={setMax} />

        <div className="mt-6 flex flex-col gap-4">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((s) => (
              <SectionCard key={s.id} section={s} onTouch={touch} />
            ))}
          </AnimatePresence>
        </div>

        <footer className="mt-10 text-xs text-ink-3">
          <p>
            A playful take on how computers manage memory. Memory sizes are made up for fun.{' '}
            <MeasuredLink>See what I measured on a real database server.</MeasuredLink>
          </p>
          <MeasuredNote />
        </footer>
      </main>
    </div>
  )
}
