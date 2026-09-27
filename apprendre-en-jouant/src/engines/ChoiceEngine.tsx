import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { BigButton } from '../components/BigButton';
import type { ChoiceExercise, ChoiceOption, EngineProps, Lang } from '../domain/types';
import { t } from '../i18n/strings';
import { hasVoice, say } from '../lib/feedback';
import { colors, radius } from '../theme';

/**
 * Moteur « choix multiple » : l'enfant touche ou clique la bonne réponse.
 * Il sert au comptage, au calcul, aux suites, à l'intrus, à la lecture et aux langues :
 * seule la consigne visuelle (`prompt`) change.
 */
export function ChoiceEngine({ exercise, lang, onSolved, onMistake }: EngineProps<ChoiceExercise>) {
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  const choose = (id: string) => {
    if (solved || wrong.includes(id)) return;
    if (id === exercise.answer) {
      setSolved(true);
      onSolved();
    } else {
      setWrong((w) => [...w, id]);
      onMistake();
    }
  };

  return (
    <View style={styles.container}>
      <Prompt exercise={exercise} lang={lang} />
      <View style={styles.choices}>
        {exercise.choices.map((option) => (
          <ChoiceButton
            key={option.id}
            option={option}
            layout={exercise.layout}
            correct={option.id === exercise.answer}
            state={solved && option.id === exercise.answer ? 'right' : wrong.includes(option.id) ? 'wrong' : 'idle'}
            onPress={() => choose(option.id)}
          />
        ))}
      </View>
    </View>
  );
}

function Prompt({ exercise, lang }: { exercise: ChoiceExercise; lang: Lang }) {
  const { prompt } = exercise;
  switch (prompt.kind) {
    case 'none':
      return null;
    case 'groups':
      return <Groups key={exercise.id} emoji={prompt.emoji} counts={prompt.counts} operator={prompt.operator} lang={lang} />;
    case 'takeaway':
      return (
        <View style={styles.group}>
          {Array.from({ length: prompt.total }, (_, i) => {
            const removed = i >= prompt.total - prompt.removed;
            return (
              <Animated.View key={i} entering={ZoomIn.delay(i * 70).springify()} style={styles.countable}>
                <Text style={[styles.emoji, removed && styles.removed]}>{prompt.emoji}</Text>
                {removed ? (
                  <Animated.Text entering={ZoomIn.delay(600 + i * 90)} style={styles.cross}>
                    ❌
                  </Animated.Text>
                ) : null}
              </Animated.View>
            );
          })}
        </View>
      );
    case 'text':
      return (
        <Animated.Text entering={ZoomIn.springify()} style={[styles.equation, prompt.text.length > 16 && { fontSize: 34 }]}>
          {prompt.text}
        </Animated.Text>
      );
    case 'emojis':
      return (
        <View style={styles.row}>
          {prompt.items.map((e, i) => (
            <Animated.Text key={i} entering={ZoomIn.delay(i * 90).springify()} style={styles.patternItem}>
              {e}
            </Animated.Text>
          ))}
        </View>
      );
    case 'picture':
      return (
        <View style={styles.pictureRow}>
          <Animated.Text entering={ZoomIn.springify()} style={styles.picture}>
            {prompt.emoji}
          </Animated.Text>
          {prompt.say && hasVoice(prompt.say.lang) ? <SpeakButton onPress={() => say(prompt.say!)} label={t(lang, 'listenAgain')} /> : null}
        </View>
      );
    case 'word':
      return (
        <Animated.View entering={ZoomIn.springify()} style={styles.wordCard}>
          <Text style={styles.word}>{prompt.text}</Text>
        </Animated.View>
      );
    case 'listen': {
      const canSpeak = hasVoice(prompt.lang);
      return (
        <View style={styles.listen}>
          {canSpeak ? (
            <SpeakButton big onPress={() => say({ text: prompt.text, lang: prompt.lang })} label={t(lang, 'listenAgain')} />
          ) : (
            <Animated.View entering={FadeIn} style={styles.listen}>
              <View style={styles.wordCard}>
                <Text style={styles.word}>{prompt.text}</Text>
              </View>
              <Text style={styles.note}>{t(lang, 'noVoice')}</Text>
            </Animated.View>
          )}
        </View>
      );
    }
  }
}

