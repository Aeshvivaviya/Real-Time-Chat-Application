// 📁 src/utils/getToken.js

import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "../firebase";

export const generateToken = async (currentUser) => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {

      // ✅ messaging async se lo
      const messaging = await getFirebaseMessaging();

      if (!messaging) {
        console.log("❌ Messaging not supported");
        return;
      }

      const token = await getToken(messaging, {
        vapidKey: "BLytr9s1a7sEtA9orJOlfI9jUp_tzMujOL9RmhsJ6eAvDPhlOGMV3HZhJrPeo9f8tGZzziNqd73kzO_YNWPDA"
      });

      console.log("🔥 FCM TOKEN:", token);

      // ✅ backend ko bhejo
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

      return token;

    } else {
      console.log("❌ Notification permission denied");
    }

  } catch (error) {
    console.error("Token error:", error);
  }
};