import { useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, ZoomIn } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { layoutBoard, type Rect, resolveDrop } from '../domain/board';
import type { DragDropExercise, EngineProps } from '../domain/types';
import { colors, radius, shadow } from '../theme';

/**
 * Moteur « glisser-déposer » : l'enfant fait glisser des étiquettes (doigt ou souris)
 * vers les cases vides. Utilisé pour les lettres manquantes, réutilisable pour
 * tout exercice « mettre la bonne pièce au bon endroit ».
 */
export function DragDropEngine({ exercise, onSolved, onMistake }: EngineProps<DragDropExercise>) {
  const [width, setWidth] = useState(0);
  const [filled, setFilled] = useState<ReadonlySet<number>>(new Set());
  const [usedTiles, setUsedTiles] = useState<ReadonlySet<number>>(new Set());

  const board = useMemo(
    () => (width > 0 ? layoutBoard(width, exercise.word.length, exercise.tiles.length) : null),
    [width, exercise.word.length, exercise.tiles.length],
  );

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  /** Appelé au lâcher : renvoie la case où l'étiquette doit se poser, ou null pour la renvoyer. */
  const release = (tileIndex: number, x: number, y: number): Rect | null => {
    if (!board) return null;
    const drop = resolveDrop({ x, y }, exercise.tiles[tileIndex], exercise.word, exercise.hidden, filled, board.slots);
    if (drop.result === 'wrong') onMistake();
    if (drop.result !== 'ok') return null;

    const nextFilled = new Set(filled).add(drop.slot);
    setFilled(nextFilled);
    setUsedTiles(new Set(usedTiles).add(tileIndex));
    if (exercise.hidden.every((i) => nextFilled.has(i))) onSolved();
    return board.slots[drop.slot];
  };

  return (
    <View style={styles.container}>
      <Animated.Text entering={ZoomIn.springify()} style={styles.picture}>
        {exercise.emoji}
      </Animated.Text>

      <View style={styles.boardArea} onLayout={onLayout}>
        {board ? (
          <View style={{ height: board.height }}>
            {board.slots.map((r, i) => {
              const isHidden = exercise.hidden.includes(i);
              return (
                <View
                  key={`slot-${i}`}
                  testID={`slot-${i}`}
                  style={[
                    styles.slot,
                    { left: r.x, top: r.y, width: r.w, height: r.h },
                    isHidden && !filled.has(i) && styles.slotEmpty,
                  ]}
                >
                  {!isHidden ? <Text style={[styles.letter, { fontSize: r.w * 0.55 }]}>{exercise.word[i]}</Text> : null}
                </View>
              );
            })}
            {board.tiles.map((home, i) => (
              <DraggableTile
                key={`tile-${i}`}
                letter={exercise.tiles[i]}
                home={home}
                locked={usedTiles.has(i)}
                onRelease={(x, y) => release(i, x, y)}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

type TileProps = {
  letter: string;
  home: Rect;
  locked: boolean;
  onRelease: (centerX: number, centerY: number) => Rect | null;
};

function DraggableTile({ letter, home, locked, onRelease }: TileProps) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);
  const lifted = useSharedValue(0);

  // Exécuté côté JS : décide où l'étiquette se pose, puis anime vers cet endroit.
  const settle = (centerX: number, centerY: number) => {
    const target = onRelease(centerX, centerY);
    if (target) {
      tx.value = withSpring(target.x + target.w / 2 - (home.x + home.w / 2));
      ty.value = withSpring(target.y + target.h / 2 - (home.y + home.h / 2));
      scale.value = withSpring(target.w / home.w);
    } else {
      tx.value = withSpring(0);
      ty.value = withSpring(0);
      scale.value = withSpring(1);
    }
    lifted.value = 0;
  };

  const pan = Gesture.Pan()
    .enabled(!locked)
    .minDistance(0)
    .onBegin(() => {
      lifted.value = 1;
      scale.value = withSpring(1.15);
    })
    .onChange((e) => {
      tx.value += e.changeX;
      ty.value += e.changeY;
    })
    .onFinalize(() => {
      scheduleOnRN(settle, home.x + home.w / 2 + tx.value, home.y + home.h / 2 + ty.value);
    });

  const style = useAnimatedStyle(() => ({
    zIndex: lifted.value ? 10 : 1,
    elevation: lifted.value ? 12 : 4,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        testID={`tile-${letter}`}
        accessibilityLabel={`Lettre ${letter}`}
        style={[styles.tile, { left: home.x, top: home.y, width: home.w, height: home.h }, style]}
      >
        <Text style={styles.tileText}>{letter}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly' },
  picture: { fontSize: 120 },
  boardArea: { alignSelf: 'stretch', maxWidth: 720, width: '100%', marginHorizontal: 'auto' },
  slot: {
    position: 'absolute',
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmpty: { backgroundColor: colors.slot, borderWidth: 3, borderStyle: 'dashed', borderColor: colors.primary },
  letter: { fontWeight: '800', color: colors.text },
  tile: {
    position: 'absolute',
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    ...shadow,
  },
  tileText: { fontSize: 34, fontWeight: '800', color: '#fff' },
});
