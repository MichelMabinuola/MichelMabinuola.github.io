import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowUpRight, FileText, Mail, MapPin } from 'lucide-react'
import { resume, SECTIONS } from './content'
import { titleLine } from './model'
import { useCgroup } from './sim/useCgroup'
import { useL10n, useUi } from './i18n'
import { MemoryPanel } from './components/MemoryPanel'
import { SectionCard } from './components/SectionCard'
import { ThemeToggle } from './components/ThemeToggle'
import { LangSwitch } from './components/LangSwitch'
import { ScrollTop } from './components/ScrollTop'
import { MeasuredLink, MeasuredNote } from './components/Measured'
import { GitHubIcon } from './components/Icon'
import { HeroStats } from './components/HeroStats'
import { ResumePanel } from './components/ResumePanel'
import { OPEN_RESUME } from './events'

export default function App() {
  const { state, refault, setMax, touch } = useCgroup()
  // The resume opens from the hero, from Contact (via an event), or from a ?view=resume link.
  const [resumeOpen, setResumeOpen] = useState(() => new URLSearchParams(window.location.search).get('view') === 'resume')
  const closeResume = useCallback(() => setResumeOpen(false), [])
  useEffect(() => {
    const open = () => setResumeOpen(true)
    window.addEventListener(OPEN_RESUME, open)
    return () => window.removeEventListener(OPEN_RESUME, open)
  }, [])
  const ui = useUi()
  const l = useL10n()
  const sections = SECTIONS.map(l.section)
  // Under the limit, the section brought back most recently goes on top; with everything showing, use page order.
  const visible =
    state.max === '1G'
      ? sections.filter((s) => state.resident.includes(s.id))
      : state.resident.map((id) => sections.find((s) => s.id === id)).filter((s) => s !== undefined)
  const hidden = sections.filter((s) => !state.resident.includes(s.id))
  const about = sections.find((s) => s.id === 'about')
  const { email, links } = resume.basics

  return (
    <div className="min-h-screen">
      <div className="relative border-b border-line">
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="hero-dots pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-8 sm:pb-14">
          <nav className="flex items-center justify-end gap-2">
            <LangSwitch />
            <ThemeToggle />
          </nav>

          <header className="fade-up mt-10 sm:mt-16">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink-2">
              <MapPin size={14} aria-hidden="true" className="text-accent" />
              {ui.location}
            </p>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-ink sm:text-8xl">{resume.basics.name}</h1>
            <p className="mt-5 text-xl font-semibold text-accent sm:text-2xl">{l.titleLine(titleLine(resume))}</p>
            {about && <p className="mt-3 max-w-2xl text-lg text-ink-2 sm:text-xl">{about.line}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-surface transition-opacity hover:opacity-85"
              >
                <Mail size={16} aria-hidden="true" />
                {ui.emailMe}
              </a>
              <button
                type="button"
                onClick={() => setResumeOpen(true)}
                aria-haspopup="dialog"
                className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
              >
                <FileText size={16} aria-hidden="true" />
                {ui.resume}
              </button>
              {links.linkedin && (
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
                >
                  LinkedIn
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              )}
              {links.github && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
                >
                  <GitHubIcon size={16} />
                  GitHub
                </a>
              )}
            </div>
            <HeroStats />
          </header>

          <div className="mt-12">
            <MemoryPanel state={state} visible={visible} hidden={hidden} total={sections.length} onLoad={refault} onSetMax={setMax} />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-5">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((s) => (
              <SectionCard key={s.id} section={s} onTouch={touch} />
            ))}
          </AnimatePresence>
        </div>

        <footer className="mt-12 text-sm text-ink-3">
          <p>
            {ui.footer} <MeasuredLink>{ui.footerMeasured}</MeasuredLink>
          </p>
          <MeasuredNote />
        </footer>
      </main>
      <ScrollTop />
      <ResumePanel open={resumeOpen} onClose={closeResume} />
    </div>
  )
}
