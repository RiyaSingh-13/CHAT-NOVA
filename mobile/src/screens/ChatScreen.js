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
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { formatMessageTime } from "../utils/date";
import { colors, spacing, borderRadius } from "../constants/theme";

export default function ChatScreen({ navigation }) {
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

  const flatListRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  const isUserOnline =
    selectedUser && onlineUsers.includes(String(selectedUser._id));

  // Pick an image from gallery
  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "You must grant photo library permissions to send images.",
        );
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
        const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
        setSelectedImage({
          uri: asset.uri,
          base64: base64Uri,
        });
      }
    } catch (err) {
      console.warn("Error picking image:", err);
      Alert.alert("Error", "Could not select image.");
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || sending) return;

    const payload = {};
    if (inputText.trim()) payload.text = inputText.trim();
    if (selectedImage?.base64) payload.image = selectedImage.base64;

    setSending(true);
    const clearImage = selectedImage;
    const clearText = inputText;

    setInputText("");
    setSelectedImage(null);

    const res = await sendMessage(payload);
    setSending(false);

    if (!res.success) {
      Alert.alert("Failed to send", res.message);
      // Restore draft
      setInputText(clearText);
      setSelectedImage(clearImage);
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
              selectedUser?.profilePic
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerProfile}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("UserDetail")}
        >
          <View style={styles.headerAvatarContainer}>
            <Image
              source={
                selectedUser?.profilePic
                  ? { uri: selectedUser.profilePic }
                  : require("../../assets/avatar_icon.png")
              }
              style={styles.headerAvatar}
            />
            {isUserOnline && <View style={styles.headerOnlineBadge} />}
          </View>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName} numberOfLines={1}>
              {selectedUser?.fullName || "Chat"}
            </Text>
            <Text style={styles.headerStatus}>
              {isUserOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => navigation.navigate("UserDetail")}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Messages List & Keyboard Handling */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {loadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={colors.primaryGradient[0]}
            />
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
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={48}
                  color={colors.borderLight}
                />
                <Text style={styles.emptyText}>No messages yet.</Text>
                <Text style={styles.emptySubText}>
                  Say hello to {selectedUser?.fullName || "start the conversation"}!
                </Text>
              </View>
            }
          />
        )}

        {/* Selected Image Preview before sending */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.imagePreview}
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handlePickImage}
            disabled={sending}
          >
            <Ionicons
              name="image-outline"
              size={24}
              color={colors.primaryGradient[0]}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={styles.sendButton}
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
                <Ionicons name="send" size={18} color="#ffffff" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={!!fullScreenImage}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <SafeAreaView style={styles.imageModalContainer}>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setFullScreenImage(null)}
          >
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>

          {fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage }}
              style={styles.fullModalImage}
              resizeMode="contain"
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerProfile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacing.xs,
  },
  headerAvatarContainer: {
    position: "relative",
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
  },
  headerOnlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.online,
    borderWidth: 1.5,
    borderColor: colors.cardBackground,
  },
  headerTextContainer: {
    marginLeft: spacing.sm,
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
    padding: spacing.sm,
  },
  keyboardContainer: {
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
    gap: 8,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
    maxWidth: "82%",
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
    marginRight: spacing.xs,
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  bubbleContainer: {
    maxWidth: "100%",
  },
  bubble: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
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
    fontSize: 15,
    lineHeight: 20,
  },
  receiverMessageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  attachedImage: {
    width: 210,
    height: 180,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
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
  imagePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.cardBackground,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
  },
  removeImageButton: {
    position: "absolute",
    top: 2,
    left: 62,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: borderRadius.full,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    marginLeft: spacing.sm,
  },
  sendGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeModalButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullModalImage: {
    width: "100%",
    height: "80%",
  },
});
