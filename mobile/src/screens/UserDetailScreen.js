import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { colors, spacing, borderRadius } from "../constants/theme";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 48) / 3;

export default function UserDetailScreen({ navigation }) {
  const { onlineUsers = [] } = useContext(AuthContext);
  const { selectedUser, messages } = useContext(ChatContext);

  const [activeImage, setActiveImage] = useState(null);

  if (!selectedUser) {
    navigation.goBack();
    return null;
  }

  const isOnline = onlineUsers.includes(String(selectedUser._id));

  // Extract all media images shared in this chat
  const mediaImages = messages
    .filter((msg) => !!msg.image)
    .map((msg) => msg.image);

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
        <Text style={styles.headerTitle}>Contact Info</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={mediaImages}
        keyExtractor={(item, index) => `media-${index}`}
        numColumns={3}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
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

            <Text style={styles.fullName}>{selectedUser.fullName}</Text>
            <Text style={styles.statusText}>
              {isOnline ? "Active now" : "Offline"}
            </Text>

            {selectedUser.bio ? (
              <View style={styles.bioCard}>
                <Text style={styles.bioLabel}>About</Text>
                <Text style={styles.bioText}>{selectedUser.bio}</Text>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <Ionicons
                name="images-outline"
                size={18}
                color={colors.primaryGradient[0]}
              />
              <Text style={styles.sectionTitle}>Shared Media</Text>
              <Text style={styles.mediaCount}>({mediaImages.length})</Text>
            </View>

            {mediaImages.length === 0 && (
              <View style={styles.emptyMedia}>
                <Ionicons
                  name="image-outline"
                  size={36}
                  color={colors.borderLight}
                />
                <Text style={styles.emptyMediaText}>No photos shared yet</Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.mediaItem}
            activeOpacity={0.8}
            onPress={() => setActiveImage(item)}
          >
            <Image
              source={{ uri: item }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />

      {/* Full-Screen Image Viewer Modal */}
      <Modal
        visible={!!activeImage}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveImage(null)}
      >
        <SafeAreaView style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setActiveImage(null)}
          >
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
          {activeImage && (
            <Image
              source={{ uri: activeImage }}
              style={styles.modalImage}
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
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.primaryGradient[0],
    backgroundColor: colors.surface,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.background,
  },
  fullName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  bioCard: {
    width: "100%",
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bioLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bioText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    gap: 6,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  mediaCount: {
    color: colors.textMuted,
    fontSize: 14,
  },
  emptyMedia: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: 8,
  },
  emptyMediaText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  mediaItem: {
    margin: 4,
  },
  gridImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  modalImage: {
    width: "100%",
    height: "85%",
  },
});
