import { GENDER_OPTIONS, SPORT_OPTIONS } from '../profileUtils'

export default function ProfileInfoTab({ active, form, profileErr, onField, onToggleSport, onSubmit, onReset }) {
  return (
    <section className={`panel${active ? ' active' : ''}`} id="panel-profile">
      <div className="panel-head">
        <div>
          <span className="eyebrow dark">
            <i />
            Hồ sơ
          </span>
          <h2>Thông tin cá nhân</h2>
          <p>Cập nhật thông tin để nhận xác nhận SMS và ưu đãi đúng môn bạn yêu thích.</p>
        </div>
      </div>
      <form id="profileForm" noValidate onSubmit={onSubmit}>
        <div className="form-grid two">
          <div>
            <label className="flabel" htmlFor="fFullName">
              Họ và tên
            </label>
            <div className="field">
              <span className="ficon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
                </svg>
              </span>
              <input
                className="finput"
                id="fFullName"
                type="text"
                placeholder="VD: Nguyễn Văn An"
                autoComplete="name"
                value={form.fFullName}
                onChange={(e) => onField('fFullName', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="flabel" htmlFor="fPhone">
              Số điện thoại
            </label>
            <div className="field">
              <span className="ficon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
                </svg>
              </span>
              <input
                className="finput"
                id="fPhone"
                type="tel"
                placeholder="0901234567"
                autoComplete="tel"
                value={form.fPhone}
                onChange={(e) => onField('fPhone', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="form-grid two" style={{ marginTop: '1rem' }}>
          <div>
            <label className="flabel" htmlFor="fEmail">
              Email
            </label>
            <div className="field">
              <span className="ficon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              <input
                className="finput"
                id="fEmail"
                type="email"
                placeholder="ten@email.com"
                autoComplete="email"
                value={form.fEmail}
                readOnly
              />
            </div>
          </div>
          <div>
            <label className="flabel" htmlFor="fDob">
              Ngày sinh
            </label>
            <div className="field">
              <span className="ficon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M8 3v4M16 3v4M3 10h18" />
                </svg>
              </span>
              <input
                className="finput"
                id="fDob"
                type="date"
                value={form.fDob}
                onChange={(e) => onField('fDob', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <span className="flabel">Giới tính</span>
          <div className="seg" id="genderSeg">
            {GENDER_OPTIONS.map((option) => (
              <label key={option}>
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={form.gender === option}
                  onChange={() => onField('gender', option)}
                />
                <span className="seg-opt">{option}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <span className="flabel">Môn thể thao yêu thích</span>
          <div className="fav-pills" id="favPills">
            {SPORT_OPTIONS.map((sport) => (
              <button
                key={sport}
                type="button"
                className={`fav-pill${form.sports.includes(sport) ? ' on' : ''}`}
                data-sport={sport}
                onClick={() => onToggleSport(sport)}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>
        <div
          className="ferr"
          id="profileErr"
          style={{ fontSize: '0.75rem', color: '#dc2626', minHeight: '1.1rem', marginTop: '0.8rem' }}
        >
          {profileErr}
        </div>
        <div className="save-row">
          <button className="save-btn" type="submit" id="saveBtn">
            Lưu thay đổi
          </button>
          <button className="ghost-btn" type="button" id="resetBtn" onClick={onReset}>
            Đặt lại
          </button>
        </div>
      </form>
    </section>
  )
}
