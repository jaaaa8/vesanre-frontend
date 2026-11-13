import { useState } from 'react'
import { toast } from 'react-toastify'
import { useApi } from '../../hooks/useApi'
import { cancelChangeRequest, deleteShopLogo, getShop, submitShopChange, updateShop, uploadShopLogo } from '../../utils/api'
import AsyncView from '../common/AsyncView'
import ConfirmDialog from '../common/ConfirmDialog'
import StatusBadge from '../common/StatusBadge'
import ImageField from './ImageField'
import PendingChange from './PendingChange'

export default function ShopSection({ onLogout }) {
  const shop = useApi(getShop, [])
  return (
    <AsyncView state={shop} onLogout={onLogout}>
      {shop.data && <ShopBody key={shop.data.id} shop={shop.data} setShop={shop.setData} reload={shop.reload} />}
    </AsyncView>
  )
}

function ShopBody({ shop, setShop, reload }) {
  const [description, setDescription] = useState(shop.description || '')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState('')
  const [confirmLogo, setConfirmLogo] = useState(false)

  const run = async (kind, action, success) => {
    setBusy(kind)
    try {
      const result = await action()
      if (success) toast.success(success)
      return result
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy('')
    }
  }

  const saveDescription = async (event) => {
    event.preventDefault()
    const next = await run('desc', () => updateShop({ description: description.trim() }), 'Đã lưu')
    if (next) setShop(next)
  }

  const sendName = async (event) => {
    event.preventDefault()
    const value = name.trim()
    if (!value || value === shop.name) return toast.error('Nhập tên mới khác tên hiện tại')
    if (value.length > 160) return toast.error('Tên tối đa 160 ký tự')
    const next = await run('name', () => submitShopChange({ name: value }), 'Đã gửi yêu cầu đổi tên')
    if (next) {
      setName('')
      reload()
    }
  }

  const cancelName = async () => {
    await run('cancel', () => cancelChangeRequest(shop.pendingChange.id), 'Đã hủy yêu cầu')
    reload()
  }

  const uploadLogo = async (file) => {
    const next = await run('logo', () => uploadShopLogo(file), 'Đã cập nhật logo')
    if (next) setShop(next)
  }

  const removeLogo = async () => {
    await run('logo', () => deleteShopLogo(), 'Đã xóa logo')
    setConfirmLogo(false)
    reload()
  }

  return (
    <>
      <section className="pv-card">
        <div className="pv-card-head">
          <h2>{shop.name}</h2>
          <span className="meta">
            /{shop.slug} <StatusBadge status={shop.status} />
          </span>
        </div>
        <div className="pv-row">
          {shop.logoUrl ? <img className="pv-logo" src={shop.logoUrl} alt="Logo cửa hàng" /> : <span className="pv-logo">Chưa có logo</span>}
          <ImageField onFile={uploadLogo} busy={busy === 'logo'} label={shop.logoUrl ? 'Đổi logo' : 'Tải logo lên'} />
          {shop.logoUrl && (
            <button type="button" className="ui-btn danger" onClick={() => setConfirmLogo(true)} disabled={busy === 'logo'}>
              Xóa logo
            </button>
          )}
        </div>
        <form className="pv-grid" onSubmit={saveDescription}>
          <label className="ui-field">
            <span>Mô tả</span>
            <textarea rows={4} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <div className="ui-actions">
            <button type="submit" className="ui-btn primary" disabled={busy === 'desc'}>
              {busy === 'desc' ? 'Đang lưu…' : 'Lưu mô tả'}
            </button>
          </div>
        </form>
      </section>

      <section className="pv-card">
        <h2>Đổi tên cửa hàng</h2>
        <p className="pv-muted">Tên cửa hàng chỉ thay đổi sau khi admin duyệt.</p>
        {shop.pendingChange ? (
          <PendingChange change={shop.pendingChange} labels={{ name: 'Tên mới' }} onCancel={cancelName} busy={busy === 'cancel'} />
        ) : (
          <form className="pv-row" onSubmit={sendName}>
            <label className="ui-field" style={{ flex: 1 }}>
              <span>Tên mới</span>
              <input value={name} maxLength={160} onChange={(e) => setName(e.target.value)} />
            </label>
            <button type="submit" className="ui-btn primary" disabled={busy === 'name'} style={{ alignSelf: 'end' }}>
              Gửi yêu cầu
            </button>
          </form>
        )}
      </section>

      <ConfirmDialog
        open={confirmLogo}
        title="Xóa logo cửa hàng?"
        onConfirm={removeLogo}
        onCancel={() => setConfirmLogo(false)}
        busy={busy === 'logo'}
      />
    </>
  )
}
