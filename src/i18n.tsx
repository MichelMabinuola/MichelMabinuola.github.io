import { createContext, useContext, useEffect, useState } from 'react'
import koJson from '../content/ko.json'
import { resume, site } from './content'
import { educationLine, languagesLine, resolveWork, type Experience, type RealWorkRef, type ResolvedWork, type SectionDef, type WritingEntry } from './model'

export type Lang = 'en' | 'ko'

const ko = koJson as {
  titleLine: string
  location: string
  sections: Record<string, Partial<Omit<SectionDef, 'flow'>> & { flow?: { label: string; text: string }[]; realWorkText?: string }>
  experience: Record<string, { role?: string; highlights?: Record<string, string> }>
  education: string
  languages: string
  projects: Record<string, { title?: string; summary?: string }>
  writing: Record<string, { title?: string; summary?: string }>
  publishers: Record<string, string>
  measured: { title: string; caption: string; setup: string; runs: string[]; conclusion: string }
}

// Interface text. Korean is pre-written: nothing is translated at runtime.
const en = {
  location: 'Seoul, Korea',
  emailMe: 'Email me',
  langSwitch: 'Language',
  themeToDark: 'Switch to dark mode',
  themeToLight: 'Switch to light mode',
  limitedMemory: 'This page has limited memory',
  used: (cur: number, max: number) => `${cur} MB of ${max} MB used`,
  noteLoading: 'Loading it back…',
  noteFull: 'Every section fits now.',
  noteStart: (n: number, total: number) => `Only ${n} of ${total} sections fit. Tap one to bring it back.`,
  noteAfter: 'To make room, the section you looked at longest ago was put away.',
  loading: (t: string) => `Loading ${t}…`,
  show: (t: string) => `Show ${t}`,
  showEverything: 'Show everything',
  goBack: 'Limit memory again',
  copyLink: 'Copy link',
  linkCopied: 'Link copied',
  realWork: 'Real work',
  howItWorks: 'How it works',
  inProgress: 'in progress',
  aboutMeasured: 'The memory idea here isn’t just for fun:',
  aboutMeasuredLink: 'I measured it on a real database server',
  footer: 'A playful take on how computers manage memory. Memory sizes are made up for fun.',
  footerMeasured: 'See what I measured on a real database server.',
  education: 'Education',
  languages: 'Languages',
  present: 'present',
  email: 'Email',
  langTagEN: 'EN',
  langTagKO: 'Korean',
  illustrative: 'Illustrative',
  illustrativeExample: 'Illustrative example',
  vecSizeFirst: 'Size of each vector searched first',
  vecFull: ' (full)',
  vecMemory: 'Memory needed',
  vecQps: 'Searches / sec',
  vecAccuracy: 'Accuracy',
  vecLow: 'noticeably lower: the trade-off',
  vecHigh: 'almost as good as full size',
  vecCaption: 'Search a short version of each vector first, then double-check the best matches with the full one.',
  vecDataset: '10M Wikipedia vectors',
  vecPublished: 'published on the SingleStore blog',
  dbQueryTime: 'query time',
  dbAdd: 'add an index',
  dbUndo: 'undo the fix',
  dbSlow: 'Almost all the time goes to reading every row just to find the few it needs.',
  dbFast: 'Like a book’s index: jump straight to the right pages instead of reading the whole book.',
  dbParts: ['scanning everything', 'joining', 'sending results', 'reading matching rows only'],
  dbDetails: 'see the details',
  kWaiting: 'messages waiting',
  kAdd: 'add a worker',
  kReset: 'reset',
  kIncoming: 'incoming →',
  kLane: 'lane',
  kWorker: 'worker',
  kSentences: [
    'One worker can’t keep up with three busy lanes, so messages pile up.',
    'Two workers share the lanes. The pile shrinks, slowly.',
    'Each lane has its own worker now. Nothing is left waiting.',
  ],
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

const koUi: typeof en = {
  location: ko.location,
  emailMe: '이메일 보내기',
  langSwitch: '언어',
  themeToDark: '다크 모드로 전환',
  themeToLight: '라이트 모드로 전환',
  limitedMemory: '이 페이지는 메모리가 제한되어 있어요',
  used: (cur, max) => `${max} MB 중 ${cur} MB 사용 중`,
  noteLoading: '다시 불러오는 중…',
  noteFull: '이제 모든 섹션이 들어갑니다.',
  noteStart: (n, total) => `${total}개 중 ${n}개 섹션만 들어가요. 하나를 눌러 다시 불러오세요.`,
  noteAfter: '공간을 만들려고 가장 오래전에 본 섹션을 치워 두었어요.',
  loading: (t) => `${t} 불러오는 중…`,
  show: (t) => `${t} 보기`,
  showEverything: '모두 보기',
  goBack: '다시 메모리 제한하기',
  copyLink: '링크 복사',
  linkCopied: '링크 복사됨',
  realWork: '실제 작업',
  howItWorks: '작동 방식',
  inProgress: '진행 중',
  aboutMeasured: '이 페이지의 메모리 아이디어는 그냥 재미로 만든 게 아닙니다.',
  aboutMeasuredLink: '실제 데이터베이스 서버에서 측정했습니다',
  footer: '컴퓨터가 메모리를 관리하는 방식을 재미있게 보여 주는 페이지입니다. 메모리 크기는 재미로 정한 값입니다.',
  footerMeasured: '실제 데이터베이스 서버에서 측정한 결과 보기',
  education: '학력',
  languages: '언어',
  present: '현재',
  email: '이메일',
  langTagEN: '영어',
  langTagKO: '한국어',
  illustrative: '예시',
  illustrativeExample: '예시 데이터',
  vecSizeFirst: '먼저 검색하는 벡터 크기',
  vecFull: ' (전체)',
  vecMemory: '필요한 메모리',
  vecQps: '초당 검색 수',
  vecAccuracy: '정확도',
  vecLow: '눈에 띄게 낮아짐: 이것이 트레이드오프',
  vecHigh: '전체 크기와 거의 같음',
  vecCaption: '먼저 각 벡터의 짧은 버전으로 검색하고, 가장 잘 맞는 결과만 전체 벡터로 다시 확인합니다.',
  vecDataset: '위키피디아 벡터 1,000만 개',
  vecPublished: 'SingleStore 블로그에 게재',
  dbQueryTime: '쿼리 시간',
  dbAdd: '인덱스 추가',
  dbUndo: '원래대로',
  dbSlow: '필요한 몇 줄을 찾으려고 모든 행을 읽느라 거의 모든 시간을 씁니다.',
  dbFast: '책의 색인처럼, 책 전체를 읽는 대신 필요한 페이지로 바로 갑니다.',
  dbParts: ['전체 스캔', '조인', '결과 전송', '일치하는 행만 읽기'],
  dbDetails: '자세히 보기',
  kWaiting: '대기 중인 메시지',
  kAdd: '작업자 추가',
  kReset: '초기화',
  kIncoming: '유입 →',
  kLane: '레인',
  kWorker: '작업자',
  kSentences: [
    '작업자 한 명으로는 바쁜 레인 세 개를 감당할 수 없어서 메시지가 쌓입니다.',
    '작업자 두 명이 레인을 나눠 맡습니다. 쌓인 메시지가 천천히 줄어듭니다.',
    '이제 레인마다 작업자가 있습니다. 기다리는 메시지가 없습니다.',
  ],
  months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
}

const UI = { en, ko: koUi }

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} })

