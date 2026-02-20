import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

/**
 * RTL (Right-to-Left) utility functions
 */

/**
 * Check if current language is RTL (Arabic, Hebrew, etc.)
 */
export const isRTL = (language?: string): boolean => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur']; // Arabic, Hebrew, Persian, Urdu
  if (language) {
    return rtlLanguages.includes(language);
  }
  // Check from i18next if available
  try {
    const { i18n } = require('react-i18next');
    return rtlLanguages.includes(i18n.language);
  } catch {
    return false;
  }
};

/**
 * Hook to get RTL status
 */
export const useRTL = (): boolean => {
  const { i18n } = useTranslation();
  return isRTL(i18n.language);
};

/**
 * Get text alignment style for RTL
 */
export const getTextAlign = (language?: string): 'left' | 'right' | 'auto' => {
  if (isRTL(language)) {
    return 'right';
  }
  return 'left';
};

/**
 * Get flex direction for RTL
 */
export const getFlexDirection = (language?: string): 'row' | 'row-reverse' => {
  if (isRTL(language)) {
    return 'row-reverse';
  }
  return 'row';
};

/**
 * Initialize RTL support (call this in App.tsx)
 */
export const initializeRTL = async (language: string): Promise<void> => {
  const rtl = isRTL(language);
  const isRTLCurrentlyEnabled = I18nManager.isRTL;

  if (rtl !== isRTLCurrentlyEnabled) {
    I18nManager.forceRTL(rtl);
    // On Android, need to restart the app for RTL to take effect
    if (Platform.OS === 'android') {
      // Note: In production, you might want to show a message to restart the app
      // For now, we'll just update the setting
      // Users will need to restart the app manually or you can use RNRestart
      console.log('RTL change detected. Please restart the app for changes to take effect.');
    }
  }
};

/**
 * Get margin/padding style for RTL
 */
export const getRTLMargin = (
  start: number,
  end: number = 0,
  language?: string
): { marginStart?: number; marginEnd?: number; marginLeft?: number; marginRight?: number } => {
  if (isRTL(language)) {
    return { marginStart: start, marginEnd: end };
  }
  return { marginLeft: start, marginRight: end };
};

/**
 * Get padding style for RTL
 */
export const getRTLPadding = (
  start: number,
  end: number = 0,
  language?: string
): { paddingStart?: number; paddingEnd?: number; paddingLeft?: number; paddingRight?: number } => {
  if (isRTL(language)) {
    return { paddingStart: start, paddingEnd: end };
  }
  return { paddingLeft: start, paddingRight: end };
};
