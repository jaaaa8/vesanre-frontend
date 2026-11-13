import { ALL_FIELDS } from '../../utils/providerRules'
import { MAX, REQUIRED, VENUE_LABELS } from './venueFields'

export default function VenueForm({ value, onChange, disabledFields = new Set(), fields = ALL_FIELDS }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value })
  return (
    <div className="pv-grid two">
      {fields.map((key) => (
        <label key={key} className="ui-field" style={key === 'description' || key === 'addressLine' ? { gridColumn: '1 / -1' } : undefined}>
          <span>
            {VENUE_LABELS[key]}
            {REQUIRED.has(key) && ' *'}
          </span>
          {key === 'description' ? (
            <textarea rows={4} maxLength={MAX[key]} value={value[key]} onChange={set(key)} disabled={disabledFields.has(key)} />
          ) : (
            <input
              type={key === 'latitude' || key === 'longitude' ? 'number' : 'text'}
              step={key === 'latitude' || key === 'longitude' ? '0.000001' : undefined}
              maxLength={MAX[key]}
              required={REQUIRED.has(key)}
              value={value[key]}
              onChange={set(key)}
              disabled={disabledFields.has(key)}
            />
          )}
        </label>
      ))}
    </div>
  )
}
