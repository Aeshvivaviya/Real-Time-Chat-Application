import React, { useState } from "react";
import { Video } from "lucide-react";

function ChatHeader({ selectedUser, isConnected, onVideoCall }) {
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
    <div className="bg-gray-800/50 backdrop-blur-xl p-4 border-b border-gray-700 flex justify-between items-center">
      {/* Left side - User info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            ></path>
          </svg>
        </div>
        <div>
          <h2 className="text-white text-xl font-bold">
            {selectedUser ? `@${selectedUser.username}` : "Private Chat"}
          </h2>
          <p className="text-gray-400 text-sm">
            {selectedUser
              ? `Private conversation with ${selectedUser.username}`
              : "Select a user to start chatting"}
          </p>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-2">
        {/* Video Call Button */}
        <div className="flex items-center gap-3">
        
        {/* 🎥 Video Call Button (NEW - same style) */}
        <button
          onClick={onVideoCall}
          className="bg-green-600 hover:bg-green-700 p-3 rounded-xl transition"
        >
          <Video size={18} />
        </button>
        </div>

        {/* Audio Call Button */}
        <button
          onClick={handleAudioCall}
          disabled={!selectedUser || !isConnected}
          className={`group relative px-3 py-2 rounded-xl transition-all duration-300 ${
            selectedUser && isConnected
              ? "bg-green-600/20 text-green-500 hover:bg-green-600/30"
              : "bg-gray-700/30 text-gray-600 cursor-not-allowed"
          }`}
          title={
            !selectedUser
              ? "Select a user first"
              : !isConnected
                ? "Not connected"
                : "Audio call"
          }
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            ></path>
          </svg>
        </button>

        {/* Search Button */}
        <div className="relative">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="group relative px-3 py-2 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700 transition-all duration-300"
            title="Search messages"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </button>

          {/* Search Input Dropdown */}
          {isSearchOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-xl shadow-lg border border-gray-700 z-50">
              <form onSubmit={handleSearch} className="p-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="flex-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="flex-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Logout Button - Optional (commented out) */}
        {/*
        <button
          onClick={handleLogout}
          className="group relative px-4 py-2 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600/20 transition-all duration-300 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </span>
        </button>
        */}
      </div>
    </div>
  );
}

export default ChatHeader;
