import Image from 'next/image'
import Link from 'next/link'

export default function Shop() {
  const products = [
    {
      name: "iPhone Battery",
      price: 1999.99,
      image: "/phone-battery.jpg",
      url: "/spare-parts/phone-battery"
    },
    {
      name: "Laptop Charger",
      price: 599.99,
      image: "/laptop-charger.jpg",
      url: "/spare-parts/laptop-charger"
    },
    {
      name: "TV Remote",
      price: 499.99,
      image: "/tv-remote.jpg",
      url: "/spare-parts/tv-remote"
    }
  ]

  return (
    <section id="shop" className="bg-[#222] py-10 sm:py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl mb-2 font-bold">Shop Genuine Spare Parts</h2>
          <p className="text-gray-400 text-sm sm:text-base">Original components for all your devices</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap mb-6 sm:mb-8">
          <select className="bg-[#111] text-white p-2 border border-[#333] rounded text-sm">
            <option>Device Category</option>
            <option>Phones</option>
            <option>Laptops</option>
            <option>TVs</option>
          </select>
          <select className="bg-[#111] text-white p-2 border border-[#333] rounded text-sm">
            <option>Brand</option>
            <option>Apple</option>
            <option>Samsung</option>
            <option>LG</option>
          </select>
          <select className="bg-[#111] text-white p-2 border border-[#333] rounded text-sm">
            <option>Model</option>
            <option>iPhone 14</option>
            <option>Galaxy S22</option>
            <option>OLED C2</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {products.map((product, index) => (
            <div key={index} className="bg-[#111] p-3 sm:p-4 rounded-lg text-center">
              <div className="overflow-hidden mb-3 sm:mb-4 rounded relative pt-[75%]">
                <Image 
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <h4 className="text-base sm:text-lg mb-1 sm:mb-2">{product.name}</h4>
              <div className="text-[#e60012] mb-3 sm:mb-4">₹{product.price.toLocaleString()}</div>
              <Link 
                href={product.url} 
                className="block bg-[#e60012] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-[#b3000f] transition-colors text-sm w-full"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 