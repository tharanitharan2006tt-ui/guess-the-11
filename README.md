# GUESS THE 11 🎮🎨
### Ultimate Online Real-Time Multiplayer Drawing & Guessing Game

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Multiplayer](https://img.shields.io/badge/Multiplayer-11%20Players-blue.svg)]()
[![Platforms](https://img.shields.io/badge/Platforms-Android%20%7C%20iOS%20%7C%20Web-purple.svg)]()
[![Engine](https://img.shields.io/badge/Engine-Socket.IO%20%7C%20React%20%7C%20Capacitor-orange.svg)]()

**GUESS THE 11** is a commercial-quality, server-authoritative online multiplayer gaming application designed from scratch. Players form an 11-player squad, take turns sketching secret words on an HTML5 canvas, and race against the clock to guess answers in real time.

---

## 🌟 Key Highlights & Features

- **Real Multiplayer System**: Dedicated 11-player rooms with unique 6-character room codes.
- **Server-Authoritative Game Engine**: Real-time timer, drawer rotation, word masking, stroke validation, and tamper-proof scoring.
- **High-Stakes Scoring Rules**:
  - **+1 Point**: For every player who submits a correct guess.
  - **+1 Point (Drawer Bonus)**: Awarded to the drawer if at least one player guesses correctly.
  - **-5 Points (Drawer Penalty)**: Harsh penalty deducted if *nobody* guesses the word before time runs out!
- **Secret Word Database**: 11 curated categories (Animals, Food, Sports, Movies, Objects, Places, Nature, Technology, General Knowledge) across Easy, Medium, and Hard difficulties with duplicate protection.
- **HTML5 Canvas Drawing Engine**: Sub-millisecond stroke synchronization, neon color palette, multiple brush sizes, eraser, undo, redo, and clear tools with touch and mouse interpolation.
- **11 Distinctive Neon Gamer Avatars**: Cyber Ninja, Neon Robot, Cosmic Wizard, Dragon Slayer, Space Pilot, Pixel Knight, and more.
- **Native Mobile Integration (Capacitor 6)**:
  - Android APK & AAB releases
  - iOS Xcode project prepared for TestFlight and App Store submission
  - Deep-link support (`guessthe11://` and `https://domain.com/join?room=CODE`)
  - Native mobile sharing (WhatsApp, Web Share API, clipboard fallback)
  - Portrait orientation lock and touchscreen optimization
- **Admin Command Center**: Real-time monitoring of online players, active games, lobby status, and popular categories.

---

## 📁 Project Architecture

```
Guess the 11/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS + Capacitor)
│   ├── android/                # Native Android Studio Project
│   ├── ios/                    # Native iOS Xcode Project
│   ├── src/
│   │   ├── components/         # Canvas, Chat, Modals (Create, Join, HowToPlay, Leaderboard, Auth)
│   │   ├── pages/              # HomeScreen, LobbyScreen, GameScreen, AdminDashboard, RoomController
│   │   ├── services/           # Socket.IO Client, Supabase Auth & Storage
│   │   └── utils/              # Web Audio Synthesizer (Zero external audio files needed)
│   ├── capacitor.config.ts     # Capacitor Native Mobile Configuration
│   └── vercel.json             # Vercel Production Web Hosting Config
│
├── server/                     # Backend (Node.js + Express + Socket.IO + TypeScript)
│   ├── src/
│   │   ├── engine/             # GameRoom state machine, 11-Player rotation, RoomManager
│   │   ├── words/              # Curated Word Database & Blanks Hint Generator
│   │   ├── socket/             # Socket.IO Event Handlers & Security Validation
│   │   ├── routes/             # REST API (/health, /api/rooms, /api/admin/stats, /api/leaderboard)
│   │   ├── database.ts         # Supabase PostgreSQL Integration with In-Memory Fallback
│   │   └── tests/              # Full 11-Player Multiplayer Simulation Tests
│   ├── Dockerfile              # Containerized Backend Deployment
│   └── render.yaml             # Render Blueprint Specification
│
├── shared/                     # Shared TypeScript interfaces, Socket events, and Game constants
├── supabase/
│   └── migrations/             # Production PostgreSQL schema, tables, indexes, RLS, triggers
├── release/
│   ├── android/                # Android APK & AAB distribution files & installation guide
│   └── ios/                    # iOS TestFlight & App Store submission metadata & export options
├── scripts/                    # Automated mobile build scripts (PowerShell & Bash)
└── .github/workflows/          # CI/CD Automated Cloud Build Pipeline for Android & iOS
```

---

## 🚀 Quick Start & Local Development

### 1. Install All Dependencies

```bash
npm install
```

### 2. Build Shared Module

```bash
npm run build:shared
```

### 3. Run Development Servers

Open two terminals:

**Terminal 1 (Backend Server on Port 4000):**
```bash
npm run dev:server
```

**Terminal 2 (Frontend Client on Port 3000):**
```bash
npm run dev:client
```

Open your browser at `http://localhost:3000`.

---

## 🧪 Automated Testing

Run the complete test suite including the 11-player multiplayer simulation:

```bash
# Run server & 11-player multiplayer simulation tests:
npm run test:server

# Run frontend tests:
npm run test:client

# Run complete test suite:
npm run test
```

---

## 📦 Building for Production

```bash
# Build all workspaces (Shared, Server, Client):
npm run build
```

---

## 📱 Mobile App Releases

- **Android Installation Guide**: [`release/android/README.md`](release/android/README.md)
- **iOS TestFlight Guide**: [`release/ios/README.md`](release/ios/README.md)
- **Production Deployment Guide**: [`DEPLOYMENT.md`](DEPLOYMENT.md)
