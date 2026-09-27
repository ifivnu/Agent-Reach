import type { LevelConfig } from '../levels';
import { type Rng, pick, randInt, shuffle } from '../random';
import type { ChoiceExercise } from '../types';

const OBJECTS = ['🍎', '🐟', '⭐', '🎈', '🐞', '🌸', '🚗', '🍪'];

/** Au-delà, on n'affiche plus d'objets à compter mais l'opération écrite. */
const MAX_VISUAL_SUM = 10;

/** La bonne réponse + des voisins proches (jamais négatifs, jamais en double). */
export function withDistractors(rng: Rng, answer: number, count = 2): number[] {
  const set = new Set([answer]);
  const spread = Math.max(1, Math.round(answer / 10));
  for (let d = 1; set.size < count + 1; d++) {
    if (answer - d * spread >= 0) set.add(answer - d * spread);
    if (set.size < count + 1) set.add(answer + d * spread);
  }
  return shuffle(rng, [...set]);
}

export function makeCounting(level: LevelConfig, rng: Rng, id: string): ChoiceExercise {
  const n = randInt(rng, 1, level.countMax);
  const emoji = pick(rng, OBJECTS);
  return {
    engine: 'choice',
    id,
    instruction: 'Combien y en a-t-il ?',
    visual: { kind: 'groups', emoji, counts: [n] },
    choices: withDistractors(rng, n),
    answer: n,
  };
}

export function makeAddition(level: LevelConfig, rng: Rng, id: string): ChoiceExercise {
  const sum = randInt(rng, 2, level.sumMax);
  const a = randInt(rng, 1, sum - 1);
  const b = sum - a;
  const visual: ChoiceExercise['visual'] =
    sum <= MAX_VISUAL_SUM
      ? { kind: 'groups', emoji: pick(rng, OBJECTS), counts: [a, b], operator: '+' }
      : { kind: 'equation', text: `${a.toLocaleString('fr-FR')} + ${b.toLocaleString('fr-FR')}` };
  return {
    engine: 'choice',
    id,
    instruction: `Combien font ${a} plus ${b} ?`,
    visual,
    choices: withDistractors(rng, sum),
    answer: sum,
  };
}
