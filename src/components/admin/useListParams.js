import { useSearchParams } from 'react-router-dom'
import { readListParams } from '../../utils/adminRules'

export function useListParams(statuses, extra) {
  const [search, setSearch] = useSearchParams()
  const params = readListParams(search, statuses, extra)

  const setParams = (patch) => {
    const next = { ...params, ...patch }
    if ('status' in patch || 'targetType' in patch) next.page = 0
    const query = Object.fromEntries(Object.entries(next).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [k, String(v)]))
    setSearch(query, { replace: true })
  }

  return { params, setParams }
}
