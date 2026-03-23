import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Chat from './components/Chat'; // ✅ Make sure this path is correct
import { generateToken } from "./utils/getToken";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateToken();
  }, []);

  useEffect(() => {
    // Check for saved user
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Saved user found:', parsedUser.username);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user:', error);
        localStorage.removeItem('chatUser');
      }
    }
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
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;