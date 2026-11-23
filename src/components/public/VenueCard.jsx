import { Link } from 'react-router-dom'
import { formatVnd } from '../../utils/format'
import { formatRating, venueCover } from '../../utils/publicRules'

export default function VenueCard({ venue }) {
  return (
    <Link className="court sr-card" to={`/san/${venue.id}`}>
      <figure>
        <img src={venueCover(venue)} alt={venue.name} loading="lazy" />
        <figcaption>
          <h3>{venue.name}</h3>
          <span>{`${venue.district}, ${venue.city}`}</span>
          {venue.sports.length > 0 && <span>{venue.sports.join(' · ')}</span>}
          <span className="sr-card-foot">
            <span>{formatRating(venue.ratingAverage, venue.ratingCount)}</span>
            <strong>{venue.fromPrice != null ? `Từ ${formatVnd(venue.fromPrice)}/giờ` : 'Chưa có giá'}</strong>
          </span>
        </figcaption>
      </figure>
    </Link>
  )
}
