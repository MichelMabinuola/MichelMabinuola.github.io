import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useUi } from '../i18n'

// Half-screen panel used by the article reader and the resume.
// Rendered into <body> so animated section cards can't break `position: fixed`.
export function SidePanel({
  open,
  onClose,
  labelledBy,
  actions,
  wide = false,
  children,
}: {
  open: boolean
  onClose: () => void
  labelledBy: string
  actions?: React.ReactNode
  wide?: boolean
  children: React.ReactNode
}) {
  const ui = useUi()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
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
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
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
            aria-labelledby={labelledBy}
            className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-line bg-surface sm:min-w-[480px] ${wide ? 'sm:w-[60vw] sm:max-w-[900px]' : 'sm:w-1/2 sm:max-w-[760px]'}`}
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
              <div className="ml-auto flex items-center gap-2">{actions}</div>
            </div>
            <div className={`flex-1 overflow-y-auto ${wide ? 'flex flex-col p-3 sm:p-4' : 'px-5 py-6 sm:px-8 sm:py-8'}`}>{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export const panelBtn =
  'inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm text-ink-2 hover:border-line-strong hover:text-ink'
