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
    <section id="services" className="bg-[#1a1a1a] py-16 px-8">
      <h2 className="text-3xl text-center mb-8">Our Repair Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {services.map((service, index) => (
          <div 
            key={index}
            className="bg-[#111] border border-[#e60012] p-6 text-center rounded-lg transition-all hover:shadow-[0_0_10px_#e60012]"
          >
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-xl mb-2">{service.title}</h3>
            <p className="text-gray-400 text-sm">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
} 