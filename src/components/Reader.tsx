import { useState } from 'react'
import { ArrowUpRight, Check, Link2 } from 'lucide-react'
import previewsJson from '../../content/previews.json'
import type { WritingEntry } from '../model'
import { useLang, useUi } from '../i18n'
import { copyText } from '../share/url'
import { panelBtn, SidePanel } from './SidePanel'

type Preview = {
  original: 'en' | 'ko'
  keyPoints: { en: string[]; ko: string[] }
  excerpt: { en: string[]; ko: string[] }
}
const previews = previewsJson as Record<string, Preview>

// Previews a post on this site, with links out to the full post.
export function Reader({ entry, onClose }: { entry: WritingEntry | null; onClose: () => void }) {
  const ui = useUi()
  const { lang } = useLang()
  const [copied, setCopied] = useState(false)

  const p = entry ? previews[entry.id] : undefined
  const translated = p ? p.original !== lang : false

  const copy = async () => {
    if (!entry?.url) return
    setCopied(await copyText(entry.url))
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <SidePanel
      open={entry !== null}
      onClose={onClose}
      labelledBy="reader-title"
      actions={
        entry && (
          <>
            <button type="button" onClick={copy} className={panelBtn}>
              {copied ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
              {copied ? ui.linkCopied : ui.copyLink}
            </button>
            <a href={entry.url!} target="_blank" rel="noopener noreferrer" className={panelBtn}>
              {ui.openNewTab}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </>
        )
      }
    >
      {entry && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
            <span>
              {entry.publisher} · {entry.year}
            </span>
            <span className={`rounded-full px-2 py-0.5 ${entry.language === 'KO' ? 'bg-accent-soft text-accent' : 'bg-track text-ink-2'}`}>
              {entry.language === 'KO' ? ui.langTagKO : ui.langTagEN}
            </span>
          </div>
          <h2 id="reader-title" className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {entry.title}
          </h2>
          <p className="mt-3 text-ink-2">{entry.summary}</p>

          {p && (
            <>
              <ul className="mt-5 flex flex-wrap gap-2">
                {p.keyPoints[lang].map((k) => (
                  <li key={k} className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-accent">
                    {k}
                  </li>
                ))}
              </ul>

              <div className="relative mt-8">
                <div className="mb-3 text-xs font-medium text-ink-3">{translated ? ui.translatedExcerpt : ui.excerpt}</div>
                <div className="flex flex-col gap-4 border-l-2 border-line pl-4 text-[15px] leading-relaxed text-ink-2" lang={lang}>
                  {p.excerpt[lang].map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" aria-hidden="true" />
              </div>
            </>
          )}

          <a
            href={entry.url!}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-surface hover:opacity-85"
          >
            {ui.readFullPost}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </>
      )}
    </SidePanel>
  )
}
