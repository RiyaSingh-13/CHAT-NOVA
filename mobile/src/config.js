import { Platform } from "react-native";

/**
 * Backend API & Socket Configuration
 *
 * Connected to local server running on port 5001 with local MongoDB.
 * For physical devices on the same Wi-Fi network, replace localhost with your machine's LAN IP.
 */
export const BACKEND_URL = "http://localhost:5001";

export const API_TIMEOUT = 15000;
