import { useEffect } from "react";

export default function Notification({ notification, clearNotification }) {
  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      clearNotification();
    }, 10000);

    return () => clearTimeout(timer);
  }, [notification, clearNotification]);

  const handleClick = () => {
    if (notification?.userId) {
      window.location.href = `/chat?userId=${notification.userId}`;
    } else {
      window.location.href = "/chat";
    }
    clearNotification();
  };

  if (!notification) return null;

  return (
    <div 
      onClick={handleClick}
      className="fixed top-5 right-5 bg-gray-900 text-white p-4 rounded-lg shadow-lg w-72 animate-slide-in z-50 cursor-pointer hover:bg-gray-800 transition-colors"
    >
      <p className="font-bold text-blue-400">
        {notification.username}
      </p>
      <p className="text-sm">{notification.text}</p>
    </div>
  );
}