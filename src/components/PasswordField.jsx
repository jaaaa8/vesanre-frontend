import { Eye, EyeSlash } from '@phosphor-icons/react'
import { useState } from 'react'

export default function PasswordField({ id, label, value, onChange, autoComplete = 'current-password', placeholder = 'Tối thiểu 6 ký tự' }) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <div className="password-input">
        <input id={id} type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} placeholder={placeholder} />
        <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{visible ? <EyeSlash size={20} /> : <Eye size={20} />}</button>
      </div>
    </label>
  )
}
