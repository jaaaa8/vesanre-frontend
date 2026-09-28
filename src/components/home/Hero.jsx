import { useEffect, useRef } from 'react'
import Header from '../Header'
import SearchPanel from './SearchPanel'

const TITLE_WORDS = ['ĐẶT', 'SÂN', 'NGAY']
const TAGLINE_LINES = ['CHƠI GẦN NHÀ,', 'THI ĐẤU MỌI NƠI']

export default function Hero({ user, onLogout }) {
  const bgRef = useRef(null)

  useEffect(() => {
    // Word / line entrance — mirrors index_2.html timing
    const t1 = setTimeout(() => {
      document.querySelectorAll('#hero-title .wmask').forEach((m, i) => {
        const inner = m.firstChild
        if (inner) {
          inner.style.transition = 'transform 1100ms cubic-bezier(0.16,1,0.3,1),opacity 1100ms cubic-bezier(0.16,1,0.3,1)'
          inner.style.transitionDelay = `${i * 140}ms`
        }
        requestAnimationFrame(() => m.classList.add('in'))
      })
    }, 60)
    const t2 = setTimeout(() => {
      document.querySelectorAll('#tagline .lmask').forEach((m, i) => {
        const inner = m.firstChild
        if (inner) {
          inner.style.transition = 'transform 900ms cubic-bezier(0.16,1,0.3,1),opacity 900ms cubic-bezier(0.16,1,0.3,1)'
          inner.style.transitionDelay = `${350 + i * 110}ms`
        }
        requestAnimationFrame(() => m.classList.add('in'))
      })
    }, 60)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  useEffect(() => {
    // Lightweight parallax for hero background
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const hero = document.querySelector('.hero')
        if (!hero || !bgRef.current) return
        const r = hero.getBoundingClientRect()
        const total = window.innerHeight + r.height
        const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / total))
        bgRef.current.style.transform = `translateY(${(p * 12).toFixed(2)}%)`
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="hero" id="top">
      <div className="hero-bg">
        <div className="hero-bg-inner" ref={bgRef}>
          <img
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=2000&q=80&auto=format&fit=crop"
            alt="Sân vận động đa môn rực rỡ ánh đèn về đêm"
            fetchpriority="high"
          />
          <div className="hero-shade" />
        </div>
      </div>
      <Header user={user} onLogout={onLogout} />
      <div className="hero-title-wrap">
        <h1 id="hero-title" aria-label="Đặt Sân Ngay">
          {TITLE_WORDS.map((w, i) => (
            <span key={w}>
              <span className="wmask">
                <span>{w}</span>
              </span>
              {i < TITLE_WORDS.length - 1 ? ' ' : null}
            </span>
          ))}
        </h1>
      </div>
      <div className="hero-bottom">
        <p className="tagline" id="tagline" aria-label="Chơi Gần Nhà, Thi Đấu Mọi Nơi">
          {TAGLINE_LINES.map((ln) => (
            <span key={ln} className="lmask">
              <span>{ln}</span>
            </span>
          ))}
        </p>
        <div className="hero-cluster">
          <SearchPanel />
          <article className="member-card glass" data-inview id="memberCard">
            <div className="member-left">
              <div className="member-val">12K+</div>
              <div className="avatars" aria-hidden="true">
                <i style={{ background: '#5790e6' }} />
                <i style={{ background: '#c2e029' }} />
                <i style={{ background: '#0b6e97' }} />
                <i style={{ background: '#ffffff' }} />
              </div>
              <div className="member-cap">Người chơi đang trên sân</div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&q=80&auto=format&fit=crop"
              alt="Cầu thủ tranh bóng trên sân cỏ có đèn chiếu sáng"
              loading="lazy"
            />
          </article>
        </div>
      </div>
    </section>
  )
}
