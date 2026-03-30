import React, { useState } from "react";
import { X, FileText } from "lucide-react";

const COLORS = ["bg-pink-500","bg-blue-500","bg-purple-500","bg-green-500","bg-rose-500","bg-indigo-500","bg-teal-500","bg-amber-500"];
const GRADIENTS = ["from-blue-400 to-purple-500","from-pink-400 to-rose-500","from-green-400 to-teal-500","from-amber-400 to-orange-500"];

function getColor(id) {
  let hash = 0;
  for (let i = 0; i < String(id).length; i++) hash = String(id).charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}
function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function SharedPanel({ users = [], onlineUsers = [], currentUser, onClose }) {
  const [activeTab, setActiveTab] = useState("files");

  const isOnline = (id) => onlineUsers.some(u => String(u.userId) === String(id));

  const tabs = [
    { id: "files", label: "Files & Links" },
    { id: "pinned", label: "Pinned" },
  ];

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-100 shrink-0">
        <h2 className="text-base font-bold text-gray-900">Shared</h2>
        {onClose && (
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3 pb-2 flex gap-1 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === tab.id ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {activeTab === "files" ? (
          users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <FileText size={32} className="mb-2 opacity-30" />
              <p className="text-sm">No shared files yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u, i) => (
                <div key={u.id} className="bg-gray-50 rounded-2xl p-3 hover:bg-blue-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative shrink-0">
                      <div className={`w-7 h-7 rounded-full ${getColor(u.id)} flex items-center justify-center text-white text-xs font-bold`}>
                        {getInitials(u.username)}
                      </div>
                      {isOnline(u.id) && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-white rounded-full" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 flex-1 truncate">{u.username}</span>
                    <span className="text-[11px] text-gray-400">{isOnline(u.id) ? "Online" : "Offline"}</span>
                  </div>
                  <div className={`w-full h-20 rounded-xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center mb-2`}>
                    <span className="text-white text-xs opacity-80">📎 Shared file</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">Shared by {u.username}</p>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <span className="text-3xl mb-2">📌</span>
            <p className="text-sm">No pinned messages</p>
          </div>
        )}
      </div>

      {/* Online members */}
      <div className="px-4 py-3 border-t border-gray-100 shrink-0">
        <p className="text-xs font-semibold text-gray-500 mb-2">Members ({users.length})</p>
        <div className="flex flex-wrap gap-1.5">
          {users.slice(0, 8).map(u => (
            <div key={u.id} title={u.username} className="relative">
              <div className={`w-7 h-7 rounded-full ${getColor(u.id)} flex items-center justify-center text-white text-[10px] font-bold`}>
                {getInitials(u.username)}
              </div>
              {isOnline(u.id) && (
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-white rounded-full" />
              )}
            </div>
          ))}
          {users.length > 8 && (
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-[10px] font-bold">
              +{users.length - 8}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
