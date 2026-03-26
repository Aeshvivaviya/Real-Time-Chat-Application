// 📁 src/utils/getToken.js

import { getToken } from "firebase/messaging";
import { getFirebaseMessaging } from "../firebase";

const API_URL =
  import.meta.env.VITE_API_URL || "https://localhost:5000";

export const generateToken = async (currentUser) => {
  try {
    // 🔔 Ask notification permission
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return null;
    }

    // ✅ Load Firebase messaging
    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      console.log("❌ Messaging not supported");
      return null;
    }

    let token = null;

    try {
      // 🔥 Generate FCM token
      token = await getToken(messaging, {
        vapidKey:
          "BLytr9s1a7a7sEtA9orJOlfI9jUp_tzMuj0L9RmhsJ6eAvDPhl0GMV3HZhJrPeq9f8tGZ2ziNqd73kZ0_YNWPDA",
      });

      console.log("🔥 FCM TOKEN:", token);
    } catch (tokenError) {
      console.warn(
        "⚠ Firebase token generation skipped (SSL issue likely):",
        tokenError.message
      );

      // ⚠ Continue app even if Firebase fails
      return null;
    }

    // ✅ Send token to backend
    if (token && currentUser?.id) {
      try {
        await fetch(`${API_URL}/api/save-fcm-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.id,
            token: token,
          }),
        });

        console.log("✅ Token saved to backend");
      } catch (apiError) {
        console.warn(
          "⚠ Backend token save skipped:",
          apiError.message
        );
      }
    }

    return token;
  } catch (error) {
    console.warn(
      "⚠ Firebase completely skipped:",
      error.message
    );

    return null;
  }
};