import React, { useEffect, useState } from "react";

function Sidebar({
  users: propUsers,
  selectedUser,
  setSelectedUser,
  searchTerm,
  setSearchTerm,
  user,
 
  onlineUsers = [],
  privateMessages = {}, // Add this prop to receive messages
}) {
  const [localUsers, setLocalUsers] = useState([]);

  const currentUser =
    user || JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Load users
  useEffect(() => {
    const storedUsers =
      JSON.parse(localStorage.getItem("chatUsers")) || [];

    // ❗ remove duplicate users
    const uniqueUsers = storedUsers.filter(
      (user, index, self) =>
        index === self.findIndex((u) => u.id === user.id)
    );

    setLocalUsers(uniqueUsers);
  }, []);

  // ✅ Use correct users list
  const displayUsers =
    propUsers?.length > 0 ? propUsers : localUsers;

  // ✅ Filter users (remove current user + search)
  const filteredUsers = displayUsers
    .filter((u) => String(u.id) !== String(currentUser?.id))
    .filter((u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // ✅ Online check FIXED
  const isUserOnline = (userId) => {
    return onlineUsers.some(
      (u) => String(u.userId) === String(userId)
    );
  };

  // ✅ Calculate unread messages for a user
  const getUnreadCount = (userId) => {
    if (!privateMessages || !privateMessages[userId]) return 0;
    
    // Count messages from this user that are not from current user
    const messages = privateMessages[userId] || [];
    const unreadCount = messages.filter(msg => 
      msg.fromUserId === userId && // Message is from this user
      msg.fromUserId !== currentUser?.id // Not from current user
    ).length;
    
    return unreadCount;
  };

  const onlineCount = filteredUsers.filter((u) =>
    isUserOnline(u.id)
  ).length;

  const isCurrentUserOnline = currentUser?.id
    ? onlineUsers.some(
        (u) => String(u.userId) === String(currentUser.id)
      )
    : false;

  return (
    <div className="w-72 h-full bg-gradient-to-b from-gray-900 to-black border-r border-gray-800/50 flex flex-col">
      
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-800">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${onlineCount > 0 ? "bg-green-500" : "bg-gray-500"}`}></span>
          Users
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          <span className="text-green-400">{onlineCount}</span> online •{" "}
          <span>{filteredUsers.length} total</span>
        </p>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-3 w-full px-3 py-2 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No users yet
          </p>
        ) : (
          filteredUsers.map((u) => {
            const isOnline = isUserOnline(u.id);
            const unreadCount = getUnreadCount(u.id);

            return (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`p-3 rounded-lg mb-2 cursor-pointer flex items-center justify-between ${
                  selectedUser?.id === u.id
                    ? "bg-blue-600/20"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="flex-1">
                  {/* ✅ USERNAME FIX */}
                  <p className="text-white font-medium">
                    {u.username}
                  </p>

                  {/* ✅ ONLINE STATUS FIX */}
                  <p
                    className={`text-xs ${
                      isOnline
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    {isOnline ? "🟢 Online" : "⚫ Offline"}
                  </p>
                </div>

                {/* ✅ UNREAD COUNT BADGE */}
                {unreadCount > 0 && selectedUser?.id !== u.id && (
                  <div className="flex items-center justify-center min-w-6 h-6 bg-blue-500 rounded-full px-2 ml-2">
                    <span className="text-white text-xs font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Current User */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-white">{currentUser?.username}</p>
        <p className="text-xs text-gray-400">
          {isCurrentUserOnline ? "🟢 Online" : "⚫ Offline"}
        </p>
      </div>
    </div>
  );
}

export default Sidebar;