import Footer from '../components/Footer'
import Hero from '../components/home/Hero'
import { SportsSection, StatsSection, TestimonialsSection, TrustSection, VenuesSection } from '../components/home/HomeSections'

export default function HomePage({ user, onLogout }) {
  return <main><Hero user={user} onLogout={onLogout} /><TrustSection /><SportsSection /><VenuesSection /><StatsSection /><TestimonialsSection /><Footer /></main>
}
