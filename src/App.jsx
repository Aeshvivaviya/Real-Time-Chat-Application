import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Chat from './components/chat/Chat';
import ZoomVerify from './components/chat/ZoomVerify';
import SignupPage from './components/chat/SignupPage';
import EmailVerify from './components/chat/EmailVerify';
import CreateAccount from './components/chat/CreateAccount';
import OneMoreThing from './components/chat/OneMoreThing';
import LinkAccount from './components/chat/LinkAccount';
import Dashboard from './pages/Dashboard';
import NewMeetingPage from './pages/NewMeetingPage';
import VideoPreview from './components/child/VideoPreview';
import MeetingRoom from './components/child/MeetingRoom';
import { generateToken } from "./utils/getToken";

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Optional auto-login (only when "Remember me" is enabled)
  useEffect(() => {
    // Pre-warm backend on app load to prevent Render sleep delay
    fetch(`${import.meta.env.VITE_API_URL}/api/health`).catch(() => {});
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("chatUser");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem("chatUser");
      }
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
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <ZoomVerify />} />

          {/* Signup Route */}
          <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />

          {/* Email Verify Route */}
          <Route path="/verify-email" element={<EmailVerify />} />

          {/* Create Account Route */}
          <Route path="/create-account" element={<CreateAccount />} />

          {/* One More Thing Route */}
          <Route path="/one-more-thing" element={<OneMoreThing />} />

          {/* Link Account Route */}
          <Route path="/link-account" element={<LinkAccount />} />

          {/* Dashboard Route */}
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" replace />} />

          {/* Login Route */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />}
          />

          {/* Chat Route */}
          <Route
            path="/chat"
            element={user ? <Chat user={user} setUser={setUser} /> : <Navigate to="/login" replace />}
          />

          {/* New Meeting Route */}
          <Route path="/new-meeting" element={<NewMeetingPage />} />

          {/* Video Preview Route */}
          <Route path="/meeting/:meetingId" element={<VideoPreview />} />

          {/* Meeting Room Route */}
          <Route path="/meeting/:meetingId/room" element={<MeetingRoom />} />

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>

      </div>

    </Router>

  );

}

export default App;