import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { resume } from '../content'
import { useL10n, useUi } from '../i18n'
import { GitHubIcon } from '../components/Icon'

const ROWS = ['symptom', 'cause', 'fix', 'outcome'] as const

export function OpenSource({ closing }: { closing?: string }) {
  const ui = useUi()
  const l = useL10n()
  const reduce = useReducedMotion()
  const github = resume.basics.links.github

  return (
    <div className="flex flex-col gap-4">
      {resume.openSource.map((entry) => {
        const e = l.openSource(entry)
        return (
          <article key={e.id} className="rounded-2xl border border-line p-4 sm:p-5">
            <h3 className="font-medium text-ink">{e.title}</h3>
            {/* Rows appear one after another each time the section is brought back into memory. */}
            <ol className="mt-3 flex flex-col gap-2.5">
              {ROWS.map((row, i) => (
                <motion.li
                  key={row}
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduce ? 0 : 0.25 + i * 0.35, duration: 0.35 }}
                  className="grid grid-cols-[5.5rem_1fr] gap-3 text-sm"
                >
                  <span className={`font-medium ${row === 'outcome' ? 'text-accent' : 'text-ink-3'}`}>{ui.storyLabels[row]}</span>
                  <span className="text-ink-2">{e.story[row]}</span>
                </motion.li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-3 text-sm">
              <span className="font-medium text-ink" title={e.projectDescription}>
                {e.project}
              </span>
              <span className="rounded-full bg-track px-2 py-0.5 text-xs text-ink-2">{ui.bugReport}</span>
              <a
                href={e.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-accent underline underline-offset-2 hover:no-underline"
              >
                {ui.readIssue}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </article>
        )
      })}
      {closing && github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 self-start text-sm text-ink-2 hover:text-accent"
        >
          <GitHubIcon size={15} />
          {closing}
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      )}
    </div>
  )
}
