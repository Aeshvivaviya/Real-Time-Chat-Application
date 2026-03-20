import React from "react";

function MessageList({ 
  messages, 
  loading, 
  user, 
  formatTime, 
  formatDate, 
  deleteMessage, 
  typingUsers, 
  messagesEndRef 
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
          <div className="text-8xl mb-4 opacity-20">💬</div>
          <p className="text-xl font-light">No messages yet</p>
          <p className="text-sm mt-2">Start a conversation</p>
        </div>
      ) : (
        <>
          {/* Date separator */}
          <div className="flex justify-center">
            <span className="px-4 py-1 bg-gray-800 rounded-full text-xs text-gray-400">
              {formatDate(messages[0]?.timestamp)}
            </span>
          </div>
          
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className="animate-fadeIn">
              <div
                className={`flex ${
                  msg.username === user?.username 
                    ? "justify-end" 
                    : "justify-start"
                } group`}
              >
                {msg.username !== user?.username && msg.username !== "System" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-1">
                    {msg.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div
                  className={`relative max-w-xs md:max-w-md rounded-2xl p-4 shadow-xl transition-all duration-300 ${
                    msg.username === user?.username
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                      : msg.username === "System"
                        ? "bg-gray-800/50 backdrop-blur-xl text-yellow-300 border border-gray-700"
                        : "bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none"
                  }`}
                >
                  {msg.username !== user?.username && msg.username !== "System" && (
                    <p className="text-xs font-bold mb-2 text-blue-400 flex items-center gap-1">
                      <span>{msg.username}</span>
                      <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                      <span className="text-gray-500 font-normal">
                        {formatTime(msg.timestamp)}
                      </span>
                    </p>
                  )}
                  
                  <p className="break-words leading-relaxed">{msg.text}</p>
                  
                  {msg.username === user?.username && (
                    <p className="text-xs mt-2 opacity-75 flex justify-end items-center gap-2">
                      <span>{formatTime(msg.timestamp)}</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                      </svg>
                    </p>
                  )}
                  
                  {/* Message actions on hover */}
                  {msg.username === user?.username && msg.username !== "System" && (
                    <div className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="text-xs text-red-400 hover:text-red-500 bg-gray-800 px-3 py-1 rounded-lg shadow-lg flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
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
              .filter((n) => n !== user?.username && n !== "System")
              .join(", ")}{" "}
            typing...
          </span>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;