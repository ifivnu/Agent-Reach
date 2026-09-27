import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors } from '../theme';
import { BigButton } from './BigButton';

type Props = {
  emoji: string;
  title: string;
  subtitle?: string;
  color: string;
  width: number;
  height?: number;
  index?: number;
  onPress: () => void;
  footer?: ReactNode;
  badge?: string;
  testID?: string;
};

/** Grande tuile colorée utilisée dans les menus (matières, compétences, thèmes…). */
export function Tile({ emoji, title, subtitle, color, width, height = 150, index = 0, onPress, footer, badge, testID }: Props) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <BigButton testID={testID} accessibilityLabel={title} color={color} style={[styles.tile, { width, height }]} onPress={onPress}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {footer}
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </BigButton>
    </Animated.View>
  );
}

/** Largeur de tuile pour remplir l'écran avec 2 à 4 colonnes. */
export function tileWidth(screen: number, gap = 16, max = 1000): number {
  const usable = Math.min(screen, max) - 32;
  const columns = usable >= 860 ? 4 : usable >= 540 ? 3 : 2;
  return (usable - gap * (columns - 1)) / columns;
}

const styles = StyleSheet.create({
  tile: { gap: 4 },
  emoji: { fontSize: 48 },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.text, opacity: 0.75, textAlign: 'center' },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.warning,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: '#fff', fontWeight: '900', fontSize: 13 },
});
