// firebase-messaging-sw.js

// ⚠️ Only importScripts allowed

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDL5aKqfy3kTb3lErzkCA2WEmupSspNVIU",
  authDomain: "real-time-chat-applicati-58e52.firebaseapp.com",
  projectId: "real-time-chat-applicati-58e52",
  storageBucket: "real-time-chat-applicati-58e52.appspot.com",
  messagingSenderId: "650486864472",
  appId: "1:650486864472:web:b423a644f0010d39bcc82d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("Background message:", payload);

  self.registration.showNotification(
    payload.notification?.title || "New Message",
    {
      body: payload.notification?.body || "",
      icon: "/favicon.svg"
    }
  );
});