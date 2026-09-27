import type { Point, Stroke } from './types';

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

function pathLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) len += dist(points[i - 1], points[i]);
  return len;
}

/** Rééchantillonne un trait en points espacés régulièrement de `step` (repère 0..100). */
export function resample(stroke: Stroke, step = 4): Point[] {
  if (stroke.length === 0) return [];
  const out: Point[] = [stroke[0]];
  let carry = 0;
  for (let i = 1; i < stroke.length; i++) {
    const a = stroke[i - 1];
    const b = stroke[i];
    const len = dist(a, b);
    let d = step - carry;
    while (d <= len) {
      const t = d / len;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      d += step;
    }
    carry = len - (d - step);
  }
  const last = stroke[stroke.length - 1];
  if (dist(out[out.length - 1], last) > 0.01) out.push(last);
  return out;
}

function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return dist(p, a);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return dist(p, { x: a.x + t * dx, y: a.y + t * dy });
}

function distToPolyline(p: Point, line: Stroke): number {
  if (line.length === 1) return dist(p, line[0]);
  let best = Infinity;
  for (let i = 1; i < line.length; i++) best = Math.min(best, distToSegment(p, line[i - 1], line[i]));
  return best;
}

export type TraceOptions = {
  /** Distance tolérée autour du modèle (repère 0..100). */
  tolerance: number;
  /** Part minimale du modèle qui doit être recouverte. */
  minCoverage: number;
  /** Part minimale des points de l'enfant qui doivent rester près du modèle. */
  minAccuracy: number;
  /** Longueur maximale du trait de l'enfant, en multiple du modèle (anti-gribouillis). */
  maxLengthRatio: number;
};

export const DEFAULT_TRACE_OPTIONS: TraceOptions = { tolerance: 12, minCoverage: 0.8, minAccuracy: 0.75, maxLengthRatio: 2.5 };

export type TraceResult = {
  ok: boolean;
  coverage: number;
  accuracy: number;
  startsWell: boolean;
  lengthRatio: number;
};

/**
 * Vérifie un trait de l'enfant contre le trait modèle :
 * 1. il part du bon endroit (sens du tracé) ;
 * 2. il recouvre l'essentiel du modèle ;
 * 3. il ne gribouille pas en dehors ni par-dessus.
 */
export function checkStroke(target: Stroke, drawn: Point[], opts: TraceOptions = DEFAULT_TRACE_OPTIONS): TraceResult {
  if (drawn.length < 2 || target.length === 0) {
    return { ok: false, coverage: 0, accuracy: 0, startsWell: false, lengthRatio: 0 };
  }
  const checkpoints = resample(target, 4);
  const userPoints = resample(drawn, 2);

  const covered = checkpoints.filter((c) => distToPolyline(c, userPoints) <= opts.tolerance).length;
  const coverage = covered / checkpoints.length;

  const near = userPoints.filter((p) => distToPolyline(p, target) <= opts.tolerance * 1.5).length;
  const accuracy = near / userPoints.length;

  const startsWell = dist(drawn[0], target[0]) <= opts.tolerance * 2;
  const lengthRatio = pathLength(drawn) / Math.max(1, pathLength(target));

  return {
    ok:
      startsWell &&
      coverage >= opts.minCoverage &&
      accuracy >= opts.minAccuracy &&
      lengthRatio <= opts.maxLengthRatio,
    coverage,
    accuracy,
    startsWell,
    lengthRatio,
  };
}

/** Convertit un trait du repère 0..100 en attribut `d` SVG à la taille voulue. */
export function toSvgPath(stroke: Stroke, size: number): string {
  const k = size / 100;
  return stroke
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(p.x * k).toFixed(1)} ${(p.y * k).toFixed(1)}`)
    .join(' ');
}
