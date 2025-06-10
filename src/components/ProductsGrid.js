export default function ProductsGrid() {
  // Product data matching the image
  const products = [
    {
      id: 1,
      name: "Phone Battery",
      sku: "ASCF5 Y3000A",
      price: "₹143.00",
      image: "/phone-battery.jpg"
    },
    {
      id: 2,
      name: "Laptop Charger",
      sku: "ASCAS-Y8200A",
      price: "₹143.00",
      image: "/laptop-charger.jpg"
    },
    {
      id: 3,
      name: "TV Remote",
      sku: "ASCAABEIJS2",
      price: "₹143.00",
      image: "/tv-remote.jpg"
    },
    {
      id: 4,
      name: "AC Fitter",
      sku: "ASP7.03C3",
      price: "₹143.00",
      image: "/ac-fitter.jpg"
    },
    {
      id: 5,
      name: "TV Remote",
      sku: "TVECFHSS",
      price: "₹36.90",
      image: "/tv-remote-2.jpg"
    },
    {
      id: 6,
      name: "Refrigerator Shelf",
      sku: "FIDH31000371",
      price: "₹143.00",
      image: "/refrigerator-shelf.jpg"
    },
    {
      id: 7,
      name: "Phone Battery",
      sku: "ASAAY 183BMH",
      price: "₹143.00",
      image: "/phone-battery-2.jpg"
    },
    {
      id: 8,
      name: "Laptop Charger",
      sku: "AN/OSTOAAL",
      price: "₹143.00",
      image: "/laptop-charger-2.jpg"
    },
    {
      id: 9,
      name: "Refrigerator r Shelf",
      sku: "F3ll430SCO34",
      price: "₹143.00",
      image: "/refrigerator-shelf-2.jpg"
    }
  ];

  return (
    <section className="bg-[#111] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map(product => (
            <div 
              key={product.id} 
              className="bg-[#111] border border-[#222] rounded-lg overflow-hidden transition-all hover:border-[#e60012]"
            >
              <div className="h-36 sm:h-48 flex items-center justify-center p-3 sm:p-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="max-h-full object-contain"
                />
              </div>
              <div className="p-3 sm:p-4 text-center">
                <h3 className="text-white font-medium text-base sm:text-lg">{product.name}</h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">{product.sku}</p>
                <div className="text-[#e60012] font-bold text-sm sm:text-base">{product.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 