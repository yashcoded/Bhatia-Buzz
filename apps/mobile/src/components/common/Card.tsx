import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius, Spacing, Shadows } from '../../constants/theme';
import { useTheme } from '../../utils/theme';

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
  highlightColor,
  style,
  padding = Spacing.small,
}) => {
  const { colors } = useTheme();
  const accent = highlightColor ?? colors.tertiary;
  const getCardStyle = () => {
    switch (variant) {
      case 'highlighted':
        return {
          backgroundColor: accent + '14',
          borderColor: accent + '33',
        };
      case 'premium':
        return {
          backgroundColor: colors.tertiary,
          ...Shadows.dramatic,
        };
      default:
        return {
          backgroundColor: colors.primaryBackground,
          borderColor: colors.alternate,
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

