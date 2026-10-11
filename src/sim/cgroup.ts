// A tiny model of a cgroup v2 memory controller.
// Sections are clean file-backed page cache: reclaim drops them, a later read
// refaults them from disk. Anon memory is fixed and never reclaimed (no swap).

export type MaxSetting = '256M' | '1G'

export const MAX_MB: Record<MaxSetting, number> = { '256M': 256, '1G': 1024 }
export const ANON_MB = 40
export const SECTION_MB = 96
export const REFAULT_MS = 700
// avg10 is an exponential moving average over a 10s window, sampled here every 1s.
export const PSI_DECAY = Math.exp(-1 / 10)

export const capacity = (max: MaxSetting) => Math.floor((MAX_MB[max] - ANON_MB) / SECTION_MB)

export type CgroupState = {
  max: MaxSetting
  resident: string[]
  loading: string[]
  lastAccess: Record<string, number>
  clock: number
  refaults: number
  psi: number // memory "some" avg10, percent
  stallMs: number // stall time accumulated since the last PSI sample
  lastCmd: string
}

export type Action =
  | { type: 'touch'; id: string }
  | { type: 'refault-start'; id: string; quiet?: boolean }
  | { type: 'refault-done'; id: string; quiet?: boolean }
  | { type: 'set-max'; max: MaxSetting }
  | { type: 'psi-tick' }

export function initialState(max: MaxSetting, open: string[]): CgroupState {
  const lastAccess: Record<string, number> = {}
  open.forEach((id, i) => (lastAccess[id] = i + 1))
  return {
    max,
    resident: open,
    loading: [],
    lastAccess,
    clock: open.length,
    refaults: 0,
    psi: 0,
    stallMs: 0,
    lastCmd: max === '256M' ? `cat ${open.map((id) => `${id}.md`).join(' ')}` : `echo ${max} > memory.max`,
  }
}

const lru = (ids: string[], lastAccess: Record<string, number>) =>
  [...ids].sort((a, b) => (lastAccess[a] ?? 0) - (lastAccess[b] ?? 0))[0]

export function reducer(s: CgroupState, a: Action): CgroupState {
  switch (a.type) {
    case 'touch': {
      if (!s.resident.includes(a.id) || s.lastAccess[a.id] === s.clock) return s
      const clock = s.clock + 1
      return { ...s, clock, lastAccess: { ...s.lastAccess, [a.id]: clock } }
    }

    case 'refault-start': {
      if (s.resident.includes(a.id) || s.loading.includes(a.id)) return s
      const lastCmd = a.quiet ? s.lastCmd : `cat ${a.id}.md   # page cache miss, reading from disk…`
      return { ...s, loading: [...s.loading, a.id], lastCmd }
    }

    case 'refault-done': {
      if (!s.loading.includes(a.id)) return s
      const clock = s.clock + 1
      const lastAccess = { ...s.lastAccess, [a.id]: clock }
      let resident = [...s.resident, a.id]
      const evicted: string[] = []
      while (resident.length > capacity(s.max)) {
        const victim = lru(resident.filter((id) => id !== a.id), lastAccess)
        resident = resident.filter((id) => id !== victim)
        evicted.push(victim)
      }
      // A refault that forces something else out is thrashing: the task stalled
      // waiting on IO for memory it recently had, which is what PSI counts.
      const thrashing = evicted.length > 0
      return {
        ...s,
        clock,
        lastAccess,
        resident,
        loading: s.loading.filter((id) => id !== a.id),
        refaults: s.refaults + 1,
        stallMs: s.stallMs + (thrashing ? REFAULT_MS : 0),
        lastCmd: a.quiet
          ? s.lastCmd
          : thrashing
          ? `cat ${a.id}.md   # refault; reclaimed ${evicted.map((id) => `${id}.md`).join(', ')} (LRU)`
          : `cat ${a.id}.md   # refault; room to spare`,
      }
    }

    case 'set-max': {
      const cmd = `echo ${a.max} > memory.max`
      if (a.max === s.max) return { ...s, lastCmd: cmd }
      if (a.max === '1G') return { ...s, max: a.max, lastCmd: `${cmd}   # room for every section` }
      // Shrinking: reclaim least recently used file pages until we fit.
      const keep = [...s.resident]
        .sort((x, y) => (s.lastAccess[y] ?? 0) - (s.lastAccess[x] ?? 0))
        .slice(0, capacity(a.max))
      const dropped = s.resident.filter((id) => !keep.includes(id))
      return {
        ...s,
        max: a.max,
        loading: [],
        resident: s.resident.filter((id) => keep.includes(id)),
        lastCmd: `${cmd}   # dropped ${dropped.length} section${dropped.length === 1 ? '' : 's'} from page cache, kept the most recent`,
      }
    }

    case 'psi-tick': {
      const stall = Math.min(1, s.stallMs / 1000)
      const psi = s.psi * PSI_DECAY + stall * 100 * (1 - PSI_DECAY)
      const rounded = psi < 0.005 ? 0 : psi
      if (rounded === s.psi && s.stallMs === 0) return s
      return { ...s, psi: rounded, stallMs: Math.max(0, s.stallMs - 1000) }
    }
  }
}

export function stats(s: CgroupState) {
  const maxMb = MAX_MB[s.max]
  const fileMb = s.resident.length * SECTION_MB
  const currentMb = ANON_MB + fileMb
  return { maxMb, fileMb, anonMb: ANON_MB, currentMb, pct: currentMb / maxMb }
}
