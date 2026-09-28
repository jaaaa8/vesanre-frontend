import { useState } from 'react'
import { toast } from 'react-toastify'

const sportOptions = ['Bóng đá', 'Pickleball', 'Cầu lông', 'Tennis', 'Bóng rổ', 'Bóng chuyền']

const cityOptions = [
  'TP.HCM · Quận 1',
  'TP.HCM · Quận 7',
  'TP.HCM · Thủ Đức',
  'Đà Nẵng · Gần biển',
  'Hà Nội · Cầu Giấy',
]

const slotOptions = [
  'Hôm nay · 18:00',
  'Hôm nay · 19:30',
  'Ngày mai · 07:00',
  'Ngày mai · 17:00',
  'Cuối tuần · 09:00',
]

export default function SearchPanel() {
  const [sport, setSport] = useState(sportOptions[0])
  const [city, setCity] = useState('Chọn tỉnh / khu vực')
  const [slot, setSlot] = useState(slotOptions[0])
  const [price, setPrice] = useState(350000)

  const search = () => {
    if (!city || city.startsWith('Chọn')) return toast.error('Vui lòng chọn khu vực')
    toast.success(`Đang tìm sân ${sport} · ${city} · ${slot}`)
    document.querySelector('#venues')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="search-widget" data-inview id="searchWidget">
      <div className="sw-title">
        <span className="live" />
        Đặt sân trực tiếp · Gần bạn
      </div>
      <div className="spills" aria-label="Chọn môn thể thao">
        {sportOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={`spill${sport === option ? ' on' : ''}`}
            data-sport={option}
            onClick={() => setSport(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="sfield">
        <label htmlFor="citySelect">Khu vực</label>
        <select id="citySelect" value={city} onChange={(e) => setCity(e.target.value)}>
          <option>Chọn tỉnh / khu vực</option>
          {cityOptions.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="sfield">
        <label htmlFor="slotSelect">Ngày / Giờ</label>
        <select id="slotSelect" value={slot} onChange={(e) => setSlot(e.target.value)}>
          {slotOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="sfield">
        <label>
          Giá tối đa · <span className="srange-val">{price.toLocaleString('vi-VN')}đ/giờ</span>
        </label>
        <input
          type="range"
          min="80000"
          max="800000"
          step="10000"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          aria-label="Giá tối đa"
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
