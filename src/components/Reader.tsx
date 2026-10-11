import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Check, Link2, X } from 'lucide-react'
import previewsJson from '../../content/previews.json'
import type { WritingEntry } from '../model'
import { useLang, useUi } from '../i18n'
import { copyText } from '../share/url'

type Preview = {
  original: 'en' | 'ko'
  keyPoints: { en: string[]; ko: string[] }
  excerpt: { en: string[]; ko: string[] }
}
const previews = previewsJson as Record<string, Preview>

// Half-screen panel that previews a post on this site, with links out to the full post.
// Rendered into <body> so the animated section card around it can't break `position: fixed`.
export function Reader({ entry, onClose }: { entry: WritingEntry | null; onClose: () => void }) {
  const ui = useUi()
  const { lang } = useLang()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!entry) return
    const opener = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      opener?.focus?.()
    }
  }, [entry, onClose])

  const p = entry ? previews[entry.id] : undefined
  const translated = p ? p.original !== lang : false

  const copy = async () => {
    if (!entry?.url) return
    setCopied(await copyText(entry.url))
    window.setTimeout(() => setCopied(false), 2000)
  }

  return createPortal(
    <AnimatePresence>
      {entry && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reader-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-line bg-surface sm:w-1/2 sm:min-w-[480px] sm:max-w-[760px]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2 border-b border-line px-4 py-3 sm:px-6">
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={ui.close}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-2 hover:bg-track hover:text-ink"
              >
                <X size={18} aria-hidden="true" />
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm text-ink-2 hover:border-line-strong hover:text-ink"
                >
                  {copied ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
                  {copied ? ui.linkCopied : ui.copyLink}
                </button>
                <a
                  href={entry.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm text-ink-2 hover:border-line-strong hover:text-ink"
                >
                  {ui.openNewTab}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
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
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
