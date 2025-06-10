export default function ServiceCard({ title, description, icon }) {
  return (
    <div className="bg-[#111] rounded-lg p-8 flex flex-col items-center text-center">
      <div className="text-[#e60012] mb-6">
        <img src={icon} alt={title} className="h-16 w-16" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6">{description}</p>
      <button className="mt-auto border border-[#e60012] text-[#e60012] hover:bg-[#e60012] hover:text-white transition-colors duration-300 rounded-md px-6 py-2">
        Book Now
      </button>
    </div>
  )
} 