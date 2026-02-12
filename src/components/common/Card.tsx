import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'standard' | 'highlighted' | 'premium';
  highlightColor?: string;
  style?: ViewStyle;
  padding?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'standard',
  highlightColor = Colors.tertiary,
  style,
  padding = Spacing.small,
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'highlighted':
        return {
          backgroundColor: highlightColor + '14', // 0.08 opacity in hex
          borderColor: highlightColor + '33', // 0.2 opacity
        };
      case 'premium':
        return {
          backgroundColor: Colors.tertiary,
          ...Shadows.dramatic,
        };
      default:
        return {
          backgroundColor: Colors.primaryBackground,
          borderColor: Colors.alternate,
        };
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          padding,
          ...getCardStyle(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    ...Shadows.subtle,
  },
});

export default Card;

