import { Redirect } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { STICKERS } from '../domain/content/logic';
import { t } from '../i18n/strings';
import { useStore } from '../state/AppStore';
import { colors, radius } from '../theme';

/** Album d'autocollants : une récompense à collectionner, série après série. */
export default function AlbumScreen() {
  const { ready, active, activeData } = useStore();
  if (!ready) return null;
  if (!active) return <Redirect href="/" />;
  const lang = active.lang;
  const owned = new Set(activeData.stickers);
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={t(lang, 'myAlbum')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.count}>{t(lang, 'albumCount', { n: owned.size, total: STICKERS.length })}</Text>
        {owned.size === 0 ? <Text style={styles.hint}>{t(lang, 'albumHint')}</Text> : null}
        <View style={styles.grid}>
          {STICKERS.map((s, i) => (
            <Animated.View key={s} entering={ZoomIn.delay(i * 20)} style={[styles.cell, owned.has(s) && styles.owned]}>
              <Text style={[styles.sticker, !owned.has(s) && styles.hidden]}>{owned.has(s) ? s : '❔'}</Text>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, alignItems: 'center', gap: 12 },
  count: { fontSize: 22, fontWeight: '800', color: colors.text },
  hint: { fontSize: 16, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 760 },
  cell: { width: 76, height: 76, borderRadius: radius.md, backgroundColor: colors.slot, alignItems: 'center', justifyContent: 'center' },
  owned: { backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.star },
  sticker: { fontSize: 44 },
  hidden: { opacity: 0.35, fontSize: 30 },
});
