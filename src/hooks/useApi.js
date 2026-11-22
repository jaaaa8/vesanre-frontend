import { useCallback, useEffect, useState } from 'react'

// ponytail: deps are joined into a key, so they must be primitives (ids, page numbers, filter strings).
export function useApi(fn, deps) {
  const [tick, setTick] = useState(0)
  const key = [...deps, tick].join('|')
  const [state, setState] = useState({ key: null, data: null, error: null })

  useEffect(() => {
    let cancelled = false
    fn().then(
      (data) => !cancelled && setState({ key, data, error: null }),
      (error) => !cancelled && setState({ key, data: null, error }),
    )
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  const setData = useCallback(
    (update) => setState((s) => ({ ...s, data: typeof update === 'function' ? update(s.data) : update })),
    [],
  )
  const loading = state.key !== key
  return { data: state.data, error: loading ? null : state.error, loading, reload, setData }
}
