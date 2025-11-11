import { useState, useEffect, useCallback } from 'react';
import AdMobService from '../services/AdMobService';

export interface UseInterstitialAdReturn {
  showAd: () => Promise<boolean>;
  isAdReady: boolean;
  preloadAd: () => void;
}

/**
 * Custom hook for managing interstitial ads
 */
export const useInterstitialAd = (): UseInterstitialAdReturn => {
  const [isAdReady, setIsAdReady] = useState<boolean>(false);

  // Check ad status periodically
  useEffect(() => {
    const checkAdStatus = () => {
      setIsAdReady(AdMobService.isInterstitialAdReady());
    };

    // Check immediately
    checkAdStatus();

    // Check every 2 seconds
    const interval = setInterval(checkAdStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  const showAd = useCallback(async (): Promise<boolean> => {
    const result = await AdMobService.showInterstitialAd();
    // Update status after showing
    setTimeout(() => {
      setIsAdReady(AdMobService.isInterstitialAdReady());
    }, 100);
    return result;
  }, []);

  const preloadAd = useCallback((): void => {
    AdMobService.preloadInterstitialAd();
  }, []);

  return {
    showAd,
    isAdReady,
    preloadAd,
  };
};