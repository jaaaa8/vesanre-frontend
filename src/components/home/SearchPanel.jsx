import { ArrowRight } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'react-toastify'

const sportOptions = ['Bóng đá', 'Pickleball', 'Cầu lông', 'Tennis', 'Bóng rổ']

export default function SearchPanel() {
  const [sport, setSport] = useState(sportOptions[0])
  const [area, setArea] = useState('')
  const [price, setPrice] = useState(350000)

  const search = () => {
    if (!area) return toast.error('Vui lòng chọn khu vực')
    toast.success(`Đang tìm sân ${sport} tại ${area}`)
    document.querySelector('#venues')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="search-panel">
      <p className="search-label">Đặt sân trực tiếp gần bạn</p>
      <div className="sport-pills" aria-label="Chọn môn thể thao">
        {sportOptions.map((option) => <button key={option} className={sport === option ? 'active' : ''} onClick={() => setSport(option)} type="button">{option}</button>)}
      </div>
      <div className="search-fields">
        <label><span>Khu vực</span><select value={area} onChange={(event) => setArea(event.target.value)}><option value="">Chọn tỉnh / khu vực</option><option>TP.HCM - Quận 1</option><option>TP.HCM - Quận 7</option><option>TP.HCM - Thủ Đức</option><option>Đà Nẵng - Gần biển</option><option>Hà Nội - Cầu Giấy</option></select></label>
        <label><span>Ngày / Giờ</span><select defaultValue="Hôm nay - 18:00"><option>Hôm nay - 18:00</option><option>Hôm nay - 19:30</option><option>Ngày mai - 07:00</option><option>Cuối tuần - 09:00</option></select></label>
        <label className="price-field"><span>Giá tối đa <strong>{price.toLocaleString('vi-VN')}đ/giờ</strong></span><input type="range" min="80000" max="800000" step="10000" value={price} onChange={(event) => setPrice(Number(event.target.value))} /></label>
        <button className="search-button" onClick={search} type="button">Tìm ngay <ArrowRight size={20} /></button>
      </div>
    </div>
  )
}
