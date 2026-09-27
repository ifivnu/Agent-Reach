import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { BounceIn, FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '../../components/BigButton';
import { Celebration } from '../../components/Celebration';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StarBar } from '../../components/StarBar';
import { isThemeId, type ThemeId } from '../../domain/content/vocab';
import { difficultyOf } from '../../domain/progress';
import { findSkill, makeSession, progressKey, type Skill } from '../../domain/skills';
import type { Exercise, Lang, Speakable } from '../../domain/types';
import { ExerciseView } from '../../engines';
import { LANGS, t } from '../../i18n/strings';
import { cheer, oops, say, stopSpeaking } from '../../lib/feedback';
import { useStore } from '../../state/AppStore';
import { colors } from '../../theme';

const NEXT_DELAY_MS = 1500;

export default function GameScreen() {
  const params = useLocalSearchParams<{ skill: string; target?: string; theme?: string }>();
  const { ready, active } = useStore();
  if (!ready) return null;
  const skill = findSkill(params.skill);
  if (!active || !skill) return <Redirect href="/" />;
  if (skill.subject === 'langues') {
    if (!LANGS.includes(params.target as Lang) || !isThemeId(params.theme)) return <Redirect href="/langues" />;
    return <Game skill={skill} target={params.target as Lang} theme={params.theme} />;
  }
  return <Game skill={skill} />;
}

/** Ce qui est lu à voix haute au début d'un exercice : la consigne, puis éventuellement le mot. */
function speech(ex: Exercise, lang: Lang): Speakable[] {
  const items: Speakable[] = [{ text: ex.instruction, lang }];
  if (ex.engine === 'choice' && ex.prompt.kind === 'listen') items.push({ text: ex.prompt.text, lang: ex.prompt.lang });
  if (ex.engine === 'choice' && ex.prompt.kind === 'picture' && ex.prompt.say) items.push(ex.prompt.say);
  return items;
}

type Outcome = { stars: number; newSticker: string | null; levelUp: boolean };

function Game({ skill, target, theme }: { skill: Skill; target?: Lang; theme?: ThemeId }) {
  const { active, state, recordSession } = useStore();
  const profile = active!;
  const lang = profile.lang;
  const key = progressKey(skill.id, target, theme);

  const [round, setRound] = useState(0);
  const exercises = useMemo(
    () =>
      makeSession({
        skill,
        level: profile.level,
        difficulty: difficultyOf(state, profile.id, key),
        lang,
        target,
        theme,
      }),
    // Une nouvelle série à chaque « Rejouer », avec la difficulté du moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [round],
  );
  const [index, setIndex] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const mistakes = useRef(0);
  const firstTry = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const exercise = exercises[index];

  useEffect(() => {
    if (exercise) say(...speech(exercise, lang));
  }, [exercise, lang]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      stopSpeaking();
    },
    [],
  );

  const onMistake = (opts?: { silent?: boolean }) => {
    mistakes.current += 1;
    if (!opts?.silent) oops(lang);
  };

  const onSolved = () => {
    if (mistakes.current === 0) firstTry.current += 1;
    mistakes.current = 0;
    cheer(lang);
    setCelebrating(true);
    timer.current = setTimeout(() => {
      setCelebrating(false);
      if (index + 1 >= exercises.length) {
        const result = recordSession(key, { exercises: exercises.length, firstTry: firstTry.current });
        setOutcome(result);
        say({ text: `${t(lang, 'bravo')} ${t(lang, 'wonStars', { n: result.stars })}`, lang });
      }
      setIndex((i) => i + 1);
    }, NEXT_DELAY_MS);
  };

  const replay = () => {
    firstTry.current = 0;
    mistakes.current = 0;
    setOutcome(null);
    setIndex(0);
    setRound((r) => r + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={skill.name[lang]}
        right={
          <>
            <StarBar total={exercises.length} earned={Math.min(index + (celebrating ? 1 : 0), exercises.length)} />
            {exercise ? (
              <BigButton testID="repeat" accessibilityLabel={t(lang, 'listenAgain')} onPress={() => say(...speech(exercise, lang))}>
                <Text style={styles.icon}>🔊</Text>
              </BigButton>
            ) : null}
          </>
        }
      />

      {outcome ? (
        <End outcome={outcome} lang={lang} onReplay={replay} />
      ) : exercise ? (
        <View style={styles.stage}>
          <Text style={styles.instruction}>{exercise.instruction}</Text>
          {/* key : chaque exercice repart d'un moteur neuf (état et animations réinitialisés). */}
          <ExerciseView key={`${round}-${exercise.id}`} exercise={exercise} lang={lang} onSolved={onSolved} onMistake={onMistake} />
          {celebrating ? <Celebration /> : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function End({ outcome, lang, onReplay }: { outcome: Outcome; lang: Lang; onReplay: () => void }) {
  return (
    <Animated.View entering={FadeIn} style={styles.end}>
      <View style={styles.bigStars}>
        {[1, 2, 3].map((i) => (
          <Animated.Text key={i} entering={BounceIn.delay(200 + i * 250)} style={[styles.bigStar, i > outcome.stars && styles.dim]}>
            ⭐
          </Animated.Text>
        ))}
      </View>
      <Text style={styles.endTitle}>{t(lang, 'bravo')}</Text>
      <Text style={styles.endText}>{t(lang, 'wonStars', { n: outcome.stars })}</Text>
      {outcome.levelUp ? (
        <Animated.Text entering={FadeInUp.delay(1100)} style={styles.levelUp}>
          🚀 {t(lang, 'levelUp')}
        </Animated.Text>
      ) : null}
      {outcome.newSticker ? (
        <Animated.View entering={ZoomIn.delay(1300).springify()} style={styles.sticker}>
          <Text style={styles.stickerEmoji}>{outcome.newSticker}</Text>
          <Text style={styles.stickerText}>{t(lang, 'newSticker')}</Text>
        </Animated.View>
      ) : null}
      <View style={styles.endActions}>
        <BigButton testID="replay" accessibilityLabel={t(lang, 'replay')} color={colors.primary} onPress={onReplay} style={styles.endButton}>
          <Text style={styles.endButtonText}>🔁 {t(lang, 'replay')}</Text>
        </BigButton>
        <BigButton testID="end-back" accessibilityLabel={t(lang, 'back')} onPress={() => router.back()} style={styles.endButton}>
          <Text style={[styles.endButtonText, { color: colors.text }]}>⬅️ {t(lang, 'back')}</Text>
        </BigButton>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  icon: { fontSize: 28 },
  stage: { flex: 1, padding: 16, paddingTop: 0 },
  instruction: { fontSize: 20, fontWeight: '700', color: colors.textMuted, textAlign: 'center', marginBottom: 8 },
  end: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16 },
  bigStars: { flexDirection: 'row', gap: 8 },
  bigStar: { fontSize: 72 },
  dim: { opacity: 0.2 },
  endTitle: { fontSize: 44, fontWeight: '900', color: colors.text },
  endText: { fontSize: 22, color: colors.textMuted },
  levelUp: { fontSize: 20, fontWeight: '800', color: colors.success },
  sticker: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 24, padding: 16, marginTop: 8 },
  stickerEmoji: { fontSize: 80 },
  stickerText: { fontSize: 18, fontWeight: '800', color: colors.warning },
  endActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16, justifyContent: 'center' },
  endButton: { paddingHorizontal: 24 },
  endButtonText: { fontSize: 22, fontWeight: '800', color: '#fff' },
});
