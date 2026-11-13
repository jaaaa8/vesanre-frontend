import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useApi } from '../../hooks/useApi'
import { deleteVenue, getVenue, setVenueAmenities, submitVenue } from '../../utils/api'
import AsyncView from '../common/AsyncView'
import ConfirmDialog from '../common/ConfirmDialog'
import StatusBadge from '../common/StatusBadge'
import AmenityPicker from './AmenityPicker'
import ImageManager from './ImageManager'
import VenueInfoTab from './VenueInfoTab'

const TABS = [
  ['info', 'Thông tin'],
  ['amenities', 'Tiện ích'],
  ['images', 'Hình ảnh'],
  ['courts', 'Sân con'],
]

export default function VenueDetail({ onLogout }) {
  const { id } = useParams()
  const venue = useApi(() => getVenue(id), [id])
  return (
    <AsyncView state={venue} onLogout={onLogout}>
      {venue.data && <VenueBody venue={venue.data} setVenue={venue.setData} reload={venue.reload} />}
    </AsyncView>
  )
}

function VenueBody({ venue, setVenue, reload }) {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'info'
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canSubmit = venue.status === 'DRAFT' || venue.status === 'REJECTED'
  const hasActiveCourt = venue.courts.some((c) => c.status === 'ACTIVE')

  const submit = async () => {
    setBusy(true)
    try {
      setVenue(await submitVenue(venue.id))
      toast.success('Đã gửi duyệt')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  const saveAmenities = async (items) => {
    setBusy(true)
    try {
      setVenue(await setVenueAmenities(venue.id, items))
      toast.success('Đã lưu tiện ích')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await deleteVenue(venue.id)
      toast.success('Đã xóa cơ sở')
      navigate('/provider/venues')
    } catch (error) {
      toast.error(error.message)
      setBusy(false)
      setConfirmDelete(false)
    }
  }

  return (
    <section className="pv-card">
      <Link to="/provider/venues" className="pv-back">
        ‹ Danh sách cơ sở
      </Link>
      <div className="pv-card-head">
        <h2>{venue.name}</h2>
        <div className="pv-row">
          <StatusBadge status={venue.status} />
          {canSubmit && (
            <button type="button" className="ui-btn primary" onClick={submit} disabled={busy || !hasActiveCourt}>
              Gửi duyệt
            </button>
          )}
          {venue.status === 'DRAFT' && (
            <button type="button" className="ui-btn danger" onClick={() => setConfirmDelete(true)} disabled={busy}>
              Xóa
            </button>
          )}
        </div>
      </div>
      {canSubmit && !hasActiveCourt && <p className="pv-muted">Cần ít nhất 1 sân con đang hoạt động để gửi duyệt.</p>}
      {venue.status === 'REJECTED' && <p className="pv-error">Bị từ chối, xem lý do trong email. Sửa thông tin rồi gửi duyệt lại.</p>}

      <div className="pv-tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setParams({ tab: key }, { replace: true })}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'info' && <VenueInfoTab key={JSON.stringify(venue)} venue={venue} onSaved={setVenue} reload={reload} />}
      {tab === 'amenities' && <AmenityPicker scope="VENUE" value={venue.amenities} onSave={saveAmenities} busy={busy} />}
      {tab === 'images' && (
        <ImageManager kind="venues" ownerId={venue.id} images={venue.images} onChange={(images) => setVenue({ ...venue, images })} />
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Xóa cơ sở này?"
        message="Chỉ cơ sở ở trạng thái Nháp mới xóa được. Thao tác không thể hoàn tác."
        confirmText="Xóa"
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
        busy={busy}
      />
    </section>
  )
}
