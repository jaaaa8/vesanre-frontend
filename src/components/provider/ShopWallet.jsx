import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { getShopWallet } from '../../utils/api'
import { formatCoins, formatVnd } from '../../utils/format'
import AsyncView from '../common/AsyncView'

export default function ShopWallet({ onLogout }) {
  const wallet = useApi(getShopWallet, [])

  return (
    <section className="pv-card">
      <div className="pv-card-head">
        <h2>Ví shop</h2>
      </div>
      {wallet.error?.status === 404 ? (
        <p className="pv-muted">
          Bạn chưa có cửa hàng. <Link to="/provider">Tạo cửa hàng</Link>
        </p>
      ) : (
        <AsyncView state={wallet} onLogout={onLogout}>
          {wallet.data && (
            <>
              <p className="pv-balance">
                <b>{formatCoins(wallet.data.balance)}</b> <span className="pv-muted">≈ {formatVnd(wallet.data.balance * 1000)}</span>
              </p>
              <p className="pv-muted">
                Coin cọc của khách vào ví khi booking hoàn tất. Việc đổi coin ra tiền sẽ có ở bản sau.
              </p>
            </>
          )}
        </AsyncView>
      )}
    </section>
  )
}
