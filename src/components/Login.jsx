import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

// Environment variables with proper validation
const API_URL = import.meta.env.VITE_API_URL;

// Constants
const STORAGE_KEYS = {
  USERS: "chat_app_users",
  CURRENT_USER: "chat_app_current_user",
  REMEMBER_ME: "chat_app_remember_me",
};

const USERNAME_CONFIG = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  PATTERN: /^[a-zA-Z0-9_]+$/,
};

// Create axios instance with better timeout and error handling
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Add request interceptor for logging (only in development)
if (process.env.NODE_ENV === "development") {
  api.interceptors.request.use((request) => {
    console.log("🌐 API Request:", request.method.toUpperCase(), request.url);
    return request;
  });

  api.interceptors.response.use(
    (response) => {
      console.log("✅ API Response:", response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error("❌ API Error:", error.message);
      return Promise.reject(error);
    },
  );
}

function Login({ setUser, onLoginSuccess }) {
  // State
  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedUsers, setSavedUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [serverStatus, setServerStatus] = useState(null); // 'connected', 'error', 'checking'

  // Refs
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const checkServerTimeoutRef = useRef(null);

  // Check server connection on mount
  useEffect(() => {
    checkServerConnection();

    // Load saved users
    loadSavedUsers();
    loadRememberMePreference();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (checkServerTimeoutRef.current) {
        clearTimeout(checkServerTimeoutRef.current);
      }
    };
  }, []);

  // Save remember me preference when changed
  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    }
  }, [rememberMe]);

  const checkServerConnection = async () => {
    setServerStatus("checking");
    try {
      // Try to connect to health endpoint
      const response = await api.get("/api/health", { timeout: 5000 });
      if (response.data && response.data.status === "ok") {
        console.log("✅ Server connected:", API_URL);
        setServerStatus("connected");
        setError(""); // Clear any previous connection errors
      } else {
        throw new Error("Server not ready");
      }
    } catch (error) {
      console.error("❌ Server connection failed:", error.message);
      setServerStatus("error");
      setError(
        `Cannot connect to server at ${API_URL}. Please check if backend is running.`,
      );
    }
  };

  const loadRememberMePreference = () => {
    const savedPreference = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
    if (savedPreference === "true") {
      setRememberMe(true);
    }
  };

  const loadSavedUsers = useCallback(() => {
    try {
      const savedUsersList = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsersList) {
        const users = JSON.parse(savedUsersList);
        // Validate user data structure
        const validUsers = users.filter(
          (user) =>
            user &&
            typeof user === "object" &&
            user.id &&
            typeof user.id === "string" &&
            user.username &&
            typeof user.username === "string",
        );
        setSavedUsers(validUsers);
      }
    } catch (error) {
      console.error("Error loading saved users:", error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEYS.USERS);
      setSavedUsers([]);
    }
  }, []);

  const saveUsersToStorage = useCallback((users) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      setSavedUsers(users);
    } catch (error) {
      console.error("Error saving users to storage:", error);
      setError("Failed to save user data. Storage might be full.");
    }
  }, []);

  const validateUsername = (value) => {
    const trimmed = value.trim();

    if (!trimmed) {
      setUsernameError("Username is required");
      return false;
    }

    if (trimmed.length < USERNAME_CONFIG.MIN_LENGTH) {
      setUsernameError(
        `Username must be at least ${USERNAME_CONFIG.MIN_LENGTH} characters`,
      );
      return false;
    }

    if (trimmed.length > USERNAME_CONFIG.MAX_LENGTH) {
      setUsernameError(
        `Username cannot exceed ${USERNAME_CONFIG.MAX_LENGTH} characters`,
      );
      return false;
    }

    if (!USERNAME_CONFIG.PATTERN.test(trimmed)) {
      setUsernameError(
        "Username can only contain letters, numbers, and underscores",
      );
      return false;
    }

    setUsernameError("");
    return true;
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (value) {
      validateUsername(value);
    } else {
      setUsernameError("");
    }
  };

  const addUserToList = useCallback(
    (userData) => {
      const exists = savedUsers.some(
        (u) => u.username.toLowerCase() === userData.username.toLowerCase(),
      );

      if (!exists) {
        const updatedUsers = [...savedUsers, userData];
        saveUsersToStorage(updatedUsers);
        return true;
      }
      return false;
    },
    [savedUsers, saveUsersToStorage],
  );

  const updateUserLastLogin = useCallback(
    (userId) => {
      const updatedUsers = savedUsers.map((u) =>
        u.id === userId ? { ...u, lastLogin: new Date().toISOString() } : u,
      );
      saveUsersToStorage(updatedUsers);
    },
    [savedUsers, saveUsersToStorage],
  );

  const removeUser = useCallback(
    (userId, e) => {
      e.stopPropagation();
      const updatedUsers = savedUsers.filter((u) => u.id !== userId);
      saveUsersToStorage(updatedUsers);

      if (updatedUsers.length === 0) {
        setShowDropdown(false);
      }
    },
    [savedUsers, saveUsersToStorage],
  );

  const handleLoginWithSaved = useCallback(
    async (user) => {
      try {
        setLoading(true);
        setError("");

        // Check server connection first
        if (serverStatus !== "connected") {
          await checkServerConnection();
          if (serverStatus !== "connected") {
            throw new Error("Server is not available");
          }
        }

        // Update last login
        updateUserLastLogin(user.id);

        // Store current user
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

        // Call parent callback
        if (setUser) setUser(user);
        if (onLoginSuccess) onLoginSuccess(user);
      } catch (error) {
        console.error("Error logging in with saved user:", error);
        setError("Failed to login. Please check server connection.");
      } finally {
        setLoading(false);
      }
    },
    [updateUserLastLogin, setUser, onLoginSuccess, serverStatus],
  );

  const handleClearAllUsers = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all saved users?")) {
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      setSavedUsers([]);
      setShowDropdown(false);
      setError("All users cleared successfully!");
      setTimeout(() => setError(""), 3000);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Validate username
      if (!validateUsername(username)) {
        return;
      }

      setError("");
      setLoading(true);

      const trimmedUsername = username.trim();
      const endpoint = isRegistering ? "/api/register" : "/api/login";

      try {
        // Check server connection first
        if (serverStatus !== "connected") {
          await checkServerConnection();
          if (serverStatus !== "connected") {
            throw new Error(
              "Server is not available. Please check if backend is running.",
            );
          }
        }

        console.log(`📡 Sending request to: ${API_URL}${endpoint}`);

        const response = await api.post(endpoint, {
          username: trimmedUsername,
        });

        console.log("📥 Server response:", response.data);

        if (!response.data || !response.data.success) {
          throw new Error(response.data?.message || "Server error");
        }

        // Extract user data from response
        let userData;
        if (response.data.user) {
          userData = {
            id: response.data.user.id,
            username: response.data.user.username,
            lastLogin: new Date().toISOString(),
          };
        } else if (response.data.id) {
          userData = {
            id: response.data.id,
            username: response.data.username,
            lastLogin: new Date().toISOString(),
          };
        } else {
          throw new Error("Invalid response format from server");
        }

        // Add to saved users list
        addUserToList(userData);

        // Store current user if remember me is checked
        if (rememberMe) {
          localStorage.setItem(
            STORAGE_KEYS.CURRENT_USER,
            JSON.stringify(userData),
          );
        } else {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }

        // Call parent callback
        if (setUser) setUser(userData);
        if (onLoginSuccess) onLoginSuccess(userData);

        // Reset form
        setUsername("");
      } catch (error) {
        console.error("❌ Login/Register error:", error);

        let errorMessage = "";
        if (error.code === "ECONNABORTED") {
          errorMessage =
            "Request timeout. Server is taking too long to respond.";
        } else if (error.message === "Network Error") {
          errorMessage = `Cannot connect to server at ${API_URL}. Please check:\n• Backend server is running\n• Firewall is not blocking the connection\n• The URL is correct\n• You're on the same network`;
        } else if (error.response) {
          // Server responded with error
          errorMessage =
            error.response.data?.message ||
            `Server error: ${error.response.status}`;
        } else if (error.request) {
          // Request was made but no response
          errorMessage = `No response from server. Please ensure backend is running at ${API_URL}`;
        } else {
          // Something else happened
          errorMessage =
            error.message || "An unexpected error occurred. Please try again.";
        }

        setError(errorMessage);

        // Update server status
        if (
          error.message === "Network Error" ||
          error.code === "ECONNABORTED"
        ) {
          setServerStatus("error");
        }
      } finally {
        setLoading(false);
      }
    },
    [
      username,
      isRegistering,
      rememberMe,
      addUserToList,
      setUser,
      onLoginSuccess,
      serverStatus,
    ],
  );

  // Debug function (only in development)
  const debugLocalStorage = useCallback(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("--- DEBUG START ---");
      console.log("API_URL:", API_URL);
      console.log("Server Status:", serverStatus);
      console.log("All localStorage keys:", Object.keys(localStorage));
      console.log("Users:", localStorage.getItem(STORAGE_KEYS.USERS));
      console.log(
        "Current User:",
        localStorage.getItem(STORAGE_KEYS.CURRENT_USER),
      );
      console.log(
        "Remember Me:",
        localStorage.getItem(STORAGE_KEYS.REMEMBER_ME),
      );
      console.log("--- DEBUG END ---");

      loadSavedUsers();
      checkServerConnection();
    }
  }, [loadSavedUsers, serverStatus]);

  // Toggle between login and register
  const toggleMode = useCallback(() => {
    setIsRegistering((prev) => !prev);
    setError("");
    setUsername("");
    setUsernameError("");
    setShowDropdown(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const retryConnection = () => {
    checkServerConnection();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-sm md:w-96 relative">
        {/* Server Status Indicator */}
        {serverStatus && (
          <div
            className={`mb-4 p-2 rounded text-xs text-center ${
              serverStatus === "connected"
                ? "bg-green-100 text-green-700 border border-green-300"
                : serverStatus === "checking"
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                  : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {serverStatus === "connected" && (
              <div className="flex items-center justify-center gap-2">
                <span>✅ Server Connected</span>
                <button
                  onClick={retryConnection}
                  className="text-xs underline hover:no-underline"
                >
                  Refresh
                </button>
              </div>
            )}
            {serverStatus === "checking" && "🔄 Checking Server Connection..."}
            {serverStatus === "error" && (
              <div className="flex items-center justify-between gap-2">
                <span>❌ Cannot connect to {API_URL}</span>
                <button
                  onClick={retryConnection}
                  className="text-xs underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm whitespace-pre-wrap animate-shake">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-2">
          {process.env.NODE_ENV === "development" && (
            <button
              onClick={debugLocalStorage}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
              aria-label="Debug"
            >
              🔍 Debug
            </button>
          )}

          {savedUsers.length > 0 && !isRegistering && (
            <button
              onClick={handleClearAllUsers}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
              type="button"
              aria-label="Clear all users"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Saved Users Dropdown */}
        {savedUsers.length > 0 && !isRegistering && (
          <div className="mb-4 relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="button"
              aria-expanded={showDropdown}
              aria-haspopup="listbox"
              disabled={loading}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="text-gray-700">Continue as...</span>
              </div>
              <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
                {savedUsers.length}
              </span>
            </button>

            {showDropdown && (
              <div
                className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                role="listbox"
              >
                {savedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                  >
                    <button
                      onClick={() => handleLoginWithSaved(user)}
                      className="flex-1 flex items-center gap-3 text-left focus:outline-none focus:bg-gray-50"
                      type="button"
                      aria-label={`Login as ${user.username}`}
                      disabled={loading || serverStatus === "error"}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {user.username}
                        </p>
                        {user.lastLogin && (
                          <p className="text-xs text-gray-500">
                            Last login:{" "}
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={(e) => removeUser(user.id, e)}
                      className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Remove user"
                      type="button"
                      aria-label={`Remove ${user.username}`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Login/Register Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              {savedUsers.length > 0 && !isRegistering
                ? "Or enter new username"
                : "Username"}
            </label>
            <input
              ref={inputRef}
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                usernameError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
              }`}
              placeholder="Enter username"
              required
              minLength={USERNAME_CONFIG.MIN_LENGTH}
              maxLength={USERNAME_CONFIG.MAX_LENGTH}
              pattern={USERNAME_CONFIG.PATTERN.source}
              disabled={loading || serverStatus === "error"}
              autoFocus={savedUsers.length === 0 || isRegistering}
              aria-invalid={!!usernameError}
              aria-describedby={usernameError ? "username-error" : undefined}
            />
            {usernameError && (
              <p id="username-error" className="text-xs text-red-500 mt-1">
                {usernameError}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Username must be {USERNAME_CONFIG.MIN_LENGTH}-
              {USERNAME_CONFIG.MAX_LENGTH} characters, letters, numbers, and
              underscores only
            </p>
          </div>

          <label className="mb-4 flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              disabled={loading}
            />
            <span>Remember me</span>
          </label>

          <button
            type="submit"
            disabled={
              loading ||
              username.length < USERNAME_CONFIG.MIN_LENGTH ||
              !!usernameError ||
              serverStatus === "error"
            }
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isRegistering ? "Creating Account..." : "Logging in..."}
              </span>
            ) : isRegistering ? (
              "Create Account"
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            onClick={toggleMode}
            className="text-blue-500 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            type="button"
          >
            {isRegistering ? "Login" : "Create one"}
          </button>
        </p>

        {savedUsers.length > 0 && !isRegistering && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              {savedUsers.length} saved user{savedUsers.length > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Login;
