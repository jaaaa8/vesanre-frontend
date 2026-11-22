import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { getWallet, getWalletEntries } from '../../utils/api'
import { formatCoins, formatDateTimeIn, formatVnd } from '../../utils/format'
import { coinsToVnd, ENTRY_LABELS } from '../../utils/walletRules'
import AsyncView from '../common/AsyncView'
import Pagination from '../common/Pagination'
import TopUpDialog from './TopUpDialog'
import './wallet.css'

const idle = () => Promise.resolve(null)

export default function WalletTab({ active, onToast }) {
  const [page, setPage] = useState(0)
  const [topUpOpen, setTopUpOpen] = useState(false)
  const wallet = useApi(active ? getWallet : idle, [active])
  const entries = useApi(active ? () => getWalletEntries({ page, size: 10 }) : idle, [active, page])

  const reload = () => {
    wallet.reload()
    entries.reload()
  }

  return (
    <section className={`panel${active ? ' active' : ''}`} id="panel-wallet">
      <div className="panel-head">
        <div>
          <span className="eyebrow dark">
            <i />
            Ví coin
          </span>
          <h2>Ví coin</h2>
          <p>Dùng coin để đặt cọc khi đặt sân. 1 coin = 1.000đ.</p>
        </div>
        <button className="ghost-btn" type="button" onClick={() => setTopUpOpen(true)}>
          + Nạp coin
        </button>
      </div>
      <AsyncView state={wallet}>
        {wallet.data && (
          <p className="wl-balance">
            <b>{formatCoins(wallet.data.balance)}</b> <span>≈ {formatVnd(coinsToVnd(wallet.data.balance))}</span>
          </p>
        )}
      </AsyncView>
      <h3 className="wl-h">Lịch sử giao dịch</h3>
      <AsyncView state={entries} empty={entries.data?.items.length === 0} emptyText="Chưa có giao dịch nào">
        {entries.data && (
          <>
            <ul className="wl-entries">
              {entries.data.items.map((e) => (
                <li key={e.id}>
                  <span className="ui-muted wl-tight">{formatDateTimeIn(e.createdAt, 'Asia/Ho_Chi_Minh')}</span>
                  <span>
                    {ENTRY_LABELS[e.type] || e.type}
                    {e.bookingCode && <small> {e.bookingCode}</small>}
                  </span>
                  <b className={e.amount > 0 ? 'wl-plus' : 'wl-minus'}>{e.amount > 0 ? `+${e.amount}` : e.amount}</b>
                  <small className="ui-muted wl-tight">số dư {e.balanceAfter}</small>
                </li>
              ))}
            </ul>
            <Pagination page={entries.data.page} totalPages={entries.data.totalPages} onChange={setPage} />
          </>
        )}
      </AsyncView>
      {topUpOpen && (
        <TopUpDialog
          onToast={onToast}
          onPaid={reload}
          onClose={() => {
            setTopUpOpen(false)
            reload()
          }}
        />
      )}
    </section>
  )
}
