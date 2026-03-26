import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Chat from './components/chat/Chat';
import ZoomVerify from './pages/ZoomVerify';
import SignupPage from './components/chat/SignupPage';
import { generateToken } from "./utils/getToken";

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Optional auto-login (only when "Remember me" is enabled)
  useEffect(() => {
    const shouldRemember = localStorage.getItem("chatRememberMe") === "true";
    const savedUser = localStorage.getItem("chatUser");

    if (shouldRemember && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("chatUser");
      }
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  // ✅ FIXED: Generate token only after user login
  useEffect(() => {

    if (user) {

      generateToken(user);

    }

  }, [user]);

  // Loading screen
  if (loading) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">
          Loading...
        </div>
      </div>
    );

  }

  return (

    <Router>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">

        <Routes>

          {/* Verify Age - Entry point */}
          <Route path="/" element={<ZoomVerify />} />

          {/* Signup Route */}
          <Route path="/signup" element={<SignupPage />} />

          {/* Login Route */}
          <Route
            path="/login"
            element={
              user
                ? <Navigate to="/chat" replace />
                : <Login setUser={setUser} />
            }
          />

          {/* Chat Route */}
          <Route
            path="/chat"
            element={
              user
                ? <Chat user={user} setUser={setUser} />
                : <Navigate to="/login" replace />
            }
          />

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </div>

    </Router>

  );

}

export default App;