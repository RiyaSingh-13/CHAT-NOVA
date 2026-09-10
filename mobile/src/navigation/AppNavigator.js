import React, { useContext } from "react";
import { View, ActivityIndicator, Image, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import MainSplitScreen from "../screens/MainSplitScreen";
import HomeScreen from "../screens/HomeScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import UserDetailScreen from "../screens/UserDetailScreen";
import { colors } from "../constants/theme";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { authUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="large"
          color={colors.primaryGradient[0]}
          style={styles.spinner}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      >
        {!authUser ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={MainSplitScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="UserDetail" component={UserDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingLogo: {
    width: 200,
    height: 60,
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});
