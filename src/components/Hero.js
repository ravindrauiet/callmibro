export default function Hero() {
  return (
    <section className="h-[80vh] bg-[url('/hero.jpg')] bg-center bg-cover bg-no-repeat relative flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative text-center max-w-3xl px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl mb-2 md:mb-4 font-bold">Fast, Reliable Repair Services & Genuine Spare Parts</h1>
        <p className="text-gray-300 mb-4 md:mb-8 text-sm sm:text-base">Book certified technicians or shop original parts in minutes</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:space-x-4 justify-center">
          <button className="bg-[#e60012] text-white px-4 sm:px-6 py-2 sm:py-3 rounded hover:bg-[#b3000f] transition-colors text-sm sm:text-base">
            Book a Service Now
          </button>
          <button className="bg-transparent text-white border-2 border-white px-4 sm:px-6 py-2 sm:py-3 rounded hover:text-[#e60012] hover:border-[#e60012] transition-colors text-sm sm:text-base">
            Shop Spare Parts
          </button>
        </div>
      </div>
    </section>
  )
} 