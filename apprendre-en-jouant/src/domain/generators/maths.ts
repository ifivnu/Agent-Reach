import { t } from '../../i18n/strings';
import { GLYPHS } from '../glyphs';
import { scaled } from '../levels';
import { pick, randInt, shuffle } from '../random';
import type { ChoiceExercise, TraceExercise } from '../types';
import type { GenContext } from './context';
import { numberOptions, withDistractors } from './helpers';

const OBJECTS = ['🍎', '🐟', '⭐', '🎈', '🐞', '🌸', '🚗', '🍪'];

/** Au-delà, on n'affiche plus d'objets à compter mais l'opération écrite. */
const MAX_VISUAL = 10;

const fmt = (n: number) => n.toLocaleString('fr-FR');

function numberChoice(ctx: GenContext, instruction: string, prompt: ChoiceExercise['prompt'], answer: number): ChoiceExercise {
  return {
    engine: 'choice',
    id: ctx.id,
    instruction,
    prompt,
    choices: numberOptions(withDistractors(ctx.rng, answer)),
    answer: String(answer),
  };
}

export function makeCounting(ctx: GenContext): ChoiceExercise {
  const n = randInt(ctx.rng, 1, scaled(ctx.level.countMax, ctx.difficulty, 3));
  const emoji = pick(ctx.rng, OBJECTS);
  // Au-delà de 10, les objets sont rangés en paquets de 10 (dizaines) pour rester lisibles.
  const counts = n > MAX_VISUAL ? [MAX_VISUAL, n - MAX_VISUAL] : [n];
  return numberChoice(ctx, t(ctx.lang, 'i.count'), { kind: 'groups', emoji, counts }, n);
}

export function makeAddition(ctx: GenContext): ChoiceExercise {
  const max = scaled(ctx.level.sumMax, ctx.difficulty, 3);
  const sum = randInt(ctx.rng, 2, max);
  const a = randInt(ctx.rng, 1, sum - 1);
  const b = sum - a;
  const prompt: ChoiceExercise['prompt'] =
    sum <= MAX_VISUAL
      ? { kind: 'groups', emoji: pick(ctx.rng, OBJECTS), counts: [a, b], operator: '+' }
      : { kind: 'text', text: `${fmt(a)} + ${fmt(b)} = ?` };
  return numberChoice(ctx, t(ctx.lang, 'i.add', { a, b }), prompt, sum);
}

export function makeSubtraction(ctx: GenContext): ChoiceExercise {
  const max = scaled(ctx.level.sumMax, ctx.difficulty, 3);
  const a = randInt(ctx.rng, 2, max);
  const b = randInt(ctx.rng, 1, a - 1);
  const prompt: ChoiceExercise['prompt'] =
    a <= MAX_VISUAL
      ? { kind: 'takeaway', emoji: pick(ctx.rng, OBJECTS), total: a, removed: b }
      : { kind: 'text', text: `${fmt(a)} − ${fmt(b)} = ?` };
  return numberChoice(ctx, t(ctx.lang, 'i.sub', { a, b }), prompt, a - b);
}

export function makeMultiplication(ctx: GenContext): ChoiceExercise {
  const tableMax = Math.max(2, ctx.level.tableMax);
  const a = randInt(ctx.rng, 2, Math.max(2, scaled(tableMax, ctx.difficulty, 2)));
  const b = randInt(ctx.rng, 1, ctx.difficulty === 1 ? 5 : 10);
  const answer = a * b;
  // Intrus typiques : la table voisine et l'erreur d'une unité.
  const decoys = [...new Set([answer + a, answer - a, answer + 1, answer - 1, answer + b])].filter(
    (v) => v >= 0 && v !== answer,
  );
  const choices = shuffle(ctx.rng, [answer, ...shuffle(ctx.rng, decoys).slice(0, 2)]);
  return {
    engine: 'choice',
    id: ctx.id,
    instruction: t(ctx.lang, 'i.mul', { a, b }),
    prompt: { kind: 'text', text: `${a} × ${b} = ?` },
    choices: numberOptions(choices),
    answer: String(answer),
  };
}

export function makeComparison(ctx: GenContext): ChoiceExercise {
  const max = scaled(Math.max(ctx.level.sumMax, ctx.level.countMax), ctx.difficulty, 5);
  const a = randInt(ctx.rng, 0, max);
  // Une fois sur cinq, les deux nombres sont égaux.
  const b = ctx.rng() < 0.2 ? a : randInt(ctx.rng, 0, max);
  const answer = a < b ? '<' : a > b ? '>' : '=';
  return {
    engine: 'choice',
    id: ctx.id,
    instruction: t(ctx.lang, 'i.compare'),
    prompt: { kind: 'text', text: `${fmt(a)}  ?  ${fmt(b)}` },
    choices: [
      { id: '<', text: '<' },
      { id: '=', text: '=' },
      { id: '>', text: '>' },
    ],
    answer,
  };
}

/** Suites de nombres : le pas grandit avec le niveau et la difficulté ; en difficulté 3, la suite peut descendre. */
export function makeNumberSequence(ctx: GenContext): ChoiceExercise {
  const rank = ctx.level.rank;
  const steps = rank <= 2 ? [1] : rank === 3 ? [1, 2] : rank === 4 ? [2, 5, 10] : [3, 4, 5, 25, 50];
  const step = steps[Math.min(steps.length - 1, randInt(ctx.rng, 0, ctx.difficulty))];
  const descending = ctx.difficulty === 3 && rank >= 3 && ctx.rng() < 0.5;
  const terms = 4;
  const max = Math.max(scaled(ctx.level.sumMax, ctx.difficulty, 10), step * (terms + 1));
  const start = descending ? randInt(ctx.rng, step * terms, max) : randInt(ctx.rng, 0, max - step * terms);
  const seq = Array.from({ length: terms }, (_, i) => start + (descending ? -1 : 1) * step * i);
  const answer = start + (descending ? -1 : 1) * step * terms;
  return numberChoice(ctx, t(ctx.lang, 'i.numberSeq'), { kind: 'text', text: `${seq.map(fmt).join(', ')}, ?` }, answer);
}

export function makeTraceDigit(ctx: GenContext): TraceExercise {
  const digits = [...ctx.level.traceGlyphs].filter((g) => /[0-9]/.test(g));
  const glyph = pick(ctx.rng, digits.length ? digits : [...'0123456789']);
  return { engine: 'trace', id: ctx.id, instruction: t(ctx.lang, 'i.traceDigit', { g: glyph }), glyph, strokes: GLYPHS[glyph] };
}
