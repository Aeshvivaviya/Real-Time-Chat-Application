// firebase-messaging-sw.js

/* global firebase */

// Only importScripts allowed in service worker

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDL5aKqfy3kTb3lErzkCA2WEmupSspNVIU",
  authDomain: "real-time-chat-applicati-58e52.firebaseapp.com",
  projectId: "real-time-chat-applicati-58e52",
  storageBucket: "real-time-chat-applicati-58e52.appspot.com",
  messagingSenderId: "650486864472",
  appId: "1:650486864472:web:b423a644f0010d39bcc82d"
});

// Initialize Messaging
const messaging = firebase.messaging();

// Handle background message
messaging.onBackgroundMessage((payload) => {

  console.log("Background message received:", payload);

  const notificationTitle =
    payload.notification?.title || "New Message";

  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/favicon.svg"
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );

});