import { Link } from 'react-router-dom'
import { formatVnd } from '../../utils/format'
import { venueCover } from '../../utils/publicRules'

export default function VenueCard({ venue }) {
  return (
    <Link className="pub-card" to={`/san/${venue.id}`}>
      <img src={venueCover(venue)} alt={venue.name} loading="lazy" />
      <div className="pub-card-body">
        <h3>{venue.name}</h3>
        <p>{`${venue.district}, ${venue.city}`}</p>
        <p>{venue.sports.join(' · ')}</p>
        <p className="pub-price">{venue.fromPrice != null ? `Từ ${formatVnd(venue.fromPrice)}/giờ` : 'Chưa có giá'}</p>
      </div>
    </Link>
  )
}
