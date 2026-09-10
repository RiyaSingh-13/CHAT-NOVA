import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { socket, axios, authUser } = useContext(AuthContext);

  // Fetch all users for chat list
  const getUsers = useCallback(async () => {
    if (!authUser) return;
    setLoadingUsers(true);
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data?.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      console.warn("Error fetching users:", error?.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [axios, authUser]);

  // Fetch messages with selected user
  const getMessages = useCallback(
    async (userId) => {
      if (!userId) return;
      setLoadingMessages(true);
      try {
        const { data } = await axios.get(`/api/messages/${userId}`);
        if (data?.success) {
          setMessages(data.messages || []);
          // Clear unseen count for this user
          setUnseenMessages((prev) => ({
            ...prev,
            [userId]: 0,
          }));
        }
      } catch (error) {
        console.warn("Error fetching messages:", error?.message);
      } finally {
        setLoadingMessages(false);
      }
    },
    [axios],
  );

  // Send message (text, image, or both)
  const sendMessage = async (messageData) => {
    if (!selectedUser?._id) return { success: false, message: "No recipient selected" };
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData,
      );

      if (data?.success) {
        setMessages((prev) => [...prev, data.message]);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data?.message || "Failed to send message" };
      }
    } catch (error) {
      console.warn("Error sending message:", error?.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to send",
      };
    }
  };

  // Listen for incoming messages in real-time
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser, axios]);

  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    loadingUsers,
    loadingMessages,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    setMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
