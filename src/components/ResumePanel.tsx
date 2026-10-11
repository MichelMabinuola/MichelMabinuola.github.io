import { useState } from 'react'
import { ArrowUpRight, Check, Link2, Printer } from 'lucide-react'
import { resume, site } from '../content'
import { period, titleLine } from '../model'
import { useLang, useUi } from '../i18n'
import { copyText } from '../share/url'
import { panelBtn, SidePanel } from './SidePanel'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const fmt = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-8 border-b border-line pb-1.5 text-xs font-semibold uppercase tracking-wider text-accent">{children}</h3>
}

// The full resume, built from resume.json. Never shows a phone number.
export function ResumePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ui = useUi()
  const { lang } = useLang()
  const [copied, setCopied] = useState(false)
  const { basics } = resume

  const copy = async () => {
    const url = new URL(site.url + '/')
    url.searchParams.set('view', 'resume')
    setCopied(await copyText(url.toString()))
    window.setTimeout(() => setCopied(false), 2000)
  }

  const contacts = [
    { label: basics.email, href: `mailto:${basics.email}` },
    ...(basics.links.linkedin ? [{ label: 'LinkedIn', href: basics.links.linkedin }] : []),
    ...(basics.links.github ? [{ label: 'GitHub', href: basics.links.github }] : []),
    { label: 'Portfolio', href: site.url },
  ]

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      labelledBy="resume-title"
      printable
      actions={
        <>
          <button type="button" onClick={copy} className={panelBtn}>
            {copied ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
            {copied ? ui.linkCopied : ui.copyLink}
          </button>
          <button type="button" onClick={() => window.print()} className={panelBtn}>
            <Printer size={15} aria-hidden="true" />
            {ui.printResume}
          </button>
        </>
      }
    >
      <article lang="en" className="text-sm text-ink-2">
        {lang === 'ko' && <p className="print-hide mb-5 rounded-xl bg-track px-3 py-2 text-xs text-ink-3" lang="ko">{ui.resumeInEnglish}</p>}

        <h2 id="resume-title" className="text-3xl font-bold tracking-tight text-ink">
          {basics.name}
        </h2>
        <p className="mt-1 font-semibold text-ink">{titleLine(resume)}</p>
        <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
          <span>{basics.location}</span>
          {contacts.map((c) => (
            <span key={c.href} className="flex gap-2">
              <span aria-hidden="true">|</span>
              <a href={c.href} target={c.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" className="text-accent underline underline-offset-2">
                {c.label}
              </a>
            </span>
          ))}
        </p>

        <Heading>Skills</Heading>
        <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {resume.skills.map((g) => (
            <div key={g.group}>
              <dt className="font-semibold text-ink">{g.group}</dt>
              <dd>{g.items.join(', ')}</dd>
            </div>
          ))}
        </dl>

        <Heading>Experience</Heading>
        {resume.experience.map((e) => {
          const projects = resume.projects.filter((p) => p.employer === e.id)
          return (
            <section key={e.id} className="mt-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h4 className="font-semibold text-accent">
                  {e.role} | <span lang="ko">{e.companyLocalName}</span> ({e.company})
                </h4>
                <span className="text-xs text-ink-3">{period(e).replace('present', 'Present')}</span>
              </div>
              {e.companyDescription && <p className="mt-0.5 text-ink-3">{e.companyDescription}</p>}
              <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-ink-3">
                {e.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              {projects.length > 0 && (
                <>
                  <div className="mt-3 font-semibold text-ink">Selected projects</div>
                  <ul className="mt-1 list-disc space-y-1 pl-5 marker:text-ink-3">
                    {projects.map((p) => (
                      <li key={p.id}>
                        <span className="font-medium text-ink">
                          {p.title}
                          {p.year ? ` (${p.year})` : p.status === 'in-progress' ? ' (in progress)' : ''}
                        </span>{' '}
                        – {p.summary}
                        {p.url && (
                          <>
                            {' '}
                            <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-accent underline underline-offset-2">
                              link
                              <ArrowUpRight size={12} aria-hidden="true" />
                            </a>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )
        })}

        <Heading>Education</Heading>
        <ul className="mt-3 space-y-1">
          {resume.education.map((ed) => (
            <li key={ed.credential}>
              <span className="font-medium text-ink">{ed.credential}</span> – {ed.institution}
              {ed.gpa ? ` (${ed.gpa})` : ''} <span className="text-ink-3">| {fmt(ed.start)} – {fmt(ed.end)}</span>
            </li>
          ))}
        </ul>

        <Heading>Certificates and awards</Heading>
        <ul className="mt-3 space-y-1">
          {resume.certificatesAndAwards.map((c) => (
            <li key={c.name}>
              {c.name} <span className="text-ink-3">– {c.year}</span>
            </li>
          ))}
        </ul>

        <Heading>Spoken languages</Heading>
        <p className="mt-3">{resume.languages.map((l) => `${l.language} (${l.level})`).join(', ')}</p>
      </article>
    </SidePanel>
  )
}
