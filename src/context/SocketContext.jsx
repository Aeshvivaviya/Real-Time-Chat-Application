import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import Notification from "../components/Notification";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children, currentUser }) => {
  const socketRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const reconnectAttempts = useRef(0);
  const callListenersRef = useRef({});

  // 🔔 Browser permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("🔔 Notification permission:", permission);
      });
    }
  }, []);

  // 🔔 Show browser notification
  const showBrowserNotification = useCallback((title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        if (!document.hasFocus()) {
          new Notification(title, {
            body: body,
            icon: "/favicon.ico",
            badge: "/badge.png",
            tag: "chat-message",
            renotify: true,
          });
        }
      } catch (error) {
        console.error("❌ Browser notification error:", error);
      }
    }
  }, []);

  // Socket connection setup
  useEffect(() => {
    if (!currentUser?.id) {
      console.log("⏳ Waiting for currentUser...");
      return;
    }

    console.log("🔌 Connecting to socket server...");

    // ✅ Socket configuration
    const socket = io("https://chat-app-backend-h8lg.onrender.com", {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      forceNew: true,
      query: {
        userId: currentUser.id,
        username: currentUser.username,
      },
    });

    socketRef.current = socket;

    // ✅ Socket connection events
    socket.on("connect", () => {
      console.log("✅ Socket connected successfully:", socket.id);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;

      // Register user for chat
      socket.emit("register", currentUser.id, currentUser.username);
      
      // Register user for video call
      socket.emit("register-user", currentUser.id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      setIsConnected(false);
      setConnectionError(error.message);
      reconnectAttempts.current++;

      if (reconnectAttempts.current > 3) {
        console.log("⚠️ Switching to polling only mode");
        socket.io.opts.transports = ["polling"];
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);

      if (reason === "io server disconnect") {
        setTimeout(() => {
          socket.connect();
        }, 1000);
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
      setConnectionError(null);
      socket.emit("register", currentUser.id, currentUser.username);
      socket.emit("register-user", currentUser.id);
    });

    // ✅ Online users handler
    socket.on("onlineUsers", (users) => {
      console.log("👥 Online users:", users);
      if (Array.isArray(users)) {
        setOnlineUsers(users);
      }
    });

    // ✅ Message receive handler
    socket.on("private-message", (data) => {
      console.log("📩 Message received:", data);

      if (data.fromUserId !== currentUser.id) {
        setNotification({
          userId: data.fromUserId,
          username: data.fromUsername || "Unknown",
          text: data.text || "",
          senderId: data.fromUserId,
          timestamp: data.timestamp || new Date().toISOString(),
          messageType: data.type || "text",
        });

        if (data.fromUsername && data.text) {
          showBrowserNotification(
            data.fromUsername,
            data.text.length > 50 ? data.text.substring(0, 50) + "..." : data.text,
          );
        }
      }
    });

    // Alternative message event
    socket.on("privateMessage", (data) => {
      console.log("📩 Message received (alt):", data);
      
      if (data.fromUserId !== currentUser.id) {
        setNotification({
          userId: data.fromUserId,
          username: data.fromUsername || "Unknown",
          text: data.text || "",
          senderId: data.fromUserId,
          timestamp: data.timestamp || new Date().toISOString(),
          messageType: data.type || "text",
        });
      }
    });

    // ✅ Video/Audio Call Events
    socket.on("incoming-call", (data) => {
      console.log("📞 Incoming call:", data);
      setIncomingCall({
        from: data.from,
        fromUsername: data.fromUsername,
        offer: data.offer,
      });
      
      // Show notification for incoming call
      showBrowserNotification(
        "Incoming Call",
        `${data.fromUsername || "Someone"} is calling you...`
      );
    });

    socket.on("call-answered", (data) => {
      console.log("📞 Call answered:", data);
      if (callListenersRef.current.onCallAnswered) {
        callListenersRef.current.onCallAnswered(data.answer);
      }
    });

    socket.on("ice-candidate", (data) => {
      console.log("❄ ICE candidate received:", data);
      if (callListenersRef.current.onIceCandidate) {
        callListenersRef.current.onIceCandidate(data.candidate);
      }
    });

    socket.on("call-ended", (data) => {
      console.log("🔴 Call ended:", data);
      if (callListenersRef.current.onCallEnded) {
        callListenersRef.current.onCallEnded();
      }
      setIncomingCall(null);
    });

    socket.on("call-error", (data) => {
      console.error("❌ Call error:", data);
      setNotification({
        userId: null,
        username: "System",
        text: data.message || "Call failed",
        senderId: null,
        timestamp: new Date().toISOString(),
        messageType: "error",
      });
    });

    // ✅ Typing indicator
    socket.on("typing", ({ username, isTyping, fromUserId }) => {
      if (fromUserId !== currentUser.id) {
        if (callListenersRef.current.onTyping) {
          callListenersRef.current.onTyping(username, isTyping, fromUserId);
        }
      }
    });

    // ✅ Users list
    socket.on("users", (userList) => {
      console.log("📋 Users list:", userList);
      if (Array.isArray(userList)) {
        const filteredList = userList.filter(
          (u) => u.id !== currentUser.id
        );
        setOnlineUsers(filteredList);
      }
    });

    // ✅ Message sent confirmation
    socket.on("message-sent", (data) => {
      console.log("✅ Message sent confirmation:", data);
    });

    // ✅ Error handler
    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
      setNotification({
        userId: null,
        username: "System",
        text: error.message || "Connection error",
        senderId: null,
        timestamp: new Date().toISOString(),
        messageType: "error",
      });
    });

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up socket connection");
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [currentUser, showBrowserNotification]);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const clearIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  // ✅ Send message function
  const sendMessage = useCallback(
    (receiverId, text, type = "private") => {
      if (!socketRef.current?.connected) {
        console.error("❌ Socket not connected");
        return false;
      }

      if (!currentUser?.id || !receiverId || !text?.trim()) {
        console.error("❌ Missing required fields");
        return false;
      }

      const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      const messageData = {
        id: messageId,
        fromUserId: currentUser.id,
        fromUsername: currentUser.username,
        toUserId: receiverId,
        text: text.trim(),
        timestamp: timestamp,
        type: type,
      };

      console.log("📤 Sending message:", messageData);
      socketRef.current.emit("private-message", messageData);
      socketRef.current.emit("privateMessage", messageData);
      return true;
    },
    [currentUser],
  );

  // ✅ Send typing indicator
  const sendTyping = useCallback(
    (receiverId, isTyping) => {
      if (socketRef.current?.connected && receiverId) {
        socketRef.current.emit("typing", {
          username: currentUser?.username,
          isTyping,
          toUserId: receiverId,
        });
      }
    },
    [currentUser],
  );

  // ✅ Video/Audio Call Functions
  const makeCall = useCallback(
    (toUserId, offer, fromUsername) => {
      if (!socketRef.current?.connected) {
        console.error("❌ Socket not connected");
        return false;
      }

      console.log("📞 Making call to:", toUserId);
      socketRef.current.emit("call-user", {
        to: toUserId,
        from: currentUser.id,
        offer: offer,
        fromUsername: fromUsername || currentUser.username,
      });
      return true;
    },
    [currentUser],
  );

  const answerCall = useCallback(
    (toUserId, answer) => {
      if (!socketRef.current?.connected) {
        console.error("❌ Socket not connected");
        return false;
      }

      console.log("📞 Answering call to:", toUserId);
      socketRef.current.emit("answer-call", {
        to: toUserId,
        answer: answer,
      });
      return true;
    },
    [],
  );

  const sendIceCandidate = useCallback(
    (toUserId, candidate) => {
      if (!socketRef.current?.connected) {
        console.error("❌ Socket not connected");
        return false;
      }

      console.log("❄ Sending ICE candidate to:", toUserId);
      socketRef.current.emit("ice-candidate", {
        to: toUserId,
        candidate: candidate,
      });
      return true;
    },
    [],
  );

  const endCall = useCallback(
    (toUserId) => {
      if (!socketRef.current?.connected) {
        console.error("❌ Socket not connected");
        return false;
      }

      console.log("🔴 Ending call with:", toUserId);
      socketRef.current.emit("end-call", {
        to: toUserId,
      });
      setIncomingCall(null);
      return true;
    },
    [],
  );

  // Register call event listeners
  const registerCallListeners = useCallback((listeners) => {
    callListenersRef.current = { ...callListenersRef.current, ...listeners };
  }, []);

  const unregisterCallListeners = useCallback(() => {
    callListenersRef.current = {};
  }, []);

  const value = {
    isConnected,
    connectionError,
    onlineUsers,
    notification,
    incomingCall,
    sendMessage,
    sendTyping,
    clearNotification,
    clearIncomingCall,
    // Video/Audio Call functions
    makeCall,
    answerCall,
    sendIceCandidate,
    endCall,
    registerCallListeners,
    unregisterCallListeners,
    socket: socketRef.current,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
          ⚠️ Connection lost. Reconnecting...
        </div>
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white text-xl font-semibold mb-2">Incoming Call</h3>
            <p className="text-gray-300 mb-6">
              {incomingCall.fromUsername || "Someone"} is calling you...
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  // Handle accept call
                  clearIncomingCall();
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
              >
                Accept
              </button>
              <button
                onClick={clearIncomingCall}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && currentUser?.id && (
        <Notification
          notification={notification}
          clearNotification={clearNotification}
          currentUserId={currentUser.id}
        />
      )}
    </SocketContext.Provider>
  );
};