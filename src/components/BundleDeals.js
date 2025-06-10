export default function BundleDeals() {
  // Bundle data
  const bundles = [
    {
      id: 1,
      title: "Product Deals",
      image: "/product-deals.jpg",
    },
    {
      id: 2,
      title: "Bundle Deals",
      image: "/bundle-deals.jpg",
    }
  ];

  return (
    <section className="bg-black py-12">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-3xl font-bold mb-8">Bundle Deals</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bundles.map(bundle => (
            <div 
              key={bundle.id} 
              className="bg-[#111] border border-[#222] rounded-lg overflow-hidden transition-all"
            >
              <div className="h-40 flex items-center justify-center p-4">
                <img 
                  src={bundle.image} 
                  alt={bundle.title}
                  className="max-h-full object-contain"
                />
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium text-lg mb-4 text-center">{bundle.title}</h3>
                
                <div className="flex justify-center">
                  <button className="bg-[#e60012] text-white px-6 py-2 rounded hover:bg-[#b3000f] transition-colors">
                    VIEW DEAL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 