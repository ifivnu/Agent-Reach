import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BigButton } from '../../components/BigButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { ACTIVITIES, isLevelId, LEVELS } from '../../domain/levels';
import { say } from '../../lib/feedback';
import { colors } from '../../theme';

export default function LevelScreen() {
  const { level } = useLocalSearchParams<{ level: string }>();
  if (!isLevelId(level)) return <Redirect href="/" />;
  const config = LEVELS[level];

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={`${config.label} · ${config.age}`} />
      <View style={styles.grid}>
        {config.activities.map((activity, i) => {
          const info = ACTIVITIES[activity];
          return (
            <Animated.View key={activity} entering={FadeInDown.delay(i * 80).springify()}>
              <BigButton
                accessibilityLabel={info.label}
                color={config.color}
                style={styles.card}
                onPress={() => {
                  say(info.label);
                  router.push({ pathname: '/jeu/[level]/[activity]', params: { level, activity } });
                }}
              >
                <Text style={styles.emoji}>{info.emoji}</Text>
                <Text style={styles.label}>{info.label}</Text>
              </BigButton>
            </Animated.View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: 20, padding: 16 },
  card: { width: 170, height: 170, gap: 8 },
  emoji: { fontSize: 64 },
  label: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' },
});
