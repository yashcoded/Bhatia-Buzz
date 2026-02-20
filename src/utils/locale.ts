import * as Localization from 'expo-localization';

/**
 * Get the current device locale
 */
export const getDeviceLocale = (): string => {
  return Localization.locale || 'en-US';
};

/**
 * Get the language code (e.g., 'en' from 'en-US')
 */
export const getLanguageCode = (): string => {
  const locale = getDeviceLocale();
  return locale.split('-')[0];
};

/**
 * Format date according to locale
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getDeviceLocale();
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
};

/**
 * Format date in short format (DD/MM/YYYY or MM/DD/YYYY based on locale)
 */
export const formatDateShort = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getDeviceLocale();
  
  // Use numeric format for short dates
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(dateObj);
};

/**
 * Format time according to locale
 */
export const formatTime = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const locale = getDeviceLocale();
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
};

/**
 * Format number according to locale
 */
export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  const locale = getDeviceLocale();
  
  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };

  return new Intl.NumberFormat(locale, options || defaultOptions).format(value);
};

/**
 * Format currency according to locale
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const locale = getDeviceLocale();
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const locale = getDeviceLocale();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
};
