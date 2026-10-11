// Content types and pure helpers. No React, no JSON imports: vite.config.ts
// uses these too, to render the no-JavaScript fallback at build time.

export type Experience = {
  id: string
  role: string
  company: string
  companyLocalName?: string
  start: string
  end: string | null
  current: boolean
  highlights: string[]
}
export type MetricResult = { config: string; indexMemoryGB: number; qps: number; recallAt5: number }
export type Project = {
  id: string
  title: string
  status: string
  summary: string
  url: string | null
  confidential?: string
  metrics?: { dataset: string; fullDimensions: number; method: string; results: MetricResult[] }
}
export type WritingEntry = {
  id: string
  title: string
  publisher: string
  year: number
  language: 'EN' | 'KO'
  summary: string
  url: string | null
}
export type Resume = {
  basics: {
    name: string
    title: string
    tagline: string
    location: string
    timezone: string
    email: string
    links: { linkedin: string | null; github: string | null; portfolio: string | null; resumePdf: string | null }
  }
  experience: Experience[]
  projects: Project[]
  education: { credential: string; institution: string; end: string }[]
  languages: { language: string; level: string }[]
  writing: WritingEntry[]
}

export type RealWorkRef = { project?: string; writing?: string; text?: string }
export type SectionDef = {
  id: string
  title: string
  icon: string
  line: string
  body?: string
  detail?: string
  closing?: string
  flow?: { label: string; text: string }[]
  realWork?: RealWorkRef[]
  sizeMb: number // illustrative page-cache size
}
export type Site = {
  domain: string
  url: string
  cgroupPath: string
  agentsEnabled: boolean
  defaultOpen: string[]
  footnote: string
  footnoteMeasured: string
  experienceHighlights: Record<string, number[]>
  sections: SectionDef[]
  measured: {
    caption: string
    setup: string
    runs: { sql: string; result: string }[]
    conclusion: string
  }
}

export const enabledSections = (site: Site) => site.sections.filter((s) => s.id !== 'agents' || site.agentsEnabled)

export const titleLine = (r: Resume) => `${r.basics.title} | ${r.basics.tagline}`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const fmtMonth = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}
export const period = (e: Experience) => `${fmtMonth(e.start)} – ${e.current || !e.end ? 'present' : fmtMonth(e.end)}`

export const pickHighlights = (e: Experience, site: Site) =>
  (site.experienceHighlights[e.id] ?? [0, 1]).map((i) => e.highlights[i]).filter(Boolean)

export const educationLine = (r: Resume) =>
  r.education
    .filter((e) => !/certificate/i.test(e.credential))
    .map((e) => `${e.credential}, ${e.institution}`)
    .join(' · ')

export const languagesLine = (r: Resume) => r.languages.map((l) => `${l.language} (${l.level.toLowerCase()})`).join(' · ')

export type ResolvedWork =
  | { kind: 'link'; title: string; url: string }
  | { kind: 'note'; title: string; note: string }
  | { kind: 'text'; text: string }

// Projects without a public URL show their status or scope text, never results.
export function resolveWork(ref: RealWorkRef, r: Resume): ResolvedWork | null {
  if (ref.text) return { kind: 'text', text: ref.text }
  if (ref.project) {
    const p = r.projects.find((x) => x.id === ref.project)
    if (!p) return null
    if (p.url) return { kind: 'link', title: p.title, url: p.url }
    if (p.confidential) return { kind: 'note', title: p.title, note: p.summary }
    return { kind: 'note', title: p.title, note: p.status === 'in-progress' ? 'in progress' : p.status }
  }
  if (ref.writing) {
    const w = r.writing.find((x) => x.id === ref.writing)
    if (w?.url) return { kind: 'link', title: w.title, url: w.url }
  }
  return null
}

export const publishedWriting = (r: Resume) => r.writing.filter((w) => w.url)

export const dimsOf = (m: MetricResult) => Number(m.config.match(/^(\d+)-dim/)?.[1] ?? 0)
