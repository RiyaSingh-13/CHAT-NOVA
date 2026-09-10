import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { formatMessageTime } from "../utils/date";
import { colors, spacing, borderRadius } from "../constants/theme";
import UserInfoDrawer from "./UserInfoDrawer";

export default function ChatDetailPane({ onBack, showBackButton }) {
  const { authUser, onlineUsers = [] } = useContext(AuthContext);
  const {
    selectedUser,
    messages,
    getMessages,
    sendMessage,
    loadingMessages,
  } = useContext(ChatContext);

  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const flatListRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      setDrawerOpen(false);
    }
  }, [selectedUser, getMessages]);

  // When no chat is selected, show WhatsApp-style Welcome Screen
  if (!selectedUser) {
    return (
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeContent}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.welcomeLogo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeTitle}>ChatNova for Web & Mobile</Text>
          <Text style={styles.welcomeSubtitle}>
            Send and receive messages in real time with live online synchronization.
            Select a conversation from the left to start messaging.
          </Text>

          <View style={styles.encryptionBadge}>
            <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
            <Text style={styles.encryptionText}>
              End-to-end connected real-time messaging
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const isOnline = onlineUsers.includes(String(selectedUser._id));

  // Pick an image from gallery
  const handlePickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission Required", "Photo library access is needed to send images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          base64: `data:image/jpeg;base64,${asset.base64}`,
        });
      }
    } catch (err) {
      console.warn("Error picking image:", err);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || sending) return;

    const payload = {};
    if (inputText.trim()) payload.text = inputText.trim();
    if (selectedImage?.base64) payload.image = selectedImage.base64;

    setSending(true);
    const draftText = inputText;
    const draftImage = selectedImage;

    setInputText("");
    setSelectedImage(null);

    const res = await sendMessage(payload);
    setSending(false);

    if (!res.success) {
      Alert.alert("Failed to send", res.message);
      setInputText(draftText);
      setSelectedImage(draftImage);
    }
  };

  const handleKeyDown = (e) => {
    if (Platform.OS === "web") {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const renderMessageItem = ({ item }) => {
    const isSender = item.senderId === authUser?._id;

    return (
      <View
        style={[
          styles.messageRow,
          isSender ? styles.senderRow : styles.receiverRow,
        ]}
      >
        {!isSender && (
          <Image
            source={
              selectedUser.profilePic
                ? { uri: selectedUser.profilePic }
                : require("../../assets/avatar_icon.png")
            }
            style={styles.messageAvatar}
          />
        )}

        <View style={styles.bubbleContainer}>
          {isSender ? (
            <LinearGradient
              colors={colors.bubbleSenderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bubble, styles.senderBubble]}
            >
              {item.image && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setFullScreenImage(item.image)}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.attachedImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              {item.text ? (
                <Text style={styles.senderMessageText}>{item.text}</Text>
              ) : null}
            </LinearGradient>
          ) : (
            <View style={[styles.bubble, styles.receiverBubble]}>
              {item.image && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setFullScreenImage(item.image)}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.attachedImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              {item.text ? (
                <Text style={styles.receiverMessageText}>{item.text}</Text>
              ) : null}
            </View>
          )}

          <Text
            style={[
              styles.messageTimestamp,
              isSender ? styles.senderTimestamp : styles.receiverTimestamp,
            ]}
          >
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainWrapper}>
      <View style={styles.chatPane}>
        {/* Chat Header */}
        <View style={styles.header}>
          {showBackButton && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.headerProfile}
            activeOpacity={0.8}
            onPress={() => setDrawerOpen(!drawerOpen)}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={
                  selectedUser.profilePic
                    ? { uri: selectedUser.profilePic }
                    : require("../../assets/avatar_icon.png")
                }
                style={styles.avatar}
              />
              {isOnline && <View style={styles.onlineBadge} />}
            </View>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerName} numberOfLines={1}>
                {selectedUser.fullName}
              </Text>
              <Text style={styles.headerStatus}>
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => setDrawerOpen(!drawerOpen)}
          >
            <Ionicons
              name={drawerOpen ? "information-circle" : "information-circle-outline"}
              size={24}
              color={drawerOpen ? colors.primaryGradient[0] : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Message Stream */}
        <KeyboardAvoidingView
          style={styles.messagesContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {loadingMessages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primaryGradient[0]} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) =>
                item._id ? String(item._id) : `msg-${index}`
              }
              renderItem={renderMessageItem}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: false })
              }
              ListEmptyComponent={
                <View style={styles.emptyConversation}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={48}
                    color={colors.borderLight}
                  />
                  <Text style={styles.emptyConversationTitle}>No messages yet</Text>
                  <Text style={styles.emptyConversationSubtitle}>
                    Send a message to start conversation with {selectedUser.fullName}!
                  </Text>
                </View>
              }
            />
          )}

          {/* Image Preview before dispatch */}
          {selectedImage && (
            <View style={styles.imagePreviewBar}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewThumb}
              />
              <TouchableOpacity
                style={styles.removePreviewBtn}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Chat Input Bar */}
          <View style={styles.inputBar}>
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={handlePickImage}
              disabled={sending}
            >
              <Ionicons
                name="image-outline"
                size={22}
                color={colors.primaryGradient[0]}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onKeyPress={handleKeyDown}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSend}
              disabled={(!inputText.trim() && !selectedImage) || sending}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  !inputText.trim() && !selectedImage
                    ? [colors.border, colors.border]
                    : colors.primaryGradient
                }
                style={styles.sendGradient}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="send" size={16} color="#ffffff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* WhatsApp-Style Contact Info Drawer */}
      {drawerOpen && (
        <UserInfoDrawer
          user={selectedUser}
          messages={messages}
          isOnline={isOnline}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      {/* Full-Screen Image Modal */}
      <Modal
        visible={!!fullScreenImage}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <SafeAreaView style={styles.imageModal}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setFullScreenImage(null)}
          >
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
          {fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage }}
              style={styles.modalFullImage}
              resizeMode="contain"
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.background,
  },
  chatPane: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  welcomeContent: {
    alignItems: "center",
    maxWidth: 440,
    gap: 12,
  },
  welcomeLogo: {
    width: 220,
    height: 60,
    marginBottom: spacing.md,
  },
  welcomeTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  welcomeSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  encryptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 40,
  },
  encryptionText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 6,
    padding: 2,
  },
  headerProfile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  headerTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  headerName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  headerStatus: {
    color: colors.textMuted,
    fontSize: 12,
  },
  headerAction: {
    padding: 6,
  },
  messagesContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  emptyConversation: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
    gap: 8,
  },
  emptyConversationTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  emptyConversationSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 240,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
    maxWidth: "80%",
  },
  senderRow: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  receiverRow: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  bubbleContainer: {
    maxWidth: "100%",
  },
  bubble: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    overflow: "hidden",
  },
  senderBubble: {
    borderBottomRightRadius: 2,
  },
  receiverBubble: {
    backgroundColor: colors.bubbleReceiver,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  senderMessageText: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 20,
  },
  receiverMessageText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  attachedImage: {
    width: 220,
    height: 180,
    borderRadius: borderRadius.md,
    marginBottom: 6,
  },
  messageTimestamp: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  senderTimestamp: {
    textAlign: "right",
    marginRight: 4,
  },
  receiverTimestamp: {
    textAlign: "left",
    marginLeft: 4,
  },
  imagePreviewBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewThumb: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
  },
  removePreviewBtn: {
    position: "absolute",
    top: 2,
    left: 52,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: borderRadius.full,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachBtn: {
    padding: 6,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    color: colors.text,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendBtn: {
    marginLeft: 8,
  },
  sendGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  imageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  modalFullImage: {
    width: "100%",
    height: "85%",
  },
});
