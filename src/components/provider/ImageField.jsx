import { useRef } from 'react'
import { toast } from 'react-toastify'
import { validateImageFile } from '../../utils/providerRules'

export default function ImageField({ accept = 'image/jpeg,image/png,image/webp', count = 0, onFile, busy, label = 'Tải ảnh lên' }) {
  const ref = useRef(null)

  const change = (event) => {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    const error = validateImageFile(file, count)
    if (error) return toast.error(error)
    onFile(file)
  }

  return (
    <>
      <input ref={ref} type="file" accept={accept} hidden onChange={change} />
      <button type="button" className="ui-btn" onClick={() => ref.current.click()} disabled={busy}>
        {busy ? 'Đang tải…' : label}
      </button>
    </>
  )
}
