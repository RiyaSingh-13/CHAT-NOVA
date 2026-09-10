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
  SafeAreaView,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { colors, spacing, borderRadius } from "../constants/theme";

export default function HomeScreen({ navigation }) {
  const { authUser, Logout, onlineUsers = [] } = useContext(AuthContext);
  const {
    users,
    unseenMessages,
    getUsers,
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

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    navigation.navigate("Chat");
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

    return (
      <TouchableOpacity
        style={styles.userCard}
        activeOpacity={0.7}
        onPress={() => handleSelectUser(item)}
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
            <Text style={styles.userName} numberOfLines={1}>
              {item.fullName}
            </Text>
            {isOnline ? (
              <Text style={styles.onlineText}>Online</Text>
            ) : (
              <Text style={styles.offlineText}>Offline</Text>
            )}
          </View>
          <Text style={styles.userBio} numberOfLines={1}>
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
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
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
            <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* User Conversation List */}
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
                size={48}
                color={colors.borderLight}
              />
              <Text style={styles.emptyTitle}>No conversations found</Text>
              <Text style={styles.emptySubtitle}>
                {search
                  ? "Try searching for a different name"
                  : "Invite friends or wait for others to join!"}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Dropdown / Options Modal */}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 140,
    height: 38,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileButton: {
    borderWidth: 1.5,
    borderColor: colors.primaryGradient[0],
    borderRadius: borderRadius.full,
    padding: 2,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  menuIconButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  userName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
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
    fontSize: 13,
  },
  unreadBadge: {
    backgroundColor: colors.online,
    borderRadius: borderRadius.full,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  unreadCount: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    maxWidth: 240,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 56,
    paddingRight: 16,
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