function SpeakButton({ onPress, label, big }: { onPress: () => void; label: string; big?: boolean }) {
  return (
    <BigButton accessibilityLabel={label} onPress={onPress} color={colors.primary} style={big ? styles.speakBig : undefined}>
      <Text style={{ fontSize: big ? 64 : 32 }}>🔊</Text>
    </BigButton>
  );
}

function Groups({ emoji, counts, operator, lang }: { emoji: string; counts: number[]; operator?: string; lang: Lang }) {
  const [counted, setCounted] = useState<string[]>([]);

  // Toucher un objet le « compte » : il grossit, reçoit son numéro et le nombre est prononcé.
  const touch = (key: string) => {
    if (counted.includes(key)) return;
    const next = [...counted, key];
    setCounted(next);
    say({ text: String(next.length), lang });
  };

  let offset = 0;
  return (
    <View style={styles.groups}>
      {counts.map((count, g) => {
        const start = offset;
        offset += count;
        return (
          <View key={g} style={styles.groupRow}>
            {g > 0 && operator ? <Text style={styles.operator}>{operator}</Text> : null}
            <View style={styles.group}>
              {Array.from({ length: count }, (_, i) => {
                const key = `${g}-${i}`;
                const number = counted.indexOf(key) + 1;
                return (
                  <Countable
                    key={key}
                    emoji={emoji}
                    delay={(start + i) * 60}
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
        testID="countable"
        accessibilityLabel={number ? `#${number}` : emoji}
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

type ButtonProps = {
  option: ChoiceOption;
  layout?: ChoiceExercise['layout'];
  correct: boolean;
  state: 'idle' | 'right' | 'wrong';
  onPress: () => void;
};

function ChoiceButton({ option, layout, correct, state, onPress }: ButtonProps) {
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
  const label = option.text ?? option.emoji ?? '';
  return (
    <Animated.View style={style}>
      <BigButton
        testID={correct ? 'choice-correct' : 'choice-wrong'}
        onPress={onPress}
        color={color}
        style={layout === 'words' ? styles.choiceWord : layout === 'big' ? styles.choiceBig : styles.choice}
        accessibilityLabel={label}
      >
        {option.emoji ? <Text style={styles.choiceEmoji}>{option.emoji}</Text> : null}
        {option.text ? (
          <Text style={[layout === 'words' ? styles.choiceWordText : styles.choiceText, state === 'right' && { color: '#fff' }]}>
            {option.text}
          </Text>
        ) : null}
      </BigButton>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly', gap: 20 },
  groups: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 },
  groupRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 320,
    padding: 10,
    gap: 4,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  operator: { fontSize: 48, fontWeight: '800', color: colors.text },
  countable: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 40 },
  removed: { opacity: 0.35 },
  cross: { position: 'absolute', fontSize: 30 },
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
  equation: { fontSize: 52, fontWeight: '800', color: colors.text, textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, maxWidth: 640 },
  patternItem: { fontSize: 44 },
  pictureRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  picture: { fontSize: 120 },
  wordCard: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: 32, paddingVertical: 16 },
  word: { fontSize: 52, fontWeight: '800', color: colors.text, textAlign: 'center' },
  listen: { alignItems: 'center', gap: 12 },
  speakBig: { width: 140, height: 140, borderRadius: 70 },
  note: { color: colors.textMuted, fontSize: 14, textAlign: 'center', maxWidth: 320 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, maxWidth: 720 },
  choice: { minWidth: 96, minHeight: 96, paddingHorizontal: 16 },
  choiceBig: { width: 110, height: 110 },
  choiceWord: { minWidth: 150, minHeight: 80, paddingHorizontal: 20 },
  choiceText: { fontSize: 40, fontWeight: '800', color: colors.text },
  choiceWordText: { fontSize: 26, fontWeight: '800', color: colors.text },
  choiceEmoji: { fontSize: 60 },
});
