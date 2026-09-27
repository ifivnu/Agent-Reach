import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '../components/BigButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { Stars } from '../components/Stars';
import { pathFor, SUBJECT_STYLE } from '../domain/skills';
import { t } from '../i18n/strings';
import { useStore } from '../state/AppStore';
import { colors } from '../theme';

/**
 * Parcours de la classe : les compétences en chemin, comme un programme scolaire.
 * La prochaine compétence à travailler (pas encore 3 étoiles) est mise en avant.
 */
export default function PathScreen() {
  const { ready, active, activeData } = useStore();
  if (!ready) return null;
  if (!active) return <Redirect href="/" />;
  const lang = active.lang;
  const path = pathFor(active.level);
  const next = path.findIndex((s) => (activeData.progress[s.id]?.bestStars ?? 0) < 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={t(lang, 'myPath')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>{t(lang, 'pathHint')}</Text>
        {path.map((sk, i) => {
          const stars = activeData.progress[sk.id]?.bestStars ?? 0;
          const offset = [0, 60, 90, 60, 0, -60, -90, -60][i % 8];
          return (
            <Animated.View key={sk.id} entering={FadeInDown.delay(i * 40)} style={[styles.node, { transform: [{ translateX: offset }] }]}>
              {i > 0 ? <View style={styles.connector} /> : null}
              {i === next ? <Bubble text={t(lang, 'yourTurn')} /> : null}
              <BigButton
                testID={i === next ? 'path-next' : `path-${sk.id}`}
                accessibilityLabel={sk.name[lang]}
                color={stars === 3 ? colors.success : SUBJECT_STYLE[sk.subject].color}
                style={[styles.circle, i === next && styles.current]}
                onPress={() => router.push({ pathname: '/jeu/[skill]', params: { skill: sk.id } })}
              >
                <Text style={styles.emoji}>{sk.emoji}</Text>
              </BigButton>
              <Text style={styles.name}>{sk.name[lang]}</Text>
              <Stars value={stars} size={14} />
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Bubble({ text }: { text: string }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(withSequence(withTiming(-6, { duration: 500 }), withTiming(0, { duration: 500 })), -1);
  }, [y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={[styles.bubble, style]}>
      <Text style={styles.bubbleText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, alignItems: 'center', paddingBottom: 48 },
  hint: { fontSize: 16, color: colors.textMuted, marginBottom: 12, textAlign: 'center' },
  node: { alignItems: 'center', gap: 4, marginBottom: 8 },
  connector: { width: 6, height: 24, borderRadius: 3, backgroundColor: colors.guide, marginBottom: 4 },
  circle: { width: 84, height: 84, borderRadius: 42 },
  current: { borderWidth: 5, borderColor: colors.warning },
  emoji: { fontSize: 40 },
  name: { fontSize: 15, fontWeight: '800', color: colors.text, maxWidth: 160, textAlign: 'center' },
  bubble: { backgroundColor: colors.warning, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 4 },
  bubbleText: { color: '#fff', fontWeight: '900' },
});
