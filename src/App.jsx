import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Chat from './components/chat';
import ChatApp from './components/chat/ChatApp';
import { generateToken } from "./utils/getToken";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    generateToken();
  }, []);


  useEffect(() => {
    // Check for saved user but DON'T auto-login
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Saved user found in App:', parsedUser.username);
        // Don't auto-login - user will click Continue button
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('chatUser');
      }
    }
    // 🔥 FIXED: setLoding -> setLoading
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Routes>
          <Route 
            path="/" 
            element={
              !user ? (
                <Login setUser={setUser} />
              ) : (
                <Navigate to="/chat" replace />
              )
            } 
          />
          
          <Route 
            path="/chat" 
            element={
              user ? (
                <Chat user={user} setUser={setUser} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />

          <Route 
            path="/chatapp" 
            element={
              user ? (
                <div className="container mx-auto py-4">
                  <div className="mb-4 px-4 flex justify-between items-center">
                    <button
                      onClick={() => window.location.href = '/chat'}
                      className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ← Back to Main Chat
                    </button>
                    <span className="text-white">
                      Logged in as: <strong>{user.username}</strong>
                    </span>
                    <button
                      onClick={() => {
                        localStorage.removeItem('chatUser');
                        setUser(null);
                      }}
                      className="text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                  <ChatApp />
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;