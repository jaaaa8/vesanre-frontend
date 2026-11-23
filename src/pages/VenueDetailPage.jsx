import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AsyncView from '../components/common/AsyncView'
import EmptyState from '../components/common/EmptyState'
import CourtSlots from '../components/public/CourtSlots'
import VenueReviews from '../components/public/VenueReviews'
import Footer from '../components/Footer'
import Header from '../components/Header'
import '../components/public/public.css'
import { useApi } from '../hooks/useApi'
import { useHomeReveal } from '../hooks/useHomeReveal'
import { getPublicVenue } from '../utils/api'
import { formatVnd, WEEKDAYS } from '../utils/format'
import { addDays, clampDate, formatRating, mapsUrl, todayIn, venueCover } from '../utils/publicRules'

function Gallery({ images, name, venue }) {
  const [selected, setSelected] = useState(0)
  if (images.length === 0) return <img className="pub-hero" src={venueCover(venue)} alt={name} />
  const current = images[Math.min(selected, images.length - 1)]
  return (
    <div className="pub-gallery">
      <img className="pub-hero" src={current.url} alt={current.altText || name} />
      {images.length > 1 && (
        <div className="pub-thumbs">
          {images.map((img, i) => (
            <button key={img.id} type="button" aria-label={`Ảnh ${i + 1}`} aria-pressed={i === selected} onClick={() => setSelected(i)}>
              <img src={img.url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const hoursText = (h) => (h.closed ? 'Nghỉ' : `${h.opensAt.slice(0, 5)}–${h.closesAt.slice(0, 5)}`)
const amenityText = (a) => (a.details ? `${a.name} (${a.details})` : a.name)

function Court({ court, date }) {
  const sports = [...court.sports].sort((a, b) => b.primary - a.primary)
  const hours = [...court.operatingHours].sort((a, b) => a.weekday - b.weekday)
  return (
    <article className="pub-court">
      <h3>
        {court.name} <small>({court.code})</small>
      </h3>
      <p>
        {[...sports.map((s) => (s.primary ? `${s.name} (chính)` : s.name)), court.capacity != null && `${court.capacity} người`]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {court.amenities.length > 0 && <p className="pub-muted">{court.amenities.map(amenityText).join(' · ')}</p>}
      {hours.length > 0 && (
        <ul className="pub-hours">
          {hours.map((h) => (
            <li key={h.weekday}>
              <span>{WEEKDAYS[h.weekday]}</span> {hoursText(h)}
            </li>
          ))}
        </ul>
      )}
      <CourtSlots court={court} date={date} />
    </article>
  )
}

function VenueDetail({ venue }) {
  const map = mapsUrl(venue.latitude, venue.longitude)
  // Recomputed each render so a page left open past midnight never asks for a past date.
  const today = todayIn()
  const [raw, setRaw] = useState(today)
  const date = clampDate(raw, today)
  return (
    <>
      <div className="pub-overview">
        <Gallery images={venue.images} name={venue.name} venue={venue} />
        <section className="pub-info">
          <h1>{venue.name}</h1>
          <p className="pub-rating">{formatRating(venue.ratingAverage, venue.ratingCount)}</p>
          <p className="pub-address">{[venue.addressLine, venue.ward, venue.district, venue.city].filter(Boolean).join(', ')}</p>
          {venue.fromPrice != null && (
            <p className="pub-price">
              <small>Giá từ</small>
              {formatVnd(venue.fromPrice)}
              <small>/giờ</small>
            </p>
          )}
          <div className="pub-actions">
            {venue.courts.length > 0 && (
              <a className="ui-btn primary" href="#courts">
                Chọn khung giờ
              </a>
            )}
            {venue.phone && (
              <a className="ui-btn" href={`tel:${venue.phone}`}>
                {venue.phone}
              </a>
            )}
            {map && (
              <a className="ui-btn" href={map} target="_blank" rel="noopener noreferrer">
                Xem trên Google Maps
              </a>
            )}
          </div>
          <div className="pub-shop">
            {venue.shop.logoUrl && <img src={venue.shop.logoUrl} alt="" />}
            <span>
              <small>Chủ sân</small>
              {venue.shop.name}
            </span>
          </div>
        </section>
      </div>
      {(venue.description || venue.amenities.length > 0) && (
        <section className="pub-section">
          <h2>Giới thiệu</h2>
          {venue.description && <p className="pub-desc">{venue.description}</p>}
          {venue.amenities.length > 0 && (
            <ul className="pub-tags" aria-label="Tiện ích">
              {venue.amenities.map((a) => (
                <li key={a.amenityId}>{amenityText(a)}</li>
              ))}
            </ul>
          )}
        </section>
      )}
      <section className="pub-courts" id="courts">
        <h2>Chọn sân &amp; khung giờ</h2>
        {venue.courts.length === 0 ? (
          <p className="ui-muted">Chưa có sân con đang hoạt động</p>
        ) : (
          <>
            <label className="ui-field pub-date">
              <span>Ngày đặt sân</span>
              {/* No clamping in onChange: Chrome fires it while each date segment is still being typed. */}
              <input type="date" min={today} max={addDays(today, 30)} value={raw} onChange={(e) => setRaw(e.target.value)} onBlur={() => setRaw(date)} />
            </label>
            {venue.courts.map((c) => (
              <Court key={c.id} court={c} date={date} />
            ))}
          </>
        )}
      </section>
      <VenueReviews venueId={venue.id} />
    </>
  )
}

export default function VenueDetailPage({ user, onLogout }) {
  useHomeReveal()
  const { id } = useParams()
  const venue = useApi(() => getPublicVenue(id), [id])
  const name = venue.data?.name

  useEffect(() => {
    if (!name) return
    const previous = document.title
    document.title = `${name} · SportHub`
    return () => {
      document.title = previous
    }
  }, [name])

  const missing = venue.error?.status === 404 || venue.error?.status === 400
  return (
    <div className="pub-page">
      {/* Same Header and photo backdrop as the home page, kept to a single navbar strip. */}
      <section className="hero vd-nav">
        <div className="hero-bg">
          <div className="hero-bg-inner">
            <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=2000&q=80&auto=format&fit=crop" alt="" />
            <div className="hero-shade" />
          </div>
        </div>
        <Header user={user} onLogout={onLogout} />
      </section>
      <main className="pub-main">
        {missing ? (
          <EmptyState text="Sân không tồn tại hoặc đã ngừng hoạt động">
            <Link className="ui-btn" to="/san">
              Về trang tìm kiếm
            </Link>
          </EmptyState>
        ) : (
          <AsyncView state={venue}>{venue.data && <VenueDetail key={venue.data.id} venue={venue.data} />}</AsyncView>
        )}
      </main>
      <Footer />
    </div>
  )
}
