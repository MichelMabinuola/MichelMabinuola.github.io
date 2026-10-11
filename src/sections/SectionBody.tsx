import { ArrowRight } from 'lucide-react'
import { resume, site } from '../content'
import { educationLine, languagesLine, period, pickHighlights, type SectionDef } from '../model'
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
  return (
    <div className="text-sm text-ink-2">
      {section.body && <p>{section.body}</p>}
      {section.flow && (
        <ol className="mt-4 grid grid-cols-2 gap-1.5 sm:grid-cols-4" aria-label="How the skills connect">
          {section.flow.map((f, i) => (
            <li key={f.label} className="rounded-lg border border-line px-2.5 py-1.5">
              <div className="text-xs font-medium text-ink">
                <span className="text-ink-3">{i + 1} </span>
                {f.label}
                {i < section.flow!.length - 1 && <ArrowRight aria-hidden="true" size={12} className="ml-1 inline text-ink-3" />}
              </div>
              <div className="text-xs text-ink-3">{f.text}</div>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-3">
        The memory idea on this page isn’t just a gimmick: <MeasuredLink>I measured it on a real database host</MeasuredLink>.
      </p>
    </div>
  )
}

function Experience() {
  return (
    <div className="text-sm">
      <ul className="flex flex-col gap-4">
        {resume.experience.map((e) => (
          <li key={e.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-medium text-ink">
                {e.role}{' '}
                <span className="font-normal text-ink-3">
                  · {e.company}
                  {e.companyLocalName && <span lang="ko"> ({e.companyLocalName})</span>}
                </span>
              </span>
              <span className="font-mono text-xs text-ink-3">{period(e)}</span>
            </div>
            <ul className="mt-1 list-disc pl-5 text-ink-2 marker:text-ink-3">
              {pickHighlights(e, site).map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-line pt-3 text-ink-2">
        <dt className="text-ink-3">Education</dt>
        <dd>{educationLine(resume)}</dd>
        <dt className="text-ink-3">Languages</dt>
        <dd>{languagesLine(resume)}</dd>
      </dl>
    </div>
  )
}

function Contact() {
  const { email, links } = resume.basics

  return (
    <div className="text-sm">
      <dl className="grid grid-cols-[5rem_1fr] gap-y-1.5">
        <dt className="text-ink-3">Email</dt>
        <dd className="min-w-0 truncate">
          <a href={`mailto:${email}`} className="text-accent underline underline-offset-2 hover:no-underline">
            {email}
          </a>
        </dd>
        {links.linkedin && (
          <>
            <dt className="text-ink-3">LinkedIn</dt>
            <dd className="min-w-0 truncate">
              <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:no-underline">
                {links.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </dd>
          </>
        )}
      </dl>
    </div>
  )
}
