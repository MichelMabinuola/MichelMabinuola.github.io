import { trimToFit, type MaxSetting, type Sizes } from '../sim/cgroup'

// ?max=1G&open=vector,database  →  validated starting state.
// Unknown or disabled ids are ignored; anything unusable falls back to the starved default.
export function readShareState(
  search: string,
  known: string[],
  defaults: string[],
  sizes: Sizes,
): { max: MaxSetting; open: string[] } {
  const fallback = trimToFit(defaults.filter((id) => known.includes(id)), '256M', sizes)
  const q = new URLSearchParams(search)
  const rawMax = (q.get('max') ?? '').trim().toUpperCase()
  const max: MaxSetting = rawMax === '1G' || rawMax === '1024M' ? '1G' : '256M'
  if (max === '1G') return { max, open: [...known] }

  const wanted = [...new Set((q.get('open') ?? '').split(',').map((s) => s.trim().toLowerCase()))]
    .filter((id) => known.includes(id))
  const open = trimToFit(wanted, max, sizes)
  return { max, open: open.length ? open : fallback }
}

// `open` is in display order, top first.
export function shareUrl(max: MaxSetting, open: string[]): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('max', max)
  url.searchParams.set('open', open.join(','))
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
