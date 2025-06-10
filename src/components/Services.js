export default function Services() {
  const services = [
    {
      title: "Mobile Phones",
      description: "Screen repair, Battery replacement",
      icon: "📱"
    },
    {
      title: "TVs",
      description: "Screen, Software, Power issues",
      icon: "📺"
    },
    {
      title: "ACs",
      description: "Cooling, Gas refill, Maintenance",
      icon: "❄️"
    },
    {
      title: "Refrigerators",
      description: "Compressor, Seal replacement",
      icon: "🧊"
    }
  ]

  return (
    <section id="services" className="bg-[#1a1a1a] py-10 sm:py-16 px-4 sm:px-8">
      <h2 className="text-2xl sm:text-3xl text-center mb-6 sm:mb-8 font-bold">Our Repair Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto">
        {services.map((service, index) => (
          <div 
            key={index}
            className="bg-[#111] border border-[#e60012] p-4 sm:p-6 text-center rounded-lg transition-all hover:shadow-[0_0_10px_#e60012]"
          >
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{service.icon}</div>
            <h3 className="text-lg sm:text-xl mb-1 sm:mb-2 font-medium">{service.title}</h3>
            <p className="text-gray-400 text-xs sm:text-sm">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
} 