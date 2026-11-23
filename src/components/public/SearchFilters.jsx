import { useState } from 'react'
import { formatVnd } from '../../utils/format'
import { districtsOf } from '../../utils/publicRules'

const SORT_LABELS = [
  ['newest', 'Mới nhất'],
  ['price_asc', 'Giá tăng dần'],
  ['price_desc', 'Giá giảm dần'],
]
const CLEARED = { q: '', city: '', district: '', sport: '', minPrice: '', maxPrice: '', sort: 'newest', page: 0 }

export default function SearchFilters({ params, sports, locations, loading, onSubmit }) {
  const [form, setForm] = useState(params)
  const [error, setError] = useState('')
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const apply = (next) => {
    setForm(next)
    if (next.minPrice !== '' && next.maxPrice !== '' && Number(next.minPrice) > Number(next.maxPrice)) {
      setError('Giá từ không được lớn hơn giá đến')
      return
    }
    setError('')
    onSubmit({ ...next, page: 0 })
  }
  // Selects and sport pills apply at once; typed fields (keyword, price) wait for "Tìm".
  const choose = (key, extra) => (e) => apply({ ...form, [key]: e.target.value, ...extra })

  // Chips show the applied filters (URL), not unsubmitted edits; removing city also clears its district.
  const chips = [
    params.q && ['q', `"${params.q}"`],
    params.city && ['city', params.city, { district: '' }],
    params.district && ['district', params.district],
    params.sport && ['sport', sports.find((s) => s.code === params.sport)?.name ?? params.sport],
    params.minPrice && ['minPrice', `Từ ${formatVnd(params.minPrice)}`],
    params.maxPrice && ['maxPrice', `Đến ${formatVnd(params.maxPrice)}`],
  ].filter(Boolean)

  const submit = (e) => {
    e.preventDefault()
    apply(form)
  }

  const sportOptions = [{ code: '', name: 'Tất cả' }, ...sports]

  return (
    <form className="search-widget sr-filters" role="search" onSubmit={submit}>
      <div className="sw-bar sr-bar">
        <div className="sfield sfield-wide">
          <label htmlFor="srQ">Từ khóa</label>
          <input id="srQ" value={form.q} onChange={set('q')} maxLength={100} placeholder="Tên sân, địa chỉ" />
        </div>
        <div className="sfield">
          <label htmlFor="srCity">Thành phố</label>
          <select id="srCity" value={form.city} onChange={choose('city', { district: '' })}>
            <option value="">Tất cả thành phố</option>
            {locations.map((l) => (
              <option key={l.city} value={l.city}>
                {l.city}
              </option>
            ))}
          </select>
        </div>
        <div className="sfield">
          <label htmlFor="srDistrict">Quận</label>
          <select id="srDistrict" value={form.district} onChange={choose('district')} disabled={!form.city}>
            <option value="">Tất cả quận</option>
            {districtsOf(locations, form.city).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="sw-btn" disabled={loading}>
          Tìm sân{' '}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="spills" role="group" aria-label="Chọn môn thể thao">
        {sportOptions.map((s) => (
          <button
            key={s.code}
            type="button"
            className={`spill${form.sport === s.code ? ' on' : ''}`}
            aria-pressed={form.sport === s.code}
            onClick={() => apply({ ...form, sport: s.code })}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="sr-extra">
        <div className="sfield">
          <label htmlFor="srMin">Giá từ (đ/giờ)</label>
          <input id="srMin" type="number" inputMode="numeric" min={0} step={1} value={form.minPrice} onChange={set('minPrice')} placeholder="0" />
        </div>
        <div className="sfield">
          <label htmlFor="srMax">Giá đến (đ/giờ)</label>
          <input id="srMax" type="number" inputMode="numeric" min={0} step={1} value={form.maxPrice} onChange={set('maxPrice')} placeholder="Không giới hạn" />
        </div>
        <div className="sfield">
          <label htmlFor="srSort">Sắp xếp</label>
          <select id="srSort" value={form.sort} onChange={choose('sort')}>
            {SORT_LABELS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="sw-btn ghost" onClick={() => onSubmit(CLEARED)}>
          Xóa lọc
        </button>
      </div>

      {error && (
        <p className="pub-error" role="alert">
          {error}
        </p>
      )}
      {chips.length > 0 && (
        <ul className="pub-chips" aria-label="Bộ lọc đang bật">
          {chips.map(([key, label, extra]) => (
            <li key={key}>
              <button type="button" className="pub-chip" aria-label={`Bỏ lọc ${label}`} onClick={() => onSubmit({ ...params, [key]: '', ...extra, page: 0 })}>
                {label} <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}
