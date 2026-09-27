import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { colors } from '../theme';
import { BigButton } from './BigButton';

/** En-tête commun : bouton retour, titre, et un emplacement à droite. */
export function ScreenHeader({ title, right }: { title?: string; right?: ReactNode }) {
  // Sur téléphone, la place va aux étoiles et aux boutons : le titre est masqué.
  const { width } = useWindowDimensions();
  const showTitle = width >= 520;
  return (
    <View style={styles.row}>
      <BigButton
        accessibilityLabel="Retour"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      >
        <Text style={styles.icon}>⬅️</Text>
      </BigButton>
      <Text style={styles.title} numberOfLines={1}>
        {showTitle ? title : ''}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  icon: { fontSize: 28 },
  title: { flex: 1, fontSize: 24, fontWeight: '800', color: colors.text },
  right: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
