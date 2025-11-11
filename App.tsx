import { WebView } from "react-native-webview";
import React from "react";
import {
  View,
  ActivityIndicator,
  Text,
  Button,
  PermissionsAndroid,
  Platform,
  Linking,
  StyleSheet,
  AppState,
  AppStateStatus,
} from "react-native";
import { Camera } from "expo-camera";
import { useInterstitialAd } from "./src";
import * as SplashScreen from "expo-splash-screen";
import AdMobService from "./src/services/AdMobService";

export default function App() {
  const [ready, setReady] = React.useState(true);
  const [appIsReady, setAppIsReady] = React.useState(false);
  const appState = React.useRef(AppState.currentState);
  const [appHasLaunched, setAppHasLaunched] = React.useState(false);

  // AdMob hook for interstitial ads
  const { showAd, isAdReady, preloadAd } = useInterstitialAd();

  React.useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // For now, we'll just simulate some loading time
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Tell the application to render
        setAppIsReady(true);
        setAppHasLaunched(true);
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the splash screen to hide immediately! If we call this after
        // `setAppIsReady`, then we may see a blank screen while the app is
        // loading its initial state and rendering its first pixels. So instead,
        // we hide the splash screen once we know the root view has already
        // performed layout.
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // App Open Ad - Show when app comes to foreground
  React.useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        // Only show ad when transitioning from background/inactive to active
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active" &&
          appHasLaunched // Don't show on first launch
        ) {
          console.log("App has come to the foreground - showing app open ad");
          const adShown = await AdMobService.showAppOpenAd();
          if (adShown) {
            console.log("App open ad was shown successfully");
          } else {
            console.log("App open ad was not ready");
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [appHasLaunched]);

  const onMessage = async (event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log("Message received from WebView:", data);
    if (data.type === "DETECT_INGREDIENTS") {
      console.log("Showing interstitial ad...");
      const adShown = await showAd();
      preloadAd(); // Preload the next ad
      if (adShown) {
        console.log("Interstitial ad was shown successfully");
      } else {
        console.log("Interstitial ad was not ready or failed to show");
      }
      setReady(false);
    }
  };

  const [webUrl] = React.useState("https://health-check-ai-mu.vercel.app/");
  const [permissionGranted, setPermissionGranted] = React.useState<
    null | boolean
  >(null);

  React.useEffect(() => {
    (async () => {
      try {
        // Request camera permission via expo-camera
        const { status } = await Camera.requestCameraPermissionsAsync();

        // On Android, also request RECORD_AUDIO for microphone capture
        let micGranted = true;
        if (Platform.OS === "android") {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );
          micGranted = result === PermissionsAndroid.RESULTS.GRANTED;
        }

        setPermissionGranted(status === "granted" && micGranted);
      } catch (e) {
        console.warn("Permission request error:", e);
        setPermissionGranted(false);
      }
    })();
  }, []);

  if (permissionGranted === null) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  if (permissionGranted === false) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12, textAlign: "center" }}>
          Camera or microphone permission was not granted. Please enable camera
          and microphone permissions for this app in Settings.
        </Text>
        <Button
          title="Open Settings"
          onPress={() => {
            if (Platform.OS === "ios") {
              Linking.openURL("app-settings:");
            } else {
              Linking.openSettings();
            }
          }}
        />
      </View>
    );
  }

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: webUrl }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mediaCapturePermissionGrantType="grant"
        onMessage={onMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
