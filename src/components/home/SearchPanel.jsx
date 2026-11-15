import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { getLocations, getSports } from '../../utils/api'
import { districtsOf, searchHref } from '../../utils/publicRules'

const PRICE_MAX = 800000

export default function SearchPanel() {
  const navigate = useNavigate()
  const sports = useApi(getSports, [])
  const locations = useApi(getLocations, [])
  const [sport, setSport] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [price, setPrice] = useState(PRICE_MAX)

  const search = () => navigate(searchHref({ sport, city, district, maxPrice: price < PRICE_MAX ? price : '' }))
  const sportOptions = [{ code: '', name: 'Tất cả' }, ...(sports.data ?? [])]
  const cityList = locations.data ?? []

  return (
    <div className="search-widget" data-inview id="searchWidget">
      <div className="sw-title">
        <span className="live" />
        Đặt sân trực tiếp · Gần bạn
      </div>
      <div className="spills" aria-label="Chọn môn thể thao">

        {sportOptions.map((option) => (
          <button
            key={option.code}
            type="button"
            className={`spill${sport === option.code ? ' on' : ''}`}
            aria-pressed={sport === option.code}
            onClick={() => setSport(option.code)}
          >
            {option.name}
          </button>
        ))}

      </div>
      <div className="sfield">
        <label htmlFor="citySelect">Khu vực</label>
        <select
          id="citySelect"
          value={city}
          onChange={(e) => {
            setCity(e.target.value)
            setDistrict('')
          }}
        >
          <option value="">Tất cả thành phố</option>

          {cityList.map((l) => (
            <option key={l.city} value={l.city}>
              {l.city}
            </option>
          ))}

        </select>
      </div>
      <div className="sfield">
        <label htmlFor="districtSelect">Quận</label>
        <select id="districtSelect" value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!city}>
          <option value="">Tất cả quận</option>

          {districtsOf(cityList, city).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}

        </select>
      </div>
      <div className="sfield">
        <label htmlFor="priceRange">
          Giá tối đa · <span className="srange-val">{price < PRICE_MAX ? `${price.toLocaleString('vi-VN')}đ/giờ` : 'Không giới hạn'}</span>
        </label>
        <input
          id="priceRange"
          type="range"
          min="80000"
          max={PRICE_MAX}
          step="10000"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </div>
      <button type="button" className="sw-btn" onClick={search}>
        Tìm ngay{' '}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">

          <path d="M5 12h14M13 6l6 6-6 6" />

        </svg>
      </button>
    </div>
  )
}
