import { getLocales } from 'expo-localization';

/**
 * EU/EEA country codes (ISO 3166-1 alpha-2) where GDPR applies and
 * many jurisdictions require 16+ for consent without parental consent.
 * Greece: EL (ISO) and GR (common in locales) both included.
 */
const EU_EEA_COUNTRY_CODES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'EL', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI',
  'ES', 'SE', 'IS', 'LI', 'NO', 'UK', 'GB',
]);

export type AgeRequirement = {
  minAge: number;
  regionLabel: string;
  message: string;
  /** i18n key for localized message (auth.ageRequirementEU | auth.ageRequirement18 | auth.ageRequirementDefault) */
  messageKey: string;
};

/**
 * Get region (country code) from device locale only.
 * Uses expo-localization getLocales() - no permission required.
 */
export function getRegionFromLocale(): string | null {
  try {
    const locales = getLocales();
    const region = locales[0]?.regionCode ?? null;
    if (region && typeof region === 'string') return region.toUpperCase();
    // Fallback: parse from languageTag e.g. "en-US" -> "US"
    const tag = locales[0]?.languageTag;
    if (tag && tag.includes('-')) return tag.split('-')[1]?.toUpperCase() ?? null;
    return null;
  } catch {
    return null;
  }
}

/** Brazil: 18+ (LGPD / local norms). */
const BRAZIL_CODES = new Set(['BR']);
/** India: 18+ (IT Act / local norms). */
const INDIA_CODES = new Set(['IN']);

/**
 * Get age requirement (min age and message) for a given country/region code.
 * Aligns with GLOBAL_COMPLIANCE.md: EU/EEA 16+, Brazil 18+, India 18+, rest 13+ (e.g. COPPA).
 */
export function getAgeRequirementForRegion(regionCode: string | null): AgeRequirement {
  const code = regionCode?.toUpperCase() ?? '';

  if (BRAZIL_CODES.has(code)) {
    return {
      minAge: 18,
      regionLabel: 'Brazil',
      message: 'You must be at least 18 years old to use this app in your region.',
      messageKey: 'auth.ageRequirement18',
    };
  }
  if (INDIA_CODES.has(code)) {
    return {
      minAge: 18,
      regionLabel: 'India',
      message: 'You must be at least 18 years old to use this app in your region.',
      messageKey: 'auth.ageRequirement18',
    };
  }
  if (EU_EEA_COUNTRY_CODES.has(code)) {
    return {
      minAge: 16,
      regionLabel: 'EU/EEA',
      message:
        'You must be at least 16 years old to use this app in your region. Users under 16 require parental consent.',
      messageKey: 'auth.ageRequirementEU',
    };
  }

  return {
    minAge: 13,
    regionLabel: 'default',
    message: 'You must be at least 13 years old to use this app.',
    messageKey: 'auth.ageRequirementDefault',
  };
}

/**
 * Get current region from device locale and return age requirement.
 * Use this when you don't have or don't want to use GPS.
 */
export function getAgeRequirementFromLocale(): AgeRequirement {
  const region = getRegionFromLocale();
  return getAgeRequirementForRegion(region);
}

/**
 * Try to get region from GPS (with permission), then fall back to device locale.
 * Requires expo-location. On permission denied or error, uses locale.
 */
export async function getRegionWithLocation(): Promise<string | null> {
  try {
    const { requestForegroundPermissionsAsync, getCurrentPositionAsync, reverseGeocodeAsync } =
      await import('expo-location');
    const { status } = await requestForegroundPermissionsAsync();
    if (status !== 'granted') return getRegionFromLocale();
    const position = await getCurrentPositionAsync({ accuracy: 5 });
    const [address] = await reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    const country = (address as { isoCountryCode?: string })?.isoCountryCode ?? null;
    return country ? country.toUpperCase() : getRegionFromLocale();
  } catch {
    return getRegionFromLocale();
  }
}

/**
 * Get age requirement using GPS-based region when possible, else device locale.
 * Call this when you want region from location (e.g. on signup).
 * If expo-location is not installed or permission is denied, uses device locale.
 */
export async function getAgeRequirementWithLocation(): Promise<AgeRequirement> {
  try {
    const region = await getRegionWithLocation();
    return getAgeRequirementForRegion(region);
  } catch {
    return getAgeRequirementFromLocale();
  }
}
