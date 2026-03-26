import React from "react";

function PrivateChat({ 
 
  messages, 
  loading, 
  user, 
  formatTime, 
  typingUsers, 
  messagesEndRef
}) {
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <p className="text-xl font-light">No messages yet</p>
          <p className="text-sm mt-2">Send a message to start conversation</p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div key={msg.id || idx} className="animate-fadeIn">
            <div
              className={`flex ${
                msg.fromUserId === user?.id
                  ? "justify-end" 
                  : "justify-start"
              }`}
            >
              {/* Avatar for other user */}
              {msg.fromUserId !== user?.id && msg.fromUserId !== "system" && (
                <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shadow-lg flex-shrink-0">
                  {msg.fromUsername?.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Message bubble */}
              <div
                className={`relative max-w-[75vw] sm:max-w-xs md:max-w-md rounded-2xl px-3 py-2 md:px-4 shadow-xl text-sm md:text-base ${
                  msg.fromUserId === user?.id
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                    : msg.fromUserId === "system"
                      ? "bg-gray-800/50 backdrop-blur-xl text-yellow-300 border border-gray-700"
                      : "bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none"
                }`}
              >
                {/* Username for other user */}
                {msg.fromUserId !== user?.id && msg.fromUserId !== "system" && (
                  <div className="text-xs font-semibold text-blue-400 mb-1">
                    {msg.fromUsername}
                  </div>
                )}

                {/* System message indicator */}
                {msg.fromUserId === "system" && (
                  <div className="text-xs font-semibold text-yellow-400 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    System
                  </div>
                )}
                
                {/* Message text aur time ek hi row mein */}
                <div className="flex items-end gap-2">
                  <p className="break-words leading-relaxed">{msg.text}</p>
                  <p className="text-[10px] opacity-60 whitespace-nowrap">
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="flex items-center gap-2 text-gray-400 text-sm animate-pulse">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
          <span>
            {Array.from(typingUsers)
              .filter((n) => n !== user?.username)
              .join(", ")}{" "}
            typing...
          </span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default PrivateChat;