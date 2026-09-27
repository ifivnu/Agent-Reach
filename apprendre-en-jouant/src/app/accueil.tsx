import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '../components/BigButton';
import { Tile, tileWidth } from '../components/Tile';
import { STICKERS } from '../domain/content/logic';
import { LEVELS } from '../domain/levels';
import { SUBJECT_ORDER, SUBJECT_STYLE, skillsFor } from '../domain/skills';
import { t } from '../i18n/strings';
import { say } from '../lib/feedback';
import { useStore } from '../state/AppStore';
import { colors, radius } from '../theme';

/** Accueil de l'enfant : ses étoiles, les matières, son parcours et son album. */
export default function Home() {
  const { ready, active, activeData } = useStore();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (active) say({ text: t(active.lang, 'hello', { name: active.name }), lang: active.lang });
  }, [active]);

  if (!ready) return null;
  if (!active) return <Redirect href="/" />;
  const lang = active.lang;
  const w = tileWidth(width);
  const subjects = SUBJECT_ORDER.filter((s) => skillsFor(s, active.level).length > 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <BigButton testID="switch-player" accessibilityLabel={t(lang, 'changePlayer')} onPress={() => router.replace('/')}>
            <Text style={styles.avatar}>{active.avatar}</Text>
          </BigButton>
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>{t(lang, 'hello', { name: active.name })}</Text>
            <Text style={styles.level}>{LEVELS[active.level].label[lang]}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat emoji="⭐" text={t(lang, 'starsTotal', { n: activeData.totalStars })} />
          {activeData.streak.days > 0 ? <Stat emoji="🔥" text={t(lang, 'streakDays', { n: activeData.streak.days })} /> : null}
          <Stat emoji="🎁" text={`${activeData.stickers.length} / ${STICKERS.length}`} />
        </View>

        <View style={styles.grid}>
          <Tile testID="path" index={0} emoji="🗺️" title={t(lang, 'myPath')} color="#FFE082" width={w} onPress={() => router.push('/parcours')} />
          {subjects.map((s, i) => (
            <Tile
              key={s}
              testID={`subject-${s}`}
              index={i + 1}
              emoji={SUBJECT_STYLE[s].emoji}
              title={t(lang, `subject.${s}`)}
              color={SUBJECT_STYLE[s].color}
              width={w}
              onPress={() => router.push(s === 'langues' ? '/langues' : { pathname: '/matiere/[subject]', params: { subject: s } })}
            />
          ))}
          <Tile testID="album" index={subjects.length + 1} emoji="📒" title={t(lang, 'myAlbum')} color="#FFCCBC" width={w} onPress={() => router.push('/album')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ emoji, text }: { emoji: string; text: string }) {
  return (
    <Animated.View entering={ZoomIn.springify()} style={styles.stat}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 16, alignItems: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16, alignSelf: 'stretch', maxWidth: 1000, width: '100%', marginHorizontal: 'auto' },
  avatar: { fontSize: 40 },
  hello: { fontSize: 28, fontWeight: '900', color: colors.text },
  level: { fontSize: 16, color: colors.textMuted },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8 },
  statEmoji: { fontSize: 22 },
  statText: { fontSize: 16, fontWeight: '800', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: 1000 },
});
