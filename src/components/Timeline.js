export default function Timeline() {
  const steps = [
    {
      number: 1,
      title: "Choose Your Device",
      description: "Select from phone, TV, fridge & more"
    },
    {
      number: 2,
      title: "Book a Technician",
      description: "Schedule in seconds, get an expert"
    },
    {
      number: 3,
      title: "Track & Pay",
      description: "Live updates and secure checkout"
    }
  ]

  return (
    <section className="py-10 sm:py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Desktop Timeline */}
        <div className="hidden sm:flex relative justify-around items-center">
          <div className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-[#e60012] -translate-y-1/2"></div>
          {steps.map((step, index) => (
            <div key={index} className="relative bg-black p-4 text-center w-[120px]">
              <div className="w-10 h-10 bg-[#e60012] rounded-full flex items-center justify-center text-white mx-auto mb-2">
                {step.number}
              </div>
              <h4 className="mb-2 font-medium">{step.title}</h4>
              <p className="text-gray-400 text-xs">{step.description}</p>
            </div>
          ))}
        </div>
        
        {/* Mobile Timeline (vertical) */}
        <div className="flex sm:hidden flex-col items-center">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center mb-8 last:mb-0">
              {/* Vertical line between steps */}
              {index < steps.length - 1 && (
                <div className="absolute top-[40px] w-0.5 h-[calc(100%+32px)] bg-[#e60012]"></div>
              )}
              
              <div className="w-10 h-10 bg-[#e60012] rounded-full flex items-center justify-center text-white mb-2 z-10">
                {step.number}
              </div>
              
              <div className="text-center p-4">
                <h4 className="mb-1 font-medium">{step.title}</h4>
                <p className="text-gray-400 text-xs">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 