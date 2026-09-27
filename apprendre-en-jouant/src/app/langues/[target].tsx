import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../components/ScreenHeader';
import { Stars } from '../../components/Stars';
import { Tile, tileWidth } from '../../components/Tile';
import { THEMES, type ThemeId } from '../../domain/content/vocab';
import { progressKey, skillsFor } from '../../domain/skills';
import type { Lang } from '../../domain/types';
import { LANG_INFO, LANGS, t } from '../../i18n/strings';
import { useStore } from '../../state/AppStore';
import { colors } from '../../theme';

/** Une langue étudiée : choix du thème, puis de l'activité. */
export default function TargetLanguageScreen() {
  const { target } = useLocalSearchParams<{ target: string }>();
  const { ready, active, activeData } = useStore();
  const [theme, setTheme] = useState<ThemeId | null>(null);
  const { width } = useWindowDimensions();
  if (!ready) return null;
  if (!active || !LANGS.includes(target as Lang)) return <Redirect href="/" />;

  const lang = active.lang;
  const tgt = target as Lang;
  const w = tileWidth(width);
  const current = THEMES.find((th) => th.id === theme);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={`${LANG_INFO[tgt].flag} ${LANG_INFO[tgt].name}`} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>{current ? `${current.emoji} ${current.name[lang]}` : t(lang, 'chooseTheme')}</Text>
        <View style={styles.grid}>
          {current
            ? skillsFor('langues', active.level).map((sk, i) => (
                <Tile
                  key={sk.id}
                  testID={`skill-${sk.id}`}
                  index={i}
                  emoji={sk.emoji}
                  title={sk.name[lang]}
                  color="#F8BBD0"
                  width={w}
                  height={170}
                  footer={<Stars value={activeData.progress[progressKey(sk.id, tgt, current.id)]?.bestStars ?? 0} />}
                  onPress={() => router.push({ pathname: '/jeu/[skill]', params: { skill: sk.id, target: tgt, theme: current.id } })}
                />
              ))
            : THEMES.map((th, i) => (
                <Tile
                  key={th.id}
                  testID={`theme-${th.id}`}
                  index={i}
                  emoji={th.emoji}
                  title={th.name[lang]}
                  subtitle={th.name[tgt] !== th.name[lang] ? th.name[tgt] : undefined}
                  color="#F8BBD0"
                  width={w}
                  onPress={() => setTheme(th.id)}
                />
              ))}
        </View>
        {current ? (
          <Text style={styles.link} onPress={() => setTheme(null)} accessibilityRole="button">
            ⬅️ {t(lang, 'chooseTheme')}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, alignItems: 'center', gap: 16 },
  question: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: 1000 },
  link: { fontSize: 18, fontWeight: '700', color: colors.primary, padding: 12 },
});
