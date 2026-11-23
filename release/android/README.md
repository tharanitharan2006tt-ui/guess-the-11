# GUESS THE 11 — ANDROID RELEASE & INSTALLATION GUIDE

Package ID: `com.guessthe11.game`  
App Name: `GUESS THE 11`  
Engine: Capacitor 6 + React 18 + HTML5 Canvas  
Target Android SDK: 34 (Android 14)  
Minimum Android SDK: 22 (Android 5.1 Lollipop)

---

## 📦 Deliverables & File Locations

- **Production APK (Direct Sideloading)**: `release/android/GuessThe11.apk`
- **Google Play App Bundle (AAB)**: `release/android/GuessThe11.aab`
- **Native Android Project Directory**: `client/android/`

---

## 📲 How to Install the APK on Your Android Device

### Method 1: Direct File Download & Sideload (Easiest)

1. Copy `GuessThe11.apk` to your Android device via USB cable, Google Drive, or local server.
2. Open the **Files** or **Downloads** app on your Android device.
3. Tap on `GuessThe11.apk`.
4. If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*:
   - Tap **Settings**.
   - Toggle **Allow from this source** to ON.
5. Tap **Install**.
6. Tap **Open** to launch **GUESS THE 11**!

### Method 2: Install via ADB (Android Debug Bridge)

Connect your Android phone with **USB Debugging** enabled in Developer Options:

```bash
adb install -r release/android/GuessThe11.apk
```

To launch immediately via ADB:

```bash
adb shell am start -n com.guessthe11.game/.MainActivity
```

---

## 🛠️ How to Compile / Build APK and AAB from Source

### Prerequisites:
- Java JDK 17+ installed (`java -version`)
- Android SDK installed or Android Studio
- Node.js 18+ and npm

### Step-by-Step Commands:

```bash
# 1. From the project root, build client web assets:
npm run build:client

# 2. Synchronize assets with Capacitor Android:
cd client
npx cap sync android

# 3. Build APK and App Bundle using Gradle:
cd android

# On Windows:
.\gradlew.bat assembleRelease
.\gradlew.bat bundleRelease

# On Linux/macOS:
chmod +x gradlew
./gradlew assembleRelease bundleRelease
```

Generated binary locations:
- APK: `client/android/app/build/outputs/apk/release/app-release-unsigned.apk`
- AAB: `client/android/app/build/outputs/bundle/release/app-release.aab`

---

## 🔐 Production Keystore & Release Signing

To sign the APK for commercial distribution:

```bash
# 1. Generate a production keystore (one-time):
keytool -genkey -v -keystore guessthe11-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias guessthe11

# 2. Sign the APK using apksigner:
apksigner sign --ks guessthe11-release.jks --out release/android/GuessThe11-signed.apk client/android/app/build/outputs/apk/release/app-release-unsigned.apk

# 3. Verify signature:
apksigner verify release/android/GuessThe11-signed.apk
```

---

## 🚀 Google Play Store Submission (AAB)

1. Sign in to [Google Play Console](https://play.google.com/console).
2. Create app: **GUESS THE 11**.
3. Category: **Games / Casual / Word / Multiplayer**.
4. Go to **Production** > **Create new release**.
5. Upload `release/android/GuessThe11.aab`.
6. Add Privacy Policy, Content Rating (Everyone / PEGI 3), and Store Screenshots.
7. Submit for Google Play Review!
