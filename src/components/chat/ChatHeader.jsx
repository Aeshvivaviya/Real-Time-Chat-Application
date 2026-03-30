import React, { useState } from "react";
import { Menu, Search, Phone, Video, MoreVertical, PanelRight } from "lucide-react";

const COLORS = ["bg-pink-500","bg-blue-500","bg-purple-500","bg-green-500","bg-rose-500","bg-indigo-500","bg-teal-500","bg-amber-500"];
function getColor(id) {
  let hash = 0;
  for (let i = 0; i < String(id).length; i++) hash = String(id).charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}
function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function ChatHeader({ selectedUser, isConnected, onVideoCall, onMenuClick, onSharedClick }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100 bg-white shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={20} />
        </button>

        {selectedUser ? (
          <>
            <div className="relative shrink-0">
              <div className={`w-9 h-9 rounded-full ${getColor(selectedUser.id)} flex items-center justify-center text-white text-sm font-bold`}>
                {getInitials(selectedUser.username)}
              </div>
              {isConnected && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900 truncate">{selectedUser.username}</h2>
              <p className="text-xs text-gray-400 truncate">
                {isConnected ? "● Active now" : "Connecting..."}
              </p>
            </div>
          </>
        ) : (
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900">Messages</h2>
            <p className="text-xs text-gray-400 hidden sm:block">Select a conversation</p>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 shrink-0">
        {searchOpen ? (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="text-sm text-gray-700 outline-none bg-transparent w-32 sm:w-48 placeholder-gray-400"
            />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-gray-400 hover:text-gray-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <Search size={18} />
          </button>
        )}

        <button
          onClick={onVideoCall}
          disabled={!selectedUser || !isConnected}
          className={`p-2 rounded-lg transition-colors ${selectedUser && isConnected ? "text-gray-500 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"}`}
        >
          <Video size={18} />
        </button>

        <button
          disabled={!selectedUser || !isConnected}
          className={`p-2 rounded-lg transition-colors ${selectedUser && isConnected ? "text-gray-500 hover:bg-gray-100" : "text-gray-300 cursor-not-allowed"}`}
        >
          <Phone size={18} />
        </button>

        {/* Shared panel toggle — hidden on xl (always visible there) */}
        <button onClick={onSharedClick} className="xl:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Shared files">
          <PanelRight size={18} />
        </button>

        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
}
