import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';

import type { EngineProps, TapTargetsExercise } from '../domain/types';
import { t } from '../i18n/strings';
import { colors, radius } from '../theme';

const SIZE = 78;
const MAX_ALIVE = 5;
const COUNTDOWN_MS = 2400;

type Item = { key: number; text: string; isTarget: boolean; x: number; y: number; lifetime: number };

/**
 * Moteur « attrape-les » (agilité) : des cibles apparaissent et disparaissent ;
 * l'enfant doit toucher vite celles qui respectent la règle, et seulement elles.
 */
export function TapTargetsEngine({ exercise, lang, onSolved, onMistake }: EngineProps<TapTargetsExercise>) {
  const [area, setArea] = useState<{ w: number; h: number } | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [hits, setHits] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'go' | 'playing' | 'done'>('ready');
  const nextKey = useRef(0);
  // Compteur synchrone : deux touches dans la même image comptent bien pour deux.
  const hitCount = useRef(0);
  // Cibles déjà touchées : onPressIn et onPress peuvent arriver tous les deux pour un même appui.
  const handled = useRef(new Set<number>());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Compte à rebours « Prêt ? Partez ! » : le temps d'entendre la consigne.
  useEffect(() => {
    later(() => setPhase('go'), COUNTDOWN_MS - 700);
    later(() => setPhase((p) => (p === 'go' ? 'playing' : p)), COUNTDOWN_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'playing' || !area) return;
    const spawn = () =>
      setItems((alive) => {
        if (alive.length >= MAX_ALIVE) return alive;
        // Une cible sur deux environ, et toujours au moins une cible à l'écran.
        const isTarget = !alive.some((i) => i.isTarget) || Math.random() < 0.5;
        const pool = isTarget ? exercise.targets : exercise.distractors;
        const text = pool[Math.floor(Math.random() * pool.length)];
        const pos = freeSpot(alive, area);
        const item: Item = { key: nextKey.current++, text, isTarget, ...pos, lifetime: exercise.lifetime };
        later(() => setItems((all) => all.filter((i) => i.key !== item.key)), exercise.lifetime);
        return [...alive, item];
      });
    spawn();
    const interval = setInterval(spawn, exercise.spawnEvery);
    return () => clearInterval(interval);
  }, [phase, area, exercise]);

  const tap = (item: Item) => {
    if (phase !== 'playing' || hitCount.current >= exercise.goal || handled.current.has(item.key)) return;
    handled.current.add(item.key);
    setItems((all) => all.filter((i) => i.key !== item.key));
    if (!item.isTarget) {
      onMistake({ silent: true });
      return;
    }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    hitCount.current += 1;
    const next = hitCount.current;
    setHits(next);
    if (next === exercise.goal) {
      setPhase('done');
      setItems([]);
      onSolved();
    }
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea({ w: width, h: height });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.hint}>
          <Text style={styles.hintText}>{exercise.hint}</Text>
        </View>
        <View style={styles.bar} accessibilityLabel={`${hits} / ${exercise.goal}`}>
          <View style={[styles.barFill, { width: `${(hits / exercise.goal) * 100}%` }]} />
        </View>
        <Text style={styles.count}>
          {hits} / {exercise.goal}
        </Text>
      </View>

      <View testID="tap-area" style={styles.area} onLayout={onLayout}>
        {phase === 'ready' || phase === 'go' ? (
          <Animated.Text key={phase} entering={ZoomIn.springify()} style={styles.countdown}>
            {t(lang, phase === 'ready' ? 'ready' : 'go')}
          </Animated.Text>
        ) : null}
        {items.map((item) => (
          <Target key={item.key} item={item} onPress={() => tap(item)} />
        ))}
      </View>
    </View>
  );
}

/** Position aléatoire qui évite de recouvrir les cibles déjà présentes. */
function freeSpot(alive: Item[], area: { w: number; h: number }) {
  let best = { x: 0, y: 0 };
  for (let attempt = 0; attempt < 12; attempt++) {
    const x = Math.random() * Math.max(0, area.w - SIZE);
    const y = Math.random() * Math.max(0, area.h - SIZE);
    best = { x, y };
    if (alive.every((i) => Math.hypot(i.x - x, i.y - y) > SIZE * 1.1)) break;
  }
  return best;
}

function Target({ item, onPress }: { item: Item; onPress: () => void }) {
  const life = useSharedValue(1);
  useEffect(() => {
    // La cible « s'éteint » doucement : l'enfant voit qu'il faut se dépêcher.
    life.value = withSequence(
      withTiming(1, { duration: item.lifetime * 0.6 }),
      withTiming(0.55, { duration: item.lifetime * 0.4, easing: Easing.in(Easing.quad) }),
    );
  }, [item.lifetime, life]);
  const style = useAnimatedStyle(() => ({ opacity: life.value, transform: [{ scale: 0.7 + life.value * 0.3 }] }));

  const isEmoji = /\p{Extended_Pictographic}/u.test(item.text);
  return (
    <Animated.View entering={ZoomIn.springify()} exiting={ZoomOut.duration(150)} style={[styles.target, { left: item.x, top: item.y }]}>
      <Pressable
        testID={item.isTarget ? 'tt-yes' : 'tt-no'}
        accessibilityRole="button"
        accessibilityLabel={item.text}
        // onPressIn réagit dès le contact sur mobile ; sur le web, un clic très bref ne le
        // déclenche pas (délai de react-native-web), onPress prend alors le relais.
        onPressIn={onPress}
        onPress={onPress}
        style={styles.fill}
      >
        <Animated.View style={[styles.bubble, style]}>
          <Text adjustsFontSizeToFit numberOfLines={1} style={isEmoji ? styles.emoji : [styles.text, item.text.length > 4 && { fontSize: 20 }]}>
            {item.text}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignSelf: 'stretch', gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' },
  hint: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 6 },
  hintText: { fontSize: 30, fontWeight: '800', color: colors.text },
  bar: { flex: 1, maxWidth: 360, height: 16, borderRadius: 8, backgroundColor: colors.slot, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.success, borderRadius: 8 },
  count: { fontSize: 20, fontWeight: '800', color: colors.text, minWidth: 64 },
  area: { flex: 1, borderRadius: radius.lg, backgroundColor: '#FFFDF6', overflow: 'hidden' },
  countdown: { alignSelf: 'center', marginTop: '25%', fontSize: 56, fontWeight: '900', color: colors.primary },
  target: { position: 'absolute', width: SIZE, height: SIZE },
  fill: { width: '100%', height: '100%' },
  bubble: {
    flex: 1,
    borderRadius: SIZE / 2,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.guide,
  },
  emoji: { fontSize: 42 },
  text: { fontSize: 26, fontWeight: '800', color: colors.text },
});
