import { useEffect, useState } from 'react'

function ToastItem({ toast }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShow(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  return (
    <div className={`toast${show ? ' show' : ''}`} role="status">
      <span className="tick" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span>{toast.message}</span>
    </div>
  )
}

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null
  return (
    <div className="toast-wrap" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
