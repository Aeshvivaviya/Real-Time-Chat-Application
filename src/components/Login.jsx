import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://192.168.29.92:5000";

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedUsers, setSavedUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load all saved users from localStorage
  useEffect(() => {
    loadSavedUsers();
  }, []);

  const loadSavedUsers = () => {
    const savedUsersList = localStorage.getItem('chatUsers');
    console.log('Raw chatUsers from localStorage:', savedUsersList);
    
    let users = [];
    
    if (savedUsersList) {
      try {
        users = JSON.parse(savedUsersList);
        console.log('Parsed chatUsers:', users);
      } catch (error) {
        console.error('Error parsing users data:', error);
        localStorage.removeItem('chatUsers');
      }
    }
    
    const singleUser = localStorage.getItem('chatUser');
    console.log('Single chatUser from localStorage:', singleUser);
    
    if (singleUser) {
      try {
        const parsedSingle = JSON.parse(singleUser);
        const exists = users.some(u => u.username === parsedSingle.username);
        
        if (!exists) {
          console.log('Adding single user to array:', parsedSingle.username);
          users.push({
            id: parsedSingle.id || Date.now(),
            username: parsedSingle.username,
            lastLogin: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error parsing single user:', error);
      }
    }
    
    const uniqueUsers = users.filter((user, index, self) => 
      index === self.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase())
    );
    
    console.log('Final unique users:', uniqueUsers);
    setSavedUsers(uniqueUsers);
    
    if (uniqueUsers.length > 0) {
      localStorage.setItem('chatUsers', JSON.stringify(uniqueUsers));
    }
  };

  const saveUsersToStorage = (users) => {
    localStorage.setItem('chatUsers', JSON.stringify(users));
    setSavedUsers(users);
    console.log('Saved users to storage:', users);
  };

  const addUserToList = (userData) => {
    const exists = savedUsers.some(u => 
      u.username.toLowerCase() === userData.username.toLowerCase()
    );
    
    console.log('User exists check:', { username: userData.username, exists });
    
    if (!exists) {
      const updatedUsers = [...savedUsers, userData];
      saveUsersToStorage(updatedUsers);
      return true;
    }
    return false;
  };

  const removeUser = (userId, e) => {
    e.stopPropagation();
    const updatedUsers = savedUsers.filter(u => u.id !== userId);
    saveUsersToStorage(updatedUsers);
    
    if (updatedUsers.length === 0) {
      setShowDropdown(false);
    }
  };

  const handleLoginWithSaved = (user) => {
    console.log('Logging in with saved user:', user.username);
    const updatedUsers = savedUsers.map(u => 
      u.id === user.id 
        ? { ...u, lastLogin: new Date().toISOString() }
        : u
    );
    saveUsersToStorage(updatedUsers);
    
    localStorage.setItem('chatUser', JSON.stringify(user));
    setUser(user);
  };

  const handleClearAllUsers = () => {
    localStorage.removeItem('chatUsers');
    localStorage.removeItem('chatUser');
    setSavedUsers([]);
    setShowDropdown(false);
    setError('All users cleared!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegistering ? '/api/register' : '/api/login';
      const response = await axios.post(`${API_URL}${endpoint}`, {
        username: username.trim()
      });

      const userData = {
        id: response.data.id || Date.now(),
        username: response.data.username || username.trim(),
        lastLogin: new Date().toISOString()
      };

      const added = addUserToList(userData);
      console.log('User added to list:', added ? 'Yes' : 'No (already exists)');
      
      localStorage.setItem('chatUser', JSON.stringify(userData));
      
      console.log('New user saved:', userData.username);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        setError(error.response.data.message || 'Server error');
      } else if (error.request) {
        setError('Server se connect nahi ho paya');
      } else {
        setError('Kuch galat ho gaya');
      }
    } finally {
      setLoading(false);
    }
  };

  const debugLocalStorage = () => {
    console.log('--- DEBUG START ---');
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('chatUsers:', localStorage.getItem('chatUsers'));
    console.log('chatUser:', localStorage.getItem('chatUser'));
    console.log('--- DEBUG END ---');
    
    loadSavedUsers();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96 relative">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {isRegistering ? 'Register' : 'Login'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          onClick={debugLocalStorage}
          className="mb-2 text-xs text-gray-400 hover:text-gray-600"
        >
          🔍 Debug
        </button>

        {savedUsers.length > 0 && !isRegistering && (
          <div className="mb-4 relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-gray-700">Continue as...</span>
              </div>
              <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
                {savedUsers.length}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {savedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <button
                      onClick={() => handleLoginWithSaved(user)}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.username}</p>
                        <p className="text-xs text-gray-500">
                          Last login: {new Date(user.lastLogin || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </button>
                    
                    <button
                      onClick={(e) => removeUser(user.id, e)}
                      className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove user"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}

                {savedUsers.length > 1 && (
                  <button
                    onClick={handleClearAllUsers}
                    className="w-full p-3 text-sm text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 border-t"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All Users
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Or enter username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter username"
              required
              minLength="3"
              maxLength="20"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || username.length < 3}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          {isRegistering ? 'Already have account?' : "Don't have account?"}{' '}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setUsername('');
              setShowDropdown(false);
            }}
            className="text-blue-500 hover:underline"
          >
            {isRegistering ? 'Login' : 'Register'}
          </button>
        </p>

        {savedUsers.length > 0 && !isRegistering && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-400">
              {savedUsers.length} saved user{savedUsers.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Users: {savedUsers.map(u => u.username).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;