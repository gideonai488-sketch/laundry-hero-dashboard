# Android AAB setup (Laundry Hero Dashboard)

This project now includes Capacitor config and Android build scripts.

## 1) Install dependencies

```bash
npm install
```

## 2) Add Android project

```bash
npm run android:init
```

## 3) Set your app icon (the owl/laundry image)

1. Save the provided image as `android/app/src/main/res/app_icon_source.png` after `npm run android:init` creates the Android folder.
2. Open Android Studio:
   - `npm run android:open`
3. In Android Studio, run **Image Asset Studio**:
   - Right-click `app` → **New** → **Image Asset**
   - Icon Type: **Launcher Icons (Adaptive and Legacy)**
   - Foreground Layer: use `app_icon_source.png`
   - Background: white (`#FFFFFF`)
   - Name: `ic_launcher`
   - Finish and overwrite existing launcher icon assets.

This ensures users see your icon after installing from Google Play.

## 4) Configure release signing for Play Store

In `android/gradle.properties`:

```properties
MYAPP_UPLOAD_STORE_FILE=upload-keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=upload
MYAPP_UPLOAD_STORE_PASSWORD=***
MYAPP_UPLOAD_KEY_PASSWORD=***
```

In `android/app/build.gradle`, create and use a `release` signing config pointing to these values.

## 5) Build release AAB

```bash
npm run android:aab
```

Expected output:
`android/app/build/outputs/bundle/release/app-release.aab`
