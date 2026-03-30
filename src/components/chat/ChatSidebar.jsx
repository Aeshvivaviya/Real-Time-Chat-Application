import React, { useState } from "react";
import { Search, X, LogOut } from "lucide-react";

const COLORS = ["bg-pink-500","bg-blue-500","bg-purple-500","bg-green-500","bg-rose-500","bg-indigo-500","bg-teal-500","bg-amber-500"];

function getColor(id) {
  let hash = 0;
  for (let i = 0; i < String(id).length; i++) hash = String(id).charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function getLastMessage(userId, privateMessages) {
  const msgs = privateMessages[userId] || [];
  if (!msgs.length) return "";
  return msgs[msgs.length - 1]?.text || "";
}

function getUnreadCount(userId, currentUserId, privateMessages) {
  return (privateMessages[userId] || []).filter(m => m.fromUserId === userId && m.fromUserId !== currentUserId).length;
}

export default function ChatSidebar({ users, selectedUser, setSelectedUser, searchTerm, setSearchTerm, user, onlineUsers, privateMessages, onClose, onLogout }) {
  const [activeTab, setActiveTab] = useState("chats");

  const isOnline = (id) => onlineUsers.some(u => String(u.userId) === String(id));
  const totalUnread = users.reduce((acc, u) => acc + getUnreadCount(u.id, user?.id, privateMessages), 0);

  const tabs = [
    { id: "chat", label: "Chat" },
    { id: "chats", label: "Chats", badge: totalUnread || null },
    { id: "channels", label: "Channels" },
  ];

  return (
    <div className="w-[280px] h-full bg-white border-r border-gray-100 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Chat</h2>
        <div className="flex items-center gap-1">
          <button onClick={onLogout} title="Sign out" className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
            <LogOut size={16} />
          </button>
          <button onClick={onClose} className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 flex gap-1 mb-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === tab.id ? "bg-pink-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                activeTab === tab.id ? "bg-white text-pink-500" : "bg-pink-500 text-white"
              }`}>
                {tab.badge > 9 ? "9+" : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 focus-within:border-blue-300 transition-colors">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
          />
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {users.length === 0 ? (
          <p className="text-gray-400 text-sm text-center mt-10">No users found</p>
        ) : (
          users.map(u => {
            const online = isOnline(u.id);
            const unread = getUnreadCount(u.id, user?.id, privateMessages);
            const lastMsg = getLastMessage(u.id, privateMessages);
            const color = getColor(u.id);
            const initials = getInitials(u.username);
            const isSelected = selectedUser?.id === u.id;

            return (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 transition-all text-left ${
                  isSelected ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold`}>
                    {initials}
                  </div>
                  {online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-semibold truncate ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                      {u.username}
                    </span>
                    {lastMsg && <span className="text-[11px] text-gray-400 shrink-0 ml-1">now</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{lastMsg || (online ? "Online" : "Offline")}</p>
                </div>

                {/* Unread badge */}
                {unread > 0 && !isSelected && (
                  <span className="shrink-0 min-w-[20px] h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Current user footer */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${getColor(user?.id)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {getInitials(user?.username)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{user?.username}</p>
          <p className="text-xs text-green-500">● Online</p>
        </div>
      </div>
    </div>
  );
}
