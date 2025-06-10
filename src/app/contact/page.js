import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ContactForm from '../../components/ContactForm'
import ContactInfo from '../../components/ContactInfo'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header activePage="contact" />
      <div className="py-10 md:py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Contact Us</h1>
            <p className="text-gray-400 text-base md:text-lg">Get in touch with our customer support team</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <ContactInfo />
            <ContactForm />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
} 