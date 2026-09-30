import { useEffect } from 'react'

const FONT_BASE = 16
const BASE_W = 1920
const COEF = 0.6666

/* Fluid REM scaling ported from profile.html. Isolates the single
   documentElement write inside a reusable hook. */
export function useFluidRem() {
  useEffect(() => {
    const fitRem = () => {
      const r = ((BASE_W - window.innerWidth) / BASE_W) * 100 * COEF
      const s = FONT_BASE - (FONT_BASE * r) / 100
      const h = document.documentElement
      if (s > FONT_BASE) h.style.fontSize = `${s}px`
      else h.style.removeProperty('font-size')
    }
    fitRem()
    window.addEventListener('resize', fitRem)
    return () => window.removeEventListener('resize', fitRem)
  }, [])
}
