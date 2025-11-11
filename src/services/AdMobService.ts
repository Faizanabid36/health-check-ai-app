import { Platform } from 'react-native';
import MobileAds, {
  InterstitialAd,
  AppOpenAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

class AdMobService {
  private interstitialAd: InterstitialAd | null = null;
  private isAdLoaded: boolean = false;
  private appOpenAd: AppOpenAd | null = null;
  private isAppOpenAdLoaded: boolean = false;
  private isShowingAppOpenAd: boolean = false;

  // AdMob Configuration - Platform-specific ad unit IDs
  private readonly INTERSTITIAL_AD_UNIT_ID = Platform.select({
    android: 'ca-app-pub-1690988524107555/3480169917',
    ios: 'ca-app-pub-1690988524107555/4887237469',
  }) as string;

  private readonly APP_OPEN_AD_UNIT_ID = Platform.select({
    android: 'ca-app-pub-1690988524107555/6854817455',
    ios: 'ca-app-pub-1690988524107555/2174278365',
  }) as string;

  // Use test ad for development
  private readonly TEST_INTERSTITIAL_AD_UNIT_ID = TestIds.INTERSTITIAL;
  private readonly TEST_APP_OPEN_AD_UNIT_ID = TestIds.APP_OPEN;

  constructor() {
    this.initializeAdMob();
    this.createInterstitialAd();
    this.createAppOpenAd();
  }

  /**
   * Initialize AdMob SDK
   */
  private async initializeAdMob(): Promise<void> {
    try {
      await MobileAds().initialize();
      console.log('AdMob initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }

  /**
   * Create and configure interstitial ad
   */
  private createInterstitialAd(): void {
    // Use test ad in development, real ad in production
    const adUnitId = __DEV__
      ? this.TEST_INTERSTITIAL_AD_UNIT_ID
      : this.INTERSTITIAL_AD_UNIT_ID;

    this.interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true, // For GDPR compliance
    });

    this.setupAdEventListeners();
    this.loadAd();
  }

  /**
   * Setup event listeners for the interstitial ad
   */
  private setupAdEventListeners(): void {
    if (!this.interstitialAd) return;

    // Ad loaded successfully
    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
      this.isAdLoaded = true;
    });

    // Ad failed to load
    this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial ad failed to load:', error);
      this.isAdLoaded = false;
    });

    // Ad opened (shown to user)
    this.interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
      console.log('Interstitial ad opened');
    });

    // Ad closed by user
    this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      this.isAdLoaded = false;
      // Preload the next ad
      this.loadAd();
    });
  }

  /**
   * Load the interstitial ad
   */
  private loadAd(): void {
    if (this.interstitialAd && !this.isAdLoaded) {
      this.interstitialAd.load();
    }
  }

  /**
   * Show the interstitial ad if loaded
   * @returns Promise<boolean> - true if ad was shown, false otherwise
   */
  public async showInterstitialAd(): Promise<boolean> {
    if (this.interstitialAd && this.isAdLoaded) {
      try {
        await this.interstitialAd.show();
        return true;
      } catch (error) {
        console.error('Failed to show interstitial ad:', error);
        return false;
      }
    } else {
      console.log('Interstitial ad not loaded yet');
      // Try to load ad for next time
      this.loadAd();
      return false;
    }
  }

  /**
   * Check if interstitial ad is ready to show
   */
  public isInterstitialAdReady(): boolean {
    return this.isAdLoaded;
  }

  /**
   * Preload interstitial ad
   */
  public preloadInterstitialAd(): void {
    this.loadAd();
  }

  /**
   * Create and configure app open ad
   */
  private createAppOpenAd(): void {
    const adUnitId = __DEV__
      ? this.TEST_APP_OPEN_AD_UNIT_ID
      : this.APP_OPEN_AD_UNIT_ID;

    this.appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.setupAppOpenAdEventListeners();
    this.loadAppOpenAd();
  }

  /**
   * Setup event listeners for the app open ad
   */
  private setupAppOpenAdEventListeners(): void {
    if (!this.appOpenAd) return;

    this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('App open ad loaded');
      this.isAppOpenAdLoaded = true;
    });

    this.appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('App open ad failed to load:', error);
      this.isAppOpenAdLoaded = false;
      this.isShowingAppOpenAd = false;
    });

    this.appOpenAd.addAdEventListener(AdEventType.OPENED, () => {
      console.log('App open ad opened');
      this.isShowingAppOpenAd = true;
    });

    this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('App open ad closed');
      this.isAppOpenAdLoaded = false;
      this.isShowingAppOpenAd = false;
      // Preload the next ad
      this.loadAppOpenAd();
    });
  }

  /**
   * Load the app open ad
   */
  private loadAppOpenAd(): void {
    if (this.appOpenAd && !this.isAppOpenAdLoaded && !this.isShowingAppOpenAd) {
      this.appOpenAd.load();
    }
  }

  /**
   * Show the app open ad if loaded
   * @returns Promise<boolean> - true if ad was shown, false otherwise
   */
  public async showAppOpenAd(): Promise<boolean> {
    if (this.isShowingAppOpenAd) {
      console.log('App open ad is already being shown');
      return false;
    }

    if (this.appOpenAd && this.isAppOpenAdLoaded) {
      try {
        await this.appOpenAd.show();
        return true;
      } catch (error) {
        console.error('Failed to show app open ad:', error);
        this.isShowingAppOpenAd = false;
        return false;
      }
    } else {
      console.log('App open ad not loaded yet');
      this.loadAppOpenAd();
      return false;
    }
  }

  /**
   * Check if app open ad is ready to show
   */
  public isAppOpenAdReady(): boolean {
    return this.isAppOpenAdLoaded && !this.isShowingAppOpenAd;
  }

  /**
   * Preload app open ad
   */
  public preloadAppOpenAd(): void {
    this.loadAppOpenAd();
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    if (this.interstitialAd) {
      this.interstitialAd = null;
    }
    this.isAdLoaded = false;

    if (this.appOpenAd) {
      this.appOpenAd = null;
    }
    this.isAppOpenAdLoaded = false;
    this.isShowingAppOpenAd = false;
  }
}

// Export singleton instance
export default new AdMobService();