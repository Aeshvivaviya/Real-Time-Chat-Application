import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { io } from "socket.io-client";
import axios from "axios";
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import PrivateChat from "./PrivateChat";
import Notification from "./Notification";
import VideoCall from "./VideoCall";



const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

function Chat({ user }) {
  const dedupeMessages = useCallback((messages = []) => {
    const uniqueById = new Map();
    for (const msg of messages) {
      if (!msg) continue;
      const key =
        msg.id ||
        `${msg.fromUserId}-${msg.toUserId}-${msg.timestamp}-${msg.text}`;
      if (!uniqueById.has(key)) {
        uniqueById.set(key, msg);
      }
    }
    return Array.from(uniqueById.values());
  }, []);

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
  const [startVideo, setStartVideo] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callMode, setCallMode] = useState("outgoing");
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const socketRef = useRef(null);
  const selectedUserRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const initialLoadDone = useRef(false);
  const reconnectAttempts = useRef(0);

  // ✅ Format time function
  const formatTime = useCallback((timestamp) => {
    try {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "";
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
        // Load messages
        const savedMessages = localStorage.getItem(`chat_messages_${user.id}`);
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          setPrivateMessages(parsedMessages);
        }

        // Load users
        const savedUsers = localStorage.getItem(`all_users_${user.id}`);
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers);
          const filteredUsers = parsedUsers.filter(
            (u) =>
              u.username !== "System" &&
              u.username !== "system" &&
              u.id !== "system" &&
              u.id !== user.id,
          );
          setUsers(filteredUsers);
        }

        // Load selected user
        const savedSelectedUser = localStorage.getItem(
          `selected_user_${user.id}`,
        );
        if (savedSelectedUser) {
          const parsedUser = JSON.parse(savedSelectedUser);
          if (
            parsedUser.username !== "System" &&
            parsedUser.username !== "system" &&
            parsedUser.id !== "system"
          ) {
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
    if (user?.id && Object.keys(privateMessages).length > 0) {
      try {
        localStorage.setItem(
          `chat_messages_${user.id}`,
          JSON.stringify(privateMessages),
        );
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

  // Keep latest selected user for socket event handlers
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // ✅ Load private chat history
  const loadPrivateChatHistory = useCallback(
    async (otherUserId) => {
      if (!user?.id || !otherUserId) return;

      setIsLoading(true);
      try {
        const response = await axios.get(`/api/private-messages`, {
          params: {
            userId: user.id,
            otherUserId: otherUserId,
          },
          timeout: 15000,
        });

        const messages = response.data?.messages || response.data || [];
        const cleanMessages = dedupeMessages(
          Array.isArray(messages) ? messages : [],
        );

        setPrivateMessages((prev) => ({
          ...prev,
          [otherUserId]: cleanMessages,
        }));
      } catch (err) {
        console.error("Private messages load error:", err);
        if (err.code === "ECONNABORTED") {
          setError("Request timeout. Please check your connection.");
        } else {
          setError("Failed to load message history");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user, dedupeMessages],
  );

  // ✅ Handle incoming messages
  const handleIncomingMessage = useCallback(
    (message) => {
      if (!message || !user?.id) return;

      if (message.toUserId === user.id || message.fromUserId === user.id) {
        setPrivateMessages((prev) => {
          const otherUserId =
            message.fromUserId === user.id
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

        // Show notification for new messages from others
        const activeSelectedUser = selectedUserRef.current;
        if (
          message.fromUserId !== user.id &&
          (!activeSelectedUser || activeSelectedUser.id !== message.fromUserId)
        ) {
          setNotification({
            message: `New message from ${message.fromUsername || "Unknown"}`,
            type: "info",
          });

          // Auto-hide notification after 3 seconds
          setTimeout(() => {
            setNotification(null);
          }, 3000);
        }

        // Scroll to bottom if chat is open
        if (
          activeSelectedUser &&
          (activeSelectedUser.id === message.fromUserId ||
            activeSelectedUser.id === message.toUserId)
        ) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }
    },
    [user],
  );

  // ✅ Socket connection and event listeners
  useEffect(() => {
    if (!user?.id) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log("🔌 Connecting to socket at:", SOCKET_URL);

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 30000,
      query: { userId: user.id, username: user.username },
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
      setError("");
      reconnectAttempts.current = 0;
      socket.emit("register", user.id, user.username);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      reconnectAttempts.current += 1;

      if (reconnectAttempts.current >= 3) {
        setError(
          `Cannot connect to server. Make sure backend is running at ${SOCKET_URL}`,
        );
      }
      setIsConnected(false);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);

      if (reason === "io server disconnect") {
        // Server disconnected, attempt to reconnect
        socket.connect();
      }
    });

    socket.on("onlineUsers", (usersList) => {
      console.log("👥 Online users:", usersList);
      setOnlineUsers(usersList || []);
    });

    socket.on("incoming-call", (data) => {
      console.log("📞 Incoming call:", data);
      setIncomingCall((prev) => {
        if (prev) return prev; // already have incoming call
        return {
          fromUserId: data.from,
          fromUsername: data.fromUsername || "Unknown",
          offer: data.offer || null,
        };
      });
    });

    socket.on("call-initiated", () => {
      setNotification({
        message: "Calling...",
        type: "info",
      });
    });

    socket.on("call-error", (data) => {
      setNotification({
        message: data?.message || "Call failed",
        type: "error",
      });
      setStartVideo(false);
      setCallMode("outgoing");
    });

    socket.on("call-ended", () => {
      setNotification({ message: "Call ended", type: "info" });
      setStartVideo(false);
      setCallMode("outgoing");
      setIncomingCall(null);
      setIncomingOffer(null);
    });

    // Listen for private messages
    socket.on("private-message", handleIncomingMessage);

    // Listen for typing events
    socket.on("typing", ({ username, isTyping, fromUserId }) => {
      if (
        selectedUserRef.current &&
        selectedUserRef.current.id === fromUserId
      ) {
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
      if (userList && Array.isArray(userList)) {
        const filteredList = userList.filter(
          (u) =>
            u?.username !== "System" &&
            u?.username !== "system" &&
            u?.id !== "system" &&
            u?.id !== user.id,
        );
        setUsers(filteredList);
      }
    });

    // Request initial users list
    socket.emit("getUsers");

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("connect_error");
        socket.off("disconnect");
        socket.off("onlineUsers");
        socket.off("incoming-call");
        socket.off("call-initiated");
        socket.off("call-error");
        socket.off("call-ended");
        socket.off("private-message");
        socket.off("typing");
        socket.off("users");
      }
    };
  }, [user, handleIncomingMessage]);

  // ✅ Load private chat when user is selected
  useEffect(() => {
    if (selectedUser?.id && isConnected) {
      console.log("Loading chat history for user:", selectedUser.id);
      loadPrivateChatHistory(selectedUser.id);
    }
  }, [selectedUser, loadPrivateChatHistory, isConnected]);

  // ✅ Send private message
  const sendMessage = useCallback(
    async (e) => {
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
        setError("Not connected to server. Please wait...");
        return;
      }

      if (!selectedUser) {
        setError("Please select a user first");
        return;
      }

      if (
        selectedUser.username === "System" ||
        selectedUser.username === "system"
      ) {
        setError("Cannot send message to System user");
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

      // Optimistically update UI
      setPrivateMessages((prev) => {
        const otherUserId = selectedUser.id;
        const existingMessages = prev[otherUserId] || [];

        // Check if message already exists
        if (existingMessages.some((m) => m.id === messageId)) {
          return prev;
        }

        return {
          ...prev,
          [otherUserId]: [...existingMessages, messageData],
        };
      });

      // Clear input
      setNewMessage("");

      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit message to server
      try {
        socketRef.current.emit("private-message", messageData);

        // Stop typing indicator
        socketRef.current.emit("typing", {
          username: user.username,
          isTyping: false,
          toUserId: selectedUser.id,
        });
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
        // Rollback optimistic update
        setPrivateMessages((prev) => {
          const otherUserId = selectedUser.id;
          const existingMessages = prev[otherUserId] || [];
          const filteredMessages = existingMessages.filter(
            (m) => m.id !== messageId,
          );
          return {
            ...prev,
            [otherUserId]: filteredMessages,
          };
        });
      }

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    [newMessage, selectedUser, user],
  );

  // ✅ Handle typing
  const handleTyping = useCallback(
    (e) => {
      const value = e.target.value;
      setNewMessage(value);

      if (!socketRef.current?.connected || !selectedUser) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socketRef.current.emit("typing", {
        username: user.username,
        isTyping: value.length > 0,
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

    // Clear all state
    setSelectedUser(null);
    setPrivateMessages({});
    setIsConnected(false);
    setStartVideo(false);
    setUsers([]);
    setOnlineUsers([]);
    setError("");
    setNotification(null);
    setSearchTerm("");
    setNewMessage("");

    // Redirect to login
    window.location.href = "/";
  }, [user]);

  // ✅ Filter users for search
  const filteredUsers = useMemo(() => {
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

  // ✅ Handle video call
  const handleVideoCall = useCallback(() => {
    if (!selectedUser) {
      setError("Please select a user first");
      return;
    }
    if (!isConnected) {
      setError("Not connected to server");
      return;
    }
    setCallMode("outgoing");
    setStartVideo(true);
  }, [selectedUser, isConnected]);

  // ✅ Handle audio call
  const handleAudioCall = useCallback(() => {
    if (!selectedUser) {
      setError("Please select a user first");
      return;
    }
    if (!isConnected) {
      setError("Not connected to server");
      return;
    }
    // TODO: Implement audio call logic
    alert(`Initiating audio call with ${selectedUser.username}...`);
  }, [selectedUser, isConnected]);

  // ✅ Handle search
  const handleSearch = useCallback((query) => {
    setSearchTerm(query);
  }, []);

  // ✅ Close video call
  const closeVideoCall = useCallback(() => {
    if (socketRef.current?.connected && selectedUser?.id) {
      socketRef.current.emit("end-call", { to: selectedUser.id });
    }
    setStartVideo(false);
    setCallMode("outgoing");
    setIncomingOffer(null);
  }, [selectedUser]);

  const acceptIncomingCall = useCallback(() => {
    if (!incomingCall) return;
    setSelectedUser({
      id: incomingCall.fromUserId,
      username: incomingCall.fromUsername,
    });
    setIncomingOffer(incomingCall.offer || null);
    setIncomingCall(null);
    setCallMode("incoming");
    setStartVideo(true);
  }, [incomingCall]);

  const declineIncomingCall = useCallback(() => {
    if (socketRef.current?.connected && incomingCall?.fromUserId) {
      socketRef.current.emit("end-call", { to: incomingCall.fromUserId });
    }
    setIncomingCall(null);
  }, [incomingCall]);

  // ✅ Debug: Log current messages for selected user
  useEffect(() => {
    if (selectedUser) {
      console.log(
        "Current messages for",
        selectedUser.username,
        ":",
        privateMessages[selectedUser.id]?.length || 0,
        "messages",
      );
    }
  }, [selectedUser, privateMessages]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed md:relative z-30 md:z-auto h-full
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
          <Sidebar
            users={filteredUsers}
            selectedUser={selectedUser}
            setSelectedUser={(u) => { setSelectedUser(u); setSidebarOpen(false); }}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            user={user}
            isConnected={isConnected}
            onlineUsers={onlineUsers}
            privateMessages={privateMessages}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <ChatHeader
            selectedUser={selectedUser}
            handleLogout={handleLogout}
            isConnected={isConnected}
            onVideoCall={handleVideoCall}
            onAudioCall={handleAudioCall}
            onSearch={handleSearch}
            onMenuClick={() => setSidebarOpen(true)}
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
                <span>Connecting to server at {SOCKET_URL}...</span>
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
                  />
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

          {isLoading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                    />
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
              className="bg-gray-800/50 backdrop-blur-xl p-2 md:p-4 border-t border-gray-700"
            >
              <div className="flex gap-2 md:gap-3 items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder={
                    !isConnected
                      ? "Connecting..."
                      : `Message @${selectedUser.username}...`
                  }
                  className="flex-1 px-3 md:px-6 py-2 md:py-3 bg-gray-700/50 text-white border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 transition-all duration-300 text-sm md:text-base"
                  disabled={!isConnected}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  className="px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <span className="hidden sm:flex items-center gap-2">
                    Send
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </span>
                  <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Video Call Component */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 text-white shadow-2xl">
            <h3 className="mb-2 text-xl font-semibold">Incoming call</h3>
            <p className="mb-6 text-gray-300">
              {incomingCall.fromUsername} is calling...
            </p>
            <div className="flex gap-3">
              <button
                onClick={acceptIncomingCall}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={declineIncomingCall}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {startVideo && selectedUser && (
        <VideoCall
          start={startVideo}
          selectedUser={selectedUser}
          currentUser={user}
          socket={socketRef.current}
          initiateCall={callMode === "outgoing"}
          incomingOffer={incomingOffer}
          onError={(message) => setError(message)}
          isConnected={isConnected}
          onClose={closeVideoCall}
        />
      )}
    </>
  );
}

export default Chat;
