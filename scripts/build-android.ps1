# GUESS THE 11 - Android Automated Build Script (PowerShell)
# Requires: Java JDK 17+ and Android SDK

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Building GUESS THE 11 - Android Production " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Build Client Web App
Write-Host "`n[1/4] Building Client Production Bundle..." -ForegroundColor Yellow
cd client
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Client build failed!" -ForegroundColor Red
    exit 1
}

# 2. Sync with Capacitor Android
Write-Host "`n[2/4] Syncing Capacitor Android assets..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Capacitor sync failed!" -ForegroundColor Red
    exit 1
}

# 3. Assemble Release APK & Bundle (AAB)
Write-Host "`n[3/4] Running Gradle Release Build..." -ForegroundColor Yellow
cd android
if (Test-Path "gradlew.bat") {
    .\gradlew.bat assembleRelease bundleRelease
} else {
    Write-Host "gradlew.bat not found in android directory!" -ForegroundColor Red
    exit 1
}

# 4. Copy to release folder
cd ..\..
Write-Host "`n[4/4] Copying outputs to release/android/..." -ForegroundColor Yellow
if (-not (Test-Path "release\android")) {
    New-Item -ItemType Directory -Path "release\android" -Force | Out-Null
}

$apkSource = "client\android\app\build\outputs\apk\release\app-release-unsigned.apk"
$aabSource = "client\android\app\build\outputs\bundle\release\app-release.aab"

if (Test-Path $apkSource) {
    Copy-Item $apkSource "release\android\GuessThe11.apk" -Force
    Write-Host "✅ APK copied to release/android/GuessThe11.apk" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Release APK path not found, check build outputs." -ForegroundColor Yellow
}

if (Test-Path $aabSource) {
    Copy-Item $aabSource "release\android\GuessThe11.aab" -Force
    Write-Host "✅ AAB copied to release/android/GuessThe11.aab" -ForegroundColor Green
}

Write-Host "`n🎉 Android Build Pipeline Completed Successfully!" -ForegroundColor Green
