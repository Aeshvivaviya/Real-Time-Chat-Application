import React, { useState } from "react";
import { Video } from "lucide-react";

function ChatHeader({ selectedUser, isConnected, onVideoCall, onMenuClick }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAudioCall = () => {
    if (!selectedUser) {
      return;
    }
    if (!isConnected) {
      return;
    }

    // You can implement actual audio call logic here
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl px-3 py-3 md:p-4 border-b border-gray-700 flex justify-between items-center gap-2">
      {/* Left side */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-400 hover:text-white transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <div className="min-w-0">
          <h2 className="text-white text-base md:text-xl font-bold truncate">
            {selectedUser ? `@${selectedUser.username}` : "Private Chat"}
          </h2>
          <p className="text-gray-400 text-xs md:text-sm hidden sm:block truncate">
            {selectedUser ? `Chat with ${selectedUser.username}` : "Select a user"}
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        <button
          onClick={onVideoCall}
          className="bg-green-600 hover:bg-green-700 p-2 md:p-3 rounded-xl transition"
        >
          <Video size={16} className="md:w-[18px] md:h-[18px]" />
        </button>

        <button
          onClick={handleAudioCall}
          disabled={!selectedUser || !isConnected}
          className={`p-2 md:p-3 rounded-xl transition-all duration-300 ${
            selectedUser && isConnected
              ? "bg-green-600/20 text-green-500 hover:bg-green-600/30"
              : "bg-gray-700/30 text-gray-600 cursor-not-allowed"
          }`}
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 md:p-3 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700 transition-all duration-300"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>

          {isSearchOpen && (
            <div className="absolute right-0 mt-2 w-64 md:w-80 bg-gray-800 rounded-xl shadow-lg border border-gray-700 z-50">
              <form onSubmit={handleSearch} className="p-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button type="submit" className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">Search</button>
                  <button type="button" onClick={() => setIsSearchOpen(false)} className="flex-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
