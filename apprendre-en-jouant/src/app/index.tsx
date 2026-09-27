import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '../components/BigButton';
import { Tile, tileWidth } from '../components/Tile';
import { LEVELS } from '../domain/levels';
import { t } from '../i18n/strings';
import { useLang, useStore } from '../state/AppStore';
import { colors } from '../theme';

/** « Qui joue ? » : choix du profil enfant. */
export default function ProfilePicker() {
  const { ready, state, selectProfile } = useStore();
  const lang = useLang();
  const { width } = useWindowDimensions();

  if (!ready) return null;
  if (state.profiles.length === 0) return <Redirect href="/profil" />;

  const w = tileWidth(width);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t(lang, 'appTitle')}</Text>
        <Text style={styles.subtitle}>{t(lang, 'whoPlays')}</Text>
        <View style={styles.grid}>
          {state.profiles.map((p, i) => (
            <Tile
              key={p.id}
              testID={`profile-${p.name}`}
              index={i}
              emoji={p.avatar}
              title={p.name}
              subtitle={LEVELS[p.level].label[p.lang]}
              color={LEVELS[p.level].color}
              width={w}
              onPress={() => {
                selectProfile(p.id);
                router.push('/accueil');
              }}
            />
          ))}
          <Tile index={state.profiles.length} emoji="➕" title={t(lang, 'addChild')} color={colors.surface} width={w} onPress={() => router.push('/profil')} />
        </View>
        <BigButton accessibilityLabel={t(lang, 'parents')} onPress={() => router.push('/parents')} style={styles.parents}>
          <Text style={styles.parentsText}>🔒 {t(lang, 'parents')}</Text>
        </BigButton>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, alignItems: 'center', gap: 8 },
  title: { fontSize: 34, fontWeight: '900', color: colors.text, textAlign: 'center', marginTop: 12 },
  subtitle: { fontSize: 22, color: colors.textMuted, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: 1000 },
  parents: { marginTop: 24, paddingHorizontal: 20 },
  parentsText: { fontSize: 16, fontWeight: '700', color: colors.textMuted },
});
