import { ArrowRight } from 'lucide-react'
import { resume, site } from '../content'
import type { SectionDef } from '../model'
import { useL10n, useUi } from '../i18n'
import { MeasuredLink } from '../components/Measured'
import { AgentReplay } from '../demos/AgentReplay'
import { DbDemo } from '../demos/DbDemo'
import { VectorDemo } from '../demos/VectorDemo'
import { KafkaDemo } from '../demos/KafkaDemo'
import { Writing } from './Writing'

export function SectionBody({ section }: { section: SectionDef }) {
  switch (section.id) {
    case 'about':
      return <About section={section} />
    case 'experience':
      return <Experience />
    case 'vector':
      return <VectorDemo />
    case 'database':
      return <DbDemo />
    case 'kafka':
      return <KafkaDemo />
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
  const ui = useUi()
  return (
    <div className="text-ink-2">
      {section.body && <p className="max-w-3xl">{section.body}</p>}
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
      <p className="mt-5 text-sm">
        {ui.aboutMeasured} <MeasuredLink>{ui.aboutMeasuredLink}</MeasuredLink>
      </p>
    </div>
  )
}

function Experience() {
  const ui = useUi()
  const l = useL10n()
  return (
    <div>
      <ol className="relative flex flex-col gap-6 border-l border-line pl-6">
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
            <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-2">
              {(site.experienceHighlights[e.id] ?? [0]).map((i) => (
                <li key={i}>{l.highlight(e, i)}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-ink-3">{ui.education}</dt>
        <dd className="text-ink-2">{l.education()}</dd>
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
        </a>
      )}
    </div>
  )
}
