import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { BigButton } from '../components/BigButton';
import type { ChoiceExercise, EngineProps } from '../domain/types';
import { say } from '../lib/feedback';
import { colors, radius } from '../theme';

/**
 * Moteur « choix multiple » : l'enfant touche ou clique la bonne réponse.
 * Sert au comptage (objets à toucher un par un) et aux additions.
 */
export function ChoiceEngine({ exercise, onSolved, onMistake }: EngineProps<ChoiceExercise>) {
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  const choose = (value: number) => {
    if (solved || wrong.includes(value)) return;
    if (value === exercise.answer) {
      setSolved(true);
      onSolved();
    } else {
      setWrong((w) => [...w, value]);
      onMistake();
    }
  };

  return (
    <View style={styles.container}>
      <Visual exercise={exercise} />
      <View style={styles.choices}>
        {exercise.choices.map((value) => (
          <ChoiceButton
            key={value}
            value={value}
            state={solved && value === exercise.answer ? 'right' : wrong.includes(value) ? 'wrong' : 'idle'}
            onPress={() => choose(value)}
          />
        ))}
      </View>
    </View>
  );
}

function Visual({ exercise }: { exercise: ChoiceExercise }) {
  const [counted, setCounted] = useState<string[]>([]);
  const { visual } = exercise;

  if (visual.kind === 'equation') {
    return (
      <Animated.Text entering={ZoomIn.springify()} style={styles.equation}>
        {visual.text} = ?
      </Animated.Text>
    );
  }

  // Toucher un objet le « compte » : il grossit, reçoit son numéro et le nombre est prononcé.
  const touch = (key: string) => {
    if (counted.includes(key)) return;
    const next = [...counted, key];
    setCounted(next);
    say(String(next.length));
  };

  let offset = 0;
  return (
    <View style={styles.groups}>
      {visual.counts.map((count, g) => {
        const start = offset;
        offset += count;
        return (
          <View key={g} style={styles.groupRow}>
            {g > 0 && visual.operator ? <Text style={styles.operator}>{visual.operator}</Text> : null}
            <View style={styles.group}>
              {Array.from({ length: count }, (_, i) => {
                const key = `${g}-${i}`;
                const number = counted.indexOf(key) + 1;
                return (
                  <Countable
                    key={key}
                    emoji={visual.emoji}
                    delay={(start + i) * 80}
                    number={number > 0 ? number : null}
                    onPress={() => touch(key)}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Countable({ emoji, delay, number, onPress }: { emoji: string; delay: number; number: number | null; onPress: () => void }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View entering={ZoomIn.delay(delay).springify()}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={number ? `objet numéro ${number}` : 'objet à compter'}
        onPress={() => {
          scale.value = withSequence(withSpring(1.35), withSpring(1));
          onPress();
        }}
        style={styles.countable}
      >
        <Animated.Text style={[styles.emoji, style]}>{emoji}</Animated.Text>
        {number ? <Text style={styles.badge}>{number}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

function ChoiceButton({ value, state, onPress }: { value: number; state: 'idle' | 'right' | 'wrong'; onPress: () => void }) {
  const shakeX = useSharedValue(0);
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }, { scale: scale.value }] }));

  // Les animations suivent l'état décidé par le parent.
  useEffect(() => {
    if (state === 'wrong') {
      shakeX.value = withSequence(
        withTiming(-12, { duration: 50 }),
        withRepeat(withTiming(12, { duration: 90 }), 4, true),
        withTiming(0, { duration: 50 }),
      );
      scale.value = withTiming(0.9);
    } else if (state === 'right') {
      scale.value = withSequence(withSpring(1.3), withSpring(1.1));
    }
  }, [state, shakeX, scale]);

  const color = state === 'right' ? colors.success : state === 'wrong' ? '#E0D6CA' : colors.surface;
  return (
    <Animated.View style={style}>
      <BigButton onPress={onPress} color={color} style={styles.choice} accessibilityLabel={`Réponse ${value}`}>
        <Text style={[styles.choiceText, state === 'right' && { color: '#fff' }]}>{value.toLocaleString('fr-FR')}</Text>
      </BigButton>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly', gap: 24 },
  groups: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 300,
    padding: 12,
    gap: 6,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  operator: { fontSize: 48, fontWeight: '800', color: colors.text },
  countable: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 44 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 22,
    paddingHorizontal: 4,
    borderRadius: 11,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
  },
  equation: { fontSize: 56, fontWeight: '800', color: colors.text },
  choices: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  choice: { minWidth: 96, minHeight: 96 },
  choiceText: { fontSize: 40, fontWeight: '800', color: colors.text },
});
