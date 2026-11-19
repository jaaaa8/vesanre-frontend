import qrcode from 'qrcode-generator'
import { useMemo } from 'react'

export default function QrCode({ value, size = 200 }) {
  const src = useMemo(() => {
    const qr = qrcode(0, 'M')
    qr.addData(value)
    qr.make()
    return qr.createDataURL(4, 4)
  }, [value])
  return <img className="wl-qr" src={src} width={size} height={size} alt="Mã QR nạp coin" />
}