function initialLang(): Lang {
  const q = new URLSearchParams(window.location.search).get('lang')
  if (q === 'ko' || q === 'en') return q
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'ko' || saved === 'en') return saved
  } catch {
    // Storage blocked: fall through to the browser language.
  }
  return navigator.language?.toLowerCase().startsWith('ko') ? 'ko' : 'en'
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('lang', l)
    } catch {
      // The switch still works for this visit.
    }
  }
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>
}

export const useLang = () => useContext(LangCtx)
export const useUi = () => UI[useContext(LangCtx).lang]

// Content lookups: Korean when available, English otherwise.
export function useL10n() {
  const { lang } = useLang()
  const isKo = lang === 'ko'
  const ui = UI[lang]
  return {
    isKo,
    titleLine: (en: string) => (isKo ? ko.titleLine : en),
    section: (s: SectionDef): SectionDef => {
      if (!isKo) return s
      const k = ko.sections[s.id] ?? {}
      return { ...s, title: k.title ?? s.title, line: k.line ?? s.line, body: k.body ?? s.body, detail: k.detail ?? s.detail, closing: k.closing ?? s.closing, flow: k.flow ?? s.flow }
    },
    role: (e: Experience) => (isKo ? (ko.experience[e.id]?.role ?? e.role) : e.role),
    highlight: (e: Experience, i: number) => (isKo ? (ko.experience[e.id]?.highlights?.[i] ?? e.highlights[i]) : e.highlights[i]),
    period: (e: Experience) => {
      const fmt = (ym: string) => {
        const [y, m] = ym.split('-').map(Number)
        return isKo ? `${y}년 ${ui.months[m - 1]}` : `${ui.months[m - 1]} ${y}`
      }
      return `${fmt(e.start)} – ${e.current || !e.end ? ui.present : fmt(e.end)}`
    },
    education: () => (isKo ? ko.education : educationLine(resume)),
    languages: () => (isKo ? ko.languages : languagesLine(resume)),
    work: (ref: RealWorkRef, sectionId: string): ResolvedWork | null => {
      const w = resolveWork(ref, resume)
      if (!w || !isKo) return w
      if (w.kind === 'text') return { ...w, text: ko.sections[sectionId]?.realWorkText ?? w.text }
      const id = ref.project ?? ref.writing ?? ''
      const t = ref.project ? ko.projects[id] : ko.writing[id]
      const local = ref.writing ? resume.writing.find((x) => x.id === id) : undefined
      const title = (local as (WritingEntry & { titleLocal?: string }) | undefined)?.titleLocal ?? t?.title ?? w.title
      if (w.kind === 'link') return { ...w, title }
      const note = w.note === 'in progress' ? ui.inProgress : (t?.summary ?? w.note)
      return { ...w, title, note }
    },
    writing: (w: WritingEntry & { titleLocal?: string }) =>
      isKo
        ? { ...w, title: w.titleLocal ?? ko.writing[w.id]?.title ?? w.title, summary: ko.writing[w.id]?.summary ?? w.summary, publisher: ko.publishers[w.publisher] ?? w.publisher }
        : w,
    measured: () => {
      const m = site.measured
      if (!isKo) return { title: 'Measured for real: where the database’s memory went', ...m, runs: m.runs }
      return { title: ko.measured.title, caption: ko.measured.caption, setup: ko.measured.setup, conclusion: ko.measured.conclusion, runs: m.runs.map((r, i) => ({ sql: r.sql, result: ko.measured.runs[i] ?? r.result })) }
    },
  }
}
