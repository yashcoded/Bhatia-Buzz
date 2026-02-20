import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsiveLayout } from '../../utils/useResponsiveLayout';

interface ScreenContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** If true, content fills width on phone and is centered with max width on tablet. Default true. */
  responsive?: boolean;
}

/**
 * Wraps screen content so on tablet/iPad it doesn't stretch to full width.
 * Uses max content width and centers the block.
 */
const ScreenContent: React.FC<ScreenContentProps> = ({ children, style, responsive = true }) => {
  const { contentWidth, isTablet } = useResponsiveLayout();
  const responsiveStyle = responsive && isTablet
    ? { maxWidth: contentWidth, width: '100%' as const, alignSelf: 'center' as const }
    : undefined;
  return <View style={[responsive && responsiveStyle, style]}>{children}</View>;
};

export default ScreenContent;
