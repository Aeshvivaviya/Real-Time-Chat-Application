// 📁 src/components/Notification.jsx

import { useEffect } from "react";

export default function Notification({ notification, clearNotification, currentUserId }) {

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      clearNotification();
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification]);

  const handleClick = () => {
    window.location.href = `/chat?userId=${notification.userId}`;
    clearNotification();
  };

  // ❌ apna message hide
  if (!notification || notification.senderId === currentUserId) {
    return null;
  }

  return (
    <div
      onClick={handleClick}
      className="fixed top-5 right-5 bg-gray-900 text-white p-4 rounded-lg shadow-lg w-72 cursor-pointer"
    >
      <p className="font-bold text-blue-400">{notification.username}</p>
      <p className="text-sm">{notification.text}</p>
    </div>
  );
}