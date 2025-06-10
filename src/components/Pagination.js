export default function Pagination() {
  return (
    <section className="bg-[#111] py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-center items-center gap-1 sm:gap-2">
          <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white hover:text-[#e60012] transition-colors text-sm sm:text-base">
            &#8592;
          </button>
          
          {[1, 2, 3].map(page => (
            <button 
              key={page} 
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-sm sm:text-base ${
                page === 1 
                  ? 'bg-[#e60012] text-white' 
                  : 'text-white hover:text-[#e60012] transition-colors'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white hover:text-[#e60012] transition-colors text-sm sm:text-base">
            &#8594;
          </button>
        </div>
      </div>
    </section>
  )
} 