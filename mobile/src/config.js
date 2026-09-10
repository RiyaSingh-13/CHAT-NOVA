import { Platform } from "react-native";

/**
 * Intelligent Backend Resolution:
 * - When running on deployed web (e.g. chat-nova-fd.onrender.com):
 *   connects to production backend "https://chat-nova-bk.onrender.com"
 * - When running locally in browser (localhost / 127.0.0.1):
 *   connects to local server "http://localhost:5001"
 * - On native mobile devices (iOS / Android / Expo Go):
 *   connects to "https://chat-nova-bk.onrender.com" by default
 */
const isWeb = Platform.OS === "web";
const isLocalhost =
  isWeb &&
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

export const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  (isLocalhost ? "http://localhost:5001" : "https://chat-nova-bk.onrender.com");

export const API_TIMEOUT = 15000;
