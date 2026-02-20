import { useWindowDimensions } from 'react-native';
import { Layout } from '../constants/theme';

/**
 * Returns dimensions and responsive values so the app looks good on phone and tablet/iPad.
 * Use contentWidth for feed, cards, and forms so they don't stretch to full tablet width.
 */
export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= Layout.tabletMinWidth;
  const contentWidth = Math.min(width, Layout.maxContentWidth);
  return { width, height, contentWidth, isTablet };
}
