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
  // Selects apply at once; typed fields (keyword, price) wait for "Tìm".
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

  return (
    <form className="pub-filters" onSubmit={submit}>
      <label className="ui-field pub-wide">
        <span>Từ khóa</span>
        <input value={form.q} onChange={set('q')} maxLength={100} placeholder="Tên sân, địa chỉ" />
      </label>
      <label className="ui-field">
        <span>Thành phố</span>
        <select value={form.city} onChange={choose('city', { district: '' })}>
          <option value="">Tất cả thành phố</option>
          {locations.map((l) => (
            <option key={l.city} value={l.city}>
              {l.city}
            </option>
          ))}
        </select>
      </label>
      <label className="ui-field">
        <span>Quận</span>
        <select value={form.district} onChange={choose('district')} disabled={!form.city}>
          <option value="">Tất cả quận</option>
          {districtsOf(locations, form.city).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <label className="ui-field">
        <span>Môn</span>
        <select value={form.sport} onChange={choose('sport')}>
          <option value="">Tất cả môn</option>
          {sports.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="ui-field">
        <span>Sắp xếp</span>
        <select value={form.sort} onChange={choose('sort')}>
          {SORT_LABELS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <details className="pub-more pub-wide" open={!!(params.minPrice || params.maxPrice)}>
        <summary>Lọc thêm theo giá</summary>
        <div className="pub-more-body">
          <label className="ui-field">
            <span>Giá từ (đ/giờ)</span>
            <input type="number" min={0} step={1} value={form.minPrice} onChange={set('minPrice')} />
          </label>
          <label className="ui-field">
            <span>Giá đến (đ/giờ)</span>
            <input type="number" min={0} step={1} value={form.maxPrice} onChange={set('maxPrice')} />
          </label>
        </div>
      </details>
      {error && (
        <p className="pub-error pub-wide" role="alert">
          {error}
        </p>
      )}
      {chips.length > 0 && (
        <ul className="pub-chips pub-wide" aria-label="Bộ lọc đang bật">
          {chips.map(([key, label, extra]) => (
            <li key={key}>
              <button type="button" className="pub-chip" aria-label={`Bỏ lọc ${label}`} onClick={() => onSubmit({ ...params, [key]: '', ...extra, page: 0 })}>
                {label} <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="ui-actions pub-wide">
        <button type="button" className="ui-btn ghost" onClick={() => onSubmit(CLEARED)}>
          Xóa lọc
        </button>
        <button type="submit" className="ui-btn primary" disabled={loading}>
          Tìm
        </button>
      </div>
    </form>
  )
}
