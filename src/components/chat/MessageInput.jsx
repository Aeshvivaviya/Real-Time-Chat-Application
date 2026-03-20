import React from "react";

function MessageInput({ 
  newMessage, 
  
  handleTyping, 
  sendMessage, 
  isConnected,
  setShowEmojiPicker,
  fileInputRef 
}) {
  return (
    <form
      onSubmit={sendMessage}
      className="bg-gray-800/50 backdrop-blur-xl p-4 border-t border-gray-700"
    >
      <div className="flex gap-3 items-center">
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
          </svg>
        </button>
        
        {/* Emoji button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(prev => !prev)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </button>
        
        {/* Hidden file input */}
        <input type="file" ref={fileInputRef} className="hidden" />
        
        {/* Message input */}
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          className="flex-1 px-6 py-3 bg-gray-700/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 transition-all duration-300"
          disabled={!isConnected}
        />
        
        {/* Send button */}
        <button
          type="submit"
          disabled={!newMessage.trim() || !isConnected}
          className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            Send
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </span>
        </button>
      </div>
      
      {!isConnected && (
        <p className="text-yellow-500 text-sm mt-3 text-center">
          ⚠ Waiting for server connection...
        </p>
      )}
    </form>
  );
}

export default MessageInput;