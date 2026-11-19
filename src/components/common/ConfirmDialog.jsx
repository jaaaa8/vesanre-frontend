import { useEffect, useRef, useState } from 'react'

export default function ConfirmDialog({ open, title, message, requireReason, confirmText = 'Xác nhận', onConfirm, onCancel, busy, confirmDisabled }) {
  const ref = useRef(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const cancel = () => {
    setReason('')
    onCancel()
  }

  const submit = (event) => {
    event.preventDefault()
    const value = reason.trim()
    setReason('')
    onConfirm(requireReason ? value : undefined)
  }

  return (
    <dialog
      ref={ref}
      className="ui-dialog"
      onCancel={(e) => {
        e.preventDefault()
        if (!busy) cancel()
      }}
    >
      <form onSubmit={submit}>
        <h3>{title}</h3>
        {message && <div>{message}</div>}
        {requireReason && (
          <label className="ui-field">
            <span>Lý do</span>
            <textarea required maxLength={1000} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
        )}
        <div className="ui-actions">
          <button type="button" className="ui-btn ghost" onClick={cancel} disabled={busy}>
            Hủy
          </button>
          <button type="submit" className="ui-btn primary" disabled={busy || confirmDisabled || (requireReason && !reason.trim())}>
            {busy ? 'Đang xử lý…' : confirmText}
          </button>
        </div>
      </form>
    </dialog>
  )
}
