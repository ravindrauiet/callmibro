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
    <section className="py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative flex justify-around items-center">
          <div className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-[#e60012] -translate-y-1/2"></div>
          {steps.map((step, index) => (
            <div key={index} className="relative bg-black p-4 text-center w-[120px]">
              <div className="w-10 h-10 bg-[#e60012] rounded-full flex items-center justify-center text-white mx-auto mb-2">
                {step.number}
              </div>
              <h4 className="mb-2">{step.title}</h4>
              <p className="text-gray-400 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 