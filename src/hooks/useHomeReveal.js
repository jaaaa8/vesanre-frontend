import { useEffect } from 'react'

// Reveal-on-scroll: adds `.in` to [data-inview] like index_2.html
export function useHomeReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-inview]'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target
          io.unobserve(el)
          const d = Number(el.dataset?.delay || 0)
          setTimeout(() => el.classList.add('in'), d)
        }),
      { threshold: 0.15 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
