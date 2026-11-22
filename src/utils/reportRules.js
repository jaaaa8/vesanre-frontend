import { formatDecimal1 } from './format.js'

export const barPercent = (value, max) => (max > 0 ? Math.round((value / max) * 100) : 0)

export const monthLabel = (month) => {
  const [year, mm] = month.split('-')
  return `${mm}/${year}`
}

const plus = (n) => (Number(n) > 0 ? '+' : '')

export const formatPercent = (percent) => (percent == null ? '—' : `${plus(percent)}${formatDecimal1(percent)}%`)

export const formatChange = (change, percent) =>
  `${plus(change)}${String(change).replace('-', '−')}${percent == null ? '' : ` (${formatPercent(percent)})`}`
