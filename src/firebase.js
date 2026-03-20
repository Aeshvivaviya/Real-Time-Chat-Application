// 📁 src/firebase.js

import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDL5aKqfy3kTb3lErzkCA2WEmupSspNVIU",
  authDomain: "real-time-chat-applicati-58e52.firebaseapp.com",
  projectId: "real-time-chat-applicati-58e52",
  storageBucket: "real-time-chat-applicati-58e52.firebasestorage.app",
  messagingSenderId: "650486864472",
  appId: "1:650486864472:web:b423a644f0010d39bcc82d"
};

const app = initializeApp(firebaseConfig);

// ✅ FIX: async function
export const getFirebaseMessaging = async () => {
  const supported = await isSupported();

  if (supported) {
    console.log("✅ Messaging supported");
    return getMessaging(app);
  } else {
    console.log("❌ Messaging not supported");
    return null;
  }
};