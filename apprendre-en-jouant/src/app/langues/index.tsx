import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../components/ScreenHeader';
import { Tile } from '../../components/Tile';
import { LANG_INFO, LANGS, t } from '../../i18n/strings';
import { useStore } from '../../state/AppStore';
import { colors } from '../../theme';

const COLORS = { fr: '#90CAF9', en: '#EF9A9A', ht: '#9FA8DA' } as const;

/** Section Langues : choisir la langue à apprendre. */
export default function LanguagesScreen() {
  const { ready, active } = useStore();
  if (!ready) return null;
  if (!active) return <Redirect href="/" />;
  const lang = active.lang;
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={t(lang, 'subject.langues')} />
      <Text style={styles.question}>{t(lang, 'chooseLanguage')}</Text>
      <View style={styles.grid}>
        {LANGS.map((l, i) => (
          <Tile
            key={l}
            testID={`target-${l}`}
            index={i}
            emoji={LANG_INFO[l].flag}
            title={LANG_INFO[l].name}
            color={COLORS[l]}
            width={200}
            height={170}
            onPress={() => router.push({ pathname: '/langues/[target]', params: { target: l } })}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  question: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center', margin: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center', padding: 16 },
});
