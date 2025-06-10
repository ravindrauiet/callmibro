export default function Header({ activePage }) {
  return (
    <header className="sticky top-0 w-full bg-black flex items-center justify-between px-8 py-4 z-50 shadow-md">
      <div className="logo flex items-center">
        <span className="text-[#e60012] font-bold text-xl">●</span>
        <span className="ml-2 font-medium">CallMiBro</span>
      </div>
      <nav className="flex gap-8">
        <a 
          href="/" 
          className={`transition-colors ${activePage === 'home' ? 'text-[#e60012]' : 'hover:text-[#e60012]'}`}
        >
          Home
        </a>
        <a 
          href="/services" 
          className={`transition-colors ${activePage === 'services' ? 'text-[#e60012]' : 'hover:text-[#e60012]'}`}
        >
          Services
        </a>
        <a 
          href="/spare-parts" 
          className={`transition-colors ${activePage === 'spare-parts' ? 'text-[#e60012]' : 'hover:text-[#e60012]'}`}
        >
          Spare Parts
        </a>
        <a 
          href="/contact" 
          className={`transition-colors ${activePage === 'contact' ? 'text-[#e60012]' : 'hover:text-[#e60012]'}`}
        >
          Contact
        </a>
      </nav>
      <button className="bg-[#e60012] text-white px-4 py-2 rounded hover:bg-[#b3000f] transition-colors">
        Login / Signup
      </button>
    </header>
  )
} 