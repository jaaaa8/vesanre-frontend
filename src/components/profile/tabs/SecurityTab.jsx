import { useState } from 'react'

export default function SecurityTab({ active, onToast }) {
  const [pwOld, setPwOld] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwNew2, setPwNew2] = useState('')
  const [pwErr, setPwErr] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (pwNew.length < 6) {
      setPwErr('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }
    if (pwNew !== pwNew2) {
      setPwErr('Mật khẩu xác nhận chưa khớp.')
      return
    }
    setPwErr('')
    setPwOld('')
    setPwNew('')
    setPwNew2('')
    onToast('Đổi mật khẩu thành công!')
  }

  return (
    <section className={`panel${active ? ' active' : ''}`} id="panel-security">
      <div className="panel-head">
        <div>
          <span className="eyebrow dark">
            <i />
            Bảo mật
          </span>
          <h2>Đổi mật khẩu</h2>
          <p>Mật khẩu tối thiểu 6 ký tự để bảo vệ tài khoản.</p>
        </div>
      </div>
      <form id="pwForm" className="modal-form" style={{ marginTop: 0 }} noValidate onSubmit={handleSubmit}>
        <div>
          <label className="flabel" htmlFor="pwOld">
            Mật khẩu hiện tại
          </label>
          <input
            className="finput"
            id="pwOld"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={pwOld}
            onChange={(e) => setPwOld(e.target.value)}
          />
        </div>
        <div>
          <label className="flabel" htmlFor="pwNew">
            Mật khẩu mới
          </label>
          <input
            className="finput"
            id="pwNew"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            autoComplete="new-password"
            value={pwNew}
            onChange={(e) => setPwNew(e.target.value)}
          />
        </div>
        <div>
          <label className="flabel" htmlFor="pwNew2">
            Xác nhận mật khẩu mới
          </label>
          <input
            className="finput"
            id="pwNew2"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            autoComplete="new-password"
            value={pwNew2}
            onChange={(e) => setPwNew2(e.target.value)}
          />
        </div>
        <div className="ferr" id="pwErr">
          {pwErr}
        </div>
        <div className="save-row">
          <button className="save-btn" type="submit">
            Cập nhật mật khẩu
          </button>
        </div>
      </form>
    </section>
  )
}
