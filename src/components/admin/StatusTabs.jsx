export default function StatusTabs({ options, value, onChange }) {
  return (
    <div className="pv-tabs" role="tablist">
      {options.map(([key, label]) => (
        <button key={key} type="button" role="tab" aria-selected={key === value} onClick={() => onChange(key)}>
          {label}
        </button>
      ))}
    </div>
  )
}
