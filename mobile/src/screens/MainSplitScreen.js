import React, { useContext } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  SafeAreaView,
} from "react-native";
import { ChatContext } from "../context/ChatContext";
import ChatListPane from "../components/ChatListPane";
import ChatDetailPane from "../components/ChatDetailPane";
import { colors } from "../constants/theme";

export default function MainSplitScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { selectedUser, setSelectedUser } = useContext(ChatContext);

  // 680px breakpoint for WhatsApp-style 40/60 master-detail split view
  const isSplitView = width >= 680;

  if (isSplitView) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.splitContainer}>
          {/* Left Pane - 40% Width: Conversations List */}
          <View style={styles.leftPane}>
            <ChatListPane navigation={navigation} />
          </View>

          {/* Right Pane - 60% Width: Active Chat or Welcome State */}
          <View style={styles.rightPane}>
            <ChatDetailPane showBackButton={false} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Narrow Mobile View (Phones): Stack behavior
  return (
    <SafeAreaView style={styles.safeContainer}>
      {selectedUser ? (
        <ChatDetailPane
          showBackButton={true}
          onBack={() => setSelectedUser(null)}
        />
      ) : (
        <ChatListPane navigation={navigation} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  splitContainer: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
  },
  leftPane: {
    width: "40%",
    minWidth: 280,
    maxWidth: 480,
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  rightPane: {
    flex: 1,
    height: "100%",
    backgroundColor: colors.background,
  },
});
