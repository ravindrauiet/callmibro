export default function Hero() {
  return (
    <section className="h-[80vh] bg-[url('/hero.jpg')] bg-center bg-cover bg-no-repeat relative flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative text-center max-w-3xl px-4">
        <h1 className="text-4xl mb-4">Fast, Reliable Repair Services & Genuine Spare Parts</h1>
        <p className="text-gray-300 mb-8">Book certified technicians or shop original parts in minutes</p>
        <div className="space-x-4">
          <button className="bg-[#e60012] text-white px-6 py-3 rounded hover:bg-[#b3000f] transition-colors">
            Book a Service Now
          </button>
          <button className="bg-transparent text-white border-2 border-white px-6 py-3 rounded hover:text-[#e60012] hover:border-[#e60012] transition-colors">
            Shop Spare Parts
          </button>
        </div>
      </div>
    </section>
  )
} 