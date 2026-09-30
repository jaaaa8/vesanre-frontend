/* Centralized in-page smooth scroll. Single DOM access point so
   components stay declarative (no scattered querySelector calls). */
export function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
