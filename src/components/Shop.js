export default function Shop() {
  const products = [
    {
      name: "iPhone Screen",
      price: 19.99,
      image: "/part1.jpg"
    },
    {
      name: "Samsung Battery",
      price: 19.99,
      image: "/part2.jpg"
    },
    {
      name: "LG Compressor",
      price: 19.99,
      image: "/part3.jpg"
    }
  ]

  return (
    <section id="shop" className="bg-[#222] py-16 px-8">
      <h2 className="text-3xl text-center mb-8">Shop Spare Parts</h2>
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-4 flex-wrap mb-8">
          <select className="bg-[#111] text-white p-2 border border-[#e60012] rounded">
            <option>Device Category</option>
          </select>
          <select className="bg-[#111] text-white p-2 border border-[#e60012] rounded">
            <option>Brand</option>
          </select>
          <select className="bg-[#111] text-white p-2 border border-[#e60012] rounded">
            <option>Model</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div key={index} className="bg-[#111] p-4 rounded-lg text-center">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full rounded mb-4 transition-transform hover:scale-105"
              />
              <h4 className="text-lg mb-2">{product.name}</h4>
              <div className="text-[#e60012] mb-4">${product.price}</div>
              <button className="bg-[#e60012] text-white px-4 py-2 rounded hover:bg-[#b3000f] transition-colors">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 