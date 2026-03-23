// 📁 src/firebase.js

import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDL5aKqfy3kTb3lErzkCA2WEmupSspNVIU",
  authDomain: "real-time-chat-applicati-58e52.firebaseapp.com",
  projectId: "real-time-chat-applicati-58e52",
  storageBucket: "real-time-chat-applicati-58e52.appspot.com",
  messagingSenderId: "650486864472",
  appId: "1:650486864472:web:b423a644f0010d39bcc82d"
};

const app = initializeApp(firebaseConfig);

// ✅ FIX: service worker register
export const getFirebaseMessaging = async () => {
  try {
    const supported = await isSupported();

    if (!supported) {
      console.log("❌ Messaging not supported");
      return null;
    }

    // ✅ Service worker register
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      console.log("✅ Service Worker Registered");
    }

    console.log("✅ Messaging supported");

    return getMessaging(app);

  } catch (error) {
    console.error("Firebase messaging error:", error);
    return null;
  }
};