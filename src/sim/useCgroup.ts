import { useCallback, useEffect, useReducer, useRef } from 'react'
import { initialState, reducer, REFAULT_MS, type MaxSetting } from './cgroup'
import { readShareState } from '../share/url'
import { SECTION_IDS, site } from '../content'

export function useCgroup() {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const { max, open } = readShareState(window.location.search, SECTION_IDS, site.defaultOpen)
    return initialState(max, open)
  })
  const timers = useRef(new Map<string, number>())

  useEffect(() => {
    const t = window.setInterval(() => dispatch({ type: 'psi-tick' }), 1000)
    const pending = timers.current
    return () => {
      window.clearInterval(t)
      pending.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  const refault = useCallback((id: string, quiet = false) => {
    if (timers.current.has(id)) return
    dispatch({ type: 'refault-start', id, quiet })
    const t = window.setTimeout(() => {
      timers.current.delete(id)
      dispatch({ type: 'refault-done', id, quiet })
    }, REFAULT_MS)
    timers.current.set(id, t)
  }, [])

  const setMax = useCallback(
    (max: MaxSetting) => {
      if (max === '256M') {
        timers.current.forEach((t) => window.clearTimeout(t))
        timers.current.clear()
      }
      dispatch({ type: 'set-max', max })
      // With room to spare, the visitor reads every section, so each one is read back in.
      if (max === '1G') SECTION_IDS.filter((id) => !state.resident.includes(id)).forEach((id) => refault(id, true))
    },
    [refault, state.resident],
  )

  const touch = useCallback((id: string) => dispatch({ type: 'touch', id }), [])

  return { state, refault, setMax, touch }
}
