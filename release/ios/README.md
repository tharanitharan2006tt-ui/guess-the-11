# GUESS THE 11 — IOS RELEASE & TESTFLIGHT DEPLOYMENT GUIDE

Bundle Identifier: `com.guessthe11.game`  
App Name: `GUESS THE 11`  
Engine: Capacitor 6 + React 18 + HTML5 Canvas  
Target iOS Version: iOS 14.0+  
Supported Devices: iPhone, iPad, iPod Touch  
Xcode Project Location: `client/ios/App/App.xcworkspace` (or `App.xcodeproj`)

---

## 🍎 iOS Environment & Prerequisites

Building native iOS binaries requires **macOS** with **Xcode 15+** installed.  
On Windows, the complete native Xcode project and all configuration files have been generated and synchronized into `client/ios/`.

---

## 🛠️ Step-by-Step macOS / Xcode Build Instructions

### Step 1: Clone Repository on Mac & Install Dependencies

```bash
git clone <YOUR_REPO_URL>
cd "Guess the 11"
npm install
npm run build:shared
npm run build:client
```

### Step 2: Sync Capacitor iOS Assets

```bash
cd client
npx cap sync ios
```

### Step 3: Open in Xcode

```bash
npx cap open ios
```
*(Or open `client/ios/App/App.xcworkspace` directly in Xcode).*

### Step 4: Configure Apple Developer Team & Signing

1. In Xcode, select the **App** project in the left navigator.
2. Select the **App** target.
3. Open the **Signing & Capabilities** tab.
4. Check **Automatically manage signing**.
5. Select your **Team** (Active Apple Developer Program account).
6. Verify Bundle Identifier: `com.guessthe11.game`.

---

## ✈️ TestFlight Distribution Preparation

### Method A: Xcode Organizer (GUI)

1. Set the build destination to **Any iOS Device (arm64)** in the top bar.
2. In the top menu, select **Product** > **Archive**.
3. Once archiving completes, the **Organizer** window opens.
4. Click **Distribute App**.
5. Select **TestFlight & App Store** > click **Distribute**.
6. Follow prompts to automatically upload the build to App Store Connect.
7. Open [App Store Connect](https://appstoreconnect.apple.com), navigate to **TestFlight**, and invite internal or external testers!

### Method B: CLI Automated Build (Fastlane or xcodebuild)

```bash
# Archive the build:
xcodebuild -workspace client/ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -archivePath build/GuessThe11.xcarchive \
  archive

# Export IPA using ExportOptions.plist:
xcodebuild -exportArchive \
  -archivePath build/GuessThe11.xcarchive \
  -exportPath release/ios/ \
  -exportOptionsPlist release/ios/ExportOptions.plist

# Upload to TestFlight using Apple altool:
xcrun altool --upload-app -f release/ios/App.ipa -t ios -u "<YOUR_APPLE_ID>" -p "<APP_SPECIFIC_PASSWORD>"
```

---

## 📝 App Store Submission Metadata

- **App Name**: `GUESS THE 11`
- **Subtitle**: `Online 11-Player Drawing Game`
- **Primary Category**: `Games > Word`
- **Secondary Category**: `Games > Trivia`
- **Age Rating**: `4+` (No objectionable content, family-friendly)
- **Keywords**: `multiplayer,drawing,guessing,pictionary,sketch,11 players,party game,trivia,words`
- **Promotional Text**: `Join 11-player multiplayer rooms in real time! Sketch, guess words, score points, and top the leaderboard!`
- **Description**:
  > GUESS THE 11 brings an electrifying multiplayer guessing and drawing experience to mobile.
  > Form an 11-player squad or jump into fast practice rooms. Each round, one competitor sketches the secret word on a fluid HTML5 canvas while ten rivals race against the clock to type correct answers.
  >
  > Features:
  > • Real-time socket-synced multiplayer gameplay
  > • 11 distinctive player slots with live squad roster
  > • 11 curated categories: Animals, Food, Sports, Movies, Tech, and more
  > • Server-authoritative scoring: +1 point per correct guess, drawer bonuses, and a dramatic -5 penalty if nobody guesses!
  > • Global leaderboards, animated winner ceremonies, and native link sharing.

---

## ⚠️ Remaining Manual Requirements for Final Apple Publication

1. **Paid Apple Developer Account**: Membership ($99 USD/year) is required to sign IPAs and access App Store Connect.
2. **App Store Connect App Record**: Register app record under `com.guessthe11.game`.
3. **App Privacy Policy URL**: Provide a public URL (e.g. `https://your-domain.com/privacy`).
4. **App Store Screenshots**: 6.7" iPhone (iPhone 15 Pro Max) and 6.5" iPhone display screenshots.
