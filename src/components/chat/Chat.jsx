import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import PrivateChat from "./PrivateChat";
import MessageInput from "./MessageInput";
import SharedPanel from "./SharedPanel";
import Notification from "./Notification";
import VideoCall from "./VideoCall";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

function Chat({ user }) {
  const dedupeMessages = useCallback((messages = []) => {
    const map = new Map();
    for (const msg of messages) {
      if (!msg) continue;
      const key = msg.id || `${msg.fromUserId}-${msg.toUserId}-${msg.timestamp}-${msg.text}`;
      if (!map.has(key)) map.set(key, msg);
    }
    return Array.from(map.values());
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sharedOpen, setSharedOpen] = useState(false);

  const socketRef = useRef(null);
  const selectedUserRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const initialLoadDone = useRef(false);
  const reconnectAttempts = useRef(0);

  const formatTime = useCallback((timestamp) => {
    try {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  }, []);

  // Load saved data
  useEffect(() => {
    if (user?.id && !initialLoadDone.current) {
      initialLoadDone.current = true;
      try {
        const savedMessages = localStorage.getItem(`chat_messages_${user.id}`);
        if (savedMessages) setPrivateMessages(JSON.parse(savedMessages));
        const savedUsers = localStorage.getItem(`all_users_${user.id}`);
        if (savedUsers) {
          setUsers(JSON.parse(savedUsers).filter(u =>
            u.username !== "System" && u.username !== "system" && u.id !== "system" && u.id !== user.id
          ));
        }
        const savedSelected = localStorage.getItem(`selected_user_${user.id}`);
        if (savedSelected) {
          const p = JSON.parse(savedSelected);
          if (p.username !== "System" && p.username !== "system" && p.id !== "system") setSelectedUser(p);
        }
      } catch (e) { console.error(e); }
    }
  }, [user]);

  useEffect(() => {
    if (user?.id && Object.keys(privateMessages).length > 0) {
      try { localStorage.setItem(`chat_messages_${user.id}`, JSON.stringify(privateMessages)); } catch (e) { console.error(e); }
    }
  }, [privateMessages, user]);

  useEffect(() => {
    if (user?.id && users.length > 0) {
      try { localStorage.setItem(`all_users_${user.id}`, JSON.stringify(users)); } catch (e) { console.error(e); }
    }
  }, [users, user]);

  useEffect(() => {
    if (user?.id && selectedUser) {
      try { localStorage.setItem(`selected_user_${user.id}`, JSON.stringify(selectedUser)); } catch (e) { console.error(e); }
    }
  }, [selectedUser, user]);

  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

  const loadPrivateChatHistory = useCallback(async (otherUserId) => {
    if (!user?.id || !otherUserId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/private-messages`, {
        params: { userId: user.id, otherUserId },
        timeout: 15000,
      });
      const messages = response.data?.messages || response.data || [];
      setPrivateMessages(prev => ({
        ...prev,
        [otherUserId]: dedupeMessages(Array.isArray(messages) ? messages : []),
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to load message history");
    } finally {
      setIsLoading(false);
    }
  }, [user, dedupeMessages]);

  const handleIncomingMessage = useCallback((message) => {
    if (!message || !user?.id) return;
    if (message.toUserId === user.id || message.fromUserId === user.id) {
      setPrivateMessages(prev => {
        const otherId = message.fromUserId === user.id ? message.toUserId : message.fromUserId;
        const existing = prev[otherId] || [];
        if (existing.some(m => m.id === message.id)) return prev;
        return { ...prev, [otherId]: [...existing, message] };
      });
      const active = selectedUserRef.current;
      if (message.fromUserId !== user.id && (!active || active.id !== message.fromUserId)) {
        setNotification({ message: `New message from ${message.fromUsername || "Unknown"}`, type: "info" });
        setTimeout(() => setNotification(null), 3000);
      }
      if (active && (active.id === message.fromUserId || active.id === message.toUserId)) {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [user]);

  // Socket setup
  useEffect(() => {
    if (!user?.id) return;
    if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }

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
      setIsConnected(true); setError(""); reconnectAttempts.current = 0;
      socket.emit("register", user.id, user.username);
    });
    socket.on("connect_error", () => {
      reconnectAttempts.current += 1;
      if (reconnectAttempts.current >= 3) setError(`Cannot connect to server.`);
      setIsConnected(false);
    });
    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      if (reason === "io server disconnect") socket.connect();
    });
    socket.on("onlineUsers", (list) => setOnlineUsers(list || []));
    socket.on("incoming-call", (data) => {
      setIncomingCall(prev => prev ? prev : { fromUserId: data.from, fromUsername: data.fromUsername || "Unknown", offer: data.offer || null });
    });
    socket.on("call-ended", () => { setStartVideo(false); setCallMode("outgoing"); setIncomingCall(null); setIncomingOffer(null); });
    socket.on("private-message", handleIncomingMessage);
    socket.on("typing", ({ username, isTyping, fromUserId }) => {
      if (selectedUserRef.current?.id === fromUserId) {
        setTypingUsers(prev => {
          const s = new Set(prev);
          isTyping ? s.add(username) : s.delete(username);
          return s;
        });
      }
    });
    socket.on("users", (list) => {
      if (Array.isArray(list)) {
        setUsers(list.filter(u => u?.username !== "System" && u?.username !== "system" && u?.id !== "system" && u?.id !== user.id));
      }
    });
    socket.emit("getUsers");

    return () => {
      ["connect","connect_error","disconnect","onlineUsers","incoming-call","call-ended","private-message","typing","users"]
        .forEach(e => socket.off(e));
    };
  }, [user, handleIncomingMessage]);

  useEffect(() => {
    if (selectedUser?.id && isConnected) loadPrivateChatHistory(selectedUser.id);
  }, [selectedUser, loadPrivateChatHistory, isConnected]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || !socketRef.current?.connected || !selectedUser) return;

    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${user.id}`;
    const timestamp = new Date().toISOString();
    const messageData = {
      id: messageId, fromUserId: user.id, fromUsername: user.username,
      toUserId: selectedUser.id, toUsername: selectedUser.username,
      text: text.trim(), timestamp, type: "private",
    };

    setPrivateMessages(prev => {
      const existing = prev[selectedUser.id] || [];
      if (existing.some(m => m.id === messageId)) return prev;
      return { ...prev, [selectedUser.id]: [...existing, messageData] };
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      socketRef.current.emit("private-message", messageData);
      socketRef.current.emit("typing", { username: user.username, isTyping: false, toUserId: selectedUser.id });
    } catch (err) {
      console.error(err);
      setError("Failed to send message");
      setPrivateMessages(prev => ({
        ...prev,
        [selectedUser.id]: (prev[selectedUser.id] || []).filter(m => m.id !== messageId),
      }));
    }
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [selectedUser, user]);

  const handleTyping = useCallback((value) => {
    setNewMessage(value);
    if (!socketRef.current?.connected || !selectedUser) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current.emit("typing", { username: user.username, isTyping: value.length > 0, toUserId: selectedUser.id });
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("typing", { username: user.username, isTyping: false, toUserId: selectedUser.id });
      }
    }, 2000);
  }, [selectedUser, user]);

  const handleLogout = useCallback(() => {
    socketRef.current?.disconnect();
    if (user?.id) {
      localStorage.removeItem(`chat_messages_${user.id}`);
      localStorage.removeItem(`all_users_${user.id}`);
      localStorage.removeItem(`selected_user_${user.id}`);
    }
    setSelectedUser(null); setPrivateMessages({}); setIsConnected(false);
    setStartVideo(false); setUsers([]); setOnlineUsers([]);
    window.location.href = "/";
  }, [user]);

  const filteredUsers = useMemo(() =>
    users.filter(u => u.id !== user?.id && u.username?.toLowerCase().includes(searchTerm.toLowerCase())),
    [users, searchTerm, user]
  );

  const handleVideoCall = useCallback(() => {
    if (!selectedUser || !isConnected) return;
    setCallMode("outgoing"); setStartVideo(true);
  }, [selectedUser, isConnected]);

  const closeVideoCall = useCallback(() => {
    if (socketRef.current?.connected && selectedUser?.id) socketRef.current.emit("end-call", { to: selectedUser.id });
    setStartVideo(false); setCallMode("outgoing"); setIncomingOffer(null);
  }, [selectedUser]);

  const acceptIncomingCall = useCallback(() => {
    if (!incomingCall) return;
    setSelectedUser({ id: incomingCall.fromUserId, username: incomingCall.fromUsername });
    setIncomingOffer(incomingCall.offer || null);
    setIncomingCall(null); setCallMode("incoming"); setStartVideo(true);
  }, [incomingCall]);

  const declineIncomingCall = useCallback(() => {
    if (socketRef.current?.connected && incomingCall?.fromUserId) socketRef.current.emit("end-call", { to: incomingCall.fromUserId });
    setIncomingCall(null);
  }, [incomingCall]);

  return (
    <>
      {/* Full screen blue gradient background */}
      <div className="h-screen w-screen bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        <div className="w-full h-full max-w-[1400px] max-h-[900px] bg-white rounded-2xl shadow-2xl flex overflow-hidden relative">

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* LEFT SIDEBAR */}
          <div className={`
            fixed lg:relative z-30 lg:z-auto h-full
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            w-[280px] shrink-0
          `}>
            <ChatSidebar
              users={filteredUsers}
              selectedUser={selectedUser}
              setSelectedUser={(u) => { setSelectedUser(u); setSidebarOpen(false); }}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              user={user}
              onlineUsers={onlineUsers}
              privateMessages={privateMessages}
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </div>

          {/* CENTER CHAT */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            <ChatHeader
              selectedUser={selectedUser}
              isConnected={isConnected}
              onVideoCall={handleVideoCall}
              onMenuClick={() => setSidebarOpen(true)}
              onSharedClick={() => setSharedOpen(p => !p)}
            />

            {notification && (
              <div className="mx-4 mt-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 flex justify-between items-center">
                <span>{notification.message}</span>
                <button onClick={() => setNotification(null)} className="text-blue-400 hover:text-blue-600 ml-2">✕</button>
              </div>
            )}

            {!isConnected && (
              <div className="mx-4 mt-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <span>Connecting to server...</span>
                </div>
                <button onClick={() => window.location.reload()} className="text-xs bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-lg transition-colors">Retry</button>
              </div>
            )}

            {error && (
              <div className="mx-4 mt-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex justify-between items-center">
                <span>{error}</span>
                <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 ml-2">✕</button>
              </div>
            )}

            {!selectedUser ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-700 text-lg font-semibold mb-1">Select a conversation</h3>
                  <p className="text-gray-400 text-sm">{filteredUsers.length} users available</p>
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
                isLoading={isLoading}
              />
            )}

            {selectedUser && (
              <MessageInput
                newMessage={newMessage}
                onTyping={handleTyping}
                onSend={sendMessage}
                isConnected={isConnected}
                selectedUser={selectedUser}
              />
            )}
          </div>

          {/* RIGHT SHARED PANEL — desktop always visible */}
          <div className="hidden xl:flex w-[300px] shrink-0 border-l border-gray-100">
            <SharedPanel users={filteredUsers} onlineUsers={onlineUsers} currentUser={user} />
          </div>

          {/* RIGHT SHARED PANEL — tablet/mobile overlay */}
          {sharedOpen && (
            <>
              <div className="fixed inset-0 bg-black/30 z-20 xl:hidden" onClick={() => setSharedOpen(false)} />
              <div className="fixed right-0 top-0 h-full w-[300px] z-30 xl:hidden shadow-2xl">
                <SharedPanel users={filteredUsers} onlineUsers={onlineUsers} currentUser={user} onClose={() => setSharedOpen(false)} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Incoming call modal */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-bold text-gray-900 mb-1">Incoming Call</h3>
            <p className="text-center text-gray-500 mb-5">{incomingCall.fromUsername} is calling...</p>
            <div className="flex gap-3">
              <button onClick={acceptIncomingCall} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors">Accept</button>
              <button onClick={declineIncomingCall} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors">Decline</button>
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
          onError={(msg) => setError(msg)}
          isConnected={isConnected}
          onClose={closeVideoCall}
        />
      )}
    </>
  );
}

export default Chat;
