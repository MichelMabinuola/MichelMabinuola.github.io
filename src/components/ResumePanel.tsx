import { useState } from 'react'
import { ArrowUpRight, Check, Download, FileText, Link2 } from 'lucide-react'
import { resume, site } from '../content'
import { useUi } from '../i18n'
import { copyText } from '../share/url'
import { panelBtn, SidePanel } from './SidePanel'

// The resume PDF lives in /public. Phones can't render a PDF inside a page, so they get a button instead.
const PDF = encodeURI(resume.basics.links.resumePdf ?? '')
const DOWNLOAD_NAME = `${resume.basics.name.replace(/\s+/g, '-')}-Resume.pdf`

export function ResumePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ui = useUi()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const url = new URL(site.url + '/')
    url.searchParams.set('view', 'resume')
    setCopied(await copyText(url.toString()))
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      labelledBy="resume-title"
      wide
      actions={
        <>
          <button type="button" onClick={copy} className={panelBtn}>
            {copied ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
            <span className="hidden sm:inline">{copied ? ui.linkCopied : ui.copyLink}</span>
          </button>
          <a href={PDF} download={DOWNLOAD_NAME} className={panelBtn}>
            <Download size={15} aria-hidden="true" />
            <span className="hidden sm:inline">{ui.download}</span>
          </a>
          <a href={PDF} target="_blank" rel="noopener noreferrer" className={panelBtn}>
            <span className="hidden sm:inline">{ui.openNewTab}</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </>
      }
    >
      <h2 id="resume-title" className="sr-only">
        {ui.resume}: {resume.basics.name}
      </h2>

      <iframe
        src={`${PDF}#view=FitH`}
        title={`${ui.resume}: ${resume.basics.name}`}
        className="hidden min-h-[70vh] w-full flex-1 rounded-xl border border-line bg-white sm:block"
      />

      <div className="flex flex-col items-center gap-4 py-16 text-center sm:hidden">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent-soft text-accent">
          <FileText size={30} aria-hidden="true" />
        </span>
        <p className="text-lg font-semibold text-ink">{resume.basics.name}</p>
        <p className="text-sm text-ink-2">{ui.resumeMobile}</p>
        <a
          href={PDF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-surface"
        >
          {ui.openPdf}
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <a href={PDF} download={DOWNLOAD_NAME} className="text-sm text-accent underline underline-offset-2">
          {ui.download}
        </a>
      </div>
    </SidePanel>
  )
}
