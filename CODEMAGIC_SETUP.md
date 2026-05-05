# Codemagic iOS TestFlight Setup Guide

## Overview
This `codemagic.yaml` file contains all configuration needed to build and submit your iOS app to TestFlight. All credentials are embedded directly in the YAML file for convenience.

## ⚠️ Security Warning
**Important**: This approach stores sensitive credentials directly in the YAML file. Only use this if:
- Your repository is **private**
- You understand the security implications
- You rotate credentials regularly

For better security, consider using Codemagic's encrypted environment variables instead.

## Required Credentials to Replace

Replace all placeholder values in `codemagic.yaml` with your actual credentials:

### 1. App Information
- `BUNDLE_ID`: Your app's bundle identifier (e.g., `com.company.app`)
- `XCODE_WORKSPACE`: Your Xcode workspace filename (e.g., `App.xcworkspace`)
- `XCODE_SCHEME`: Your Xcode scheme name (e.g., `App`)
- `IPA_NAME`: Desired IPA filename (e.g., `App.ipa`)

### 2. Apple Developer Account
- `DEVELOPMENT_TEAM`: Your 10-character Apple Team ID
- `CODE_SIGNING_IDENTITY`: Your distribution certificate name (e.g., `iPhone Distribution: Company Name`)
- `PROVISIONING_PROFILE_UUID`: Your provisioning profile UUID

### 3. Certificates & Profiles
- `IOS_CERTIFICATE`: Your `.p12` distribution certificate (base64 encoded)
  ```bash
  # Convert p12 to base64
  base64 -i YourCertificate.p12
  ```
- `IOS_CERTIFICATE_PASSWORD`: Password for your `.p12` file
- `IOS_PROVISIONING_PROFILE`: Your App Store provisioning profile (base64 encoded)
  ```bash
  # Convert mobileprovision to base64
  base64 -i YourProfile.mobileprovision
  ```

### 4. App Store Connect API Key
Generate an API key at [App Store Connect](https://appstoreconnect.apple.com/access/api):
- `APP_STORE_CONNECT_API_KEY_ID`: Key ID (e.g., `ABC1234567`)
- `APP_STORE_CONNECT_API_ISSUER_ID`: Issuer ID (UUID format)
- `APP_STORE_CONNECT_API_KEY_CONTENT`: Full private key content
  ```
  -----BEGIN PRIVATE KEY-----
  YourKeyContentHere
  -----END PRIVATE KEY-----
  ```

## How to Get These Credentials

### 1. Create Distribution Certificate
1. Go to Apple Developer Portal → Certificates, IDs & Profiles
2. Create a new "Apple Distribution" certificate
3. Download and export as `.p12` with a password

### 2. Create Provisioning Profile
1. Go to Apple Developer Portal → Certificates, IDs & Profiles
2. Create a new "App Store" provisioning profile
3. Select your App ID and Distribution certificate
4. Download the `.mobileprovision` file
5. Get UUID: `grep UUID YourProfile.mobileprovision`

### 3. Generate App Store Connect API Key
1. Go to App Store Connect → Users and Access → Keys
2. Click "+" to create a new API key
3. Give it a name, select "Admin" access
4. Download the `.p8` file and note the Key ID and Issuer ID
5. Copy the entire content of the `.p8` file

## Workflow Triggers
The workflow automatically runs on:
- Pushes to `main` branch
- Pushes to `release/*` branches
- Tags matching `v*` pattern (e.g., `v1.0.0`, `v2.1.3`)

## Build Process
1. Install Node.js dependencies
2. Build web app (`npm run build`)
3. Sync Capacitor iOS project
4. Install CocoaPods dependencies
5. Set up keychain with certificates
6. Build and archive iOS app
7. Export IPA for App Store
8. Upload to TestFlight automatically

## Usage
1. Replace all placeholder values in `codemagic.yaml`
2. Commit and push to your repository
3. Connect your repo to Codemagic at https://codemagic.io
4. Builds will trigger automatically based on the patterns above

## Troubleshooting

### Common Issues
- **Certificate errors**: Ensure P12 password is correct
- **Provisioning profile mismatch**: Verify Bundle ID matches exactly
- **API key authentication**: Check Key ID and Issuer ID are correct
- **Build failures**: Ensure Xcode version is compatible

### Support
- Codemagic Docs: https://docs.codemagic.io
- Apple Developer: https://developer.apple.com
