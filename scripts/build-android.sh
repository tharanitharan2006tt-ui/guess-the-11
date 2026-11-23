#!/bin/bash
set -e

echo "============================================="
echo " Building GUESS THE 11 - Android Production "
echo "============================================="

cd client
npm run build
npx cap sync android

cd android
chmod +x gradlew
./gradlew assembleRelease bundleRelease

cd ../..
mkdir -p release/android

cp client/android/app/build/outputs/apk/release/*.apk release/android/GuessThe11.apk 2>/dev/null || true
cp client/android/app/build/outputs/bundle/release/*.aab release/android/GuessThe11.aab 2>/dev/null || true

echo "✅ Android build finished. Check release/android/ directory."
