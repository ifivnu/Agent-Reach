import { useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import { checkStroke, toSvgPath } from '../domain/tracing';
import type { EngineProps, Point, TraceExercise } from '../domain/types';
import { t } from '../i18n/strings';
import { say } from '../lib/feedback';
import { colors, radius } from '../theme';

const MAX_SIZE = 420;

/**
 * Moteur « tracé » : l'enfant repasse le modèle trait par trait, au doigt, au stylet
 * ou à la souris. Chaque trait est vérifié (point de départ, couverture, précision).
 */
export function TraceEngine({ exercise, lang, onSolved, onMistake }: EngineProps<TraceExercise>) {
  const [size, setSize] = useState(0);
  const [done, setDone] = useState(0);
  const [drawn, setDrawn] = useState<Point[]>([]);
  const points = useRef<Point[]>([]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize(Math.min(width, height, MAX_SIZE));
  };

  const toModel = (x: number, y: number): Point => ({ x: (x / size) * 100, y: (y / size) * 100 });

  const finishStroke = () => {
    const current = exercise.strokes[done];
    if (!current) return;
    // Un simple toucher sans mouvement n'est pas un essai : on l'ignore.
    if (points.current.length < 3) {
      points.current = [];
      setDrawn([]);
      return;
    }
    const result = checkStroke(current, points.current);
    points.current = [];
    setDrawn([]);
    if (!result.ok) {
      onMistake();
      return;
    }
    const next = done + 1;
    setDone(next);
    if (next === exercise.strokes.length) onSolved();
    else say({ text: t(lang, 'nextStroke'), lang });
  };

  // Callbacks exécutés côté JS : le tracé met à jour l'état React à chaque mouvement.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(size > 0 && done < exercise.strokes.length)
    .minDistance(0)
    .shouldCancelWhenOutside(false)
    .onBegin((e) => {
      points.current = [toModel(e.x, e.y)];
      setDrawn(points.current);
    })
    .onUpdate((e) => {
      const p = toModel(e.x, e.y);
      const last = points.current[points.current.length - 1];
      if (last && Math.hypot(p.x - last.x, p.y - last.y) < 1) return;
      points.current = [...points.current, p];
      setDrawn(points.current);
    })
    .onFinalize(finishStroke);

  const guideWidth = size * 0.13;
  const current = exercise.strokes[done];

  return (
    <View style={styles.container} onLayout={onLayout}>
      {size > 0 ? (
        <Animated.View entering={ZoomIn.springify()} style={[styles.card, { width: size, height: size }]}>
          <GestureDetector gesture={pan}>
            <View testID="trace-canvas" style={{ width: size, height: size }} accessibilityLabel={exercise.instruction}>
              <Svg width={size} height={size}>
                {/* Modèle complet en fond. */}
                {exercise.strokes.map((s, i) => (
                  <Path
                    key={`guide-${i}`}
                    d={toSvgPath(s, size)}
                    stroke={i < done ? colors.success : colors.guide}
                    strokeWidth={guideWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ))}
                {/* Trait à faire : pointillés + point de départ numéroté. */}
                {current ? (
                  <>
                    <Path
                      d={toSvgPath(current, size)}
                      stroke={colors.warning}
                      strokeWidth={4}
                      strokeDasharray="2 12"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <Circle
                      cx={(current[0].x * size) / 100}
                      cy={(current[0].y * size) / 100}
                      r={guideWidth * 0.45}
                      fill={colors.warning}
                    />
                    <SvgText
                      x={(current[0].x * size) / 100}
                      y={(current[0].y * size) / 100 + guideWidth * 0.18}
                      fontSize={guideWidth * 0.5}
                      fontWeight="bold"
                      fill="#fff"
                      textAnchor="middle"
                    >
                      {String(done + 1)}
                    </SvgText>
                  </>
                ) : null}
                {/* Ce que l'enfant est en train de tracer. */}
                {drawn.length > 1 ? (
                  <Path
                    d={toSvgPath(drawn, size)}
                    stroke={colors.primary}
                    strokeWidth={guideWidth * 0.45}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ) : null}
              </Svg>
            </View>
          </GestureDetector>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
});
