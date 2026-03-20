// 📁 public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

// 🔥 Firebase init
firebase.initializeApp({
  apiKey: "AIzaSyDL5aKqfy3kTb3lErzkCA2WEmupSspNVIU",
  authDomain: "real-time-chat-applicati-58e52.firebaseapp.com",
  projectId: "real-time-chat-applicati-58e52",
  storageBucket: "real-time-chat-applicati-58e52.firebasestorage.app",
  messagingSenderId: "650486864472",
  appId: "1:650486864472:web:b423a644f0010d39bcc82d"
});

// ✅ FIX: messaging safe way
const messaging = firebase.messaging();

// 🔔 Background message
messaging.onBackgroundMessage(function (payload) {
  console.log("📩 Background message:", payload);

  const title = payload?.notification?.title || "New Message";
  const options = {
    body: payload?.notification?.body || "You have a new message",
    icon: "/favicon.svg",
  };

  self.registration.showNotification(title, options);
});

// 🔥 Click event
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow("http://localhost:5173")
  );
});