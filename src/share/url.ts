import { capacity, type MaxSetting } from '../sim/cgroup'

// ?max=1G&open=vector,kafka  →  validated starting state.
// Unknown or disabled ids are ignored; anything unusable falls back to the starved default.
export function readShareState(
  search: string,
  known: string[],
  defaults: string[],
): { max: MaxSetting; open: string[] } {
  const fallback = defaults.filter((id) => known.includes(id)).slice(0, capacity('256M'))
  const q = new URLSearchParams(search)
  const rawMax = (q.get('max') ?? '').trim().toUpperCase()
  const max: MaxSetting = rawMax === '1G' || rawMax === '1024M' ? '1G' : '256M'
  if (max === '1G') return { max, open: [...known] }

  const open = [...new Set((q.get('open') ?? '').split(',').map((s) => s.trim().toLowerCase()))]
    .filter((id) => known.includes(id))
    .slice(-capacity(max))
  return { max, open: open.length ? open : fallback }
}

export function shareUrl(max: MaxSetting, open: string[], lastAccess: Record<string, number>): string {
  const ordered = [...open].sort((a, b) => (lastAccess[a] ?? 0) - (lastAccess[b] ?? 0))
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('max', max)
  url.searchParams.set('open', ordered.join(','))
  return url.toString().replace(/%2C/g, ',')
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    const ok = document.execCommand('copy')
    el.remove()
    return ok
  }
}
