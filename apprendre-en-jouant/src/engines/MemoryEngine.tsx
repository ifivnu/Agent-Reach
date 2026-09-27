import { useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import type { EngineProps, MemoryExercise } from '../domain/types';
import { colors, radius, shadow } from '../theme';

const GAP = 10;
const MISMATCH_MS = 900;

/**
 * Moteur « mémoire » : retourner deux cartes, garder les paires.
 * Les deux cartes d'une paire peuvent être identiques ou différentes (image ↔ mot, calcul ↔ résultat).
 */
export function MemoryEngine({ exercise, onSolved }: EngineProps<MemoryExercise>) {
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const cards = exercise.cards;
  const columns = cards.length <= 6 ? 3 : 4;
  const size = width ? Math.min(120, (width - GAP * (columns - 1)) / columns) : 0;

  const flip = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card || busy.current || open.includes(id) || matched.includes(card.pair)) return;
    const nextOpen = [...open, id];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;

    const [a, b] = nextOpen.map((cid) => cards.find((c) => c.id === cid)!);
    if (a.pair === b.pair) {
      const nextMatched = [...matched, a.pair];
      setMatched(nextMatched);
      setOpen([]);
      if (nextMatched.length * 2 === cards.length) onSolved();
    } else {
      // Les cartes restent visibles un instant pour être mémorisées, puis se retournent.
      busy.current = true;
      timer.current = setTimeout(() => {
        setOpen([]);
        busy.current = false;
      }, MISMATCH_MS);
    }
  };

  return (
    <View style={styles.container} onLayout={(e: LayoutChangeEvent) => setWidth(Math.min(e.nativeEvent.layout.width, 560))}>
      <View style={[styles.grid, { width: size * columns + GAP * (columns - 1) }]}>
        {size > 0 &&
          cards.map((c) => (
            <Card
              key={c.id}
              testID={`card-${c.pair}`}
              face={c.face}
              isText={c.isText}
              size={size}
              faceUp={open.includes(c.id) || matched.includes(c.pair)}
              matched={matched.includes(c.pair)}
              onPress={() => flip(c.id)}
            />
          ))}
      </View>
    </View>
  );
}

type CardProps = {
  face: string;
  isText: boolean;
  size: number;
  faceUp: boolean;
  matched: boolean;
  onPress: () => void;
  testID: string;
};

function Card({ face, isText, size, faceUp, matched, onPress, testID }: CardProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withTiming(faceUp ? 180 : 0, { duration: 280 });
  }, [faceUp, rotation]);

  useEffect(() => {
    if (matched) scale.value = withSequence(withSpring(1.15), withSpring(1));
  }, [matched, scale]);

  const back = useAnimatedStyle(() => ({
    opacity: rotation.value < 90 ? 1 : 0,
    transform: [{ perspective: 600 }, { rotateY: `${rotation.value}deg` }, { scale: scale.value }],
  }));
  const front = useAnimatedStyle(() => ({
    opacity: rotation.value >= 90 ? 1 : 0,
    transform: [{ perspective: 600 }, { rotateY: `${rotation.value - 180}deg` }, { scale: scale.value }],
  }));

  const box = { width: size, height: size * 1.15 };
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={faceUp ? face : '?'}
      onPress={onPress}
      style={box}
    >
      <Animated.View style={[styles.face, styles.back, box, back]}>
        <Text style={{ fontSize: size * 0.4 }}>⭐</Text>
      </Animated.View>
      <Animated.View style={[styles.face, box, matched && styles.matched, front]}>
        <Text numberOfLines={1} style={isText ? [styles.text, { fontSize: textSize(face, size) }] : { fontSize: size * 0.5 }}>
          {face}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/** Taille de texte qui fait tenir le mot sur une ligne, sans jamais le couper. */
function textSize(face: string, size: number): number {
  // Marge pour le cadre et la bordure ; 0,7 × la taille ≈ largeur d’un caractère gras.
  return Math.max(12, Math.min(size * 0.3, (size - 28) / (face.length * 0.7)));
}

const styles = StyleSheet.create({
  container: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    backfaceVisibility: 'hidden',
    padding: 6,
    ...shadow,
  },
  back: { backgroundColor: colors.primary },
  matched: { borderWidth: 4, borderColor: colors.success },
  text: { fontWeight: '800', color: colors.text, textAlign: 'center' },
});
