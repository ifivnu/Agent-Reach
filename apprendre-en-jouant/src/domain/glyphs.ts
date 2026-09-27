import type { Point, Stroke } from './types';

/*
 * Modèles de tracé originaux (capitales « bâton » et chiffres), dessinés dans un
 * repère 0..100 avec y vers le bas. Chaque tableau interne est un trait, dans
 * l'ordre et le sens où l'enfant doit le tracer.
 */

type P = [number, number];

const pts = (...xs: P[]): Point[] => xs.map(([x, y]) => ({ x, y }));

/**
 * Arc d'ellipse de `from` à `to` (degrés, 0 = droite, 90 = bas).
 * Un angle décroissant tourne dans le sens inverse des aiguilles d'une montre à l'écran.
 */
function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number): Point[] {
  const steps = Math.max(2, Math.ceil(Math.abs(to - from) / 10));
  const out: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    out.push({ x: +(cx + rx * Math.cos(a)).toFixed(2), y: +(cy + ry * Math.sin(a)).toFixed(2) });
  }
  return out;
}

const join = (...parts: Point[][]): Stroke => parts.flat();

const O_SHAPE = arc(50, 50, 28, 40, 270, -90);
const P_BOWL = join(pts([28, 10], [52, 10]), arc(52, 30, 20, 20, 270, 450), pts([28, 50]));

export const GLYPHS: Record<string, Stroke[]> = {
  '0': [arc(50, 50, 26, 40, 270, -90)],
  '1': [pts([35, 25], [55, 10], [55, 90])],
  '2': [join(arc(50, 32, 22, 22, 190, 400), pts([25, 90], [78, 90]))],
  '3': [join(arc(48, 30, 20, 20, 200, 450), arc(48, 70, 20, 20, 270, 500))],
  '4': [pts([50, 10], [22, 65], [80, 65]), pts([62, 30], [62, 90])],
  '5': [join(pts([30, 10], [28, 48]), arc(48, 66, 22, 22, 235, 500)), pts([30, 10], [72, 10])],
  '6': [join(arc(50, 58, 22, 44, 300, 180), arc(50, 68, 22, 22, 180, -180))],
  '7': [pts([25, 10], [75, 10], [40, 90])],
  '8': [join(arc(50, 30, 18, 18, 330, 90), arc(50, 69, 21, 21, 270, 630), arc(50, 30, 18, 18, 90, -30))],
  '9': [join(arc(50, 32, 22, 22, 0, -360), pts([70, 90]))],

  A: [pts([50, 10], [22, 90]), pts([50, 10], [78, 90]), pts([33, 60], [67, 60])],
  B: [
    pts([28, 10], [28, 90]),
    join(pts([28, 10], [52, 10]), arc(52, 29, 19, 19, 270, 450), pts([28, 48])),
    join(pts([28, 48], [55, 48]), arc(55, 69, 21, 21, 270, 450), pts([28, 90])),
  ],
  C: [arc(52, 50, 28, 40, 320, 40)],
  D: [pts([28, 10], [28, 90]), join(pts([28, 10], [45, 10]), arc(45, 50, 30, 40, 270, 450), pts([28, 90]))],
  E: [pts([28, 10], [28, 90]), pts([28, 10], [70, 10]), pts([28, 50], [62, 50]), pts([28, 90], [70, 90])],
  F: [pts([28, 10], [28, 90]), pts([28, 10], [70, 10]), pts([28, 50], [62, 50])],
  G: [join(arc(52, 50, 28, 40, 320, 0), pts([58, 50]))],
  H: [pts([25, 10], [25, 90]), pts([75, 10], [75, 90]), pts([25, 50], [75, 50])],
  I: [pts([50, 10], [50, 90]), pts([35, 10], [65, 10]), pts([35, 90], [65, 90])],
  J: [join(pts([65, 10], [65, 70]), arc(47, 70, 18, 18, 0, 180))],
  K: [pts([28, 10], [28, 90]), pts([72, 10], [28, 55], [72, 90])],
  L: [pts([28, 10], [28, 90], [70, 90])],
  M: [pts([22, 90], [22, 10], [50, 60], [78, 10], [78, 90])],
  N: [pts([25, 90], [25, 10], [75, 90], [75, 10])],
  O: [O_SHAPE],
  P: [pts([28, 10], [28, 90]), P_BOWL],
  Q: [O_SHAPE, pts([55, 68], [78, 92])],
  R: [pts([28, 10], [28, 90]), P_BOWL, pts([45, 50], [72, 90])],
  S: [join(arc(50, 30, 22, 20, 330, 90), arc(50, 70, 22, 20, 270, 510))],
  T: [pts([22, 10], [78, 10]), pts([50, 10], [50, 90])],
  U: [join(pts([25, 10], [25, 65]), arc(50, 65, 25, 25, 180, 0), pts([75, 10]))],
  V: [pts([22, 10], [50, 90], [78, 10])],
  W: [pts([15, 10], [32, 90], [50, 35], [68, 90], [85, 10])],
  X: [pts([25, 10], [75, 90]), pts([75, 10], [25, 90])],
  Y: [pts([25, 10], [50, 50]), pts([75, 10], [50, 50], [50, 90])],
  Z: [pts([25, 10], [75, 10], [25, 90], [75, 90])],
};
