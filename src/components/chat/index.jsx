import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import PrivateChat from "./PrivateChat";
import Notification from "./Notification";
import VideoCall from "./VideoCall"; // Import VideoCall component

const API_URL = "http://192.168.29.92:5000";
const SOCKET_URL = "http://192.168.29.92:5000";

function Chat({ user }) {
  const [privateMessages, setPrivateMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);
  const [startVideo, setStartVideo] = useState(false); // State for video call

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const initialLoadDone = useRef(false);

  // ✅ Format time function
  const formatTime = useCallback((timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, []);

  // ✅ Load saved data from localStorage
  useEffect(() => {
    if (user?.id && !initialLoadDone.current) {
      initialLoadDone.current = true;

      try {
        // Messages load karo
        const savedMessages = localStorage.getItem(`chat_messages_${user.id}`);
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          setPrivateMessages(parsedMessages);
        }

        // Users load karo
        const savedUsers = localStorage.getItem(`all_users_${user.id}`);
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers);
          const filteredUsers = parsedUsers.filter(
            (u) =>
              u.username !== "System" &&
              u.username !== "system" &&
              u.id !== "system",
          );
          setUsers(filteredUsers);
        }

        // Selected user load karo
        const savedSelectedUser = localStorage.getItem(
          `selected_user_${user.id}`,
        );
        if (savedSelectedUser) {
          const parsedUser = JSON.parse(savedSelectedUser);
          if (
            parsedUser.username === "System" ||
            parsedUser.username === "system"
          ) {
            setSelectedUser(null);
          } else {
            setSelectedUser(parsedUser);
          }
        }
      } catch (e) {
        console.error("Error loading saved data:", e);
      }
    }
  }, [user]);

  // ✅ Save messages to localStorage
  useEffect(() => {
    if (user?.id) {
      try {
        localStorage.setItem(
          `chat_messages_${user.id}`,
          JSON.stringify(privateMessages),
        );
        console.log("Messages saved to localStorage:", privateMessages);
      } catch (e) {
        console.error("Error saving messages:", e);
      }
    }
  }, [privateMessages, user]);

  // ✅ Save users to localStorage
  useEffect(() => {
    if (user?.id && users.length > 0) {
      try {
        localStorage.setItem(`all_users_${user.id}`, JSON.stringify(users));
      } catch (e) {
        console.error("Error saving users:", e);
      }
    }
  }, [users, user]);

  // ✅ Save selected user
  useEffect(() => {
    if (user?.id && selectedUser) {
      try {
        localStorage.setItem(
          `selected_user_${user.id}`,
          JSON.stringify(selectedUser),
        );
      } catch (e) {
        console.error("Error saving selected user:", e);
      }
    }
  }, [selectedUser, user]);

  // ✅ Load private chat history
  const loadPrivateChatHistory = useCallback(
    async (otherUserId) => {
      if (!user?.id || !otherUserId) return;

      try {
        const response = await axios.get(`${API_URL}/api/private-messages`, {
          params: {
            userId: user.id,
            otherUserId: otherUserId,
          },
        });

        const messages = response.data?.messages || response.data || [];
        console.log("Loaded messages from server:", messages);

        setPrivateMessages((prev) => ({
          ...prev,
          [otherUserId]: Array.isArray(messages) ? messages : [],
        }));
      } catch (err) {
        console.error("Private messages load error:", err);
        setError("Failed to load message history");
      }
    },
    [user],
  );

  // ✅ Socket connection and event listeners
  useEffect(() => {
    if (!socketRef.current) {
      console.log("🔌 Connecting to socket...");

      // Create socket with user data in query
      socketRef.current = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        query: {
          userId: user?.id,
          username: user?.username,
        },
      });
    }

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
      setError("");

      // Register user with socket
      if (user?.id) {
        socket.emit("register", user.id, user.username);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setError(
        `Failed to connect to server at ${SOCKET_URL}. Make sure server is running.`,
      );
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      setIsConnected(false);
    });

    socket.on("onlineUsers", (users) => {
      console.log("👥 Online users:", users);
      setOnlineUsers(users);
    });

    // Listen for private messages
    socket.on("private-message", (message) => {
      console.log("📩 Received message (private-message):", message);

      if (
        message &&
        (message.toUserId === user?.id || message.fromUserId === user?.id)
      ) {
        setPrivateMessages((prev) => {
          const otherUserId =
            message.fromUserId === user?.id
              ? message.toUserId
              : message.fromUserId;
          const existingMessages = prev[otherUserId] || [];

          const exists = existingMessages.some((m) => m.id === message.id);
          if (exists) {
            return prev;
          }

          const updatedMessages = [...existingMessages, message];

          return {
            ...prev,
            [otherUserId]: updatedMessages,
          };
        });

        if (
          message.fromUserId !== user?.id &&
          (!selectedUser || selectedUser.id !== message.fromUserId)
        ) {
          setNotification({
            message: `New message from ${message.fromUsername}`,
            type: "info",
          });
        }

        if (
          selectedUser &&
          (selectedUser.id === message.fromUserId ||
            selectedUser.id === message.toUserId)
        ) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    });

    // Listen for typing events
    socket.on("typing", ({ username, isTyping, fromUserId }) => {
      if (selectedUser && selectedUser.id === fromUserId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(username);
          } else {
            newSet.delete(username);
          }
          return newSet;
        });
      }
    });

    // Listen for user list updates
    socket.on("users", (userList) => {
      console.log("📋 Users list received:", userList);
      if (userList && userList.length > 0) {
        const filteredList = userList.filter(
          (u) =>
            u?.username !== "System" &&
            u?.username !== "system" &&
            u?.id !== "system",
        );
        setUsers(filteredList);
      }
    });

    // Also listen for "privateMessage" event
    socket.on("privateMessage", (message) => {
      console.log("📩 Received message (privateMessage event):", message);

      if (
        message &&
        (message.toUserId === user?.id || message.fromUserId === user?.id)
      ) {
        setPrivateMessages((prev) => {
          const otherUserId =
            message.fromUserId === user?.id
              ? message.toUserId
              : message.fromUserId;
          const existingMessages = prev[otherUserId] || [];

          const exists = existingMessages.some((m) => m.id === message.id);
          if (exists) return prev;

          return {
            ...prev,
            [otherUserId]: [...existingMessages, message],
          };
        });

        if (
          message.fromUserId !== user?.id &&
          (!selectedUser || selectedUser.id !== message.fromUserId)
        ) {
          setNotification({
            message: `New message from ${message.fromUsername}`,
            type: "info",
          });
        }

        if (
          selectedUser &&
          (selectedUser.id === message.fromUserId ||
            selectedUser.id === message.toUserId)
        ) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    });

    // Request initial users list
    socket.emit("getUsers");

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("onlineUsers");
      socket.off("private-message");
      socket.off("privateMessage");
      socket.off("typing");
      socket.off("users");
    };
  }, [user, selectedUser]);

  // ✅ Load private chat when user is selected
  useEffect(() => {
    if (selectedUser?.id && isConnected) {
      console.log("Loading chat history for user:", selectedUser.id);
      loadPrivateChatHistory(selectedUser.id);
    }
  }, [selectedUser, loadPrivateChatHistory, isConnected]);

  // ✅ Send private message
  const sendMessage = useCallback(
    (e) => {
      e.preventDefault();

      if (!newMessage.trim()) {
        setError("Message cannot be empty");
        return;
      }

      if (!socketRef.current) {
        setError("Socket connection not initialized");
        return;
      }

      if (!socketRef.current.connected) {
        setError("Server se connected nahi hai. Reconnecting...");
        socketRef.current.connect();
        return;
      }

      if (!selectedUser) {
        setError("Pehle kisi user ko select karo");
        return;
      }

      if (
        selectedUser.username === "System" ||
        selectedUser.username === "system"
      ) {
        setError("System user ko message nahi bhej sakte");
        return;
      }

      const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${user.id}`;
      const timestamp = new Date().toISOString();

      const messageData = {
        id: messageId,
        fromUserId: user.id,
        fromUsername: user.username,
        toUserId: selectedUser.id,
        toUsername: selectedUser.username,
        text: newMessage.trim(),
        timestamp: timestamp,
        type: "private",
      };

      console.log("📤 Sending message:", messageData);

      socketRef.current.emit("private-message", messageData);
      socketRef.current.emit("privateMessage", messageData);

      setPrivateMessages((prev) => {
        const otherUserId = selectedUser.id;
        const existingMessages = prev[otherUserId] || [];

        const exists = existingMessages.some((m) => m.id === messageId);
        if (exists) {
          return prev;
        }

        const updatedMessages = [...existingMessages, messageData];

        return {
          ...prev,
          [otherUserId]: updatedMessages,
        };
      });

      setNewMessage("");

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socketRef.current.emit("typing", {
        username: user.username,
        isTyping: false,
        toUserId: selectedUser.id,
      });

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      setError("");
    },
    [newMessage, selectedUser, user],
  );

  // ✅ Handle typing
  const handleTyping = useCallback(
    (e) => {
      setNewMessage(e.target.value);

      if (!socketRef.current?.connected || !selectedUser) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socketRef.current.emit("typing", {
        username: user.username,
        isTyping: e.target.value.length > 0,
        toUserId: selectedUser.id,
      });

      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit("typing", {
            username: user.username,
            isTyping: false,
            toUserId: selectedUser.id,
          });
        }
      }, 2000);
    },
    [selectedUser, user],
  );

  // ✅ Logout function
  const handleLogout = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (user?.id) {
      localStorage.removeItem(`chat_messages_${user.id}`);
      localStorage.removeItem(`all_users_${user.id}`);
      localStorage.removeItem(`selected_user_${user.id}`);
    }

    setSelectedUser(null);
    setPrivateMessages({});
    setIsConnected(false);
    setStartVideo(false); // Close video call on logout

    window.location.href = "/";
  }, [user]);

  // ✅ Filter users for search
  const filteredUsers = React.useMemo(() => {
    return users.filter(
      (u) =>
        u.id !== user?.id &&
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm, user]);

  // ✅ Clear notification
  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // ✅ Handle video call from ChatHeader
  const handleVideoCall = useCallback(() => {
    console.log("📹 Video call button clicked");
    if (!selectedUser) {
      setError("Please select a user first");
      return;
    }
    if (!isConnected) {
      setError("Not connected to server");
      return;
    }
    setStartVideo(true);
  }, [selectedUser, isConnected]);

  // ✅ Handle audio call from ChatHeader
  const handleAudioCall = useCallback(() => {
    if (!selectedUser) {
      setError("Please select a user first");
      return;
    }
    if (!isConnected) {
      setError("Not connected to server");
      return;
    }
    alert(`Initiating audio call with ${selectedUser.username}...`);
    // Implement audio call logic here
  }, [selectedUser, isConnected]);

  // ✅ Handle search from ChatHeader
  const handleSearch = useCallback((query) => {
    console.log("Searching for:", query);
    // Implement search logic here
    alert(`Searching for: ${query}`);
  }, []);

  // ✅ Close video call
  const closeVideoCall = useCallback(() => {
    setStartVideo(false);
  }, []);

  // Debug: Log current messages for selected user
  useEffect(() => {
    if (selectedUser) {
      console.log(
        "Current messages for",
        selectedUser.username,
        ":",
        privateMessages[selectedUser.id],
      );
    }
  }, [selectedUser, privateMessages]);

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Sidebar
          users={filteredUsers}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          user={user}
          isConnected={isConnected}
          onlineUsers={onlineUsers}
          privateMessages={privateMessages}
        />

        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <ChatHeader
            selectedUser={selectedUser}
            handleLogout={handleLogout}
            isConnected={isConnected}
            onVideoCall={handleVideoCall}
            onAudioCall={handleAudioCall}
            onSearch={handleSearch}
          />

          {notification && (
            <Notification
              notification={notification}
              clearNotification={clearNotification}
            />
          )}

          {!isConnected && (
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 text-yellow-500 p-3 text-center text-sm flex justify-between items-center backdrop-blur-xl border-b border-yellow-500/20">
              <div className="flex items-center gap-2 flex-1 justify-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Connecting to server...</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg text-yellow-400 transition-all duration-300 text-xs font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {error && (
            <div className="mx-4 mt-4 p-4 bg-red-600/10 border border-red-500/30 rounded-xl backdrop-blur-xl flex justify-between items-center">
              <span className="text-red-400 flex items-center gap-2">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                {error}
              </span>
              <button
                onClick={() => setError("")}
                className="text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
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
                <h3 className="text-white text-xl font-semibold mb-2">
                  Select a user to start chatting
                </h3>
                <p className="text-gray-400">
                  {filteredUsers.length} users available
                </p>
              </div>
            </div>
          ) : (
            <PrivateChat
              selectedUser={selectedUser}
              messages={privateMessages[selectedUser.id] || []}
              user={user}
              formatTime={formatTime}
              typingUsers={typingUsers}
              messagesEndRef={messagesEndRef}
            />
          )}

          {selectedUser && (
            <form
              onSubmit={sendMessage}
              className="bg-gray-800/50 backdrop-blur-xl p-4 border-t border-gray-700"
            >
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder={
                    !isConnected
                      ? "Connecting..."
                      : `Message @${selectedUser.username}...`
                  }
                  className="flex-1 px-6 py-3 bg-gray-700/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 transition-all duration-300"
                  disabled={!isConnected}
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Send
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      ></path>
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
          )}
        </div>
      </div>

      {/* Video Call Component */}
      {startVideo && (
        <VideoCall
          start={startVideo}
          selectedUser={selectedUser}
          isConnected={isConnected}
          onClose={closeVideoCall}
        />
      )}
    </>
  );
}

export default Chat;