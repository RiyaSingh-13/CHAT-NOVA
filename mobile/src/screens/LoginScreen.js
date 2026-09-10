import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { colors, spacing, borderRadius } from "../constants/theme";

export default function LoginScreen() {
  const [currState, setCurrState] = useState("Login"); // "Login" or "Sign up"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false); // Step 2 in Sign up
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { Login } = useContext(AuthContext);

  const handleSubmit = async () => {
    setErrorMessage("");

    if (currState === "Sign up") {
      if (!isDataSubmitted) {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          setErrorMessage("Please fill in all fields.");
          return;
        }
        if (password.length < 6) {
          setErrorMessage("Password must be at least 6 characters.");
          return;
        }
        setIsDataSubmitted(true);
        return;
      }

      if (!bio.trim()) {
        setErrorMessage("Please provide a short bio.");
        return;
      }

      if (!agreedToTerms) {
        setErrorMessage("Please agree to terms of use & privacy policy.");
        return;
      }

      setSubmitting(true);
      const res = await Login("signup", {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        bio: bio.trim(),
      });
      setSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.message);
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setErrorMessage("Please enter both email and password.");
        return;
      }

      setSubmitting(true);
      const res = await Login("login", {
        email: email.trim().toLowerCase(),
        password,
      });
      setSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.message);
      }
    }
  };

  const switchMode = (mode) => {
    setCurrState(mode);
    setIsDataSubmitted(false);
    setErrorMessage("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Chat anytime, anywhere</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{currState}</Text>
            {isDataSubmitted && currState === "Sign up" && (
              <TouchableOpacity
                onPress={() => setIsDataSubmitted(false)}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          {currState === "Sign up" && !isDataSubmitted && (
            <View style={styles.inputGroup}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          )}

          {!isDataSubmitted && (
            <>
              <View style={styles.inputGroup}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          {currState === "Sign up" && isDataSubmitted && (
            <View style={styles.textAreaGroup}>
              <TextInput
                style={styles.textArea}
                placeholder="Tell us a little bit about yourself (Bio)..."
                placeholderTextColor={colors.textMuted}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {currState === "Sign up" && isDataSubmitted && (
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <Ionicons
                name={agreedToTerms ? "checkbox" : "square-outline"}
                size={20}
                color={agreedToTerms ? colors.primaryGradient[0] : colors.textMuted}
              />
              <Text style={styles.checkboxLabel}>
                I agree to terms of use & privacy policy.
              </Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
            style={styles.submitWrapper}
          >
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitText}>
                  {currState === "Sign up"
                    ? isDataSubmitted
                      ? "Create Account"
                      : "Continue"
                    : "Login"}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Switch Mode Footer */}
          <View style={styles.switchRow}>
            {currState === "Sign up" ? (
              <Text style={styles.switchText}>
                Already have an account?{" "}
                <Text
                  onPress={() => switchMode("Login")}
                  style={styles.switchLink}
                >
                  Login here
                </Text>
              </Text>
            ) : (
              <Text style={styles.switchText}>
                Don't have an account?{" "}
                <Text
                  onPress={() => switchMode("Sign up")}
                  style={styles.switchLink}
                >
                  Sign up here
                </Text>
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    width: 200,
    height: 50,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...Platform.select({
      web: {
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    gap: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    flex: 1,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  eyeIcon: {
    padding: 4,
  },
  textAreaGroup: {
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginBottom: spacing.md,
    padding: spacing.md,
    minHeight: 110,
  },
  textArea: {
    color: colors.text,
    fontSize: 15,
    minHeight: 90,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: 8,
  },
  checkboxLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  submitWrapper: {
    borderRadius: borderRadius.md,
    overflow: "hidden",
    marginTop: spacing.xs,
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchRow: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  switchText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  switchLink: {
    color: colors.primaryGradient[0],
    fontWeight: "600",
  },
});
