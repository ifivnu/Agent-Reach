import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

/** Progression de la série : une étoile par exercice réussi. */
export function StarBar({ total, earned }: { total: number; earned: number }) {
  return (
    <View style={styles.row} testID="starbar" accessibilityLabel={`${earned}/${total}`}>
      {Array.from({ length: total }, (_, i) =>
        i < earned ? (
          <Animated.Text key={`on-${i}`} entering={ZoomIn.springify()} style={styles.star}>
            ⭐
          </Animated.Text>
        ) : (
          <Text key={`off-${i}`} style={[styles.star, styles.off]}>
            ☆
          </Text>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  star: { fontSize: 28, width: 34, textAlign: 'center' },
  off: { color: '#C9B8A3' },
});
