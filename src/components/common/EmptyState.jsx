export default function EmptyState({ text, children }) {
  return (
    <div className="ui-empty">
      <p>{text}</p>
      {children}
    </div>
  )
}
