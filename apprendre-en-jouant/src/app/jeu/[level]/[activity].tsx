import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '../../../components/BigButton';
import { Celebration } from '../../../components/Celebration';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { StarBar } from '../../../components/StarBar';
import { makeSession } from '../../../domain/generators';
import { ACTIVITIES, isActivityId, isLevelId, LEVELS } from '../../../domain/levels';
import type { ActivityId, LevelId } from '../../../domain/types';
import { ExerciseView } from '../../../engines';
import { cheer, oops, say, stopSpeaking } from '../../../lib/feedback';
import { colors } from '../../../theme';

const SESSION_LENGTH = 5;
const NEXT_DELAY_MS = 1600;

export default function GameScreen() {
  const { level, activity } = useLocalSearchParams<{ level: string; activity: string }>();
  if (!isLevelId(level) || !isActivityId(activity) || !LEVELS[level].activities.includes(activity)) {
    return <Redirect href="/" />;
  }
  return <Game level={level} activity={activity} />;
}

function Game({ level, activity }: { level: LevelId; activity: ActivityId }) {
  const [round, setRound] = useState(0);
  const exercises = useMemo(() => makeSession(level, activity, SESSION_LENGTH), [level, activity, round]);
  const [index, setIndex] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finished = index >= exercises.length;
  const exercise = exercises[index];

  // Consigne lue à chaque nouvel exercice (les enfants ne savent pas forcément lire).
  useEffect(() => {
    if (exercise) say(exercise.instruction);
  }, [exercise]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      stopSpeaking();
    },
    [],
  );

  useEffect(() => {
    if (finished) say(`Bravo ! Tu as gagné ${exercises.length} étoiles !`);
  }, [finished, exercises.length]);

  const onSolved = () => {
    cheer();
    setCelebrating(true);
    timer.current = setTimeout(() => {
      setCelebrating(false);
      setIndex((i) => i + 1);
    }, NEXT_DELAY_MS);
  };

  const replay = () => {
    setRound((r) => r + 1);
    setIndex(0);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={ACTIVITIES[activity].label}
        right={
          <>
            <StarBar total={exercises.length} earned={Math.min(index + (celebrating ? 1 : 0), exercises.length)} />
            {exercise ? (
              <BigButton accessibilityLabel="Réécouter la consigne" onPress={() => say(exercise.instruction)}>
                <Text style={styles.icon}>🔊</Text>
              </BigButton>
            ) : null}
          </>
        }
      />

      {finished ? (
        <Animated.View entering={FadeIn} style={styles.end}>
          <Animated.Text entering={ZoomIn.springify()} style={styles.trophy}>
            🏆
          </Animated.Text>
          <Text style={styles.endTitle}>Bravo !</Text>
          <Text style={styles.endText}>Tu as gagné {exercises.length} étoiles.</Text>
          <View style={styles.endActions}>
            <BigButton accessibilityLabel="Rejouer" color={colors.primary} onPress={replay} style={styles.endButton}>
              <Text style={styles.endButtonText}>🔁 Rejouer</Text>
            </BigButton>
            <BigButton accessibilityLabel="Changer d'activité" onPress={() => router.back()} style={styles.endButton}>
              <Text style={[styles.endButtonText, { color: colors.text }]}>🏠 Activités</Text>
            </BigButton>
          </View>
        </Animated.View>
      ) : (
        <View style={styles.stage}>
          {/* key : chaque exercice repart d'un moteur neuf (état et animations réinitialisés). */}
          <ExerciseView key={`${round}-${exercise.id}`} exercise={exercise} onSolved={onSolved} onMistake={oops} />
          {celebrating ? <Celebration /> : null}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  icon: { fontSize: 28 },
  stage: { flex: 1, padding: 16 },
  end: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  trophy: { fontSize: 120 },
  endTitle: { fontSize: 44, fontWeight: '900', color: colors.text },
  endText: { fontSize: 22, color: colors.textMuted },
  endActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16, justifyContent: 'center' },
  endButton: { paddingHorizontal: 24 },
  endButtonText: { fontSize: 22, fontWeight: '800', color: '#fff' },
});
