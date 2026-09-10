import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { io } from "socket.io-client";
import { BACKEND_URL, API_TIMEOUT } from "../config";
import { Alert } from "react-native";

axios.defaults.baseURL = BACKEND_URL;
axios.defaults.timeout = API_TIMEOUT;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Connect socket and listen for online status updates
  const connectSocket = useCallback(
    (userData) => {
      if (!userData?._id) return;
      if (socket?.connected) return;

      console.log("[Socket] Connecting with userId:", userData._id);
      const newSocket = io(BACKEND_URL, {
        query: { userId: userData._id },
        transports: ["websocket"],
        reconnection: true,
      });

      newSocket.on("connect", () => {
        console.log("[Socket] Connected:", newSocket.id);
      });

      newSocket.on("getOnlineUsers", (userIds) => {
        console.log("[Socket] Received online users:", userIds);
        setOnlineUsers(userIds || []);
      });

      newSocket.on("disconnect", () => {
        console.log("[Socket] Disconnected");
      });

      setSocket(newSocket);
    },
    [socket],
  );

  // Disconnect socket cleanly
  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [socket]);

  // Check if saved token is valid
  const checkAuth = async (authToken) => {
    try {
      const activeToken = authToken || token;
      if (!activeToken) {
        setLoading(false);
        return;
      }

      const { data } = await axios.get("/api/auth/check", {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      if (data?.success) {
        const user = data.user || data.userData;
        setAuthUser(user);
        connectSocket(user);
      } else {
        await handleSessionExpiry();
      }
    } catch (error) {
      console.warn("Auth check failed:", error?.message);
      await handleSessionExpiry();
    } finally {
      setLoading(false);
    }
  };

  const handleSessionExpiry = async () => {
    setAuthUser(null);
    setToken(null);
    delete axios.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem("token");
    disconnectSocket();
  };

  // Login or Signup
  const Login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);

      if (data?.success) {
        const user = data.user || data.userData;
        const authToken = data.token;

        setAuthUser(user);
        setToken(authToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
        await AsyncStorage.setItem("token", authToken);
        connectSocket(user);

        return { success: true, message: data.message };
      } else {
        return { success: false, message: data?.message || "Authentication failed" };
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Network error occurred";
      return { success: false, message: errorMsg };
    }
  };

  // Logout
  const Logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setAuthUser(null);
      setToken(null);
      setOnlineUsers([]);
      disconnectSocket();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Update profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data?.success) {
        setAuthUser(data.user);
        return { success: true, message: data.message || "Profile updated successfully" };
      } else {
        return { success: false, message: data?.message || "Failed to update profile" };
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to update profile";
      return { success: false, message: errorMsg };
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          await checkAuth(storedToken);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error reading token:", err);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      disconnectSocket();
    };
  }, []);

  const value = {
    axios,
    authUser,
    token,
    onlineUsers,
    socket,
    loading,
    Login,
    Logout,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
