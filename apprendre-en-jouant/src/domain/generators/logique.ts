import { t } from '../../i18n/strings';
import { CATEGORIES, CLOSE_CATEGORIES, type CategoryId, FAMILY, GOES_WITH, PATTERN_SETS, STORIES } from '../content/logic';
import { scaled } from '../levels';
import { pick, randInt, sample, shuffle } from '../random';
import type { ChoiceExercise, SequenceExercise } from '../types';
import type { GenContext } from './context';
import { emojiOptions } from './helpers';

/** Motifs par difficulté, exprimés en indices dans un jeu d'images. */
const MOTIFS: Record<1 | 2 | 3, number[][]> = {
  1: [[0, 1]],
  2: [[0, 0, 1], [0, 1, 1], [0, 1, 2]],
  3: [[0, 0, 1, 1], [0, 1, 2, 1], [0, 1, 1, 2]],
};

export function makePattern(ctx: GenContext): ChoiceExercise {
  const set = pick(ctx.rng, PATTERN_SETS);
  const difficulty = ctx.level.rank <= 1 ? 1 : ctx.difficulty;
  const motif = pick(ctx.rng, MOTIFS[difficulty]).map((i) => set[i]);
  // Au moins deux motifs complets, puis on s'arrête au hasard dans le suivant.
  const shown = motif.length * 2 + randInt(ctx.rng, 0, motif.length - 1);
  const sequence = Array.from({ length: shown + 1 }, (_, i) => motif[i % motif.length]);
  const answer = sequence[shown];
  const inMotif = [...new Set(motif)];
  const extra = set.filter((s) => !inMotif.includes(s));
  const choices = shuffle(ctx.rng, [...new Set([...inMotif, ...extra.slice(0, Math.max(0, 3 - inMotif.length))])]);
  return {
    engine: 'choice',
    id: ctx.id,
    instruction: t(ctx.lang, 'i.pattern'),
    prompt: { kind: 'emojis', items: [...sequence.slice(0, shown), '❓'] },
    choices: emojiOptions(choices),
    answer,
    layout: 'big',
  };
}

export function makeOddOneOut(ctx: GenContext): ChoiceExercise {
  const ids = Object.keys(CATEGORIES) as CategoryId[];
  let main: CategoryId;
  let other: CategoryId;
  if (ctx.difficulty === 3 && ctx.level.rank >= 3) {
    [main, other] = shuffle(ctx.rng, pick(ctx.rng, CLOSE_CATEGORIES));
  } else {
    main = pick(ctx.rng, ids);
    other = pick(ctx.rng, ids.filter((id) => FAMILY[id] !== FAMILY[main]));
  }
  const intruder = pick(ctx.rng, CATEGORIES[other]);
  const group = sample(ctx.rng, CATEGORIES[main], ctx.difficulty === 1 ? 2 : 3);
  return {
    engine: 'choice',
    id: ctx.id,
    instruction: t(ctx.lang, 'i.oddOne'),
    prompt: { kind: 'none' },
    choices: emojiOptions(shuffle(ctx.rng, [...group, intruder])),
    answer: intruder,
    layout: 'big',
  };
}

export function makeGoesWith(ctx: GenContext): ChoiceExercise {
  const [left, right] = pick(ctx.rng, GOES_WITH);
  const others = GOES_WITH.filter(([l]) => l !== left).map(([, r]) => r);
  const choices = shuffle(ctx.rng, [right, ...sample(ctx.rng, others, ctx.difficulty === 1 ? 2 : 3)]);
  return {
    engine: 'choice',
    id: ctx.id,
    instruction: t(ctx.lang, 'i.goesWith'),
    prompt: { kind: 'picture', emoji: left },
    choices: emojiOptions(choices),
    answer: right,
    layout: 'big',
  };
}

/** Remettre dans l'ordre : histoires en images pour les petits, nombres ensuite. */
export function makeOrder(ctx: GenContext): SequenceExercise {
  const useNumbers = ctx.level.rank >= 3 && ctx.difficulty >= 2;
  if (useNumbers) {
    const descending = ctx.difficulty === 3;
    const count = ctx.level.rank >= 5 ? 5 : 4;
    const max = scaled(ctx.level.sumMax, ctx.difficulty, 20);
    const values = new Set<number>();
    while (values.size < count) values.add(randInt(ctx.rng, 0, max));
    const ordered = [...values].sort((a, b) => (descending ? b - a : a - b)).map((v) => v.toLocaleString('fr-FR'));
    return {
      engine: 'sequence',
      id: ctx.id,
      instruction: t(ctx.lang, descending ? 'i.orderDesc' : 'i.orderAsc'),
      ordered,
      shuffled: shuffleUntilChanged(ctx, ordered),
    };
  }
  const stories = STORIES.filter((s) => s.minRank <= ctx.level.rank);
  const story = pick(ctx.rng, stories);
  return {
    engine: 'sequence',
    id: ctx.id,
    instruction: t(ctx.lang, 'i.order'),
    ordered: story.items,
    shuffled: shuffleUntilChanged(ctx, story.items),
  };
}

/** Un mélange qui ne laisse jamais la réponse déjà en place. */
function shuffleUntilChanged(ctx: GenContext, items: string[]): string[] {
  for (let i = 0; i < 20; i++) {
    const s = shuffle(ctx.rng, items);
    if (s.some((v, j) => v !== items[j])) return s;
  }
  return [...items].reverse();
}
