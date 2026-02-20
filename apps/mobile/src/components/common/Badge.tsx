import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  uppercase?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  color = Colors.tertiary,
  uppercase = true,
  style,
  textStyle,
}) => {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + '1A', // 0.1 opacity
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color,
          },
          textStyle,
        ]}
      >
        {uppercase ? label.toUpperCase() : label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.pill,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...Typography.label5,
    fontFamily: 'Outfit-SemiBold',
  },
});

export default Badge;

