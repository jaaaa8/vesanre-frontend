import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { getSports } from '../../utils/api'
import { validateSports } from '../../utils/providerRules'
import AsyncView from '../common/AsyncView'

export default function CourtSportsTab({ value, onSave, busy }) {
  const catalog = useApi(getSports, [])
  const [selected, setSelected] = useState(() => new Set(value.map((s) => s.sportId)))
  const [primary, setPrimary] = useState(() => value.find((s) => s.primary)?.sportId ?? null)
  const items = [...selected].filter((id) => !catalog.data || catalog.data.some((s) => s.id === id)).map((sportId) => ({ sportId, primary: sportId === primary }))
  const error = validateSports(items)

  const toggle = (id) => {
    const next = new Set(selected)
    if (next.has(id)) {
      next.delete(id)
      if (primary === id) setPrimary(null)
    } else {
      next.add(id)
      if (!primary) setPrimary(id)
    }
    setSelected(next)
  }

  const save = (event) => {
    event.preventDefault()
    if (!error) onSave(items)
  }

  return (
    <AsyncView state={catalog} empty={catalog.data?.length === 0} emptyText="Chưa có môn thể thao nào trong danh mục.">
      <form className="pv-grid" onSubmit={save}>
        <div className="pv-checks">
          {catalog.data?.map((s) => (
            <div key={s.id} className="pv-check">
              <label className="pv-check">
                <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
                {s.name}
              </label>
              {selected.has(s.id) && (
                <label className="pv-check pv-muted">
                  <input type="radio" name="primary" checked={primary === s.id} onChange={() => setPrimary(s.id)} />
                  môn chính
                </label>
              )}
            </div>
          ))}
        </div>
        {error && <p className="pv-error">{error}</p>}
        <div className="ui-actions">
          <button type="submit" className="ui-btn primary" disabled={busy || Boolean(error)}>
            {busy ? 'Đang lưu…' : 'Lưu môn thể thao'}
          </button>
        </div>
      </form>
    </AsyncView>
  )
}
