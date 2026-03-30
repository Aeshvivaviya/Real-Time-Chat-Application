import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';

const MeetingChat = ({ socket, meetingId, myName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      setMessages(prev => [...prev, msg]);
    };

    socket.on('meeting-message', handler);
    return () => socket.off('meeting-message', handler);
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const msg = {
      roomId: meetingId,
      sender: myName,
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    socket.emit('meeting-message', msg);
    setMessages(prev => [...prev, msg]); // optimistic
    setInput('');
  };

  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <div className="absolute right-0 top-0 h-full w-72 sm:w-80 bg-gray-900/95 backdrop-blur-md border-l border-white/10 flex flex-col z-30 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-white font-semibold text-sm">Meeting Chat</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-xs text-center mt-8">No messages yet. Say hi!</p>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender === myName;
            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && (
                  <span className="text-blue-400 text-[11px] font-medium mb-0.5 px-1">{msg.sender}</span>
                )}
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm break-words ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-700 text-gray-100 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
                <span className="text-gray-600 text-[10px] mt-0.5 px-1">{formatTime(msg.timestamp)}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Message everyone..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="text-blue-400 hover:text-blue-300 disabled:opacity-30 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingChat;
