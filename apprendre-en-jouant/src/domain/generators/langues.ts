import { t } from '../../i18n/strings';
import { getTheme, type ThemeId } from '../content/vocab';
import { pick, sample, shuffle } from '../random';
import type { ChoiceExercise, DragDropExercise, MemoryExercise } from '../types';
import type { GenContext } from './context';
import { memoryCards, pairCount } from './agilite';
import { emojiOptions, textOptions } from './helpers';
import { missingLettersExercise, spellableWords } from './lecture';

function themeOf(ctx: GenContext): ThemeId {
  if (!ctx.theme) throw new Error('Les activités de langue ont besoin d’un thème');
  return ctx.theme;
}

/** Écouter un mot dans la langue étudiée et toucher l'image. */
export function makeListen(ctx: GenContext): ChoiceExercise {
  const words = getTheme(themeOf(ctx)).words;
  const entry = pick(ctx.rng, words);
  const others = words.filter((w) => w.emoji !== entry.emoji && w[ctx.target] !== entry[ctx.target]);
  const choices = shuffle(ctx.rng, [entry.emoji, ...sample(ctx.rng, others, ctx.difficulty === 1 ? 2 : 3).map((w) => w.emoji)]);
  return {
    engine: 'choice',
    id: ctx.id,
    instruction: t(ctx.lang, 'i.listenPick'),
    prompt: { kind: 'listen', text: entry[ctx.target], lang: ctx.target },
    choices: emojiOptions(choices),
    answer: entry.emoji,
    layout: 'big',
  };
}

/** Voir une image et choisir son nom dans la langue étudiée. */
export function makeName(ctx: GenContext): ChoiceExercise {
  const words = getTheme(themeOf(ctx)).words;
  const entry = pick(ctx.rng, words);
  const others = words.filter((w) => w[ctx.target] !== entry[ctx.target]);
  const choices = shuffle(ctx.rng, [entry[ctx.target], ...sample(ctx.rng, others, ctx.difficulty === 1 ? 2 : 3).map((w) => w[ctx.target])]);
  return {
    engine: 'choice',
    id: ctx.id,
    instruction: t(ctx.lang, 'i.whatIsThis'),
    prompt: { kind: 'picture', emoji: entry.emoji },
    choices: textOptions(choices),
    answer: entry[ctx.target],
    layout: 'words',
  };
}

/** Mémoire image ↔ mot dans la langue étudiée. */
export function makeLangMemory(ctx: GenContext): MemoryExercise {
  const words = getTheme(themeOf(ctx)).words;
  // Les cartes « mot » prennent plus de place : 6 paires au maximum.
  const n = Math.min(6, pairCount(ctx.level.rank, ctx.difficulty));
  // Deux mots identiques dans la langue étudiée rendraient les paires ambiguës.
  const unique = words.filter((w, i) => words.findIndex((o) => o[ctx.target] === w[ctx.target]) === i);
  const pairs = sample(ctx.rng, unique, Math.min(n, unique.length)).map((w) => ({
    a: w.emoji,
    b: w[ctx.target],
    aText: false,
    bText: true,
  }));
  return { engine: 'memory', id: ctx.id, instruction: t(ctx.lang, 'i.memoryLang'), cards: memoryCards(ctx, pairs) };
}

/** Épeler un mot de la langue étudiée (lettres manquantes). */
export function makeSpell(ctx: GenContext): DragDropExercise {
  const words = spellableWords(getTheme(themeOf(ctx)).words, ctx.target);
  return missingLettersExercise(pick(ctx.rng, words), ctx.target, ctx.difficulty, false, t(ctx.lang, 'i.missing'), ctx.rng, ctx.id);
}
