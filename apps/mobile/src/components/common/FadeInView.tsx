import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Animation } from '../../constants/theme';

interface FadeInViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Duration in ms. Default from theme. */
  duration?: number;
  /** Delay before starting, for staggered lists. */
  delay?: number;
  /** Slight upward motion on appear (e.g. for list items). */
  slideUp?: boolean;
}

/**
 * Wraps content in an animated view that fades in on mount.
 * Use for screen content or list items to make transitions feel smoother.
 */
const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  style,
  duration = Animation.standard,
  delay = 0,
  slideUp = false,
}) => {
  const entering = slideUp
    ? FadeInUp.duration(duration).delay(delay).springify().damping(18).mass(0.8)
    : FadeIn.duration(duration).delay(delay);

  return (
    <Animated.View style={style} entering={entering}>
      {children}
    </Animated.View>
  );
};

export default FadeInView;
