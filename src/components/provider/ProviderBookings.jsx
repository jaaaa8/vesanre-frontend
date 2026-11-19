import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { getVenue, listProviderBookings, listVenues } from '../../utils/api'
import { needsRewrite } from '../../utils/adminRules'
import { PROVIDER_BOOKING_FILTERS, readProviderBookingParams } from '../../utils/bookingRules'
import StatusTabs from '../admin/StatusTabs'
import BookingCard from '../booking/BookingCard'
import AsyncView from '../common/AsyncView'
import Pagination from '../common/Pagination'

const toSearch = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== 0).map(([k, v]) => [k, String(v)]))

export default function ProviderBookings({ onLogout }) {
  const navigate = useNavigate()
  const [search, setSearch] = useSearchParams()
  const params = readProviderBookingParams(search)
  const { venueId, courtId, date, status, page } = params

  // Replace dropped values (?date= without a venue, ?status=FOO) in the address bar with the ones actually used.
  useEffect(() => {
    if (needsRewrite(search, params)) setSearch(toSearch(params), { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const venues = useApi(listVenues, [])
  const venue = useApi(venueId ? () => getVenue(venueId) : () => Promise.resolve(null), [venueId])
  const list = useApi(
    () => listProviderBookings({ venueId, courtId, date, status: status === 'ALL' ? '' : status, page, size: 10 }),
    [venueId, courtId, date, status, page],
  )

  const update = (patch) => setSearch(toSearch({ ...params, page: 0, ...patch }), { replace: true })

  return (
    <section className="pv-card">
      <div className="pv-card-head">
        <h2>Lịch đặt</h2>
      </div>
      <div className="pv-filters">
        <label>
          <span>Cơ sở</span>
          <select value={venueId} onChange={(e) => update({ venueId: e.target.value, courtId: '', date: '' })}>
            <option value="">Tất cả</option>
            {venues.data?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Sân</span>
          <select value={courtId} disabled={!venueId} onChange={(e) => update({ courtId: e.target.value })}>
            <option value="">—</option>
            {venue.data?.courts?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Ngày</span>
          <input type="date" value={date} disabled={!venueId} onChange={(e) => update({ date: e.target.value })} />
          {!venueId && <small className="pv-muted">Chọn cơ sở để lọc theo ngày</small>}
        </label>
      </div>
      <StatusTabs options={PROVIDER_BOOKING_FILTERS} value={status} onChange={(s) => update({ status: s })} />
      <AsyncView state={list} empty={list.data?.items.length === 0} emptyText="Không có lịch đặt nào." onLogout={onLogout}>
        {list.data && (
          <>
            <ul className="bk-list">
              {list.data.items.map((b) => (
                <li key={b.id}>
                  <BookingCard booking={b} onOpen={(id) => navigate(`/provider/bookings/${id}`)} />
                </li>
              ))}
            </ul>
            <Pagination page={list.data.page} totalPages={list.data.totalPages} onChange={(p) => update({ page: p })} />
          </>
        )}
      </AsyncView>
    </section>
  )
}
