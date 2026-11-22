import { useState } from 'react'
import { toast } from 'react-toastify'

export function useAdminAction(reload) {
  const [busy, setBusy] = useState(false)

  const run = async (action, success) => {
    setBusy(true)
    try {
      await action()
      toast.success(success)
      reload()
    } catch (error) {
      toast.error(error.message)
      if (error.status === 409) reload() // someone else decided first: show the fresh state
    } finally {
      setBusy(false)
    }
  }

  return { busy, run }
}
