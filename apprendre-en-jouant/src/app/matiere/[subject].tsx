import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../components/ScreenHeader';
import { Stars } from '../../components/Stars';
import { Tile, tileWidth } from '../../components/Tile';
import { SUBJECT_ORDER, SUBJECT_STYLE, skillsFor } from '../../domain/skills';
import type { SubjectId } from '../../domain/types';
import { t } from '../../i18n/strings';
import { useStore } from '../../state/AppStore';

/** Les compétences d'une matière, pour la classe de l'enfant. */
export default function SubjectScreen() {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const { ready, active, activeData } = useStore();
  const { width } = useWindowDimensions();
  if (!ready) return null;
  if (!active || !SUBJECT_ORDER.includes(subject as SubjectId)) return <Redirect href="/" />;
  if (subject === 'langues') return <Redirect href="/langues" />;

  const lang = active.lang;
  const s = subject as SubjectId;
  const w = tileWidth(width);
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={t(lang, `subject.${s}`)} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {skillsFor(s, active.level).map((sk, i) => (
            <Tile
              key={sk.id}
              testID={`skill-${sk.id}`}
              index={i}
              emoji={sk.emoji}
              title={sk.name[lang]}
              color={SUBJECT_STYLE[s].color}
              width={w}
              height={170}
              footer={<Stars value={activeData.progress[sk.id]?.bestStars ?? 0} />}
              onPress={() => router.push({ pathname: '/jeu/[skill]', params: { skill: sk.id } })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: 1000 },
});
