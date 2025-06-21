import Image from 'next/image'

export default function ExpertsBenefits() {
  const benefits = [
    {
      id: 1,
      title: "Certified Pros",
      description: "Highly trained and certified repair technicians",
      icon: "/icons/certified.svg"
    },
    {
      id: 2,
      title: "On-time Guarantee",
      description: "Punctual service with time-slot guarantee",
      icon: "/icons/ontime.svg"
    },
    {
      id: 3,
      title: "Transparent Pricing",
      description: "Clear upfront pricing with no hidden fees",
      icon: "/icons/pricing.svg"
    },
    {
      id: 4,
      title: "Secure Payments",
      description: "Multiple secure payment options available",
      icon: "/icons/secure.svg"
    }
  ]

  return (
    <section className="py-10 sm:py-16 px-4 sm:px-8 bg-[#111]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-16">Why Choose Our Experts</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {benefits.map(benefit => (
            <div key={benefit.id} className="flex flex-col items-center text-center">
              <div className="text-[#e60012] mb-4 sm:mb-6">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-[#e60012] flex items-center justify-center relative">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 relative">
                    <Image 
                      src={benefit.icon} 
                      alt={benefit.title} 
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
              <h3 className="text-sm sm:text-lg font-bold mb-1 sm:mb-2">{benefit.title}</h3>
              <p className="text-gray-400 text-xs sm:text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 