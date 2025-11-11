# GitHub Secrets Setup Guide

## Your Keystore Information

You've just generated a keystore file with these details:

- **Keystore file**: `release.keystore` (in your project root)
- **Alias**: `halal-checker-key`
- **Keystore password**: [the password you just entered]
- **Key password**: [same as keystore password by default]

## Required GitHub Secrets

Go to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

Add these 5 secrets:

### 1. ANDROID_KEYSTORE
**Value**: The base64 encoded keystore (already copied to your clipboard!)
- Just paste what's in your clipboard
- This is the base64 encoded version of your `release.keystore` file

### 2. ANDROID_KEY_ALIAS
**Value**: `halal-checker-key`

### 3. ANDROID_KEYSTORE_PASSWORD
**Value**: [the password you entered when creating the keystore]

### 4. ANDROID_KEY_PASSWORD
**Value**: [same as keystore password - the password you entered]

### 5. EXPO_TOKEN
**Value**: [Get this from https://expo.dev]

To get your Expo token:
1. Go to https://expo.dev
2. Sign in to your account
3. Go to Account Settings → Access Tokens
4. Create a new token
5. Copy and paste it as the secret value

## Important Security Notes

⚠️ **KEEP YOUR KEYSTORE SAFE!**
- **Backup** the `release.keystore` file somewhere secure (NOT in git!)
- If you lose this keystore, you **cannot update your app** on Google Play Store
- Store the password securely (use a password manager)

## Add to .gitignore

The keystore file should NEVER be committed to git. Let me check if it's already ignored...

```bash
echo "release.keystore" >> .gitignore
```

## Test Your Setup

After adding all secrets to GitHub:
1. Commit and push your workflow changes
2. Go to Actions tab in your GitHub repository
3. Watch the build process
4. Download the APK/AAB from the artifacts when complete

## If You Need to Re-encode the Keystore

If you need to copy the base64 keystore again:
```bash
base64 -i release.keystore | pbcopy
```

## Keystore Details for Reference

Store this information securely:
- **Keystore Location**: `release.keystore`
- **Alias**: `halal-checker-key`
- **Algorithm**: RSA
- **Key Size**: 2048 bits
- **Validity**: 10,000 days (~27 years)
- **Store Type**: PKCS12
