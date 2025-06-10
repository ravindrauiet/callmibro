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
    <section className="bg-black py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Bundle Deals</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {bundles.map(bundle => (
            <div 
              key={bundle.id} 
              className="bg-[#111] border border-[#222] rounded-lg overflow-hidden transition-all"
            >
              <div className="h-32 sm:h-40 flex items-center justify-center p-3 sm:p-4">
                <img 
                  src={bundle.image} 
                  alt={bundle.title}
                  className="max-h-full object-contain"
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="text-white font-medium text-base sm:text-lg mb-3 sm:mb-4 text-center">{bundle.title}</h3>
                
                <div className="flex justify-center">
                  <button className="bg-[#e60012] text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded hover:bg-[#b3000f] transition-colors text-sm sm:text-base">
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