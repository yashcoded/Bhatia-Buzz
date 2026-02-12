import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useRTL, getFlexDirection } from '../../utils/rtl';

interface RTLViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * RTL-aware View component
 * Automatically handles RTL layout direction
 */
const RTLView: React.FC<RTLViewProps> = ({ children, style }) => {
  const isRTL = useRTL();
  const flexDirection = getFlexDirection();

  return (
    <View style={[{ flexDirection }, style]}>
      {children}
    </View>
  );
};

export default RTLView;
