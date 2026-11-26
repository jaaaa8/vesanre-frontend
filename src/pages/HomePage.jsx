import { useEffect } from 'react'
import Footer from '../components/Footer'
import Hero from '../components/home/Hero'
import { SportsSection, StatsSection, TestimonialsSection, TrustSection, VenuesSection } from '../components/home/HomeSections'
import { useHomeReveal } from '../hooks/useHomeReveal'
import { scrollToSection } from '../utils/scroll'

export default function HomePage({ user, onLogout }) {
  useHomeReveal()
  // Header/Footer links from other pages land on /#section; scroll once the sections exist.
  useEffect(() => {
    if (window.location.hash) scrollToSection(window.location.hash.slice(1))
  }, [])
  return (
    <main>
      <Hero user={user} onLogout={onLogout} />
      <TrustSection />
      <SportsSection />
      <VenuesSection />
      <StatsSection />
      <TestimonialsSection />
      <Footer />
    </main>
  )
}
