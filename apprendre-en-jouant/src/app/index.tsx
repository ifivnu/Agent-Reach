import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '../components/BigButton';
import { LEVEL_ORDER, LEVELS } from '../domain/levels';
import { say } from '../lib/feedback';
import { colors } from '../theme';

export default function Home() {
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 4 : width >= 560 ? 3 : 2;
  const cardWidth = (Math.min(width, 1000) - 32 - (columns - 1) * 16) / columns;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Apprendre en jouant</Text>
        <Text style={styles.subtitle}>Choisis ta classe</Text>
        <View style={styles.grid}>
          {LEVEL_ORDER.map((id, i) => {
            const level = LEVELS[id];
            return (
              <Animated.View key={id} entering={FadeInDown.delay(i * 60).springify()}>
                <BigButton
                  accessibilityLabel={level.label}
                  color={level.color}
                  style={[styles.card, { width: cardWidth }]}
                  onPress={() => {
                    say(level.label);
                    router.push({ pathname: '/niveau/[level]', params: { level: id } });
                  }}
                >
                  <Text style={styles.cardTitle}>{level.id}</Text>
                  <Text style={styles.cardLabel}>{level.label}</Text>
                  <Text style={styles.cardAge}>{level.age}</Text>
                </BigButton>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, alignItems: 'center', gap: 8 },
  title: { fontSize: 36, fontWeight: '900', color: colors.text, textAlign: 'center', marginTop: 12 },
  subtitle: { fontSize: 20, color: colors.textMuted, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', maxWidth: 1000 },
  card: { height: 140 },
  cardTitle: { fontSize: 34, fontWeight: '900', color: colors.text },
  cardLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardAge: { fontSize: 14, color: colors.text, opacity: 0.7 },
});
