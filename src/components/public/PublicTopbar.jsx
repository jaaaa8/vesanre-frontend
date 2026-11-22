import { Link } from 'react-router-dom'
import Brand from '../Brand'

export default function PublicTopbar() {
  return (
    <header className="pub-top">
      <Brand />
      <Link to="/san">Tìm sân</Link>
    </header>
  )
}
