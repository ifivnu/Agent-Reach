import { GLYPHS } from '../src/domain/glyphs';
import { LEVELS } from '../src/domain/levels';
import { seededRng } from '../src/domain/random';
import { checkStroke, resample } from '../src/domain/tracing';
import type { Point } from '../src/domain/types';

const jitter = (points: Point[], amount: number, seed = 7) => {
  const rng = seededRng(seed);
  return points.map((p) => ({ x: p.x + (rng() - 0.5) * 2 * amount, y: p.y + (rng() - 0.5) * 2 * amount }));
};

describe('modèles de tracé', () => {
  it('couvrent tous les caractères demandés par les niveaux', () => {
    const wanted = new Set(Object.values(LEVELS).flatMap((l) => [...l.traceGlyphs]));
    for (const g of wanted) expect(GLYPHS[g]).toBeDefined();
  });

  it.each(Object.keys(GLYPHS))('%s : traits valides dans le repère 0..100', (g) => {
    for (const stroke of GLYPHS[g]) {
      expect(stroke.length).toBeGreaterThanOrEqual(2);
      for (const p of stroke) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(100);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('resample', () => {
  it('espace régulièrement les points et garde les extrémités', () => {
    const out = resample([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], 4);
    expect(out[0]).toEqual({ x: 0, y: 0 });
    expect(out[out.length - 1]).toEqual({ x: 10, y: 10 });
    for (let i = 1; i < out.length - 1; i++) {
      const d = Math.hypot(out[i].x - out[i - 1].x, out[i].y - out[i - 1].y);
      expect(d).toBeLessThanOrEqual(4.01);
    }
  });
});

describe('checkStroke', () => {
  it.each(Object.keys(GLYPHS))('%s : un tracé fidèle mais tremblé est accepté', (g) => {
    for (const stroke of GLYPHS[g]) {
      expect(checkStroke(stroke, jitter(resample(stroke, 4), 3)).ok).toBe(true);
    }
  });

  it('refuse un tracé dans le mauvais sens', () => {
    const [stroke] = GLYPHS['7'];
    const result = checkStroke(stroke, [...resample(stroke, 3)].reverse());
    expect(result.startsWell).toBe(false);
    expect(result.ok).toBe(false);
  });

  it('refuse un tracé incomplet', () => {
    const [stroke] = GLYPHS.L;
    const full = resample(stroke, 3);
    const result = checkStroke(stroke, full.slice(0, Math.floor(full.length / 3)));
    expect(result.coverage).toBeLessThan(0.8);
    expect(result.ok).toBe(false);
  });

  it('refuse un gribouillis', () => {
    const [stroke] = GLYPHS.O;
    const rng = seededRng(3);
    const scribble = Array.from({ length: 200 }, () => ({ x: rng() * 100, y: rng() * 100 }));
    scribble[0] = { ...stroke[0] };
    const result = checkStroke(stroke, scribble);
    expect(result.lengthRatio).toBeGreaterThan(2.5);
    expect(result.ok).toBe(false);
  });

  it('refuse un tracé vide ou réduit à un point', () => {
    expect(checkStroke(GLYPHS.I[0], []).ok).toBe(false);
    expect(checkStroke(GLYPHS.I[0], [{ x: 50, y: 10 }]).ok).toBe(false);
  });
});
