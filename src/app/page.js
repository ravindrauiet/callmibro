import Header from '../components/Header'
import Hero from '../components/Hero'
import Services from '../components/Services'
import BundleDeals from '../components/BundleDeals'
import Shop from '../components/Shop'
import Timeline from '../components/Timeline'
import Testimonial from '../components/Testimonial'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header activePage="home" />
      <Hero />
      <Services />
      <Timeline />
      <BundleDeals />
      <Shop />
      <Testimonial />
      <Footer />
    </div>
  )
}
