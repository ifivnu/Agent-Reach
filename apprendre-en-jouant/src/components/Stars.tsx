import { StyleSheet, Text, View } from 'react-native';

/** Maîtrise d'une compétence : 0 à 3 étoiles. */
export function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <View style={styles.row} accessibilityLabel={`${value} / 3`}>
      {[1, 2, 3].map((i) => (
        <Text key={i} style={{ fontSize: size, opacity: i <= value ? 1 : 0.25 }}>
          ⭐
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 2 } });
