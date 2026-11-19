import { useEffect, useState } from 'react'
import { listNotifications } from '../utils/api'
import { getSession } from '../utils/auth'

// null = not logged in or the request failed: callers render nothing.
export function useUnreadCount() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    if (!getSession()) return undefined
    let cancelled = false
    const load = () =>
      listNotifications({ size: 1 }).then(
        (p) => !cancelled && setCount(p.unreadCount),
        () => !cancelled && setCount(null),
      )
    load()
    window.addEventListener('focus', load)
    return () => {
      cancelled = true
      window.removeEventListener('focus', load)
    }
  }, [])

  return count
}
