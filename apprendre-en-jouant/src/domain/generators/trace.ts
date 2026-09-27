import { GLYPHS } from '../glyphs';
import type { LevelConfig } from '../levels';
import { type Rng, pick } from '../random';
import type { TraceExercise } from '../types';

export function makeTrace(level: LevelConfig, rng: Rng, id: string): TraceExercise {
  const available = [...level.traceGlyphs].filter((g) => g in GLYPHS);
  if (available.length === 0) throw new Error(`Aucun modèle de tracé pour le niveau ${level.id}`);
  const glyph = pick(rng, available);
  const isDigit = /[0-9]/.test(glyph);
  return {
    engine: 'trace',
    id,
    instruction: isDigit ? `Trace le chiffre ${glyph}.` : `Trace la lettre ${glyph}.`,
    glyph,
    strokes: GLYPHS[glyph],
  };
}
