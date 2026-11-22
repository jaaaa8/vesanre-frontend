import { useState } from 'react'
import { toast } from 'react-toastify'
import { createWithdrawal } from '../../utils/api'
import { formatVnd } from '../../utils/format'
import { withdrawalError, withdrawalFee, withdrawalPayoutVnd } from '../../utils/walletRules'

const BANK_FIELDS = [
  ['bankName', 'Ngân hàng', 120],
  ['bankAccountNumber', 'Số tài khoản', 40],
  ['bankAccountName', 'Chủ tài khoản', 160],
]

export default function WithdrawalForm({ balance, onDone, onCancel, onBalanceStale }) {
  const [form, setForm] = useState({ coins: '', bankName: '', bankAccountNumber: '', bankAccountName: '' })
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const error = withdrawalError(form.coins, balance)
  const missingBank = BANK_FIELDS.some(([key]) => !form[key].trim())

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await createWithdrawal({
        coinAmount: Number(form.coins),
        bankName: form.bankName.trim(),
        bankAccountNumber: form.bankAccountNumber.trim(),
        bankAccountName: form.bankAccountName.trim(),
      })
      toast.success('Đã gửi lệnh rút')
      onDone()
    } catch (err) {
      toast.error(err.message)
      if (err.status === 409) onBalanceStale()
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="pv-grid" onSubmit={submit}>
      <div className="pv-grid two">
        <label className="ui-field">
          <span>Số coin rút *</span>
          <input inputMode="numeric" value={form.coins} onChange={set('coins')} />
        </label>
        {BANK_FIELDS.map(([key, label, max]) => (
          <label key={key} className="ui-field">
            <span>{label} *</span>
            <input required maxLength={max} value={form[key]} onChange={set(key)} />
          </label>
        ))}
      </div>
      <p className={error ? 'pv-error' : 'pv-muted'}>
        {error ?? `Phí ${withdrawalFee(Number(form.coins))} coin · Thực nhận ${formatVnd(withdrawalPayoutVnd(Number(form.coins)))}`}
      </p>
      <div className="ui-actions">
        <button type="button" className="ui-btn" onClick={onCancel} disabled={busy}>
          Hủy
        </button>
        <button type="submit" className="ui-btn primary" disabled={Boolean(error) || missingBank || busy}>
          Gửi lệnh rút
        </button>
      </div>
    </form>
  )
}
