import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { getAmenities } from '../../utils/api'
import AsyncView from '../common/AsyncView'

export default function AmenityPicker({ scope, value, onSave, busy }) {
  const catalog = useApi(getAmenities, [])
  const [selected, setSelected] = useState(() => new Map(value.map((a) => [a.amenityId, a.details || ''])))
  const options = (catalog.data || []).filter((a) => a.scope === scope || a.scope === 'BOTH')

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(id)) next.delete(id)
      else next.set(id, '')
      return next
    })

  const setDetails = (id, details) => setSelected((prev) => new Map(prev).set(id, details))

  const save = (event) => {
    event.preventDefault()
    onSave([...selected].filter(([id]) => options.some((a) => a.id === id)).map(([amenityId, details]) => ({ amenityId, details: details.trim() || null })))
  }

  return (
    <AsyncView state={catalog} empty={options.length === 0} emptyText="Chưa có tiện ích nào trong danh mục.">
      <form className="pv-grid" onSubmit={save}>
        <div className="pv-checks">
          {options.map((a) => (
            <label key={a.id} className="pv-check">
              <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} />
              {a.name}
              {selected.has(a.id) && (
                <input
                  type="text"
                  placeholder="Ghi chú"
                  maxLength={255}
                  value={selected.get(a.id)}
                  onChange={(e) => setDetails(a.id, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>
        <div className="ui-actions">
          <button type="submit" className="ui-btn primary" disabled={busy}>
            {busy ? 'Đang lưu…' : 'Lưu tiện ích'}
          </button>
        </div>
      </form>
    </AsyncView>
  )
}
