import { useEffect, useRef, useState } from 'react'
import { createTopUp, getTopUp } from '../../utils/api'
import { formatVnd } from '../../utils/format'
import QrCode from './QrCode'
import { coinsToVnd, isFinal, secondsLeft, TOP_UP_PRESETS, topUpError } from '../../utils/walletRules'

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

// Mounted only while open; closing unmounts it, which stops every timer.
export default function TopUpDialog({ onClose, onPaid, onToast }) {
  const ref = useRef(null)
  const [value, setValue] = useState('100')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [topUp, setTopUp] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    ref.current.showModal()
  }, [])

  const id = topUp?.id
  const paid = topUp?.status === 'PAID'

  // EXPIRED is polled too: a late transfer can still turn it PAID.
  useEffect(() => {
    if (!id || paid) return
    let stopped = false
    const poll = setInterval(() => {
      getTopUp(id).then(
        (t) => {
          if (stopped) return
          setTopUp(t)
          if (isFinal(t.status)) {
            stopped = true
            clearInterval(poll)
            onToast(`Đã nạp ${t.coins} coin`)
            onPaid()
          }
        },
        (e) => {
          // request() already expired the session on 401; polling again cannot succeed.
          if (e.status === 401) clearInterval(poll)
        },
      )
    }, 3000)
    const tick = setInterval(() => setNow(Date.now()), 1000)
    return () => {
      stopped = true
      clearInterval(poll)
      clearInterval(tick)
    }
    // onToast/onPaid are stable enough; re-running would restart the poll timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, paid])

  const inputError = topUpError(value)

  const submit = async (event) => {
    event.preventDefault()
    if (inputError) return
    setBusy(true)
    setError(null)
    try {
      const created = await createTopUp(Number(value))
      setNow(Date.now())
      setTopUp(created)
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(topUp.transferCode)
      onToast('Đã sao chép mã chuyển khoản')
    } catch {
      // No clipboard outside a secure context, e.g. the dev server opened via http://<LAN IP>.
      onToast('Hãy chọn mã và sao chép tay')
    }
  }

  return (
    <dialog
      ref={ref}
      className="ui-dialog wl-dialog"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
    >
      {!topUp ? (
        <form onSubmit={submit}>
          <h3>Nạp coin</h3>
          <label className="ui-field">
            <span>Số coin (1 coin = 1.000đ)</span>
            <input inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} aria-invalid={!!inputError} />
          </label>
          <div className="wl-presets">
            {TOP_UP_PRESETS.map((n) => (
              <button key={n} type="button" className={`ui-btn ghost${value === String(n) ? ' is-on' : ''}`} onClick={() => setValue(String(n))}>
                {n}
              </button>
            ))}
          </div>
          {inputError ? (
            <p className="wl-err" role="alert">
              {inputError}
            </p>
          ) : (
            <p className="ui-muted wl-tight">= {formatVnd(coinsToVnd(Number(value)))}</p>
          )}
          {error && (
            <p className="wl-err" role="alert">
              {error.message}
              {error.status === 503 && (
                <>
                  <br />
                  Cổng nạp coin đang tắt trên máy chủ này.
                </>
              )}
            </p>
          )}
          <div className="ui-actions">
            <button type="button" className="ui-btn ghost" onClick={onClose}>
              Đóng
            </button>
            <button type="submit" className="ui-btn primary" disabled={!!inputError || busy}>
              {busy ? 'Đang tạo…' : 'Tạo mã nạp'}
            </button>
          </div>
        </form>
      ) : (
        <div className="wl-step">
          <h3>{paid ? 'Nạp coin thành công' : 'Quét mã để nạp coin'}</h3>
          {paid ? (
            <p className="wl-ok" role="status">
              Đã nạp {topUp.coins} coin vào ví.
            </p>
          ) : (
            <>
              <div className="wl-qr-wrap">
                <QrCode value={topUp.paymentUrl} />
              </div>
              <p className="wl-code">
                Mã chuyển khoản <b>{topUp.transferCode}</b>{' '}
                <button type="button" className="ui-btn ghost" onClick={copy}>
                  Sao chép
                </button>
              </p>
              <p>
                Số tiền <b>{formatVnd(topUp.amountVnd)}</b> ({topUp.coins} coin)
              </p>
              {topUp.status === 'EXPIRED' ? (
                <p className="wl-err" role="status">
                  Mã đã hết hạn. Nếu bạn đã chuyển khoản, coin vẫn sẽ được cộng.
                </p>
              ) : (
                <p className="ui-muted wl-tight" role="timer">
                  Hết hạn sau {mmss(secondsLeft(topUp.expiresAt, now))}
                </p>
              )}
              <a href={topUp.paymentUrl} target="_blank" rel="noreferrer">
                Mở trang thanh toán
              </a>
            </>
          )}
          <div className="ui-actions">
            {topUp.status === 'EXPIRED' && (
              <button type="button" className="ui-btn ghost" onClick={() => setTopUp(null)}>
                Tạo mã mới
              </button>
            )}
            <button type="button" className={`ui-btn${paid ? ' primary' : ''}`} onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}

