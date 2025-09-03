# Huawei Device Troubleshooting Guide

## Common Issues on Huawei/Honor Devices

### 1. Buttons Not Working

**Cause**: Huawei uses HMS (Huawei Mobile Services) instead of Google Play Services, which can cause WebView compatibility issues.

**Solutions**:

1. **Update HMS Core**: Go to Huawei AppGallery > Search "HMS Core" > Update
2. **Clear WebView Data**: Settings > Apps > Android System WebView > Storage > Clear Data
3. **Update Huawei Browser**: AppGallery > Huawei Browser > Update
4. **Disable Battery Optimization**: Settings > Battery > App Launch > Find your app > Manage manually > Allow all

### 2. App Crashes or Won't Load

**Solutions**:

1. **Enable Developer Options**: Settings > About Phone > Tap Build Number 7 times
2. **Enable WebView Debugging**: Developer Options > Enable WebView debugging
3. **Disable Hardware Acceleration**: Developer Options > Disable HW overlays
4. **Reset Network Settings**: Settings > System > Reset > Reset Network Settings

### 3. Touch Events Not Responding

**Solutions**:

1. **Disable Edge Panels**: Settings > Smart assistance > Edge panels > Turn off
2. **Disable Knuckle Gestures**: Settings > Smart assistance > Motion control > Turn off knuckle gestures
3. **Clear System Cache**: Recovery Mode > Wipe Cache Partition

### 4. WebView Engine Issues

**Alternative Solutions**:

1. **Use Browser Fallback**: The app now includes an "Open in Browser" option
2. **Install Chrome**: Download Chrome from APKMirror if not available in AppGallery
3. **Use Huawei Browser**: Ensure Huawei Browser is set as default WebView

## Testing Steps

1. **Check Device Info**:

   ```bash
   npm run debug-huawei
   ```

2. **Test Network Connection**:

   ```bash
   npm run test-network
   ```

3. **Monitor Logs**:
   -  Enable USB Debugging
   -  Connect device via USB
   -  Run: `adb logcat | grep -i webview`

## Emergency Workaround

If WebView continues to fail, the app will automatically suggest opening in the default browser. This ensures users can still access the website functionality.

## Contact Information

If issues persist after trying all solutions, please provide:

1. Device model and EMUI version
2. HMS Core version
3. Error logs from `adb logcat`
4. Screenshots of the issue
