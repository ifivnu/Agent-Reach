import type { ReactNode } from 'react';
import { Pressable, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { MIN_TOUCH, radius, shadow } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  onPress: () => void;
  children: ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  disabled?: boolean;
  testID?: string;
};

/** Gros bouton qui « s'enfonce » au toucher ou au clic. */
export function BigButton({ onPress, children, color = '#fff', style, accessibilityLabel, disabled, testID }: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.92))}
      onPressOut={() => (scale.value = withSpring(1))}
      style={[styles.base, { backgroundColor: color }, animated, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: MIN_TOUCH,
    minHeight: MIN_TOUCH,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    ...shadow,
  },
});
