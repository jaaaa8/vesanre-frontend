export const barPercent = (value, max) => (max > 0 ? Math.round((value / max) * 100) : 0)

export const monthLabel = (month) => {
  const [year, mm] = month.split('-')
  return `${mm}/${year}`
}
