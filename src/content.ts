import resumeJson from '../content/resume.json'
import siteJson from '../content/site.json'
import traceJson from '../content/agent-trace.json'
import { enabledSections, type Resume, type Site } from './model'

export type TraceStep = {
  kind: 'goal' | 'plan' | 'tool_call' | 'tool_result' | 'answer'
  text?: string
  tool?: string
  input?: string
  caption: string
}
export type Trace = { placeholder?: boolean; label: string; project: string; steps: TraceStep[] }

export const resume = resumeJson as unknown as Resume
export const site = siteJson as Site
export const trace = traceJson as Trace
export const SECTIONS = enabledSections(site)
export const SECTION_IDS = SECTIONS.map((s) => s.id)
export const SECTION_SIZES = Object.fromEntries(SECTIONS.map((s) => [s.id, s.sizeMb]))
