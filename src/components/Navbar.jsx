import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const navItems = ["Products", "Solutions", "Resources", "Plans & Pricing"];

export default function Navbar({ onMenuClick }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("chatUser") || "{}");
  const firstLetter = user?.username?.charAt(0).toUpperCase() || "A";
  const username = user?.username || "User";

  useEffect(() => {
    const handleClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("chatUser");
    navigate("/login");
  };

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
            <button onClick={() => navigate("/chat")} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#2D8CFF] transition-colors">
              Chat
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

            {/* Avatar with dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setAvatarOpen(p => !p)}
                className="w-9 h-9 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
              >
                {firstLetter}
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-11 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {firstLetter}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{username}</p>
                        <p className="text-xs text-gray-500">Workplace Basic</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  {[
                    { label: "My Profile", icon: "👤" },
                    { label: "Plans and Billing", icon: "💳" },
                    { label: "Settings", icon: "⚙️" },
                    { label: "Add Account", icon: "➕" },
                  ].map(({ label, icon }) => (
                    <button
                      key={label}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <span>{icon}</span> {label}
                    </button>
                  ))}

                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Chat + Avatar + Hamburger */}
          <div className="flex lg:hidden items-center gap-2" ref={avatarRef}>
            <button
              onClick={() => navigate("/chat")}
              className="p-2 text-gray-700 hover:text-[#2D8CFF] transition-colors"
              title="Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={() => setAvatarOpen(p => !p)}
                className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
              >
                {firstLetter}
              </button>
              {avatarOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {firstLetter}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{username}</p>
                        <p className="text-xs text-gray-500">Workplace Basic</p>
                      </div>
                    </div>
                  </div>
                  {[
                    { label: "My Profile", icon: "👤" },
                    { label: "Plans and Billing", icon: "💳" },
                    { label: "Settings", icon: "⚙️" },
                    { label: "Add Account", icon: "➕" },
                  ].map(({ label, icon }) => (
                    <button key={label} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                      <span>{icon}</span> {label}
                    </button>
                  ))}
                  <div className="border-t border-gray-100">
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors">
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="text-gray-700" onClick={onMenuClick}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu - handled by Dashboard sidebar drawer */}
      </nav>
    </div>
  );
}
