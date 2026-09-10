import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius } from "../constants/theme";

export default function UserInfoDrawer({ user, messages = [], isOnline, onClose }) {
  const [activeImage, setActiveImage] = useState(null);

  if (!user) return null;

  const mediaImages = messages
    .filter((msg) => !!msg.image)
    .map((msg) => msg.image);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact info</Text>
      </View>

      <FlatList
        data={mediaImages}
        keyExtractor={(item, index) => `media-drawer-${index}`}
        numColumns={3}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={
                  user.profilePic
                    ? { uri: user.profilePic }
                    : require("../../assets/avatar_icon.png")
                }
                style={styles.avatar}
              />
              {isOnline && <View style={styles.onlineBadge} />}
            </View>

            <Text style={styles.fullName}>{user.fullName}</Text>
            <Text style={styles.statusText}>
              {isOnline ? "Online" : "Offline"}
            </Text>

            {user.bio ? (
              <View style={styles.card}>
                <Text style={styles.cardLabel}>About</Text>
                <Text style={styles.cardValue}>{user.bio}</Text>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <Ionicons
                name="images-outline"
                size={16}
                color={colors.primaryGradient[0]}
              />
              <Text style={styles.sectionTitle}>Media, links and docs</Text>
              <Text style={styles.mediaCount}>({mediaImages.length})</Text>
            </View>

            {mediaImages.length === 0 && (
              <View style={styles.emptyMedia}>
                <Text style={styles.emptyMediaText}>No media shared yet</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    backgroundColor: colors.cardBackground,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    height: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  closeButton: {
    padding: 2,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  profileSection: {
    alignItems: "center",
    padding: spacing.md,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primaryGradient[0],
    backgroundColor: colors.surface,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  fullName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  cardValue: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
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
    fontSize: 14,
    fontWeight: "600",
  },
  mediaCount: {
    color: colors.textMuted,
    fontSize: 12,
  },
  emptyMedia: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  emptyMediaText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  mediaItem: {
    margin: 3,
  },
  gridImage: {
    width: 90,
    height: 90,
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
