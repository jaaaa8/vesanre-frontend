export default function PaymentsTab({ active, onAddCard, onSetDefault }) {
  return (
    <section className={`panel${active ? ' active' : ''}`} id="panel-payments">
      <div className="panel-head">
        <div>
          <span className="eyebrow dark">
            <i />
            Ví &amp; Thẻ
          </span>
          <h2>Phương thức thanh toán</h2>
          <p>Thanh toán một chạm cho lần đặt sân tiếp theo.</p>
        </div>
        <button className="ghost-btn" id="addCardBtn" type="button" onClick={onAddCard}>
          + Thêm thẻ
        </button>
      </div>
      <div className="booking-list">
        <div className="pay-card">
          <div className="pinfo">
            <span className="pic">◈</span>
            <div>
              <b>Visa •••• 4242</b>
              <br />
              <small>Hết hạn 12/28 · Mặc định</small>
            </div>
          </div>
          <span className="badge confirmed">Mặc định</span>
        </div>
        <div className="pay-card">
          <div className="pinfo">
            <span className="pic" style={{ background: '#0b6e97' }}>
              Mo
            </span>
            <div>
              <b>MoMo Wallet</b>
              <br />
              <small>090****567 · Đã liên kết</small>
            </div>
          </div>
          <button
            className="linkBtn"
            type="button"
            id="momoBtn"
            style={{ color: 'var(--brand)', fontWeight: 500, fontSize: '.8rem' }}
            onClick={onSetDefault}
          >
            Đặt mặc định
          </button>
        </div>
      </div>
    </section>
  )
}
