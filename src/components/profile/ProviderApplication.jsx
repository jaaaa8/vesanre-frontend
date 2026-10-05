import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ApiError, applyProvider } from '../../utils/api'

const MAX = { legalName: 200, taxId: 50, shopName: 160, shopDescription: 2000 }
const EMPTY = { legalName: '', taxId: '', shopName: '', shopDescription: '' }

export default function ProviderApplication({ status, roles, onApplied, onUnauthorized }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [err, setErr] = useState('')
  const [sending, setSending] = useState(false)
  const firstRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    firstRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const setField = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }))

  const openModal = () => {
    setErr('')
    setOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]))
    if (!payload.legalName) return setErr('Vui lòng nhập tên pháp lý.')
    const tooLong = Object.keys(MAX).find((k) => payload[k].length > MAX[k])
    if (tooLong) return setErr(`Nội dung vượt quá ${MAX[tooLong]} ký tự.`)
    setErr('')
    setSending(true)
    try {
      const remote = await applyProvider(payload)
      setOpen(false)
      setForm(EMPTY)
      onApplied(remote)
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) return onUnauthorized?.()
      setErr(
        cause instanceof ApiError && cause.status === 409
          ? 'Bạn đã gửi đăng ký, vui lòng chờ duyệt.'
          : cause instanceof ApiError
            ? cause.message
            : 'Không thể kết nối máy chủ. Vui lòng thử lại.',
      )
    } finally {
      setSending(false)
    }
  }

  const isProvider = status === 'APPROVED' || roles?.includes('PROVIDER')
  const pending = status === 'PENDING'

  return (
    <>
      <div className="provider-cta" id="providerCta">
        <div className="pv-badge-row">
          <span className="pv-mini">SportHub Partners</span>
        </div>
        {isProvider ? (
          <h3>Bạn đã là Chủ sân</h3>
        ) : pending ? (
          <h3>Đơn đăng ký chủ sân đang chờ duyệt</h3>
        ) : (
          <>
            <h3>Bạn sở hữu sân thể thao?</h3>
            {status === 'REJECTED' && (
              <p>
                <b>Đơn đăng ký trước đó đã bị từ chối.</b> Bạn có thể đăng ký lại.
              </p>
            )}
            <p>Đăng ký làm đối tác SportHub để tiếp cận 12.000+ người chơi và quản lý lịch tự động.</p>
            <button className="pv-cta-btn" type="button" onClick={openModal}>
              Đăng ký làm Chủ sân <span aria-hidden="true">↗</span>
            </button>
          </>
        )}
      </div>

      {createPortal(
        <div className={`pv-modal-wrap${open ? ' open' : ''}`} aria-hidden={open ? 'false' : 'true'} inert={!open}>
          <div className="pv-modal-bg" onClick={() => setOpen(false)} />
          <div className="pv-modal-panel" role="dialog" aria-modal="true" aria-labelledby="pvTitle">
            <div className="pv-modal-head">
              <div>
                <span className="eyebrow dark">
                  <i />
                  Đối tác SportHub
                </span>
                <h2 className="pv-modal-title" id="pvTitle">
                  Đăng ký làm
                  <br />
                  Chủ sân
                </h2>
                <p className="pv-modal-sub">
                  Điền thông tin cơ sở — sau khi admin duyệt, bạn sẽ trở thành Chủ sân trên SportHub.
                </p>
              </div>
              <button className="pv-x" type="button" aria-label="Đóng" onClick={() => setOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <form className="pv-form" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="flabel" htmlFor="pvLegalName">
                  Tên pháp lý (cá nhân / doanh nghiệp)
                </label>
                <input
                  ref={firstRef}
                  className="finput"
                  id="pvLegalName"
                  type="text"
                  maxLength={MAX.legalName}
                  value={form.legalName}
                  onChange={setField('legalName')}
                  placeholder="VD: Công ty TNHH Goal Time"
                />
              </div>
              <div className="pv-grid two">
                <div>
                  <label className="flabel" htmlFor="pvTaxId">
                    Mã số thuế
                  </label>
                  <input
                    className="finput"
                    id="pvTaxId"
                    type="text"
                    maxLength={MAX.taxId}
                    value={form.taxId}
                    onChange={setField('taxId')}
                    placeholder="Không bắt buộc"
                  />
                </div>
                <div>
                  <label className="flabel" htmlFor="pvShopName">
                    Tên cơ sở / Sân thể thao
                  </label>
                  <input
                    className="finput"
                    id="pvShopName"
                    type="text"
                    maxLength={MAX.shopName}
                    value={form.shopName}
                    onChange={setField('shopName')}
                    placeholder="VD: Goal Time Stadium"
                  />
                </div>
              </div>
              <div>
                <label className="flabel" htmlFor="pvShopDesc">
                  Mô tả cơ sở
                </label>
                <textarea
                  className="finput"
                  id="pvShopDesc"
                  rows={4}
                  maxLength={MAX.shopDescription}
                  value={form.shopDescription}
                  onChange={setField('shopDescription')}
                  placeholder="Không bắt buộc"
                />
              </div>
              <div className="ferr" role="alert">
                {err}
              </div>
              <button className="pv-submit" type="submit" disabled={sending}>
                {sending ? 'Đang gửi...' : 'Gửi hồ sơ đăng ký đối tác ↗'}
              </button>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
