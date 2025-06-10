export default function ExpertsBenefits() {
  const benefits = [
    {
      id: 1,
      title: "Certified Pros",
      description: "Certified Pros",
      icon: "/icons/certified.svg"
    },
    {
      id: 2,
      title: "On-time Guarantee",
      description: "Transpmment eclice In expenccr",
      icon: "/icons/ontime.svg"
    },
    {
      id: 3,
      title: "Transparent Pricing",
      description: "Get preac pricding",
      icon: "/icons/pricing.svg"
    },
    {
      id: 4,
      title: "Secure Payments",
      description: "Secure payments",
      icon: "/icons/secure.svg"
    }
  ]

  return (
    <section className="py-16 px-8 bg-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">Meet Our Experts</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map(benefit => (
            <div key={benefit.id} className="flex flex-col items-center text-center">
              <div className="text-[#e60012] mb-6">
                <div className="h-16 w-16 rounded-full border-2 border-[#e60012] flex items-center justify-center">
                  <img src={benefit.icon} alt={benefit.title} className="h-8 w-8" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
              <p className="text-gray-400 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 