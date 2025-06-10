export default function FilterSearchBar() {
  return (
    <section className="bg-[#111] py-4 sm:py-6 border-t border-b border-[#222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="text-lg sm:text-xl font-semibold sm:mr-2">Filter &amp; Search</div>
          
          <div className="flex flex-col sm:flex-row flex-1 gap-3 sm:gap-4">
            <select className="bg-[#111] text-white p-2 text-sm border border-[#333] rounded">
              <option>Device Category</option>
              <option>Mobile Phones</option>
              <option>TVs</option>
              <option>ACs</option>
              <option>Refrigerators</option>
            </select>
            
            <select className="bg-[#111] text-white p-2 text-sm border border-[#333] rounded">
              <option>Brand</option>
              <option>Samsung</option>
              <option>Apple</option>
              <option>LG</option>
              <option>Sony</option>
            </select>
            
            <select className="bg-[#111] text-white p-2 text-sm border border-[#333] rounded">
              <option>Model</option>
              <option>iPhone 13</option>
              <option>Galaxy S21</option>
              <option>LG C1</option>
            </select>
          </div>
          
          <div className="flex flex-1 mt-3 sm:mt-0 min-w-0 sm:min-w-[300px]">
            <input 
              type="text" 
              placeholder="Search part name or SKU" 
              className="flex-1 p-2 text-sm bg-black text-white border border-[#444] rounded-l focus:border-[#e60012] focus:outline-none"
            />
            <button className="bg-[#e60012] text-white px-3 sm:px-4 py-2 text-sm rounded-r hover:bg-[#b3000f] transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  )
} 