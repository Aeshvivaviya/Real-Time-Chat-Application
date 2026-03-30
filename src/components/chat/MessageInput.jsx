import React, { useState, useRef } from "react";
import { Smile, Paperclip, Send } from "lucide-react";

const QUICK_EMOJIS = ["😊","👍","❤️","😂","🔥","🎉","👏","😮"];

export default function MessageInput({ newMessage, onTyping, onSend, isConnected, selectedUser }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef(null);

  const handleSend = () => {
    if (!newMessage.trim() || !isConnected) return;
    onSend(newMessage);
    onTyping("");
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji) => {
    onTyping(newMessage + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  return (
    <div className="px-4 sm:px-5 py-3.5 border-t border-gray-100 bg-white shrink-0 relative">
      {showEmoji && (
        <div className="absolute bottom-full left-4 mb-2 bg-white border border-gray-200 rounded-2xl shadow-xl px-4 py-3 flex gap-3 z-10">
          {QUICK_EMOJIS.map(e => (
            <button key={e} onClick={() => addEmoji(e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <button
          type="button"
          onClick={() => setShowEmoji(p => !p)}
          className="text-gray-400 hover:text-yellow-500 transition-colors shrink-0"
        >
          <Smile size={20} />
        </button>

        <button type="button" className="text-gray-400 hover:text-blue-500 transition-colors shrink-0">
          <Paperclip size={20} />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={e => onTyping(e.target.value)}
          onKeyDown={handleKey}
          placeholder={
            !isConnected ? "Connecting..." :
            selectedUser ? `Message @${selectedUser.username}...` :
            "Select a user to chat..."
          }
          disabled={!isConnected || !selectedUser}
          className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400 disabled:cursor-not-allowed"
          autoFocus
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!newMessage.trim() || !isConnected}
          className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors shrink-0"
        >
          <Send size={14} className={newMessage.trim() && isConnected ? "text-white" : "text-gray-400"} />
        </button>
      </div>
    </div>
  );
}
