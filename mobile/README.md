# ChatNova Mobile (React Native + Expo)

Cross-platform mobile application for **CHAT-NOVA**, built with React Native and Expo. Supports iOS, Android, and Web.

---

## Features

- 🔐 **Authentication & Session Persistence**: Multi-step Signup & Login with JWT stored securely via AsyncStorage.
- ⚡ **Real-Time Messaging**: Socket.IO integration for instant messaging, read receipts, and live online/offline user presence.
- 📸 **Photo Sharing**: Native camera roll image picker (`expo-image-picker`) with Cloudinary base64 upload and full-screen image viewer.
- 👤 **Profile Management**: Upload custom avatar photos, edit full name, and update bio.
- 🖼️ **Shared Media Gallery**: View all photos shared between users in a clean grid gallery.
- 🎨 **Sleek Dark Theme**: Glassmorphic dark aesthetic matching the original web app with purple-to-violet linear gradients.

---

## Quick Start

### 1. Prerequisites
Ensure you have Node.js (v18+) and npm installed.

### 2. Install Dependencies
If not already installed:
```bash
cd mobile
npm install
```

### 3. Configure Backend URL
Open `src/config.js`:
- Default points to the live backend: `https://chat-nova-bk.onrender.com`
- For local development with a running server on your machine:
  - **iOS Simulator**: `http://localhost:5002`
  - **Android Emulator**: `http://10.0.2.2:5002`
  - **Physical Device (Expo Go)**: `http://<YOUR_COMPUTER_IP>:5002` (e.g. `http://192.168.1.50:5002`)

### 4. Run the App

Start the Expo development server:
```bash
npm start
```

From the terminal menu, you can press:
- `a` to open on an **Android emulator** or connected device.
- `i` to open on an **iOS simulator** (macOS with Xcode).
- `w` to open on **Web browser**.
- Or scan the terminal QR code using the **Expo Go** app on your physical iPhone or Android phone!

---

## Project Structure

```
mobile/
├── assets/                 # App icons, logos, and local image assets
├── src/
│   ├── config.js           # API and socket endpoint configuration
│   ├── constants/
│   │   └── theme.js        # Design tokens, color palette, gradients
│   ├── context/
│   │   ├── AuthContext.js  # User auth, JWT token, socket lifecycle
│   │   └── ChatContext.js  # Message stream, user list, image dispatch
│   ├── navigation/
│   │   └── AppNavigator.js # React Navigation Native Stack
│   ├── screens/
│   │   ├── LoginScreen.js  # Sign in / Sign up multi-step screen
│   │   ├── HomeScreen.js   # Conversation list with live search & badges
│   │   ├── ChatScreen.js   # Chat conversation view with media picker
│   │   ├── ProfileScreen.js# Profile & avatar editor
│   │   └── UserDetailScreen.js # Contact details and shared media gallery
│   └── utils/
│       └── date.js         # Timestamp and date formatting utilities
├── App.js                  # Root application entry
├── app.json                # Expo configuration and permissions
└── package.json            # Project dependencies and scripts
```
