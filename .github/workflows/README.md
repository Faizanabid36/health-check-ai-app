# GitHub Actions CI/CD Setup

This repository contains two CI/CD workflows for building Android APK and AAB files:

## Workflows

### 1. `android-build.yml` - Native Gradle Build
This workflow builds the app directly using Gradle after running `expo prebuild`. It produces both APK and AAB files as artifacts.

### 2. `eas-build.yml` - EAS Build (Recommended for Expo)
This workflow uses Expo Application Services (EAS) to build your app. It's simpler and better integrated with Expo projects.

## Required Secrets

### For EAS Build (Recommended)

1. **EXPO_TOKEN** (Required for both workflows)
   - Go to https://expo.dev/accounts/[your-account]/settings/access-tokens
   - Create a new token
   - Add it to GitHub Secrets: Settings > Secrets and variables > Actions > New repository secret

### For Native Gradle Build (android-build.yml)

If you want to use the native Gradle build workflow, you'll need these additional secrets:

1. **EXPO_TOKEN** - Same as above

2. **ANDROID_KEYSTORE** - Base64 encoded keystore file
   ```bash
   # Generate a keystore if you don't have one
   keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore \
     -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

   # Encode it to base64
   base64 -i release.keystore | pbcopy  # macOS
   # or
   base64 release.keystore | xclip -selection clipboard  # Linux
   ```

3. **ANDROID_KEY_ALIAS** - The alias you used when creating the keystore (e.g., `my-key-alias`)

4. **ANDROID_KEYSTORE_PASSWORD** - The store password you set

5. **ANDROID_KEY_PASSWORD** - The key password you set

## Setting up GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to: Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with its corresponding value

## Configuring EAS for Production Builds

For production builds with EAS, you need to configure credentials:

```bash
# Login to EAS
eas login

# Configure Android credentials
eas credentials
```

Follow the prompts to upload your keystore or let EAS generate one for you.

## Triggering Builds

### Automatic Triggers
- Push to `main` or `develop` branch
- Pull request to `main` or `develop` branch

### Manual Trigger
- Go to Actions tab
- Select the workflow you want to run
- Click "Run workflow"
- Choose the build profile (for EAS Build workflow)

## Build Artifacts

### android-build.yml
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- Both files are uploaded as artifacts and kept for 30 days

### eas-build.yml
- Builds are managed by EAS and can be downloaded from expo.dev
- Check your build status at: https://expo.dev/accounts/[your-account]/projects/[your-project]/builds

## Creating GitHub Releases

When you create a tag and push it, the android-build.yml workflow will automatically create a GitHub release with the APK and AAB files attached.

```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0
```

## Updating Build Configuration

### For APK builds
Edit the `preview` profile in `eas.json`:
```json
"preview": {
  "android": {
    "buildType": "apk"
  }
}
```

### For AAB builds (Google Play Store)
Edit the `production` profile in `eas.json`:
```json
"production": {
  "android": {
    "buildType": "aab"
  }
}
```

## Troubleshooting

### Build fails with "EXPO_TOKEN not found"
- Make sure you've added the EXPO_TOKEN secret to your repository

### Keystore errors in android-build.yml
- Verify all Android keystore secrets are correctly set
- Ensure the keystore is base64 encoded properly

### EAS build stuck or not starting
- Check your EAS subscription limits at expo.dev
- Verify the EXPO_TOKEN has the correct permissions

### Gradle build failures
- Check the Android gradle configuration
- Ensure all native dependencies are compatible with your Expo SDK version

## Recommendations

For Expo projects, **EAS Build (eas-build.yml) is recommended** because:
- Simpler setup (only needs EXPO_TOKEN)
- Better integration with Expo ecosystem
- Handles credentials management automatically
- More reliable builds in the cloud
- Supports both APK and AAB builds based on profile configuration

Use the native Gradle build (android-build.yml) only if you need:
- More control over the build process
- Custom native code modifications
- Builds without EAS subscription limits
