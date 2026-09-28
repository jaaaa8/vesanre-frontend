import Footer from '../components/Footer'
import Hero from '../components/home/Hero'
import { SportsSection, StatsSection, TestimonialsSection, TrustSection, VenuesSection } from '../components/home/HomeSections'
import { useHomeReveal } from '../hooks/useHomeReveal'

export default function HomePage({ user, onLogout }) {
  useHomeReveal()
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
