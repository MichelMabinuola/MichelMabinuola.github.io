import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import {
  educationLine,
  enabledSections,
  languagesLine,
  period,
  pickHighlights,
  publishedWriting,
  resolveWork,
  titleLine,
  type Resume,
  type SectionDef,
  type Site,
} from './src/model.ts'

const readJson = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const link = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`
const list = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : '')

function sectionHtml(s: SectionDef, r: Resume, site: Site): string {
  let body = ''
  if (s.body) body += `<p>${esc(s.body)}</p>`
  if (s.id === 'experience') {
    body += r.experience
      .map((e) => `<h3>${esc(e.role)} · ${esc(e.company)}${e.companyLocalName ? ` (${esc(e.companyLocalName)})` : ''} <small>${esc(period(e))}</small></h3>${list(pickHighlights(e, site).map(esc))}`)
      .join('')
    body += `<p>Education: ${esc(educationLine(r))}</p><p>Languages: ${esc(languagesLine(r))}</p>`
  }
  if (s.id === 'vector') {
    const m = r.projects.find((p) => p.id === 'matryoshka-vector-search')?.metrics
    if (m) body += list(m.results.map((x) => esc(`${x.config}: ${x.indexMemoryGB} GB index memory, ${x.qps} QPS, recall@5 ${(x.recallAt5 * 100).toFixed(1)}%`)))
  }
  if (s.id === 'writing') {
    body += list(publishedWriting(r).map((w) => `${link(w.url!, w.title)} · ${esc(w.publisher)}, ${w.year} [${w.language}]<br>${esc(w.summary)}`))
    if (s.closing) body += `<p>${esc(s.closing)}</p>`
  }
  if (s.id === 'latest') {
    body += list(
      r.latest.items.map(
        (i) =>
          `${i.kind === 'reading' ? 'Reading' : 'Learning'}: ${i.url ? link(i.url, i.title) : esc(i.title)}${i.author ? ` by ${esc(i.author)}` : ''}${i.note ? `. ${esc(i.note)}` : ''}`,
      ),
    )
  }
  if (s.id === 'opensource') {
    body += r.openSource
      .map(
        (e) =>
          `<h3>${esc(e.title)}</h3>${list([
            `Symptom: ${esc(e.story.symptom)}`,
            `Cause: ${esc(e.story.cause)}`,
            `Fix: ${esc(e.story.fix)}`,
            `Outcome: ${esc(e.story.outcome)}`,
          ])}<p>${esc(e.project)} · bug report · ${link(e.url, 'Read the issue on GitHub')}</p>`,
      )
      .join('')
    if (r.basics.links.github && s.closing) body += `<p>${link(r.basics.links.github, s.closing)}</p>`
  }
  if (s.id === 'sideprojects') {
    if (s.note) body += `<p><small>${esc(s.note)}</small></p>`
    body += list(r.sideProjects.map((p) => `${link(p.url, p.title)}: ${esc(p.summary)} (${esc(p.tech.join(', '))})`))
  }
  if (s.id === 'contact') {
    body += list([
      `Email: ${link(`mailto:${r.basics.email}`, r.basics.email)}`,
      ...(r.basics.links.linkedin ? [`LinkedIn: ${link(r.basics.links.linkedin, r.basics.links.linkedin)}`] : []),
      ...(r.basics.links.github ? [`GitHub: ${link(r.basics.links.github, r.basics.links.github)}`] : []),
    ])
  }
  const work = (s.realWork ?? []).map((ref) => resolveWork(ref, r)).filter((w) => w !== null)
  if (work.length)
    body += `<p>Real work: ${work
      .map((w) => (w.kind === 'link' ? link(w.url, w.title) : w.kind === 'note' ? `${esc(w.title)} (${esc(w.note)})` : esc(w.text)))
      .join(' · ')}</p>`
  return `<section><h2>${esc(s.title)}</h2><p>${esc(s.line)}</p>${body}</section>`
}

// Bakes the resume into index.html as plain HTML so the page still reads as a
// normal resume when JavaScript is off. React replaces it on mount.
function staticResume(): Plugin {
  return {
    name: 'static-resume',
    transformIndexHtml(html) {
      const r: Resume = readJson('content/resume.json')
      const site: Site = readJson('content/site.json')
      const m = site.measured
      const measured = `<section><h2>Measured for real</h2><p>${esc(m.caption)}</p><p>${esc(m.setup)}</p>${list(
        m.runs.map((x) => `<code>${esc(x.sql)}</code> ${esc(x.result)}`),
      )}<p>${esc(m.conclusion)}</p></section>`
      const skills = `<section><h2>Core skills</h2>${list(site.coreSkills.map(esc))}</section>`
      const fallback = `<main class="fallback"><h1>${esc(r.basics.name)}</h1><p>${esc(titleLine(r))}</p>${skills}${enabledSections(site)
        .map((s) => sectionHtml(s, r, site))
        .join('')}${measured}<p><small>${esc(site.footnote)}</small></p></main>`
      return html
        .replace('<!--static-resume-->', fallback)
        .replaceAll('%SITE_URL%', esc(site.url))
        .replaceAll('%PAGE_TITLE%', esc(site.pageTitle))
        .replaceAll('%NAME%', esc(r.basics.name))
        .replaceAll('%ROLE%', esc(r.basics.title))
        .replaceAll('%TITLE_LINE%', esc(titleLine(r)))
    },
  }
}

// Never ship the placeholder agent trace to production.
function guardAgentTrace(): Plugin {
  return {
    name: 'guard-agent-trace',
    apply: 'build',
    buildStart() {
      const site: Site = readJson('content/site.json')
      const trace = readJson('content/agent-trace.json')
      if (site.agentsEnabled && trace.placeholder)
        this.error('agentsEnabled is true but content/agent-trace.json is a placeholder. Add a real recorded run or set agentsEnabled to false.')
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), staticResume(), guardAgentTrace()],
})
