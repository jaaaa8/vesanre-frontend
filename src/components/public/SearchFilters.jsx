import { useState } from 'react'
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

  const submit = (e) => {
    e.preventDefault()
    if (form.minPrice !== '' && form.maxPrice !== '' && Number(form.minPrice) > Number(form.maxPrice)) {
      setError('Giá từ không được lớn hơn giá đến')
      return
    }
    setError('')
    onSubmit({ ...form, page: 0 })
  }

  return (
    <form className="pub-filters" onSubmit={submit}>
      <label className="ui-field pub-wide">
        <span>Từ khóa</span>
        <input value={form.q} onChange={set('q')} maxLength={100} placeholder="Tên sân, địa chỉ" />
      </label>
      <label className="ui-field">
        <span>Thành phố</span>
        <select value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value, district: '' }))}>
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
        <select value={form.district} onChange={set('district')} disabled={!form.city}>
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
        <select value={form.sport} onChange={set('sport')}>
          <option value="">Tất cả môn</option>
          {sports.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="ui-field">
        <span>Giá từ</span>
        <input type="number" min={0} step={1} value={form.minPrice} onChange={set('minPrice')} />
      </label>
      <label className="ui-field">
        <span>Giá đến</span>
        <input type="number" min={0} step={1} value={form.maxPrice} onChange={set('maxPrice')} />
      </label>
      <label className="ui-field">
        <span>Sắp xếp</span>
        <select value={form.sort} onChange={set('sort')}>
          {SORT_LABELS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p className="pub-error pub-wide" role="alert">
          {error}
        </p>
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
