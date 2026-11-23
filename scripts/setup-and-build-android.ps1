$ErrorActionPreference = "Stop"

$baseToolsDir = "C:\Users\thara\.android-build-tools"
if (-not (Test-Path $baseToolsDir)) {
    New-Item -ItemType Directory -Path $baseToolsDir -Force | Out-Null
}

$jdkZip = Join-Path $baseToolsDir "jdk17.zip"
$jdkDir = Join-Path $baseToolsDir "jdk17"
$cmdlineZip = Join-Path $baseToolsDir "cmdline-tools.zip"
$sdkDir = Join-Path $baseToolsDir "android-sdk"

# 1. Download & Extract JDK 17
if (-not (Test-Path $jdkDir)) {
    Write-Host "Downloading OpenJDK 17..." -ForegroundColor Cyan
    $jdkUrl = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.11%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.11_9.zip"
    Invoke-WebRequest -Uri $jdkUrl -OutFile $jdkZip -UseBasicParsing
    Write-Host "Extracting OpenJDK 17..." -ForegroundColor Cyan
    Expand-Archive -Path $jdkZip -DestinationPath $baseToolsDir -Force
    $extractedJdk = Get-ChildItem -Path $baseToolsDir -Filter "jdk-17*" | Select-Object -First 1
    if ($extractedJdk) {
        Rename-Item $extractedJdk.FullName -NewName "jdk17"
    }
    Remove-Item $jdkZip -Force -ErrorAction SilentlyContinue
}

$env:JAVA_HOME = $jdkDir
$env:Path = "$jdkDir\bin;" + $env:Path
Write-Host "Java version:" -ForegroundColor Green
& "$jdkDir\bin\java.exe" -version

# 2. Download & Extract Android Commandline Tools
$latestCmdlineDir = Join-Path $sdkDir "cmdline-tools\latest"
if (-not (Test-Path $latestCmdlineDir)) {
    Write-Host "Downloading Android Commandline Tools..." -ForegroundColor Cyan
    $cmdlineUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    Invoke-WebRequest -Uri $cmdlineUrl -OutFile $cmdlineZip -UseBasicParsing
    Write-Host "Extracting Commandline Tools..." -ForegroundColor Cyan
    $tempExtract = Join-Path $baseToolsDir "cmdline-temp"
    Expand-Archive -Path $cmdlineZip -DestinationPath $tempExtract -Force
    
    New-Item -ItemType Directory -Path $latestCmdlineDir -Force | Out-Null
    Copy-Item -Path "$tempExtract\cmdline-tools\*" -Destination $latestCmdlineDir -Recurse -Force
    Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item $cmdlineZip -Force -ErrorAction SilentlyContinue
}

$env:ANDROID_HOME = $sdkDir
$env:ANDROID_SDK_ROOT = $sdkDir
$sdkManager = "$latestCmdlineDir\bin\sdkmanager.bat"

Write-Host "Accepting Android Licenses & Installing Build Tools..." -ForegroundColor Cyan
& cmd.exe /c "echo y | `"$sdkManager`" --sdk_root=`"$sdkDir`" --licenses"
& "$sdkManager" --sdk_root="$sdkDir" "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# 3. Create local.properties in client/android
$localProperties = "client\android\local.properties"
Set-Content -Path $localProperties -Value "sdk.dir=$($sdkDir.Replace('\', '\\'))"

# 4. Build APK & AAB
Write-Host "Running Gradle Build..." -ForegroundColor Green
Set-Location "client\android"
.\gradlew.bat assembleRelease bundleRelease

# 5. Copy to release
Set-Location "..\.."
$releaseDir = "release\android"
if (-not (Test-Path $releaseDir)) {
    New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null
}

$apkOut = Get-ChildItem -Path "client\android\app\build\outputs\apk" -Filter "*.apk" -Recurse | Select-Object -First 1
$aabOut = Get-ChildItem -Path "client\android\app\build\outputs\bundle" -Filter "*.aab" -Recurse | Select-Object -First 1

if ($apkOut) {
    Copy-Item $apkOut.FullName "$releaseDir\GuessThe11.apk" -Force
    Write-Host "✅ Created: $releaseDir\GuessThe11.apk" -ForegroundColor Green
}
if ($aabOut) {
    Copy-Item $aabOut.FullName "$releaseDir\GuessThe11.aab" -Force
    Write-Host "✅ Created: $releaseDir\GuessThe11.aab" -ForegroundColor Green
}
