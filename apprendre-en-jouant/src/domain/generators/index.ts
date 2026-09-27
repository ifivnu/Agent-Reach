import { LEVELS } from '../levels';
import { type Rng, defaultRng } from '../random';
import type { ActivityId, Exercise, LevelId } from '../types';
import { makeAddition, makeCounting } from './choice';
import { makeMissingLetters } from './missingLetters';
import { makeTrace } from './trace';

const GENERATORS = {
  compter: makeCounting,
  additions: makeAddition,
  lettres: makeMissingLetters,
  trace: makeTrace,
} satisfies Record<ActivityId, unknown>;

/** Une série d'exercices tous différents (autant que le permet le niveau). */
export function makeSession(levelId: LevelId, activity: ActivityId, count = 5, rng: Rng = defaultRng): Exercise[] {
  const level = LEVELS[levelId];
  const generate = GENERATORS[activity];
  const out: Exercise[] = [];
  const seen = new Set<string>();
  for (let attempt = 0; out.length < count && attempt < count * 20; attempt++) {
    const ex = generate(level, rng, `${levelId}-${activity}-${out.length}`);
    const key = JSON.stringify({ ...ex, id: undefined, choices: undefined, tiles: undefined });
    if (seen.has(key) && attempt < count * 10) continue;
    seen.add(key);
    out.push(ex);
  }
  return out;
}
