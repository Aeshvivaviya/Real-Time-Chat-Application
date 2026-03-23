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
  const reconnectAttempts = useRef(0);

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

  useEffect(() => {
    if (!currentUser?.id) {
      console.log("⏳ Waiting for currentUser...");
      return;
    }

    console.log("🔌 Connecting to socket server...");

    // ✅ FIX: Better socket configuration with polling first
    const socket = io("http://192.168.29.92:5000", {
      transports: ["polling", "websocket"], // Polling first, then upgrade to websocket
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

    // Socket connection events
    socket.on("connect", () => {
      console.log("✅ Socket connected successfully:", socket.id);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;

      // Register user after connection
      socket.emit("register_user", {
        userId: currentUser.id,
        username: currentUser.username,
      });
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      setIsConnected(false);
      setConnectionError(error.message);
      reconnectAttempts.current++;

      // ✅ FIX: Try with polling only if websocket fails
      if (reconnectAttempts.current > 3) {
        console.log("⚠️ Switching to polling only mode");
        socket.io.opts.transports = ["polling"];
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);

      // ✅ FIX: Handle specific disconnect reasons
      if (reason === "io server disconnect") {
        // Reconnect manually if server disconnected
        setTimeout(() => {
          socket.connect();
        }, 1000);
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
      setConnectionError(null);

      // Re-register user after reconnection
      socket.emit("register_user", {
        userId: currentUser.id,
        username: currentUser.username,
      });
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log("🔄 Reconnection attempt:", attempt);
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error);
    });

    socket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after all attempts");
      setConnectionError("Failed to connect to server");
    });

    // Message receive handler
    socket.on("receive_message", (data) => {
      console.log("📩 Message received:", data);

      if (data.senderId !== currentUser.id) {
        setNotification({
          userId: data.senderId,
          username: data.senderName || "Unknown",
          text: data.message || "",
          senderId: data.senderId,
          timestamp: data.timestamp || new Date().toISOString(),
          messageType: data.messageType || "text",
        });

        if (data.senderName && data.message) {
          showBrowserNotification(
            data.senderName,
            data.message.length > 50
              ? data.message.substring(0, 50) + "..."
              : data.message,
          );
        }
      }
    });

    // Online users handler
    socket.on("online_users", (users) => {
      console.log("👥 Online users:", users);
      if (Array.isArray(users)) {
        setOnlineUsers(users);
      }
    });

    // Error handler
    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
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

  // Send message function
  const sendMessage = useCallback(
    (receiverId, message, messageType = "text") => {
      if (!socketRef.current?.connected) {
        console.error("❌ Socket not connected");
        return false;
      }

      if (!currentUser?.id || !receiverId || !message?.trim()) {
        console.error("❌ Missing required fields");
        return false;
      }

      const messageData = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        senderName: currentUser.username || currentUser.name,
        receiverId,
        message: message.trim(),
        messageType,
        timestamp: new Date().toISOString(),
      };

      console.log("📤 Sending message:", messageData);
      socketRef.current.emit("send_message", messageData);
      return true;
    },
    [currentUser],
  );

  // Alternative connection method with retry logic
  const connectWithRetry = useCallback(() => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 5;

      const attempt = () => {
        attempts++;
        console.log(`📡 Connection attempt ${attempts}/${maxAttempts}`);

        const socket = io("http://192.168.29.92:5000", {
          transports: ["polling"], // Start with polling
          reconnection: false, // We'll handle reconnection manually
          timeout: 10000,
          query: {
            userId: currentUser.id,
            username: currentUser.username,
          },
        });

        socket.on("connect", () => {
          console.log("✅ Connected via polling");
          // Upgrade to websocket after connection
          socket.io.opts.transports = ["polling", "websocket"];
          resolve(socket);
        });

        socket.on("connect_error", () => {
          socket.close();
          if (attempts < maxAttempts) {
            setTimeout(attempt, 2000 * attempts); // Exponential backoff
          } else {
            reject(new Error("Failed to connect after multiple attempts"));
          }
        });
      };

      attempt();
    });
  }, [currentUser]);

  // Use it in useEffect
  useEffect(() => {
    if (!currentUser?.id) return;

    connectWithRetry()
      .then((socket) => {
        socketRef.current = socket;
        setIsConnected(true);
        // Rest of your setup...
      })
      .catch((error) => {
        console.error("❌ All connection attempts failed:", error);
        setConnectionError("Failed to connect to server");
      });
  }, [currentUser]);

  // Send typing indicator
  const sendTyping = useCallback(
    (receiverId, isTyping) => {
      if (socketRef.current?.connected && receiverId) {
        socketRef.current.emit("typing", {
          senderId: currentUser?.id,
          receiverId,
          isTyping,
        });
      }
    },
    [currentUser],
  );

  const value = {
    isConnected,
    connectionError,
    onlineUsers,
    notification,
    sendMessage,
    sendTyping,
    clearNotification,
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
