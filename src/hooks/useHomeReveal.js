import { useEffect } from 'react'

// Reveal-on-scroll via IntersectionObserver. Adds `.in` to [data-inview]
// like index_2.html. Pending timers are tracked so unmount clears them
// (no post-unmount DOM touches).
export function useHomeReveal() {
  useEffect(() => {
    const pending = new Set()
    const els = Array.from(document.querySelectorAll('[data-inview]'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'))
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const el = e.target
          io.unobserve(el)
          const d = Number(el.dataset?.delay || 0)
          const timer = window.setTimeout(() => {
            pending.delete(timer)
            el.classList.add('in')
          }, d)
          pending.add(timer)
        }),
      { threshold: 0.15 },
    )
    els.forEach((el) => io.observe(el))
    return () => {
      pending.forEach((t) => window.clearTimeout(t))
      pending.clear()
      io.disconnect()
    }
  }, [])
}
