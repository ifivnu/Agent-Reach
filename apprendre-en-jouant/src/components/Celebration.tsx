import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const PARTICLES = ['⭐', '🌟', '✨', '🎉', '⭐', '🌟', '✨', '🎈'];

function Particle({ index, total }: { index: number; total: number }) {
  const progress = useSharedValue(0);
  const angle = (index / total) * Math.PI * 2;

  useEffect(() => {
    progress.value = withDelay(index * 25, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [index, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value * 0.9,
    transform: [
      { translateX: Math.cos(angle) * 140 * progress.value },
      { translateY: Math.sin(angle) * 140 * progress.value },
      { scale: 0.6 + progress.value },
      { rotate: `${progress.value * 180}deg` },
    ],
  }));

  return <Animated.Text style={[styles.particle, style]}>{PARTICLES[index % PARTICLES.length]}</Animated.Text>;
}

/** Explosion d'étoiles au centre de l'écran quand un exercice est réussi. */
export function Celebration() {
  const pop = useSharedValue(0);
  useEffect(() => {
    pop.value = withSequence(withTiming(1.4, { duration: 250 }), withTiming(1, { duration: 200 }));
  }, [pop]);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {PARTICLES.map((_, i) => (
        <Particle key={i} index={i} total={PARTICLES.length} />
      ))}
      <Animated.Text style={[styles.big, popStyle]}>🏆</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute', fontSize: 40 },
  big: { fontSize: 96 },
});
