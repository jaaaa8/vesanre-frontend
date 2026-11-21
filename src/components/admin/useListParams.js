import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { needsRewrite, patchParams, readListParams } from '../../utils/adminRules'

const toSearch = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [k, String(v)]))

export function useListParams(statuses, extra) {
  const [search, setSearch] = useSearchParams()
  const params = readListParams(search, statuses, extra)

  // Replace invalid values (?status=FOO) in the address bar with the ones actually used.
  useEffect(() => {
    if (needsRewrite(search, params)) setSearch(toSearch(params), { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const setParams = (patch) => {
    setSearch(toSearch(patchParams(params, patch)), { replace: true })
  }

  return { params, setParams }
}
