import { useColorScheme } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { getThemeColors, type ColorScheme } from '../constants/theme';

/**
 * Returns the effective color scheme and theme colors based on user preference.
 * When preference is 'system', uses the device's color scheme (notch/screen).
 */
export function useTheme() {
  const systemScheme = useColorScheme();
  const preference = useAppSelector((state) => state.appearance.preference);

  const scheme: ColorScheme =
    preference === 'system' ? (systemScheme ?? 'light') : preference;
  const colors = getThemeColors(scheme);
  const isDark = scheme === 'dark';

  return { scheme, colors, isDark };
}
