const NUMBER_FIELDS = [
  ['capacity', 'Sức chứa (người)'],
  ['bookingStepMinutes', 'Bước đặt (phút)'],
  ['minBookingMinutes', 'Đặt tối thiểu (phút)'],
  ['maxBookingMinutes', 'Đặt tối đa (phút)'],
]

export default function CourtForm({ value, onChange }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value })
  return (
    <div className="pv-grid two">
      <label className="ui-field">
        <span>Mã sân *</span>
        <input required maxLength={50} value={value.code} onChange={set('code')} />
      </label>
      <label className="ui-field">
        <span>Tên sân *</span>
        <input required maxLength={120} value={value.name} onChange={set('name')} />
      </label>
      {NUMBER_FIELDS.map(([key, label]) => (
        <label key={key} className="ui-field">
          <span>{label} *</span>
          <input type="number" min={1} step={1} required value={value[key]} onChange={set(key)} />
        </label>
      ))}
      <label className="ui-field" style={{ gridColumn: '1 / -1' }}>
        <span>Mô tả</span>
        <textarea rows={3} maxLength={5000} value={value.description} onChange={set('description')} />
      </label>
    </div>
  )
}
