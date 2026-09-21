import Header from '../Header'
import SearchPanel from './SearchPanel'

export default function Hero({ user, onLogout }) {
  return (
    <section className="hero" id="top">
      <img className="hero-image" src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=2000&q=85&auto=format&fit=crop" alt="Sân vận động rực sáng vào ban đêm" />
      <div className="hero-overlay" />
      <Header user={user} onLogout={onLogout} />
      <div className="hero-copy"><p>Chơi gần nhà. Thi đấu mọi nơi.</p><h1>Đặt sân ngay</h1></div>
      <div className="hero-bottom">
        <SearchPanel />
        <article className="member-card"><div><strong>12K+</strong><span>Người chơi đang trên sân</span></div><img src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80&auto=format&fit=crop" alt="Người chơi bóng đá trên sân" /></article>
      </div>
    </section>
  )
}
