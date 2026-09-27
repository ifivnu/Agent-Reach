import { t } from '../../i18n/strings';
import { CATEGORIES, STICKERS } from '../content/logic';
import { pick, randInt, sample, shuffle } from '../random';
import type { MemoryExercise, TapTargetsExercise } from '../types';
import type { GenContext } from './context';

export function pairCount(rank: number, difficulty: 1 | 2 | 3): number {
  return (rank <= 2 ? [3, 4, 6] : [4, 6, 8])[difficulty - 1];
}

/** Construit les cartes à partir de paires [face A, face B], mélangées. */
export function memoryCards(
  ctx: GenContext,
  pairs: { a: string; b: string; aText: boolean; bText: boolean }[],
): MemoryExercise['cards'] {
  const cards = pairs.flatMap((p, i) => [
    { pair: `p${i}`, face: p.a, isText: p.aText },
    { pair: `p${i}`, face: p.b, isText: p.bText },
  ]);
  return shuffle(ctx.rng, cards).map((c, i) => ({ ...c, id: `c${i}` }));
}

/** Mémoire : images identiques pour les petits, calcul ↔ résultat à partir du CE1. */
export function makeMemory(ctx: GenContext): MemoryExercise {
  const n = pairCount(ctx.level.rank, ctx.difficulty);
  let pairs: { a: string; b: string; aText: boolean; bText: boolean }[];
  if (ctx.level.rank >= 4) {
    const results = new Set<number>();
    const max = ctx.difficulty === 1 ? 10 : 20;
    while (results.size < n) results.add(randInt(ctx.rng, 2, max));
    pairs = [...results].map((r) => {
      const a = randInt(ctx.rng, 1, r - 1);
      return { a: `${a} + ${r - a}`, b: String(r), aText: true, bText: true };
    });
  } else {
    pairs = sample(ctx.rng, STICKERS, n).map((e) => ({ a: e, b: e, aText: false, bText: false }));
  }
  return { engine: 'memory', id: ctx.id, instruction: t(ctx.lang, 'i.memory'), cards: memoryCards(ctx, pairs) };
}

const SPEED: Record<1 | 2 | 3, { lifetime: number; spawnEvery: number; goal: number }> = {
  1: { lifetime: 2800, spawnEvery: 950, goal: 6 },
  2: { lifetime: 2300, spawnEvery: 800, goal: 8 },
  3: { lifetime: 1900, spawnEvery: 650, goal: 10 },
};

const LOOKALIKE_LETTERS: Record<string, string[]> = {
  B: ['D', 'P', 'R', 'E'],
  D: ['B', 'O', 'P', 'Q'],
  M: ['N', 'W', 'H', 'V'],
  E: ['F', 'B', 'L', 'H'],
  O: ['Q', 'C', 'D', 'G'],
};

/** Attrape-les : réflexes et attention, avec des règles de plus en plus abstraites. */
export function makeTapTargets(ctx: GenContext): TapTargetsExercise {
  const speed = SPEED[ctx.difficulty];
  const base = { engine: 'taptargets' as const, id: ctx.id, ...speed };
  const rank = ctx.level.rank;

  if (rank <= 1) {
    const [target, ...others] = sample(ctx.rng, CATEGORIES.fruits.concat(CATEGORIES.wild), 5);
    return { ...base, instruction: t(ctx.lang, 'i.tapEmoji', { x: target }), hint: target, targets: [target], distractors: others };
  }

  if (rank <= 3) {
    if (ctx.difficulty === 3 || ctx.rng() < 0.5) {
      const letter = pick(ctx.rng, Object.keys(LOOKALIKE_LETTERS));
      return {
        ...base,
        instruction: t(ctx.lang, 'i.tapLetter', { x: letter }),
        hint: letter,
        targets: [letter],
        distractors: LOOKALIKE_LETTERS[letter],
      };
    }
    const animals = [...CATEGORIES.wild, ...CATEGORIES.farm, ...CATEGORIES.sea];
    const fruitsFirst = ctx.rng() < 0.5;
    const targets = fruitsFirst ? CATEGORIES.fruits : animals;
    const distractors = [...(fruitsFirst ? animals : CATEGORIES.fruits), ...CATEGORIES.vehicles];
    const name = t(ctx.lang, fruitsFirst ? 'cat.fruits' : 'cat.animals');
    return { ...base, instruction: t(ctx.lang, 'i.tapCategory', { x: name }), hint: targets.slice(0, 3).join(''), targets, distractors };
  }

  if (ctx.difficulty === 1) {
    const evens = Array.from({ length: 25 }, (_, i) => String(i * 2));
    const odds = Array.from({ length: 25 }, (_, i) => String(i * 2 + 1));
    return { ...base, instruction: t(ctx.lang, 'i.tapEven'), hint: '2 4 6 …', targets: evens, distractors: odds };
  }
  if (ctx.difficulty === 2) {
    const x = randInt(ctx.rng, 8, 15);
    const targets = Array.from({ length: x - 1 }, (_, i) => `${i + 1} + ${x - i - 1}`);
    const distractors = [x - 2, x - 1, x + 1, x + 2].flatMap((y) =>
      Array.from({ length: 3 }, () => {
        const a = randInt(ctx.rng, 1, y - 1);
        return `${a} + ${y - a}`;
      }),
    );
    return { ...base, instruction: t(ctx.lang, 'i.tapSum', { x }), hint: `= ${x}`, targets, distractors };
  }
  const x = randInt(ctx.rng, 3, Math.max(3, Math.min(9, ctx.level.tableMax)));
  const targets = Array.from({ length: 10 }, (_, i) => String(x * (i + 1)));
  const distractors = Array.from({ length: x * 10 }, (_, i) => i + 1)
    .filter((v) => v % x !== 0)
    .map(String);
  return { ...base, instruction: t(ctx.lang, 'i.tapMultiple', { x }), hint: `× ${x}`, targets, distractors };
}
