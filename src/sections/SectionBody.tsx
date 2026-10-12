import { ArrowRight, ArrowUpRight, FileText } from 'lucide-react'
import { OPEN_RESUME } from '../events'
import { resume } from '../content'
import type { SectionDef } from '../model'
import { useL10n, useUi } from '../i18n'
import { AgentReplay } from '../demos/AgentReplay'
import { DbDemo } from '../demos/DbDemo'
import { VectorDemo } from '../demos/VectorDemo'
import { Writing } from './Writing'
import { Latest } from './Latest'
import { OpenSource } from './OpenSource'
import { SideProjects } from './SideProjects'
import { GitHubIcon } from '../components/Icon'
import { SeoulClock } from '../components/SeoulClock'

export function SectionBody({ section }: { section: SectionDef }) {
  switch (section.id) {
    case 'about':
      return <About section={section} />
    case 'latest':
      return <Latest />
    case 'experience':
      return <Experience />
    case 'vector':
      return <VectorDemo />
    case 'database':
      return <DbDemo />
    case 'opensource':
      return <OpenSource closing={section.closing} />
    case 'sideprojects':
      return <SideProjects note={section.note} />
    case 'agents':
      return <AgentReplay />
    case 'writing':
      return <Writing closing={section.closing} />
    case 'contact':
      return <Contact />
    default:
      return null
  }
}

function About({ section }: { section: SectionDef }) {
  return (
    <div className="text-ink-2">
      {section.body && <p className="text-lg leading-relaxed">{section.body}</p>}
      {section.flow && (
        <ol className="mt-5 flex flex-wrap items-center gap-2 text-sm" aria-label={section.flow.map((f) => f.label).join(" → ")}>
          {section.flow.map((f, i) => (
            <li key={f.label} className="flex items-center gap-2">
              <span className="rounded-full bg-track px-3 py-1" title={f.text}>
                <span className="font-medium text-ink">{f.label}</span>
              </span>
              {i < section.flow!.length - 1 && <ArrowRight aria-hidden="true" size={14} className="text-ink-3" />}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function Experience() {
  const ui = useUi()
  const l = useL10n()
  // Professional certifications only; scholarships and course certificates stay in the resume PDF.
  const certs = resume.certificatesAndAwards.filter((c) => /certified/i.test(c.name))
  return (
    <div>
      <ol className="border-accent-gradient relative flex flex-col gap-6 border-l pl-6">
        {resume.experience.map((e) => (
          <li key={e.id} className="relative">
            <span
              aria-hidden="true"
              className={`absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-surface ${e.current ? 'bg-accent' : 'bg-line-strong'}`}
            />
            <div className="text-xs text-ink-3">{l.period(e)}</div>
            <div className="mt-0.5 font-medium text-ink">
              {l.role(e)}{' '}
              <span className="font-normal text-ink-2">
                · {l.isKo && e.companyLocalName ? e.companyLocalName : e.company}
                {!l.isKo && e.companyLocalName && (
                  <span lang="ko" className="text-ink-3">
                    {' '}
                    {e.companyLocalName}
                  </span>
                )}
              </span>
            </div>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-2 marker:text-accent">
              {l.highlights(e).map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-ink-3">{ui.education}</dt>
        <dd className="text-ink-2">{l.education()}</dd>
        {certs.length > 0 && (
          <>
            <dt className="text-ink-3">{ui.certifications}</dt>
            <dd className="text-ink-2">{certs.map((c) => `${c.name} (${c.year})`).join(' · ')}</dd>
          </>
        )}
        <dt className="text-ink-3">{ui.languages}</dt>
        <dd className="text-ink-2">{l.languages()}</dd>
      </dl>
    </div>
  )
}

function Contact() {
  const ui = useUi()
  const { email, links } = resume.basics
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm transition-colors hover:border-accent"
      >
        <span className="text-ink-3">{ui.email}</span>
        <span className="font-medium text-ink">{email}</span>
      </a>
      {links.linkedin && (
        <a
          href={links.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm transition-colors hover:border-accent"
        >
          <span className="text-ink-3">LinkedIn</span>
          <span className="font-medium text-ink">{links.linkedin.replace(/\/$/, '').split('/').pop()}</span>
          <ArrowUpRight size={15} aria-hidden="true" className="text-ink-3" />
        </a>
      )}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(OPEN_RESUME))}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm transition-colors hover:border-accent"
      >
        <FileText size={15} aria-hidden="true" className="text-ink-3" />
        <span className="font-medium text-ink">{ui.resume}</span>
      </button>
      {links.github && (
        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-line px-4 py-3 text-sm transition-colors hover:border-accent"
        >
          <GitHubIcon size={15} className="text-ink-3" />
          <span className="font-medium text-ink">{links.github.replace(/\/$/, '').split('/').pop()}</span>
          <ArrowUpRight size={15} aria-hidden="true" className="text-ink-3" />
        </a>
      )}
      <div className="w-full">
        <SeoulClock />
      </div>
    </div>
  )
}
