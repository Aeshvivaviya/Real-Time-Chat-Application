import { useState } from "react";
import { useNavigate } from "react-router-dom";

const myProducts = [
  { label: "AI Companion", badge: "New", external: true },
  { label: "Meetings" },
  { label: "Recordings" },
  { label: "Summaries" },
  { label: "Hub", badge: "New", external: true },
  { label: "Whiteboards", external: true },
  { label: "Notes" },
  { label: "Clips" },
  { label: "AI Docs", external: true },
  { label: "Tasks", external: true },
  { label: "Discover More Products" },
];

const bottomItems = ["My Account", "Admin", "Support"];

export default function Sidebar() {
  const [active, setActive] = useState("Home");
  const navigate = useNavigate();

  return (
    <div className="w-44 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full min-h-screen relative">
      {/* Up arrow */}
      <div className="flex justify-center py-1 border-b border-gray-100">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {/* Home */}
        <button
          onClick={() => setActive("Home")}
          className={`w-full text-left text-sm px-2 py-1.5 rounded-md mb-1 font-medium transition-colors ${active === "Home" ? "text-[#2D8CFF]" : "text-gray-700 hover:text-[#2D8CFF]"}`}
        >
          Home
        </button>

        {/* My Products */}
        <p className="text-xs text-gray-400 px-2 mt-2 mb-1">My Products</p>
        {myProducts.map(({ label, badge, external }) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            className={`w-full text-left text-sm px-2 py-1.5 rounded-md flex items-center justify-between transition-colors ${active === label ? "text-[#2D8CFF]" : "text-gray-600 hover:text-[#2D8CFF]"}`}
          >
            <span>{label}</span>
            <span className="flex items-center gap-1">
              {badge && (
                <span className="text-[10px] bg-blue-100 text-[#2D8CFF] px-1.5 py-0.5 rounded font-semibold">{badge}</span>
              )}
              {external && (
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom items */}
      <div className="border-t border-gray-100 px-3 py-2">
        {bottomItems.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={`w-full text-left text-sm px-2 py-1.5 rounded-md flex items-center gap-1 transition-colors ${active === item ? "text-[#2D8CFF]" : "text-gray-600 hover:text-[#2D8CFF]"}`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {item}
          </button>
        ))}
      </div>

      {/* Down arrow */}
      <div className="flex justify-center py-1 border-t border-gray-100">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
