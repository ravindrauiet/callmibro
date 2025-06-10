export default function Shop() {
  const products = [
    {
      name: "iPhone Screen",
      price: 1999.99,
      image: "/part1.jpg"
    },
    {
      name: "Samsung Battery",
      price: 599.99,
      image: "/part2.jpg"
    },
    {
      name: "LG Compressor",
      price: 2999.99,
      image: "/part3.jpg"
    }
  ]

  return (
    <section id="shop" className="bg-[#222] py-10 sm:py-16 px-4 sm:px-8">
      <h2 className="text-2xl sm:text-3xl text-center mb-6 sm:mb-8 font-bold">Shop Spare Parts</h2>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap mb-6 sm:mb-8">
          <select className="bg-[#111] text-white p-2 border border-[#e60012] rounded text-sm">
            <option>Device Category</option>
          </select>
          <select className="bg-[#111] text-white p-2 border border-[#e60012] rounded text-sm">
            <option>Brand</option>
          </select>
          <select className="bg-[#111] text-white p-2 border border-[#e60012] rounded text-sm">
            <option>Model</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {products.map((product, index) => (
            <div key={index} className="bg-[#111] p-3 sm:p-4 rounded-lg text-center">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full rounded mb-3 sm:mb-4 transition-transform hover:scale-105"
              />
              <h4 className="text-base sm:text-lg mb-1 sm:mb-2">{product.name}</h4>
              <div className="text-[#e60012] mb-3 sm:mb-4">₹{product.price}</div>
              <button className="bg-[#e60012] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-[#b3000f] transition-colors text-sm">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 