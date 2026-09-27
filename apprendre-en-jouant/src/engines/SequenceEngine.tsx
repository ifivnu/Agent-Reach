import { useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, ZoomIn, ZoomOut } from 'react-native-reanimated';

import { BigButton } from '../components/BigButton';
import type { EngineProps, SequenceExercise } from '../domain/types';
import { colors, radius } from '../theme';

const GAP = 8;

/**
 * Moteur « remettre dans l'ordre » : l'enfant touche les éléments dans l'ordre attendu ;
 * chacun vient se ranger dans la case suivante. Sert aux histoires en images, aux nombres
 * à classer et aux mots mélangés.
 */
export function SequenceEngine({ exercise, onSolved, onMistake }: EngineProps<SequenceExercise>) {
  const [width, setWidth] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const n = exercise.ordered.length;
  const size = width ? Math.min(88, (width - GAP * (n - 1)) / n) : 0;
  const isText = !exercise.ordered.some((s) => /\p{Extended_Pictographic}/u.test(s));

  // Rang attendu de chaque élément mélangé (utile aux tests automatiques ; gère les lettres répétées).
  const rankOf = useMemo(() => {
    const used = new Set<number>();
    return exercise.shuffled.map((item) => {
      const r = exercise.ordered.findIndex((o, i) => o === item && !used.has(i));
      used.add(r);
      return r;
    });
  }, [exercise]);

  const tap = (index: number): boolean => {
    if (placed.includes(index)) return true;
    const expected = exercise.ordered[placed.length];
    if (exercise.shuffled[index] !== expected) {
      onMistake();
      return false;
    }
    const next = [...placed, index];
    setPlaced(next);
    if (next.length === n) onSolved();
    return true;
  };

  const fontSize = size * (isText ? 0.5 : 0.6);
  return (
    <View style={styles.container} onLayout={(e: LayoutChangeEvent) => setWidth(Math.min(e.nativeEvent.layout.width, 640))}>
      {exercise.emoji ? (
        <Animated.Text entering={ZoomIn.springify()} style={styles.hint}>
          {exercise.emoji}
        </Animated.Text>
      ) : null}

      <View style={styles.row}>
        {size > 0 &&
          exercise.ordered.map((_, slot) => {
            const item = placed[slot];
            return (
              <View key={slot} style={[styles.slot, { width: size, height: size }]}>
                {item === undefined ? (
                  <Text style={styles.slotNumber}>{slot + 1}</Text>
                ) : (
                  <Animated.Text entering={ZoomIn.springify()} style={[styles.item, { fontSize }]}>
                    {exercise.shuffled[item]}
                  </Animated.Text>
                )}
              </View>
            );
          })}
      </View>

      <View style={styles.row}>
        {size > 0 &&
          exercise.shuffled.map((item, index) =>
            placed.includes(index) ? (
              <View key={index} style={{ width: size, height: size }} />
            ) : (
              <PoolItem key={index} testID={`seq-${rankOf[index]}`} label={item} size={size} fontSize={fontSize} onPress={() => tap(index)} />
            ),
          )}
      </View>
    </View>
  );
}

function PoolItem({ label, size, fontSize, onPress, testID }: { label: string; size: number; fontSize: number; onPress: () => boolean; testID: string }) {
  const shake = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  return (
    <Animated.View entering={ZoomIn.springify()} exiting={ZoomOut} style={style}>
      <BigButton
        testID={testID}
        accessibilityLabel={label}
        onPress={() => {
          if (!onPress()) {
            shake.value = withSequence(withTiming(-10, { duration: 50 }), withRepeat(withTiming(10, { duration: 80 }), 4, true), withTiming(0, { duration: 50 }));
          }
        }}
        style={{ width: size, height: size, minWidth: 0, minHeight: 0, padding: 0 }}
      >
        <Text style={[styles.item, { fontSize }]}>{label}</Text>
      </BigButton>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'space-evenly' },
  hint: { fontSize: 100 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: GAP },
  slot: {
    borderRadius: radius.sm,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.slot,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotNumber: { fontSize: 20, fontWeight: '800', color: colors.textMuted },
  item: { fontWeight: '800', color: colors.text },
});
