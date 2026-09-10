import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  RefreshControl,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { colors, spacing, borderRadius } from "../constants/theme";

export default function ChatListPane({ navigation, onSelectUser }) {
  const { authUser, Logout, onlineUsers = [] } = useContext(AuthContext);
  const {
    users,
    unseenMessages,
    getUsers,
    selectedUser,
    setSelectedUser,
    loadingUsers,
  } = useContext(ChatContext);

  const [search, setSearch] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = search.trim()
    ? users.filter((u) =>
        (u.fullName || "").toLowerCase().includes(search.toLowerCase().trim()),
      )
    : users;

  const handleSelect = (user) => {
    setSelectedUser(user);
    if (onSelectUser) onSelectUser(user);
  };

  const handleLogout = () => {
    setMenuVisible(false);
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => Logout(),
      },
    ]);
  };

  const renderUserItem = ({ item }) => {
    const isOnline = onlineUsers.includes(String(item._id));
    const unreadCount = unseenMessages[item._id] || 0;
    const isSelected = selectedUser?._id === item._id;

    return (
      <TouchableOpacity
        style={[
          styles.userCard,
          isSelected && styles.userCardActive,
        ]}
        activeOpacity={0.7}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={
              item.profilePic
                ? { uri: item.profilePic }
                : require("../../assets/avatar_icon.png")
            }
            style={styles.avatar}
          />
          {isOnline && <View style={styles.onlineBadge} />}
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text
              style={[
                styles.userName,
                isSelected && styles.userNameActive,
              ]}
              numberOfLines={1}
            >
              {item.fullName}
            </Text>
            {isOnline ? (
              <Text style={styles.onlineText}>Online</Text>
            ) : (
              <Text style={styles.offlineText}>Offline</Text>
            )}
          </View>
          <Text
            style={[
              styles.userBio,
              isSelected && styles.userBioActive,
            ]}
            numberOfLines={1}
          >
            {item.bio || "Available on ChatNova"}
          </Text>
        </View>

        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}

        {isSelected && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Image
              source={
                authUser?.profilePic
                  ? { uri: authUser.profilePic }
                  : require("../../assets/avatar_icon.png")
              }
              style={styles.headerAvatar}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuIconButton}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={16}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search or start new chat"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loadingUsers}
            onRefresh={getUsers}
            tintColor={colors.primaryGradient[0]}
            colors={[colors.primaryGradient[0]]}
          />
        }
        ListEmptyComponent={
          !loadingUsers ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="chatbubbles-outline"
                size={40}
                color={colors.borderLight}
              />
              <Text style={styles.emptyTitle}>No chats found</Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? "Try searching for a different contact"
                  : "Waiting for contacts to join..."}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuDropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Profile");
              }}
            >
              <Ionicons name="person-outline" size={18} color={colors.text} />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 120,
    height: 34,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileButton: {
    borderWidth: 1.5,
    borderColor: colors.primaryGradient[0],
    borderRadius: borderRadius.full,
    padding: 2,
  },
  headerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  menuIconButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    height: 38,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },
  listContent: {
    paddingVertical: spacing.xs,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    position: "relative",
  },
  userCardActive: {
    backgroundColor: colors.surfaceLight,
  },
  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primaryGradient[0],
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  userName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  userNameActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  onlineText: {
    color: colors.online,
    fontSize: 11,
    fontWeight: "500",
  },
  offlineText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  userBio: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  userBioActive: {
    color: "#e2e8f0",
  },
  unreadBadge: {
    backgroundColor: colors.online,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    marginLeft: 6,
  },
  unreadCount: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    maxWidth: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 56,
    paddingLeft: 120,
  },
  menuDropdown: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.4)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  menuItemText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
});
