import Header from '../../components/Header'
import Footer from '../../components/Footer'
import RepairServices from '../../components/RepairServices'
import ExpertsBenefits from '../../components/ExpertsBenefits'

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header activePage="services" />
      <RepairServices />
      <ExpertsBenefits />
      <Footer />
    </main>
  )
} 