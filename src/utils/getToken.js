// 📁 src/utils/getToken.js

import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "../firebase";

export const generateToken = async (currentUser) => {
  try {
    // 🔔 Permission request
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return null;
    }

    // ✅ messaging load karo
    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      console.log("❌ Messaging not supported");
      return null;
    }

    // 🔥 SAFE token generation
    let token = null;

    try {
      token = await getToken(messaging, {
        vapidKey:
          "BLytr9s1a7a7sEtA9orJOlfI9jUp_tzMuj0L9RmhsJ6eAvDPhl0GMV3HZhJrPeq9f8tGZ2ziNqd73kZ0_YNWPDA",
      });

      console.log("🔥 FCM TOKEN:", token);

    } catch (tokenError) {
      console.error("❌ Token generation failed:", tokenError);
      return null;
    }

    // ✅ Agar token mila to backend ko bhejo
    if (token && currentUser) {
      try {
        await fetch(
          "https://chat-app-backend-h8lg.onrender.com/save-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: currentUser.id,
              token: token,
            }),
          }
        );

        console.log("✅ Token saved to backend");

      } catch (apiError) {
        console.error("❌ Backend token save error:", apiError);
      }
    }

    return token;

  } catch (error) {
    console.error("❌ Token error:", error);
    return null;
  }
};