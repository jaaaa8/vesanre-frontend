import { useState } from 'react'
import { toast } from 'react-toastify'
import { deleteImage, reorderImages, uploadImage } from '../../utils/api'
import { imageOrderPayload, moveItem } from '../../utils/providerRules'
import ConfirmDialog from '../common/ConfirmDialog'
import ImageField from './ImageField'

const MAX_IMAGES = 10

export default function ImageManager({ ownerId, images, onChange }) {
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState(null)

  const run = async (action, success) => {
    setBusy(true)
    try {
      await action()
      if (success) toast.success(success)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  const upload = (file) => run(async () => onChange([...images, await uploadImage(ownerId, file)]), 'Đã tải ảnh lên')

  const move = (index, delta) =>
    run(async () => onChange(await reorderImages(ownerId, imageOrderPayload(moveItem(images, index, delta)))))

  const remove = () =>
    run(async () => {
      await deleteImage(ownerId, removing.id)
      onChange(images.filter((img) => img.id !== removing.id))
      setRemoving(null)
    }, 'Đã xóa ảnh')

  return (
    <div className="pv-grid">
      <div className="pv-row">
        <ImageField count={images.length} onFile={upload} busy={busy} disabled={images.length >= MAX_IMAGES} label={images.length >= MAX_IMAGES ? 'Đã đủ 10 ảnh' : undefined} />
        <span className="pv-muted">
          {images.length}/{MAX_IMAGES} ảnh · JPEG, PNG, WebP tối đa 5MB · ảnh đầu tiên là ảnh bìa
        </span>
      </div>
      {images.length === 0 ? (
        <p className="ui-empty">Chưa có ảnh nào.</p>
      ) : (
        <div className="pv-images">
          {images.map((img, index) => (
            <figure key={img.id} className="pv-image">
              <img src={img.url} alt={img.altText || `Ảnh ${index + 1}`} />
              <figcaption className="bar">
                <span>{index === 0 ? 'Ảnh bìa' : `#${index + 1}`}</span>
                <span>
                  <button type="button" className="ui-btn ghost" aria-label="Đưa lên" onClick={() => move(index, -1)} disabled={busy || index === 0}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className="ui-btn ghost"
                    aria-label="Đưa xuống"
                    onClick={() => move(index, 1)}
                    disabled={busy || index === images.length - 1}
                  >
                    ↓
                  </button>
                  <button type="button" className="ui-btn danger" aria-label="Xóa ảnh" onClick={() => setRemoving(img)} disabled={busy}>
                    ✕
                  </button>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      <ConfirmDialog open={Boolean(removing)} title="Xóa ảnh này?" confirmText="Xóa" onConfirm={remove} onCancel={() => setRemoving(null)} busy={busy} />
    </div>
  )
}
