export default function ProductsGrid() {
  // Product data matching the image
  const products = [
    {
      id: 1,
      name: "Phone Battery",
      sku: "ASCF5 Y3000A",
      price: "BCCNOW",
      image: "/phone-battery.jpg"
    },
    {
      id: 2,
      name: "Laptop Charger",
      sku: "ASCAS-Y8200A",
      price: "SCO25PC",
      image: "/laptop-charger.jpg"
    },
    {
      id: 3,
      name: "TV Remote",
      sku: "ASCAABEIJS2",
      price: "$143.00V",
      image: "/tv-remote.jpg"
    },
    {
      id: 4,
      name: "AC Fitter",
      sku: "ASP7.03C3",
      price: "Add CDTT",
      image: "/ac-fitter.jpg"
    },
    {
      id: 5,
      name: "TV Remote",
      sku: "TVECFHSS",
      price: "$36.90AS",
      image: "/tv-remote-2.jpg"
    },
    {
      id: 6,
      name: "Refrigerator Shelf",
      sku: "FIDH31000371",
      price: "Add Cart",
      image: "/refrigerator-shelf.jpg"
    },
    {
      id: 7,
      name: "Phone Battery",
      sku: "ASAAY 183BMH",
      price: "Add COW",
      image: "/phone-battery-2.jpg"
    },
    {
      id: 8,
      name: "Laptop Charger",
      sku: "AN/OSTOAAL",
      price: "SDO.09VV",
      image: "/laptop-charger-2.jpg"
    },
    {
      id: 9,
      name: "Refrigerator r Shelf",
      sku: "F3ll430SCO34",
      price: "Add Cart",
      image: "/refrigerator-shelf-2.jpg"
    }
  ];

  return (
    <section className="bg-[#111] py-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div 
              key={product.id} 
              className="bg-[#111] border border-[#222] rounded-lg overflow-hidden transition-all hover:border-[#e60012]"
            >
              <div className="h-48 flex items-center justify-center p-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="max-h-full object-contain"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-white font-medium text-lg">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{product.sku}</p>
                <div className="text-[#e60012] font-bold">{product.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 