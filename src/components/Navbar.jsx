import { useState } from "react";

const navItems = ["Products", "Solutions", "Resources", "Plans & Pricing"];

export default function Navbar({ onMenuClick }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const user = JSON.parse(localStorage.getItem("chatUser") || "{}");
  const firstLetter = user?.username?.charAt(0).toUpperCase() || "A";

  return (
    <div className="sticky top-0 z-50">

      {/* Top utility bar */}
      <div className="bg-[#0B1B3F] text-white text-xs h-10 flex items-center justify-end px-6 gap-5">
        {searchOpen ? (
          <div className="flex items-center gap-2 flex-1 justify-center max-w-xl">
            <div className="flex items-center gap-2 bg-white rounded-md px-3 py-1.5 flex-1">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search here..."
                className="flex-1 text-gray-800 text-xs outline-none bg-transparent placeholder-gray-400"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)} className="flex items-center gap-1 hover:text-blue-300 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            Search
          </button>
        )}
        {!searchOpen && (
          <>
            <a href="#" className="hover:text-blue-300 transition-colors">Support</a>
            <span className="hidden md:block text-gray-400">1.888.799.9666</span>
            <a href="#" className="hover:text-blue-300 transition-colors hidden md:block">Contact Sales</a>
            <a href="#" className="hover:text-blue-300 transition-colors hidden md:block">Request a Demo</a>
            <button className="hover:text-blue-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Main navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between gap-6">

          {/* Logo */}
          <span className="text-3xl font-bold text-[#2D8CFF] tracking-tight cursor-pointer">
            MeetUp
          </span>

          {/* Center nav — desktop */}
          <div className="hidden lg:flex items-center gap-7 flex-1 justify-center">
            {navItems.map((item) => (
              <button key={item} className="text-sm font-medium text-gray-700 hover:text-[#2D8CFF] transition-colors whitespace-nowrap">
                {item}
              </button>
            ))}
          </div>

          {/* Right actions — desktop */}
          <div className="hidden lg:flex items-center gap-1">
            <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2D8CFF] transition-colors">
              Schedule
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2D8CFF] transition-colors">
              Join
            </button>
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2D8CFF] transition-colors">
              Host
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-[#2D8CFF] rounded-lg hover:bg-blue-600 transition-colors">
              Web App
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-sm ml-2 cursor-pointer">
              {firstLetter}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button className="lg:hidden text-gray-700" onClick={onMenuClick}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <button key={item} className="text-sm font-medium text-gray-700 hover:text-[#2D8CFF] text-left transition-colors">
                {item}
              </button>
            ))}
            <hr className="border-gray-100" />
            {["Schedule", "Join", "Host", "Web App"].map((item) => (
              <button key={item} className="text-sm font-medium text-gray-700 hover:text-[#2D8CFF] text-left transition-colors">
                {item}
              </button>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}
